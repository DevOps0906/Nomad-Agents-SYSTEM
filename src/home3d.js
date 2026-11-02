(function(){
'use strict';
var T=window.THREE,G=window.gsap;
var cv=document.getElementById('hgl'),box=document.getElementById('hstage'),lab=document.getElementById('hlabels'),nogl=document.getElementById('hnogl');
var css=function(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var CL=[
 {id:'agent',name:'메인 에이전트',sub:'AGENTS.md',n:1500,r:1.6,col:'--accent',p:[0,0],sh:'ci',sel:'agent',sp:.16},
 {id:'root',name:'규칙 문서',sub:'6개',n:520,r:.95,col:'--c-root',p:[-1,-1],sh:'sq',sel:'sb',sp:-.22},
 {id:'content',name:'콘텐츠',sub:'7개',n:640,r:1.08,col:'--c-content',p:[1,-1],sh:'sq',sel:'c_dir',sp:.2},
 {id:'dev',name:'개발',sub:'6개',n:580,r:1,col:'--c-dev',p:[-1,1],sh:'sq',sel:'d_dir',sp:.25},
 {id:'fin',name:'재무',sub:'5개',n:500,r:.9,col:'--c-fin',p:[1,1],sh:'sq',sel:'f_dir',sp:-.18}
];
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var renderer,hasGL=false;
if(T){try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'low-power'});hasGL=true}catch(e){hasGL=false}}
CL.forEach(function(c){
  var b=document.createElement('button');b.type='button';b.className='hl';b.setAttribute('data-sel',c.sel);
  b.innerHTML='<i class="'+c.sh+'" style="--c:var('+c.col+')"></i><span>'+c.name+'</span><small>'+c.sub+'</small>';
  b.setAttribute('aria-label',c.name+' '+c.sub+' — 탐색기에서 열기');
  lab.appendChild(b);c.el=b;
});
function go(sel){location.hash='#brain';setTimeout(function(){if(window.__brainSelect)window.__brainSelect(sel)},80)}
lab.addEventListener('click',function(e){var b=e.target.closest('[data-sel]');if(b)go(b.getAttribute('data-sel'))});
if(!hasGL){nogl.hidden=false;cv.hidden=true;return}

var FOV=38,DIST=26;
var scene=new T.Scene(),camera=new T.PerspectiveCamera(FOV,1,.1,100);
camera.position.set(0,0,DIST);
var VS='attribute float aPhase;attribute float aSize;uniform float uTime;uniform float uK;uniform float uBoost;varying float vA;'+
 'void main(){vec3 p=position;float tw=.62+.38*sin(uTime*1.4+aPhase*6.2831);p*=1.0+.018*sin(uTime*.8+aPhase*12.0);'+
 'vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uK*(1.0+uBoost*.4)/(-mv.z)*(.8+.4*tw);vA=tw;}';
var FS='uniform vec3 uCol;uniform float uAlpha;uniform float uBoost;varying float vA;'+
 'void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float a=smoothstep(.5,.0,d);gl_FragColor=vec4(uCol*(1.0+uBoost*.35),a*uAlpha*(.5+.5*vA));}';
