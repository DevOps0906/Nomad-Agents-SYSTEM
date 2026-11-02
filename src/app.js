(function(){
'use strict';
var D=window.__D,P=D.prompts;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var G=window.gsap,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 아이콘 ---------- */
var IC={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
 brand:'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
 content:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
 ideas:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
 artcraft:'<path d="M4 20c3 0 5-1 5-4a3 3 0 0 0-3-3c-2 0-3 2-2 7z"/><path d="M9 14L20 4l1 1-9 11"/>',
 guide:'<path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2z"/><path d="M4 22V5"/>',
 plan:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 spec:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'
};
var svg=function(n){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'};

/* ---------- 상태 ---------- */
var KEY='nomad-lab-v1';
var DEF={lv:{s1:[1,0,0],s2:[1,0,0],s3:[0,0,0],s4:[0,0,0]},days:[1,1,0,0,0,0,0],ck:[0,0,0,0],start:'',ideas:[],content:null,routines:[1,1,0],skills:[{n:'오늘일정_보고',c:'/daily-report',u:'주 12회'},{n:'회의록 정리',c:'/meeting-notes',u:'주 4회'},{n:'전자책 목차·시장성 분석',c:'/ebook-outline',u:'주 2회'}],rt:[{n:'오늘 할 일 브리핑',t:'매일 09:00',c:'/daily-report',on:1},{n:'지난주 매출·콘텐츠 요약',t:'매주 월 08:30',c:'/weekly-review',on:1},{n:'아이디어 패드 정리',t:'매일 22:00',c:'/idea-digest',on:0}],exts:[{n:'지메일',d:'커넥터 · 메일 확인',on:1},{n:'구글 캘린더',d:'커넥터 · 일정 등록',on:1},{n:'구글 드라이브',d:'커넥터 · 문서 찾기',on:1},{n:'Supabase',d:'MCP · DB 조회',on:0},{n:'brain-explorer',d:'직접 만든 도구 · Extensions/',on:1}],recent:[{t:'MD',n:'AGENTS.md',id:'agents',w:'방금'},{t:'MD',n:'전체목록.md',id:'all',w:'1시간 전'},{t:'MD',n:'쇼츠 대본_최종.md',id:'c_s1',w:'어제'},{t:'MD',n:'프로젝트 기획서.md',id:'d_s1',w:'어제'},{t:'XLS',n:'월간 매출 정리.xlsx',id:'f_s1',w:'3일 전'}],notes:{},dayText:[]};
var st;
try{var raw=localStorage.getItem(KEY);if(raw){st=JSON.parse(raw)}}catch(e){}
if(!st||!st.lv||!st.days){st=JSON.parse(JSON.stringify(DEF))}
Object.keys(DEF).forEach(function(k){if(st[k]===undefined){st[k]=JSON.parse(JSON.stringify(DEF[k]))}});
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
if(!st.start){st.start=iso(new Date())}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}

/* ---------- 유틸 ---------- */
var toastT;
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on')},1800)}
function copy(text,btn){
  var ok=function(){toast('복사했습니다');if(btn){var o=btn.textContent;btn.textContent='복사됨';setTimeout(function(){btn.textContent=o},1400)}};
  var fb=function(){try{var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(ta);ta.select();var r=document.execCommand('copy');document.body.removeChild(ta);if(r){ok()}else{toast('복사하지 못했습니다. 직접 선택해 주세요')}}catch(e){toast('복사하지 못했습니다. 직접 선택해 주세요')}};
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(ok,fb)}else{fb()}}catch(e){fb()}
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-copy]');
  if(b){var k=b.getAttribute('data-copy');copy(P[k]||k,b)}
  var g=e.target.closest('[data-guide]');
  if(g){var a=g.getAttribute('data-guide').split(':');openGuide(a[0],+a[1])}
});

