# 05 데이터 모델 — Nomad-Agents-SYSTEM

> ERD 4장: 전체 [`erd.mmd`](diagrams/erd.mmd) · 카탈로그 [`erd-catalog.mmd`](diagrams/erd-catalog.mmd) · 사용자 [`erd-user.mmd`](diagrams/erd-user.mmd) · 관리·두뇌·플랜 [`erd-admin-brain-plan.mmd`](diagrams/erd-admin-brain-plan.mmd) — `sql2erd`로 생성(손으로 그리지 않음, 8장). 구현 착수 후에는 `supabase/migrations`를 입력으로 재생성한다.
> 스키마 초안: [`sql/0001_init.sql`](sql/0001_init.sql) · [`sql/0002_admin_brain.sql`](sql/0002_admin_brain.sql) · [`sql/0003_plans.sql`](sql/0003_plans.sql) · [`sql/0004_limits.sql`](sql/0004_limits.sql) (기획용, 미적용). 근거: [DECISIONS](_research/DECISIONS.md) D4·D5·D6·D7·D21·D22·D27·D29·D31~D40, [SITE_FACTS](_research/SITE_FACTS.md) 4·3·5.2·8. Lnnn = `app/index.html` 줄.
> ERD에는 `auth.users` 관계가 빠진다(스키마 밖 테이블). 사용자 테이블 11개·`user_imports`·두뇌 연동 4개·`user_plans`·`redeem_attempts`는 `owner_id uuid → auth.users(id) on delete cascade`, `bundle_codes`는 관리자 소유.

## 1. 분류 (D4)
| 분류 | 테이블 | RLS |
|---|---|---|
| 권한 | `admins` (user_id PK → auth.users, created_at) — 1행 = 관리자 1명 | 본인 행 select만. 쓰기 정책 없음 → service role(대시보드·시드 스크립트)만 추가·삭제. `is_admin()`이 이 표를 본다 |
| 카탈로그 13 | ssr_stages · ssr_personas · ssr_levels · prompts · art_apps · guide_docs · guide_pages · plan_day_defaults · ssr_checklist_items · brand_colors · content_seeds · brain_nodes · brain_links | select: anon·authenticated `true` / insert·update·delete: `is_admin()` |
| 관리 1 (D21) | `catalog_audit` | select: `is_admin()`만. 쓰기 정책 없음 — 카탈로그 13테이블 트리거(security definer)만 기록 |
| 두뇌 연동 4 (D22) | api_tokens · brain_sources · user_brain_nodes · user_brain_links | select만 본인(`owner_id = (select auth.uid())`). 쓰기는 security definer 함수만(6장) |
| 사용자 11 | user_settings · level_progress · plan_days · checklist_progress · ideas · content_items · skills · routines · user_extensions · recent_files · date_notes | 동작별 4정책 `owner_id = (select auth.uid())`, update는 using+with check. 입력 상한은 3.1 |
| 가져오기 1 (D33) | `user_imports` | select만 본인. 쓰기 정책 없음 — `import_nomad_v1`만 |
| 플랜 3 (D30·D38) | user_plans · bundle_codes · redeem_attempts | 6.1 |
| 제외 | `st.routines`(L630, 읽는 곳 없음) · `ART` 7종(L960, 참조 없음) — D7 | — |
| 기기 유지 | `nomad-theme`, `nomad-lbl` → localStorage 그대로(D5) | — |

