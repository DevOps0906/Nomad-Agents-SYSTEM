function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function css(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
var G=window.gsap,T=window.THREE;
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function anim(o,props,dur,ease,delay){
  if(G&&!reduce){var v={duration:dur,ease:ease||'power2.out',delay:delay||0,overwrite:'auto'};for(var k in props){v[k]=props[k]}G.to(o,v)}
  else{for(var k2 in props){o[k2]=props[k2]}}
}
/* ================= 세컨드 브레인 데이터 (예시) ================= */
var KIND={agent:'메인 에이전트',folder:'폴더',rule:'규칙 문서',index:'길잡이(색인)',source:'원본 파일'};
var DOM_VAR={agent:'--accent',root:'--c-root',content:'--c-content',dev:'--c-dev',fin:'--c-fin'};
var SRC='원본 파일입니다.\n세컨드 브레인에는 위치와 용도만 적고,\n내용은 이 파일에서 직접 확인합니다.';
var NODES=[
 {id:'agent',kind:'agent',dom:'agent',name:'메인 에이전트',path:'Claude · 메인 에이전트',desc:'모든 일을 처리하는 중심입니다. 세컨드 브레인은 이 에이전트가 읽고 찾는 자료 구조입니다.',
  body:'Claude 데스크톱이나 Claude Code 같은 메인 에이전트입니다.\n대화를 시작할 때 AGENTS.md를 가장 먼저 읽고,\n전체목록.md로 필요한 자료를 찾아 일합니다.\n\n스킬, 루틴, 익스텐션도 여기서 호출합니다.'},
 {id:'sb',kind:'folder',dom:'root',name:'second-brain',path:'second-brain/',desc:'세컨드 브레인 최상위 폴더. 분야 길잡이와 규칙 문서가 들어 있습니다.'},
 {id:'agents',kind:'rule',dom:'root',parent:'sb',name:'AGENTS.md',path:'second-brain/AGENTS.md',desc:'대문: 분야 표 + 찾는 법 + 규칙 문서 링크',
  body:'# AGENTS.md\n\n## 분야 표\n- 콘텐츠 → contents/contents.md\n- 개발 → dev/dev.md\n- 재무 → financial/financial.md\n\n## 찾는 법\n전체목록.md를 grep 한 번으로 찾고,\n결과는 15줄까지만 본다.\n\n## 규칙 문서\n- AGENTS--인덱스규칙.md\n- AGENTS--확정기준.md'},
 {id:'rule_idx',kind:'rule',dom:'root',parent:'sb',name:'AGENTS--인덱스규칙.md',path:'second-brain/AGENTS--인덱스규칙.md',desc:'색인 작성·분할·갱신 규칙',
  body:'- 한 줄 형식: - [이름](상대경로) — 한 줄 설명 (200자 이내)\n- 최종본만 링크한다. 새 버전이 생기면 이전 링크는 빼고 파일은 그대로 둔다.\n- 모든 문서는 빈 줄 포함 100줄 이내.\n- 위치와 용도만 쓰고, 상세 내용은 원본으로 연결한다.'},
 {id:'rule_std',kind:'rule',dom:'root',parent:'sb',name:'AGENTS--확정기준.md',path:'second-brain/AGENTS--확정기준.md',desc:'팀이 지킬 현재 유효한 기준',
  body:'# 확정 기준\n- 보고서는 1쪽, 표 먼저. 이모지 금지.\n- 단가는 월 150만 원으로 확정.'},
 {id:'log',kind:'rule',dom:'root',parent:'sb',name:'log.md',path:'second-brain/log.md',desc:'변경 이력. 끝에 덧붙이기만 합니다.',
  body:'## [2026-11-02] 생성 | 세컨드 브레인 초기 구성\n- 입력: 업무 폴더 3개 분야\n- 변경/반영: 색인 7개 작성\n- 메모: 확인 필요 목록 없음'},
 {id:'all',kind:'rule',dom:'root',parent:'sb',name:'전체목록.md',path:'second-brain/전체목록.md',desc:'모든 색인을 한 장에 펼친 사본. AI 검색용이며 직접 고치지 않습니다.',
  body:'콘텐츠 > 영상 · 위치: contents/contents--영상.md\n콘텐츠 > 전자책 · 위치: contents/contents--전자책.md\n개발 > 대시보드 · 위치: dev/dev--대시보드.md\n재무 > 월별 · 위치: financial/financial--월별.md'},
 {id:'c_dir',kind:'folder',dom:'content',parent:'sb',name:'contents',path:'second-brain/contents/',desc:'콘텐츠 분야 길잡이 폴더'},
 {id:'d_dir',kind:'folder',dom:'dev',parent:'sb',name:'dev',path:'second-brain/dev/',desc:'개발 분야 길잡이 폴더'},
 {id:'f_dir',kind:'folder',dom:'fin',parent:'sb',name:'financial',path:'second-brain/financial/',desc:'재무 분야 길잡이 폴더'},
 {id:'c_main',kind:'index',dom:'content',parent:'c_dir',name:'contents.md',path:'second-brain/contents/contents.md',desc:'콘텐츠 분야 길잡이. 하위 길잡이 링크와 한 줄 설명.',
  body:'# 콘텐츠\n- [영상](contents--영상.md) — 쇼츠·롱폼 대본과 썸네일 기준\n- [전자책](contents--전자책.md) — 원고 최종본과 출간 일정'},
 {id:'c_video',kind:'index',dom:'content',parent:'c_dir',name:'contents--영상.md',path:'second-brain/contents/contents--영상.md',desc:'하위 길잡이: 영상 원본 파일 링크 + 한 줄 설명',
  body:'- [쇼츠 대본_최종](업무폴더/콘텐츠/쇼츠 대본_최종.md) — 별명: 쇼츠대본, 최신 확정본\n- [썸네일 가이드](업무폴더/콘텐츠/썸네일 가이드.pdf) — 색과 문구 규칙'},
 {id:'c_ebook',kind:'index',dom:'content',parent:'c_dir',name:'contents--전자책.md',path:'second-brain/contents/contents--전자책.md',desc:'하위 길잡이: 전자책 원고와 일정',
  body:'- [전자책 원고_최종](업무폴더/콘텐츠/전자책 원고_최종.docx) — 출간용 최종본'},
 {id:'d_main',kind:'index',dom:'dev',parent:'d_dir',name:'dev.md',path:'second-brain/dev/dev.md',desc:'개발 분야 길잡이',
  body:'# 개발\n- [대시보드](dev--대시보드.md) — 기획서와 배포 체크리스트'},
 {id:'d_dash',kind:'index',dom:'dev',parent:'d_dir',name:'dev--대시보드.md',path:'second-brain/dev/dev--대시보드.md',desc:'하위 길잡이: 대시보드 프로젝트 원본 링크',
  body:'- [프로젝트 기획서](업무폴더/개발/프로젝트 기획서.md) — 범위와 일정\n- [배포 체크리스트](업무폴더/개발/배포 체크리스트.md) — 출시 전 확인\n- [API 연동 메모](업무폴더/개발/API 연동 메모.md) — 연동 순서'},
 {id:'f_main',kind:'index',dom:'fin',parent:'f_dir',name:'financial.md',path:'second-brain/financial/financial.md',desc:'재무 분야 길잡이',
  body:'# 재무\n- [월별](financial--월별.md) — 매출 정리와 세금 일정'},
 {id:'f_month',kind:'index',dom:'fin',parent:'f_dir',name:'financial--월별.md',path:'second-brain/financial/financial--월별.md',desc:'하위 길잡이: 월별 매출·세금 원본 링크',
  body:'- [월간 매출 정리](업무폴더/재무/월간 매출 정리.xlsx) — 최종본\n- [세금 일정표](업무폴더/재무/세금 일정표.md) — 신고 달력\n- 전자책 매출은 contents--전자책.md와 함께 본다'},
 {id:'c_s1',kind:'source',dom:'content',name:'쇼츠 대본_최종.md',path:'업무폴더/콘텐츠/쇼츠 대본_최종.md',desc:'쇼츠 대본 최신 확정본',body:SRC},
 {id:'c_s2',kind:'source',dom:'content',name:'썸네일 가이드.pdf',path:'업무폴더/콘텐츠/썸네일 가이드.pdf',desc:'썸네일 색과 문구 규칙',body:SRC},
 {id:'c_s3',kind:'source',dom:'content',name:'전자책 원고_최종.docx',path:'업무폴더/콘텐츠/전자책 원고_최종.docx',desc:'출간용 전자책 원고',body:SRC},
 {id:'d_s1',kind:'source',dom:'dev',name:'프로젝트 기획서.md',path:'업무폴더/개발/프로젝트 기획서.md',desc:'범위와 일정',body:SRC},
 {id:'d_s2',kind:'source',dom:'dev',name:'배포 체크리스트.md',path:'업무폴더/개발/배포 체크리스트.md',desc:'출시 전 확인 항목',body:SRC},
 {id:'d_s3',kind:'source',dom:'dev',name:'API 연동 메모.md',path:'업무폴더/개발/API 연동 메모.md',desc:'외부 API 연동 순서',body:SRC},
 {id:'f_s1',kind:'source',dom:'fin',name:'월간 매출 정리.xlsx',path:'업무폴더/재무/월간 매출 정리.xlsx',desc:'월별 매출 최종본',body:SRC},
 {id:'f_s2',kind:'source',dom:'fin',name:'세금 일정표.md',path:'업무폴더/재무/세금 일정표.md',desc:'세금 신고 일정',body:SRC}
];
var LINKS=[['agent','sb'],['agent','agents'],['agents','c_main'],['agents','d_main'],['agents','f_main'],['agents','rule_idx'],['agents','rule_std'],['agents','all'],['log','agents'],['rule_std','rule_idx'],
 ['all','c_video'],['all','d_dash'],['all','f_month'],
 ['c_main','c_video'],['c_main','c_ebook'],['c_video','c_s1'],['c_video','c_s2'],['c_ebook','c_s3'],
 ['d_main','d_dash'],['d_dash','d_s1'],['d_dash','d_s2'],['d_dash','d_s3'],
 ['f_main','f_month'],['f_month','f_s1'],['f_month','f_s2'],['f_month','c_ebook']];

var N=NODES.length,byId={};
NODES.forEach(function(n,i){n.i=i;byId[n.id]=n});
var CE=[],LE=[];
NODES.forEach(function(n){if(n.parent){CE.push([byId[n.parent].i,n.i])}});
LINKS.forEach(function(l){LE.push([byId[l[0]].i,byId[l[1]].i])});
var ALLE=CE.concat(LE);
var nbr=NODES.map(function(){return {}});
var rel=NODES.map(function(){return {parent:-1,children:[],out:[],inn:[]}});
CE.forEach(function(e){rel[e[1]].parent=e[0];rel[e[0]].children.push(e[1]);nbr[e[0]][e[1]]=nbr[e[1]][e[0]]=true});
LE.forEach(function(e){rel[e[0]].out.push(e[1]);rel[e[1]].inn.push(e[0]);nbr[e[0]][e[1]]=nbr[e[1]][e[0]]=true});
var depth=NODES.map(function(){return -1});
(function(){var q=[0];depth[0]=0;while(q.length){var a=q.shift();for(var b in nbr[a]){b=+b;if(depth[b]<0){depth[b]=depth[a]+1;q.push(b)}}}})();

/* 레이아웃: 힘 기반 배치 (3D / 2D 각각 계산, 같은 시드라 항상 같은 모양) */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function simulate(dim){
  var rnd=mulberry(dim===3?11:23),X=[],V=[],i,j;
  for(i=0;i<N;i++){X.push([(rnd()-.5)*12,(rnd()-.5)*12,dim===3?(rnd()-.5)*12:0]);V.push([0,0,0])}
  var sp=[];CE.forEach(function(e){sp.push([e[0],e[1],4,.09])});LE.forEach(function(e){sp.push([e[0],e[1],6,.035])});
  for(var it=0;it<700;it++){
    var cool=1-it/700,F=[];for(i=0;i<N;i++){F.push([0,0,0])}
    for(i=0;i<N;i++){for(j=i+1;j<N;j++){
      var dx=X[i][0]-X[j][0],dy=X[i][1]-X[j][1],dz=X[i][2]-X[j][2];
      var d2=dx*dx+dy*dy+dz*dz+.05,d=Math.sqrt(d2),f=Math.min(40/d2,8)*((i===0||j===0)?2.5:1);
      var fx=dx/d*f,fy=dy/d*f,fz=dz/d*f;
      if(NODES[i].dom===NODES[j].dom&&NODES[i].dom!=='root'){var a=.012*d;fx-=dx/d*a;fy-=dy/d*a;fz-=dz/d*a}
      F[i][0]+=fx;F[i][1]+=fy;F[i][2]+=fz;F[j][0]-=fx;F[j][1]-=fy;F[j][2]-=fz;
    }}
    sp.forEach(function(s){
      var a=s[0],b=s[1],dx=X[b][0]-X[a][0],dy=X[b][1]-X[a][1],dz=X[b][2]-X[a][2];
      var d=Math.sqrt(dx*dx+dy*dy+dz*dz)+1e-4,f=(d-s[2])*s[3];
      F[a][0]+=dx/d*f;F[a][1]+=dy/d*f;F[a][2]+=dz/d*f;F[b][0]-=dx/d*f;F[b][1]-=dy/d*f;F[b][2]-=dz/d*f;
    });
    for(i=0;i<N;i++){if(i===0){X[0]=[0,0,0];V[0]=[0,0,0];continue}for(var c=0;c<3;c++){F[i][c]-=X[i][c]*.02;V[i][c]=(V[i][c]+F[i][c]*.5)*.8;X[i][c]+=V[i][c]*(.25+.75*cool)}if(dim===2){X[i][2]=0}}
  }
  var m=[0,0,0];X.forEach(function(p){m[0]+=p[0]/N;m[1]+=p[1]/N;m[2]+=p[2]/N});
  var R=0;X.forEach(function(p){R=Math.max(R,Math.hypot(p[0],p[1],p[2]))});
  var sc=11/(R||1);X.forEach(function(p){p[0]*=sc;p[1]*=sc;p[2]*=sc});
  X.forEach(function(p,i){if(i===0)return;var d=Math.hypot(p[0],p[1],p[2]);if(d<4.8){if(d<.001){p[0]=4.8}else{var q=4.8/d;p[0]*=q;p[1]*=q;p[2]*=q}}});
  return X;
}
var L3=simulate(3),L2=simulate(2);

/* ================= 상태 ================= */
var S={mode:'3d',flat:0,sel:-1,hover:-1,match:null,auto:true};
var panelEl=$('#panel');
function isDim(i){
  if(S.match){return !(S.match[i]||i===S.sel)}
  if(S.sel>=0){return !(i===S.sel||nbr[S.sel][i])}
  return false;
}

/* ================= 패널 ================= */
function btnItem(i){
  var n=NODES[i];
  return '<button type="button" class="tn'+(S.match&&S.match[i]?' hit':'')+'" data-id="'+i+'"><i class="dot '+n.kind+'" style="--c:var('+DOM_VAR[n.dom]+')"></i><span class="nm">'+esc(n.name)+(n.kind==='folder'?'/':'')+'</span><span class="ds">'+esc(n.desc)+'</span></button>';
}
function treeNode(i){var ch=rel[i].children;return '<li>'+btnItem(i)+(ch.length?'<ul>'+ch.map(treeNode).join('')+'</ul>':'')+'</li>'}
function renderTree(){
  var src=NODES.filter(function(n){return n.kind==='source'}).map(function(n){return '<li>'+btnItem(n.i)+'</li>'}).join('');
  panelEl.innerHTML='<h3>파일 목록</h3><p class="sub">노드를 누르거나 아래 목록에서 문서를 고르세요.</p><div class="tree"><ul><li>'+btnItem(0)+'</li>'+treeNode(1)+'</ul><p class="grp">업무 폴더의 원본 파일</p><ul>'+src+'</ul></div>';
}
function relRow(label,i){var n=NODES[i];return '<li><button type="button" data-id="'+i+'"><span class="rel-k">'+label+'</span><span>'+esc(n.name)+(n.kind==='folder'?'/':'')+'</span></button></li>'}
function renderDetail(i){
  var n=NODES[i],r=rel[i],rows='';
  if(r.parent>=0){rows+=relRow('들어 있는 폴더',r.parent)}
  r.children.forEach(function(c){rows+=relRow('포함',c)});
  r.out.forEach(function(c){rows+=relRow('링크',c)});
  r.inn.forEach(function(c){rows+=relRow('링크한 문서',c)});
  var body=n.kind==='folder'?(r.children.map(function(c){return '- '+NODES[c].name+(NODES[c].kind==='folder'?'/':'')}).join('\n')):(n.body||'');
  var cnt=(r.parent>=0?1:0)+r.children.length+r.out.length+r.inn.length;
  panelEl.innerHTML='<div class="pn-top"><span class="kind"><i style="--c:var('+DOM_VAR[n.dom]+')"></i>'+KIND[n.kind]+'</span><button type="button" class="x" data-act="close" aria-label="선택 해제">×</button></div>'+
   '<h3>'+esc(n.name)+(n.kind==='folder'?'/':'')+'</h3><p class="path mono">'+esc(n.path)+'</p><p class="pn-desc">'+esc(n.desc)+'</p>'+
   '<h4>연결된 항목 ('+cnt+')</h4><ul class="rel">'+rows+'</ul><h4>미리보기</h4><pre class="pv">'+esc(body)+'</pre>';
  panelEl.scrollTop=0;
}
function renderPanel(){if(S.sel>=0){renderDetail(S.sel)}else{renderTree()}}

/* ================= 3D 장면 ================= */
var cv=$('#gl'),stage=$('#stage'),hasGL=false,renderer,scene,camera,W=1,H=1;
if(T){try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'low-power'});hasGL=true}catch(e){hasGL=false}}
var orbit={yaw:.65,pitch:.32,dist:34,tx:0,ty:0,tz:0};
var nptr=0,idleUntil=0;
function fitDist(){var a=Math.min(1,W/H);return clamp(11.5/(.445*Math.max(a,.4)),19,50)}
function nodeTarget(i){var f=S.mode==='2d'?1:0;return {x:L3[i][0]+(L2[i][0]-L3[i][0])*f,y:L3[i][1]+(L2[i][1]-L3[i][1])*f,z:L3[i][2]+(L2[i][2]-L3[i][2])*f}}

