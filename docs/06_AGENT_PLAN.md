# 06 작업 분해 — Nomad-Agents-SYSTEM

> 목표: 아티팩트 사이트([`app/index.html`](../app/index.html))를 화면·디자인 1:1 그대로(D1) Next.js + Supabase 플랫폼으로 옮기고, 로그인·서버 저장·플랜(MVP-1), 관리자·두뇌 연동(MVP-2)을 더한다(D39).
> 작업 하나 = 한 세션. 구현은 "근거" 장만 읽는다. 보안 영향이 "없음"이 아니면 위험도 높음(착수 전 challenger + 변경 후 reviewer(security)).
> 결정 번호 D는 [`_research/DECISIONS.md`](_research/DECISIONS.md). 미결 질문 없음. DB 시험: [`sql-test/10_rls_smoke.sql`](sql-test/10_rls_smoke.sql) 29항목.

## 웨이브 요약
| 단계 | 웨이브 | 목표 | 작업 | 끝났다는 증거 |
|---|---|---|---|---|
| — | W0 | 착수 전 게이트 | task-00 | 제3자 이미지 허락(D16), 스택 버전(ADR 0001), 지불 의사 조사 설계(D19) |
| MVP-1 | W1 | 뼈대·보안·DB·데이터 계층 | task-01~task-05 | 셸 3구간 렌더, 0001~0004 적용 + 시험 29 PASS, 화면이 쓸 데이터 인터페이스(localStorage 구현) |
| MVP-1 | W2 | 카탈로그 시드 | task-06~task-07 | 카탈로그 13테이블·Storage 이미지 33개 |
| MVP-1 | W3 | 화면 패리티(비로그인) | task-08~task-12 | S01~S13이 사이트와 같은 화면(`shot`) |
| MVP-1 | W4 | 로그인·서버 저장·가져오기·플랜 | task-13~task-17 | 로그인 데이터 서버 저장, 실패 대기열(D33), 기기별 병합 가져오기, 체험·번들(AD5 발급 포함), Pro 게이트, 탈퇴 |
| MVP-1 | W5 | 검수·출시 | task-18~task-19 | 패리티 13화면×3구간, 보안 점검, 배포 |
| 게이트 | — | MVP-2 착수 판단 | — | 수강생 지불 의사 조사 + LEAN 수강생 세그먼트 통과(D25·D39) |
| MVP-2 | W6 | 관리자(축소 범위) | task-20 | AD1~AD4, 감사 기록 |
| MVP-2 | W7 | 두뇌 연동 | task-21~task-22 | CLI·웹 폴더 색인 → 내 두뇌 표시 |
| 이후 | — | LEAN 통과 후 | — | 카드 정기결제, 팀 공유, 루틴 실제 실행 |

