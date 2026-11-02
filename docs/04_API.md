# 04 API — Nomad-Agents-SYSTEM

> 데이터 정의: [05_DATA_MODEL](05_DATA_MODEL.md) · 스키마 초안 [sql/0001_init.sql](sql/0001_init.sql) · [sql/0002_admin_brain.sql](sql/0002_admin_brain.sql)(관리자·두뇌 연동, D21·D22·D27·D29) · [sql/0003_plans.sql](sql/0003_plans.sql)(플랜) · [sql/0004_limits.sql](sql/0004_limits.sql)(입력 상한, D40). As-Is는 서버 통신이 전혀 없다(SITE_FACTS 8) — 아래는 모두 To-Be.

## 1. 호출 방식 구분
| 구분 | 언제 | 방식 | 권한 근거 |
|---|---|---|---|
| **직접**(D) | 단일 테이블 CRUD·카탈로그 조회 | `@supabase/ssr` 클라이언트 `from('<table>')` — 읽기는 서버 컴포넌트, 쓰기는 클라이언트 낙관적 갱신 [추정] | RLS(owner·is_admin) |
| **Route Handler**(R) | 검증·크기·레이트 리밋·여러 테이블 트랜잭션·인증 콜백·토큰 인증 | `app/api/**/route.ts` → 세션 쿠키로 사용자 클라이언트 생성 → `rpc()` | 세션 + RLS(service role 미사용) |
| 클라이언트 전용 | 서버 불필요 | 필터·검색·복사·탭·테마·라벨 옵션 | — |

- 경로 표기: D는 `테이블 · 동작`, R은 HTTP 경로. 오류 공통: 401(세션 없음 → 비로그인 체험으로 localStorage 동작), RLS 거부 = 빈 결과 또는 42501. 로그인 중 저장 실패·세션 만료는 localStorage로 떨어지지 않고 메모리 대기열에서 재시도한다(D33, [02 §데이터 계층](02_ARCHITECTURE.md)).
- **보안 경계는 DB 함수다**(D35): 크기·개수·형식·레이트 리밋·권한은 DB 함수·정책·제약이 다시 검사한다(rpc·REST 직접 호출로 Route Handler를 건너뛸 수 있음). Route Handler 검사(zod·Content-Length)는 빠른 거절을 위한 편의 계층이다.
- 오류 형식: 함수가 `raise`하면 PostgREST가 SQLSTATE로 HTTP를 정한다(`PT400`→400 · `PT401`→401 · `PT402`→402 · `PT403`→403 · `PT413`→413 · `PT429`→429). 카운터 증가를 확정해야 하는 함수(`_brain_apply` 세이브포인트 뒤·`redeem_bundle_code`)는 예외 대신 **200 + jsonb `{error, code}`**를 돌려준다 → 클라이언트·Route Handler는 `error` 키를 먼저 보고 `code`대로 HTTP·문구를 정한다(코드가 PT 형식이 아니면 400).
- 사용자 입력 상한(D40, `0004`): 텍스트 길이 위반 23514 → 400, 사용자당 행 수 초과 `PT413` → 413("더 추가할 수 없습니다").
- 비로그인: 사용자 데이터 D 호출 대신 localStorage `nomad-lab-v1`(As-Is 그대로), 카탈로그는 anon 읽기.