function select(i,focus){
  S.sel=i;renderPanel();
  if(!hasGL)return;
  if(i>=0&&focus!==false){var c=nodeTarget(i);anim(orbit,{tx:c.x,ty:c.y,tz:c.z,dist:Math.min(orbit.dist,22)},.8,'power3.out')}
  else if(i<0){anim(orbit,{tx:0,ty:0,tz:0},.8,'power3.out')}
}
panelEl.addEventListener('click',function(e){
  var b=e.target.closest('[data-id],[data-act]');if(!b)return;
  if(b.getAttribute('data-act')==='close'){select(-1);return}
  select(+b.getAttribute('data-id'),true);
});

/* 검색 */
var qEl=$('#q'),qc=$('#qcount');
qEl.addEventListener('input',function(){
  var v=qEl.value.trim().toLowerCase();
  if(!v){S.match=null;qc.textContent=''}
  else{var m={},c=0;NODES.forEach(function(n){var hay=(n.name+' '+n.desc+' '+(n.body||'')+' '+n.path).toLowerCase();if(hay.indexOf(v)>=0){m[n.i]=true;c++}});S.match=m;qc.textContent=c?c+'건 일치':'일치 없음'}
  if(S.sel<0){renderTree()}
});
qEl.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&S.match){for(var i=0;i<N;i++){if(S.match[i]){select(i,true);break}}}
  if(e.key==='Escape'){qEl.value='';S.match=null;qc.textContent='';if(S.sel<0){renderTree()}}
});