## 2. 카탈로그 테이블
| 테이블 | 목적 | 주요 컬럼 | RLS | As-Is 근거 | 시드 출처 |
|---|---|---|---|---|---|
| ssr_stages | SSR+ 4단계 머리 | key(skill·brain·routine·ext) PK, state_key(s1–s4), part_no, letter, en_label, title, lead | 공개 읽기·admin 쓰기 | `SSR` L655–728 | SSR 상수 4건 |
| ssr_personas | 페르소나 3카드 | (stage_key, persona) PK, persona(job_seeker·ceo·employee), body | 동일 | L656–712 | 12건 |
| ssr_levels | 레벨 탭 본문 | (stage_key, level_index 0–2) PK, tag, title, guide_page, blocks jsonb(p·ol·tree·table·prompt·done·warn 순서 배열) | 동일 | L659–727, 블록 L751–762 | 12건 |
| prompts | 복사 박스 원문 | key PK, title, body | 읽기: `ai_*`는 무료 3개 앱(filmcraft·vectorcraft·designcraft)만 공개, 나머지 `ai_*`는 `my_has_pro()`일 때만(D31) · admin 쓰기 | `window.__D.prompts` L602, `ARTP` L969–974, `ai_*` L1080, `art_common`·`art_multi` L1081–1082 | 12 + 5 + 16 = 33건(`ai_*`는 `instPrompt` 결과를 시드 시점에 문자열로 고정 [추정]) |
| art_apps | ArtCraft 16종 | id PK, name, category(img·av·doc·dsg·tool), status, version, rust_version, mcp_code(Y·G·N·U), similar_app, tag, formats, features[], tasks[], limits, job, repo_url, page_url, icon_path, info_as_of | 동일 | `ARTAPPS` L981–1062, 파생 URL L1063, 아이콘 `AICON` L1085(96×96 PNG data URI → Storage 파일로 분리 [추정]) | 16건(2026-11-02 기준) |
| guide_docs | 가이드 문서 탭 | key(ssr·art) PK, title, page_count | 동일 | `DOCS` L1154 | 2건(13쪽·4쪽) |
| guide_pages | 쪽 이미지·텍스트 | (doc_key, page_no) PK, image_path, body_text | 동일 | L1156, `D.pages.ssr` L602 | ssr 13 + art 4. 이미지는 Storage 공개 버킷 `guide` [추정], art body_text는 null(D7 이후) |
| plan_day_defaults | 7일 계획 기본 문구 | day_index 0–6 PK, task, tag | 동일 | `DAYS` L792–800 | 7건 |
| ssr_checklist_items | SSR+ 체크리스트 | item_index 0–3 PK, letter, label, done_text | 동일 | `CHECK` L801 | 4건 |
| brand_colors | 팔레트 5칸 | id PK, name, hex, role | 동일 | `BR` L951–957 | 5건 |
| content_seeds | 콘텐츠 보드 초기값 | id PK, title, channel, stage 0–3 | 동일 | `CDEF` L907–910 | 8건 |
| brain_nodes | 탐색기 노드 | id PK, kind, domain, parent_id(자기참조=포함 엣지), name, path, description, body | 동일 | `NODES` L1317–1356, `CE` | 25건 |
| brain_links | 탐색기 링크(방향) | (source_id, target_id) PK | 동일 | `LINKS` L1357–1361 | 26건 |

- 탐색기 레이아웃(좌표)은 저장하지 않는다: 시드 고정 시뮬레이션으로 클라이언트가 계산(L1377–1404).
- 통계 "25 두뇌 노드"는 `count(brain_nodes)`로 대체(D7). 클러스터 개수도 실제 집계.
- 정본은 운영 DB다(D39). `supabase/seed.sql`(상수에서 기계 추출, `intern`)은 최초 1회만 넣는다. MVP-2 관리자 화면 `/admin`(D21, [04_API](04_API.md) 2.1)은 `art_apps`·`prompts`·`guide_pages` 문구·이미지만 고치고, 나머지 카탈로그는 마이그레이션으로 고친다. 변경은 모두 `catalog_audit`에 남는다.

## 3. 사용자 테이블
| 테이블 | 목적 | 주요 컬럼 | RLS | As-Is 근거 | 시드 출처(신규 가입) |
|---|---|---|---|---|---|
| user_settings | 계획 시작일·가져오기 기록 | owner_id PK, plan_start date, imported_v1_at | 본인 4정책 | `st.start` L630, L870, L1196 | 트리거, plan_start=오늘(L636) |
| level_progress | 레벨 완료 체크 | (owner_id, stage_key, level_index) PK, done; FK → ssr_levels | 본인 | `st.lv` L785 | 12행, skill·brain 초급만 done(DEF) |
| plan_days | 일차 완료 + 문구 수정 | (owner_id, day_index) PK, done, custom_text(null=기본값) | 본인 | `st.days` L787·L869, `st.dayText` L803 | 7행, 1·2일차 done(DEF) |
| checklist_progress | 체크리스트 | (owner_id, item_index) PK, done | 본인 | `st.ck` L788 | 4행 모두 false |
| ideas | 아이디어 패드 | id, owner_id, body, category(ICAT 6), score 0–3, legacy_id, created_at | 본인 | `st.ideas` L932·L945·L947 | 없음 |
| content_items | 콘텐츠 보드 | id, owner_id, title, channel(4), stage 0–3, sort_order | 본인 | `st.content` L924·L931 | content_seeds 8건 복사(As-Is는 첫 변경 시 복사 — 결과 동일) |
| skills | 스킬 목록 | id, owner_id, name, command, frequency, sort_order | 본인 | `st.skills`, M1 | DEF 3건 |
| routines | 루틴 목록(`st.rt`) | id, owner_id, name, schedule_text, skill_command, enabled, sort_order | 본인 | `st.rt`, M2, 토글 L881 | DEF 3건 |
| user_extensions | 익스텐션 목록 | id, owner_id, name, kind_desc, connected, sort_order | 본인 | `st.exts`, M3 | DEF 5건 |
| recent_files | 홈 최근 파일 | id, owner_id, name, file_type(5), brain_node_id(**FK 없음** — 예시·내 두뇌 노드 id를 화면에서 해석, 없으면 연결 없음, D37), when_label, sort_order | 본인 | `st.recent`, M4, NODEOPT | DEF 5건 |
| date_notes | 날짜 메모 | (owner_id, note_date) PK, body(빈 값 = 행 삭제) | 본인 | `st.notes`, M6 | 없음 |