var dark=function(){return document.documentElement.getAttribute('data-theme')!=='light'};
CL.forEach(function(c,ci){
  var r=rng(100+ci*17),pos=new Float32Array(c.n*3),ph=new Float32Array(c.n),sz=new Float32Array(c.n),i,shell=Math.round(c.n*.8);
  for(i=0;i<c.n;i++){
    var rad,x,y,z;
    if(i<shell){var t=(i+.5)/shell,phi=Math.acos(1-2*t),th=Math.PI*(1+Math.sqrt(5))*i;x=Math.cos(th)*Math.sin(phi);y=Math.cos(phi);z=Math.sin(th)*Math.sin(phi);rad=.88+.12*r()}
    else{var u=r()*2-1,a=r()*Math.PI*2,s=Math.sqrt(1-u*u);x=s*Math.cos(a);y=u;z=s*Math.sin(a);rad=.15+.7*Math.cbrt(r())}
    pos[i*3]=x*rad;pos[i*3+1]=y*rad;pos[i*3+2]=z*rad;ph[i]=r();sz[i]=.07+r()*.11+(r()<.04?.12:0);
  }
  var g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('aPhase',new T.BufferAttribute(ph,1));g.setAttribute('aSize',new T.BufferAttribute(sz,1));
  var m=new T.ShaderMaterial({vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uTime:{value:0},uK:{value:300},uBoost:{value:0},uCol:{value:new T.Color(0xffffff)},uAlpha:{value:.9}}});
  c.mat=m;c.pts=new T.Points(g,m);c.pts.frustumCulled=false;c.pts.rotation.set(.35+ci*.2,ci,0);c.grp=new T.Group();c.grp.add(c.pts);scene.add(c.grp);c.boost=0;c.k=1;c.sx=0;c.sy=0;c.sr=40;
});
var lineGeo=new T.BufferGeometry();lineGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(8*3),3));
var lineMat=new T.LineBasicMaterial({transparent:true,opacity:.45});
var lines=new T.LineSegments(lineGeo,lineMat);lines.frustumCulled=false;scene.add(lines);
var pc=document.createElement('canvas');pc.width=pc.height=64;var px=pc.getContext('2d'),gr=px.createRadialGradient(32,32,0,32,32,32);
gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');px.fillStyle=gr;px.fillRect(0,0,64,64);
var tex=new T.CanvasTexture(pc);
var pulseMat=new T.PointsMaterial({size:.5,map:tex,transparent:true,depthWrite:false,sizeAttenuation:true});
var pGeo=new T.BufferGeometry();pGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(4*3),3));
var pulses=new T.Points(pGeo,pulseMat);pulses.frustumCulled=false;scene.add(pulses);
var glow=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:.35,blending:T.AdditiveBlending}));scene.add(glow);

