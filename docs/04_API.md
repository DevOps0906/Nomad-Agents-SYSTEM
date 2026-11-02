# 04 API — Nomad-Agents-SYSTEM

> 데이터 정의: [05_DATA_MODEL](05_DATA_MODEL.md) · 스키마 초안 [sql/0001_init.sql](sql/0001_init.sql). As-Is는 서버 통신이 전혀 없다(SITE_FACTS 8) — 아래는 모두 To-Be.

## 1. 호출 방식 구분
| 구분 | 언제 | 방식 | 권한 근거 |
|---|---|---|---|
| **직접**(D) | 단일 테이블 CRUD·카탈로그 조회 | `@supabase/ssr` 클라이언트 `from('<table>')` — 읽기는 서버 컴포넌트, 쓰기는 클라이언트 낙관적 갱신 [추정] | RLS(owner·is_admin) |
| **Route Handler**(R) | 검증·여러 테이블 트랜잭션·인증 콜백 | `app/api/**/route.ts` → 세션 쿠키로 사용자 클라이언트 생성 → `rpc()` | 세션 + RLS(service role 미사용) |
| 클라이언트 전용 | 서버 불필요 | 필터·검색·복사·탭·테마·라벨 옵션 | — |

- 경로 표기: D는 `테이블 · 동작`, R은 HTTP 경로. 오류 공통: 401(세션 없음 → 비로그인 체험으로 localStorage 동작), RLS 거부 = 빈 결과 또는 42501.
- 비로그인: 사용자 데이터 D 호출 대신 localStorage `nomad-lab-v1`(As-Is 그대로), 카탈로그는 anon 읽기.

## 2. 엔드포인트
| ID | 메서드 | 경로 | 입력 | 출력 | 권한 | 오류 |
|---|---|---|---|---|---|---|
| A01 | POST (R) | `/api/import/nomad-v1` | body: `st` JSON(localStorage 원문) | 200 `{imported: {ideas,content,…건수}}` | 로그인 | 400 형식·상한 위반(zod), 409 이미 가져옴(`imported_v1_at`), 413 크기 초과 [추정 256KB] |
| A02 | GET (R) | `/auth/callback` | `?code=` (매직링크) | 302 → 원래 경로(허용 목록 안에서만) | 공개 | 400 코드 만료 → 로그인 화면 |
| A03 | — (D) | Supabase Auth `signInWithOtp({email})` | email | 메일 발송 | 공개 | 429 발송 제한 |
| C01 | select (D) | `ssr_stages`·`ssr_personas`·`ssr_levels`·`prompts` | stage key | 단계 머리·페르소나 3·레벨 3(blocks)·프롬프트 | anon | — |
| C02 | select (D) | `art_apps` (+`prompts` key `art_*`·`ai_*`) | category 필터는 클라이언트 | 16행 sort_order순(icon_path → Storage `art-icons` 공개 URL) | anon | — |
| C03 | select (D) | `guide_docs`·`guide_pages` | doc_key | 쪽 목록(image_path, body_text) | anon | 이미지 404 → 대체 문구 [추정] |
| C04 | select (D) | `plan_day_defaults`·`ssr_checklist_items` | — | 7행·4행 | anon | — |
| C05 | select (D) | `brand_colors` | — | 5행 | anon | — |
| C06 | select (D) | `brain_nodes`·`brain_links` | — | 25노드·26링크(실제 개수) | anon | — |
| C07 | select (D) | `content_seeds` | — | 8행(비로그인 보드 초기값) | anon | — |
| U01 | select (D) | `user_settings`·`level_progress`·`plan_days`·`checklist_progress` | — | 진행 상태 일괄 | 본인 | — |
| U02 | upsert (D) | `level_progress` | stage_key, level_index, done | 행 | 본인 | FK 위반 409 |
| U03 | upsert (D) | `plan_days` | day_index, done \| custom_text(null=기본값으로) | 행 | 본인 | — |
| U04 | upsert (D) | `checklist_progress` | item_index, done | 행 | 본인 | — |
| U05 | update (D) | `user_settings` | plan_start | 행 | 본인 | — |
| U06 | select/insert/update/delete (D) | `skills` | name(필수)·command·frequency | 행 | 본인 | check 위반(이름 공백) 400 |
| U07 | select/insert/update/delete (D) | `routines` | name(필수)·schedule_text·skill_command·enabled | 행 | 본인 | 동일 |
| U08 | select/insert/update/delete (D) | `user_extensions` | name(필수)·kind_desc·connected | 행 | 본인 | 동일 |
| U09 | select/insert/update/delete (D) | `recent_files` | name(필수)·file_type·brain_node_id·when_label, 신규 sort_order=최솟값−1 | 행 | 본인 | 없는 노드 FK 409 |
| U10 | select/upsert/delete (D) | `date_notes` | note_date, body(빈 값이면 delete) | 행 | 본인 | — |
| U11 | select/insert/update/delete (D) | `ideas` | body(필수)·category·score 0–3; select는 score desc | 행 | 본인 | check 위반 400 |
| U12 | select/insert/update/delete (D) | `content_items` | title(필수)·channel·stage 0–3, 신규는 맨 앞 | 행 | 본인 | check 위반 400 |
| X01 | insert/update/delete (D) | 카탈로그 13테이블 | 행 | 행 | admin(`is_admin()`) | 42501 비관리자. 편집 화면 여부는 Q3 |

