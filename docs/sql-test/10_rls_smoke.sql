-- RLS·함수 동작 시험 (일회용 컨테이너 전용). 각 줄이 PASS/FAIL 출력.
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

-- 사용자 A·B·관리자 M 가입 (트리거: 기본 데이터 + 14일 체험)
insert into auth.users (id, email, aud, role) values
 ('00000000-0000-0000-0000-00000000000a','a@test.local','authenticated','authenticated'),
 ('00000000-0000-0000-0000-00000000000b','b@test.local','authenticated','authenticated'),
 ('00000000-0000-0000-0000-00000000000c','m@test.local','authenticated','authenticated');
insert into public.admins (user_id) values ('00000000-0000-0000-0000-00000000000c');

create or replace function pg_temp.as_user(u text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false),
         set_config('request.jwt.claim.sub', u, false);
$$;

-- 1) 가입 트리거: A에게 DEF 스킬 3개, 체험 Pro 1행
select '01 가입 시 DEF 스킬 3개: ' || case when count(*) = 3 then 'PASS' else 'FAIL '||count(*) end
  from public.skills where owner_id = '00000000-0000-0000-0000-00000000000a';
select '02 가입 시 14일 체험: ' || case when count(*) = 1 then 'PASS' else 'FAIL' end
  from public.user_plans where owner_id = '00000000-0000-0000-0000-00000000000a' and source = 'trial';

-- 이하 authenticated 역할로 B
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
set role authenticated;
select '03 B가 A의 스킬 조회 0건: ' || case when count(*) = 0 then 'PASS' else 'FAIL '||count(*) end
  from public.skills where owner_id = '00000000-0000-0000-0000-00000000000a';
select '04 B 자기 스킬 3건: ' || case when count(*) = 3 then 'PASS' else 'FAIL '||count(*) end from public.skills;
select '05 B는 감사 기록 0건(관리자 전용): ' || case when count(*) = 0 then 'PASS' else 'FAIL' end from public.catalog_audit;
do $$ begin
  insert into public.art_apps (id,name,category,status,version,mcp_code,similar_app,tag,formats,description,sort_order)
  values ('x','X','img','a','1','N','-','-','-','-',99);
  raise notice '06 일반 사용자 카탈로그 쓰기 거부: FAIL';
exception when others then raise notice '06 일반 사용자 카탈로그 쓰기 거부: PASS (%)', sqlerrm; end $$;
do $$ begin
  update public.user_settings set imported_v1_at = now() where owner_id = (select auth.uid());
  update public.user_settings set imported_v1_at = null where owner_id = (select auth.uid());
  raise notice '07 imported_v1_at 되돌리기 거부: FAIL';
exception when others then raise notice '07 imported_v1_at 되돌리기 거부: PASS (%)', sqlerrm; end $$;
do $$ begin
  insert into public.user_plans (owner_id, source, ends_at) values ((select auth.uid()), 'paid', now() + interval '1 year');
  raise notice '08 사용자가 Pro 기간 직접 쓰기 거부: FAIL';
exception when others then raise notice '08 사용자가 Pro 기간 직접 쓰기 거부: PASS (%)', sqlerrm; end $$;
reset role;

-- 관리자 M: 카탈로그 쓰기 + 감사 기록 + 번들 코드 발급
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
set role authenticated;
insert into public.art_apps (id,name,category,status,version,mcp_code,similar_app,tag,formats,description,sort_order)
  values ('testapp','TestApp','img','a','1','N','-','-','-','-',99);
select '09 관리자 카탈로그 쓰기 → 감사 기록: ' || case when count(*) >= 1 then 'PASS' else 'FAIL' end
  from public.catalog_audit where table_name = 'art_apps';
select public.bundle_code_create('시험 1기', 3::smallint, 1, null) as code \gset
reset role;

-- A: 번들 코드 사용 1회 성공, 두 번째 실패
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
select '10 번들 코드 사용: ' || case when (public.redeem_bundle_code(:'code') ->> 'pro')::boolean then 'PASS' else 'FAIL' end;
\echo 11a 같은 코드 두 번째 사용(아래에 {"error": "invalid code"} jsonb가 나와야 PASS):
select public.redeem_bundle_code(:'code');
reset role;
select '11 같은 코드 재사용 막힘(사용 횟수 1): ' || case when used_count = 1 then 'PASS' else 'FAIL '||used_count end
  from public.bundle_codes where label = '시험 1기';

-- A: 토큰 발급 → anon으로 CLI 업로드 → A만 노드 조회
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
select public.brain_token_create('cli') as tok \gset
reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', false), set_config('request.jwt.claim.sub', '', false);
set role anon;
select '12 anon이 토큰으로 업로드: ' || case when public.brain_sync_by_token(:'tok',
  '{"version":"1","nodes":[{"id":"n1","kind":"note","domain":"root","name":"메모","path":"notes/a.md"}],"links":[]}'::jsonb) is not null
  then 'PASS' else 'FAIL' end;
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
set role authenticated;
select '13 B는 A의 두뇌 노드 0건: ' || case when count(*) = 0 then 'PASS' else 'FAIL' end from public.user_brain_nodes;
reset role;

