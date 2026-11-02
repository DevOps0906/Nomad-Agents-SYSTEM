# Nomad-Agents-SYSTEM

Nomad-Lab AI 업무 시스템 — **SSR+** (Skill · Second brain · Routine · Extension) 대시보드.
영상 「3Me5BJgsG7E」의 SSR+ 프레임워크를 화면으로 옮긴 단일 파일 웹앱이며, PDF 가이드 2종(SSR+ 13쪽, ArtCraft 4쪽)을 앱 안의 사용 가이드로 담았습니다.

## 빠르게 보기
- `app/index.html`을 브라우저로 열면 바로 실행됩니다. (three.js r128, GSAP 3.12.5, Google Fonts는 CDN)
- `app/guide/`의 PDF 쪽 이미지(ssr-01~13.jpg, art-1~4.jpg)를 같은 폴더에서 불러옵니다.
- 데이터는 예시이며 서버가 없습니다. 모든 입력은 브라우저 localStorage에 저장됩니다.
- `app/index.html`에는 `<meta charset>`이 없습니다(Claude 아티팩트 게시 때 래퍼가 붙임). 로컬에서는 UTF-8을 알려 주는 서버로 여세요(예: Python `http.server`에서 `.html`을 `text/html; charset=utf-8`로). 그렇지 않으면 한글이 깨질 수 있습니다.

## 진행 현황 (2026-11-03 기준)
단일 파일 시안(아티팩트 정본)은 완성됐고, 이를 Next.js + Supabase 플랫폼으로 옮기는 **역기획 문서 세트**를 작성했습니다. 플랫폼 구현은 아직 시작 전입니다.

| 영역 | 현재 상태 |
|---|---|
| 시안 사이트 (`app/index.html`) | 완료 — 13화면, 3D 2종, 반응형 3구간, localStorage 저장 |
| 플랫폼 기획 (`docs/`) | 초안 완료 — LEAN·PRD·아키텍처·화면·API·데이터·작업 분해·ADR 3, 문서 리뷰 반영 |
| 플랫폼 구현 | 시작 전 — W0 게이트(미결 Q1~Q4, 제3자 이미지 사용 허락) 대기 |

제한: 시안은 서버·로그인이 없고 데이터가 브라우저에만 남습니다. 기획의 [추정] 항목(가격, 성공 지표 목표치, 일부 설계)은 확정 전입니다.

### 작업 진행률
근거: [`docs/06_AGENT_PLAN.md`](docs/06_AGENT_PLAN.md)의 작업 개수(완료/전체).

| 웨이브 | 내용 | 완료/전체 |
|---|---|---|
| 기획 | 역기획 문서 세트 | 1/1 |
| W0 | 착수 전 게이트 | 0/1 |
| W1 | 뼈대·보안·마이그레이션·셸 | 0/4 |
| W2 | 카탈로그 시드·Storage | 0/2 |
| W3 | 13화면 패리티 | 0/5 |
| W4 | 로그인·서버 저장·가져오기 | 0/4 |
| W5 | 패리티 검수·배포 | 0/2 |

### 구현된 주요 항목
- [x] 시안 13화면(홈·SSR+ 4단계·브랜드·콘텐츠·아이디어·ArtCraft 2화면·가이드·7일 계획·기획 요약)
- [x] 홈 입자 구 3D, 세컨드 브레인 3D 탐색기
- [x] ArtCraft 앱 16종 카드(런처 아이콘)·상세 가이드·설치 프롬프트
- [x] 플랫폼 역기획 문서 세트(`docs/`)

### 다음 개발 단계
- [ ] W0: 요금제·첫 고객·카탈로그 편집 방식·second-brain 연동 방식 결정, 아이콘·가이드 이미지 사용 허락 확인
- [ ] W1: Next.js 뼈대·토큰 이식, Supabase 마이그레이션(RLS), 공통 셸
- [ ] W2~W3: 카탈로그 시드 후 13화면 패리티 구현
- [ ] W4~W5: 로그인·서버 저장·가져오기, 패리티 검수, 배포