/* ---------- 데이터: 단계 ---------- */
var SSR={
 skill:{key:'s1',letter:'S',name:'스킬',en:'SKILL',
  lead:'스킬은 AI 단축키입니다. \'오늘일정_보고\' 스킬을 만들어 두면 /daily-report 한 줄로 오늘 일정 보고를 받습니다. 같은 일을 두 번 이상 시켰다면 스킬로 만들 때입니다.',
  persona:[['취업준비생','"공고 맞춤 자소서": 채용 공고 링크를 주면 내 경험 파일에서 맞는 사례를 골라 문항별 초안 작성'],['CEO','"주간 경영 보고": 매출·현금·주요 일정을 한 장 보고서로 정리'],['직장인','"회의록 정리": 회의 녹취를 결정사항·담당자·기한 표로 정리']],
  levels:[
   {tag:'초급',title:'기본 스킬 쓰고, 내 스킬 만들기',pg:4,b:[
     {ol:['Claude 데스크톱 사이드바 사용자 지정 → 스킬에서 \'Anthropic 및 파트너 제공\' 스킬을 둘러봅니다.','가장 먼저 쓸 스킬은 skill-creator입니다. 채팅창에 "스킬 만들고 싶어"라고 말하거나 스킬 이름으로 부르면 발동합니다.','자주 쓰는 프롬프트가 있다면 통째로 붙여 넣고 스킬로 만들어 달라고 합니다.']},
     {prompt:['첫 스킬 만들기','skill1']}]},
   {tag:'중급',title:'참고자료를 담은 복합 스킬',pg:4,b:[
     {p:'스킬은 프롬프트 파일 하나로 끝나지 않습니다. 스킬 폴더 안에 참고자료를 함께 넣을 수 있습니다.'},
     {tree:'회사-ppt/\n  Skills/\n    SKILL.md       단계와 규칙 (나머지 파일을 언제 읽는지 안내)\n    style.md       디자인 가이드라인 (분위기, 정렬, 색)\n    template.html  그대로 가져다 쓸 코드 조각\n    examples/      잘된 결과 이미지'},
     {p:'텍스트·이미지·HTML·코드 모두 넣을 수 있습니다. 특히 HTML이나 코드 조각을 넣어 두면 AI가 처음부터 짜지 않고 그 코드를 바탕으로 작업해서 더 빠르고 정확해집니다.'},
     {prompt:['스킬에 참고자료 추가','skill2']}]},
   {tag:'고급',title:'스킬이 낡지 않게 개선하기',pg:5,b:[
     {p:'회사 양식이 바뀌면 예전 양식으로 만든 스킬은 맞지 않는 결과를 냅니다. 두 가지 방법으로 대비합니다.'},
     {prompt:['방법 1. 스킬 자체에 업데이트 기능 넣기','skill3a']},
     {prompt:['방법 2. 스킬을 개선하는 스킬 만들기','skill3b']},
     {done:'한 줄 호출로 결과물이 매번 같은 품질로 나온다. 결과가 마음에 안 들면 채팅이 아니라 스킬 파일을 고친다.'}]}
  ]},
 brain:{key:'s2',letter:'S',name:'세컨드 브레인',en:'SECOND BRAIN',
  lead:'여러 번 말하지 않아도 AI가 내 말뜻을 알고, 필요한 파일을 알아서 찾아 일하게 만드는 단계입니다.',
  persona:[['취업준비생','지원 회사별 폴더·경험 정리 파일·면접 기록을 길잡이 파일 하나로 연결'],['CEO','재무·영업·인사 분야별 길잡이 파일, 팀원도 같은 자료를 찾아가게 공유 드라이브에 둠'],['직장인','담당 프로젝트·보고서 최종본·회사 양식 위치를 길잡이 파일에 정리']],
  levels:[
   {tag:'초급',title:'AGENTS.md 지침 파일로 관리하기',pg:6,b:[
     {p:'프로젝트 폴더 맨 위에 AGENTS.md(또는 CLAUDE.md)를 만들면 AI가 대화를 시작할 때 항상 이 파일을 읽습니다. 여기에 아래 세 가지를 적어 둡니다.'},
     {table:{h:['항목','예시'],r:[['나와 내 일에 대해 항상 알아야 할 것','"1인 마케팅 대행사. 고객은 지역 병원 5곳"'],['원하는 결과물 형식 (톤, 형식, 길이)','"보고서는 1쪽, 표 먼저. 이모지 금지"'],['진행 중인 일과 이미 확정된 결정','"11월까지 A병원 리뉴얼 우선. 단가는 월 150만 원으로 확정"']]}},
     {prompt:['AGENTS.md 만들기','brain1']},
     {done:'새 대화에서 "지금 내가 진행 중인 일이 뭐야?"라고 물으면 설명 없이 바로 맞게 답한다.'}]},
   {tag:'중급',title:'길잡이(색인) 파일 만들기',pg:6,b:[
     {p:'자료와 AI가 만든 파일이 많아지면 AI도 필요한 파일을 찾기 어려워집니다. 폴더를 다시 정리할 필요는 없습니다. 주제별로 파일 링크를 모아 둔 길잡이 파일을 만들면 됩니다. 내 지식으로 만든 나무위키라고 생각하면 쉽습니다. 대문 역할은 AGENTS.md가 맡습니다.'},
     {tree:'AGENTS.md            대문: 분야 표 + 찾는 법\n  contents.md        콘텐츠 분야 길잡이\n    contents--영상.md  하위 길잡이: 원본 파일 링크 + 한 줄 설명\n  dev.md             개발 분야 길잡이'},
     {prompt:['세컨드 브레인 길잡이 파일 만들기','brain2']},
     {done:'"작년 ○○ 보고서 최종본 찾아줘"라고 하면 폴더 전체를 뒤지지 않고 도구 호출 3번 안에 바로 찾는다.'}]},
   {tag:'고급',title:'나만의 세컨드 브레인 탐색기 만들기',pg:8,b:[
     {p:'노션·옵시디언처럼 사용법을 따로 배울 필요 없이, 내 세컨드 브레인을 내가 원하는 방식으로 보는 탐색기를 직접 만듭니다. 파일 연결 관계를 그래프로 보고, 클릭하면 옆에서 미리보기를 띄우는 식입니다. 위쪽 3D 탐색기가 이 프롬프트의 결과물 예시입니다.'},
     {prompt:['세컨드 브레인 탐색기','brain3']}]}
  ]},
 routine:{key:'s3',letter:'R',name:'루틴',en:'ROUTINE',
  lead:'정해진 시간이 되면 일이 알아서 실행되게 만드는 단계입니다. 스킬이 AI 단축키라면, 루틴은 "매일 오전 9시에 이 단축키를 눌러"라고 시켜 두는 것입니다.',
  persona:[['취업준비생','매일 아침 8시: 관심 직무 신규 공고를 모아 마감일 순으로 정리'],['CEO','매주 월요일: 지난주 매출·지출·미수금 요약 보고'],['직장인','매일 오전 9시: 메일함·캘린더·할 일 앱을 훑어 오늘 할 일 브리핑']],
  levels:[
   {tag:'초급',title:'Claude 데스크톱 루틴',pg:9,b:[
     {ol:['Claude 데스크톱 왼쪽 사이드바 Routines로 갑니다.','만들고 싶은 루틴을 자연어로 설명하면 루틴이 만들어집니다.','첫 루틴은 1개만 만들고, 일주일 동안 결과를 확인한 뒤 다음 루틴을 추가합니다.']},
     {prompt:['첫 루틴 만들기','routine1']},
     {warn:'데스크톱 루틴은 컴퓨터와 앱이 켜져 있을 때만 실행됩니다.'}]},
   {tag:'중급',title:'꺼지지 않는 루틴 만들기',pg:9,b:[
     {p:'컴퓨터가 꺼져 있어도 루틴이 돌게 하려면 항상 켜져 있는 다른 컴퓨터에 AI 에이전트를 하나 설치해 둡니다.'},
     {table:{h:['방법','설명'],r:[['클라우드 컴퓨터 대여','Hostinger 같은 서비스에서 서버를 빌려 에이전트 설치'],['집에 남는 컴퓨터','안 쓰는 PC에 에이전트를 설치하고 계속 켜 둠']]}},
     {p:'설치할 에이전트는 OpenClaw, Hermes 등 여러 가지가 있습니다. Hermes는 세팅이 간단하고 24시간 켜 두기 좋습니다. 기존 컴퓨터의 스킬·세컨드 브레인 파일은 Syncthing으로 동기화합니다. 두 컴퓨터에 Syncthing을 설치하고 프로젝트 폴더를 공유 폴더로 지정하면 같은 파일을 양쪽에서 씁니다.'},
     {prompt:['다른 컴퓨터에 Hermes 세팅 안내','routine2']}]},
   {tag:'고급',title:'매니지드 에이전트 (지켜볼 단계)',pg:10,b:[
     {p:'처음부터 클라우드에 에이전트와 모든 자료를 올려 두는 방식입니다. 동기화 없이 어디서든 같은 에이전트가 일합니다. Claude도 매니지드 에이전트 기능으로 이 방향을 시험하고 있습니다.'},
     {warn:'아직 일반 사용자가 쓰기에는 완성 단계가 아니므로, 중급까지 세팅해 두고 사용하시길 추천드립니다.'},
     {done:'시키지 않아도 정해진 시간에 결과물이 도착한다.'}]}
  ]},
 ext:{key:'s4',letter:'+',name:'익스텐션',en:'EXTENSION',
  lead:'에이전트가 실제 업무를 하려면 브라우저를 조작하고, 지메일을 읽고, 외부 데이터를 가져오는 확장 기능이 필요합니다.',
  persona:[['취업준비생','구글 캘린더로 면접 일정 등록, 브라우저로 채용 사이트 공고 수집'],['CEO','회계·결제 서비스 연결, 공공데이터 MCP로 시장 자료 조회'],['직장인','지메일·구글 드라이브 연결로 메일 확인과 문서 찾기']],
  levels:[
   {tag:'초급',title:'Claude 데스크톱 커넥터',pg:11,b:[
     {ol:['Claude 데스크톱 사용자 지정 → 커넥터로 갑니다.','지메일·구글 드라이브·캘린더 등은 클릭 한 번으로 연결됩니다.','연결 후 "지메일에서 어제 온 견적 요청 찾아줘"처럼 바로 시킬 수 있습니다.']},
     {p:'대부분 해외 서비스라 국내 업무에 딱 맞는 커넥터는 부족할 수 있습니다. 그때 중급으로 넘어갑니다.'}]},
   {tag:'중급',title:'커넥터 찾기 (MCP → CLI → API)',pg:11,b:[
     {p:'기본 커넥터 외에 연결하는 방법은 세 가지이고, 아래로 갈수록 연결이 어렵습니다.'},
     {table:{h:['종류','설명','난이도'],r:[['MCP','AI 전용 연결 규격. 설정만 추가하면 바로 씀','쉬움'],['CLI','터미널 명령 도구. AI가 명령을 대신 실행','보통'],['API','서비스가 제공하는 데이터 창구. 키 발급과 코드 필요','어려움']]}},
     {p:'예: 건축물대장을 연결하고 싶다면 "건축물대장 MCP"로 검색해 README를 찾고, AI에게 연결 방법을 안내해 달라고 합니다. MCP가 없으면 CLI나 API로 찾아 달라고 합니다.'},
     {prompt:['커넥터 찾기','ext1']},
     {p:'매번 검색하기 번거롭다면 search-connector 스킬을 설치해 두면 상황에 맞는 커넥터를 AI가 찾아 줍니다.'}]},
   {tag:'고급',title:'익스텐션 직접 만들기',pg:11,b:[
     {p:'딱 맞는 도구가 없으면 직접 만듭니다. 예를 들어 노션·옵시디언 대신 쓰는 나만의 마크다운 뷰어, 자주 쓰는 이미지·영상을 모아 보는 에셋 대시보드 같은 것입니다. "이런 기능을 만들고 싶어"라고 말하면 에이전트가 준비사항과 만드는 순서를 안내합니다.'},
     {prompt:['만들 익스텐션 찾기','ext2']},
     {done:'매주 쓰는 외부 서비스·자료를 에이전트가 직접 읽고 쓴다.'}]}
  ]}
};
var VIEWS={
 home:{t:'홈'},
 skill:{t:'S · 스킬',ssr:SSR.skill},brain:{t:'S · 세컨드 브레인',ssr:SSR.brain},routine:{t:'R · 루틴',ssr:SSR.routine},ext:{t:'+ · 익스텐션',ssr:SSR.ext},
 brand:{t:'브랜드 라이브러리'},content:{t:'콘텐츠 라이브러리'},ideas:{t:'아이디어 패드'},
 artcraft:{t:'ArtCraft 앱'},guide:{t:'사용 가이드 (PDF)'},plan:{t:'7일 세팅 계획'},spec:{t:'기획 요약'}
};
var NAV=[
 {g:'',items:[{id:'home',t:'홈',ic:'home'}]},
 {g:'SSR+ FRAMEWORK',items:[{id:'skill',t:'스킬',en:'SKILL',lt:'S',key:'s1'},{id:'brain',t:'세컨드 브레인',en:'SECOND BRAIN',lt:'S',key:'s2'},{id:'routine',t:'루틴',en:'ROUTINE',lt:'R',key:'s3'},{id:'ext',t:'익스텐션',en:'EXTENSION',lt:'+',key:'s4'}]},
 {g:'다른 대시보드',items:[{id:'brand',t:'브랜드 라이브러리',ic:'brand'},{id:'content',t:'콘텐츠 라이브러리',ic:'content'},{id:'ideas',t:'아이디어 패드',ic:'ideas'}]},
 {g:'앱',items:[{id:'artcraft',t:'ArtCraft',ic:'artcraft'}]},
 {g:'가이드',items:[{id:'guide',t:'사용 가이드 (PDF)',ic:'guide'},{id:'plan',t:'7일 세팅 계획',ic:'plan'},{id:'spec',t:'기획 요약',ic:'spec'}]}
];
$('#nav').innerHTML=NAV.map(function(g){
  return (g.g?'<p class="ng" aria-hidden="true">'+esc(g.g)+'</p>':'')+g.items.map(function(i){
    var left=i.lt?'<span class="lt" aria-hidden="true">'+esc(i.lt)+'</span>':'<span class="ic">'+svg(i.ic)+'</span>';
    return '<a class="nl" href="#'+i.id+'" data-v="'+i.id+'" title="'+esc(i.t)+'">'+left+'<span class="tx">'+esc(i.t)+(i.en?'<small>'+i.en+'</small>':'')+'</span>'+(i.key?'<span class="ct mono" data-ct="'+i.key+'"></span>':'')+'</a>';
  }).join('');
}).join('');