renderPanel();
(function(){
  var st0=$('#stage'),LK='nomad-lbl',cfg={s:'cap',z:'m'};
  try{var r=JSON.parse(localStorage.getItem(LK));if(r&&r.s)cfg=r}catch(_){}
  function ap(){st0.setAttribute('data-lbl',cfg.s);st0.setAttribute('data-lsz',cfg.z);
    $$('#lblSeg button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-lbl')===cfg.s?'true':'false')});
    $('#lsz').setAttribute('aria-pressed',cfg.z==='l'?'true':'false');
    try{localStorage.setItem(LK,JSON.stringify(cfg))}catch(_){}}
  $$('#lblSeg button').forEach(function(b){b.addEventListener('click',function(){cfg.s=b.getAttribute('data-lbl');ap()})});
  $('#lsz').addEventListener('click',function(){cfg.z=cfg.z==='l'?'m':'l';ap()});
  ap();
})();
window.__brainSelect=function(id){var n=byId[id];if(n)select(n.i,true)};

if(!hasGL){
  $('#nogl').hidden=false;cv.hidden=true;$('#hint').hidden=true;
  $$('.seg button,#zin,#zout,#zreset,#auto,#replay').forEach(function(b){b.disabled=true});
  return;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setClearColor(0x000000,0);
scene=new T.Scene();
camera=new T.PerspectiveCamera(48,1,.1,300);
scene.add(camera);
scene.add(new T.AmbientLight(0xffffff,.85));
var dl=new T.DirectionalLight(0xffffff,.65);dl.position.set(.6,.9,1);camera.add(dl);
scene.fog=new T.Fog(0xffffff,20,60);

var VS='attribute float aPhase;attribute float aSize;uniform float uTime;uniform float uK;uniform float uBoost;uniform float uS;varying float vA;'+
 'void main(){vec3 p=position;float tw=.62+.38*sin(uTime*1.4+aPhase*6.2831);p*=1.0+.018*sin(uTime*.8+aPhase*12.0);'+
 'vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uS*uK*(1.0+uBoost*.4)/(-mv.z)*(.8+.4*tw);vA=tw;}';
var FS='uniform vec3 uCol;uniform float uAlpha;uniform float uBoost;varying float vA;'+
 'void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=smoothstep(.5,.0,d);gl_FragColor=vec4(uCol*(1.0+uBoost*.35),a*uAlpha*(.5+.5*vA));}';
function isDark(){return document.documentElement.getAttribute('data-theme')!=='light'}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var PCFG={agent:[1500,.09],folder:[320,.2],rule:[150,.3],index:[150,.3],source:[70,.38]};
function pgeo(n,rel,seed){
  var r=rng(seed),pos=new Float32Array(n*3),ph=new Float32Array(n),sz=new Float32Array(n),i,shell=Math.round(n*.8);
  for(i=0;i<n;i++){
    var rad,x,y,z;
    if(i<shell){var t=(i+.5)/shell,phi=Math.acos(1-2*t),th=Math.PI*(1+Math.sqrt(5))*i;x=Math.cos(th)*Math.sin(phi);y=Math.cos(phi);z=Math.sin(th)*Math.sin(phi);rad=.88+.12*r()}
    else{var u=r()*2-1,a=r()*Math.PI*2,sq=Math.sqrt(1-u*u);x=sq*Math.cos(a);y=u;z=sq*Math.sin(a);rad=.15+.7*Math.cbrt(r())}
    pos[i*3]=x*rad;pos[i*3+1]=y*rad;pos[i*3+2]=z*rad;ph[i]=r();sz[i]=rel*(.75+r()*.8+(r()<.04?.9:0));
  }
  var g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('aPhase',new T.BufferAttribute(ph,1));g.setAttribute('aSize',new T.BufferAttribute(sz,1));
  return g;
}
var geoCache={};
NODES.forEach(function(n,i){
  var cf=PCFG[n.kind],key=n.kind;
  if(!geoCache[key]){geoCache[key]=pgeo(cf[0],cf[1],100+Object.keys(geoCache).length*17)}
  n.mat=new T.ShaderMaterial({vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uTime:{value:0},uK:{value:300},uBoost:{value:0},uS:{value:1},uCol:{value:new T.Color(0xffffff)},uAlpha:{value:.9}}});
  n.mesh=new T.Points(geoCache[key],n.mat);n.mesh.frustumCulled=false;n.mesh.rotation.set(.3+i*.2,i,0);
  n.base=n.kind==='agent'?2.3:n.kind==='folder'?(n.id==='sb'?1.5:1.2):(n.kind==='source'?.42:.58);
  n.a=0;n.h=0;n.op=1;n.cur=new T.Vector3();n.sx=0;n.sy=0;n.sr=10;n.front=false;
  scene.add(n.mesh);
});
function lineObj(count,mat){
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*6),3));
  var l=new T.LineSegments(g,mat);l.frustumCulled=false;scene.add(l);return l;
}
var ceMat=new T.LineBasicMaterial({transparent:true,opacity:.6});
var leMat=new T.LineDashedMaterial({dashSize:.45,gapSize:.3,transparent:true,opacity:.6});
var hiMat=new T.LineBasicMaterial({transparent:true,opacity:1});
var ceLines=lineObj(CE.length,ceMat),leLines=lineObj(LE.length,leMat),hiLines=lineObj(ALLE.length,hiMat);
hiLines.geometry.setDrawRange(0,0);

