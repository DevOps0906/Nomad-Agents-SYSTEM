# 02 아키텍처 — Nomad-Agents-SYSTEM

> 그림: [`diagrams/architecture.mmd`](diagrams/architecture.mmd) — 코드가 생기면 `deps2mmd`로 다시 생성
> 근거: `_research/DECISIONS.md`(D1·D3·D4·D5·D6·D9·D21–D24·D31–D42), `_research/SITE_FACTS.md`(1·4·5·7·8장). 사이트에 없는 것은 **[추정]**.
> 원칙(ADR-0002): 화면·디자인·문구는 아티팩트와 1:1. To-Be가 바꾸는 것은 **저장·인증·데이터 출처**뿐이다.

## 1. 구성 요소

### 1.1 As-Is (사이트에 있는 그대로)
| 요소 | 책임 | 기술 | 소유 경로 |
|---|---|---|---|
| 단일 HTML | 앱 셸(GNB·상단 바·서랍·토스트)·13화면·편집 모달 6종·라우터 전부 | HTML+CSS+바닐라 JS 1파일(1904줄), 빌드 없음 | `app/index.html` |
| 해시 라우터 | `location.hash` → `show(id)`, 첫 방문 때만 렌더, 없는 id는 home | 바닐라 JS (L1252–1278) | `app/index.html` |
| 상수 데이터 | SSR 단계·프롬프트(`window.__D`), ArtCraft 16종, 탐색기 노드 25·링크 26, 7일 계획 등 | 파일 내 JS 상수·JSON (L602, L1317–1368) | `app/index.html` |
| 3D 장면 | 홈 입자 구, 세컨드 브레인 탐색기(3D/2D) | three.js r128, GSAP 3.12.5 (CDN) | `app/index.html` L1300–1903 |
| 외부 CDN | 폰트·스크립트 로드. 없으면 애니메이션 생략·3D 폴백 | Google Fonts(Noto Sans KR·JetBrains Mono), cdnjs | 외부 |
| localStorage `nomad-lab-v1` | 사용자 상태 `st` 전부(lv·days·ck·start·ideas·content·skills·rt·exts·recent·notes·dayText) | 브라우저 저장소, `save()` | 브라우저 |
| localStorage `nomad-theme` | 테마 `dark`/`light` | 브라우저 저장소 | 브라우저 |
| localStorage `nomad-lbl` | 탐색기 라벨 스타일·크기 | 브라우저 저장소 | 브라우저 |
| 가이드 이미지 | SSR+ 13쪽, ArtCraft 4쪽 쪽 이미지 | 정적 JPG(파일 밖 상대 경로 `guide/`) | `app/guide/` [추정: 배포 위치] |
- 공백(SITE_FACTS 8): 인증·서버 통신·서버 저장·다중 사용자·테스트 없음.