- 신규 가입 기본값: `seed_user_defaults()` 트리거(auth.users insert)가 DEF(L630)와 같은 예시 데이터를 넣는다. D15: DEF 예시 데이터로 시작.
- `routines` 테이블 = `st.rt`. 미사용 `st.routines`와 이름만 같다. `extensions`는 Postgres 스키마명과 겹쳐 `user_extensions`.
- `when_label`은 As-Is처럼 자유 문자열("방금", "어제"). 실제 시각 계산은 이후 [추정].
- 정렬: "맨 앞 추가"(L931, M4)는 `sort_order` = 현재 최솟값 − 1.

### 3.1 입력 상한 (D40, [`0004`](sql/0004_limits.sql)) — 직접 REST·rpc 호출도 막도록 DB에 둔다
| 테이블 | 텍스트 길이(23514 → 400) | 사용자당 행 수(`PT413` → 413) |
|---|---|---|
| ideas | body ≤2,000 | 1,000 |
| content_items | title ≤200 | 1,000 |
| date_notes | body ≤2,000 | 3,660 |
| plan_days | custom_text ≤500 | (7행 고정) |
| skills | name·command ≤100, frequency ≤50 | 200 |
| routines | name·skill_command ≤100, schedule_text ≤50 | 200 |
| user_extensions | name·kind_desc ≤100 | 200 |
| recent_files | name ≤200, when_label ≤30 | 200 |
- 행 수는 `enforce_row_cap(상한)` before insert 트리거가 센다. 값은 재량(사이트 사용량의 수십 배 여유).

## 4. localStorage `nomad-lab-v1` → 테이블 매핑 (가져오기, D6)
| `st` 필드 | 구조 | 대상 테이블·컬럼 | 변환 규칙 |
|---|---|---|---|
| `lv` | `{s1..s4:[0/1×3]}` | level_progress.done | s1→skill, s2→brain, s3→routine, s4→ext(ssr_stages.state_key), 배열 i → level_index, 완료 합집합 |
| `days` | `[7]` 0/1 | plan_days.done | i → day_index |
| `dayText` | `[7]` 문자열 | plan_days.custom_text | '' 또는 기본값과 같으면 null |
| `ck` | `[4]` 0/1 | checklist_progress.done | i → item_index |
| `start` | 'YYYY-MM-DD' | user_settings.plan_start | 비면 오늘 |
| `ideas` | `[{id,t,cat,sc}]` | ideas | t→body, cat→category, sc→score, id→legacy_id·created_at(ms) |
| `content` | null \| `[{t,ch,s}]` | content_items | null이면 건너뜀, 배열이면 같은 제목이 없는 항목만 뒤에 추가(t→title, ch→channel, s→stage, 순서→sort_order) |
| `skills` | `[{n,c,u}]` | skills | n→name, c→command, u→frequency, 같은 이름 없을 때만 추가 |
| `rt` | `[{n,t,c,on}]` | routines | t→schedule_text, c→skill_command, on→enabled, 같은 이름 없을 때만 추가 |
| `exts` | `[{n,d,on}]` | user_extensions | d→kind_desc, on→connected, 같은 이름 없을 때만 추가 |
| `recent` | `[{t,n,id,w}]` | recent_files | t→file_type, id→brain_node_id(그대로, FK 없음), w→when_label, 같은 이름 없을 때만 추가 |
| `notes` | `{날짜: 메모}` | date_notes | 키→note_date, 빈 값·서버에 같은 날짜가 있으면 건너뜀 |
| `routines` | `[1,1,0]` | — | 버림(D7) |
- 가져오기는 **기기마다 1회**(`user_imports` (owner_id, device_id) PK, device_id = 기기 localStorage의 무작위 UUID)이고 **병합**이다(D33·D34): `lv`·`days`·`ck`는 완료 합집합(OR), `start`·`dayText`는 서버가 기본값 그대로일 때만 로컬 값, 목록·메모는 위 표대로 추가만. 한 트랜잭션(`import_nomad_v1(p jsonb, p_device text)`, security definer·`auth.uid()` 본인 행만, 256KB 상한 `PT413`). `user_settings.imported_v1_at`은 첫 가져오기 시각으로만 남는다. 성공 후 클라이언트는 `nomad-lab-v1`을 지우지 않고 보존 [추정: 되돌리기 대비].
- 로드 규칙 패리티: 파싱 실패·`lv`/`days` 없음이면 가져오기 대상 없음으로 처리(L632–636).

