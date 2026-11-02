# 사이트 사실 시트 (SITE_FACTS)

- 대상: `app/index.html` (1904줄, 단일 파일, `src/build.js` 빌드 결과, GitHub master `591572c` 기준). 근거는 모두 이 파일의 줄 번호 `Lnnn`.
- 원칙: 코드에 있는 것만 적는다. 해석·제안 없음. 문서 제목 `<title>Nomad-Agents-SYSTEM</title>` (L1). doctype·`<meta charset>`·`lang` 없음(아티팩트 게시 래퍼가 붙임 — 로컬에서 직접 열면 서버가 UTF-8을 알려 줘야 한글이 보임).
- 스크립트 구성: ① 메인 IIFE(라우터·상태·전 화면) L603–1298 ② 탐색기 3D(`brain:mounted` 1회) L1300–1743 ③ 홈 입자 구 L1744–1903. 데이터 JSON `window.__D` L602.
## 1. 앱 셸
### 1.1 레이아웃
| 요소 | 사실 | 근거 |
|---|---|---|
| 그리드 | `.app` = `var(--nav-w)` + 본문 2열, 모바일은 1열 | L56, L91 |
| GNB | `aside#gnb.gnb` sticky 100dvh, 로고 + `nav#nav`(JS 생성) + 하단 진행률(`#gpPct`,`#gpBar`, 문구 "SSR+ 진행") | L467–476 |
| 로고 | SVG(구+궤도+점) + "Nomad-Agents-SYSTEM" + small "NOMAD-LAB · AI WORK", `href="#home"` | L468–471 |
| 상단 바 | `header.top` sticky: 메뉴 버튼 `#menu`(모바일만 표시) · 제목 `h1#vt` · 진행 pill `#topPill`("SSR+ n%", 모바일 숨김 `.hide-m`) · 테마 버튼 `#theme` | L479–484, L86, L94, L97 |
| 본문 | `div#page.page` max-width 1480px, 섹션 `section.view#v-<id>` (home만 마크업, 나머지는 JS가 빈 섹션 생성) | L88, L485–553, L1256 |
| 토스트 | `#toast` role=status aria-live=polite | L558 |
### 1.2 GNB 메뉴 (`NAV`, L735–741; 렌더 L742–747)
| 그룹(`g`) | 라우트 id | 제목 | 아이콘/글자 | 영문 small | 카운트 |
|---|---|---|---|---|---|
| (없음) | home | 홈 | ic `home` | — | — |
| SSR+ FRAMEWORK | skill | 스킬 | 글자 `S` | SKILL | `data-ct="s1"` → "n/3" |
| 〃 | brain | 세컨드 브레인 | 글자 `S` | SECOND BRAIN | `s2` "n/3" |
| 〃 | routine | 루틴 | 글자 `R` | ROUTINE | `s3` "n/3" |
| 〃 | ext | 익스텐션 | 글자 `+` | EXTENSION | `s4` "n/3" |
| 다른 대시보드 | brand | 브랜드 라이브러리 | ic `brand` | — | — |
| 〃 | content | 콘텐츠 라이브러리 | ic `content` | — | — |
| 〃 | ideas | 아이디어 패드 | ic `ideas` | — | — |
| 앱 | artcraft | ArtCraft | ic `artcraft` | — | — |
| 〃 | artapps | 앱 16종 상세 가이드 | ic `guide` | — | — |
| 가이드 | guide | 사용 가이드 (PDF) | ic `guide` | — | — |
| 〃 | plan | 7일 세팅 계획 | ic `plan` | — | — |
| 〃 | spec | 기획 요약 | ic `spec` | — | — |
- 카운트 값: 각 단계 `st.lv[key]` 완료 수 + "/3" (L886). 아이콘 SVG 경로 사전 `IC` (home·brand·content·ideas·artcraft·guide·plan·spec·moon·sun) L614–625.
- 현재 메뉴: `aria-current="page"` + 좌측 3px 막대 (L67–68, L1268).
### 1.3 라우터 (L1252–1278)
| 항목 | 사실 | 근거 |
|---|---|---|
| 방식 | `location.hash` (`hashchange` → `route()` → `show(id)`) | L1277–1278 |
| 기본 라우트 | `VIEWS`에 없는 id(빈 해시 포함) → `home` | L1260 |
| 지연 렌더 | 첫 방문 때만 렌더 함수 실행(`rendered[id]`), 예외: guide는 재방문 때 재렌더, artapps는 `__artSel` 있으면 해당 앱 펼침 | L1264–1266 |
| 제목 갱신 | `#vt` = `VIEWS[id].t`, `document.title` = `VIEWS[id].t + ' · Nomad-Agents-SYSTEM'` | L1269–1270 |
| 부가 | 서랍 닫기, `scrollTo(0,0)`, `window.__view=id`, `viewchange` 이벤트, `refresh()`, GSAP 페이드업(.35s) | L1271–1275 |
| 화면 제목표 `VIEWS` | home 홈 / skill "S · 스킬" / brain "S · 세컨드 브레인" / routine "R · 루틴" / ext "+ · 익스텐션" / brand 브랜드 라이브러리 / content 콘텐츠 라이브러리 / ideas 아이디어 패드 / artcraft "ArtCraft 앱" / artapps "ArtCraft 앱 16종 가이드" / guide "사용 가이드 (PDF)" / plan "7일 세팅 계획" / spec 기획 요약 | L729–734 |
### 1.4 테마·서랍·토스트
| 항목 | 사실 | 근거 |
|---|---|---|
| 테마 | `html[data-theme]`에 `dark`/`light` 설정, 기본 `dark`, 저장 키 `nomad-theme`, 아이콘 dark→sun / light→moon | L1289–1292 |
| CSS 테마 | `prefers-color-scheme:dark` + `:root:not([data-theme=light])`, 그리고 `:root[data-theme=dark]` 두 곳 | L23–36 |
| 모바일 서랍 | ≤767px에서 GNB `position:fixed`, `translateX(-102%)` → `.open`; 스크림 `#scrim.on`; `#menu` aria-expanded 토글; 스크림 클릭·Esc·라우트 이동 시 닫힘 | L90–98, L1280–1286, L1271 |
| 태블릿 레일 | 768–1199px에서 GNB 텍스트·카운트·그룹명 숨김(아이콘만, `--nav-w:72px`) | L99–106, L18 |
| 토스트 | 1.8초 표시. 문구: "복사했습니다" / "복사하지 못했습니다. 직접 선택해 주세요" | L641, L643–644 |
| 복사 | `navigator.clipboard.writeText` → 실패 시 textarea+`execCommand('copy')`; 버튼 글자 1.4초 "복사됨" | L642–646 |
## 2. 화면 목록

