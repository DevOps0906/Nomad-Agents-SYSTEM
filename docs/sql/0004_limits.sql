-- 0004_limits.sql — 사용자 입력 남용 방지(보안 리뷰 2차 ⚪): 텍스트 길이 상한 + 사용자당 행 수 상한
-- 기획용 초안. 0001~0003 다음에 적용. 직접 rpc·REST 호출(U06~U12)도 막히도록 DB에 둔다.
-- 상한 값은 재량(사이트 화면에서 쓰는 분량의 수십 배 여유).

-- 1. 텍스트 길이
alter table public.ideas          add constraint ideas_body_len        check (char_length(body) <= 2000);
alter table public.content_items  add constraint content_title_len     check (char_length(title) <= 200);
alter table public.date_notes     add constraint date_notes_body_len   check (char_length(body) <= 2000);
alter table public.plan_days      add constraint plan_days_text_len    check (char_length(custom_text) <= 500);
alter table public.skills         add constraint skills_len            check (char_length(name) <= 100 and char_length(command) <= 100 and char_length(coalesce(frequency, '')) <= 50);
alter table public.routines       add constraint routines_len          check (char_length(name) <= 100 and char_length(schedule_text) <= 50 and char_length(skill_command) <= 100);
alter table public.user_extensions add constraint user_ext_len         check (char_length(name) <= 100 and char_length(kind_desc) <= 100);
alter table public.recent_files   add constraint recent_files_len      check (char_length(name) <= 200 and char_length(when_label) <= 30);

-- 2. 사용자당 행 수 (트리거 인자 = 상한)
create or replace function public.enforce_row_cap() returns trigger
  language plpgsql security definer set search_path = '' as $$
declare
  cap integer := tg_argv[0]::integer;
  n integer;
begin
  execute format('select count(*) from public.%I where owner_id = $1', tg_table_name) into n using new.owner_id;
  if n >= cap then
    raise exception 'row limit % reached for %', cap, tg_table_name using errcode = 'PT413';
  end if;
  return new;
end $$;
revoke execute on function public.enforce_row_cap() from public, anon, authenticated;

create trigger ideas_cap           before insert on public.ideas           for each row execute function public.enforce_row_cap('1000');
create trigger content_items_cap   before insert on public.content_items   for each row execute function public.enforce_row_cap('1000');
create trigger date_notes_cap      before insert on public.date_notes      for each row execute function public.enforce_row_cap('3660');
create trigger skills_cap          before insert on public.skills          for each row execute function public.enforce_row_cap('200');
create trigger routines_cap        before insert on public.routines        for each row execute function public.enforce_row_cap('200');
create trigger user_extensions_cap before insert on public.user_extensions for each row execute function public.enforce_row_cap('200');
create trigger recent_files_cap    before insert on public.recent_files    for each row execute function public.enforce_row_cap('200');
