-- 0002_admin_brain.sql — 관리자 화면 이력·second-brain 연동·보관 기간 (기획용 초안, 미적용)
-- 근거: docs/_research/DECISIONS.md D21(관리자 화면)·D22(두뇌 연동)·D27(보관)·D29(남용 방지)
-- 전제: 0001_init.sql(admins·is_admin()·카탈로그 13·사용자 11), Supabase pgcrypto(extensions 스키마), Postgres 15+.
-- 원칙: 앱에 service role 키를 두지 않는다. 토큰 인증 쓰기는 security definer 함수가 토큰 해시로 사용자를 확인한 뒤 처리한다.

-- =====================================================================
-- 1. 카탈로그 변경 이력 (D21 AD4) — admin만 조회, 쓰기는 트리거만
-- =====================================================================
create table public.catalog_audit (
  id bigint generated always as identity primary key,
  table_name text not null,                         -- 카탈로그 13테이블 중 하나
  op text not null check (op in ('INSERT','UPDATE','DELETE')),
  row_key jsonb not null,                           -- PK 값 {"key":"skill"} / {"stage_key":"brain","level_index":1}
  old_row jsonb,                                    -- INSERT면 null
  new_row jsonb,                                    -- DELETE면 null
  actor_id uuid references auth.users (id) on delete set null, -- null = service role(시드·대시보드) 또는 탈퇴한 관리자
  created_at timestamptz not null default now()     -- 보관 1년(D27) → purge_expired()
);
alter table public.catalog_audit enable row level security;
-- insert·update·delete 정책 없음: 기록은 트리거(security definer)만, 수정·삭제 불가(보관 만료 삭제는 purge_expired()).
create policy catalog_audit_admin_sel on public.catalog_audit for select to authenticated
  using ((select public.is_admin()));
create index catalog_audit_table_idx on public.catalog_audit (table_name, created_at desc);
create index catalog_audit_created_idx on public.catalog_audit (created_at);

-- 트리거 인자 = 해당 테이블 PK 컬럼명들 → row_key 생성
create or replace function public.log_catalog_change() returns trigger
  language plpgsql security definer set search_path = '' as $$
declare
  r jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  k jsonb := '{}'::jsonb;
  c text;
begin
  foreach c in array tg_argv loop
    k := k || jsonb_build_object(c, r -> c);
  end loop;
  insert into public.catalog_audit (table_name, op, row_key, old_row, new_row, actor_id)
  values (tg_table_name, tg_op, k,
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end,
          (select auth.uid()));
  return null;
end $$;
revoke execute on function public.log_catalog_change() from public, anon, authenticated;

do $$
declare
  spec text;
  t text;
  args text;
begin
  foreach spec in array array['ssr_stages:key','ssr_personas:stage_key,persona','ssr_levels:stage_key,level_index',
    'prompts:key','art_apps:id','guide_docs:key','guide_pages:doc_key,page_no','plan_day_defaults:day_index',
    'ssr_checklist_items:item_index','brand_colors:id','content_seeds:id','brain_nodes:id','brain_links:source_id,target_id']
  loop
    t := split_part(spec, ':', 1);
    select string_agg(quote_literal(x), ',') into args from unnest(string_to_array(split_part(spec, ':', 2), ',')) x;
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.log_catalog_change(%s)',
      t || '_audit', t, args);
  end loop;
end $$;

-- =====================================================================
-- 2. 카탈로그 이미지 업로드 (D21 AD3) — Storage 공개 버킷, 쓰기는 admin
-- =====================================================================
-- 읽기는 공개 버킷 URL. 업로드 후 art_apps.icon_path / guide_pages.image_path를 갱신하면 그 변경이 catalog_audit에 남는다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('art-icons', 'art-icons', true, 2097152, array['image/png','image/webp']),
  ('guide', 'guide', true, 2097152, array['image/png','image/webp','image/jpeg'])
on conflict (id) do nothing;

create policy catalog_assets_admin_ins on storage.objects for insert to authenticated
  with check (bucket_id in ('art-icons','guide') and (select public.is_admin()));
