const canvas=document.querySelector('#game');
const ctx=canvas.getContext('2d');
const startButton=document.querySelector('#startButton');
const actionButton=document.querySelector('#actionButton');
const dialogue=document.querySelector('#dialogue');
const hint=document.querySelector('#hint');
const joystick=document.querySelector('#joystick');
const joystickKnob=document.querySelector('#joystickKnob');

const W=192,H=336,SCALE=2,WORLD_W=384;
ctx.imageSmoothingEnabled=false;
const C={ink:'#30243d',deep:'#17172a',night:'#24213d',cream:'#fff2d1',gold:'#f3c665',pink:'#f49ab8',rose:'#cf6489',lav:'#c7b0e8',skin:'#f4c5aa',skin2:'#df9f86',hair:'#3b3139',hair2:'#5c4850',wood:'#9b674f',wood2:'#71483c',floor:'#bd8869',gym:'#747b80',gym2:'#5f666b',white:'#fffaf0',black:'#17131d',blue:'#7db0d1',green:'#75a977'};
let scene='title',elapsed=0,cameraX=0;
let player={x:96,y:267,dir:'up',frame:0};
let yuli={x:125,y:108,dir:'down',frame:0,state:'counter'};
let gymIntroStarted=false,foundYuli=false,dialogueQueue=[],dialogueCallback=null;
let joy={active:false,id:null,dx:0,dy:0};

