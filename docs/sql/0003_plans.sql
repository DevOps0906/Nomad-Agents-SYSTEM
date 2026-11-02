-- 0003_plans.sql — 요금제 권한(D19·D30): 14일 Pro 체험 · 수강생 번들 코드 · (이후) 카드 결제
-- 기획용 초안. 0001_init.sql, 0002_admin_brain.sql 다음에 적용.
-- 원칙: 권한(Pro 기간)은 사용자가 직접 쓰지 못한다. 체험은 가입 트리거, 번들은 코드 사용 함수, 결제는 이후 서버(웹훅)만 쓴다.

-- =====================================================================
-- 1. 플랜 기간 (사용자별, 여러 행 가능: 체험·번들·결제가 겹치면 가장 늦은 종료일까지 Pro)
-- =====================================================================
create table public.user_plans (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  plan text not null default 'pro' check (plan in ('pro')),
  source text not null check (source in ('trial', 'bundle', 'paid')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null check (ends_at > starts_at),
  bundle_code_id bigint,                 -- source='bundle'일 때 사용한 코드
  created_at timestamptz not null default now()
);
create index user_plans_owner_idx on public.user_plans (owner_id, ends_at desc);
alter table public.user_plans enable row level security;
-- 본인 select만. insert·update·delete 정책 없음(트리거·함수·서버만 쓴다)
create policy user_plans_own_sel on public.user_plans for select to authenticated
  using (owner_id = (select auth.uid()));

-- =====================================================================
-- 2. 수강생 번들 코드 (관리자 발급, 평문 저장 금지)
-- =====================================================================
create table public.bundle_codes (
  id bigint generated always as identity primary key,
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'), -- sha256 hex
  label text not null,                   -- 예: '2026-12 AI 업무 시스템 강의 1기'
  months smallint not null default 3 check (months between 1 and 12),
  max_uses integer not null check (max_uses > 0),
  used_count integer not null default 0 check (used_count <= max_uses),
  expires_at timestamptz,                -- 코드 자체 사용 기한
  revoked_at timestamptz,                -- 유출 시 즉시 막기(D38)
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.bundle_codes enable row level security;
create policy bundle_codes_admin_sel on public.bundle_codes for select to authenticated using (public.is_admin());
-- insert·update·delete 정책 없음: 발급은 bundle_code_create, 사용 수 증가는 redeem_bundle_code만(created_by 위조·해시 바꿔치기 방지)
-- 모든 변경은 감사 기록(0002 log_catalog_change 재사용)
create trigger bundle_codes_audit after insert or update or delete on public.bundle_codes
  for each row execute function public.log_catalog_change('id');

-- 코드 추측 방지: 사용자별 실패 횟수(시간당 10회)
create table public.redeem_attempts (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  window_start timestamptz not null default now(),
  fail_count smallint not null default 0
);
alter table public.redeem_attempts enable row level security; -- 정책 없음: 함수만 접근

alter table public.user_plans
  add constraint user_plans_bundle_fk foreign key (bundle_code_id) references public.bundle_codes (id) on delete set null;

-- 같은 코드를 한 사용자가 두 번 쓰지 못하게
create unique index user_plans_bundle_once on public.user_plans (owner_id, bundle_code_id) where bundle_code_id is not null;

-- =====================================================================
-- 3. 판정 함수
-- =====================================================================
create or replace function public.has_pro(p_uid uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_plans p
                 where p.owner_id = p_uid and now() >= p.starts_at and now() < p.ends_at);
$$;
revoke execute on function public.has_pro(uuid) from public, anon, authenticated; -- 내부 전용(_brain_apply 등)

-- 화면용: 내 플랜 상태(P02)
create or replace function public.my_plan() returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'pro', public.has_pro((select auth.uid())),
    'ends_at', (select max(p.ends_at) from public.user_plans p where p.owner_id = (select auth.uid())),
    'trial_used', exists (select 1 from public.user_plans p where p.owner_id = (select auth.uid()) and p.source = 'trial'));
$$;
revoke execute on function public.my_plan() from public, anon;
grant execute on function public.my_plan() to authenticated;

-- =====================================================================
-- 4. 14일 체험: 가입 시 1회 (0001의 신규 가입 트리거와 별개 트리거)
-- =====================================================================
create or replace function public.grant_trial() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_plans (owner_id, source, ends_at) values (new.id, 'trial', now() + interval '14 days');
  return new;
end $$;
revoke execute on function public.grant_trial() from public, anon, authenticated;
create trigger on_auth_user_created_trial after insert on auth.users
  for each row execute function public.grant_trial();

-- =====================================================================
-- 5. 번들 코드 사용(P01): 남은 Pro 기간 뒤에 이어 붙인다. 실패 사유는 하나로 뭉쳐 코드 추측을 어렵게 한다.
-- =====================================================================
create or replace function public.redeem_bundle_code(p_code text) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  c public.bundle_codes;
  base timestamptz;
  fails smallint;
begin
  if uid is null then raise exception 'login required' using errcode = 'PT401'; end if;
  insert into public.redeem_attempts (owner_id) values (uid) on conflict (owner_id) do nothing;
  update public.redeem_attempts set
    fail_count = case when window_start > now() - interval '1 hour' then fail_count else 0 end,
    window_start = case when window_start > now() - interval '1 hour' then window_start else now() end
  where owner_id = uid returning fail_count into fails;
  if fails >= 10 then raise exception 'rate limited' using errcode = 'PT429'; end if;

  select * into c from public.bundle_codes b
   where b.code_hash = encode(extensions.digest(upper(trim(p_code)), 'sha256'), 'hex')
   for update;
  if not found or c.revoked_at is not null or c.used_count >= c.max_uses or (c.expires_at is not null and c.expires_at < now())
     or exists (select 1 from public.user_plans p where p.owner_id = uid and p.bundle_code_id = c.id) then
    -- 예외를 던지면 실패 횟수 증가까지 롤백되므로, 증가를 확정하고 오류는 jsonb로 돌려준다
    update public.redeem_attempts set fail_count = fail_count + 1 where owner_id = uid;
    return jsonb_build_object('error', 'invalid code', 'code', 'PT400');
  end if;
  select greatest(now(), coalesce(max(p.ends_at), now())) into base from public.user_plans p where p.owner_id = uid;
  insert into public.user_plans (owner_id, source, starts_at, ends_at, bundle_code_id)
    values (uid, 'bundle', base, base + make_interval(months => c.months), c.id);
  update public.bundle_codes set used_count = used_count + 1 where id = c.id;
  return public.my_plan();
end $$;
revoke execute on function public.redeem_bundle_code(text) from public, anon;
grant execute on function public.redeem_bundle_code(text) to authenticated;

-- =====================================================================
-- 6. 관리자 코드 발급(AD06): 평문은 반환 1회만, 저장은 해시
-- =====================================================================
create or replace function public.bundle_code_create(p_label text, p_months smallint, p_max_uses integer, p_expires_at timestamptz)
  returns text language plpgsql security definer set search_path = '' as $$
declare
  plain text := upper(encode(extensions.gen_random_bytes(10), 'hex')); -- 20자리 16진(80비트)
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = 'PT403'; end if;
  insert into public.bundle_codes (code_hash, label, months, max_uses, expires_at, created_by)
    values (encode(extensions.digest(plain, 'sha256'), 'hex'), p_label, p_months, p_max_uses, p_expires_at, (select auth.uid()));
  return plain;
end $$;
revoke execute on function public.bundle_code_create(text, smallint, integer, timestamptz) from public, anon;
grant execute on function public.bundle_code_create(text, smallint, integer, timestamptz) to authenticated;

-- 이후(카드 결제): 결제사 웹훅 Route Handler가 service role로 source='paid' 행을 넣는다. 앱에는 service role 키를 두지 않으므로 별도 서버 함수로 분리(LEAN 통과 후, 06 "이후" 표).

-- =====================================================================
-- 7. 리뷰 반영 (D31·D38)
-- =====================================================================
-- 코드 폐기(AD07)
create or replace function public.bundle_code_revoke(p_id bigint) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = 'PT403'; end if;
  update public.bundle_codes set revoked_at = now() where id = p_id and revoked_at is null;
end $$;
revoke execute on function public.bundle_code_revoke(bigint) from public, anon;
grant execute on function public.bundle_code_revoke(bigint) to authenticated;

-- 수강생 1인 1코드 일괄 발급(AD06b): 각 코드 max_uses=1, 평문 목록은 이 응답에서 1회만
create or replace function public.bundle_codes_create_batch(p_label text, p_months smallint, p_count integer, p_expires_at timestamptz)
  returns setof text language plpgsql security definer set search_path = '' as $$
declare plain text; i integer;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = 'PT403'; end if;
  if p_count not between 1 and 500 then raise exception 'count 1..500' using errcode = 'PT400'; end if;
  for i in 1..p_count loop
    plain := upper(encode(extensions.gen_random_bytes(10), 'hex'));
    insert into public.bundle_codes (code_hash, label, months, max_uses, expires_at, created_by)
      values (encode(extensions.digest(plain, 'sha256'), 'hex'), p_label, p_months, 1, p_expires_at, (select auth.uid()));
    return next plain;
  end loop;
end $$;
revoke execute on function public.bundle_codes_create_batch(text, smallint, integer, timestamptz) from public, anon;
grant execute on function public.bundle_codes_create_batch(text, smallint, integer, timestamptz) to authenticated;

-- Pro 게이트를 DB로(D31): ArtCraft 설치 프롬프트 ai_* 는 무료 3개 앱만 공개, 나머지는 Pro만 읽기
create or replace function public.my_has_pro() returns boolean
  language sql stable security definer set search_path = '' as $$
  select coalesce(public.has_pro((select auth.uid())), false);
$$;
revoke execute on function public.my_has_pro() from public;
grant execute on function public.my_has_pro() to anon, authenticated;

drop policy prompts_read on public.prompts;
create policy prompts_read_free on public.prompts for select to anon, authenticated
  using (key not like 'ai\_%' or key in ('ai_filmcraft', 'ai_vectorcraft', 'ai_designcraft'));
create policy prompts_read_pro on public.prompts for select to authenticated
  using (key like 'ai\_%' and (select public.my_has_pro()));
-- 주의: art_multi 같은 묶음 프롬프트는 화면에서 instPrompt로 조합하므로 무료 사용자는 무료 3개 앱 범위로만 조합한다(task-10).