-- ===== 2차 리뷰 반영 확인 (D31·D33·D35·D38, 보안 리뷰) =====
-- 14) 마지막 노드만 틀린 graph 반복 → 카운터가 확정돼 7번째는 rate limited
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
set role authenticated;
do $$
declare r jsonb; i int; hit int := 0;
begin
  for i in 1..7 loop
    begin
      r := public.brain_sync_web('{"version":"1","nodes":[{"id":"ok","kind":"note","domain":"root","name":"a","path":"a.md"},{"id":"bad","kind":"x","domain":"root","name":"b","path":"b.md"}],"links":[]}'::jsonb);
    exception when others then if sqlstate = 'PT429' then hit := i; end if; end;
    exit when hit > 0;
  end loop;
  raise notice '14 틀린 graph 반복도 7번째에 제한: %', case when hit = 7 then 'PASS' else 'FAIL hit='||hit end;
end $$;
reset role;

-- 15) 프롬프트 Pro 게이트: 관리자 입력 → 무료 사용자·anon은 무료 3개만
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
set role authenticated;
insert into public.prompts (key, body) values ('ai_photocraft', 'pro'), ('ai_filmcraft', 'free'), ('node', 'common');
reset role;
delete from public.user_plans where owner_id = '00000000-0000-0000-0000-00000000000b'; -- B를 무료로
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
set role authenticated;
select '15a 무료 사용자는 Pro 프롬프트 0건: ' || case when count(*) = 0 then 'PASS' else 'FAIL' end from public.prompts where key = 'ai_photocraft';
select '15b 무료 사용자도 무료 앱·공통 프롬프트 2건: ' || case when count(*) = 2 then 'PASS' else 'FAIL '||count(*) end from public.prompts where key in ('ai_filmcraft','node');
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
select '15c Pro 사용자는 Pro 프롬프트 1건: ' || case when count(*) = 1 then 'PASS' else 'FAIL' end from public.prompts where key = 'ai_photocraft';
reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', false), set_config('request.jwt.claim.sub', '', false);
set role anon;
select '15d anon은 Pro 프롬프트 0건: ' || case when count(*) = 0 then 'PASS' else 'FAIL' end from public.prompts where key = 'ai_photocraft';
reset role;

-- 16) 코드 추측: 실패 10회 뒤 11번째는 rate limited
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
set role authenticated;
do $$
declare i int; r jsonb; limited boolean := false;
begin
  for i in 1..11 loop
    begin r := public.redeem_bundle_code('WRONG' || i);
    exception when others then if sqlstate = 'PT429' then limited := (i = 11); end if; end;
  end loop;
  raise notice '16 코드 실패 10회 후 제한: %', case when limited then 'PASS' else 'FAIL' end;
end $$;
reset role;

-- 17) 관리자도 bundle_codes 직접 insert 불가(함수로만)
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
set role authenticated;
do $$ begin
  insert into public.bundle_codes (code_hash, label, max_uses) values (repeat('a',64), 'x', 1);
  raise notice '17 관리자 직접 insert 거부: FAIL';
exception when others then raise notice '17 관리자 직접 insert 거부: PASS (%)', sqlerrm; end $$;
-- 18) 일괄 발급·폐기·감사 기록
select count(*) from public.bundle_codes_create_batch('시험 2기', 3::smallint, 2, null);
select public.bundle_code_revoke((select id from public.bundle_codes where label = '시험 2기' order by id limit 1));
select '18a 코드 변경 감사 기록: ' || case when count(*) >= 3 then 'PASS' else 'FAIL '||count(*) end from public.catalog_audit where table_name = 'bundle_codes';
reset role;
select '18b 일괄 발급 코드는 1인 1회: ' || case when bool_and(max_uses = 1) and count(*) = 2 then 'PASS' else 'FAIL' end from public.bundle_codes where label = '시험 2기';
select '18c 폐기 표시: ' || case when count(*) = 1 then 'PASS' else 'FAIL' end from public.bundle_codes where label = '시험 2기' and revoked_at is not null;

-- 19) 가져오기: 기기마다 1회, 256KB 상한
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
select '19a 기기1 첫 가져오기: ' || case when public.import_nomad_v1('{}'::jsonb, '11111111-1111-1111-1111-111111111111') is not null then 'PASS' else 'FAIL' end;
do $$ begin
  perform public.import_nomad_v1('{}'::jsonb, '11111111-1111-1111-1111-111111111111');
  raise notice '19b 같은 기기 재가져오기 거부: FAIL';
exception when others then raise notice '19b 같은 기기 재가져오기 거부: PASS (%)', sqlstate; end $$;
select '19c 다른 기기 가져오기: ' || case when public.import_nomad_v1('{}'::jsonb, '22222222-2222-2222-2222-222222222222') is not null then 'PASS' else 'FAIL' end;
do $$ begin
  perform public.import_nomad_v1(jsonb_build_object('x', repeat('a', 300000)), '33333333-3333-3333-3333-333333333333');
  raise notice '19d 256KB 초과 거부: FAIL';
exception when others then raise notice '19d 256KB 초과 거부: PASS (%)', sqlstate; end $$;
-- 20) 길이 상한
do $$ begin
  insert into public.ideas (owner_id, body, category) values ((select auth.uid()), repeat('가', 2001), 'SaaS');
  raise notice '20 아이디어 2000자 초과 거부: FAIL';
exception when others then raise notice '20 아이디어 2000자 초과 거부: PASS (%)', sqlstate; end $$;
reset role;