## 2. 엔드포인트
| ID | 메서드 | 경로 | 입력 | 출력 | 권한 | 오류 |
|---|---|---|---|---|---|---|
| A01 | POST (R) | `/api/import/nomad-v1` | body: `{st, device}` — `st` = localStorage 원문, `device` = 기기 localStorage의 무작위 UUID → rpc `import_nomad_v1(p, p_device)` | 200 `{device, imported_at}` | 로그인 | 400 형식 위반(zod), 409 **이 기기는 이미 가져옴**(`user_imports` PK 위반 23505 — 다른 기기는 각각 1회 가능, D33), 413 256KB 초과(`PT413`, DB에서 재검사) |
| A02 | GET (R) | `/auth/callback` | `?code=` (매직링크) | 302 → 원래 경로(허용 목록 안에서만) | 공개 | 400 코드 만료 → 로그인 화면 |
| A03 | — (D) | Supabase Auth `signInWithOtp({email})` | email | 메일 발송 | 공개 | 429 발송 제한(D29: 같은 이메일 60초 1회·시간당 5회, IP당 시간당 30회) → "잠시 후 다시" 안내 |
| A04 | POST (R) | `/api/account/delete` | — (P1 위험 구역 재확인 입력은 화면에서) | 204, 세션 쿠키 삭제 | 로그인(세션 필요). 서버 전용 service role 키로 `auth.admin.deleteUser(auth.uid())` → cascade로 사용자 데이터 즉시 삭제(D27·D42) | 401 세션 없음 |
| C01 | select (D) | `ssr_stages`·`ssr_personas`·`ssr_levels`·`prompts` | stage key | 단계 머리·페르소나 3·레벨 3(blocks)·프롬프트 | anon | — |
| C02 | select (D) | `art_apps` (+`prompts` key `art_*`·`ai_*`) | category 필터는 클라이언트 | 16행 sort_order순(icon_path → Storage `art-icons` 공개 URL). `ai_*`는 무료 3개 앱(filmcraft·vectorcraft·designcraft)만, 나머지는 Pro일 때만 행이 온다(D31) | anon(`ai_*` 13개는 `my_has_pro()`) | Pro 아닌데 없는 `ai_*` → 빈 결과(화면은 "Pro에서 열림") |
| C03 | select (D) | `guide_docs`·`guide_pages` | doc_key | 쪽 목록(image_path, body_text) | anon | 이미지 404 → 대체 문구 [추정] |
| C04 | select (D) | `plan_day_defaults`·`ssr_checklist_items` | — | 7행·4행 | anon | — |
| C05 | select (D) | `brand_colors` | — | 5행 | anon | — |
| C06 | select (D) | `brain_nodes`·`brain_links` | — | 25노드·26링크(실제 개수). 비로그인·두뇌 미연동 사용자의 예시 그래프 | anon | — |
| C07 | select (D) | `content_seeds` | — | 8행(비로그인 보드 초기값) | anon | — |
| U01 | select (D) | `user_settings`·`level_progress`·`plan_days`·`checklist_progress` | — | 진행 상태 일괄 | 본인 | — |
| U02 | upsert (D) | `level_progress` | stage_key, level_index, done | 행 | 본인 | FK 위반 409 |
| U03 | upsert (D) | `plan_days` | day_index, done \| custom_text(null=기본값으로) | 행 | 본인 | — |
| U04 | upsert (D) | `checklist_progress` | item_index, done | 행 | 본인 | — |
| U05 | update (D) | `user_settings` | plan_start | 행 | 본인 | — |
| U06 | select/insert/update/delete (D) | `skills` | name(필수)·command·frequency | 행 | 본인 | check 위반(이름 공백) 400 |
| U07 | select/insert/update/delete (D) | `routines` | name(필수)·schedule_text·skill_command·enabled | 행 | 본인 | 동일 |
| U08 | select/insert/update/delete (D) | `user_extensions` | name(필수)·kind_desc·connected | 행 | 본인 | 동일 |
| U09 | select/insert/update/delete (D) | `recent_files` | name(필수)·file_type·brain_node_id·when_label, 신규 sort_order=최솟값−1 | 행 | 본인 | — (`brain_node_id`는 FK 없음, 없는 노드는 화면에서 "연결 없음", D37) |
| U10 | select/upsert/delete (D) | `date_notes` | note_date, body(빈 값이면 delete) | 행 | 본인 | — |
| U11 | select/insert/update/delete (D) | `ideas` | body(필수)·category·score 0–3; select는 score desc | 행 | 본인 | check 위반 400 |
| U12 | select/insert/update/delete (D) | `content_items` | title(필수)·channel·stage 0–3, 신규는 맨 앞 | 행 | 본인 | check 위반 400 |