## 5. 비로그인 체험 (D6)
- 비로그인은 As-Is와 같이 localStorage `nomad-lab-v1`에만 저장, 카탈로그는 anon 읽기로 서버에서 받는다.
- 로그인 직후 `nomad-lab-v1`이 있고 이 기기 UUID가 `user_imports`에 없으면 가져올 항목 수를 미리 보여 주고 가져오기/건너뛰기([04_API](04_API.md) A01, 화면 T2).
- 로그인 중 저장 실패는 localStorage로 떨어지지 않는다(D33, [02](02_ARCHITECTURE.md) 데이터 계층).

## 6. 관리·두뇌 연동 테이블 (D21·D22, [`0002`](sql/0002_admin_brain.sql))
| 테이블 | 목적 | 주요 컬럼 | RLS·쓰기 경로 | 보관(D27) |
|---|---|---|---|---|
| catalog_audit | 카탈로그 변경 이력(AD4) | id, table_name, op(INSERT·UPDATE·DELETE), row_key jsonb(PK 값), old_row·new_row jsonb, actor_id(→auth.users, 탈퇴 시 null), created_at | select admin만 / 쓰기는 13테이블 `*_audit` 트리거(`log_catalog_change(PK 컬럼…)`)만, 수정·삭제 불가 | 1년 → `purge_expired()` |
| api_tokens | 개인 액세스 토큰(`brain:write`) | id, owner_id, name ≤60, token_prefix(앞 12자, 표시용), token_hash(sha256 hex 64자 check → 평문 저장 불가), scope = 'brain:write'만, created_at, last_used_at, revoked_at | select 본인 / 발급 `brain_token_create(name)`(평문은 반환값으로 1회만, 활성 5개 상한) · 폐기 `brain_token_revoke(id)` | 폐기 후 90일 → 행 삭제, 탈퇴 즉시 |
| brain_sources | 사용자당 연동 상태 1행 | owner_id PK, method(cli·web), generator, node_count, link_count, last_synced_at, rate_window_start·rate_window_count(분당 6회, D29) | select 본인 / `_brain_apply` 내부만(카운터를 사용자가 못 고치게) | 연동 해제·탈퇴 즉시 |
| user_brain_nodes | 내 두뇌 노드(graph.json `nodes`) | (owner_id, node_id) PK, kind(folder·note·agent·rule·index·source), domain ≤40, parent_id(같은 사용자 노드, 없으면 null), name ≤200, path ≤512(절대경로·`..` 금지), summary ≤200, sort_order. **본문 컬럼 없음** | select 본인 / 업로드마다 전체 교체(`brain_sync_by_token`·`brain_sync_web`) | 동일 |
| user_brain_links | 내 두뇌 링크(위키링크·Markdown 링크) | (owner_id, source_id, target_id) PK, 양끝 FK → user_brain_nodes on delete cascade | 동일. 없는 노드·자기 자신 링크는 버림 | 동일 |

- 상한은 DB 함수가 기준(D35): 요청 4MB · 노드 5,000 · 링크 20,000 · `version = 1` · Pro · 분당 6회를 `_brain_apply`가 검사한다. Route Handler zod·Content-Length는 먼저 막는 편의 계층([04_API](04_API.md) 2.2·2.3).
- 표시 규칙(D22): `brain_sources.node_count > 0`이면 탐색기·홈 입자 구가 내 두뇌, 아니면 예시 카탈로그 `brain_nodes`·`brain_links`(C06).
- `recent_files.brain_node_id`는 FK 없이 예시 카탈로그 노드 또는 내 두뇌 노드 id를 담고, 화면이 지금 표시 중인 그래프에서 찾는다(D37). Pro가 끝나도 내 그래프는 읽기 전용으로 남는다.
- Storage(AD3): 공개 버킷 `art-icons`·`guide`(2MB, png·webp(·jpeg)), 쓰기 정책은 `is_admin()`. 이미지 교체는 `icon_path`·`image_path` 갱신으로 이력에 남는다.