## 3. 사이트 동작 → API 대응
| 화면·모달 | 사이트 동작 (SITE_FACTS 2, 4.3) | API |
|---|---|---|
| 공통 | 첫 로그인 시 `nomad-lab-v1` 가져오기(D6) | A01 |
| 공통 | 로그인(매직링크) | A03 → A02 |
| 공통 | 테마·라벨 옵션 | 클라이언트(localStorage, D5) |
| S01 홈 | 캘린더(시작일~+6·완료·메모 표시), 진행 링·통계 4칸 | U01, U10, U11·U12 count, C06 count |
| S01 홈 | 오늘의 목표 체크 / Node.js 프롬프트 복사 | U03 / C01(prompts `node`) |
| S01 홈 | 최근 파일 열기→탐색기, 구 클릭→탐색기 | 클라이언트(`__brainSelect`) |
| S01 홈 | 루틴 토글 | U07 update enabled |
| M1 skill | 추가·편집·삭제 | U06 |
| M2 rt | 추가·편집·삭제 | U07 |
| M3 ext | 추가·편집·삭제 | U08 |
| M4 recent | 추가(맨 앞)·편집·삭제, 노드 select | U09, 노드 목록 C06 |
| M5 day | 문구·상태 편집, "기본값으로" | U03(custom_text null) |
| M6 date | 메모 저장(빈 값=삭제), "이 날짜부터 시작" | U10, U05 |
| S02–S05 SSR+ | 탭 전환, 첫 미완료 레벨 진입, 프롬프트 복사 | C01, U01 |
| S02–S05 SSR+ | "이 레벨 완료" 체크 | U02 |
| S02–S05 SSR+ | "가이드 p.N 보기" | 클라이언트 → S11 |
| S03 brain | 탐색기 렌더·검색·선택·3D/2D | C06 + 클라이언트 |
| S06 brand | 팔레트 표시, HEX 복사 | C05 + 클라이언트 |
| S07 content | 보드 표시·채널 필터 | U12 select(비로그인 C07), 필터 클라이언트 |
| S07 content | 추가 / 단계 select 이동 / × 삭제 | U12 insert / update stage / delete |
| S08 ideas | 추가 / 별점(같은 값 재클릭=0) / 삭제 | U11 insert / update score / delete |
| S08 ideas | 검증 프롬프트 복사(`leanPrompt`) | 클라이언트 생성 |
| S09 artcraft | 분류 필터·카드→S10·프롬프트 복사 | C02 + 클라이언트 |
| S10 artapps | 앱 펼치기, 설치 프롬프트 `ai_<id>` 복사 | C02 |
| S11 guide | 문서 전환·쪽 이동·검색(ssr 13쪽)·텍스트 복사 | C03, 검색은 클라이언트(body_text 13건) |
| S12 plan | 일차 체크·편집 / "시작일을 오늘로" / 체크리스트 | U03 / U05 / U04, 기본 문구 C04 |
| S13 spec | 기기 미리보기·화면 select | 클라이언트(정적) |

## 4. 결정 메모
- Route Handler는 A01·A02뿐. 나머지는 RLS로 충분해 직접 호출(왕복 1회, 서버 코드 최소) [추정: 레이트 리밋 필요 시 R로 이동].
- A01은 `import_nomad_v1` rpc를 사용자 세션으로 호출해 RLS를 그대로 적용한다. service role 키는 앱에 두지 않는다.
- 타입: `supabase gen types` 결과를 쓰고 손으로 고치지 않는다.