/* ---------- SSR 단계 뷰 ---------- */
var tabSel={};
function blocks(arr){
  return arr.map(function(b){
    if(b.p)return '<p>'+esc(b.p)+'</p>';
    if(b.ol)return '<ol>'+b.ol.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol>';
    if(b.tree)return '<pre class="tree">'+esc(b.tree)+'</pre>';
    if(b.table)return '<div class="tw"><table class="tbl"><thead><tr>'+b.table.h.map(function(h){return '<th>'+esc(h)+'</th>'}).join('')+'</tr></thead><tbody>'+b.table.r.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+esc(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
    if(b.prompt)return '<div class="prompt"><header><span>복사용 프롬프트 — '+esc(b.prompt[0])+'</span><button type="button" class="btn sm" data-copy="'+b.prompt[1]+'">복사</button></header><pre>'+esc(P[b.prompt[1]])+'</pre></div>';
    if(b.done)return '<p class="callout"><b>완료 기준</b>'+esc(b.done)+'</p>';
    if(b.warn)return '<p class="callout warn"><b>한계</b>'+esc(b.warn)+'</p>';
    return '';
  }).join('');
}
function levelHtml(vid,s,i){
  var l=s.levels[i],on=st.lv[s.key][i];
  return '<div class="lvbody" role="tabpanel" id="lvp-'+vid+'"><div class="lt2"><div><p class="eyebrow">'+l.tag.toUpperCase()+' · LEVEL '+(i+1)+'</p><h3>'+esc(l.title)+'</h3></div><div class="pgref"><button type="button" class="btn sm" data-guide="ssr:'+l.pg+'">가이드 p.'+l.pg+' 보기</button><label class="cl" style="padding:0;min-height:32px;border:0"><input type="checkbox" class="cb" data-lv="'+s.key+':'+i+'"'+(on?' checked':'')+'><span class="box"></span><span class="txt">이 레벨 완료</span></label></div></div>'+blocks(l.b)+'</div>';
}
function renderSSR(vid){
  var v=VIEWS[vid],s=v.ssr,el=$('#v-'+vid);
  if(tabSel[vid]===undefined){var f=st.lv[s.key].indexOf(0);tabSel[vid]=f<0?0:f}
  var head='<div class="vhead"><span class="letter" aria-hidden="true">'+esc(s.letter)+'</span><div class="tt"><p class="eyebrow">'+s.en+' · PART '+(['skill','brain','routine','ext'].indexOf(vid)+1)+' / 4</p><h2>'+esc(s.name)+'</h2><p class="lead">'+esc(s.lead)+'</p></div></div>';
  var per='<div style="display:flex;flex-direction:column;gap:var(--gap)"><div class="sec-head"><h3>이런 분에게는 이런 '+esc(s.name)+'</h3></div><div class="persona">'+s.persona.map(function(p){return '<div class="pcard"><b>'+esc(p[0])+'</b><span>'+esc(p[1])+'</span></div>'}).join('')+'</div></div>';
  var tabs='<div class="tabs" role="tablist" aria-label="레벨 선택">'+s.levels.map(function(l,i){return '<button type="button" role="tab" class="tab" data-tab="'+vid+':'+i+'" aria-selected="'+(tabSel[vid]===i?'true':'false')+'">'+l.tag+' <span class="ok mono">'+(st.lv[s.key][i]?'✓':'')+'</span></button>'}).join('')+'</div>';
  var extra=vid==='brain'?'<div style="display:flex;flex-direction:column;gap:var(--gap)">'+BRAIN_HTML+'</div>':'';
  el.innerHTML='<div style="display:flex;flex-direction:column;gap:var(--sec)">'+head+extra+per+'<div style="display:flex;flex-direction:column;gap:var(--gap)">'+tabs+'<div id="lvmount-'+vid+'">'+levelHtml(vid,s,tabSel[vid])+'</div></div></div>';
}
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-tab]');if(!t)return;
  var a=t.getAttribute('data-tab').split(':'),vid=a[0],i=+a[1],s=VIEWS[vid].ssr;
  tabSel[vid]=i;
  $$('[data-tab^="'+vid+':"]').forEach(function(b){b.setAttribute('aria-selected',b===t?'true':'false')});
  $('#lvmount-'+vid).innerHTML=levelHtml(vid,s,i);
});
document.addEventListener('change',function(e){
  var c=e.target;
  if(c.dataset&&c.dataset.lv){var a=c.dataset.lv.split(':');st.lv[a[0]][+a[1]]=c.checked?1:0;save();refresh();
    $$('[data-tab]').forEach(function(b){var p=b.getAttribute('data-tab').split(':'),s=VIEWS[p[0]].ssr;var ok=b.querySelector('.ok');if(ok)ok.textContent=st.lv[s.key][+p[1]]?'✓':''})}
  else if(c.dataset&&c.dataset.day!==undefined){st.days[+c.dataset.day]=c.checked?1:0;save();refresh()}
  else if(c.dataset&&c.dataset.ck!==undefined){st.ck[+c.dataset.ck]=c.checked?1:0;save();refresh()}
});