## 콘텐츠 바로가기
| 콘텐츠 | 화면 경로 | 기획·명세 문서 | 구현 코드 |
|---|---|---|---|
| 기획 목차 | — | [`docs/PLAN.md`](docs/PLAN.md) | — |
| 홈 대시보드 | `#home` | [`docs/03_SCREENS_UX.md`](docs/03_SCREENS_UX.md) S01 | [`src/body.html`](src/body.html), [`src/app.js`](src/app.js), [`src/home3d.js`](src/home3d.js) |
| SSR+ 4단계·3D 탐색기 | `#skill` `#brain` `#routine` `#ext` | [`docs/03_SCREENS_UX.md`](docs/03_SCREENS_UX.md) S02~S05 | [`src/app.js`](src/app.js), [`src/explorer.js`](src/explorer.js), [`src/prompts.json`](src/prompts.json) |
| 브랜드·콘텐츠·아이디어 | `#brand` `#content` `#ideas` | [`docs/03_SCREENS_UX.md`](docs/03_SCREENS_UX.md) S06~S08 | [`src/app.js`](src/app.js) |
| ArtCraft 앱 16종 | `#artcraft` `#artapps` | [`docs/03_SCREENS_UX.md`](docs/03_SCREENS_UX.md) S09·S10 | [`src/app.js`](src/app.js), [`src/style.css`](src/style.css) |
| 사용 가이드(PDF 17쪽) | `#guide` | [`docs/03_SCREENS_UX.md`](docs/03_SCREENS_UX.md) S11 | [`app/guide/`](app/guide/), [`src/pages.json`](src/pages.json) |
| 7일 계획·기획 요약 | `#plan` `#spec` | [`docs/03_SCREENS_UX.md`](docs/03_SCREENS_UX.md) S12·S13 | [`src/app.js`](src/app.js) |
| 데이터·API (플랫폼) | — | [`docs/05_DATA_MODEL.md`](docs/05_DATA_MODEL.md), [`docs/04_API.md`](docs/04_API.md), [`docs/sql/0001_init.sql`](docs/sql/0001_init.sql) | — |
| 디자인 | — | [`docs/DESIGN.md`](docs/DESIGN.md) | [`src/style.css`](src/style.css) |

## 저장소 구조
| 경로 | 내용 |
|---|---|
| `app/index.html` | 빌드 결과(단일 파일 앱) |
| `app/guide/` | PDF 가이드 쪽 이미지 |
| `src/style.css` | 디자인 토큰·레이아웃·반응형·라벨 스타일 |
| `src/body.html` | GNB·상단 바·홈 화면 정적 마크업 |
| `src/app.js` | 데이터·렌더러·편집 모달·라우터·가이드 뷰어·기기 미리보기·ArtCraft 앱 16종 데이터와 설치 프롬프트 생성 |
| `src/home3d.js` | 홈의 입자 구 3D 장면(드래그 회전) |
| `src/explorer.js` | 세컨드 브레인 3D 탐색기(입자 구, 라벨 옵션) |
| `src/prompts.json`, `src/pages.json` | PDF에서 추출한 프롬프트·페이지 텍스트 |
| `src/build.js`, `src/old.html` | 소스 조합 스크립트와 탐색기 마크업 원본 |
| `docs/PLAN.md` | 플랫폼 역기획 문서 목차 (`docs/00_LEAN.md` ~ `06_AGENT_PLAN.md`, `DESIGN.md`, `adr/`, `sql/`, `diagrams/`, `_research/`) |

### 빌드
```bash
cd src && node build.js   # ../app/index.html 생성
```
`build.js`가 style.css, body.html, app.js, home3d.js, explorer.js, JSON을 하나의 HTML로 합칩니다. 탐색기 코드는 `brain:mounted` 이벤트(세컨드 브레인 화면 첫 진입) 때 한 번만 초기화됩니다.

