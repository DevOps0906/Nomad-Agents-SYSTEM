# 06 작업 분해 — Nomad-Agents-SYSTEM

> 목표: 아티팩트 사이트([`app/index.html`](../app/index.html))를 화면·디자인 1:1 그대로(D1) Next.js + Supabase 플랫폼으로 옮긴다.
> 작업 하나 = 한 세션. 구현은 "근거" 장만 읽는다. 위험도·검증은 TEAM 규칙(낮음: 자가 검증 / 보통: codex-reviewer / 높음: challenger 착수 전 + 보안 리뷰).
> 결정 번호 D·미결 Q는 [`_research/DECISIONS.md`](_research/DECISIONS.md).

## 웨이브 요약
| 웨이브 | 목표 | 작업 | 끝났다는 증거 |
|---|---|---|---|
| W0 | 착수 전 게이트 | task-00 | Q1~Q4 답, 제3자 이미지 사용 허락(D16), 스택 버전 확정 |
| W1 | 뼈대·보안 기반 | task-01~task-04 | 빈 앱이 셸(S00)과 토큰으로 3구간 렌더, RLS 테스트 통과 |
| W2 | 카탈로그 시드 | task-05~task-06 | 카탈로그 13테이블에 사이트 상수 전부 시드, 행 수 일치 |
| W3 | 화면 패리티(읽기) | task-07~task-11 | S01~S13 화면이 비로그인·localStorage로 사이트와 같은 화면(`shot` 비교) |
| W4 | 로그인·서버 저장 | task-12~task-15 | 로그인 사용자 데이터가 서버에 저장되고 T2 가져오기 1회 동작 |
| W5 | 마무리·출시 준비 | task-16~task-17 | 패리티 검수 13화면×3구간, 보안 점검 통과, 배포 |

