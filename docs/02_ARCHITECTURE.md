# 02 아키텍처 — Nomad-Agents-SYSTEM

> 그림: [`diagrams/architecture.mmd`](diagrams/architecture.mmd) — 코드가 생기면 `deps2mmd`로 다시 생성
> 근거: `_research/DECISIONS.md`(D1·D3·D4·D5·D6·D9), `_research/SITE_FACTS.md`(1·4·5·7·8장). 사이트에 없는 것은 **[추정]**.
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
| Next.js 앱 `(app)` 그룹 | 13화면 + 모달 6종. 셸 레이아웃(GNB·상단 바·서랍) 1개 공유. 화면 ID S01–S13 → 경로 `/`, `/skill` … `/spec` [추정: 해시 → 경로, 옛 `#id`는 리다이렉트] | Next.js 16 App Router·React 19·TS·Tailwind CSS v4 [추정, 착수 시 재확인] | `src/app/(app)/` [추정] |
| Next.js 앱 `(auth)` 그룹 | 이메일 매직링크 로그인, 콜백(세션 교환 후 가져오기 판단) | `@supabase/ssr` | `src/app/(auth)/` [추정] |
| 클라이언트 3D 모듈 | 홈 입자 구·탐색기. 동작·폴백은 As-Is와 동일 | three.js(최신) · GSAP 3, 클라이언트 전용 컴포넌트 | `src/features/brain/`, `src/features/home/` [추정] |
| 데이터 접근 계층 | 카탈로그 읽기, 사용자 데이터 읽기·쓰기. 비로그인=localStorage, 로그인=Supabase로 같은 인터페이스 | TS 모듈 + Server Actions [추정] (가져오기는 Route Handler A01, `04_API.md`) | `src/lib/data/` [추정] |
| Supabase Auth | 매직링크 발송·세션. 사용자 식별 `auth.uid()` | Supabase Auth | Supabase |
| Supabase Postgres — 사용자 데이터 | `st` 필드 전부를 사용자별 행으로. RLS owner = `auth.uid()` | Postgres + RLS (테이블: `05_DATA_MODEL.md`) | `supabase/migrations/` |
| Supabase Postgres — 카탈로그 | SSR·ArtCraft·가이드 텍스트·7일 계획 기본값·체크리스트·팔레트·콘텐츠 시드·탐색기 노드·엣지. 읽기 전용, 수정은 admin (ADR-0003) | Postgres + RLS(select 공개) + 시드 SQL | `supabase/seed.sql` [추정] |
| Supabase Storage | 가이드 쪽 이미지 `ssr-01..13`, `art-1..4` · ArtCraft 앱 아이콘 16개(As-Is는 HTML 안 data URI) (공개 읽기 버킷) | Supabase Storage | 버킷 `guide`, `art-icons` [추정] |
| 브라우저 localStorage | 기기 설정 `nomad-theme`·`nomad-lbl` 유지(D5), 비로그인 체험 `nomad-lab-v1` | 브라우저 저장소 | 브라우저 |
| Vercel | 빌드·배포·프리뷰, 환경 변수(Supabase URL·anon key) | Vercel | 프로젝트 설정 |
- 넣지 않는 것: 별도 API 서버(FastAPI 등)·LLM 호출. 사이트에 서버 통신·AI 호출 근거가 없다(SITE_FACTS 8, D9 — 프롬프트는 복사만).
- 외부 링크(getartcraft.com·github.com/storytold)는 As-Is와 같이 새 탭 링크로만 둔다.

## 2. 경계 규칙 (누가 누구를 부르나)
| 호출자 | 대상 | 방법 | 금지 |
|---|---|---|---|
| 화면 컴포넌트(S01–S13, M1–M6) | 데이터 접근 계층 | 함수 호출(`getCatalog`·`getUserState`·`saveUserState` 류) [추정: 이름] | 화면에서 Supabase 클라이언트·localStorage 직접 호출 |
| 데이터 접근 계층(서버) | Supabase Postgres | `@supabase/ssr` 서버 클라이언트, 사용자 세션 쿠키 | service_role 키 사용(앱 런타임 전체 금지) |
| 데이터 접근 계층(브라우저, 비로그인) | localStorage `nomad-lab-v1` | As-Is 로드 규칙(누락 키만 DEF로 보충) 그대로 | 로그인 상태에서 `nomad-lab-v1`에 쓰기 |
| 로그인 콜백 | 가져오기 처리(Route Handler A01, `04_API.md`) | localStorage 값 1회 전송 → 검증 후 upsert | 서버 데이터가 이미 있으면 묻지 않고 덮어쓰기 |
| 3D 모듈 | 데이터 접근 계층(탐색기 graph) | 노드·엣지 배열을 props로 받음 | 3D 모듈이 직접 fetch·DB 접근 |
| 3D 모듈 | localStorage `nomad-lbl` | 직접 읽기·쓰기(기기 설정, D5) | 계정에 저장 |
| 셸 레이아웃 | localStorage `nomad-theme` | 직접 읽기·쓰기(D5) | 계정에 저장 |
| 가이드 화면 | Supabase Storage `guide` | 공개 URL `<img>` | 비공개 버킷·서명 URL [추정: 공개 자료] |
| 관리자(admin) | 카탈로그 테이블 | 시드 SQL·마이그레이션으로만 (Q3 미결) | 앱 화면에서 카탈로그 쓰기 |
| Vercel 빌드 | Supabase | 공개 키(URL·anon)만 환경 변수로 | 비밀 키를 `NEXT_PUBLIC_*`로 노출 |
- 보안 레벨 L2 [추정](D9). 민감 데이터: 이메일, 메모(`notes`·`dayText`)·아이디어 본문 → 모두 RLS 대상.

## 3. 주요 흐름
| # | 흐름 | 그림 | 요점 |
|---|---|---|---|
| 1 | 로그인·localStorage 가져오기 | [`diagrams/flow-1.mmd`](diagrams/flow-1.mmd) | 매직링크 → 콜백 → `imported_v1_at`이 null이고 `nomad-lab-v1`이 있으면 T2에서 확인 후 가져오기 → 성공 시 로컬 키 보관 표시 [추정: 삭제 대신 표시] |
| 2 | 화면 렌더(카탈로그+사용자 데이터) | [`diagrams/flow-2.mmd`](diagrams/flow-2.mmd) | 카탈로그는 서버에서 캐시 읽기, 사용자 데이터는 로그인=DB(RLS)·비로그인=localStorage. 변경은 As-Is `commit()`과 같은 순서로 저장 후 갱신 |
| 3 | 탐색기 graph 로딩 | [`diagrams/flow-3.mmd`](diagrams/flow-3.mmd) | 카탈로그 노드·엣지 → 3D 모듈 → 시드 고정 배치(700회) → WebGL 불가면 패널·검색만 동작(As-Is 폴백) |
- 이후(D6, MVP 밖): 실제 second-brain 폴더 → `graph.json` 업로드로 탐색기 데이터 교체(Q4 미결), 탐색기 편집, 루틴 실행·알림.