var pc=document.createElement('canvas');pc.width=pc.height=64;
var px=pc.getContext('2d'),gr=px.createRadialGradient(32,32,0,32,32,32);
gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');
px.fillStyle=gr;px.fillRect(0,0,64,64);
var pulseMat=new T.PointsMaterial({size:.8,map:new T.CanvasTexture(pc),transparent:true,depthWrite:false,sizeAttenuation:true});
var pGeo=new T.BufferGeometry();pGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(LE.length*3),3));
var pulses=new T.Points(pGeo,pulseMat);pulses.frustumCulled=false;scene.add(pulses);
var pSpd=[],pPh=[];LE.forEach(function(e,j){pSpd.push(.16+((j*37)%10)/100);pPh.push(((j*53)%100)/100)});
var ring=new T.Mesh(new T.RingGeometry(1.2,1.3,64),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,side:T.DoubleSide,depthTest:false}));
ring.visible=false;ring.renderOrder=10;scene.add(ring);
var ag=NODES[0];
var glowC=document.createElement('canvas');glowC.width=glowC.height=64;var gx=glowC.getContext('2d'),gg=gx.createRadialGradient(32,32,0,32,32,32);gg.addColorStop(0,'rgba(255,255,255,1)');gg.addColorStop(.4,'rgba(255,255,255,.7)');gg.addColorStop(1,'rgba(255,255,255,0)');gx.fillStyle=gg;gx.fillRect(0,0,64,64);
var glow=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowC),transparent:true,depthWrite:false,opacity:.3,blending:T.AdditiveBlending}));scene.add(glow);

