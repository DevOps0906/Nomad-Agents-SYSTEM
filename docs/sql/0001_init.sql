-- 0001_init.sql — Nomad-Agents-SYSTEM 플랫폼 이전 스키마 (기획용 초안, 미적용)
-- 근거: docs/_research/DECISIONS.md D4·D5·D6·D7, SITE_FACTS 4.1~4.4, 3.x, 5.2
-- 실제 적용 시 supabase/migrations/<timestamp>_*.sql 로 의도별(테이블/정책/시드) 분리한다.
-- 제외(D7): st.routines(미사용 [1,1,0]), ART 7종 배열(미사용). 기기 설정 nomad-theme·nomad-lbl은 localStorage 유지(D5).

-- =====================================================================
-- 0. 권한: 관리자 판별
-- =====================================================================
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- 쓰기 정책 없음: service role(대시보드·시드 스크립트)만 추가/삭제한다.
create policy admins_select_own on public.admins for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;

-- =====================================================================
-- 1. 카탈로그 (읽기 공개 · 쓰기 admin) — 사이트 상수를 시드로 이전
-- =====================================================================

-- SSR+ 4단계 (SSR L640–713)
create table public.ssr_stages (
  key text primary key check (key in ('skill','brain','routine','ext')),
  state_key text not null unique check (state_key in ('s1','s2','s3','s4')), -- st.lv 키
  part_no smallint not null check (part_no between 1 and 4),
  letter text not null,            -- 'S','S','R','+'
  en_label text not null,          -- 'SKILL' 등
  title text not null,
  lead text not null,
  sort_order smallint not null
);

-- 페르소나 3카드 (L641–697)
create table public.ssr_personas (
  stage_key text not null references public.ssr_stages (key) on delete cascade,
  persona text not null check (persona in ('job_seeker','ceo','employee')),
  body text not null,
  primary key (stage_key, persona)
);

-- 레벨 3개 × 4단계 = 12행, 본문 블록은 순서 있는 jsonb 배열 (blocks L736–747)
create table public.ssr_levels (
  stage_key text not null references public.ssr_stages (key) on delete cascade,
  level_index smallint not null check (level_index between 0 and 2),
  tag text not null,               -- '초급','중급','고급'
  title text not null,
  guide_page smallint not null,    -- data-guide="ssr:N"
  blocks jsonb not null default '[]'::jsonb, -- [{type:'p'|'ol'|'tree'|'table'|'prompt'|'done'|'warn', ...}]
  primary key (stage_key, level_index)
);

-- 프롬프트 (window.__D.prompts 12 + art_install·art_color·art_card·art_common·art_multi + ai_<앱id> 16)
create table public.prompts (
  key text primary key,
  title text,
  body text not null,
  updated_at timestamptz not null default now()
);

-- ArtCraft 앱 16종 (ARTAPPS L966–1047)
create table public.art_apps (
  id text primary key,                         -- 'photocraft' 등
  name text not null,
  category text not null check (category in ('img','av','doc','dsg','tool')), -- ACAT(all 제외)
  status text not null,
  version text not null,
  rust_version text,                           -- '-' 는 null
  mcp_code text not null check (mcp_code in ('Y','G','N','U')),
  similar_app text not null,
  tag text not null,
  formats text not null,
  description text not null,
  features text[] not null default '{}',
  tasks text[] not null default '{}',
  limits text,
  job text,                                    -- instPrompt 동사구
  color_var text,
  has_agents_md boolean not null default false,
  is_external boolean not null default false,  -- solidcraft ext:true
  vendor text,                                 -- 'Tangency Labs'
  repo_url text,
  page_url text,
  icon_path text,                              -- 런처 아이콘 96x96 PNG, Storage 공개 버킷 'art-icons' 경로 [추정] (As-Is: AICON data URI)
  info_as_of date not null default '2026-11-02',
  sort_order smallint not null
);

-- 가이드 문서·쪽 (DOCS L1136, D.pages.ssr)
create table public.guide_docs (
  key text primary key check (key in ('ssr','art')),
  title text not null,
  page_count smallint not null,
  sort_order smallint not null
);

create table public.guide_pages (
  doc_key text not null references public.guide_docs (key) on delete cascade,
  page_no smallint not null check (page_no >= 1),
  image_path text not null,        -- Storage 공개 버킷 'guide' 경로 [추정]
  body_text text,                  -- ssr 13쪽만, art는 null(D7: 이후 추가)
  primary key (doc_key, page_no)
);