/* ---------- 홈 ---------- */
var DAYS=[
 ['사전 설치(p.3) + AGENTS.md 만들기(p.6 초급)','세컨드 브레인'],
 ['가장 자주 시키는 일로 첫 스킬 만들기(p.4)','스킬'],
 ['세컨드 브레인 길잡이 파일 만들기(p.6 중급)','세컨드 브레인'],
 ['2일차 스킬을 루틴으로 예약(p.9)','루틴'],
 ['커넥터 하나 연결(p.11)','익스텐션'],
 ['전체를 한 번씩 실행. 결과가 어긋나면 채팅이 아니라 파일을 고친다','전체'],
 ['이번 주에 가장 아쉬웠던 곳에 스킬·루틴·익스텐션 하나 추가','전체']
];
var CHECK=[['S 스킬','한 줄 호출로 결과물이 매번 같은 품질로 나온다'],['S 세컨드 브레인','새 대화에서 "지금 진행 중인 일"을 설명 없이 맞게 답한다'],['R 루틴','시키지 않아도 정해진 시간에 결과물이 도착한다'],['+ 익스텐션','매주 쓰는 외부 서비스를 에이전트가 직접 다룬다']];
function dayIdx(){var a=new Date(st.start+'T00:00:00'),b=new Date();b.setHours(0,0,0,0);return Math.round((b-a)/864e5)}
function dayLabel(i){return (st.dayText&&st.dayText[i])||DAYS[i][0]}
var NODEOPT=[['agent','메인 에이전트'],['sb','second-brain/'],['agents','AGENTS.md'],['all','전체목록.md'],['c_s1','쇼츠 대본_최종.md'],['d_s1','프로젝트 기획서.md'],['f_s1','월간 매출 정리.xlsx'],['','(연결 없음)']];
function renderHome(){
  var now=new Date();
  $('#today').textContent=now.getFullYear()+'.'+String(now.getMonth()+1).padStart(2,'0')+'.'+String(now.getDate()).padStart(2,'0')+' · '+['일','월','화','수','목','금','토'][now.getDay()]+'요일';
  var emp=function(m){return '<li class="empty">'+m+'</li>'};
  $('#rExt').innerHTML=st.exts.length?st.exts.map(function(x,i){return '<li><button type="button" class="rowb" data-edit="ext:'+i+'"><span class="dot'+(x.on?' on':'')+'"></span><span class="nm"><b>'+esc(x.n)+'</b><span>'+esc(x.d)+'</span></span><span class="sub">'+(x.on?'연결됨':'대기')+'</span></button></li>'}).join(''):emp('+ 추가로 커넥터를 등록하세요');
  $('#rSkill').innerHTML=st.skills.length?st.skills.map(function(s,i){return '<li><button type="button" class="rowb" data-edit="skill:'+i+'"><span class="dot on"></span><span class="nm"><b>'+esc(s.n)+'</b><span class="mono">'+esc(s.c)+'</span></span><span class="sub mono">'+esc(s.u)+'</span></button></li>'}).join(''):emp('+ 추가로 스킬을 등록하세요');
  $('#rRoutine').innerHTML=st.rt.length?st.rt.map(function(r,i){return '<li><button type="button" class="rowb" data-edit="rt:'+i+'"><span class="nm"><b>'+esc(r.n)+'</b><span>'+esc(r.t)+' · '+esc(r.c)+'</span></span></button><button type="button" class="tg" data-rt="'+i+'" aria-pressed="'+(r.on?'true':'false')+'" aria-label="'+esc(r.n)+' 켜기/끄기"></button></li>'}).join(''):emp('+ 추가로 루틴을 등록하세요');
  $('#recent').innerHTML=st.recent.length?st.recent.map(function(r,i){return '<li><button type="button" class="open" data-open="'+esc(r.id)+'"><span class="fi">'+esc(r.t)+'</span><span class="fn">'+esc(r.n)+'</span><span class="ft">'+esc(r.w)+'</span></button><button type="button" class="pen" data-edit="recent:'+i+'" aria-label="'+esc(r.n)+' 편집">✎</button></li>'}).join(''):emp('+ 추가로 파일을 등록하세요');
  $('#dash3').innerHTML=[['brand','브랜드 라이브러리','5색'],['content','콘텐츠 라이브러리','4단계'],['ideas','아이디어 패드','메모']].map(function(d){return '<a href="#'+d[0]+'">'+svg(d[0])+'<b>'+d[1]+'</b><small>'+d[2]+'</small></a>'}).join('');
  renderGoals();renderCal();
}
function renderGoals(){
  var di=Math.max(0,Math.min(6,dayIdx()));
  var idx=[];for(var k=0;k<3;k++){if(di+k<=6)idx.push(di+k)}
  if(idx.length<3){idx=[4,5,6]}
  $('#goals').innerHTML=idx.map(function(i){return '<li><label class="cl"><input type="checkbox" class="cb" data-day="'+i+'"'+(st.days[i]?' checked':'')+'><span class="box"></span><span class="txt"><b class="mono" style="color:var(--label)">'+(i+1)+'일차</b> '+esc(dayLabel(i))+'</span></label><button type="button" class="pen" style="margin-top:6px" data-edit="day:'+i+'" aria-label="'+(i+1)+'일차 편집">✎</button></li>'}).join('');
}
function renderCal(){
  var n=new Date(),y=n.getFullYear(),m=n.getMonth(),first=new Date(y,m,1).getDay(),len=new Date(y,m+1,0).getDate();
  $('#calTitle').textContent=y+'년 '+(m+1)+'월';
  var s0=new Date(st.start+'T00:00:00'),cells=['일','월','화','수','목','금','토'].map(function(d){return '<span class="dw">'+d+'</span>'});
  var total=Math.ceil((first+len)/7)*7;
  for(var i=0;i<total;i++){
    var dt=new Date(y,m,1-first+i),key=iso(dt),diff=Math.round((dt-s0)/864e5),cls='d';
    if(dt.getMonth()!==m)cls+=' mut';
    if(diff>=0&&diff<=6){cls+=' plan';if(st.days[diff])cls+=' done'}
    if(key===iso(n))cls+=' today';
    if(st.notes&&st.notes[key])cls+=' has';
    cells.push('<button type="button" class="'+cls+'" data-edit="date:'+key+'" aria-label="'+(dt.getMonth()+1)+'월 '+dt.getDate()+'일 편집">'+dt.getDate()+'</button>');
  }
  $('#cal').innerHTML=cells.join('');
}
/* ---- 편집 모달 ---- */
var modal=document.createElement('div');modal.className='modal';modal.hidden=true;
modal.innerHTML='<div class="mb" role="dialog" aria-modal="true" aria-labelledby="mt"><h3 id="mt"></h3><form id="mf"></form></div>';
document.body.appendChild(modal);
var lastFocus=null;
function closeModal(){modal.hidden=true;if(lastFocus&&lastFocus.focus){try{lastFocus.focus()}catch(e){}}}
function openEdit(cfg){
  lastFocus=document.activeElement;
  $('#mt').textContent=cfg.title;
  $('#mf').innerHTML=cfg.fields.map(function(f){
    var v=f.v===undefined?'':f.v,id='mf-'+f.k,ctl;
    if(f.opts){ctl='<select id="'+id+'" name="'+f.k+'">'+f.opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(o[0])===String(v)?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select>'}
    else if(f.area){ctl='<textarea id="'+id+'" name="'+f.k+'">'+esc(v)+'</textarea>'}
    else{ctl='<input id="'+id+'" name="'+f.k+'" value="'+esc(v)+'"'+(f.req?' required':'')+'>'}
    return '<label class="f" for="'+id+'">'+esc(f.l)+ctl+'</label>';
  }).join('')+'<div class="acts">'+(cfg.del?'<button type="button" class="btn del" id="mdel">삭제</button>':'')+'<button type="button" class="btn" id="mcan">취소</button><button type="submit" class="btn pri">저장</button></div>';
  modal.hidden=false;
  var f0=$('#mf input,#mf textarea,#mf select');if(f0)f0.focus();
  $('#mcan').onclick=closeModal;
  if(cfg.del){$('#mdel').onclick=function(){cfg.del();commit()}}
  $('#mf').onsubmit=function(e){e.preventDefault();var o={};$$('#mf [name]').forEach(function(el){o[el.name]=el.value});cfg.save(o);commit()};
}
function commit(){save();closeModal();renderHome();refresh();['plan','skill','brain','routine','ext'].forEach(function(k){if(rendered[k]&&k==='plan')renderPlan()})}
modal.addEventListener('click',function(e){if(e.target===modal)closeModal()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)closeModal()});
var ONOFF=[['1','켜짐/연결됨'],['0','꺼짐/대기']];
function editFor(type,idx){
  var isNew=idx==='new',i=+idx;
  if(type==='skill'){var o=isNew?{n:'',c:'/',u:''}:st.skills[i];return {title:isNew?'스킬 추가':'스킬 편집',fields:[{k:'n',l:'이름',v:o.n,req:1},{k:'c',l:'호출 명령 (예: /daily-report)',v:o.c},{k:'u',l:'사용 빈도 (예: 주 12회)',v:o.u}],save:function(v){var r={n:v.n,c:v.c,u:v.u};if(isNew)st.skills.push(r);else st.skills[i]=r},del:isNew?null:function(){st.skills.splice(i,1)}}}
  if(type==='rt'){var r0=isNew?{n:'',t:'매일 09:00',c:'/',on:1}:st.rt[i];return {title:isNew?'루틴 추가':'루틴 편집',fields:[{k:'n',l:'루틴 이름',v:r0.n,req:1},{k:'t',l:'실행 시각',v:r0.t},{k:'c',l:'호출할 스킬',v:r0.c},{k:'on',l:'상태',v:r0.on?'1':'0',opts:[['1','켜짐'],['0','꺼짐']]}],save:function(v){var r={n:v.n,t:v.t,c:v.c,on:+v.on};if(isNew)st.rt.push(r);else st.rt[i]=r},del:isNew?null:function(){st.rt.splice(i,1)}}}
  if(type==='ext'){var x=isNew?{n:'',d:'커넥터 · ',on:0}:st.exts[i];return {title:isNew?'익스텐션 추가':'익스텐션 편집',fields:[{k:'n',l:'이름',v:x.n,req:1},{k:'d',l:'종류·용도',v:x.d},{k:'on',l:'상태',v:x.on?'1':'0',opts:[['1','연결됨'],['0','대기']]}],save:function(v){var r={n:v.n,d:v.d,on:+v.on};if(isNew)st.exts.push(r);else st.exts[i]=r},del:isNew?null:function(){st.exts.splice(i,1)}}}
  if(type==='recent'){var f=isNew?{t:'MD',n:'',id:'',w:'방금'}:st.recent[i];return {title:isNew?'최근 파일 추가':'최근 파일 편집',fields:[{k:'n',l:'파일 이름',v:f.n,req:1},{k:'t',l:'종류',v:f.t,opts:[['MD','MD'],['XLS','XLS'],['PDF','PDF'],['DOC','DOC'],['TXT','TXT']]},{k:'id',l:'탐색기에서 열 노드',v:f.id,opts:NODEOPT},{k:'w',l:'시점',v:f.w}],save:function(v){var r={t:v.t,n:v.n,id:v.id,w:v.w};if(isNew)st.recent.unshift(r);else st.recent[i]=r},del:isNew?null:function(){st.recent.splice(i,1)}}}
  if(type==='day'){return {title:(i+1)+'일차 목표 편집',fields:[{k:'t',l:'할 일',v:dayLabel(i),area:1},{k:'d',l:'상태',v:st.days[i]?'1':'0',opts:[['1','완료'],['0','미완료']]}],save:function(v){st.dayText[i]=v.t.trim()===DAYS[i][0]?'':v.t.trim();st.days[i]=+v.d},del:st.dayText[i]?function(){st.dayText[i]=''}:null,delLabel:'기본값으로'}}
  if(type==='date'){var key=idx;return {title:key+' 편집',fields:[{k:'note',l:'메모',v:(st.notes&&st.notes[key])||'',area:1},{k:'start',l:'7일 계획 시작일',v:'0',opts:[['0','변경 안 함'],['1','이 날짜부터 시작']]}],save:function(v){if(!st.notes)st.notes={};if(v.note.trim())st.notes[key]=v.note.trim();else delete st.notes[key];if(v.start==='1')st.start=key}}}
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-edit]');if(!b)return;
  var a=b.getAttribute('data-edit'),p=a.indexOf(':'),cfg=editFor(a.slice(0,p),a.slice(p+1));
  if(cfg){if(cfg.delLabel){cfg.del=cfg.del||null}openEdit(cfg);if(cfg.delLabel&&cfg.del){$('#mdel').textContent=cfg.delLabel}}
});
document.addEventListener('click',function(e){
  var o=e.target.closest('[data-open]');
  if(o){var id=o.getAttribute('data-open');if(!id){return}location.hash='#brain';setTimeout(function(){if(window.__brainSelect)window.__brainSelect(id)},60)}
  var r=e.target.closest('[data-rt]');
  if(r){var i=+r.getAttribute('data-rt');st.rt[i].on=st.rt[i].on?0:1;r.setAttribute('aria-pressed',st.rt[i].on?'true':'false');save()}
});
var ringEl=$('#ring'),shown=0;
function refresh(){
  var done=0,tot=0;
  ['s1','s2','s3','s4'].forEach(function(k){var n=st.lv[k].reduce(function(a,b){return a+(b?1:0)},0);done+=n;tot+=3;var c=$('[data-ct="'+k+'"]');if(c)c.textContent=n+'/3'});
  var pct=Math.round(done/tot*100);
  ringEl.style.strokeDashoffset=251.33*(1-pct/100);
  $('#doneTxt').textContent=done+'/'+tot;
  var dc=st.days.reduce(function(a,b){return a+(b?1:0)},0);
  $('#stDays').textContent=dc+'/7';
  $('#stIdeas').textContent=st.ideas.length;
  $('#stLib').textContent=contentItems().length;
  $('#gpPct').textContent=pct+'%';$('#gpBar').style.width=pct+'%';
  $('#topPill').textContent='SSR+ '+pct+'%';
  var gc=$('#goalCnt');if(gc)gc.textContent=dc+'/7';
  if(G&&!reduce){var ob={v:shown};G.to(ob,{v:pct,duration:.7,ease:'power2.out',onUpdate:function(){$('#pct').textContent=Math.round(ob.v)}})}else{$('#pct').textContent=pct}
  shown=pct;
  renderGoals();renderCal();
  var pl=$('#planList');if(pl){$$('[data-day]',pl).forEach(function(c){c.checked=!!st.days[+c.dataset.day]})}
  var pc=$('#pcnt');if(pc)pc.textContent=dc+'/7';
  var ck=$('#ckCnt');if(ck)ck.textContent=st.ck.reduce(function(a,b){return a+(b?1:0)},0)+'/4';
}