### 1.2 To-Be (플랫폼)
| 요소 | 책임 | 기술 | 소유 경로 |
|---|---|---|---|
| Next.js 앱 `(app)` 그룹 | 13화면 + 모달 6종. 셸 레이아웃(GNB·상단 바·서랍) 1개 공유. 화면 ID S01–S13 → 경로 `/`, `/skill` … `/spec` [추정: 해시 → 경로, 옛 `#id`는 리다이렉트]. 화면 안 상태는 URL 파라미터(`/brain?node=c_s1`, `/guide?doc=ssr&page=3`), 3D 라우트를 떠나면 WebGL 컨텍스트 해제, S13 기기 미리보기 iframe은 같은 출처 `?preview=1`(예시 데이터만) + CSP `frame-ancestors 'self'` (D36) | Next.js 16 App Router·React 19·TS·Tailwind CSS v4 [추정, 착수 시 재확인] | `src/app/(app)/` [추정] |
| Next.js 앱 `(auth)` 그룹 | 이메일 매직링크 로그인, 콜백(세션 교환 후 가져오기 판단). 진입점은 상단 바 오른쪽 끝 로그인 버튼(테마 버튼 다음, 모든 구간), 로그인 후 같은 자리 계정 메뉴(이메일 · 이 기기 데이터 가져오기 · 두뇌 연동 토큰 · 내 플랜 · 로그아웃) (D23) | `@supabase/ssr` | `src/app/(auth)/` [추정] |
| Next.js 앱 `/admin` 그룹 (AD1~AD4 MVP-2, AD5 `/admin/codes`는 MVP-1, D41) | 관리자 화면 AD1 목록(`art_apps`·`prompts`·`guide_pages`만)·AD2 문구 편집·AD3 이미지 업로드·AD4 변경 이력·AD5 번들 코드. 나머지 카탈로그는 마이그레이션. 레이아웃에서 관리자 여부 확인, 아니면 404 (D21·D39, ADR-0005) | Server Actions + `@supabase/ssr`(사용자 세션, RLS로 권한 판정) | `src/app/admin/` [추정] |
| 두뇌 업로드 Route Handler | `nomad-brain` CLI·웹 직접 올리기가 보낸 `graph.json` zod·Content-Length로 먼저 거른 뒤 DB 함수에 넘긴다. CLI는 개인 액세스 토큰(Bearer, 권한 `brain:write`만, 해시 대조), 웹은 세션. 분당 6회·4MB·Pro 검사는 DB 함수가 기준(D29·D35). 경로·입출력은 `04_API.md` B절, 토큰·graph 테이블은 `05_DATA_MODEL.md` 참조 | Next.js Route Handler(Node 런타임) | `src/app/api/brain/` [추정] |
| 탈퇴 Route Handler | P1 "계정 삭제" → `/api/account/delete`가 세션 확인 후 `auth.admin.deleteUser`, cascade로 사용자 데이터 즉시 삭제(D27·D42). **서버 전용 키(service role)는 탈퇴·(이후) 결제 웹훅만** 사용, 브라우저·저장소 노출 금지 | Next.js Route Handler(Node 런타임), Vercel 서버 환경 변수 | `src/app/api/account/` [추정] |
| 토큰 관리(계정 메뉴) | 두뇌 연동 토큰 발급(원문은 1회만 표시)·목록·폐기 | Server Actions, 해시만 저장 | `src/features/account/` [추정] |
| 로컬 CLI `nomad-brain` | `nomad-brain sync`: 로컬 Markdown 폴더 스캔 → front-matter·제목·`[[위키링크]]`·Markdown 링크로 `graph.json` 생성(`.brainignore` 제외) → 토큰으로 업로드. 본문은 읽기만, 보내지 않음(이름·경로·분야, 요약은 front-matter `summary:`가 있을 때만). `--dry-run`으로 보낼 목록 미리보기, 토큰은 OS 키체인(없으면 `~/.config/nomad-brain/token` 0600) (D22·D37, ADR-0004) | Node.js(LTS) CLI, npm 배포 [추정] | `packages/nomad-brain/` [추정] |
| 웹 폴더 색인 | CLI 없는 대체 경로: 계정 메뉴에서 폴더 선택 → 브라우저가 CLI와 같은 규칙으로 색인해 graph.json 생성 → 세션 업로드(B05). 본문은 기기 밖으로 나가지 않음 (D37) | 브라우저 폴더 선택 API + TS 색인 모듈(CLI와 공유) [추정] | `src/features/account/` [추정] |
| 클라이언트 3D 모듈 | 홈 입자 구·탐색기. 동작·폴백은 As-Is와 동일 | three.js(최신) · GSAP 3, 클라이언트 전용 컴포넌트 | `src/features/brain/`, `src/features/home/` [추정] |
| 데이터 접근 계층 | 카탈로그 읽기, 사용자 데이터 읽기·쓰기. 비로그인=localStorage, 로그인=Supabase로 같은 인터페이스(W1에 localStorage 구현 먼저, 화면은 처음부터 이것만 씀, D32). 로그인 중 저장 실패·세션 만료·오프라인은 **localStorage로 떨어지지 않고** 메모리 대기열에 순서대로 쌓아 "저장하지 못했습니다 · 다시 시도" 표시, 세션 만료면 T1 후 재전송, 같은 항목 연속 변경은 마지막 값만 (D33) | TS 모듈 + Server Actions [추정] (가져오기는 Route Handler A01, `04_API.md`) | `src/lib/data/` [추정] |
| Supabase Auth | 매직링크 발송·세션. 사용자 식별 `auth.uid()` | Supabase Auth | Supabase |
| Supabase Postgres — 사용자 데이터 | `st` 필드 전부를 사용자별 행으로. RLS owner = `auth.uid()` | Postgres + RLS (테이블: `05_DATA_MODEL.md`) | `supabase/migrations/` |
| Supabase Postgres — 카탈로그 | SSR·ArtCraft·가이드 텍스트·7일 계획 기본값·체크리스트·팔레트·콘텐츠 시드·탐색기 노드·엣지. 읽기 공개, 수정은 관리자 화면에서만·모든 변경 감사 기록 (ADR-0003·0005, 테이블은 `05_DATA_MODEL.md`) | Postgres + RLS(select 공개) + 시드 SQL | `supabase/seed.sql` [추정] |
| Supabase Storage | 가이드 쪽 이미지 `ssr-01..13`, `art-1..4` · ArtCraft 앱 아이콘 16개(As-Is는 HTML 안 data URI) (공개 읽기 버킷, 쓰기는 관리자 AD3만) | Supabase Storage | 버킷 `guide`, `art-icons` [추정] |
| 브라우저 localStorage | 기기 설정 `nomad-theme`·`nomad-lbl` 유지(D5), 비로그인 체험 `nomad-lab-v1`, 가져오기용 기기 UUID(D33) | 브라우저 저장소 | 브라우저 |
| Vercel | 빌드·배포·프리뷰, 환경 변수(Supabase URL·anon key) | Vercel | 프로젝트 설정 |
- 넣지 않는 것: 별도 API 서버(FastAPI 등)·LLM 호출. 사이트에 서버 통신·AI 호출 근거가 없다(SITE_FACTS 8, D9 — 프롬프트는 복사만).
- 외부 링크(getartcraft.com·github.com/storytold)는 As-Is와 같이 새 탭 링크로만 둔다.