### 6.1 플랜 (D30, [`0003`](sql/0003_plans.sql))
| 테이블 | 목적 | 주요 컬럼 | RLS | 보관 |
|---|---|---|---|---|
| user_plans | Pro 기간(체험·번들·결제) | owner_id, source(trial·bundle·paid), starts_at, ends_at, bundle_code_id | 본인 select만, 쓰기는 가입 트리거·`redeem_bundle_code`·(이후) 결제 웹훅 | 탈퇴 시 삭제 |
| bundle_codes | 수강생 번들 코드 | code_hash(sha256, 평문 20자리 16진·80비트는 저장 금지), label, months, max_uses, used_count, expires_at, revoked_at, created_by | 관리자 select만. 쓰기 정책 없음 → `bundle_code_create`·`bundle_codes_create_batch`(1인 1코드, ≤500)·`bundle_code_revoke`·`redeem_bundle_code`만, 변경은 `catalog_audit` 기록(D38) | 영구(사용 이력) |
| redeem_attempts | 코드 추측 방지(D38) | owner_id PK, window_start, fail_count(시간당 10회) | 정책 없음 — `redeem_bundle_code`만 | 탈퇴 시 삭제 |
- 실제 적용 시험: [`sql-test/10_rls_smoke.sql`](sql-test/10_rls_smoke.sql) — supabase/postgres 17 컨테이너에 0001~0004 적용 후 29개 항목 통과(2026-11-03, 2차 검토 반영 후). 시험 중 가입 트리거가 카탈로그 노드가 없을 때 실패하던 결함을 찾아 고침.

## 7. 보관 기간 (D27)
| 대상 | 기간 | 방법 |
|---|---|---|
| 사용자 11 · `user_imports` · 두뇌 연동 4 · `user_plans`·`redeem_attempts` | 탈퇴 즉시 | `auth.users` 삭제 → `on delete cascade` |
| 백업(PITR·일일 백업) | 30일 후 소멸 | Supabase 백업 보관 설정 [추정: 플랜별 기본값 확인] |
| 접속·감사 로그(Auth·API 로그), 폐기된 토큰 | 90일 | 로그는 플랫폼 보관 설정, 토큰 행은 `purge_expired()` |
| `catalog_audit` | 1년 | `purge_expired()` — pg_cron 매일 03:15 |
| 1년 미접속 계정 | 30일 전 안내 후 삭제 | `auth.users.last_sign_in_at` 기준 예약 작업(Auth Admin API) [추정] |
| 카탈로그 13 · `admins` | 운영 기간 내내 | 관리자 삭제 시 이력만 남음 |

## 8. 테이블 수와 ERD 분할 메모
- 현재 34개(권한 1 · 카탈로그 13 · 사용자 11 · 가져오기 1 · 관리 1 · 두뇌 연동 4 · 플랜 3) → 25개 초과라 한 장 ERD는 읽기 어렵다(sql2erd 경고).
- 정본은 전체 `diagrams/erd.mmd` 유지. 읽기용은 도메인별로 `--match`를 써서 나눈다 → 생성함: [`erd-catalog.mmd`](diagrams/erd-catalog.mmd) · [`erd-user.mmd`](diagrams/erd-user.mmd) · [`erd-admin-brain-plan.mmd`](diagrams/erd-admin-brain-plan.mmd)(관리·두뇌·플랜):
  - 카탈로그: `sql2erd docs/sql --match '^(ssr_|prompts|art_|guide_|plan_day|brand_|content_seeds|brain_nodes|brain_links)' -o docs/diagrams/erd-catalog.mmd`
  - 사용자: `--match '^(user_settings|user_imports|level_|plan_days|checklist_|ideas|content_items|skills|routines|user_extensions|recent_|date_)'` → `erd-user.mmd`
  - 관리·두뇌·플랜: `--match '^(admins|catalog_audit|api_tokens|brain_sources|user_brain_|user_plans|bundle_codes|redeem_)'` → `erd-admin-brain-plan.mmd`
