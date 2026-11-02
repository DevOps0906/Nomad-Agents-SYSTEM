# ADR-0001 플랫폼 스택: Next.js + Supabase + Vercel

- 상태: 제안
- 날짜: 2026-11-03

| 항목 | 내용 |
|---|---|
| 맥락 | 현 사이트는 빌드 없는 단일 HTML(`app/index.html`)에 CDN(three.js r128·GSAP 3.12.5)과 localStorage 3키만 쓴다. 인증·서버 저장·다중 기기 동기화가 없다(SITE_FACTS 7·8). 플랫폼(D6 MVP)에는 로그인·사용자별 저장·RLS가 필요하다. |
| 선택 | Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Supabase(Postgres·Auth 매직링크·RLS·Storage) · three.js(최신) · GSAP 3 · Vercel 배포. **버전은 모두 [추정], 착수 시 최신 stable 재확인 후 이 ADR에 기록.** 별도 API 서버·LLM 연동은 두지 않는다(사이트에 서버 통신·AI 호출 근거 없음, D9). |
| 대안 | ① 단일 HTML 유지 + Supabase JS 직접 호출: 빠르나 13화면·모달 6종을 1파일로 계속 키우기 어렵고 서버 측 검증 지점이 없다. ② Next.js + FastAPI + DB: 사이트에 서버 로직 근거가 없어 과잉. ③ Firebase: Postgres RLS·SQL 시드(ADR-0003)와 맞지 않고 팀 스택 스킬(stack-supabase)이 없다. |
| 결과 | 얻음: 인증·RLS·Storage를 한 서비스로, 서버 컴포넌트에서 카탈로그 캐시, Vercel 프리뷰로 화면 패리티 비교. 잃음: three.js r128 → 최신 이전 비용(API 변경 확인 필요), 빌드 단계 추가. 되돌리기: 데이터 접근 계층(02 §2)만 바꾸면 백엔드 교체 가능 — 중간 비용. |