## 2. 경계 규칙 (누가 누구를 부르나)
| 호출자 | 대상 | 방법 | 금지 |
|---|---|---|---|
| 화면 컴포넌트(S01–S13, M1–M6) | 데이터 접근 계층 | 함수 호출(`getCatalog`·`getUserState`·`saveUserState` 류) [추정: 이름] | 화면에서 Supabase 클라이언트·localStorage 직접 호출 |
| 데이터 접근 계층(서버) | Supabase Postgres | `@supabase/ssr` 서버 클라이언트, 사용자 세션 쿠키 | service_role 키 사용(앱 런타임 금지, 예외는 탈퇴·(이후) 결제 웹훅 Route Handler만, D42) |
| 데이터 접근 계층(브라우저, 비로그인) | localStorage `nomad-lab-v1` | As-Is 로드 규칙(누락 키만 DEF로 보충) 그대로 | 로그인 상태에서 `nomad-lab-v1`에 쓰기(저장 실패 시 포함, D33) |
| 로그인 콜백 | 가져오기 처리(Route Handler A01, `04_API.md`) | 기기마다 1회: 가져올 항목 수 미리보기 → 기기 UUID와 함께 전송 → DB 함수가 병합(D33·D34) | 서버 데이터 덮어쓰기, 같은 기기 두 번 가져오기 |
| 3D 모듈 | 데이터 접근 계층(탐색기 graph) | 노드·엣지 배열을 props로 받음 | 3D 모듈이 직접 fetch·DB 접근 |
| 3D 모듈 | localStorage `nomad-lbl` | 직접 읽기·쓰기(기기 설정, D5) | 계정에 저장 |
| 셸 레이아웃 | localStorage `nomad-theme` | 직접 읽기·쓰기(D5) | 계정에 저장 |
| 가이드 화면 | Supabase Storage `guide` | 공개 URL `<img>` | 비공개 버킷·서명 URL [추정: 공개 자료] |
| `/admin` 화면(AD1–AD5, AD5는 MVP-1) | 카탈로그 테이블·Storage `guide`·`art-icons` | Server Action → 사용자 세션으로 쓰기, RLS가 관리자만 허용, 같은 트랜잭션에서 감사 행 기록(`04_API.md` AD절 참조). 초기 적재는 시드 SQL(ADR-0003) | 관리자 외 카탈로그 쓰기, 감사 기록 없는 변경, `(app)` 화면에서 카탈로그 쓰기 |
| 로컬 CLI `nomad-brain` | 두뇌 업로드 Route Handler | HTTPS + 개인 액세스 토큰(`brain:write`)만(`04_API.md` B절 참조) | CLI가 Supabase 직접 호출·세션 쿠키 사용, 토큰 원문 저장(서버는 해시만), **노트 본문 업로드** |
| 두뇌 업로드 Route Handler | 사용자 두뇌 graph 테이블 | rpc 호출 → DB 함수가 토큰 해시 대조·상한·Pro·레이트 리밋을 다시 검사하고 소유자 행만 교체. **보안 경계는 DB 함수**, Route Handler 검사는 편의 계층(D35) | 토큰으로 `brain:write` 외 작업, 요약 200자 초과·본문 필드 저장, 상한(D29) 초과 수용 |
| 데이터 접근 계층(탐색기·홈 입자 구) | 사용자 두뇌 graph / 카탈로그 노드·엣지 | 로그인+업로드 있음 → 내 두뇌, 그 외 → 예시 카탈로그(D22) | 다른 사용자 graph 읽기 |
| 화면 컴포넌트(비로그인) | 로그인 권유 시트(D24) | 개인 내용 클릭·두뇌 애니메이션 클릭·첫 localStorage 저장 등에서 바텀시트/모달("로그인"·"예시로 계속 보기"). "계속 보기" 후 같은 세션엔 두뇌 클릭만 다시 표시 | 권유로 체험 차단, 권유 없이 강제 이동 |
| 탈퇴 Route Handler | Supabase Auth Admin API | 세션 확인 후 서버 전용 service role 키로 `auth.admin.deleteUser`(`04_API.md` A04) | 다른 사용자 삭제, 키를 클라이언트·로그에 노출 |
| Vercel 빌드 | Supabase | 공개 키(URL·anon)만 환경 변수로 | 비밀 키를 `NEXT_PUBLIC_*`로 노출 |
- 보안 레벨 L2 [추정](D9). 민감 데이터: 이메일, 메모(`notes`·`dayText`)·아이디어 본문 → 모두 RLS 대상.