### 2.1 관리자 화면 `/admin` (D21, AD1–AD4 MVP-2 · D39, AD5 MVP-1 · D41) — 화면 AD1–AD5
- MVP-2 편집 범위는 `art_apps`·`prompts`·`guide_pages` 문구 + 이미지(AD04) + 이력(AD05). 코드(AD06·AD07, `/admin/codes`)는 MVP-1(D41). 나머지 카탈로그 테이블은 마이그레이션으로만 고친다(D39).

| ID | 메서드 | 경로 | 입력 | 출력 | 권한 | 오류 |
|---|---|---|---|---|---|---|
| AD01 | select (D) | `admins` (본인 행) | — | 1행이면 관리자 | 로그인 | 0행 → `/admin` 접근 시 404 처리(미들웨어 가드, 존재를 드러내지 않음). MVP-1부터(`/admin/codes`, D41) |
| AD02 | select (D) | 편집 대상 3테이블(`art_apps`·`prompts`·`guide_pages`) 중 선택 | table, 검색어(키·이름 `ilike`, 300ms 지연), 정렬(sort_order·PK), range 50행 | 행 목록(AD1) | admin(읽기는 공개 RLS) | — |
| AD03 | insert/update/delete (D) | 편집 대상 3테이블 | 행(테이블별 zod 스키마, `ssr_levels.blocks`는 블록 타입 검증) | 행 | admin(`is_admin()`) | 42501 비관리자, 23505 PK 중복 409, 23503 참조 중 삭제 409, 23514 check 400. 성공 시 `catalog_audit` 자동 기록 |
| AD04 | upload/remove (D) | Storage `art-icons`·`guide` `upload(path, file, {upsert:true})` | png·webp(guide는 jpeg도), 2MB 이하(재량) | 경로 → AD03으로 `icon_path`·`image_path` 갱신 | admin(storage 정책 `is_admin()`) | 413 크기, 415 형식, 403 비관리자 |
| AD05 | select (D) | `catalog_audit` | table_name·기간 필터, 검색어(row_key `ilike`), `created_at desc`, range 50행 | op·row_key·old_row/new_row(차이는 클라이언트 표시)·actor_id·시각(AD4) | admin | 비관리자 = 빈 결과 |
| AD06 | rpc (D) | `bundle_code_create(p_label, p_months, p_max_uses, p_expires_at)` | 이름·1–12개월·횟수·만료일 | 평문 코드 20자리 16진(80비트, 이 응답에서 1회만) | 관리자 | 403 비관리자 |
| AD06b | rpc (D) | `bundle_codes_create_batch(p_label, p_months, p_count, p_expires_at)` | 이름·개월·개수 1–500·만료일 | 평문 코드 목록(각 max_uses=1, 수강생 1인 1코드, 이 응답에서 1회만 → CSV 내려받기) | 관리자 | 403 비관리자, 400 개수 범위 밖(`PT400`) |
| AD07 | rpc (D) | `bundle_code_revoke(p_id)` | id | 204(`revoked_at` 기록, 이후 사용 시 P01 "invalid code") | 관리자 | 403 비관리자 |
- `bundle_codes`는 쓰기 정책이 없어 발급·폐기·사용 수 증가는 위 함수로만 하고, 모든 변경은 `catalog_audit`에 남는다(D38).