function applyPalette(){
  scene.fog.color.set(css('--stage'));
  var dk=isDark();NODES.forEach(function(n){n.mat.uniforms.uCol.value.set(css(DOM_VAR[n.dom]));n.mat.blending=dk?T.AdditiveBlending:T.NormalBlending;n.mat.uniforms.uAlpha.value=dk?.9:.85;n.mat.needsUpdate=true});
  ceMat.color.set(css('--edge'));leMat.color.set(css('--edge'));
  hiMat.color.set(css('--accent'));ring.material.color.set(css('--accent'));pulseMat.color.set(css('--pulse'));
  glow.material.color.set(css('--accent'));glow.material.opacity=dk?.3:0;
}
applyPalette();
var dq=matchMedia('(prefers-color-scheme: dark)');
if(dq.addEventListener){dq.addEventListener('change',applyPalette)}else{dq.addListener(applyPalette)}
new MutationObserver(applyPalette).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

/* 라벨 */
var labelsEl=$('#labels');
NODES.forEach(function(n){
  var s=document.createElement('span');s.className='lbl'+(n.kind==='folder'||n.kind==='agent'?' lbl-f':'');
  s.textContent=n.name+(n.kind==='folder'?'/':'');s.style.setProperty('--lc','var('+DOM_VAR[n.dom]+')');labelsEl.appendChild(s);
  n.lbl=s;n.lOn=false;n.lDim=false;
});