## 3. 주요 흐름
| # | 흐름 | 그림 | 요점 |
|---|---|---|---|
| 1 | 로그인·localStorage 가져오기 | [`diagrams/flow-1.mmd`](diagrams/flow-1.mmd) | 매직링크 → 콜백 → 이 기기 UUID가 `user_imports`에 없고 `nomad-lab-v1`이 있으면 T2에서 항목 수 미리보기 → 가져오기(병합)/건너뛰기 → 성공 시 로컬 키 보관 표시 [추정: 삭제 대신 표시] (D33·D34) |
| 2 | 화면 렌더(카탈로그+사용자 데이터) | [`diagrams/flow-2.mmd`](diagrams/flow-2.mmd) | 카탈로그는 서버에서 캐시 읽기, 사용자 데이터는 로그인=DB(RLS)·비로그인=localStorage. 변경은 As-Is `commit()`과 같은 순서로 저장 후 갱신 |
| 3 | 탐색기 graph 로딩 | [`diagrams/flow-3.mmd`](diagrams/flow-3.mmd) | 카탈로그 노드·엣지 → 3D 모듈 → 시드 고정 배치(700회) → WebGL 불가면 패널·검색만 동작(As-Is 폴백) |
| 4 | 두뇌 연동 | [`diagrams/flow-4.mmd`](diagrams/flow-4.mmd) | `nomad-brain sync`(`--dry-run` 미리보기) 폴더 스캔(`.brainignore` 제외) → 링크 추출 → `graph.json`(본문 없음) → 토큰 업로드 → DB 함수 검사(4MB·Pro·분당 6회)·교체 → 탐색기·홈 입자 구가 내 두뇌로. 대체 경로: 웹 폴더 선택 → 브라우저 색인 (ADR-0004, D37) |
| 5 | 관리자 카탈로그 편집 | [`diagrams/flow-5.mmd`](diagrams/flow-5.mmd) | `/admin` 진입(관리자 확인) → AD1 테이블 선택 → AD2 편집(이미지는 AD3 Storage) → 검증 → 쓰기 + 감사 기록 한 트랜잭션 → 카탈로그 캐시 무효화 → AD4 이력 (ADR-0005) |
- 이후(MVP 밖): 탐색기 편집, 루틴 실행·알림.