/* ---------- 콘텐츠 라이브러리 ---------- */
var CSTAT=['아이디어','기획','제작','발행'],CCH=['유튜브','블로그','전자책','뉴스레터'];
var CDEF=[
 {t:'AI 업무 시스템 SSR+ 4단계 쇼츠',ch:'유튜브',s:2},{t:'클로드 스킬 만드는 법 롱폼',ch:'유튜브',s:1},{t:'바이브코딩 입문 체크리스트',ch:'블로그',s:3},
 {t:'정부지원사업 사업계획서 작성 가이드',ch:'전자책',s:1},{t:'1인 출판사 자동화 사례',ch:'블로그',s:0},{t:'주간 AI 자동화 소식',ch:'뉴스레터',s:3},{t:'n8n 대 Make 비교',ch:'블로그',s:0},{t:'세컨드 브레인 만들기 클래스',ch:'유튜브',s:0}
];
function contentItems(){return st.content||CDEF}
var cFilter='전체';
function renderContent(){
  var it=contentItems();
  var chips='<div class="chips" role="group" aria-label="채널 필터">'+['전체'].concat(CCH).map(function(c){return '<button type="button" class="chip" data-cf="'+c+'" aria-pressed="'+(cFilter===c?'true':'false')+'">'+c+'</button>'}).join('')+'</div>';
  var cols=CSTAT.map(function(sn,si){
    var rows=it.map(function(x,i){return {x:x,i:i}}).filter(function(o){return o.x.s===si&&(cFilter==='전체'||o.x.ch===cFilter)});
    return '<div class="col-b"><h3><span>'+sn+'</span><span class="mono sub">'+rows.length+'</span></h3>'+(rows.length?rows.map(function(o){return '<div class="item"><b>'+esc(o.x.t)+'</b><div class="row"><span class="tagx">'+esc(o.x.ch)+'</span><span><select data-cm="'+o.i+'" aria-label="상태 변경">'+CSTAT.map(function(s2,j){return '<option value="'+j+'"'+(j===o.x.s?' selected':'')+'>'+s2+'</option>'}).join('')+'</select> <button type="button" class="btn sm" data-cd="'+o.i+'" aria-label="삭제">×</button></span></div></div>'}).join(''):'<p class="empty">비어 있음</p>')+'</div>';
  }).join('');
  $('#v-content').innerHTML='<div style="display:flex;flex-direction:column;gap:var(--gap)"><div class="sec-head"><p class="eyebrow">CONTENT LIBRARY</p><h2>콘텐츠 라이브러리</h2><p class="sub">아이디어에서 발행까지 4단계로 콘텐츠를 관리합니다. 항목은 예시이며, 추가·이동·삭제한 내용은 이 브라우저에 저장됩니다.</p></div>'+chips+
   '<form class="form" id="cform"><input id="cT" placeholder="새 콘텐츠 제목" aria-label="콘텐츠 제목" required><select id="cC" aria-label="채널">'+CCH.map(function(c){return '<option>'+c+'</option>'}).join('')+'</select><button type="submit" class="btn pri">추가</button></form>'+
   '<div class="board">'+cols+'</div><p class="foot">반복 발행하는 채널은 스킬(/ebook-outline 등)과 루틴(주간 요약)으로 묶으면 제작 시간이 줄어듭니다.</p></div>';
}
function cmut(fn){if(!st.content)st.content=JSON.parse(JSON.stringify(CDEF));fn(st.content);save();renderContent();refresh()}
document.addEventListener('click',function(e){
  var f=e.target.closest('[data-cf]');if(f){cFilter=f.getAttribute('data-cf');renderContent()}
  var d=e.target.closest('[data-cd]');if(d){var i=+d.getAttribute('data-cd');cmut(function(a){a.splice(i,1)})}
});
document.addEventListener('change',function(e){var s=e.target.closest('[data-cm]');if(s){var i=+s.getAttribute('data-cm'),v=+s.value;cmut(function(a){a[i].s=v})}});
document.addEventListener('submit',function(e){
  if(e.target.id==='cform'){e.preventDefault();var t=$('#cT').value.trim(),c=$('#cC').value;if(!t)return;cmut(function(a){a.unshift({t:t,ch:c,s:0})})}
  if(e.target.id==='iform'){e.preventDefault();var tx=$('#iT').value.trim(),ca=$('#iC').value;if(!tx)return;st.ideas.unshift({id:Date.now(),t:tx,cat:ca,sc:0});save();renderIdeas();refresh()}
});

/* ---------- 아이디어 패드 ---------- */
var ICAT=['SaaS','AI 에이전트','자동화','콘텐츠','전자책','정부지원사업'];
function leanPrompt(x){return '다음 아이디어를 린(Lean) 방식으로 검증하고 싶습니다.\n아이디어: '+x.t+'\n분야: '+x.cat+'\n\n1. 개발 없이 검증할 수 있는 가장 싼 방법 3가지(랜딩페이지·사전예약·고객 인터뷰 등)를 비용·소요시간과 함께 표로 제안해 주세요.\n2. 비슷한 서비스·경쟁자를 조사해 차별점을 정리해 주세요.\n3. 첫 매출까지의 최소 실행 계획을 7일 단위로 써 주세요.\n4. 활용할 수 있는 정부지원사업이 있으면 함께 알려 주세요.'}
function renderIdeas(){
  var list=st.ideas.slice().sort(function(a,b){return b.sc-a.sc});
  $('#v-ideas').innerHTML='<div style="display:flex;flex-direction:column;gap:var(--gap)"><div class="sec-head"><p class="eyebrow">IDEA PAD</p><h2>아이디어 패드</h2><p class="sub">떠오른 생각을 바로 적고, 별점으로 우선순위를 매깁니다. 검증 프롬프트 복사를 누르면 개발 전에 시장·경쟁·첫 매출을 점검하는 지시문이 만들어집니다. 이 브라우저에만 저장됩니다.</p></div>'+
  '<form class="form" id="iform"><textarea id="iT" placeholder="예: 정부지원사업 사업계획서를 자동 초안으로 만들어 주는 AI 에이전트" aria-label="아이디어" required></textarea><select id="iC" aria-label="분야">'+ICAT.map(function(c){return '<option>'+c+'</option>'}).join('')+'</select><button type="submit" class="btn pri">추가</button></form>'+
  (list.length?'<ul style="display:flex;flex-direction:column;gap:8px">'+list.map(function(x){return '<li class="item" style="background:var(--panel);border:1px solid var(--line)"><b>'+esc(x.t)+'</b><div class="row"><span class="tagx">'+esc(x.cat)+'</span><span class="stars" role="group" aria-label="우선순위">'+[1,2,3].map(function(n){return '<button type="button" data-st="'+x.id+':'+n+'" class="'+(x.sc>=n?'on':'')+'" aria-label="'+n+'점">★</button>'}).join('')+'</span></div><div class="row"><button type="button" class="btn sm" data-iv="'+x.id+'">검증 프롬프트 복사</button><button type="button" class="btn sm" data-id2="'+x.id+'" aria-label="삭제">삭제</button></div></li>'}).join('')+'</ul>':'<p class="empty">아직 메모가 없습니다. 위에 첫 아이디어를 적어 보세요.</p>')+'</div>';
}
document.addEventListener('click',function(e){
  var s=e.target.closest('[data-st]');if(s){var a=s.getAttribute('data-st').split(':');st.ideas.forEach(function(x){if(x.id==+a[0])x.sc=(x.sc===+a[1]?0:+a[1])});save();renderIdeas()}
  var v=e.target.closest('[data-iv]');if(v){var id=+v.getAttribute('data-iv');st.ideas.forEach(function(x){if(x.id===id)copy(leanPrompt(x))})}
  var d=e.target.closest('[data-id2]');if(d){var id2=+d.getAttribute('data-id2');st.ideas=st.ideas.filter(function(x){return x.id!==id2});save();renderIdeas();refresh()}
});