## 작업
| ID | 작업 | 웨이브 | 선행 | 위험도 | 보안 영향 | 담당 | 근거 | 완료 조건 |
|---|---|---|---|---|---|---|---|---|
| task-00 | 미결 Q1~Q4 결정, 아이콘·가이드 이미지 사용 허락 확인, Next.js·Supabase·three.js 최신 stable 확인 | W0 | — | 낮음 | 없음 | 팀장 + 사용자 | DECISIONS 미결·D3·D16, `adr/0001` | DECISIONS·ADR 0001에 버전·답 기록 |
| task-01 | Next.js 앱 뼈대 + Tailwind v4 토큰 이식(`src/style.css` 값 그대로), 반응형 3구간 | W1 | task-00 | 높음 | 의존성 | builder + reviewer(security) | `DESIGN.md`, `02_ARCHITECTURE.md#1.2`, SITE_FACTS#6 | `typecheck`·`build` 통과, 토큰 값이 style.css와 diff 0 |
| task-02 | 보안 기본 설정(`/secure setup`, 비밀 스캔, lockfile) | W1 | task-01 | 높음 | 의존성·키 | builder + reviewer(security) | `01_PRD.md#8`, `security-baseline` | `secscan` 통과, `.env*` 커밋 없음 |
| task-03 | Supabase 마이그레이션 `0001_init` 적용(25테이블·RLS·트리거·`is_admin`) | W1 | task-00 | 높음 | 민감 데이터·키 | challenger → builder → reviewer(security) | `05_DATA_MODEL.md`, `sql/0001_init.sql` | 로컬 `supabase db reset` 성공, RLS 테스트: 남의 행 select 0건·anon 카탈로그 읽기 가능·카탈로그 쓰기 거부 |
| task-04 | 공통 셸 S00: GNB(3구간: 전체·아이콘 레일·서랍), 상단 바, 테마(D5), 토스트, 경로 라우팅 + 옛 `#id` 넘김(D13) | W1 | task-01 | 보통 | 없음 | builder | `03_SCREENS_UX.md` S00·F 서랍, SITE_FACTS#1 | 13개 경로 이동, `#skill` → `/skill`, 3구간 `shot`이 사이트와 같음 |
| task-05 | 시드 추출: 사이트 상수(SSR·프롬프트·ARTAPPS·가이드 텍스트·DAYS·CHECK·BR·CDEF·NODES·LINKS) → `supabase/seed.sql` | W2 | task-03 | 보통 | 없음 | intern | SITE_FACTS#3·#4.4·#5.2, `05_DATA_MODEL.md#2` | 행 수: 단계 4·레벨 12·프롬프트 33(12+5+16)·앱 16·쪽 13+4·노드 25·링크 26·콘텐츠 시드 8 |
| task-06 | Storage 버킷 `guide`(쪽 이미지 17)·`art-icons`(아이콘 16, `AICON` data URI → PNG 파일) 업로드 스크립트 | W2 | task-03, task-00(D16) | 높음 | 노출 면 | builder | `02_ARCHITECTURE.md#1.2`, D12·D16 | 공개 URL 33개 200, 버킷 쓰기는 service role만 |
| task-07 | S01 홈(3열 컨테이너 쿼리, 캘린더, 진행 링, 목표, 최근 파일, 우측 3목록) + 홈 입자 구 3D | W3 | task-04, task-05 | 보통 | 없음 | builder | `03` S01·F-01, SITE_FACTS#3.1·#5.1 | `shot` 3구간 일치, "25 두뇌 노드"·클러스터 개수는 카탈로그 실제 값(D7) |
| task-08 | S02~S05 SSR+ 단계(페르소나·레벨 탭·블록 렌더·복사) + S03 탐색기 3D/2D·검색·라벨 옵션 | W3 | task-05 | 보통 | 없음 | builder | `03` S02~S05, SITE_FACTS#3.2·#5.2 | 레벨 12개 블록이 사이트와 같은 순서, 탐색기 노드 25·링크 26, WebGL 없을 때 폴백 문구 |
| task-09 | S06 브랜드 · S07 콘텐츠 보드 · S08 아이디어 패드 | W3 | task-05 | 보통 | 없음 | builder | `03` S06~S08, SITE_FACTS#3.3~#3.5 | 필터·추가·단계 이동·별점 정렬이 사이트와 같음 |
| task-10 | S09 ArtCraft 구조(아이콘 카드(자동 채움 열 최소 236px·간격 22px)) · S10 16종 상세(펼침 하나만·설치 프롬프트 생성 `instPrompt`) | W3 | task-05, task-06 | 보통 | 없음 | builder | `03` S09·S10·F-04, SITE_FACTS#3.6·#3.7 | 카드 16·필터 6, 카드 클릭 → 해당 앱만 펼침, 생성 프롬프트 16개가 사이트 문자열과 같음 |
| task-11 | S11 가이드 뷰어 · S12 7일 계획 · S13 기획 요약(기기 미리보기 390/834/1366) | W3 | task-05, task-06 | 보통 | 없음 | builder | `03` S11~S13·F-03·F-06, SITE_FACTS#3.8~#3.10 | 쪽 이동·←/→·검색 "n쪽 일치", 미리보기 축소 비율 표시 |
| task-12 | T1 로그인(이메일 매직링크) + A02 콜백, 비로그인 체험 유지 | W4 | task-03, task-04 | 높음 | 노출 면·민감 데이터 | challenger → builder → reviewer(security) | `03` T1·위협 메모, `04_API.md` A02·A03, `02` flow-1 | 로그인·로그아웃, 콜백 리다이렉트 화이트리스트, 레이트 리밋 확인 |
| task-13 | 데이터 접근 계층: 비로그인=localStorage(As-Is 로드 규칙), 로그인=Supabase(U01~U12) 같은 인터페이스 | W4 | task-12, task-07~task-11 | 높음 | 민감 데이터 | builder + codex-reviewer(code) | `02_ARCHITECTURE.md#2`, `04_API.md` U01~U12 | 모든 저장 동작(M1~M6, 체크, 별점 등)이 새로고침 후 유지, 남의 데이터 접근 테스트 실패 |
| task-14 | T2 가져오기 + A01 Route Handler(zod 검증, 256KB, 1회, 충돌 시 확인) | W4 | task-13 | 높음 | 민감 데이터 | builder + reviewer(security) | `04_API.md` A01, `05_DATA_MODEL.md#4`, D14 | 사이트에서 만든 `nomad-lab-v1`이 그대로 이전, 두 번째 요청 409, 413·400 테스트 |
| task-15 | 신규 가입 트리거로 `DEF` 예시 데이터 생성(D15) | W4 | task-03 | 보통 | 없음 | builder | `05_DATA_MODEL.md#3`, SITE_FACTS#4.2 | 새 계정 홈이 사이트 첫 화면과 같은 숫자 |
| task-16 | 패리티 검수: 13화면 × 3구간 `shot` 비교, 차이 목록 → 수정 | W5 | task-07~task-15 | 보통 | 없음 | tester + codex-reviewer(design) | D1·D17, ADR 0002 | 차이 0 또는 승인된 예외만 |
| task-17 | 배포(Vercel) + 보안 점검(`/secure`), README 진행 현황 갱신 | W5 | task-16, task-02, task-00(D16) | 높음 | 노출 면·키 | builder + reviewer(security) | `01_PRD.md#8`, `02_ARCHITECTURE.md#1.2` | 프로덕션 URL 동작, 비밀 노출 0, 제3자 이미지 허락 확인 기록 |

## 이후(MVP 밖, PRD 3절 "이후")
| 항목 | 근거 |
|---|---|
| 실제 second-brain 폴더 → `graph.json` 연동, 탐색기 노드 편집 | Q4, PRD 3절 S03 |
| 루틴 실제 실행·알림 | PRD 3절 |
| ArtCraft 정보 갱신, ArtCraft 가이드 텍스트·검색 | D7, PRD 3절 S09~S11 |
| 카탈로그 관리자 화면 | Q3, `04_API.md` X01 |
| 팀 공유·결제 | Q1 |
