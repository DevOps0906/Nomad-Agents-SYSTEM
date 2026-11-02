const fs=require('fs');
const old=fs.readFileSync('old.html','utf8').split('\n');
const L=(a,b)=>old.slice(a-1,b).join('\n'); // 1-based inclusive
const css=fs.readFileSync('style.css','utf8');
const body=fs.readFileSync('body.html','utf8');
const app=fs.readFileSync('app.js','utf8');
const home3d=fs.readFileSync('home3d.js','utf8');
const prompts=JSON.parse(fs.readFileSync('prompts.json','utf8'));
prompts.brain3=prompts.brain3.replace(/필요한 패키지가 있으면 설치 전에[\s\S]*$/,'필요한 패키지가 있으면 설치 전에 목록과 이유를 먼저 알려 주세요.');
const pages=JSON.parse(fs.readFileSync('pages.json','utf8'));
let tpl=L(213,249).replace('<h2 id="h-brain">세컨드 브레인 탐색기</h2>','<h3 style="font-size:var(--fs-h2)">3D 탐색기</h3>');
tpl=tpl.replace('<div class="zoom"','<div class="seg" role="group" aria-label="글자 스타일" id="lblSeg"><button type="button" data-lbl="cap" aria-pressed="true">캡슐</button><button type="button" data-lbl="light" aria-pressed="false">밝은</button><button type="button" data-lbl="text" aria-pressed="false">글자만</button></div><button type="button" class="btn" id="lsz" aria-pressed="false" title="라벨 글자 크기">글자 크게</button>\n      <div class="zoom"');
if(!tpl.includes('lblSeg'))throw new Error('tpl');
let ex=fs.readFileSync('explorer.js','utf8');
if(!ex.includes('__brainSelect'))throw new Error('patch miss');
ex="document.addEventListener('brain:mounted',function(){'use strict';\n"+ex+"\n},{once:true});";
const html=`<title>Nomad-Agents-SYSTEM</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
${css}
</style>
${body}
<template id="brain-tpl">
${tpl}
</template>
<script data-nomad src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script data-nomad src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script data-nomad>window.__D=${JSON.stringify({prompts,pages}).replace(/</g,'\\u003c')};</script>
<script data-nomad>
${app}
</script>
<script data-nomad>
${ex}
</script>
<script data-nomad>
${home3d}
</script>
`;
fs.writeFileSync('../app/index.html',html);
console.log('bytes',html.length);