### 2.2 second-brain 연동 (D22·D29)
| ID | 메서드 | 경로 | 입력 | 출력 | 권한 | 오류 |
|---|---|---|---|---|---|---|
| B01 | rpc (D) | `brain_token_create(p_name)` | name 1–60자 | 평문 토큰 `nbt_…`(이 응답에서 1회만 표시, 서버는 sha256만 저장) | 로그인 | 409 활성 토큰 5개(재량) 초과 |
| B02 | select (D) | `api_tokens` | — | name·token_prefix·created_at·last_used_at·revoked_at | 본인 | — |
| B03 | rpc (D) | `brain_token_revoke(p_id)` | id | 204 | 본인 | 404 없음·이미 폐기 |
| B04 | POST (R) | `/api/brain/sync` | 헤더 `Authorization: Bearer nbt_…`, body graph.json(2.3) | 200 `{nodes, links, synced_at}` | 토큰(`brain:write`). 세션 없이 anon으로 rpc `brain_sync_by_token` 호출 | 401 토큰 없음·폐기·불일치(`PT401`), 400 zod 위반(본문 필드 포함 시도 포함)·DB 형식 재검사(`PT400`), 402 Pro 아님(`PT402`), 413 4MB 초과(Content-Length 선검사 + 읽기 중 상한, DB도 4MB 재검사 → `PT400`), 429 분당 6회 초과(`PT429`, `Retry-After`), 200+`{error, code}` 카운터 증가 뒤 적용 실패 → 400 |
| B05 | POST (R) | `/api/brain/upload` | 웹에서 고른 graph.json(대체 경로) | B04와 같음 | 로그인 세션 → rpc `brain_sync_web` | B04와 같음(401은 세션 없음) |
| B06 | select (D) | `brain_sources` + `user_brain_nodes` + `user_brain_links` | — | 상태(method·개수·last_synced_at) + 내 그래프 | 본인 | `node_count = 0` 또는 행 없음 → 예시 카탈로그 C06으로 표시 |
| B07 | rpc (D) | `brain_disconnect()` | — | 204, 이후 C06 표시 | 본인 | — |

- CLI: `nomad-brain sync [폴더] --token $NOMAD_BRAIN_TOKEN` → `.brainignore` 제외 → graph.json 생성 → B04. 본문은 CLI 밖으로 나가지 않는다.
- B04·B05는 같은 zod 스키마를 공유한다. 알 수 없는 키는 거부(`.strict()`) → `body`·`content` 같은 본문 필드가 섞이면 400.
- 레이트 리밋 상태는 `brain_sources.rate_window_*`(사용자 단위, 토큰 여러 개여도 합산). DB 함수가 SQLSTATE `PT429`로 거부 → PostgREST가 429로 돌려준다. 카운터 증가 뒤 작업은 세이브포인트로 감싸 실패해도 카운터는 확정되고, 실패는 jsonb `{error, code}`로 온다(D35).
- 4MB 상한은 Vercel 함수 요청 본문 한도 4.5MB 아래로 잡은 값이다(D35). Pro가 끝나면 내 그래프(B06)는 읽기 전용으로 남고 B04·B05만 402로 막힌다(D37).

### 2.3 graph.json 스키마 (version 1)
| 위치 | 필드 | 타입·제약 | 설명 |
|---|---|---|---|
| 최상위 | `version` | `1` 고정 | 형식 버전 |
| 최상위 | `generator` | string ≤60, 선택 | 예: `nomad-brain@0.1.0`, 웹 직접 작성 시 생략 |
| 최상위 | `generated_at` | ISO 8601, 선택 | 생성 시각(표시용) |
| 최상위 | `nodes` | 배열 1–5,000(재량) | 아래 노드 |
| 최상위 | `links` | 배열 0–20,000(재량) | 아래 링크 |
| 노드 | `id` | string 1–200, 배열 안에서 고유 | 폴더 기준 상대 경로에서 만든 안정 id(경로가 같으면 같은 id) |
| 노드 | `kind` | `folder`·`note`·`agent`·`rule`·`index`·`source` | front-matter `kind` 우선, 없으면 폴더=folder·파일=note |
| 노드 | `domain` | string 1–40, 선택(기본 `root`) | front-matter `domain` 또는 최상위 폴더명. 탐색기 색 구분 |
| 노드 | `parent` | 노드 id \| null | 포함 폴더. 목록에 없으면 최상위로 처리 |
| 노드 | `name` | string 1–200 | front-matter `title` → 첫 `# 제목` → 파일명 |
| 노드 | `path` | string 1–512, `/`로 시작·`..` 금지 | 폴더 기준 상대 경로 |
| 노드 | `summary` | string ≤200, 선택 | front-matter `summary`/`description`. 본문 발췌 금지 |
| 링크 | `source` | 노드 id | 링크가 적힌 노트 |
| 링크 | `target` | 노드 id | `[[위키링크]]`·Markdown 상대 링크 대상. 없는 노드·자기 자신은 버림 |