function resize(){
  var r=stage.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);
  renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();NODES.forEach(function(n){n.mat.uniforms.uK.value=H*renderer.getPixelRatio()/(2*Math.tan(24*Math.PI/180))});
}
resize();
if(window.ResizeObserver){new ResizeObserver(resize).observe(stage)}else{window.addEventListener('resize',resize)}
orbit.dist=fitDist();

/* ================= 프레임 ================= */
var tmp=new T.Vector3(),visible=true,last=performance.now();
function update(dt,now){
  var k=1-Math.exp(-dt*9);
  if(S.mode==='3d'&&S.auto&&!reduce&&S.sel<0&&nptr===0&&now>idleUntil){orbit.yaw+=dt*.12}
  var cp=Math.cos(orbit.pitch);
  camera.position.set(orbit.tx+orbit.dist*Math.sin(orbit.yaw)*cp,orbit.ty+orbit.dist*Math.sin(orbit.pitch),orbit.tz+orbit.dist*Math.cos(orbit.yaw)*cp);
  camera.lookAt(orbit.tx,orbit.ty,orbit.tz);camera.updateMatrixWorld();
  scene.fog.near=orbit.dist*.9;scene.fog.far=orbit.dist*2;
  var f=S.flat,rx=L3[0][0]+(L2[0][0]-L3[0][0])*f,ry=L3[0][1]+(L2[0][1]-L3[0][1])*f,rz=L3[0][2]+(L2[0][2]-L3[0][2])*f;
  var near=orbit.dist<21,i,n;
  for(i=0;i<N;i++){
    n=NODES[i];
    var bx=L3[i][0]+(L2[i][0]-L3[i][0])*f,by=L3[i][1]+(L2[i][1]-L3[i][1])*f,bz=L3[i][2]+(L2[i][2]-L3[i][2])*f,a=n.a;
    n.cur.set(rx+(bx-rx)*a,ry+(by-ry)*a,rz+(bz-rz)*a);
    n.mesh.position.copy(n.cur);
    n.h+=(((S.hover===i||S.sel===i)?1:0)-n.h)*k;
    var s=n.base*Math.max(a,.0001)*(1+.25*n.h);
    n.mesh.scale.setScalar(s);
    if(!reduce){n.mesh.rotation.y+=dt*(.1+.05*(i%4));n.mesh.rotation.x+=dt*.03}n.mat.uniforms.uTime.value=reduce?0:now/1000;n.mat.uniforms.uS.value=s;n.mat.uniforms.uBoost.value=n.h;
    var dim=isDim(i);n.op+=((dim?.2:1)-n.op)*k;n.mat.uniforms.uAlpha.value=n.op*(isDark()?.9:.85);n.mesh.visible=a>.01;
    tmp.copy(n.cur).project(camera);
    n.sx=(tmp.x*.5+.5)*W;n.sy=(-tmp.y*.5+.5)*H;n.front=tmp.z<1&&tmp.z>-1;
    n.sr=s/(camera.position.distanceTo(n.cur)*.445)*(H/2);
    var show=n.front&&a>.6&&(n.kind==='folder'||n.kind==='agent'||near||S.sel===i||S.hover===i||(S.sel>=0&&nbr[S.sel][i])||(S.match&&S.match[i]));
    if(dim&&S.hover!==i&&n.kind!=='folder'&&n.kind!=='agent'){show=false}
    if(show!==n.lOn){n.lOn=show;n.lbl.classList.toggle('on',show)}
    if(dim!==n.lDim){n.lDim=dim;n.lbl.classList.toggle('dim',dim)}
    if(show){n.lbl.style.transform='translate3d('+n.sx.toFixed(1)+'px,'+n.sy.toFixed(1)+'px,0) translate(-50%,'+(Math.round(n.sr)+6)+'px)'}
  }
  glow.visible=ag.a>.01&&isDark();glow.position.copy(ag.cur);glow.scale.setScalar(ag.base*Math.max(ag.a,.0001)*5.2);glow.material.opacity=.3*ag.op;
  var cePos=ceLines.geometry.attributes.position.array,lePos=leLines.geometry.attributes.position.array,j,e,A,B;
  for(j=0;j<CE.length;j++){e=CE[j];A=NODES[e[0]].cur;B=NODES[e[1]].cur;cePos[j*6]=A.x;cePos[j*6+1]=A.y;cePos[j*6+2]=A.z;cePos[j*6+3]=B.x;cePos[j*6+4]=B.y;cePos[j*6+5]=B.z}
  for(j=0;j<LE.length;j++){e=LE[j];A=NODES[e[0]].cur;B=NODES[e[1]].cur;lePos[j*6]=A.x;lePos[j*6+1]=A.y;lePos[j*6+2]=A.z;lePos[j*6+3]=B.x;lePos[j*6+4]=B.y;lePos[j*6+5]=B.z}
  ceLines.geometry.attributes.position.needsUpdate=true;leLines.geometry.attributes.position.needsUpdate=true;
  leLines.computeLineDistances();
  var dimE=(S.sel>=0||S.match)?.14:.6;
  ceMat.opacity+=(dimE-ceMat.opacity)*k;leMat.opacity+=(dimE-leMat.opacity)*k;
  var hp=hiLines.geometry.attributes.position.array,c=0;
  if(S.sel>=0){for(j=0;j<ALLE.length;j++){e=ALLE[j];if(e[0]===S.sel||e[1]===S.sel){A=NODES[e[0]].cur;B=NODES[e[1]].cur;hp[c*6]=A.x;hp[c*6+1]=A.y;hp[c*6+2]=A.z;hp[c*6+3]=B.x;hp[c*6+4]=B.y;hp[c*6+5]=B.z;c++}}}
  hiLines.geometry.setDrawRange(0,c*2);hiLines.geometry.attributes.position.needsUpdate=true;
  var pp=pGeo.attributes.position.array,t0=now/1000;
  for(j=0;j<LE.length;j++){
    e=LE[j];A=NODES[e[0]];B=NODES[e[1]];
    if(reduce||Math.min(A.a,B.a)<.95){pp[j*3]=0;pp[j*3+1]=-9999;pp[j*3+2]=0;continue}
    var tt=(t0*pSpd[j]+pPh[j])%1;
    pp[j*3]=A.cur.x+(B.cur.x-A.cur.x)*tt;pp[j*3+1]=A.cur.y+(B.cur.y-A.cur.y)*tt;pp[j*3+2]=A.cur.z+(B.cur.z-A.cur.z)*tt;
  }
  pGeo.attributes.position.needsUpdate=true;
  if(S.sel>=0){var sn=NODES[S.sel];ring.visible=true;ring.position.copy(sn.cur);ring.quaternion.copy(camera.quaternion);ring.scale.setScalar(sn.base*(sn.kind==='folder'?1.25:1)*(sn.kind==='agent'?1.5:1.35)*(1+.06*Math.sin(now/260)))}
  else{ring.visible=false}
}
function frame(now){
  requestAnimationFrame(frame);
  if(!visible||document.hidden){last=now;return}
  var dt=Math.min(.05,(now-last)/1000);last=now;
  update(dt,now);renderer.render(scene,camera);
}