create policy catalog_assets_admin_upd on storage.objects for update to authenticated
  using (bucket_id in ('art-icons','guide') and (select public.is_admin()))
  with check (bucket_id in ('art-icons','guide') and (select public.is_admin()));
create policy catalog_assets_admin_sel on storage.objects for select to authenticated -- upsert 교체에 필요
  using (bucket_id in ('art-icons','guide') and (select public.is_admin()));
create policy catalog_assets_admin_del on storage.objects for delete to authenticated
  using (bucket_id in ('art-icons','guide') and (select public.is_admin()));

-- =====================================================================
-- 3. second-brain 연동 (D22) — 본문 없음: 이름·경로·분야·요약(≤200자)만
-- =====================================================================

-- 개인 액세스 토큰: 평문 저장 금지(sha256 hex만), 권한은 brain:write 하나
create table public.api_tokens (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),  -- "작업용 노트북" 등
  token_prefix text not null,                       -- 표시용 앞 12자 'nbt_xxxxxxxx'
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'), -- 평문이 들어갈 수 없게 형식 고정
  scope text not null default 'brain:write' check (scope = 'brain:write'),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz                            -- 폐기 후 90일 지나면 행 삭제(D27)
);

-- 사용자당 연동 상태 1행 (+ 업로드 레이트 리밋 창, D29)
create table public.brain_sources (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  method text check (method in ('cli','web')),      -- 마지막 업로드 경로
  generator text,                                   -- graph.json generator (예: 'nomad-brain@0.1.0')
  node_count integer not null default 0,
  link_count integer not null default 0,
  last_synced_at timestamptz,
  rate_window_start timestamptz not null default now(), -- 분당 6회 창 시작
  rate_window_count smallint not null default 0,
  created_at timestamptz not null default now()
);

-- 내 두뇌 노드 (graph.json nodes) — 업로드마다 전체 교체
create table public.user_brain_nodes (
  owner_id uuid not null references auth.users (id) on delete cascade,
  node_id text not null check (char_length(node_id) between 1 and 200),
  kind text not null check (kind in ('folder','note','agent','rule','index','source')),
  domain text not null default 'root' check (char_length(domain) between 1 and 40),
  parent_id text,                                   -- 포함 엣지(폴더), null = 최상위
  name text not null check (char_length(name) between 1 and 200),
  path text not null check (char_length(path) between 1 and 512 and path !~ '(^/|\.\.)'),
  summary text check (char_length(summary) <= 200), -- 선택. 본문 컬럼 없음(D22)
  sort_order integer not null default 0,
  primary key (owner_id, node_id),
  foreign key (owner_id, parent_id) references public.user_brain_nodes (owner_id, node_id) on delete set null (parent_id)
);

-- 내 두뇌 링크 ([[위키링크]]·Markdown 링크, 방향 있음)
create table public.user_brain_links (
  owner_id uuid not null references auth.users (id) on delete cascade,
  source_id text not null,
  target_id text not null,
  primary key (owner_id, source_id, target_id),
  foreign key (owner_id, source_id) references public.user_brain_nodes (owner_id, node_id) on delete cascade,
  foreign key (owner_id, target_id) references public.user_brain_nodes (owner_id, node_id) on delete cascade
);

create index api_tokens_owner_idx on public.api_tokens (owner_id, created_at desc);
create index user_brain_nodes_parent_idx on public.user_brain_nodes (owner_id, parent_id);
create index user_brain_links_target_idx on public.user_brain_links (owner_id, target_id);

-- RLS: 본인 행 select만. 쓰기는 아래 security definer 함수로만
-- (레이트 리밋 카운터·토큰 해시·노드/링크 개수를 클라이언트가 직접 고칠 수 없게)
do $$
declare t text;
begin
  foreach t in array array['api_tokens','brain_sources','user_brain_nodes','user_brain_links']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (owner_id = (select auth.uid()))', t || '_own_sel', t);
  end loop;
end $$;

