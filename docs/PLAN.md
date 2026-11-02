# 플랫폼 기획 — Nomad-Agents-SYSTEM (목차)

> 정본: Claude 아티팩트 게시본 https://claude.ai/artifact/G8CfCTcmjSZ8RE2ujJ8vAG = [`app/index.html`](../app/index.html).
> 이 기획은 그 사이트의 구조를 거꾸로 읽어 만든 역기획이다. 화면·디자인·문구는 사이트와 1:1로 두고, 저장·인증·데이터 출처만 플랫폼으로 바꾼다.
> 사이트에 없는 내용은 각 문서에 **[추정]**으로 표시했다.

| 순서 | 문서 | 내용 |
|---|---|---|
| 0 | [`_research/SITE_FACTS.md`](_research/SITE_FACTS.md) | 사이트 사실 시트(화면·데이터·3D·토큰, 줄 근거 Lnnn) — 모든 문서의 근거 |
| 0 | [`_research/DECISIONS.md`](_research/DECISIONS.md) | 팀장 결정 D1~D10, 미결 Q1~Q4 |
| 1 | [`00_LEAN.md`](00_LEAN.md) | 문제·고객·가설·가장 싼 검증 |
| 2 | [`01_PRD.md`](01_PRD.md) | 페르소나 시나리오·범위(MVP/이후)·수익·지표·보안 |
| 3 | [`02_ARCHITECTURE.md`](02_ARCHITECTURE.md) | As-Is(단일 HTML) → To-Be(Next.js + Supabase) 구성·경계·흐름 |
| 4 | [`03_SCREENS_UX.md`](03_SCREENS_UX.md) | 화면 S00~S13, 모달 M1~M6, 상태·흐름 |
| 5 | [`DESIGN.md`](DESIGN.md) | 디자인 브리프(토큰 정본은 `src/style.css`) |
| 6 | [`04_API.md`](04_API.md) | 엔드포인트·직접 조회 구분 |
| 7 | [`05_DATA_MODEL.md`](05_DATA_MODEL.md) | 사용자·카탈로그 테이블, localStorage 이전 매핑 · [`sql/0001_init.sql`](sql/0001_init.sql) · [`diagrams/erd.mmd`](diagrams/erd.mmd) |
| 8 | [`06_AGENT_PLAN.md`](06_AGENT_PLAN.md) | 작업 분해(웨이브·담당·완료 조건) |
| — | [`adr/`](adr/) | 결정 기록 0001~0003 |