/* 인트로 (노드가 중심에서 퍼져 나가는 등장) */
var introDone=false;
function playIntro(){
  introDone=true;
  var fd=fitDist();
  if(reduce||!G){NODES.forEach(function(n){n.a=1});orbit.dist=fd;return}
  NODES.forEach(function(n){G.killTweensOf(n);n.a=0;G.to(n,{a:1,duration:.95,delay:.1+depth[n.i]*.3+(n.i%5)*.03,ease:'back.out(1.5)'})});
  G.killTweensOf(orbit);
  G.fromTo(orbit,{yaw:orbit.yaw-1.2,dist:fd*1.3},{yaw:orbit.yaw,dist:fd,duration:2.6,ease:'power3.out'});
}
/* 등장 애니메이션은 화면 위치와 무관하게 즉시 시작한다(보이는지에 의존하면 아래쪽에 있을 때 빈 화면이 된다) */
playIntro();
if('IntersectionObserver' in window){
  new IntersectionObserver(function(es){visible=es[0].isIntersecting},{threshold:0}).observe(stage);
}
/* 안전장치: 3초 뒤에도 등장하지 않은 노드가 있으면 강제로 표시 */
setTimeout(function(){NODES.forEach(function(n){if(n.a<.01&&!(G&&G.isTweening(n))){n.a=1}})},3000);
/* GPU 컨텍스트 손실 복구 */
cv.addEventListener('webglcontextlost',function(e){e.preventDefault()});
cv.addEventListener('webglcontextrestored',function(){NODES.forEach(function(n){n.mat.needsUpdate=true});resize()});
requestAnimationFrame(frame);