-- 7일 계획 기본값 (DAYS L777–785)
create table public.plan_day_defaults (
  day_index smallint primary key check (day_index between 0 and 6),
  task text not null,
  tag text not null
);

-- SSR+ 체크리스트 4 (CHECK L786)
create table public.ssr_checklist_items (
  item_index smallint primary key check (item_index between 0 and 3),
  letter text not null,
  label text not null,
  done_text text not null
);

-- 브랜드 팔레트 5색 (BR L936–942)
create table public.brand_colors (
  id smallint primary key,
  name text not null,
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  role text not null
);

-- 콘텐츠 시드 8건 (CDEF L892–895) — 신규 사용자 content_items 초기값
create table public.content_seeds (
  id smallint primary key,
  title text not null,
  channel text not null check (channel in ('유튜브','블로그','전자책','뉴스레터')),
  stage smallint not null check (stage between 0 and 3)
);

-- 세컨드 브레인 탐색기 노드 25·링크 26 (NODES L1299–1338, LINKS L1339–1350)
create table public.brain_nodes (
  id text primary key,
  kind text not null check (kind in ('agent','folder','rule','index','source')),
  domain text not null check (domain in ('agent','root','content','dev','fin')),
  parent_id text references public.brain_nodes (id) on delete set null, -- 포함 엣지 CE
  name text not null,
  path text not null,
  description text not null,
  body text,
  sort_order smallint not null default 0
);

create table public.brain_links (
  source_id text not null references public.brain_nodes (id) on delete cascade,
  target_id text not null references public.brain_nodes (id) on delete cascade,
  primary key (source_id, target_id)
);

-- 카탈로그 RLS: 누구나(anon 포함) 읽기, admin만 쓰기
do $$
declare t text;
begin
  foreach t in array array['ssr_stages','ssr_personas','ssr_levels','prompts','art_apps',
    'guide_docs','guide_pages','plan_day_defaults','ssr_checklist_items','brand_colors',
    'content_seeds','brain_nodes','brain_links']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t || '_read', t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_admin()))', t || '_admin_ins', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t || '_admin_upd', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_admin()))', t || '_admin_del', t);
  end loop;
end $$;

-- =====================================================================
-- 2. 사용자 데이터 (localStorage nomad-lab-v1 의 st 필드 → owner_id 기준 RLS)
-- =====================================================================

-- st.start + 가져오기 기록
create table public.user_settings (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  plan_start date not null default current_date,  -- st.start
  imported_v1_at timestamptz,                     -- nomad-lab-v1 가져오기 완료 시각(중복 방지)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- st.lv {s1..s4:[0/1 ×3]}
create table public.level_progress (
  owner_id uuid not null references auth.users (id) on delete cascade,
  stage_key text not null,
  level_index smallint not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner_id, stage_key, level_index),
  foreign key (stage_key, level_index) references public.ssr_levels (stage_key, level_index)
);

-- st.days[7] + st.dayText[7]
create table public.plan_days (
  owner_id uuid not null references auth.users (id) on delete cascade,
  day_index smallint not null references public.plan_day_defaults (day_index),
  done boolean not null default false,
  custom_text text,                -- null = 기본값 사용 (dayText '' 대응)
  updated_at timestamptz not null default now(),
  primary key (owner_id, day_index)
);

-- st.ck[4]
create table public.checklist_progress (
  owner_id uuid not null references auth.users (id) on delete cascade,
  item_index smallint not null references public.ssr_checklist_items (item_index),
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner_id, item_index)
);

-- st.ideas [{id,t,cat,sc}]
create table public.ideas (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  category text not null check (category in ('SaaS','AI 에이전트','자동화','콘텐츠','전자책','정부지원사업')),
  score smallint not null default 0 check (score between 0 and 3),
  legacy_id bigint,                -- 가져온 Date.now() id
  created_at timestamptz not null default now()
);

-- st.content [{t,ch,s}] (null → content_seeds 복사)
create table public.content_items (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  channel text not null check (channel in ('유튜브','블로그','전자책','뉴스레터')),
  stage smallint not null default 0 check (stage between 0 and 3),
  sort_order integer not null default 0,  -- 새 항목은 맨 앞(작은 값)
  created_at timestamptz not null default now()
);