/* ---------- 브랜드 라이브러리 ---------- */
var BR=[['Agents Coral','#FF8D74','CTA·강조'],['Lab Ink','#0D0A09','배경'],['Sand','#F4ECE6','본문 글자'],['Signal Teal','#3CC8C0','개발 분야'],['Amber','#F2B53A','재무·주의']];
function renderBrand(){
  $('#v-brand').innerHTML='<div style="display:flex;flex-direction:column;gap:var(--sec)"><div class="sec-head"><p class="eyebrow">BRAND LIBRARY</p><h2>브랜드 라이브러리</h2><p class="sub">로고, 색, 글꼴, 말투를 한곳에 모아 두고 스킬과 콘텐츠에서 같은 기준으로 불러 씁니다. 값은 예시이며 내 브랜드에 맞게 바꾸세요.</p></div>'+
  '<div class="two"><div class="panelbox"><div class="ph"><span>로고</span><small>Nomad-Agents-SYSTEM</small></div><div style="display:flex;align-items:center;gap:14px;padding:18px;background:var(--stage);border-radius:10px"><svg viewBox="0 0 32 32" width="56" height="56" aria-hidden="true"><circle cx="16" cy="16" r="6.5" fill="var(--accent)"/><ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="var(--accent)" stroke-width="1.6" transform="rotate(-24 16 16)"/><circle cx="27" cy="9.2" r="2.2" fill="var(--ink)"/></svg><b style="font-size:26px;letter-spacing:-.02em">Nomad<span style="color:var(--accent)">-Agents-</span>SYSTEM</b></div><ul class="bl"><li>궤도 안의 구는 메인 에이전트, 바깥 점은 연결된 도구를 뜻합니다.</li><li>로고 주변 여백은 로고 높이의 절반 이상 비웁니다.</li><li>어두운 배경이 기본이며, 밝은 배경에서는 코랄을 한 단계 진하게 씁니다.</li></ul></div>'+
  '<div class="panelbox"><div class="ph"><span>글꼴과 말투</span></div><ul class="bl"><li>본문 Noto Sans KR 400·500, 제목 700·800</li><li>숫자와 코드 JetBrains Mono</li><li>말투: 존댓말, 짧은 문장, 결론 먼저</li><li>금지: 과장 표현, 근거 없는 수익 보장, 이모지 남발</li></ul><div class="note"><b>스킬 연결</b> 이 페이지 내용을 AGENTS.md의 결과물 기준에 옮기면 모든 결과물에 같은 톤이 적용됩니다.</div></div></div>'+
  '<div><div class="ph" style="margin-bottom:10px"><span>색상 팔레트</span><small>눌러서 HEX 복사</small></div><div class="sw-grid">'+BR.map(function(c){return '<button type="button" class="swc" data-copy="'+c[1]+'"><i style="--c:'+c[1]+'"></i><div><b>'+esc(c[0])+'</b><small>'+c[1]+'</small><span class="sub">'+esc(c[2])+'</span></div></button>'}).join('')+'</div></div></div>';
}

/* ---------- ArtCraft ---------- */
var ART=[
 ['PhotoCraft','포토샵','이미지 편집(레이어·마스크·PSD)','var(--c-content)'],
 ['VectorCraft','일러스트레이터','벡터 도안(로고·명함·아이콘)','var(--c-dev)'],
 ['FilmCraft','프리미어 프로','영상 편집','var(--accent)'],
 ['EffectCraft','애프터 이펙트','모션 그래픽·시각 효과','var(--c-root)'],
 ['LightCraft','라이트룸','사진 보정(원본을 건드리지 않는 방식)','var(--c-fin)'],
 ['PdfCraft','아크로뱃','PDF 읽기·편집','var(--c-root)'],
 ['DesignCraft','인디자인','페이지·레이아웃 디자인','var(--c-dev)']
];
var ARTP={
 install:'필름 크래프트 문서 :\nhttps://github.com/storytold/filmcraft/blob/main/AGENTS.md\n벡터크래프트 문서:\nhttps://github.com/storytold/vectorcraft/blob/main/AGENTS.md\n다음 문서를 읽어보고 AI가 필름크래프트, 벡터크래프트를 사용해 직접 영상 편집하게 해주는 CLI랑 MCP 설치해줘.\n정확히 내 컴퓨터 사양에 맞게 설치해야해. 가능하면 네가 직접하고, 권한문제상 내가 직접 해야하는 부분이 있다면 어떻게해야하는지 정확히 안내해줘.',
 color:'현재 열려 있는 필름크래프트 시퀀스의 11초 ~ 42초 구간 영상이 너무 파란빛이 도는데, 균형잡히도록 색감 조정해봐줘.\n그리고, 2분 51초 전환 구간에 글리치 효과 적용해줘',
 card:'현재 벡터크래프트에 열린 문서 바탕으로 vectorcraft mcp사용해 다음을 수정해 새 파일로 저장해줘. 덮어쓰기 금지\n인쇄용 규격에 맞추고, 앞면, 뒷면 색상을 바꾸고 문구도 다음과 같이 수정해줘 :\n\n- 규격: 제공한 [인쇄소] 가로형 90×50mm 앞·뒷면 가이드 적용 ([가이드 파일 폴더 경로])\n- 앞면글자: [로고]와 모든 텍스트를 흰색으로 변경\n- 앞면배경: 현재 열린 ai와 다음 ai파일 중간 정도의 진한 주황색 적용 ([참고할 ai 파일 경로])\n- 뒷면글자: 변경된 앞면 배경과 동일한 색\n- 뒷면배경: 흰색\n- 문구: [기존 주소] → [새 주소]\n- 직함: [기존 직함] → [새 직함]\n- 확인사항: [확인할 부분] 글자가 흰색으로 보이지 않는 부분 확인 및 수정 필요'
};
Object.keys(ARTP).forEach(function(k){P['art_'+k]=ARTP[k]});
function pr(title,k){return '<div class="prompt"><header><span>복사용 프롬프트 — '+esc(title)+'</span><button type="button" class="btn sm" data-copy="'+k+'">복사</button></header><pre>'+esc(P[k])+'</pre></div>'}
function renderArt(){
  $('#v-artcraft').innerHTML='<div style="display:flex;flex-direction:column;gap:var(--sec)">'+
  '<div class="vhead"><span class="letter" aria-hidden="true" style="font-size:var(--fs-h1)">▲</span><div class="tt"><p class="eyebrow">ARTCRAFT × CLAUDE</p><h2>ArtCraft 앱 구조</h2><p class="lead">ArtCraft는 어도비 앱과 비슷한 무료 오픈소스 앱을 만드는 팀입니다. 앱을 설치하고 MCP·CLI를 연결하면 Claude가 앱을 직접 조작해 편집을 맡아 줍니다.</p><div class="pgref"><button type="button" class="btn sm" data-guide="art:1">가이드 보기</button></div></div></div>'+
  '<div><div class="sec-head" style="margin-bottom:10px"><h3>연결 구조</h3></div><div class="flow"><div class="st"><b>1 · 런처</b><span>공식 사이트에서 런처를 설치하고 원하는 앱을 받습니다.</span></div><div class="st"><b>2 · 앱</b><span>PhotoCraft 등 7개 앱을 열어 작업 파일을 둡니다.</span></div><div class="st"><b>3 · MCP·CLI</b><span>AI에게 앱을 조작할 손과 발을 달아 주는 도구입니다.</span></div><div class="st"><b>4 · AGENTS.md</b><span>설치 방법이 적힌 문서 주소를 AI에게 줍니다.</span></div><div class="st"><b>5 · Claude</b><span>데스크톱 코드 탭에서 설치와 편집을 맡깁니다.</span></div></div></div>'+
  '<div><div class="sec-head" style="margin-bottom:10px"><h3>01 · 앱 7가지</h3><p class="sub">공식 사이트에는 총 13가지 앱이 있고, 이 가이드는 그중 어도비 앱과 비교되는 7가지를 다룹니다.</p></div><div class="apps">'+ART.map(function(a){return '<div class="app-c" style="--c:'+a[3]+'"><h3>'+a[0]+'</h3><p class="vs">비슷한 앱 · '+a[1]+'</p><p class="use">'+a[2]+'</p><div class="tags"><span class="tagx mcp">MCP</span><span class="tagx">CLI</span></div></div>'}).join('')+'</div></div>'+
  '<div class="two"><div class="panelbox"><h3>02 · 쓰기 전에 알아둘 점</h3><ul class="bl"><li>앱 대부분이 아직 알파 단계입니다. FilmCraft는 스스로 기능 범위 약 86%, 실제 작업 준비도 약 56%로 추정합니다. 고객에게 나갈 최종 작업은 쓰던 도구를 함께 두세요.</li><li>코드는 MIT 또는 Apache-2.0 라이선스로 공개돼 있습니다(앱 README 기준). ArtCraft 이름과 로고는 상표라서 따로 조건이 있습니다.</li><li>Claude 데스크톱의 코드 탭은 유료 요금제에서만 지원됩니다.</li></ul></div>'+
  '<div class="panelbox"><h3>03 · 런처 설치</h3><ol class="bl" style="counter-reset:s"><li>ArtCraft 사이트에서 런처를 내려받아 설치합니다.</li><li>런처를 열면 앱 목록이 나옵니다. 원하는 앱을 골라 내려받으면 설치가 끝납니다.</li><li>이미 설치한 앱은 업데이트 버튼으로 최신 버전을 받습니다.</li></ol></div></div>'+
  '<div class="panelbox"><h3>04·05 · MCP와 CLI 설치를 Claude에게 맡기기</h3><p class="sub">Claude 데스크톱 앱 → 코드 탭 → 아래 설치 프롬프트 붙여넣기. 설치하고 싶은 앱의 문서 주소로 고쳐 쓰세요.</p>'+pr('FilmCraft·VectorCraft 설치','art_install')+'<p class="callout"><b>팁</b>컴퓨터에 맞게 설치하도록 요청하고, 권한 문제로 직접 해야 하는 부분은 안내받도록 마지막 문장에 넣어 둔 프롬프트입니다.</p></div>'+
  '<div class="two"><div class="panelbox"><h3>06 · 영상 색감 보정</h3><p class="sub">푸른빛이 도는 원본 영상을 FilmCraft에 열어 두고 색감 조정을 요청했더니 따뜻한 색감으로 보정됐습니다. Claude가 이펙트로 만들어 준 것이라 원하면 이펙트 안에서 값을 세밀하게 조정할 수 있습니다.</p>'+pr('색감 보정 + 글리치','art_color')+'</div>'+
  '<div class="panelbox"><h3>07 · 명함 인쇄 규격 리디자인</h3><p class="sub">VectorCraft에 예전 명함을 열어 두고 바뀐 직함과 홈페이지를 반영해 인쇄용 규격(90×50mm)으로 수정을 맡겼습니다. [괄호]는 내 파일과 내용에 맞게 바꿔 쓰세요.</p>'+pr('명함 리디자인','art_card')+'</div></div>'+
  '<div class="two"><div class="panelbox"><h3>08 · 생성 AI 대신 편집 앱을 쓰는 이유</h3><p class="sub">생성 AI는 프롬프트 하나로 최종 결과물을 얻기는 쉽지만 원하는 느낌까지 다듬기는 어렵습니다. 편집 앱을 Claude가 다루면 괜찮은 초안이 나왔을 때 레이어 단위로 컨트롤할 수 있어 수정이 훨씬 쉽습니다.</p><h3 style="margin-top:6px">09 · 나머지 앱</h3><p class="sub">LightCraft, PdfCraft, EffectCraft, DesignCraft도 오픈소스 무료입니다. 런처에서 받은 뒤 앱 문서 주소로 같은 방식의 설치를 요청해 보세요. 앱마다 문서와 지원 범위는 다를 수 있습니다.</p></div>'+
  '<div class="panelbox"><h3>10 · 아직 부족한 점</h3><div class="tw"><table class="tbl"><thead><tr><th>앱</th><th>공식 문서에 밝힌 한계</th></tr></thead><tbody><tr><td>PhotoCraft</td><td>생성형 AI 기능 없음</td></tr><tr><td>FilmCraft</td><td>.prproj 파일 열기 불가, 플러그인(VST3·OpenFX) 사용 불가, 글리치 효과가 프리미어보다 덜 세련됨</td></tr><tr><td>VectorCraft</td><td>.ai 파일 교환이 아직 안정적이지 않음</td></tr><tr><td>EffectCraft</td><td>애프터 이펙트 플러그인 사용 불가</td></tr></tbody></table></div><p class="sub">11 · 프로젝트가 100% 무료 오픈소스라 기여자들도 Claude나 Codex 같은 에이전트로 고쳐 나갈 것이고, 버전이 오를수록 에이전트가 쓰기에 더 적합해질 것으로 봅니다.</p></div></div>'+
  '<div class="note"><b>사업 메모</b> 편집 앱 + MCP 조합은 \"Claude로 영상·명함 편집 대행\" 같은 서비스나 강의의 소재가 됩니다. 알파 단계이므로 먼저 소규모 의뢰 1~2건으로 품질을 검증한 뒤 상품화하세요.</div></div>';
}