## 화면 구성
좌측 GNB(데스크탑 248px / 태블릿 아이콘 레일 72px / 모바일 서랍)와 상단 바, 해시 라우팅입니다.

| 그룹 | 화면 | 설명 |
|---|---|---|
| 홈 | `#home` | 오늘의 AI 업무 시스템 대시보드 |
| SSR+ | `#skill` `#brain` `#routine` `#ext` | 단계별 초·중·고급, 복사용 프롬프트, 완료 기준 |
| 다른 대시보드 | `#brand` `#content` `#ideas` | 브랜드 라이브러리 · 콘텐츠 라이브러리(4단계 보드) · 아이디어 패드(린 검증 프롬프트) |
| 앱 | `#artcraft` `#artapps` | ArtCraft 앱 구조(16종 카드·분류 필터·런처/사이트 버튼) · 앱 16종 상세 가이드 |
| 가이드 | `#guide` `#plan` `#spec` | PDF 뷰어·검색 · 7일 세팅 계획 · 기획 요약 |

### 홈 (3열)
- **왼쪽**: 캘린더 → SSR+ 진행률 링·통계 타일 → 오늘의 목표 → 최근 파일 → 다른 대시보드
- **가운데**: 세컨드 브레인 입자 구 3D 장면. 마우스·터치 드래그로 회전(관성·자동 회전), 구나 라벨을 누르면 3D 탐색기로 이동해 해당 노드를 선택
- **오른쪽**: 익스텐션 → 스킬 → 루틴 (각 `+ 추가`, 전체 보기)
- 컨테이너 쿼리로 3열(≥940px) → 2열(≥700px) → 1열
- **홈의 모든 항목은 버튼**이며 눌러서 편집할 수 있습니다: 캘린더 날짜 메모, 오늘의 목표 체크, 스킬·루틴·익스텐션·최근 파일 추가/수정/삭제, 통계 타일은 해당 화면으로 이동

### 세컨드 브레인 · 3D 탐색기
- 중앙의 큰 구 = 메인 에이전트, 주위로 second-brain 구조가 방사형으로 퍼짐. 홈과 같은 입자 구 셰이더(같은 입체감·색감)
- 노드 종류별 입자 수·크기: 에이전트 > 폴더 > 규칙·색인 > 원본 파일. 분야별 색(규칙·콘텐츠·개발·재무)
- 3D/2D 전환, 확대·축소, 전체 보기, 자동 회전, 다시 재생, 이름·본문 검색
- 노드 선택 시 가는 선택 링과 연결선 강조, 오른쪽 패널에 이름·경로·연결 항목·미리보기
- **라벨 가독성 옵션**(툴바): 캡슐(기본, 어두운 배경+흰 글자+분야색 테두리) · 밝은 · 글자만, 그리고 글자 크게. 선택은 localStorage(`nomad-lbl`)에 저장
- 등장 애니메이션은 화면 위치와 무관하게 즉시 시작(화면 밖에 있어도 빈 화면이 되지 않도록), GPU 컨텍스트 손실 복구 처리

### 사용 가이드 (PDF)
SSR+ 13쪽 + ArtCraft 4쪽을 이미지 뷰어로 제공합니다. 썸네일, 쪽 이동, 본문 검색, 쪽별 텍스트. 발표자 얼굴 화면은 제외했습니다.

