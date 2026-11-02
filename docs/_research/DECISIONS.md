# 역기획 결정 목록 (팀장, 2026-11-03)

> 근거 우선순위: ① Claude 아티팩트 게시본 = `app/index.html` (https://claude.ai/artifact/G8CfCTcmjSZ8RE2ujJ8vAG) ② `docs/_research/SITE_FACTS.md`(그 사실 시트, Lnnn) ③ `docs/PLAN.md`.
> 사이트에 없는 것을 쓸 때는 반드시 **[추정]** 표시. 사실과 추정을 섞지 않는다.

## 결정
| # | 결정 | 근거 |
|---|---|---|
| D1 | 화면·디자인·문구는 아티팩트와 1:1 동일(패리티). To-Be는 저장·인증·데이터 출처만 바꾼다. 화면 13개 + 편집 모달 6종을 그대로 명세 | 사용자 지시 |
| D2 | 문서는 두 층: **As-Is**(사이트에 있는 그대로) → **To-Be**(플랫폼). 화면 ID는 `S01`~`S13`(GNB 순서: home, skill, brain, routine, ext, brand, content, ideas, artcraft, artapps, guide, plan, spec), 모달 `M1`~`M6`(skill, rt, ext, recent, day, date) | SITE_FACTS 1.2, 4.3 |
| D3 | 스택 [추정, 착수 시 최신 stable 재확인]: Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Supabase(Postgres·Auth·RLS·Storage) · three.js(최신, 현 r128에서 이전) · GSAP 3 · Vercel 배포 | PLAN.md 4절, SITE_FACTS 3.10 사업 note |
| D4 | 데이터 2분류: **사용자 데이터**(`st` 필드 전부: lv·days·ck·start·ideas·content·skills·rt·exts·recent·notes·dayText) → 사용자별 테이블 + RLS(owner = auth.uid()). **카탈로그**(SSR 단계·레벨·블록·프롬프트, ArtCraft 16종·프롬프트, 가이드 문서·쪽·텍스트, 7일 계획 기본값, SSR 체크리스트, 브랜드 팔레트, 콘텐츠 시드, 탐색기 노드·엣지) → 읽기 전용 테이블, 사이트 상수를 시드로 이전, 수정은 admin | SITE_FACTS 4 |
| D5 | 기기 설정 `nomad-theme`, `nomad-lbl`은 localStorage 유지(계정 저장 안 함) | SITE_FACTS 4.1 |
| D6 | MVP = 13화면 패리티 + 이메일 매직링크 로그인 + 서버 저장 + 비로그인 체험(localStorage) + 첫 로그인 시 `nomad-lab-v1` 가져오기. 이후: 실제 second-brain 폴더 → graph.json 연동, 탐색기 편집, 루틴 실제 실행·알림, ArtCraft 정보 갱신, 팀 공유, 결제 | SITE_FACTS 3.10, 8 |
| D7 | 사이트의 결함·공백은 To-Be 요구로 명시: 미사용 `st.routines`·`ART` 7종 제거, 하드코딩 "25 두뇌 노드"·클러스터 "6/7/6/5개"를 실제 개수로, ArtCraft 가이드 텍스트·검색 추가는 이후 | SITE_FACTS 2 특이사항, 8 |
| D8 | 사용자 3페르소나 = 사이트의 취업준비생 · CEO(1인 사업자) · 직장인. 대상 시장은 한국어 개인·1인 사업자 [추정] | SITE_FACTS 3.2 |
| D9 | 보안 레벨 L2(배포 SaaS) [추정]. 민감 데이터: 이메일, 메모·아이디어 본문. AI·외부 API 호출 없음(프롬프트는 복사만) | SITE_FACTS 8 |
| D10 | 수익 [추정]: 무료 체험 → 개인 Pro 구독 / 수강생 템플릿·강의 / 정부지원사업 시연. 가격은 미결 | PLAN.md 4절 |

## 추가 결정 (2026-11-03, 초안 취합 후)
| # | 결정 | 근거 |
|---|---|---|
| D11 | 사이트에 없는 신규 화면은 `T` 번호: T1 로그인, T2 이 기기 데이터 가져오기. 시나리오는 `SC` 번호(화면 ID와 겹치지 않게). S00 = 공통 셸 | 03, 01 |
| D12 | 정본 갱신: GitHub master `591572c`(ArtCraft 런처 아이콘·카드 간격) 병합. 아이콘 16개는 카탈로그 `art_apps.icon_path` + Storage 공개 버킷 `art-icons` | 사용자 지시(pull), SITE_FACTS 3.7 |
| D13 | 해시 라우팅(`#skill`) → 경로 라우팅(`/skill`). 옛 `#id` 주소는 클라이언트에서 같은 경로로 넘긴다 [추정] | 02 |
| D14 | 가져오기는 계정당 1회(`imported_v1_at`). 서버 데이터가 이미 있으면 T2에서 사용자에게 확인, 묻지 않고 덮어쓰기 금지. 가져온 뒤 localStorage는 지우지 않음. 요청 상한 256KB [추정] | 02, 04 A01, 05#4 |
| D15 | 신규 가입자는 사이트와 같은 예시 데이터(`DEF`)로 시작(패리티) | SITE_FACTS 4.2 |
| D16 | 제3자 이미지(ArtCraft 아이콘·가이드 쪽 이미지)는 사용 허락 확인 전 공개 배포 금지 — 배포 전 게이트 | README 참고·주의, PRD 8 |
| D17 | 패리티 검수는 `shot`으로 사이트(`app/index.html`)와 새 앱의 같은 화면을 3구간(390·834·1366)에서 비교. `plan2spec` 필수 구조 경고(대시보드 기간 선택, 목록 검색 등)는 D1 패리티를 위해 예외 인정 | 03 작성자 보고 |
| D18 | `mmd-check`가 만든 `.svg`는 다이어그램 미리보기로 커밋 | — |

## 문서 목차 (담당)
| 파일 | 담당 | 상한 |
|---|---|---|
| `00_LEAN.md`, `01_PRD.md` | 작성자 A | 60 / 150줄 |
| `03_SCREENS_UX.md`, `DESIGN.md` | 작성자 B | 화면당 표 1행 / 120줄 |
| `05_DATA_MODEL.md`, `sql/0001_init.sql`, `04_API.md`, `diagrams/erd.mmd` | 작성자 C | 테이블당 12줄 / 엔드포인트당 6줄 |
| `02_ARCHITECTURE.md`, `diagrams/*.mmd`(erd 제외), `adr/0001~0003` | 작성자 D | 120줄 / 25줄 |
| `06_AGENT_PLAN.md`, `PLAN.md`(목차로 축소), README | 팀장 | — |

## 미결 (PRD 7절에 그대로 옮김)
| # | 질문 |
|---|---|
| Q1 | 요금제·가격 |
| Q2 | 첫 고객 1순위: 강의 수강생 vs 일반 1인 사업자 |
| Q3 | 카탈로그(SSR·ArtCraft) 편집을 관리자 화면으로 할지, 저장소 시드 파일로만 할지 |
| Q4 | 실제 second-brain 연동 방식: 로컬 Node 스크립트 업로드 vs 데스크톱 익스텐션 |
| Q5 | 로그인 진입 위치: S00 상단 바 버튼 vs GNB 하단 |
| Q6 | 비로그인 체험 중 로그인 권유 시점 |