/* ---------- 가이드 뷰어 ---------- */
var DOCS={ssr:{name:'SSR+ 가이드',n:13,pre:'guide/ssr-',pad:true,desc:'나만의 AI 에이전트 시스템 만들기 (13쪽)'},art:{name:'ArtCraft 가이드',n:4,pre:'guide/art-',pad:false,desc:'ArtCraft 앱 Claude 활용 가이드 (4쪽)'}};
var gs={doc:'ssr',page:1,q:'',hits:{}};
function gimg(d,p){var o=DOCS[d];return o.pre+(o.pad?String(p).padStart(2,'0'):p)+'.jpg'}
function renderGuide(){
  var o=DOCS[gs.doc],txt=gs.doc==='ssr'?D.pages.ssr[gs.page-1]:'';
  var docs='<div class="tabs" role="tablist" aria-label="가이드 문서">'+Object.keys(DOCS).map(function(k){return '<button type="button" role="tab" class="tab" data-gd="'+k+'" aria-selected="'+(gs.doc===k?'true':'false')+'">'+DOCS[k].name+'</button>'}).join('')+'</div>';
  var thumbs='';for(var i=1;i<=o.n;i++){thumbs+='<button type="button" class="th'+(gs.hits[i]?' hit':'')+'" data-gp="'+i+'" aria-current="'+(i===gs.page?'true':'false')+'" aria-label="'+i+'쪽"><img src="'+gimg(gs.doc,i)+'" alt="" loading="lazy" width="96" height="136"><span>'+i+'</span></button>'}
  var search=gs.doc==='ssr'?'<label class="search" style="max-width:none"><span class="sr">가이드 본문 검색</span><input id="gq" type="search" placeholder="본문 검색 (예: 루틴, Hermes, AGENTS.md)" autocomplete="off" value="'+esc(gs.q)+'"><span class="qcount" id="gqc"></span></label>':'';
  $('#v-guide').innerHTML='<div style="display:flex;flex-direction:column;gap:var(--gap)"><div class="sec-head"><p class="eyebrow">USAGE GUIDE</p><h2>사용 가이드 (PDF)</h2><p class="sub">이 앱의 사용법은 아래 PDF 두 개를 그대로 따릅니다. 쪽을 넘기면서 읽고, SSR+ 가이드는 본문 검색과 텍스트 복사도 됩니다.</p></div>'+docs+
   '<div class="gv"><div class="thumbs" id="thumbs">'+thumbs+'</div><div class="pgview"><div class="pgnav"><button type="button" class="btn sm" data-gn="-1" aria-label="이전 쪽">← 이전</button><span class="mono sub" id="gpn">'+gs.page+' / '+o.n+'</span><button type="button" class="btn sm" data-gn="1" aria-label="다음 쪽">다음 →</button><span class="grow"></span>'+search+'</div>'+
   '<figure class="pgimg"><img id="gimg" src="'+gimg(gs.doc,gs.page)+'" alt="'+o.name+' '+gs.page+'쪽"></figure>'+
   (txt?'<details class="txt2"><summary>이 쪽 텍스트 보기·복사</summary><pre id="gtxt">'+esc(txt)+'</pre><button type="button" class="btn sm" style="margin-top:8px" data-copytxt="1">텍스트 복사</button></details>':'<p class="sub">ArtCraft 가이드의 정리본과 프롬프트는 ArtCraft 앱 화면에서 확인할 수 있습니다.</p>')+
   '</div></div></div>';
  var q=$('#gq');if(q){q.addEventListener('input',function(){gs.q=q.value;runGSearch()});q.addEventListener('keydown',function(e){if(e.key==='Enter'){var f=Object.keys(gs.hits)[0];if(f){gs.page=+f;renderGuide()}}})}
  runGSearch(true);
}
function runGSearch(skip){
  gs.hits={};var v=gs.q.trim().toLowerCase();
  if(v&&gs.doc==='ssr'){D.pages.ssr.forEach(function(t,i){if(t.toLowerCase().indexOf(v)>=0)gs.hits[i+1]=true})}
  var c=$('#gqc');if(c)c.textContent=v?(Object.keys(gs.hits).length?Object.keys(gs.hits).length+'쪽 일치':'일치 없음'):'';
  $$('.th').forEach(function(b){b.classList.toggle('hit',!!gs.hits[+b.getAttribute('data-gp')])});
}
function gset(p){var n=DOCS[gs.doc].n;gs.page=Math.max(1,Math.min(n,p));renderGuide();var t=$('.th[aria-current="true"]');if(t&&t.scrollIntoView){try{t.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}}}
function openGuide(doc,p){gs.doc=doc;gs.page=p||1;location.hash==='#guide'?renderGuide():(location.hash='#guide')}
document.addEventListener('click',function(e){
  var d=e.target.closest('[data-gd]');if(d){gs.doc=d.getAttribute('data-gd');gs.page=1;gs.hits={};renderGuide()}
  var p=e.target.closest('[data-gp]');if(p){gset(+p.getAttribute('data-gp'))}
  var n=e.target.closest('[data-gn]');if(n){gset(gs.page+ +n.getAttribute('data-gn'))}
  var c=e.target.closest('[data-copytxt]');if(c){copy($('#gtxt').textContent,c)}
});
document.addEventListener('keydown',function(e){
  if(cur!=='guide'||/input|textarea|select/i.test((e.target.tagName||'')))return;
  if(e.key==='ArrowRight'){gset(gs.page+1)}else if(e.key==='ArrowLeft'){gset(gs.page-1)}
});