### ArtCraft 앱 (16종)
- **`#artcraft`**: 연결 구조(런처→앱→MCP·CLI→AGENTS.md→Claude), 앱 16종 카드(자동 채움 최소 236px·간격 22px, 모바일 1열). 이미지·사진 / 영상·사운드 / 문서·출판 / 디자인·설계 / 도구로 거르기. 카드에는 런처 아이콘, 한 줄 소개, 비슷한 앱, MCP·버전 표시. 상단에 **가이드 보기 · 앱 16종 상세 가이드 · ArtCraft 사이트 바로가기 · 런처 다운받기** 버튼.
- **`#artapps` 앱 16종 상세 가이드**: 앱별 설명·핵심 기능·한눈에 보기(비슷한 앱, 지원 형식, 런처 버전, 개발 상태, MCP·CLI, Rust 요구 버전)·예시 요청·**CLI·MCP 설치 프롬프트(복사)**·알아둘 점·공식 링크. 설치 전 확인 사항, OS별 권한 때문에 직접 해야 하는 부분, 만능 설치 틀, 여러 앱 한 번에 설치 프롬프트 포함.
- 앱: PhotoCraft · VectorCraft · FilmCraft · LightCraft · PdfCraft · EffectCraft · DesignCraft · FigCraft · WordCraft · SoundCraft · DeckCraft · CADCraft · GridCraft · TextureCraft · Craft Anything · SolidCraft(Tangency Labs, 외부 제작).
- 정보 출처: getartcraft.com 앱 소개 페이지, 런처 화면(2026-11-02). "비슷한 앱"의 (추정)은 앱 설명을 보고 붙인 비교이며 공식 설명이 아닙니다. MCP는 공식 페이지에 명시된 앱만 표시하고 나머지는 "미기재"입니다.

### 기획 요약
- 목적·탐색기 사양·단계별 확장·화면 구조·사업 연결 아이디어
- **기기별 화면 미리보기**: 모바일/태블릿/데스크탑을 고르면 그 폭(390 / 834 / 1366px)으로 실제 대시보드를 미리보기 프레임에 렌더링합니다. 구간별 폰트와 메뉴 형태가 실제로 적용되고, "보여줄 화면"으로 어느 화면이든 확인할 수 있습니다.

## 디자인 시스템
- 다크 기본, 라이트 전환(저장). 코랄 계열 강조색, 분야별 색 토큰(`--c-root` `--c-content` `--c-dev` `--c-fin`)
- 폰트: Noto Sans KR + JetBrains Mono
- **반응형 3구간과 폰트 토큰**

| 구간 | 폭 | 본문 | 보조 | 제목(h1) | GNB |
|---|---|---|---|---|---|
| 모바일 | ~767px | 14 | 12 | 26 | 서랍 |
| 태블릿 | 768~1199px | 15 | 13 | 32 | 아이콘 레일 |
| 데스크탑 | 1200px~ | 16 | 13 | 38 | 전체 GNB |

- 접근성: 라벨 버튼, `aria-pressed`, 포커스 표시, `prefers-reduced-motion` 지원

## 기술 메모
- 3D: three.js r128 `ShaderMaterial` + `Points`. 구는 피보나치 껍질+내부 입자, 다크는 가산 혼합, 라이트는 일반 혼합
- 상태 저장 키: `nomad-lab-v1`(진행·목표·메모·아이디어·콘텐츠·스킬·루틴·익스텐션·최근 파일), `nomad-theme`, `nomad-lbl`
- 단일 파일 + 해시 라우팅이라 정적 호스팅(GitHub Pages 등)에 그대로 올릴 수 있습니다.

## 린 검증 로드맵
예시 데이터 화면으로 반응 확인 → 랜딩페이지·사전예약 → 정부지원사업 시연 자료 → 실제 `second-brain/` 폴더 연동(graph.json 생성 스크립트) → Next.js + Supabase 정식 개발 → 템플릿·강의·SaaS 확장.

## 참고·주의
- 노드·목록·숫자는 예시 데이터입니다.
- 사용 가이드 쪽 화면은 A4 세로 비율로 고정되어 있습니다. 사용 가이드 이미지는 외부 PDF(챗대리 가이드)에서 가져온 것이므로 공개 저장소로 전환하기 전에 사용 허락을 확인하세요.
- 앱 아이콘 16개는 ArtCraft 런처 화면에서 잘라 쓴 ArtCraft의 이미지입니다(앱 로고·이름은 상표 조건이 있으므로 공개 전 사용 조건 확인). 공식 사이트 스크린샷은 사용하지 않았습니다.
- ArtCraft 일부 프롬프트는 PDF 글자가 깨져 직접 옮겨 적었으니 원본과 대조해 확인하세요.