-- 토큰 발급: 평문은 이 반환값으로 1회만 보여 준다. 활성 토큰 최대 5개
create or replace function public.brain_token_create(p_name text) returns text
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  tok text;
begin
  if uid is null then raise exception 'not authenticated' using errcode = 'PT401'; end if;
  if (select count(*) from public.api_tokens where owner_id = uid and revoked_at is null) >= 5 then
    raise exception 'too many active tokens' using errcode = 'PT409';
  end if;
  tok := 'nbt_' || translate(encode(extensions.gen_random_bytes(32), 'base64'), '+/=', '-_');
  insert into public.api_tokens (owner_id, name, token_prefix, token_hash)
  values (uid, p_name, left(tok, 12), encode(extensions.digest(tok, 'sha256'), 'hex'));
  return tok;
end $$;

-- 토큰 폐기 (되돌릴 수 없음)
create or replace function public.brain_token_revoke(p_id bigint) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  update public.api_tokens set revoked_at = now()
  where id = p_id and owner_id = (select auth.uid()) and revoked_at is null;
  if not found then raise exception 'token not found' using errcode = 'PT404'; end if;
end $$;

-- 공통 적용(내부 전용): 크기·개수·Pro 확인 → 레이트 리밋(분당 6회, D29) → 그래프 전체 교체 → 상태 갱신
-- 보안 경계는 이 함수다(anon 키로 rpc를 직접 부를 수 있어 Route Handler의 zod·4MB 검사는 편의 계층일 뿐).
-- 카운터 증가 뒤 작업은 안쪽 블록(세이브포인트)에서 실행하고, 실패하면 예외 대신 {error, code}를 돌려준다.
-- → 마지막 노드만 일부러 틀리게 보내 카운터 증가까지 롤백시키는 우회를 막는다(보안 리뷰 2차 🔴).
create or replace function public._brain_apply(p_uid uuid, p_graph jsonb, p_method text) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  n smallint;
  nn integer := jsonb_array_length(coalesce(p_graph -> 'nodes', '[]'::jsonb));
  nl integer := jsonb_array_length(coalesce(p_graph -> 'links', '[]'::jsonb));
begin
  if octet_length(p_graph::text) > 4194304 or -- 4MB: Vercel 함수 요청 본문 한도(4.5MB)보다 작게 (D35)
     (p_graph ->> 'version') is distinct from '1' or nn > 5000 or nl > 20000 then
    raise exception 'invalid graph' using errcode = 'PT400';
  end if;
  if not public.has_pro(p_uid) then -- 두뇌 연동은 Pro(체험·번들 포함) 기능 (D30, 0003_plans.sql)
    raise exception 'pro required' using errcode = 'PT402';
  end if;

  insert into public.brain_sources (owner_id) values (p_uid) on conflict (owner_id) do nothing;
  update public.brain_sources set
    rate_window_count = case when rate_window_start > now() - interval '1 minute' then rate_window_count + 1 else 1 end,
    rate_window_start = case when rate_window_start > now() - interval '1 minute' then rate_window_start else now() end
  where owner_id = p_uid
  returning rate_window_count into n;
  if n > 6 then raise exception 'rate limited' using errcode = 'PT429'; end if; -- 이미 상한이라 롤백돼도 무방

  begin -- 여기서부터 실패해도 위의 카운터 증가는 확정된다
  delete from public.user_brain_links where owner_id = p_uid;
  delete from public.user_brain_nodes where owner_id = p_uid;

  -- 목록에 없는 parent는 최상위(null)로, 같은 id가 두 번 오면 첫 행만
  with src as (
    select x.* from rows from (jsonb_to_recordset(coalesce(p_graph -> 'nodes', '[]'::jsonb))
      as (id text, kind text, domain text, parent text, name text, path text, summary text))
      with ordinality as x(id, kind, domain, parent, name, path, summary, o)
  )
  insert into public.user_brain_nodes (owner_id, node_id, kind, domain, parent_id, name, path, summary, sort_order)
  select p_uid, s.id, s.kind, coalesce(s.domain, 'root'),
         case when s.parent in (select id from src) then s.parent end,
         s.name, s.path, nullif(s.summary, ''), s.o::integer
  from src s
  on conflict do nothing;

  insert into public.user_brain_links (owner_id, source_id, target_id)
  select p_uid, l.source, l.target
  from jsonb_to_recordset(coalesce(p_graph -> 'links', '[]'::jsonb)) as l(source text, target text)
  where l.source <> l.target
    and exists (select 1 from public.user_brain_nodes s where s.owner_id = p_uid and s.node_id = l.source)
    and exists (select 1 from public.user_brain_nodes t where t.owner_id = p_uid and t.node_id = l.target)
  on conflict do nothing;

  update public.brain_sources set
    method = p_method,
    generator = left(p_graph ->> 'generator', 60),
    node_count = (select count(*) from public.user_brain_nodes where owner_id = p_uid),
    link_count = (select count(*) from public.user_brain_links where owner_id = p_uid),
    last_synced_at = now()
  where owner_id = p_uid;

  exception when others then
    return jsonb_build_object('error', sqlerrm, 'code', sqlstate); -- Route Handler가 400으로 바꾼다
  end;

  return (select jsonb_build_object('nodes', node_count, 'links', link_count, 'synced_at', last_synced_at)
          from public.brain_sources where owner_id = p_uid);