-- st.skills [{n,c,u}]
create table public.skills (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  command text not null default '/',
  frequency text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- st.rt [{n,t,c,on}] (st.routines 아님)
create table public.routines (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  schedule_text text not null default '매일 09:00',
  skill_command text not null default '/',
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- st.exts [{n,d,on}] — 'extensions'는 Postgres 스키마명과 혼동되어 user_ 접두
create table public.user_extensions (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  kind_desc text not null default '커넥터 · ',
  connected boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- st.recent [{t,n,id,w}]
create table public.recent_files (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  file_type text not null default 'MD' check (file_type in ('MD','XLS','PDF','DOC','TXT')),
  brain_node_id text,  -- NODEOPT. FK 없음(D37): 예시 카탈로그 노드 또는 내 두뇌 노드 id를 화면에서 해석, 없으면 "연결 없음"
  when_label text not null default '방금',
  sort_order integer not null default 0,  -- 새 항목은 맨 앞
  created_at timestamptz not null default now()
);

-- st.notes {'YYYY-MM-DD': 메모}
create table public.date_notes (
  owner_id uuid not null references auth.users (id) on delete cascade,
  note_date date not null,
  body text not null check (length(trim(body)) > 0), -- 빈 값 저장 = 행 삭제
  updated_at timestamptz not null default now(),
  primary key (owner_id, note_date)
);

-- 사용자 RLS: 본인 행만 (select/insert/update/delete 분리)
do $$
declare t text;
begin
  foreach t in array array['user_settings','level_progress','plan_days','checklist_progress',
    'ideas','content_items','skills','routines','user_extensions','recent_files','date_notes']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (owner_id = (select auth.uid()))', t || '_own_sel', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (owner_id = (select auth.uid()))', t || '_own_ins', t);
    execute format('create policy %I on public.%I for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t || '_own_upd', t);
    execute format('create policy %I on public.%I for delete to authenticated using (owner_id = (select auth.uid()))', t || '_own_del', t);
  end loop;
end $$;

-- imported_v1_at 1회 제한 우회 방지: 사용자는 user_settings 행을 지울 수 없고(delete 정책 없음),
-- 한 번 기록된 imported_v1_at은 바꿀 수 없다(null → 시각 기록만 허용)
drop policy user_settings_own_del on public.user_settings;

create or replace function public.guard_imported_v1_at() returns trigger
  language plpgsql set search_path = '' as $$
begin
  if old.imported_v1_at is not null and new.imported_v1_at is distinct from old.imported_v1_at then
    raise exception 'imported_v1_at is immutable';
  end if;
  return new;
end $$;

create trigger user_settings_guard_imported before update on public.user_settings
  for each row execute function public.guard_imported_v1_at();

-- 정책 조건 컬럼 인덱스 (복합 PK 선두가 owner_id인 테이블은 생략)
create index ideas_owner_idx on public.ideas (owner_id, score desc);
create index content_items_owner_idx on public.content_items (owner_id, sort_order);
create index skills_owner_idx on public.skills (owner_id, sort_order);
create index routines_owner_idx on public.routines (owner_id, sort_order);
create index user_extensions_owner_idx on public.user_extensions (owner_id, sort_order);
create index recent_files_owner_idx on public.recent_files (owner_id, sort_order);
create index brain_nodes_parent_idx on public.brain_nodes (parent_id);
create index brain_links_target_idx on public.brain_links (target_id);

-- =====================================================================
-- 3. 함수
-- =====================================================================

-- 신규 사용자 기본값 (DEF L630 패리티) — auth.users insert 트리거. D15: DEF 예시 데이터로 시작
create or replace function public.seed_user_defaults() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_settings (owner_id) values (new.id);
  insert into public.level_progress (owner_id, stage_key, level_index, done)
    select new.id, l.stage_key, l.level_index, (l.stage_key in ('skill','brain') and l.level_index = 0)
    from public.ssr_levels l;
  insert into public.plan_days (owner_id, day_index, done)
    select new.id, d.day_index, d.day_index < 2 from public.plan_day_defaults d;
  insert into public.checklist_progress (owner_id, item_index)
    select new.id, c.item_index from public.ssr_checklist_items c;
  insert into public.content_items (owner_id, title, channel, stage, sort_order)
    select new.id, s.title, s.channel, s.stage, s.id from public.content_seeds s;
  insert into public.skills (owner_id, name, command, frequency, sort_order) values
    (new.id, '오늘일정_보고', '/daily-report', '주 12회', 0),
    (new.id, '회의록 정리', '/meeting-notes', '주 4회', 1),
    (new.id, '전자책 목차·시장성 분석', '/ebook-outline', '주 2회', 2);
  insert into public.routines (owner_id, name, schedule_text, skill_command, enabled, sort_order) values
    (new.id, '오늘 할 일 브리핑', '매일 09:00', '/daily-report', true, 0),
    (new.id, '지난주 매출·콘텐츠 요약', '매주 월 08:30', '/weekly-review', true, 1),
    (new.id, '아이디어 패드 정리', '매일 22:00', '/idea-digest', false, 2);
  insert into public.user_extensions (owner_id, name, kind_desc, connected, sort_order) values
    (new.id, '지메일', '커넥터 · 메일 확인', true, 0),
    (new.id, '구글 캘린더', '커넥터 · 일정 등록', true, 1),
    (new.id, '구글 드라이브', '커넥터 · 문서 찾기', true, 2),
    (new.id, 'Supabase', 'MCP · DB 조회', false, 3),
    (new.id, 'brain-explorer', '직접 만든 도구 · Extensions/', true, 4);
  -- brain_node_id는 FK 없음(D37): 노드가 없어도 가입은 실패하지 않고, 화면이 없는 노드를 "연결 없음"으로 보여 준다
  insert into public.recent_files (owner_id, name, file_type, brain_node_id, when_label, sort_order)
  select new.id, v.name, v.file_type, v.node, v.when_label, v.sort_order
  from (values
    ('AGENTS.md', 'MD', 'agents', '방금', 0),
    ('전체목록.md', 'MD', 'all', '1시간 전', 1),
    ('쇼츠 대본_최종.md', 'MD', 'c_s1', '어제', 2),
    ('프로젝트 기획서.md', 'MD', 'd_s1', '어제', 3),
    ('월간 매출 정리.xlsx', 'XLS', 'f_s1', '3일 전', 4)
  ) as v(name, file_type, node, when_label, sort_order);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.seed_user_defaults();

-- nomad-lab-v1 가져오기: 기기마다 1회, 병합(D33·D34). security definer — 본인(auth.uid()) 행만 쓰도록 함수 안에서 owner_id를 고정한다
-- 입력 검증(형식·길이·개수 상한)은 Route Handler에서 먼저 수행. 1회만 허용(imported_v1_at).
-- 가져오기는 기기마다 1회, 방식은 병합(덮어쓰기 없음) (D33·D34). imported_v1_at은 "첫 가져오기 시각"으로만 남긴다.
create table public.user_imports (
  owner_id uuid not null references auth.users (id) on delete cascade,
  device_id text not null check (device_id ~ '^[0-9a-f-]{36}$'), -- 기기 localStorage의 무작위 UUID
  imported_at timestamptz not null default now(),
  primary key (owner_id, device_id)
);
alter table public.user_imports enable row level security;
create policy user_imports_own_sel on public.user_imports for select to authenticated using (owner_id = (select auth.uid()));
-- 쓰기 정책 없음: import_nomad_v1만 쓴다

create or replace function public.import_nomad_v1(p jsonb, p_device text) returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not authenticated' using errcode = 'PT401'; end if;
  -- 상한은 DB가 기준(rpc 직접 호출로 Route Handler 검사를 건너뛸 수 있음): 256KB
  if octet_length(p::text) > 262144 then raise exception 'too large' using errcode = 'PT413'; end if;
  insert into public.user_imports (owner_id, device_id) values (uid, p_device); -- 같은 기기 두 번째는 PK 위반 → 409
  -- 실제 본문은 구현 단계(task-15)에서 작성. 병합 규칙(D34):
  --   lv/days/ck → 완료 합집합(OR) · start/dayText → 서버가 DEF 그대로면 로컬 값
  --   ideas/content/skills/rt/exts/recent → 서버에 같은 제목(이름)이 없을 때만 추가(배열 순서 = sort_order 뒤에)
  --   notes → 같은 날짜가 없을 때만 추가 · content가 null이면 건너뜀
  update public.user_settings set imported_v1_at = coalesce(imported_v1_at, now()), updated_at = now() where owner_id = uid;
  return jsonb_build_object('device', p_device, 'imported_at', now());
end $$;
revoke execute on function public.import_nomad_v1(jsonb, text) from public, anon;
grant execute on function public.import_nomad_v1(jsonb, text) to authenticated;