function paint(){
  var d=dark();
  CL.forEach(function(c){c.mat.uniforms.uCol.value.set(css(c.col));c.mat.blending=d?T.AdditiveBlending:T.NormalBlending;c.mat.uniforms.uAlpha.value=d?.9:.85;c.mat.needsUpdate=true});
  lineMat.color.set(css('--edge'));pulseMat.color.set(css('--pulse'));glow.material.color.set(css('--accent'));glow.material.opacity=d?.3:.0;
  draw();
}
var W=1,H=1,visW=1,visH=1,kk=1;
function layout(){
  var half=Math.tan(FOV*Math.PI/360)*DIST;visH=half*2;visW=visH*(W/H);
  kk=Math.max(.55,Math.min(visW,visH)/12);
  var ax=visW*.31,ay=visH*.27;
  var lp=lineGeo.attributes.position.array,n=0;
  CL.forEach(function(c,i){
    c.k=kk;c.grp.position.set(c.p[0]*ax,-c.p[1]*ay*(i?1:0),[0,-2.2,2.2,2.2,-2.2][i]*kk);c.grp.scale.setScalar(c.r*kk);
    c.mat.uniforms.uK.value=(H*renderer.getPixelRatio())/(2*Math.tan(FOV*Math.PI/360))*kk;
    if(i>0){lp[n++]=0;lp[n++]=0;lp[n++]=0;lp[n++]=c.grp.position.x;lp[n++]=c.grp.position.y;lp[n++]=c.grp.position.z}
  });
  // 위성끼리도 한 줄로 연결
  var s=CL.slice(1),pairs=[[0,1],[1,3],[3,2],[2,0]];
  pairs.forEach(function(p){});
  lineGeo.setDrawRange(0,8);lineGeo.attributes.position.needsUpdate=true;
  glow.position.set(0,0,-1);glow.scale.setScalar(CL[0].r*kk*5.2);
  pulseMat.size=.5*kk;
}
var tmp=new T.Vector3();
function place(){
  CL.forEach(function(c){
    tmp.copy(c.grp.position).project(camera);c.sx=(tmp.x*.5+.5)*W;c.sy=(-tmp.y*.5+.5)*H;
    c.sr=c.r*kk/(visH/2)*(H/2)*(DIST/(DIST));
    c.el.style.transform='translate3d('+c.sx.toFixed(1)+'px,'+(c.sy+c.sr+16).toFixed(1)+'px,0) translate(-50%,-50%)';
  });
}
function resize(){
  var r=box.getBoundingClientRect();if(r.width<2||r.height<2)return;
  W=r.width;H=r.height;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();layout();place();draw();
}
var yaw=0,pitch=.12,vyaw=0,drag=null,moved=0;
var T0=performance.now(),last=T0,hover=-1,px0=0,py0=0,tx=0,ty=0;
function draw(){if(W>1)renderer.render(scene,camera)}
function frame(now){
  requestAnimationFrame(frame);
  if(!on||document.hidden){last=now;return}
  var dt=Math.min(.05,(now-last)/1000);last=now;
  var t=(now-T0)/1000,k=1-Math.exp(-dt*8);
  if(!drag){yaw+=vyaw*dt*60;vyaw*=Math.pow(.92,dt*60);if(!reduce&&Math.abs(vyaw)<.002)yaw+=dt*.12}
  var cp=Math.cos(pitch);camera.position.set(DIST*Math.sin(yaw)*cp,DIST*Math.sin(pitch),DIST*Math.cos(yaw)*cp);camera.lookAt(0,0,0);
  CL.forEach(function(c,i){
    c.mat.uniforms.uTime.value=reduce?0:t;
    if(!reduce){c.pts.rotation.y+=dt*c.sp;c.pts.rotation.x+=dt*c.sp*.35}
    c.boost+=((hover===i?1:0)-c.boost)*k;c.mat.uniforms.uBoost.value=c.boost;
  });
  var lp=pGeo.attributes.position.array;
  for(var j=0;j<4;j++){
    var s=CL[j+1].grp.position,tt=reduce?.5:((t*.12+j*.27)%1);
    lp[j*3]=s.x*tt;lp[j*3+1]=s.y*tt;lp[j*3+2]=s.z*tt;
  }
  pGeo.attributes.position.needsUpdate=true;
  place();draw();
}
var on=false,seen=true;
function upd(){on=window.__view==='home'&&seen&&!reduce_off()}
function reduce_off(){return false}
document.addEventListener('viewchange',function(){upd();if(window.__view==='home'){setTimeout(function(){resize();intro()},30)}});
if('IntersectionObserver' in window){new IntersectionObserver(function(es){seen=es[0].isIntersecting;upd()},{threshold:.01}).observe(box)}
var played=false;
function intro(){
  if(played||reduce||!G)return;played=true;
  CL.forEach(function(c,i){var o={s:0};c.grp.scale.setScalar(.001);G.to(o,{s:1,duration:1,delay:.1+i*.12,ease:'back.out(1.4)',onUpdate:function(){c.grp.scale.setScalar(Math.max(.001,c.r*kk*o.s))}})});
}
box.style.touchAction='pan-y';
function pickAt(x,y){var best=-1,bd=1e9;CL.forEach(function(c,i){var d=Math.hypot(c.sx-x,c.sy-y);if(d<c.sr+14&&d<bd){bd=d;best=i}});return best}
box.addEventListener('pointerdown',function(e){
  if(e.button>0)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId,touch:e.pointerType==='touch'};moved=0;vyaw=0;
  try{box.setPointerCapture(e.pointerId)}catch(_){}
  box.style.cursor='grabbing';
});
box.addEventListener('pointermove',function(e){
  var r=box.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(drag&&drag.id===e.pointerId){
    var dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);
    yaw-=dx*.008;vyaw=-dx*.008*.6;if(!drag.touch){pitch=Math.max(-.9,Math.min(.9,pitch+dy*.006))}
    return;
  }
  hover=pickAt(x,y);box.style.cursor=hover>=0?'pointer':'grab';
});
function endDrag(e){if(drag&&drag.id===e.pointerId){drag=null;box.style.cursor=hover>=0?'pointer':'grab'}}
box.addEventListener('pointerup',endDrag);box.addEventListener('pointercancel',endDrag);
box.addEventListener('pointerleave',function(){hover=-1});
box.addEventListener('click',function(e){
  if(moved>6){e.stopPropagation();e.preventDefault();moved=0;return}
  if(e.target.closest('[data-sel]'))return;
  var r=box.getBoundingClientRect(),best=pickAt(e.clientX-r.left,e.clientY-r.top);
  if(best>=0)go(CL[best].sel);
},true);
box.style.cursor='grab';
if(window.ResizeObserver){new ResizeObserver(resize).observe(box)}else{window.addEventListener('resize',resize)}
new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
paint();resize();upd();requestAnimationFrame(frame);
})();