| 라우트 | 화면명 | 렌더 함수 | 유형 | 구성 블록(순서) | 사용자 동작 | 상태 | 다음 화면 |
|---|---|---|---|---|---|---|---|
| home | 홈 | `renderHome` L805 (+`renderGoals` L816, `renderCal` L822) | 대시보드(3열) | 머리(날짜 eyebrow·제목·설명) → 좌열: 캘린더 / 진행 링+통계 4칸 / 오늘의 목표 / 최근 파일 / 다른 대시보드 → 중앙: 세컨드 브레인 입자 구 → 우열: 익스텐션 / 스킬 / 루틴 | 날짜·목표·파일·항목 편집 모달(`data-edit`), 목표 체크, 루틴 토글, Node.js 프롬프트 복사, 파일 열기→탐색기, 구 클릭→탐색기 | 목록 비면 `.empty` 안내 문구, 오늘·계획일·완료·메모 표시 | plan, ideas, content, brain, ext, skill, routine, brand |
| skill·brain·routine·ext | SSR+ 단계 | `renderSSR(vid)` L767 | 상세(탭) | 큰 글자+eyebrow "EN · PART n / 4"+제목+리드 → (brain만) 3D 탐색기 → 페르소나 3카드 → 레벨 탭 3개 → 레벨 본문 | 탭 전환, "가이드 p.N 보기", "이 레벨 완료" 체크, 프롬프트 복사 | 탭 ✓ 표시, 첫 진입 탭=첫 미완료 레벨(모두 완료면 0) | guide(해당 쪽) |
| brand | 브랜드 라이브러리 | `renderBrand` L952 | 라이브러리(정적) | 머리 → 로고 패널 / 글꼴과 말투 패널 → 색상 팔레트 5칸 | 색 칸 클릭 = HEX 복사 | — | — |
| content | 콘텐츠 라이브러리 | `renderContent` L913 | 보드(칸반 4열) | 머리 → 채널 칩 필터 → 추가 폼 → 보드 → 푸터 문구 | 채널 필터, 제목+채널 추가, 상태 select 이동, × 삭제 | 열 비면 "비어 있음", 열 제목 옆 개수 | — |
| ideas | 아이디어 패드 | `renderIdeas` L938 | 목록+폼 | 머리 → 추가 폼(textarea+분야) → 별점순 목록 | 추가, 별점 1–3(같은 값 재클릭 시 0), 검증 프롬프트 복사, 삭제 | 비면 "아직 메모가 없습니다. 위에 첫 아이디어를 적어 보세요." | — |
| artcraft | ArtCraft 앱 구조 | `renderArt` L1137 (+`drawAppCards` L1091) | 소개/카탈로그 | 머리+링크 4개 → 연결 구조 5단계 → 01 앱 카드(분류 필터+개수 pill) → 02 알아둘 점 / 03 런처 설치 → 04·05 설치 프롬프트 → 06 색감 보정 / 07 명함 → 08·09 / 10 한계표 → 사업 메모 | 분류 필터, 카드 클릭→artapps 해당 앱, 가이드 보기(art p.1), 프롬프트 복사, 외부 링크 | 필터 aria-pressed, "n개" | artapps, guide, 외부 |
| artapps | ArtCraft 앱 16종 상세 가이드 | `renderArtApps` L1116 (+`appDetail` L1104, `openApp` L1099) | 상세 목록(아코디언) | 머리+링크 3개 → 정보 기준 note → 01 설치 전에 정할 것 → 02 권한 표 → 03 만능 프롬프트 / 04 여러 앱 프롬프트 → 05 앱별 `details` 16개 → 출처 | 펼치기(한 번에 하나), 프롬프트 복사, 외부 링크 | 선택 앱만 open + 스크롤 | artcraft, 외부 |
| guide | 사용 가이드 (PDF) | `renderGuide` L1157 | 뷰어 | 머리 → 문서 탭 2개 → 썸네일 열 + 쪽 보기(이전/다음·쪽수·검색) → 쪽 이미지 → (ssr) 텍스트 접기+복사 | 문서 전환, 썸네일·이전/다음·←/→ 키, 본문 검색(Enter=첫 일치 쪽), 텍스트 복사 | 썸네일 `aria-current`, 검색 일치 `.hit`, "n쪽 일치"/"일치 없음" | — |
| plan | 7일 세팅 계획 | `renderPlan` L1190 | 체크리스트 | 머리 → 날짜별 할 일 7개(+태그)+시작일 → 유지 관리 note → SSR+ 체크리스트 4개 | 일차 체크·편집, "시작일을 오늘로", 체크리스트 체크 | `#pcnt` "n/7", `#ckCnt` "n/4" | — |
| spec | 기획 요약 | `renderSpec` L1233 (+`initDevPreview` L1220) | 문서+미리보기 | 머리 → 3단(목적/탐색기 사양/단계별 확장) → 화면 구조 4칸 → 사업 연결 note → 기기별 미리보기(구간 버튼 3·화면 select·iframe) → 푸터 | 기기 구간 선택, 보여줄 화면 선택 | 축소 비율 표시 | — |
## 3. 화면별 상세
### 3.1 홈 (L487–553, L791–836)
| 블록 | 내용 | 근거 |
|---|---|---|
| 머리 | `#today` "YYYY.MM.DD · X요일", h2 "오늘의 AI 업무 시스템", 설명 "…목록과 숫자는 예시 데이터입니다." | L489–491, L807 |
| 캘린더 | 제목 "YYYY년 M월", 요일 헤더 일–토, 당월 6주 이내 셀 버튼; 클래스 `mut`(타월), `plan`(시작일~+6), `done`(해당 일차 완료), `today`, `has`(메모 있음) | L822–836 |
| 진행 링 | `#ring` 원주 251.33, `#pct`%, `#doneTxt` "완료/12" → `#plan` 링크 | L500–503, L884–889 |
| 통계 4칸 | 7일 계획 `n/7`→#plan · 아이디어 수→#ideas · 콘텐츠 항목 수→#content · "25 두뇌 노드(예시)"(고정값)→#brain | L504–509 |
| 오늘의 목표 | 시작일 기준 일차부터 3개(끝 넘으면 4·5·6일차), 체크+✎, 카운트 `n/7`, "7일 전체" 링크; note "처음이라면 가이드 p.3 사전 설치부터" + 복사(`node`) | L512–514, L816–821 |
| 최근 파일 | 종류 배지·이름·시점, 행 클릭=`data-open`(탐색기 노드), ✎ 편집, "+ 추가" | L516–518, L812 |
| 다른 대시보드 | brand "5색" · content "4단계" · ideas "메모" | L813 |
| 세컨드 브레인 | eyebrow SECOND BRAIN, "탐색기 열기"(#brain), 입자 구 캔버스, 범례 5색, "드래그로 회전 · 구를 눌러 탐색기로 이동" | L527–534 |
| 익스텐션/스킬/루틴 | 각 "+ 추가"·"전체 보기"(#ext/#skill/#routine); 익스텐션 점=연결됨/대기, 스킬 호출명·빈도, 루틴 시각·호출명+토글 | L539–550, L809–811 |
### 3.2 SSR+ 단계 (`SSR` L655–728, `blocks` L751–762)
- 블록 종류: `p` 문단, `ol` 번호 목록, `tree` 폴더 트리, `table`, `prompt`[제목, 키] → 복사 박스, `done` → "완료 기준" 콜아웃, `warn` → "한계" 콜아웃 (L753–759).
- 레벨 머리: "TAG · LEVEL n", 제목, "가이드 p.N 보기"(`data-guide="ssr:N"`), "이 레벨 완료" 체크(`data-lv="sN:i"`) (L765).

| 단계(key) | 글자·영문 | 리드 요약 | 페르소나(취업준비생 / CEO / 직장인) | 근거 |
|---|---|---|---|---|
| skill (s1) | S · SKILL | 스킬은 AI 단축키, /daily-report 예 | 공고 맞춤 자소서 / 주간 경영 보고 / 회의록 정리 | L656–658 |
| brain (s2) | S · SECOND BRAIN | 말하지 않아도 필요한 파일을 찾게 하는 단계 | 지원 회사별 폴더 연결 / 분야별 길잡이·공유 드라이브 / 담당 프로젝트·양식 위치 | L674–676 |
| routine (s3) | R · ROUTINE | 정해진 시간에 자동 실행 | 매일 8시 공고 정리 / 매주 월 매출 요약 / 매일 9시 할 일 브리핑 | L692–694 |
| ext (s4) | + · EXTENSION | 브라우저·지메일·외부 데이터 확장 | 캘린더·채용 공고 수집 / 회계·공공데이터 MCP / 지메일·드라이브 | L710–712 |

| 단계 | 레벨 | 제목 | 가이드 쪽 | 블록 구성 | 프롬프트 키 | 완료 기준 / 한계 |
|---|---|---|---|---|---|---|
| skill | 초급 | 기본 스킬 쓰고, 내 스킬 만들기 | 4 | ol 3 → prompt | skill1 | — |
| skill | 중급 | 참고자료를 담은 복합 스킬 | 4 | p → tree(회사-ppt/Skills) → p → prompt | skill2 | — |
| skill | 고급 | 스킬이 낡지 않게 개선하기 | 5 | p → prompt ×2 → done | skill3a, skill3b | done: 한 줄 호출로 매번 같은 품질, 고칠 땐 스킬 파일 |
| brain | 초급 | AGENTS.md 지침 파일로 관리하기 | 6 | p → table(항목/예시 3행) → prompt → done | brain1 | done: 새 대화에서 진행 중인 일을 바로 답 |
| brain | 중급 | 길잡이(색인) 파일 만들기 | 6 | p → tree(AGENTS.md/contents/dev) → prompt → done | brain2 | done: 도구 호출 3번 안에 파일 찾기 |
| brain | 고급 | 나만의 세컨드 브레인 탐색기 만들기 | 8 | p → prompt | brain3 | — |
| routine | 초급 | Claude 데스크톱 루틴 | 9 | ol 3 → prompt → warn | routine1 | warn: 컴퓨터·앱 켜져 있을 때만 실행 |
| routine | 중급 | 꺼지지 않는 루틴 만들기 | 9 | p → table(방법/설명 2행) → p(Hermes·Syncthing) → prompt | routine2 | — |
| routine | 고급 | 매니지드 에이전트 (지켜볼 단계) | 10 | p → warn → done | — | warn: 아직 완성 단계 아님 / done: 정해진 시간에 결과 도착 |
| ext | 초급 | Claude 데스크톱 커넥터 | 11 | ol 3 → p | — | — |
| ext | 중급 | 커넥터 찾기 (MCP → CLI → API) | 11 | p → table(종류/설명/난이도: MCP 쉬움·CLI 보통·API 어려움) → p → prompt → p(search-connector) | ext1 | — |
| ext | 고급 | 익스텐션 직접 만들기 | 11 | p → prompt → done | ext2 | done: 매주 쓰는 외부 서비스·자료를 직접 읽고 씀 |
(근거 L659–727)
### 3.3 브랜드 라이브러리 (L951–957)
| 구역 | 내용 |
|---|---|
| 로고 | 56px SVG + "Nomad-Agents-SYSTEM"; 규칙 3줄(궤도 구=메인 에이전트·바깥 점=도구 / 여백 로고 높이 절반 이상 / 어두운 배경 기본, 밝은 배경은 코랄 한 단계 진하게) |
| 글꼴과 말투 | 본문 Noto Sans KR 400·500, 제목 700·800 / 숫자·코드 JetBrains Mono / 존댓말·짧은 문장·결론 먼저 / 금지: 과장·근거 없는 수익 보장·이모지 남발; note "스킬 연결" |
| 팔레트 `BR` | Agents Coral #FF8D74 CTA·강조 · Lab Ink #0D0A09 배경 · Sand #F4ECE6 본문 글자 · Signal Teal #3CC8C0 개발 분야 · Amber #F2B53A 재무·주의 (클릭=HEX 복사) |
### 3.4 콘텐츠 라이브러리 (L905–932)
- 4단계 `CSTAT`: 아이디어 · 기획 · 제작 · 발행 (L906). 채널 `CCH`: 유튜브 · 블로그 · 전자책 · 뉴스레터 (L906). 필터 칩: 전체 + 4채널 (L915).
- 시드 `CDEF` 8건(제목/채널/단계 인덱스) (L907–910):

| 제목 | 채널 | 단계 |
|---|---|---|
| AI 업무 시스템 SSR+ 4단계 쇼츠 | 유튜브 | 제작(2) |
| 클로드 스킬 만드는 법 롱폼 | 유튜브 | 기획(1) |
| 바이브코딩 입문 체크리스트 | 블로그 | 발행(3) |
| 정부지원사업 사업계획서 작성 가이드 | 전자책 | 기획(1) |
| 1인 출판사 자동화 사례 | 블로그 | 아이디어(0) |
| 주간 AI 자동화 소식 | 뉴스레터 | 발행(3) |
| n8n 대 Make 비교 | 블로그 | 아이디어(0) |
| 세컨드 브레인 만들기 클래스 | 유튜브 | 아이디어(0) |
- 새 항목은 맨 앞에 `{t,ch,s:0}`로 추가 (L931). 필터 상태 `cFilter`는 저장 안 됨 (L912).
### 3.5 아이디어 패드 (L935–948)
| 필드 | 사실 |
|---|---|
| `id` | `Date.now()` |
| `t` | textarea 본문(필수), placeholder "예: 정부지원사업 사업계획서를 자동 초안으로 만들어 주는 AI 에이전트" |
| `cat` | select `ICAT`: SaaS · AI 에이전트 · 자동화 · 콘텐츠 · 전자책 · 정부지원사업 (L936) |
| `sc` | 별점 0–3, 목록은 `sc` 내림차순 (L939) |
- 검증 프롬프트 `leanPrompt(x)`: 아이디어·분야 + 4항목(싼 검증 3가지 표 / 경쟁 차별점 / 7일 단위 첫 매출 계획 / 정부지원사업) (L937).
### 3.6 ArtCraft 앱 구조 (L959–975, L1137–1151)
- 가이드 7종 `ART` (이름/유사 앱/용도): PhotoCraft 포토샵 · VectorCraft 일러스트레이터 · FilmCraft 프리미어 프로 · EffectCraft 애프터 이펙트 · LightCraft 라이트룸 · PdfCraft 아크로뱃 · DesignCraft 인디자인 (L960–968; 렌더에는 쓰이지 않음 — `ART` 참조 없음).
- 프롬프트 `ARTP` → `P.art_install`(FilmCraft·VectorCraft AGENTS.md로 CLI·MCP 설치), `P.art_color`(11–42초 색감·2분51초 글리치), `P.art_card`(명함 90×50mm 리디자인) (L969–974).
- 연결 구조 5단계: 1 런처 → 2 앱 → 3 MCP·CLI → 4 AGENTS.md → 5 Claude (L1140).
- 분류 `ACAT`: all 전체 · img 이미지·사진 · av 영상·사운드 · doc 문서·출판 · dsg 디자인·설계 · tool 도구 (L977).
- 02 알아둘 점: FilmCraft 기능 범위 약 86%·작업 준비도 약 56%, MIT/Apache-2.0, 코드 탭 유료 (L1142). 10 한계표: PhotoCraft·FilmCraft·VectorCraft·EffectCraft (L1148).
### 3.7 ArtCraft 앱 16종 (`ARTAPPS` L981–1062)
- MCP 코드: Y=공식 앱 페이지 명시 "MCP", G=가이드 AGENTS.md 기준 "MCP(가이드)", N="MCP 미기재", U="MCP 확인불가" (L980, L1064). 태그는 분류·MCP·`CLI`·버전 4개를 만들지만(L1088), 카드에서는 1·3번째(분류·CLI)를 CSS로 숨겨 **MCP·버전만** 보인다(L460). 상세 summary에는 4개 모두 표시.
- 앱 아이콘 `AICON`: 16종 모두 96×96 PNG data URI(파일 안에 포함), `aicon(id,cls)`가 `<img class="aic">` 생성 (L1085–1086). 출처: ArtCraft 런처 화면에서 잘라 낸 ArtCraft 이미지 — 화면 문구 "앱 아이콘은 ArtCraft 런처 화면에서 가져온 ArtCraft의 이미지입니다." (L1141).
- 앱 카드 `appCard` (L1089): `ac-head`(아이콘 52px + 이름 h3 + 한 줄 소개) → "비슷한 앱 · …" → 태그(MCP·버전) → "상세 가이드 →". 개발 상태는 카드에 없고 상세에만. 그리드 `#appGrid` = `repeat(auto-fill,minmax(236px,1fr))`, 간격 22px, 카드 패딩 18/18/16/22px·반경 14px (L450–462). 상세 summary 이름 앞 아이콘 36px(`.aic.ds`, L457).
- 파생: `repo` = `https://github.com/storytold/<id>`(craftanything은 `craft-anything`), `page` = `https://getartcraft.com/apps/<id>`(ext 앱은 없음) (L1063).

| # | id | 이름 | 분류 | 상태 | 버전 | Rust | MCP | 비슷한 앱 | 한 줄(tag) | 지원 형식 | AGENTS.md |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | photocraft | PhotoCraft | img | Early alpha | 0.19.0 | 1.90 | N | 포토샵 | 이미지 편집 | PSD, PSB | — |
| 2 | vectorcraft | VectorCraft | dsg | In development | 0.20.0 | 1.90 | Y | 일러스트레이터 | 벡터 일러스트 | 네이티브 JSON, SVG·PDF, PNG·JPEG·WebP | 있음 |
| 3 | filmcraft | FilmCraft | av | In development | 0.16.0 | 1.95 | G | 프리미어 프로 | 영상 편집·색·사운드 | H.264, HEVC, ProRes, VP9, AAC, Opus 등 | 있음 |
| 4 | lightcraft | LightCraft | img | In development | 0.17.0 | 1.90 | N | 라이트룸 | 사진 라이브러리·RAW 현상 | RAW 8종 | — |
| 5 | pdfcraft | PdfCraft | doc | Early alpha | 0.17.0 | 1.90 | N | 아크로뱃 | PDF 읽기·정리·보호 | PDF | — |
| 6 | effectcraft | EffectCraft | av | In development | 0.20.0 | 1.95 | N | 애프터 이펙트 | 모션 그래픽·시각 효과 | H.264, ProRes, PNG, TIFF, EXR, GIF, Lottie | — |
| 7 | designcraft | DesignCraft | doc | In development | 0.16.0 | 1.90 | Y | 인디자인 | 페이지 레이아웃·출판 | 네이티브, PNG, 레이아웃 교환, PDF/A | — |
| 8 | figcraft | FigCraft | dsg | Early alpha | 0.14.0 | 1.95 | Y | 피그마(추정) | 인터페이스 디자인·프로토타이핑 | 네이티브 | — |
| 9 | wordcraft | WordCraft | doc | In development | 0.14.0 | 1.90 | Y | 워드(추정) | 글쓰기·문서 디자인 | DOCX, ODT, RTF, HTML, MD, TXT, PDF | — |
| 10 | soundcraft | SoundCraft | av | In development | 0.16.0 | 1.90 | N | 오디오 워크스테이션(DAW) | 녹음·편집·믹싱 | 오디오·MIDI, CLAP | — |
| 11 | deckcraft | DeckCraft | doc | In development | 0.14.1 | 1.90 | Y | 파워포인트(추정) | 프레젠테이션·슬라이드 | PPTX, PDF | — |
| 12 | cadcraft | CADCraft | dsg | In development | 0.16.0 | - | N | 오토캐드(추정) | 컴퓨터 지원 설계·제도 | DXF, DWG(열기), PDF, SVG, PNG | — |
| 13 | gridcraft | GridCraft | doc | In development | 0.15.0 | 1.90 | Y | 엑셀(추정) | 스프레드시트·데이터 | XLSX | — |
| 14 | texturecraft | TextureCraft | dsg | In development | 0.2.0 | 1.95 | Y | 3D 텍스처 페인팅 앱(추정) | 3D 텍스처 페인팅 | glTF·FBX·OBJ·USD 등 → PNG·TGA·TIFF·EXR | — |
| 15 | craftanything | Craft Anything | tool | Early alpha | 0.2.0 | 1.97 | Y | 해당 없음(메타 앱) | 소프트웨어 원리 분석·제작 | 웹사이트·앱·게임·파일 | — |
| 16 | solidcraft | SolidCraft | dsg | 확인 필요 | 0.30.0 | - | U | 솔리드웍스(추정) | 파라메트릭 3D CAD | 확인 필요 | — (`ext:true`, Tangency Labs) |
- 각 앱 필드: `desc`, `feats`(3–6줄), `fmt`, `tasks`(예시 요청 1–2개), `lim`(알아둘 점), `job`(설치 프롬프트 동사구), `c`(색 변수) (L981–1061).
- 상세(`details.appd`) 항목 순서: 설명 리드 → 핵심 기능 / 한눈에 보기 표(비슷한 앱·한 줄 소개·지원 형식·런처 버전 "(2026-11-02 런처 기준)"·개발 상태·AI 연동 "MCPL · CLI(headless)"·소스 빌드 요구·분류) → "Claude에게 이렇게 시켜 보세요" → 설치 방법(프롬프트 `ai_<id>`) → 알아둘 점 → 링크(앱 소개 페이지·GitHub 저장소·AGENTS.md) (L1104–1115).
- 설치 프롬프트 생성 `instPrompt(a)`: 문서 주소(ext/agents/repo 분기) + OS·CPU·Rust 확인 + macOS(Universal) 안내 + (N/U면) CLI만 + 직접 할 일 안내 + 연결 확인 (L1068–1079).
- `art_common` 만능 틀(L1081), `art_multi` 대상: filmcraft·vectorcraft·designcraft·wordcraft·deckcraft·gridcraft (L1082).
- artapps 권한 표 `perm`: macOS · Windows · Linux · 공통 (L1117–1122). 01 사양 확인 4항목(OS, CPU, Rust 1.90·1.95·1.97, 코드 탭 유료) (L1128).
### 3.8 가이드 뷰어 (L1153–1187)
| 항목 | 사실 |
|---|---|
| 문서 `DOCS` | `ssr` "SSR+ 가이드" 13쪽, 이미지 `guide/ssr-01.jpg`…(2자리 패딩) / `art` "ArtCraft 가이드" 4쪽, `guide/art-1.jpg`… (L1154, L1156) |
| 상태 `gs` | `{doc:'ssr',page:1,q:'',hits:{}}`, 저장 안 됨 (L1155) |
| 텍스트 | ssr만 `D.pages.ssr[page-1]` 접기("이 쪽 텍스트 보기·복사")+텍스트 복사; art는 안내 문구 (L1158, L1165) |
| 검색 | ssr만, 13쪽 본문 소문자 부분일치 → 썸네일 `.hit`, 카운트 "n쪽 일치"/"일치 없음", Enter=첫 일치 쪽 (L1161, L1167, L1170–1175) |
| 이동 | 썸네일, ←이전/다음→, 키보드 ←/→(입력 중 제외), 범위 1..n 고정 (L1176, L1184–1187) |
| 진입 | `data-guide="doc:p"` → `openGuide` (L651, L1177) |
| 쪽 비율 | A4 세로 `aspect-ratio:210/297`, 폭 `min(100%, 84vh*210/297)` (L349–351) |
### 3.9 7일 계획 (`DAYS` L792–800, `CHECK` L801, 렌더 L1190–1197)
| 일차 | 할 일 | 태그 |
|---|---|---|
| 1 | 사전 설치(p.3) + AGENTS.md 만들기(p.6 초급) | 세컨드 브레인 |
| 2 | 가장 자주 시키는 일로 첫 스킬 만들기(p.4) | 스킬 |
| 3 | 세컨드 브레인 길잡이 파일 만들기(p.6 중급) | 세컨드 브레인 |
| 4 | 2일차 스킬을 루틴으로 예약(p.9) | 루틴 |
| 5 | 커넥터 하나 연결(p.11) | 익스텐션 |
| 6 | 전체를 한 번씩 실행. 결과가 어긋나면 채팅이 아니라 파일을 고친다 | 전체 |
| 7 | 이번 주에 가장 아쉬웠던 곳에 스킬·루틴·익스텐션 하나 추가 | 전체 |
- 표시 문구는 `st.dayText[i]`가 있으면 그것, 없으면 기본값 (L803).
- SSR+ 체크리스트 4: S 스킬 / S 세컨드 브레인 / R 루틴 / + 익스텐션 (각 완료 문장) (L801). 유지 관리 note "매주 15분" (L1193).
### 3.10 기획 요약 (L1198–1250)
- 3단: 무엇을 위한 화면인가 / 탐색기 사양 5줄 / 단계별 확장(지금: 예시 데이터 · 다음: Node 스크립트가 second-brain/ 읽어 graph.json · 이후: Extensions/brain-explorer/ 로컬 도구, 수강생용 템플릿) (L1235–1237).
- 화면 구조 4칸: HOME / SSR+ (좌측 GNB 4칸) / 다른 대시보드·앱 / 가이드("PDF 17쪽 뷰어·검색") (L1239–1242).
- 사업 note: 랜딩→사전예약→정부지원사업 시연→"Next.js + Supabase로 정식 개발해 SaaS화" (L1243).
- 기기 미리보기 `DEVS`: 모바일 390×780 · 태블릿 834×1112 · 데스크탑 1366×860 (L1198). 버튼 문구: 모바일 "~767px · 본문 14 · 보조 12 · 제목 26 · 메뉴는 서랍", 태블릿 "768~1199px · 본문 15 · 보조 13 · 제목 32 · 아이콘 레일", 데스크탑 "1200px~ · 본문 16 · 보조 13 · 제목 38 · 전체 GNB" (L1245).
- 동작: 초기 구간 = 현재 화면 미디어쿼리 (L1223–1224); iframe `srcdoc` = 로드 시점 스냅샷(`SNAP`: #app·#toast·#brain-tpl outerHTML) + 스타일 + `script[data-nomad]`, 테마 상속 (L607, L1200–1207); 축소 `scale(min(1,(stage폭-32)/w))`, 정보 "모바일 · 폭 390px · n% 축소" (L1208–1214); select는 spec 제외 12개 화면 → iframe 해시 변경 (L1222, L1227–1229).
## 4. 데이터
### 4.1 localStorage 키 (3개)
| 키 | 저장 값 | 기본값/시드 | 쓰는 화면 | 쓰기 동작 | 근거 |
|---|---|---|---|---|---|
| `nomad-lab-v1` | 앱 상태 `st` JSON (아래 표) | `DEF` | 홈·SSR 4·content·ideas·plan | `save()` 호출 모든 변경 | L629–637 |
| `nomad-theme` | `'dark'`\|`'light'` | `'dark'` | 전 화면(상단 바) | 테마 버튼 | L1289–1292 |
| `nomad-lbl` | `{s:'cap'\|'light'\|'text', z:'m'\|'l'}` | `{s:'cap',z:'m'}` | brain 탐색기 | 글자 스타일·글자 크게 버튼 | L1476–1484 |
- 로드 규칙: 파싱 실패 또는 `lv`/`days` 없으면 DEF 전체, 누락 키만 DEF로 채움, `start` 비면 오늘(YYYY-MM-DD) (L632–636). 쓰기는 try/catch (L637).
### 4.2 `st` 필드 (`DEF` L630)
| 필드 | 구조 | 기본값 | 쓰기 동작 |
|---|---|---|---|
| `lv` | `{s1..s4:[0/1,0/1,0/1]}` | s1 [1,0,0], s2 [1,0,0], s3·s4 [0,0,0] | 레벨 완료 체크 L785 |
| `days` | `[7]` 0/1 | [1,1,0,0,0,0,0] | 목표·계획 체크 L787, day 모달 L869 |
| `ck` | `[4]` 0/1 | [0,0,0,0] | 체크리스트 L788 |
| `start` | `'YYYY-MM-DD'` | '' → 오늘 | 날짜 모달 "이 날짜부터 시작" L870, "시작일을 오늘로" L1196 |
| `ideas` | `[{id,t,cat,sc}]` | [] | 추가 L932, 별점 L945, 삭제 L947 |
| `content` | `null` 또는 `[{t,ch,s}]` | null(→`CDEF` 표시) | 첫 변경 시 CDEF 복사 후 수정 L924 |
| `routines` | `[1,1,0]` | [1,1,0] | 코드상 쓰기·읽기 없음 |
| `skills` | `[{n,c,u}]` | 오늘일정_보고 /daily-report 주 12회 · 회의록 정리 /meeting-notes 주 4회 · 전자책 목차·시장성 분석 /ebook-outline 주 2회 | skill 모달 |
| `rt` | `[{n,t,c,on}]` | 오늘 할 일 브리핑 매일 09:00 /daily-report 1 · 지난주 매출·콘텐츠 요약 매주 월 08:30 /weekly-review 1 · 아이디어 패드 정리 매일 22:00 /idea-digest 0 | rt 모달, 토글 L881 |
| `exts` | `[{n,d,on}]` | 지메일(커넥터 · 메일 확인,1) · 구글 캘린더(커넥터 · 일정 등록,1) · 구글 드라이브(커넥터 · 문서 찾기,1) · Supabase(MCP · DB 조회,0) · brain-explorer(직접 만든 도구 · Extensions/,1) | ext 모달 |
| `recent` | `[{t,n,id,w}]` | MD AGENTS.md agents 방금 · MD 전체목록.md all 1시간 전 · MD 쇼츠 대본_최종.md c_s1 어제 · MD 프로젝트 기획서.md d_s1 어제 · XLS 월간 매출 정리.xlsx f_s1 3일 전 | recent 모달(새 항목은 맨 앞) |
| `notes` | `{'YYYY-MM-DD': 메모}` | {} | date 모달(빈 값이면 삭제) |
| `dayText` | `[7]` 문자열 | [] | day 모달(기본값과 같으면 '') |
### 4.3 편집 모달 (`editFor` L863–871, `openEdit` L843–858)
| `data-edit` 타입 | 제목(신규/편집) | 필드(키·라벨·형식) | 삭제 |
|---|---|---|---|
| `skill:new\|i` | 스킬 추가/편집 | n 이름(필수) · c 호출 명령 (예: /daily-report) · u 사용 빈도 (예: 주 12회) | 편집 시 |
| `rt:new\|i` | 루틴 추가/편집 | n 루틴 이름(필수) · t 실행 시각 · c 호출할 스킬 · on 상태 select(켜짐/꺼짐) | 편집 시 |
| `ext:new\|i` | 익스텐션 추가/편집 | n 이름(필수) · d 종류·용도 · on 상태 select(연결됨/대기) | 편집 시 |
| `recent:new\|i` | 최근 파일 추가/편집 | n 파일 이름(필수) · t 종류 select(MD/XLS/PDF/DOC/TXT) · id 탐색기에서 열 노드 select(`NODEOPT` 8개: agent·sb·agents·all·c_s1·d_s1·f_s1·(연결 없음)) · w 시점 | 편집 시 |
| `day:i` | n일차 목표 편집 | t 할 일 textarea · d 상태 select(완료/미완료) | dayText 있을 때 "기본값으로" |
| `date:YYYY-MM-DD` | 날짜 편집 | note 메모 textarea · start 7일 계획 시작일 select(변경 안 함/이 날짜부터 시작) | 없음 |
- 버튼: 삭제(조건) · 취소 · 저장(submit). 닫기: 배경 클릭·Esc·취소. 저장 후 `commit()` = save → 닫기 → renderHome → refresh → (plan 렌더됨이면) renderPlan (L852, L859–861).
- 신규 기본값: skill `{c:'/'}`, rt `{t:'매일 09:00',c:'/',on:1}`, ext `{d:'커넥터 · ',on:0}`, recent `{t:'MD',w:'방금'}` (L865–868).
### 4.4 `window.__D` (L602)
- 구조: `{prompts:{…12개}, pages:{ssr:[13개 문자열]}}`.
- `prompts` 키: `node`, `skill1`, `skill2`, `skill3a`, `skill3b`, `brain1`, `brain2`, `brain3`, `routine1`, `routine2`, `ext1`, `ext2`.
- 런타임 추가 키(`P`에 병합): `art_install`, `art_color`, `art_card` (L974), `ai_<16개 앱 id>` (L1080), `art_common` (L1081), `art_multi` (L1082).
- `pages.ssr[0..12]`: SSR+ 가이드 13쪽의 쪽별 추출 텍스트(표지, 시작하기 전에, 사전 설치, Part 1–4 각 2–3쪽, 7일 세팅 계획). ArtCraft 가이드 텍스트는 없음.
## 5. 3D
### 5.1 홈 입자 구 (L1744–1903)
| 항목 | 사실 |
|---|---|
| 클러스터 `CL` 5개 | agent 메인 에이전트 "AGENTS.md" n1500 r1.6 `--accent` 원형 → sel `agent` / root 규칙 문서 "6개" n520 `--c-root` → `sb` / content 콘텐츠 "7개" n640 → `c_dir` / dev 개발 "6개" n580 → `d_dir` / fin 재무 "5개" n500 → `f_dir` (위성 4개는 사각 라벨) (L1751–1757) |
| 배치 | 중앙 + 4위성 (x ±0.31·가시폭, y ±0.27·가시높이, z ±2.2), 중앙→위성 선 4개, 위성 간 연결은 빈 코드 (L1814–1824) |
| 입자 | 80% 피보나치 구 껍질 + 20% 내부, 셰이더 반짝임·호흡, 다크=Additive / 라이트=Normal 블렌딩, 다크에서만 중앙 글로우 (L1780–1787, L1804–1809) |
| 상호작용 | 드래그 회전(관성, 터치는 yaw만), 자동 회전 0.12rad/s, 호버 강조, 구·라벨 클릭 → `#brain` + `__brainSelect(sel)` (L1767–1768, L1848, L1875–1897) |
| 동작 조건 | `__view==='home'` 이고 화면에 보일 때만 그림, 첫 진입 시 등장 애니메이션 1회 (L1863–1872) |
| 폴백 | THREE 없음/WebGL 실패 → `#hnogl` "이 브라우저에서는 3D 장면을 그릴 수 없습니다…" (L532, L1769) |
### 5.2 세컨드 브레인 탐색기 (L560–599 템플릿, L1300–1743)
- 마운트: brain 화면 렌더 시 `BRAIN_HTML` 삽입 후 `brain:mounted` 1회 (L773, L1257, L1742).
- 노드 `NODES` 25개 필드: `id, kind, dom, parent?, name, path, desc, body?` (L1317–1356).

| kind (`KIND`) | 개수 | id |
|---|---|---|
| agent 메인 에이전트 | 1 | agent |
| folder 폴더 | 4 | sb, c_dir, d_dir, f_dir |
| rule 규칙 문서 | 5 | agents, rule_idx, rule_std, log, all |
| index 길잡이(색인) | 7 | c_main, c_video, c_ebook, d_main, d_dash, f_main, f_month |
| source 원본 파일 | 8 | c_s1–c_s3, d_s1–d_s3, f_s1, f_s2 (body는 공통 `SRC` 문구) |

| 분야 `dom` | 색 변수 (`DOM_VAR` L1315) |
|---|---|
| agent | `--accent` |
| root | `--c-root` |
| content | `--c-content` |
| dev | `--c-dev` |
| fin | `--c-fin` |
- 엣지: 포함 `CE` = `parent` 관계 15개(실선), 링크 `LINKS`/`LE` 26개(점선, 방향 있음, 링크선 위 이동 펄스) (L1357–1368, L1537–1550).
- 배치: 시드 고정 힘 기반 시뮬레이션 700회, 3D(시드 11)·2D(시드 23) 각각, 반경 11로 정규화, 중심 노드 고정·최소 거리 4.8 (L1377–1404).
- 크기: agent 2.3, sb 1.5, 기타 폴더 1.2, source 0.42, 나머지 0.58; 입자 수 agent 1500 / folder 320 / rule·index 150 / source 70 (L1510, L1529).

| 상호작용 | 사실 | 근거 |
|---|---|---|
| 회전/이동 | 3D: 드래그 회전(우클릭·Shift=이동), 2D: 드래그 이동, 두 손가락 핀치+이동, 이동 범위 반경 14 | L1701–1707, L1680 |
| 줌 | 휠·핀치·+/− 버튼(×1.3), 거리 8–70, "전체 보기"=선택 해제·리셋 | L1682, L1720, L1734–1739 |
| 선택 | 클릭(이동 <6px, <600ms) → 카메라 이동·고리 표시·관련 엣지 강조·나머지 흐림; 패널 상세(종류·경로·설명·연결된 항목(들어 있는 폴더/포함/링크/링크한 문서)·미리보기) | L1449–1454, L1714, L1426–1438 |
| 패널 기본 | "파일 목록" 트리(agent → sb 하위) + "업무 폴더의 원본 파일" | L1421–1424 |
| 검색 | `#q` 이름+설명+본문+경로 부분일치, "n건 일치"/"일치 없음", Enter=첫 일치 선택, Esc=해제 | L1462–1472 |
| 3D/2D | `data-mode` 전환, 1초 보간, 힌트 문구 변경 | L1723–1733 |
| 라벨 옵션 | 스타일 캡슐/밝은/글자만(`data-lbl`), 글자 크게(`data-lsz=l`, +3px) | L569, L421–424, L1475–1485 |
| 라벨 표시 | 폴더·에이전트 항상, 그 외 근접(거리<21)·선택·호버·이웃·검색 일치 시 | L1609–1610 |
| 기타 | 자동 회전 토글(3D, 미선택, 2.5초 유휴 후), 다시 재생(등장 애니메이션), 3초 후 미등장 노드 강제 표시, WebGL 컨텍스트 복구 | L1589, L1740–1741, L1660–1663 |
| 외부 진입 | `window.__brainSelect(id)` (홈 최근 파일·입자 구) | L1486, L879 |
| 폴백 | WebGL 불가 → `#nogl` 안내, 모드·줌·자동·재생 버튼 disabled; 패널·검색은 동작 | L580, L1488–1492 |
## 6. 디자인 토큰
### 6.1 색 (L7–10 라이트, L25–28·L32–35 다크)
| 토큰 | 라이트 | 다크 |
|---|---|---|
| --bg | #FAF6F2 | #0D0A09 |
| --panel | #FFFFFF | #16100E |
| --panel2 | #F4EDE6 | #1F1713 |
| --accent-soft | #FDEBE2 | #34211B |
| --ink | #201A17 | #F4ECE6 |
| --muted | #6B6059 | #A99C93 |
| --line | #E6DDD5 | #2D231E |
| --accent | #E8553C | #FF8D74 |
| --accent-ink | #B8412A | #FF9C85 |
| --on-accent | #FFFFFF | #1A1210 |
| --label | #9C3A1E | #FFB39F |
| --stage | #F4EDE6 | #120D0B |
| --edge | #A99A8F | #7C6D63 |
| --pulse | #3A2F29 | #FFE3D6 |
| --lbl-bg | rgba(255,255,255,.88) | rgba(13,10,9,.82) |
| --c-root | #6F68A3 | #A9A2DB |
| --c-content | #E8553C | #FF7B63 |
| --c-dev | #12968F | #3CC8C0 |
| --c-fin | #CF8A0C | #F2B53A |
| --ok | #1E9E62 | #4FD08F |
### 6.2 글꼴 (L11–12)
- `--font-body`: 'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif / `--font-mono`: 'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,monospace.
### 6.3 구간별 토큰 (L14–15, L18, L21)
| 토큰 | 모바일 ~767 | 태블릿 768–1199 | 데스크톱 1200~ |
|---|---|---|---|
| --fs-body | 14px | 15px | 16px |
| --fs-small | 12px | 13px | 13px |
| --fs-label | 11px | 12px | 12px |
| --fs-lead | 15px | 16px | 17px |
| --fs-h1 | 26px | 32px | 38px |
| --fs-h2 | 19px | 21px | 23px |
| --fs-h3 | 15px | 16px | 17px |
| --fs-letter | 40px | 48px | 52px |
| --fs-stat | 22px | 26px | 30px |
| --gap | 12px | 14px | 16px |
| --sec | 28px | 36px | 44px |
| --stage-h | 420px | 520px | 600px |
| --nav-w | 280px | 72px | 248px |
| --pad | 16px | 24px | 32px |
### 6.4 브레이크포인트·컨테이너 쿼리 (컨테이너 `pg` = `.main`, L80)
| 조건 | 적용 | 근거 |
|---|---|---|
| @media ≤767 | 서랍 GNB, `.bp` 1열, flow 화살표 ↓ | L90–98, L306, L368 |
| @media 768–1199 | GNB 아이콘 레일 | L99–106 |
| @media ≥768 | persona 3열, apps 2열, sw-grid 5열, board 2열 | L206, L290, L312, L323 |
| @container ≥700 / ≥940 | home 2열 / 3열(230–280 · 1fr · 230–280) | L133–140 |
| @container ≥820 | flow 5열, two 2열, spec 3열, sitemap 4열, appd summary 200px 열 | L301, L318, L361, L380, L441 |
| @container ≥900 | 가이드 썸네일 세로 열 132px | L341, L343 |
| @container ≥1000 | explorer 1fr+340px, apps 3열, board 4열, panel 높이=stage | L246, L263, L291, L324 |
| reduced-motion | 링·바·라벨·GNB 전환 없음, JS에서 GSAP·회전 생략 | L390, L611 |
### 6.5 주요 컴포넌트 클래스
| 클래스 | 용도 |
|---|---|
| `.gnb` `.logo` `.ng` `.nl`(`.ic` `.lt` `.tx` `.ct`) `.gnb-foot` `.gp` | 좌측 메뉴, 그룹명, 메뉴 링크, 진행 바 |
| `.top` `.ib` `.pill` `.scrim` | 상단 바, 아이콘 버튼, 알약 배지, 서랍 배경 |
| `.page` `.view` `.sec-head` `.eyebrow` `.sub` `.lead` | 페이지·섹션 머리 |
| `.btn`(`.pri` `.sm` `[aria-pressed]`) `.seg` `.chip` `.tab` `.tg` `.pen` `.x` | 버튼류, 분할 버튼, 칩, 탭, 토글, 편집·닫기 버튼 |
| `.panelbox` `.ph` `.two` `.note` `.callout`(`.warn`) `.foot` | 패널 카드, 2열, 강조 상자, 푸터 |
| `.cl` `.cb` `.box` `.txt` | 커스텀 체크박스 행 |
| `.home` `.col` `.stats` `.stat` `.ringbox` `.ring` `.cal` `.rf` `.mini` `.dot` `.dash3` | 홈 대시보드 |
| `.hstage-box` `.hstage` `.hbar` `.hl` `.hfoot` `.nogl` | 홈 입자 구 |
| `.vhead` `.letter` `.persona` `.pcard` `.tabs` `.lvbody` `.tbl` `.tw` `pre.tree` `.prompt` `.pgref` | SSR+ 단계 화면 |
| `.tools` `.search` `.qcount` `.explorer` `.stage` `.labels` `.lbl` `.hint` `.legend` `.panel` `.kind` `.rel` `.tn` `.pv` | 탐색기 |
| `.apps` `.app-c` `.tagx`(`.mcp`) `.flow` `.st` `.appfilter` `details.appd` `.appbody` `#appGrid` `.ac-head` `.ac-t` `.aic`(`.ds`) | ArtCraft (`.app-img`는 정의만 있고 쓰이지 않음, L446–448) |
| `.sw-grid` `.swc` `.bl` | 브랜드 |
| `.board` `.col-b` `.item` `.form` `.stars` `.empty` | 콘텐츠·아이디어 |
| `.gv` `.thumbs` `.th` `.pgview` `.pgimg` `.pgnav` `details.txt2` | 가이드 뷰어 |
| `.spec` `.sitemap` `.bp` `.devbar` `.devstage` `.devbox` `.dev` | 기획 요약·기기 미리보기 |
| `.modal` `.mb` `label.f` `.acts` `.del` | 편집 모달 |
| `.toast` `.sr` `.mono` `.kbd` | 토스트, 스크린리더 전용, 고정폭, 키 표시 |
## 7. 외부 의존성

| 종류 | URL | 근거 |
|---|---|---|
| 폰트 | https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap | L3 |
| 스크립트 | https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js | L600 |
| 스크립트 | https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js | L601 |
| 내장 이미지 | ArtCraft 앱 아이콘 16개 PNG data URI (`AICON`) | L1085 |
| 로컬 이미지(파일 밖) | `guide/ssr-01.jpg`…`guide/ssr-13.jpg`, `guide/art-1.jpg`…`guide/art-4.jpg` (상대 경로) | L1154–1156 |
| 링크 | https://getartcraft.com/ | L1124, L1139 |
| 링크 | https://github.com/storytold/craft-launcher/releases/tag/v0.13.0 ("런처 다운받기") | L1124, L1139 |
| 링크 | https://getartcraft.com/apps/<id> (craftanything → craft-anything, solidcraft 제외) | L1063 |
| 링크 | https://github.com/storytold/<id> (craftanything → craft-anything) | L979, L1052, L1063 |
| 링크 | https://github.com/storytold/vectorcraft/blob/main/AGENTS.md | L987, L970 |
| 링크 | https://github.com/storytold/filmcraft/blob/main/AGENTS.md | L992, L970 |
- 외부 링크는 모두 `target="_blank" rel="noopener noreferrer"` (L1106, L1124, L1139). GSAP·THREE가 없으면 애니메이션 생략·3D 폴백 (L611, L1443, L1760).
## 8. 코드에 없는 것 (공백 사실)

| 영역 | 사실 |
|---|---|
| 인증 | 로그인·회원가입·세션·사용자 식별 코드 없음 |
| 서버 통신 | `fetch`·`XMLHttpRequest`·WebSocket 호출 없음. 모든 데이터는 파일 내 상수 또는 localStorage |
| 저장 | 저장소는 localStorage 3키뿐(브라우저·기기 단위). 서버 저장·동기화·백업·내보내기/가져오기 없음 |
| 다중 사용자 | 공유·권한·협업·역할 구분 없음 |
| 스키마 버전 | 키 이름 `-v1` 외 마이그레이션 로직 없음(누락 키만 기본값 보충, L634) |
| 세컨드 브레인 데이터 | 노드 25·링크 26 하드코딩. 실제 폴더·파일 읽기 없음(기획 요약에 "다음: graph.json" 문구만, L1237) |
| 탐색기 편집 | 노드 추가·수정·삭제 UI 없음 |
| 콘텐츠·아이디어 | 항목 제목 수정 UI 없음(콘텐츠는 단계 변경·삭제만, 아이디어는 별점·삭제만) |
| SSR+ 콘텐츠 | 단계·레벨·프롬프트 편집 UI 없음(코드 상수) |
| ArtCraft 데이터 | 16종 정보는 2026-11-02 기준 상수, 갱신·조회 로직 없음. 아이콘은 ArtCraft 소유 이미지(상표 조건, README "참고·주의") |
| 가이드 | 쪽 이미지는 파일 밖 상대 경로; ArtCraft 가이드 텍스트·검색 없음; 원본 PDF 다운로드 링크 없음 |
| 미사용 | `st.routines` 필드(L630)와 `ART` 배열(L960)은 읽는 곳 없음 |
| 알림·예약 | 루틴 토글은 상태값만 바꿈; 실제 예약·실행·알림 없음 |
| 다국어 | 한국어 고정(i18n 없음) |
| 분석·로그 | 사용 통계·오류 수집 없음 |
| 결제 | 결제·요금제 코드 없음 |
| 테스트 | 테스트 코드 없음 |