end $$;
revoke execute on function public._brain_apply(uuid, jsonb, text) from public, anon, authenticated;

-- CLI 업로드: POST /api/brain/sync 가 Bearer 토큰과 검증된 graph를 넘긴다(세션 없음 → anon으로 호출)
create or replace function public.brain_sync_by_token(p_token text, p_graph jsonb) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  tid bigint;
  uid uuid;
begin
  select id, owner_id into tid, uid from public.api_tokens
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and revoked_at is null and scope = 'brain:write';
  if uid is null then raise exception 'invalid token' using errcode = 'PT401'; end if;
  update public.api_tokens set last_used_at = now() where id = tid;
  return public._brain_apply(uid, p_graph, 'cli');
end $$;

-- 웹 업로드: POST /api/brain/upload 가 세션 사용자로 호출
create or replace function public.brain_sync_web(p_graph jsonb) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not authenticated' using errcode = 'PT401'; end if;
  return public._brain_apply(uid, p_graph, 'web');
end $$;

-- 연동 해제: 내 그래프·상태 삭제 → 탐색기는 예시 카탈로그(C06)로 돌아감. 토큰은 따로 폐기
create or replace function public.brain_disconnect() returns void
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not authenticated' using errcode = 'PT401'; end if;
  delete from public.user_brain_links where owner_id = uid;
  delete from public.user_brain_nodes where owner_id = uid;
  delete from public.brain_sources where owner_id = uid;
end $$;

revoke execute on function public.brain_token_create(text) from public, anon;
revoke execute on function public.brain_token_revoke(bigint) from public, anon;
revoke execute on function public.brain_sync_web(jsonb) from public, anon;
revoke execute on function public.brain_disconnect() from public, anon;
revoke execute on function public.brain_sync_by_token(text, jsonb) from public;
grant execute on function public.brain_token_create(text), public.brain_token_revoke(bigint),
  public.brain_sync_web(jsonb), public.brain_disconnect() to authenticated;
grant execute on function public.brain_sync_by_token(text, jsonb) to anon, authenticated;

-- =====================================================================
-- 4. 보관 기간 (D27) — 매일 1회 실행
-- =====================================================================
-- 탈퇴: auth.users 삭제 → owner_id on delete cascade로 사용자 데이터 즉시 삭제, catalog_audit.actor_id는 null.
-- 1년 미접속 계정(auth.users.last_sign_in_at)의 30일 전 안내·삭제는 Auth Admin API를 쓰는 예약 작업에서 처리 [추정].
create or replace function public.purge_expired() returns void
  language sql security definer set search_path = '' as $$
  delete from public.catalog_audit where created_at < now() - interval '1 year';
  delete from public.api_tokens where revoked_at < now() - interval '90 days';
$$;
revoke execute on function public.purge_expired() from public, anon, authenticated;
-- pg_cron (구현 단계에서 활성화): select cron.schedule('purge-expired', '15 3 * * *', 'select public.purge_expired()');