function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function rect(x,y,w,h,fill,border=C.ink,t=2){px(x,y,w,h,border);px(x+t,y+t,w-t*2,h-t*2,fill);}
function text(s,x,y,size=7,color=C.cream,align='left'){ctx.save();ctx.fillStyle=color;ctx.font=`700 ${size}px monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(s,x,y);ctx.restore();}
function star(x,y,c=C.gold){px(x+1,y,1,3,c);px(x,y+1,3,1,c);}

function drawPerson(x,y,o={}){
  const female=!!o.female,dir=o.dir||'down',frame=o.frame||0,shirt=o.shirt||C.blue,pants=o.pants||C.black,hair=o.hair||C.hair,scale=o.scale||1;
  const q=(a,b,w,h,c)=>px(x+a*scale,y+b*scale,w*scale,h*scale,c);
  const step=frame%2;
  q(4,0,12,2,hair);q(2,2,16,6,hair);q(1,6,18,8,hair);
  if(female){q(0,8,4,15,hair);q(16,8,4,15,hair);q(2,18,3,10,hair);q(15,18,3,10,hair);}else{q(2,4,3,5,hair);q(15,4,3,5,hair);}
  q(4,6,12,11,C.skin);q(5,7,10,2,C.skin);
  if(dir==='down'){
    q(6,10,3,3,C.ink);q(11,10,3,3,C.ink);q(7,10,1,1,C.white);q(12,10,1,1,C.white);q(9,15,2,1,C.rose);
    q(4,13,2,2,C.skin2);q(14,13,2,2,C.skin2);
  }else if(dir==='left'){q(5,10,3,3,C.ink);q(6,10,1,1,C.white);}else if(dir==='right'){q(12,10,3,3,C.ink);q(13,10,1,1,C.white);}
  if(female){q(6,2,2,6,hair);q(9,2,2,7,hair);q(12,2,2,6,hair);}else{q(5,2,3,3,hair);q(9,1,3,4,hair);q(13,2,3,3,hair);}
  q(4,17,12,9,shirt);q(2,18,2,8,shirt);q(16,18,2,8,shirt);
  if(female){q(5,25,10,4,pants);q(5,29,4,6,C.skin);q(11,29,4,6,C.skin);}else{q(5,25,4,8,pants);q(11,25,4,8,pants);}
  const shoe=C.white;if(step){q(4,34,5,2,shoe);q(12,33,5,2,shoe);}else{q(5,33,5,2,shoe);q(11,34,5,2,shoe);}
}

function drawTitle(){
  px(0,0,W,H,C.deep);px(0,218,W,118,C.night);
  for(let i=0;i<30;i++){const x=(i*37+13)%W,y=(i*53+19)%185;i%4?px(x,y,1,1,C.cream):star(x,y);}
  rect(20,78,152,125,'#514466',C.ink,3);rect(26,84,140,113,'#282641',C.ink,2);
  for(let i=0;i<9;i++){const x=34+(i%3)*43,y=105+Math.floor(i/3)*25;rect(x,y,17,14,i===7?C.pink:C.gold,C.ink,2);}
  rect(72,157,48,39,C.wood2,C.ink,3);px(95,160,2,32,C.gold);
  rect(36,58,120,30,C.cream,C.ink,3);text('500일 꿈속 호텔',96,67,10,C.ink,'center');
  drawPerson(55,224,{shirt:C.black,pants:C.black,scale:1.15});
  drawPerson(107,224,{female:true,shirt:C.lav,pants:C.black,scale:1.15});
  text('기억 속 방들을 찾아가 보세요',96,286,7,C.cream,'center');
}

function drawLobby(){
  px(0,0,W,H,C.night);px(0,18,W,166,'#755f79');
  for(let x=0;x<W;x+=16)for(let y=184;y<H;y+=16){px(x,y,16,16,((x+y)/16)%2?'#9e6f70':'#b17d75');px(x,y,16,2,'#805a64');}
  rect(14,34,164,73,'#292743',C.ink,3);for(let i=0;i<22;i++)px(22+(i*19)%148,43+(i*23)%52,2,2,i%3?C.gold:C.cream);
  rect(18,130,65,40,'#c69068',C.ink,3);px(24,122,52,12,C.cream);text('FRONT',50,125,6,C.ink,'center');
  rect(112,116,48,68,C.wood2,C.ink,3);px(118,123,36,51,'#513848');text('308',136,135,12,C.gold,'center');
  rect(37,197,38,54,'#44384f',C.ink,3);text('???',56,214,7,'#82758e','center');
  rect(120,203,48,34,'#3a354d',C.ink,3);text('ROOF',144,214,6,'#786f87','center');
  drawPerson(player.x-10,player.y-36,{shirt:C.black,pants:C.black,dir:player.dir,frame:player.frame});
  text('호텔 로비',9,7,7,C.cream);
}

function drawVending(x,y){rect(x,y,30,47,'#706f86',C.ink,2);rect(x+5,y+5,20,23,'#313447',C.ink,1);for(let r=0;r<3;r++)for(let c=0;c<3;c++)px(x+7+c*6,y+7+r*7,4,5,['#d67d77','#72a6c6','#d6b66b'][(r+c)%3]);px(x+8,y+33,14,5,C.cream);}
function drawWater(x,y){rect(x,y+9,22,34,'#d7d9df',C.ink,2);rect(x+4,y,14,13,'#8eb8d5',C.ink,2);px(x+8,y+25,6,5,'#6f8295');}
function drawSofa(x,y){rect(x,y,52,24,'#403942',C.ink,2);px(x+5,y+4,19,12,'#58505a');px(x+28,y+4,19,12,'#58505a');}
function drawCounter(x,y){rect(x,y,91,34,C.wood,C.ink,2);px(x+4,y+5,83,5,C.wood2);px(x+8,y+14,30,15,'#68483d');px(x+44,y+14,39,15,'#68483d');}
function drawDumbbells(x,y){rect(x,y,63,11,'#34383b',C.ink,1);for(let i=0;i<7;i++){px(x+4+i*8,y-7,5,7,'#25282b');px(x+5+i*8,y-9,3,2,'#555b60');}}
function drawSmith(x,y){px(x,y,3,53,C.ink);px(x+37,y,3,53,C.ink);px(x+2,y+4,36,3,'#8b9196');px(x+5,y+27,30,3,'#babec1');px(x+10,y+39,20,5,'#383b3f');}
function drawTreadmill(x,y){rect(x,y,28,40,'#35393c',C.ink,2);px(x+5,y+7,18,11,'#18202a');px(x+7,y+28,16,5,'#666d71');px(x+22,y+18,3,13,'#858b8f');}
function drawMachine(x,y,type=0){rect(x,y,28,36,['#53595d','#60686d','#474e52'][type%3],C.ink,2);px(x+6,y+5,16,5,'#9aa0a4');px(x+12,y+10,3,18,C.ink);px(x+5,y+27,18,3,C.deep);}

function drawGymWorld(){
  const cam=cameraX;
  ctx.save();ctx.translate(-cam,0);
  px(0,0,WORLD_W,H,'#d8c1aa');
  px(0,0,WORLD_W,82,'#8c6d62');
  for(let x=0;x<WORLD_W;x+=16)for(let y=82;y<H;y+=16){px(x,y,16,16,x<192?(((x+y)/16)%2?'#ba8568':'#c48d6d'):(((x+y)/16)%2?C.gym:C.gym2));px(x,y,16,1,x<192?'#9f705c':'#565d61');px(x,y,1,16,x<192?'#9f705c':'#565d61');}
  // 입구 페이지: 사용자 스케치 위치
  drawVending(18,45);drawWater(22,108);drawSofa(18,164);drawCounter(83,55);
  rect(7,16,69,22,'#5c4037',C.ink,2);text('HEALTH BOY GYM',41,23,6,C.cream,'center');
  px(180,143,10,3,C.gold);px(187,139,3,11,C.gold);
  if(yuli.state==='counter')drawPerson(yuli.x-10,yuli.y-36,{female:true,shirt:C.lav,pants:C.black,dir:yuli.dir,frame:yuli.frame});
  if(yuli.state==='walking'||yuli.state==='exercise')drawPerson(yuli.x-10,yuli.y-36,{female:true,shirt:C.lav,pants:C.black,dir:yuli.dir,frame:yuli.frame});
  // 운동 공간: 사용자 스케치 위치, 구역명 표기 없음
  drawDumbbells(210,70);drawSmith(288,52);drawMachine(334,45,1);drawMachine(350,92,2);
  rect(212,151,112,74,'#40464a',C.ink,2);drawMachine(230,172,0);drawMachine(275,174,1);
  rect(327,145,45,61,'#72756b',C.ink,2);px(334,155,8,34,'#ad82c8');px(347,155,8,34,'#d08191');px(360,155,8,34,'#7199bd');
  drawTreadmill(212,247);drawTreadmill(244,247);drawTreadmill(276,247);drawMachine(335,232,2);
  const npcs=[{x:230,y:104,s:'#c77c5f'},{x:305,y:105,s:'#7b9d7b'},{x:227,y:273,s:'#9274a4'},{x:294,y:272,s:'#c69b58'},{x:355,y:260,s:'#6d9bc0'}];
  npcs.forEach((n,i)=>drawPerson(n.x-10,n.y-36,{shirt:n.s,pants:C.black,frame:Math.floor(elapsed/500+i)%2}));
  drawPerson(player.x-10,player.y-36,{shirt:C.black,pants:C.black,dir:player.dir,frame:player.frame});
  ctx.restore();
  text('02.16 · 헬스보이짐',9,7,7,C.cream);
}

function render(now=0){
  elapsed=now;ctx.setTransform(SCALE,0,0,SCALE,0,0);ctx.clearRect(0,0,W,H);
  if(scene==='title')drawTitle();
  if(scene==='lobby')drawLobby();
  if(scene==='gym')drawGymWorld();
  requestAnimationFrame(render);
}

function showHint(s,ms=1500){hint.textContent=s;hint.classList.remove('hidden');clearTimeout(showHint.t);showHint.t=setTimeout(()=>hint.classList.add('hidden'),ms);}
function showDialogue(lines,cb){dialogueQueue=[...lines];dialogueCallback=cb||null;joystick.classList.add('hidden');actionButton.classList.add('hidden');dialogue.classList.remove('hidden');nextDialogue();}
function nextDialogue(){if(!dialogueQueue.length){dialogue.classList.add('hidden');if(scene!=='title')joystick.classList.remove('hidden');const cb=dialogueCallback;dialogueCallback=null;cb?.();return;}dialogue.textContent=dialogueQueue.shift();}
dialogue.addEventListener('click',nextDialogue);

function enterLobby(){scene='lobby';player={x:96,y:267,dir:'up',frame:0};startButton.classList.add('hidden');joystick.classList.remove('hidden');showHint('308호 문 앞으로 이동해 보세요');}
function enterGym(){scene='gym';cameraX=0;player={x:110,y:257,dir:'up',frame:0};yuli={x:125,y:108,dir:'down',frame:0,state:'counter'};foundYuli=false;gymIntroStarted=false;actionButton.classList.add('hidden');showDialogue(['308호의 첫 기억이 열렸다.','2월 16일, 헬스보이짐.'],startGymIntro);}
function startGymIntro(){gymIntroStarted=true;showHint('카운터의 율리가 운동 공간으로 들어간다…',1800);setTimeout(()=>{yuli.state='walking';yuli.dir='right';},400);}
function tryAction(){
  if(scene==='lobby'&&Math.abs(player.x-136)<28&&Math.abs(player.y-166)<46){enterGym();return;}
  if(scene==='gym'&&foundYuli){showDialogue(['혹시 헬스장 오셨어요?','오 누구세요??','아웃백 교육 같이 받았었는데…'],()=>showHint('첫 장면 초안은 여기까지!',2200));}
}

function update(dt){
  if(scene==='gym'&&yuli.state==='walking'){
    yuli.x+=42*dt;yuli.frame++;
    if(yuli.x>315){yuli.x=342;yuli.y=174;yuli.dir='down';yuli.state='exercise';showHint('어디로 갔지? 오른쪽으로 따라가 보자!',1800);}
  }
  if(!joy.active||!dialogue.classList.contains('hidden'))return;
  const len=Math.hypot(joy.dx,joy.dy);if(len<8)return;
  const vx=joy.dx/len,vy=joy.dy/len,speed=72*dt;
  player.x+=vx*speed;player.y+=vy*speed;player.frame++;
  if(Math.abs(vx)>Math.abs(vy))player.dir=vx>0?'right':'left';else player.dir=vy>0?'down':'up';
  if(scene==='lobby'){player.x=Math.max(15,Math.min(177,player.x));player.y=Math.max(202,Math.min(305,player.y));const near=Math.abs(player.x-136)<28&&Math.abs(player.y-166)<46;actionButton.classList.toggle('hidden',!near);actionButton.textContent='♥';}
  if(scene==='gym'){
    player.x=Math.max(12,Math.min(WORLD_W-12,player.x));player.y=Math.max(102,Math.min(309,player.y));
    cameraX=Math.max(0,Math.min(WORLD_W-W,player.x-W/2));
    const nearYuli=yuli.state==='exercise'&&Math.hypot(player.x-yuli.x,player.y-yuli.y)<32;
    foundYuli=nearYuli;actionButton.classList.toggle('hidden',!nearYuli);if(nearYuli)showHint('율리를 찾았다!',700);
  }
}

let last=performance.now();function loop(now){update(Math.min(.033,(now-last)/1000));last=now;requestAnimationFrame(loop);}requestAnimationFrame(loop);

function joyMove(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const m=Math.hypot(dx,dy),max=38;if(m>max){dx=dx/m*max;dy=dy/m*max;}joy.dx=dx;joy.dy=dy;joystickKnob.style.transform=`translate(${dx}px,${dy}px)`;}
joystick.addEventListener('pointerdown',e=>{e.preventDefault();joy.active=true;joy.id=e.pointerId;joystick.setPointerCapture(e.pointerId);joyMove(e);});
joystick.addEventListener('pointermove',e=>{if(joy.active&&e.pointerId===joy.id)joyMove(e);});
function joyEnd(e){if(joy.id!==null&&e.pointerId!==joy.id)return;joy.active=false;joy.id=null;joy.dx=joy.dy=0;joystickKnob.style.transform='translate(0,0)';}
joystick.addEventListener('pointerup',joyEnd);joystick.addEventListener('pointercancel',joyEnd);
startButton.addEventListener('click',enterLobby);startButton.addEventListener('pointerup',e=>{e.preventDefault();if(scene==='title')enterLobby();});
actionButton.addEventListener('click',tryAction);
window.addEventListener('keydown',e=>{const map={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-35],ArrowDown:[0,35]};if(map[e.key]){joy.active=true;[joy.dx,joy.dy]=map[e.key];}if(e.key==='Enter'||e.key===' ')tryAction();});
window.addEventListener('keyup',()=>{joy.active=false;joy.dx=joy.dy=0;});
requestAnimationFrame(render);