/* ================= 조작 ================= */
function pick(cx,cy){
  var r=cv.getBoundingClientRect(),x=cx-r.left,y=cy-r.top,best=-1,bd=1e9;
  for(var i=0;i<N;i++){
    var n=NODES[i];if(!n.front||n.a<.5)continue;
    var d=Math.hypot(n.sx-x,n.sy-y),rad=Math.max(16,n.sr+8);
    if(d<rad&&d<bd){bd=d;best=i}
  }
  return best;
}
function pan(dx,dy){
  var sc=2*orbit.dist*.445/H,m=camera.matrixWorld.elements;
  orbit.tx-=m[0]*dx*sc;orbit.ty-=m[1]*dx*sc;orbit.tz-=m[2]*dx*sc;
  orbit.tx+=m[4]*dy*sc;orbit.ty+=m[5]*dy*sc;orbit.tz+=m[6]*dy*sc;
  var l=Math.hypot(orbit.tx,orbit.ty,orbit.tz);if(l>14){var q=14/l;orbit.tx*=q;orbit.ty*=q;orbit.tz*=q}
}
function zoomBy(f){orbit.dist=clamp(orbit.dist*f,8,70)}
var ptrs={},down=null,pinch0=0;
function pdist(){var k=Object.keys(ptrs);if(k.length<2)return 0;var a=ptrs[k[0]],b=ptrs[k[1]];return Math.hypot(a.x-b.x,a.y-b.y)}
cv.addEventListener('contextmenu',function(e){e.preventDefault()});
cv.addEventListener('pointerdown',function(e){
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  ptrs[e.pointerId]={x:e.clientX,y:e.clientY};nptr++;
  if(nptr===1){down={t:performance.now(),moved:0}}else if(down){down.moved=99}
  if(nptr===2){pinch0=pdist()}
  idleUntil=Infinity;if(G){G.killTweensOf(orbit)}
  cv.style.cursor='grabbing';
});
cv.addEventListener('pointermove',function(e){
  var p=ptrs[e.pointerId];
  if(!p){
    if(e.pointerType==='mouse'&&nptr===0){var h=pick(e.clientX,e.clientY);if(h!==S.hover){S.hover=h;cv.style.cursor=h>=0?'pointer':'grab'}}
    return;
  }
  var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(nptr===1){
    down.moved+=Math.abs(dx)+Math.abs(dy);
    if(S.mode==='3d'&&!(e.buttons&2)&&!e.shiftKey){orbit.yaw-=dx*.0065;orbit.pitch=clamp(orbit.pitch+dy*.0055,-1.35,1.35)}
    else{pan(dx,dy)}
  }else if(nptr===2){
    var d=pdist();if(pinch0>0&&d>0){zoomBy(pinch0/d)}pinch0=d;pan(dx/2,dy/2);
  }
});
function endPtr(e){
  if(!ptrs[e.pointerId])return;
  delete ptrs[e.pointerId];nptr=Math.max(0,nptr-1);
  if(nptr===0){
    idleUntil=performance.now()+2500;cv.style.cursor=S.hover>=0?'pointer':'grab';
    if(down&&e.type==='pointerup'&&down.moved<6&&performance.now()-down.t<600){var h=pick(e.clientX,e.clientY);select(h,true)}
    down=null;
  }else if(nptr===1){pinch0=0}
}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('pointerleave',function(){if(nptr===0&&S.hover>=0){S.hover=-1;cv.style.cursor='grab'}});
cv.addEventListener('wheel',function(e){e.preventDefault();zoomBy(Math.exp(e.deltaY*.0015));idleUntil=performance.now()+2500},{passive:false});

function wrapYaw(){orbit.yaw-=Math.round(orbit.yaw/(2*Math.PI))*2*Math.PI}
function setMode(m){
  if(m===S.mode)return;
  S.mode=m;
  $$('.seg button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-mode')===m?'true':'false')});
  $('#hint').textContent=m==='3d'?'드래그 회전 · 우클릭·두 손가락 이동 · 휠·핀치 확대':'드래그 이동 · 휠·핀치 확대';
  wrapYaw();
  var t=S.sel>=0?nodeTarget(S.sel):{x:0,y:0,z:0};
  anim(S,{flat:m==='2d'?1:0},1,'power2.inOut');
  anim(orbit,m==='2d'?{yaw:0,pitch:0,tx:t.x,ty:t.y,tz:t.z}:{yaw:.65,pitch:.32,tx:t.x,ty:t.y,tz:t.z},1,'power2.inOut');
}
$$('.seg button').forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-mode'))})});
$('#zin').addEventListener('click',function(){anim(orbit,{dist:clamp(orbit.dist/1.3,8,70)},.35)});
$('#zout').addEventListener('click',function(){anim(orbit,{dist:clamp(orbit.dist*1.3,8,70)},.35)});
$('#zreset').addEventListener('click',function(){
  S.sel=-1;renderPanel();wrapYaw();
  anim(orbit,{tx:0,ty:0,tz:0,dist:fitDist(),yaw:S.mode==='2d'?0:.65,pitch:S.mode==='2d'?0:.32},.8,'power3.out');
});
$('#auto').addEventListener('click',function(){S.auto=!S.auto;this.setAttribute('aria-pressed',S.auto?'true':'false')});
$('#replay').addEventListener('click',function(){S.sel=-1;renderPanel();idleUntil=performance.now()+3000;playIntro()});