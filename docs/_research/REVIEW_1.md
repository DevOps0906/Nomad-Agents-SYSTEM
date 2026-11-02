# 문서 리뷰 1차 (reviewer mode=doc, 2026-11-03) — 전부 반영 대상

| # | 등급 | 위치 | 문제 | 고칠 내용 |
|---|---|---|---|---|
| 1 | 🔴 | 01_PRD.md 8절 노출 면·위협 메모 | Storage 공개 버킷 `guide`·`art-icons` 누락 | 노출 면에 "Supabase Storage 공개 버킷(guide·art-icons, 읽기 공개·쓰기 service role만)" 추가, 위협 메모 표에 같은 이름 행(인가·키·남용·결정: D16 허락 전 업로드 금지) |
| 2 | 🟡 | 02_ARCHITECTURE.md 흐름 1 설명 | "서버 데이터 없고…" 조건이 D15 트리거(가입 시 DEF 생성)·D14와 모순 | "`imported_v1_at`이 null이고 `nomad-lab-v1`이 있으면 T2에서 확인 후 가져오기"(05와 같게). flow-1.mmd도 같은 조건이면 고침 |
| 3 | 🟡 | 02_ARCHITECTURE.md 1.2·2절 | 가져오기를 "Server Action"으로 씀 | "Route Handler A01(`04_API.md`)" |
| 4 | 🟡 | 04_API.md A02 | "302 → 원래 해시 화면"이 D13과 어긋남 | "302 → 원래 경로(허용 목록 안에서만)" |
| 5 | 🟡 | 05_DATA_MODEL.md, sql 트리거 주석 | "예시/빈 상태 PRD 확인 필요" 잔존 | "D15: DEF 예시 데이터로 시작" |
| 6 | 🟡 | sql 트리거 주석 | "DEF L615" | "DEF L630" |
| 7 | 🟡 | 03_SCREENS_UX.md 위협 메모 | "크기 상한 미확인" | "상한 256KB [추정] (D14)" |
| 8 | 🟡 | 03 To-Be 차이 | 로그인 유도 시점·로그인 진입 위치 "팀장 결정 필요"가 미결 목록에 없음 | DECISIONS 미결과 PRD 7절에 Q5(로그인 진입 위치)·Q6(비로그인 중 로그인 권유 시점) 추가, 03은 번호로 링크 |
| 9 | 🟡 | 02_ARCHITECTURE.md 1.1 | "1887줄" | "1904줄" |
| 10 | 🟡 | 06_AGENT_PLAN.md task-10 | "아이콘 카드 5열 자동 채움" | "아이콘 카드(자동 채움 열 최소 236px·간격 22px)" |
| 11 | 🟡 | 06 task-01·task-02 | 보안 영향 있는데 위험도 낮음 | 보안 영향이 "없음"이 아니면 위험도 "높음" + reviewer(security) |
| 12 | 🟡 | sql user_settings update 정책, PRD 위협 메모 | 사용자가 `imported_v1_at` 되돌려 1회 제한 우회 | `imported_v1_at`은 사용자 update 불가(컬럼 권한 revoke 또는 트리거로 변경 차단, 행 delete 정책 없음/차단) — SQL 수정 + PRD 위협 메모 반영 |
| 13 | ⚪ | 05 brain_links 근거 | L1357–1368 | L1357–1361 |
| 14 | ⚪ | 06 task-05 | "프롬프트 12+런타임" vs 05 "33건" | "프롬프트 33(12+5+16)" |
| 15 | ⚪ | 03 S09 필터 | 10개처럼 나열 | "전체/이미지·사진/영상·사운드/문서·출판/디자인·설계/도구(6)" |
| 16 | ⚪ | adr/0002 | "추가 화면은 로그인뿐" | "추가 화면은 T1 로그인·T2 가져오기(D11)" |
| 17 | ⚪ | PLAN.md, 01_PRD.md 머리 | "D1~D10" | "D1~D18" |
| 18 | ⚪ | DESIGN.md "L3–2" | 잘못된 범위 | app/index.html에서 실제 줄 확인해 고침 |
| 19 | ⚪ | 05 `supabase/seed.sql` vs 02 `supabase/seed/` | 이름 불일치 | `supabase/seed.sql`로 통일(06 task-05와 같음) |