## 작업
| ID | 작업 | 웨이브 | 선행 | 위험도 | 보안 영향 | 담당 | 근거 | 완료 조건 |
|---|---|---|---|---|---|---|---|---|
| task-00 | 아이콘 16·가이드 이미지 17 사용 허락, Next.js·Supabase·three.js 최신 stable, 지불 의사 조사 설계, Vercel 요청 본문 한도 확인(D35) | W0 | — | 낮음 | 없음 | 팀장 + 사용자 | D16·D19·D35, `adr/0001` | ADR 0001 버전, DECISIONS에 허락·한도 기록 |
| task-01 | Next.js 뼈대 + Tailwind v4 토큰 이식(`src/style.css` 값 그대로), 반응형 3구간 | W1 | task-00 | 높음 | 의존성 | builder + reviewer(security) | `DESIGN.md#2`, `02#1.2` | `typecheck`·`build`, 토큰 diff 0, lockfile 커밋 |
| task-02 | 보안 기본(`/secure setup`, 비밀 스캔, GSAP 예외 D28, CSP `frame-ancestors 'self'` D36) | W1 | task-01 | 높음 | 의존성·키 | builder + reviewer(security) | `01_PRD.md#8`, D28·D36 | `secscan` 통과, policy.json에 GSAP |
| task-03 | 마이그레이션 0001~0004 적용, Storage 버킷, `import_nomad_v1` 본문(병합 규칙 D34) 작성 | W1 | task-00 | 높음 | 민감 데이터·키 | challenger → builder → reviewer(security) | `05_DATA_MODEL.md`, `sql/`, D34 | `supabase db reset` + 시험 29 PASS + 가져오기 병합 시험(사이트 `nomad-lab-v1` 표본) |
| task-04 | 데이터 접근 인터페이스(카탈로그 읽기·사용자 데이터 읽기/쓰기) + **localStorage 구현**(As-Is 로드 규칙) | W1 | task-01 | 보통 | 없음 | builder | `02#2`, SITE_FACTS#4, D32 | 화면이 localStorage를 직접 부르지 않음(lint 규칙), 사이트와 같은 기본값 |
| task-05 | 공통 셸 S00: GNB 3구간, 상단 바(오른쪽 끝 로그인 자리 D23), 테마(D5), 토스트, 경로 라우팅 + 옛 `#id`·URL 파라미터(D13·D36) | W1 | task-01 | 보통 | 없음 | builder | `03` S00, SITE_FACTS#1 | 13개 경로, `#skill`→`/skill`, `shot` 3구간 일치 |
| task-06 | 시드 추출: 사이트 상수 → `supabase/seed.sql`(최초 1회만, D39) | W2 | task-03 | 보통 | 없음 | intern | SITE_FACTS#3·#4.4·#5.2, `05#2` | 단계 4·레벨 12·프롬프트 33·앱 16·쪽 17·노드 25·링크 26·콘텐츠 8 |
| task-07 | Storage `guide`(17)·`art-icons`(16, `AICON` → PNG) 업로드 | W2 | task-03, task-00 | 높음 | 노출 면 | builder + reviewer(security) | `02#1.2`, D12·D16 | 공개 URL 33개 200, 쓰기 관리자만 |
| task-08 | S01 홈 + 홈 입자 구(라우트 이탈 시 WebGL 해제) | W3 | task-04, task-05, task-06 | 보통 | 없음 | builder | `03` S01, SITE_FACTS#3.1·#5.1 | `shot` 일치, 개수 = 데이터 실제 값(D7) |
| task-09 | S02~S05 SSR+ + S03 탐색기(`?node=` 선택, D36) | W3 | task-04, task-06 | 보통 | 없음 | builder | `03` S02~S05, SITE_FACTS#3.2·#5.2 | 레벨 12 순서, 노드 25·링크 26, 딥링크 선택, WebGL 폴백 |
| task-10 | S06 브랜드 · S07 콘텐츠 · S08 아이디어 | W3 | task-04, task-06 | 보통 | 없음 | builder | `03` S06~S08 | 필터·추가·단계 이동·별점 정렬 일치 |
| task-11 | S09 ArtCraft · S10 16종 상세(`instPrompt`) — 이 단계는 전부 표시, Pro 게이트는 task-17 | W3 | task-04, task-06, task-07 | 보통 | 없음 | builder | `03` S09·S10, SITE_FACTS#3.6·#3.7 | 카드 16·필터 6, 프롬프트 문자열 일치 |
| task-12 | S11 가이드(`?doc=&page=`) · S12 7일 계획 · S13 기획 요약(미리보기 `?preview=1`, D36) | W3 | task-04, task-06, task-07 | 보통 | 없음 | builder | `03` S11~S13 | 쪽 딥링크, 검색 "n쪽 일치", 미리보기에 사용자 데이터 없음 |
| task-13 | T1 로그인(매직링크, D29) + A02 콜백 + 상단 바 로그인 버튼·계정 메뉴(D23) | W4 | task-03, task-05 | 높음 | 노출 면·민감 데이터 | challenger → builder → reviewer(security) | `03` T1·S00, `04` A02·A03 | 리다이렉트 허용 목록, 60초 1회 제한 |
| task-14 | 데이터 인터페이스의 **Supabase 구현** + 저장 대기열(D33: 실패·만료·오프라인, 마지막 값만) | W4 | task-13, task-04 | 높음 | 민감 데이터 | builder + codex-reviewer(code) + tester | `02#2`, `04` U01~U12, D33 | 새로고침 후 유지, 네트워크 끊김·세션 만료 시나리오 테스트, localStorage로 떨어지지 않음 |
| task-15 | T3 로그인 권유 시트(D24 ①②③, 세션 규칙) | W4 | task-13 | 보통 | 없음 | builder | `03` T3·F-12~F-14 | 트리거별 표시·재표시 규칙 테스트 |
| task-16 | T2 기기별 병합 가져오기 + A01(D33·D34) | W4 | task-14, task-03 | 높음 | 민감 데이터 | builder + reviewer(security) | `04` A01, `05#4`, D34 | 같은 기기 재가져오기 409, 다른 기기 병합, 256KB 413 |
| task-17 | P1 내 플랜·번들 코드(P01·P02) + Pro 게이트 화면 반영(무료 3개 앱, D31) + **AD5 최소 화면 `/admin/codes`**(일괄 발급 AD06b·폐기 AD07, D41) + P1 위험 구역 계정 삭제(`/api/account/delete`, 서버 전용 키, D42) | W4 | task-13, task-11 | 높음 | 키·권한 | builder + reviewer(security) | `03` P1, `04#2.4`, D30·D31·D41·D42 | 코드 적용·실패 제한(D38), 무료 사용자 REST로도 Pro 프롬프트 0건, 비관리자 `/admin/codes` 404, 탈퇴 후 사용자 행 0건·service role 키가 클라이언트 번들에 없음 |
| task-18 | 패리티 검수 13화면×3구간 `shot` + 신규 화면(T1~T3·P1) 디자인 검토 | W5 | task-08~task-17 | 보통 | 없음 | tester + codex-reviewer(design) | D1·D17, `adr/0002` | 차이 0 또는 승인된 예외만 |
| task-19 | 배포(Vercel) + `/secure` 점검 + 보관 작업 등록(`purge_expired` pg_cron·1년 미접속 삭제, D27·D42) + README 진행 현황 | W5 | task-18, task-02, task-00 | 높음 | 노출 면·키 | builder + reviewer(security) | `01_PRD.md#8` | 프로덕션 동작, 비밀 노출 0 |
| task-20 | [MVP-2] 관리자 AD1~AD4 축소 범위(`art_apps`·`prompts`·`guide_pages` 문구 + AD3 이미지 + AD4 이력; AD5는 MVP-1 task-17에서 구현) | W6 | 게이트, task-13, task-06, task-07 | 높음 | 노출 면·키 | challenger → builder → reviewer(security) | `03` AD1~AD5, `04#2.1`, `adr/0005`, D39 | 비관리자 404, 변경 감사 기록, 평문 코드 1회만 |
| task-21 | [MVP-2] 두뇌 업로드 B04 Route Handler + 로컬 CLI `nomad-brain sync`(`--dry-run`, 키체인, front-matter 요약만) | W7 | 게이트, task-03, task-17 | 높음 | 키·민감 데이터 | builder + tester + reviewer(security) | `04#2.2·#2.3`, `adr/0004`, D22·D35·D37 | 본문 미전송 테스트, 4MB 413, 토큰 없음 401, 무료 PT402 |
| task-22 | [MVP-2] B1 두뇌 연동 화면(토큰 B01~B03, **웹 폴더 선택 → 브라우저 색인** B05) + 탐색기·입자 구·최근 파일이 내 두뇌 표시 | W7 | task-21, task-08, task-09, task-14 | 높음 | 노출 면 | builder + reviewer(security) | `03` B1·F-15·F-16, `04` B01~B07, D37 | 업로드 후 노드 수 반영, Pro 종료 시 읽기 전용 |

## 이후 (LEAN 통과 후)
| 항목 | 근거 |
|---|---|
| 카드 정기결제(국내 PG) → `user_plans.source='paid'` 웹훅 | D19·D30 |
| 팀 플랜·공유, 관리자 편집 범위 확대(나머지 카탈로그) | PRD 4절, D39 |
| 루틴 실제 실행·알림, ArtCraft 가이드 텍스트·검색 | PRD 3절, D7 |