### 2.4 플랜 (D19·D30, [`0003`](sql/0003_plans.sql))
| ID | 메서드 | 경로 | 입력 | 출력 | 권한 | 오류 |
|---|---|---|---|---|---|---|
| P01 | rpc (D) | `redeem_bundle_code(p_code)` | 코드 20자리(대소문자·앞뒤 공백 무시) | `my_plan()` 결과 | 로그인 | 200 + `{error:"invalid code", code:"PT400"}`(없음·만료·소진·폐기·재사용 구분 안 함, 실패 횟수는 확정), 429 실패 시간당 10회 초과(`PT429`, `redeem_attempts`), 401(`PT401`) |
| P02 | rpc (D) | `my_plan()` | — | `{pro, ends_at, trial_used}` | 로그인 | — |
- Pro 게이트는 DB에서(D31): 두뇌 업로드(B04·B05)는 `_brain_apply`가 `has_pro`로 막고(PT402), `prompts`의 `ai_*`는 정책 `prompts_read_free`(무료 3개 앱)·`prompts_read_pro`(`my_has_pro()`)로 나뉜다. 화면에서 숨기는 것만으로는 REST로 다 읽히므로 화면 표시는 보조다. `art_multi` 묶음 프롬프트는 읽을 수 있는 `ai_*`만으로 조합한다.

## 3. 사이트 동작 → API 대응
| 화면·모달 | 사이트 동작 (SITE_FACTS 2, 4.3) | API |
|---|---|---|
| 공통 | 기기마다 첫 로그인 시 `nomad-lab-v1` 병합 가져오기(D6·D33·D34) | A01 |
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
| S03 brain | 탐색기 렌더·검색·선택·3D/2D | B06(내 두뇌), 없으면 C06 + 클라이언트 |
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
| 공통 계정 메뉴(D23) | 두뇌 연동 토큰 발급·목록·폐기 / graph.json 올리기 / 연동 해제 | B01·B02·B03 / B05 / B07 |
| 로컬 CLI | `nomad-brain sync` | B04 |
| AD1 카탈로그 목록 | 테이블 선택·행 목록 | AD01 가드, AD02 |
| AD2 항목 편집 | 추가·수정·삭제 | AD03 |
| AD3 이미지 업로드 | 아이콘·가이드 쪽 이미지 교체 | AD04 → AD03 |
| AD4 변경 이력 | 테이블·기간 필터 | AD05 |
| P1 내 플랜 | 상태 확인·코드 적용 | P02, P01 |
| P1 내 플랜 | 위험 구역 "계정 삭제"(재확인 입력, D42) | A04 |
| AD5 번들 코드 발급 | 발급·일괄 발급·폐기·사용 현황 | AD06·AD06b·AD07, `bundle_codes` select |

## 4. 결정 메모
- Route Handler는 A01·A02·A04·B04·B05. 나머지는 RLS·security definer rpc로 충분해 직접 호출(왕복 1회, 서버 코드 최소).
- 매직링크 제한(D29): 60초 1회·IP 30회/시간은 Supabase Auth 레이트 리밋 설정(`config.toml [auth.rate_limit]`·대시보드)으로, 이메일당 시간당 5회는 기본값에 없어 Send Email Hook 또는 A03 앞 R 래퍼 중 구현 단계에서 택1 [추정].
- B04는 세션이 없으므로 anon 키로 `brain_sync_by_token`을 호출한다. 함수가 토큰 해시로 사용자를 찾고 그 사용자 행만 바꾼다(service role 불필요). 토큰 평문은 로그에 남기지 않는다.
- A01은 `import_nomad_v1(p, p_device)` rpc를 사용자 세션으로 호출한다(함수는 `auth.uid()` 본인 행만 쓴다). 병합 규칙(D34): 진행 체크는 합집합, start·dayText는 서버가 기본값일 때만 로컬 값, 목록·메모는 같은 이름·날짜가 없을 때만 추가. service role 키는 앱에 두지 않는다(예외: 서버 전용 키로 A04 탈퇴·(이후) 결제 웹훅만, D42).
- 타입: `supabase gen types` 결과를 쓰고 손으로 고치지 않는다.
