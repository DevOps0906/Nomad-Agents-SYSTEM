# 05 데이터 모델 — Nomad-Agents-SYSTEM

> ERD: [`diagrams/erd.mmd`](diagrams/erd.mmd) — `sql2erd docs/sql -o docs/diagrams/erd.mmd` 로 생성(손으로 그리지 않음). 구현 착수 후에는 `supabase/migrations`를 입력으로 재생성한다.
> 스키마 초안: [`sql/0001_init.sql`](sql/0001_init.sql) (기획용, 미적용). 근거: [DECISIONS](_research/DECISIONS.md) D4·D5·D6·D7, [SITE_FACTS](_research/SITE_FACTS.md) 4·3·5.2·8. Lnnn = `app/index.html` 줄.
> ERD에는 `auth.users` 관계가 빠진다(스키마 밖 테이블). 사용자 테이블 11개는 모두 `owner_id uuid → auth.users(id) on delete cascade`.

## 1. 분류 (D4)
| 분류 | 테이블 | RLS |
|---|---|---|
| 권한 | `admins` | 본인 행 select만. 쓰기는 service role(대시보드·시드 스크립트) |
| 카탈로그 13 | ssr_stages · ssr_personas · ssr_levels · prompts · art_apps · guide_docs · guide_pages · plan_day_defaults · ssr_checklist_items · brand_colors · content_seeds · brain_nodes · brain_links | select: anon·authenticated `true` / insert·update·delete: `is_admin()` |
| 사용자 11 | user_settings · level_progress · plan_days · checklist_progress · ideas · content_items · skills · routines · user_extensions · recent_files · date_notes | 동작별 4정책 `owner_id = (select auth.uid())`, update는 using+with check |
| 제외 | `st.routines`(L630, 읽는 곳 없음) · `ART` 7종(L960, 참조 없음) — D7 | — |
| 기기 유지 | `nomad-theme`, `nomad-lbl` → localStorage 그대로(D5) | — |

## 2. 카탈로그 테이블
| 테이블 | 목적 | 주요 컬럼 | RLS | As-Is 근거 | 시드 출처 |
|---|---|---|---|---|---|
| ssr_stages | SSR+ 4단계 머리 | key(skill·brain·routine·ext) PK, state_key(s1–s4), part_no, letter, en_label, title, lead | 공개 읽기·admin 쓰기 | `SSR` L655–728 | SSR 상수 4건 |
| ssr_personas | 페르소나 3카드 | (stage_key, persona) PK, persona(job_seeker·ceo·employee), body | 동일 | L656–712 | 12건 |
| ssr_levels | 레벨 탭 본문 | (stage_key, level_index 0–2) PK, tag, title, guide_page, blocks jsonb(p·ol·tree·table·prompt·done·warn 순서 배열) | 동일 | L659–727, 블록 L751–762 | 12건 |
| prompts | 복사 박스 원문 | key PK, title, body | 동일 | `window.__D.prompts` L602, `ARTP` L969–974, `ai_*` L1080, `art_common`·`art_multi` L1081–1082 | 12 + 5 + 16 = 33건(`ai_*`는 `instPrompt` 결과를 시드 시점에 문자열로 고정 [추정]) |
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
- 시드 파일 위치 [추정]: `supabase/seed.sql`(상수에서 기계 추출, `intern`). 관리자 편집 화면 여부는 Q3 미결.

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
| recent_files | 홈 최근 파일 | id, owner_id, name, file_type(5), brain_node_id(→brain_nodes, null=연결 없음), when_label, sort_order | 본인 | `st.recent`, M4, NODEOPT | DEF 5건 |
| date_notes | 날짜 메모 | (owner_id, note_date) PK, body(빈 값 = 행 삭제) | 본인 | `st.notes`, M6 | 없음 |

- 신규 가입 기본값: `seed_user_defaults()` 트리거(auth.users insert)가 DEF(L630)와 같은 예시 데이터를 넣는다. D15: DEF 예시 데이터로 시작.
- `routines` 테이블 = `st.rt`. 미사용 `st.routines`와 이름만 같다. `extensions`는 Postgres 스키마명과 겹쳐 `user_extensions`.
- `when_label`은 As-Is처럼 자유 문자열("방금", "어제"). 실제 시각 계산은 이후 [추정].
- 정렬: "맨 앞 추가"(L931, M4)는 `sort_order` = 현재 최솟값 − 1.

## 4. localStorage `nomad-lab-v1` → 테이블 매핑 (가져오기, D6)
| `st` 필드 | 구조 | 대상 테이블·컬럼 | 변환 규칙 |
|---|---|---|---|
| `lv` | `{s1..s4:[0/1×3]}` | level_progress.done | s1→skill, s2→brain, s3→routine, s4→ext(ssr_stages.state_key), 배열 i → level_index |
| `days` | `[7]` 0/1 | plan_days.done | i → day_index |
| `dayText` | `[7]` 문자열 | plan_days.custom_text | '' 또는 기본값과 같으면 null |
| `ck` | `[4]` 0/1 | checklist_progress.done | i → item_index |
| `start` | 'YYYY-MM-DD' | user_settings.plan_start | 비면 오늘 |
| `ideas` | `[{id,t,cat,sc}]` | ideas | t→body, cat→category, sc→score, id→legacy_id·created_at(ms) |
| `content` | null \| `[{t,ch,s}]` | content_items | null이면 기존 시드 복사본 유지, 배열이면 교체(t→title, ch→channel, s→stage, 순서→sort_order) |
| `skills` | `[{n,c,u}]` | skills | n→name, c→command, u→frequency, 교체 |
| `rt` | `[{n,t,c,on}]` | routines | t→schedule_text, c→skill_command, on→enabled, 교체 |
| `exts` | `[{n,d,on}]` | user_extensions | d→kind_desc, on→connected, 교체 |
| `recent` | `[{t,n,id,w}]` | recent_files | t→file_type, id→brain_node_id(없는 노드면 null), w→when_label, 교체 |
| `notes` | `{날짜: 메모}` | date_notes | 키→note_date, 빈 값 건너뜀 |
| `routines` | `[1,1,0]` | — | 버림(D7) |
- 가져오기는 1회(`imported_v1_at`), 한 트랜잭션(`import_nomad_v1(p jsonb)`, security invoker → RLS 적용). 성공 후 클라이언트는 `nomad-lab-v1`을 지우지 않고 보존 [추정: 되돌리기 대비].
- 로드 규칙 패리티: 파싱 실패·`lv`/`days` 없음이면 가져오기 대상 없음으로 처리(L632–636).

## 5. 비로그인 체험 (D6)
- 비로그인은 As-Is와 같이 localStorage `nomad-lab-v1`에만 저장, 카탈로그는 anon 읽기로 서버에서 받는다.
- 로그인 직후 `nomad-lab-v1`이 있고 `imported_v1_at`이 null이면 가져오기 제안([04_API](04_API.md) A01).