/* ---------- 7일 계획, 기획 ---------- */
function renderPlan(){
  $('#v-plan').innerHTML='<div style="display:flex;flex-direction:column;gap:var(--gap)"><div class="sec-head"><p class="eyebrow">7 DAYS</p><h2>7일 세팅 계획</h2><p class="sub">하루에 한 단계씩, 작게 시작합니다. 끝까지 완성한 작은 시스템이 하다 만 큰 시스템보다 낫습니다. (가이드 p.13)</p></div>'+
  '<div class="two"><div class="panelbox"><div class="ph"><span>날짜별 할 일</span><small class="mono" id="pcnt">0/7</small></div><ul id="planList">'+DAYS.map(function(d,i){return '<li style="display:flex;gap:6px"><label class="cl" style="flex:1"><input type="checkbox" class="cb" data-day="'+i+'"><span class="box"></span><span class="txt"><b class="mono" style="color:var(--label)">'+(i+1)+'일차</b> '+esc(dayLabel(i))+' <span class="tagx">'+esc(d[1])+'</span></span></label><button type="button" class="pen" style="margin-top:6px" data-edit="day:'+i+'" aria-label="편집">✎</button></li>'}).join('')+'</ul><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button type="button" class="btn sm" id="startToday">시작일을 오늘로</button><span class="sub">시작일 <span class="mono" id="startTxt"></span></span></div></div>'+
  '<div style="display:flex;flex-direction:column;gap:var(--gap)"><div class="note"><b>유지 관리 (매주 15분)</b><br>AGENTS.md의 낡은 내용 지우기, 스킬 파일 하나 다듬기, 루틴 결과가 제대로 도착했는지 확인. 낡은 지침은 없는 지침보다 위험합니다. AI는 그 내용을 믿고 그대로 일하기 때문입니다.</div>'+
  '<div class="panelbox"><div class="ph"><span>SSR+ 체크리스트</span><small class="mono" id="ckCnt">0/4</small></div><ul>'+CHECK.map(function(c,i){return '<li><label class="cl"><input type="checkbox" class="cb" data-ck="'+i+'"'+(st.ck[i]?' checked':'')+'><span class="box"></span><span class="txt"><b>'+esc(c[0])+'</b> · '+esc(c[1])+'</span></label></li>'}).join('')+'</ul><p class="sub">네 칸이 모두 채워지면 나만의 AI 에이전트 시스템이 완성됩니다.</p></div></div></div></div>';
  $('#startTxt').textContent=st.start;
  $('#startToday').addEventListener('click',function(){st.start=iso(new Date());save();$('#startTxt').textContent=st.start;refresh()});
}
function renderSpec(){
  $('#v-spec').innerHTML='<div style="display:flex;flex-direction:column;gap:var(--sec)"><div class="sec-head"><p class="eyebrow">PLAN</p><h2>기획 요약</h2></div>'+
  '<div class="spec"><section><h3>무엇을 위한 화면인가</h3><p>SSR+ 네 단계의 진행 상태를 한 화면에서 점검하고, 세컨드 브레인 폴더가 어떻게 연결되어 있는지 눈으로 확인합니다. 단계마다 새 대화에서 바로 확인할 수 있는 완료 기준을 둡니다. 사용법은 PDF 가이드를 그대로 화면에 담았습니다.</p></section>'+
  '<section><h3>탐색기 사양 (가이드 그대로)</h3><ul><li>중앙의 큰 구가 메인 에이전트이고, 그 주위로 구조가 퍼져 나감</li><li>폴더와 문서는 노드, 포함 관계는 실선, 문서 간 링크는 점선</li><li>분야는 색, 폴더와 문서는 모양, 간단한 범례</li><li>3D 보기와 2D 보기 전환, 확대·축소, 드래그 이동, 이름·본문 검색</li><li>노드를 누르면 이름, 경로, 연결 항목, 미리보기 패널</li></ul></section>'+
  '<section><h3>단계별 확장</h3><ul><li>지금: 예시 데이터로 구조와 사용감 확인(노코드 수준 검증)</li><li>다음: Node 스크립트가 실제 second-brain/ 폴더를 읽어 graph.json을 만들고 탐색기가 표시</li><li>이후: Extensions/brain-explorer/ 로컬 도구로 정착, 수강생용 템플릿 배포</li></ul></section></div>'+
  '<div><div class="sec-head" style="margin-bottom:10px"><h3>화면 구조(정보 구조)</h3></div><div class="sitemap">'+
  '<section><h3>HOME</h3><ul><li>홈 <span>— 진행률·목표·캘린더·최근 파일, 세컨드 브레인 입자 구, 스킬·루틴·익스텐션</span></li></ul></section>'+
  '<section><h3>SSR+ (좌측 GNB 4칸)</h3><ul><li>S 스킬 <span>— 초·중·고급, 프롬프트</span></li><li>S 세컨드 브레인 <span>— 3D 탐색기 포함</span></li><li>R 루틴</li><li>+ 익스텐션</li></ul></section>'+
  '<section><h3>다른 대시보드·앱</h3><ul><li>브랜드 라이브러리</li><li>콘텐츠 라이브러리</li><li>아이디어 패드</li><li>ArtCraft 앱 구조</li></ul></section>'+
  '<section><h3>가이드</h3><ul><li>사용 가이드(PDF 17쪽 뷰어·검색)</li><li>7일 세팅 계획·체크리스트</li><li>기획 요약</li></ul></section></div></div>'+
  '<div class="note"><b>사업 연결 아이디어</b> 이 대시보드는 \"AI 업무 시스템 세팅\" 강의·템플릿의 데모로 쓸 수 있습니다. 순서는 (1) 이 화면과 랜딩페이지로 관심 수강생 모으기 → (2) 사전예약으로 수요 확인 → (3) 정부지원사업 신청 시 시연 자료로 활용 → (4) 반응이 있으면 Next.js + Supabase로 정식 개발해 SaaS화.</div>'+
  '<div class="bp" id="bp" aria-label="화면 구간별 폰트 크기"><div><b>모바일</b><span>~767px · 본문 14 · 보조 12 · 제목 26 · 메뉴는 서랍</span></div><div><b>태블릿</b><span>768~1199px · 본문 15 · 보조 13 · 제목 32 · 아이콘 레일</span></div><div><b>데스크탑</b><span>1200px~ · 본문 16 · 보조 13 · 제목 38 · 전체 GNB</span></div></div>'+
  '<p class="foot">단계 구성과 문구는 SSR+ 가이드 PDF와 ArtCraft 가이드 PDF를 따랐고, 노드·목록·숫자는 예시입니다. 체크와 메모는 이 브라우저에만 저장됩니다.</p></div>';
  var mqs=[matchMedia('(max-width:767px)'),matchMedia('(min-width:768px) and (max-width:1199px)'),matchMedia('(min-width:1200px)')];
  function bp(){var c=$$('#bp div');mqs.forEach(function(m,i){if(c[i])c[i].classList.toggle('on',m.matches)})}
  mqs.forEach(function(m){if(m.addEventListener){m.addEventListener('change',bp)}else{m.addListener(bp)}});bp();
}

/* ---------- 라우터 ---------- */
var BRAIN_HTML=document.getElementById('brain-tpl').innerHTML;
var rendered={},cur='';
var page=$('#page');
Object.keys(VIEWS).forEach(function(k){if(k==='home')return;var s=document.createElement('section');s.className='view';s.id='v-'+k;s.hidden=true;page.appendChild(s)});
var R={skill:function(){renderSSR('skill')},brain:function(){renderSSR('brain');document.dispatchEvent(new Event('brain:mounted'))},routine:function(){renderSSR('routine')},ext:function(){renderSSR('ext')},
 brand:renderBrand,content:renderContent,ideas:renderIdeas,artcraft:renderArt,guide:renderGuide,plan:renderPlan,spec:renderSpec};
function show(id){
  if(!VIEWS[id])id='home';
  if(cur===id&&rendered[id])return;
  $$('.view').forEach(function(v){v.hidden=true});
  var el=$('#v-'+id);
  if(!rendered[id]){if(id==='home'){renderHome()}else if(R[id]){R[id]()}rendered[id]=true}
  else if(id==='guide'){renderGuide()}
  el.hidden=false;cur=id;
  $$('.nl').forEach(function(a){if(a.getAttribute('data-v')===id){a.setAttribute('aria-current','page')}else{a.removeAttribute('aria-current')}});
  $('#vt').textContent=VIEWS[id].t;
  document.title=VIEWS[id].t+' · Nomad-Agents-SYSTEM';
  closeNav();
  window.scrollTo(0,0);
  window.__view=id;document.dispatchEvent(new CustomEvent('viewchange',{detail:id}));
  refresh();
  if(G&&!reduce){G.fromTo(el,{opacity:0,y:8},{opacity:1,y:0,duration:.35,ease:'power2.out',clearProps:'transform,opacity'})}
}
function route(){show(location.hash.replace(/^#/,''))}
window.addEventListener('hashchange',route);

/* 메뉴 서랍 */
var gnb=$('#gnb'),scrim=$('#scrim'),menu=$('#menu');
function openNav(){gnb.classList.add('open');scrim.classList.add('on');menu.setAttribute('aria-expanded','true')}
function closeNav(){gnb.classList.remove('open');scrim.classList.remove('on');menu.setAttribute('aria-expanded','false')}
menu.addEventListener('click',function(){gnb.classList.contains('open')?closeNav():openNav()});
scrim.addEventListener('click',closeNav);
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeNav()});

/* 테마 */
function setTheme(t){document.documentElement.setAttribute('data-theme',t);$('#themeIc').innerHTML=t==='dark'?IC.sun:IC.moon;try{localStorage.setItem('nomad-theme',t)}catch(e){}}
var th='dark';try{th=localStorage.getItem('nomad-theme')||'dark'}catch(e){}
setTheme(th);
$('#theme').addEventListener('click',function(){setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark')});

/* 홈 → 사전 설치 프롬프트 복사 등 data-copy 키는 위에서 처리 */
refresh();
route();
})();
