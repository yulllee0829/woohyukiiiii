const canvas=document.querySelector('#game');
const ctx=canvas.getContext('2d');
const startButton=document.querySelector('#startButton');
const actionButton=document.querySelector('#actionButton');
const dialogue=document.querySelector('#dialogue');
const hint=document.querySelector('#hint');
const joystick=document.querySelector('#joystick');
const joystickKnob=document.querySelector('#joystickKnob');

const W=192,H=336,SCALE=2,WORLD_W=192;
ctx.imageSmoothingEnabled=false;
const C={ink:'#30243d',deep:'#17172a',night:'#24213d',cream:'#fff2d1',gold:'#f3c665',pink:'#f49ab8',rose:'#cf6489',lav:'#c7b0e8',skin:'#f4c5aa',skin2:'#df9f86',hair:'#3b3139',hair2:'#5c4850',wood:'#9b674f',wood2:'#71483c',floor:'#bd8869',gym:'#747b80',gym2:'#5f666b',white:'#fffaf0',black:'#17131d',blue:'#7db0d1'};

const boyfriendSheet=new Image();
boyfriendSheet.src='assets/boyfriend%20.png';
const yuliSheet=new Image();
yuliSheet.src='assets/yuli.png';

let scene='title',elapsed=0,cameraX=0;
let player={x:96,y:267,dir:'up',frame:0};
let yuli={x:96,y:103,dir:'down',frame:0,state:'counter'};
let foundYuli=false,dialogueQueue=[],dialogueCallback=null;
let joy={active:false,id:null,dx:0,dy:0};

function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function rect(x,y,w,h,fill,border=C.ink,t=2){px(x,y,w,h,border);px(x+t,y+t,w-t*2,h-t*2,fill);}
function text(s,x,y,size=7,color=C.cream,align='left'){ctx.save();ctx.fillStyle=color;ctx.font=`700 ${size}px monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillText(s,x,y);ctx.restore();}
function star(x,y,c=C.gold){px(x+1,y,1,3,c);px(x,y+1,3,1,c);}

const rowByDir={down:0,up:1,left:2,right:3};
function drawSprite(img,x,y,dir='down',frame=0,targetW=34){
  if(!img.complete||!img.naturalWidth)return;
  const cols=3,rows=4,fw=img.naturalWidth/cols,fh=img.naturalHeight/rows;
  const col=frame===0?0:1+((frame-1)%2),row=rowByDir[dir]??0,targetH=targetW*(fh/fw);
  ctx.drawImage(img,col*fw,row*fh,fw,fh,Math.round(x-targetW/2),Math.round(y-targetH),Math.round(targetW),Math.round(targetH));
}
function drawBoyfriend(x,y,dir='down',frame=0,w=34){drawSprite(boyfriendSheet,x,y,dir,frame,w);}
function drawYuli(x,y,dir='down',frame=0,w=34){drawSprite(yuliSheet,x,y,dir,frame,w);}
function drawNpc(x,y,shirt='#c77c5f'){px(x-7,y-25,14,10,C.hair);px(x-6,y-18,12,9,C.skin);px(x-5,y-8,10,10,shirt);px(x-5,y+2,4,8,C.black);px(x+1,y+2,4,8,C.black);px(x-5,y+10,5,2,C.white);px(x+1,y+10,5,2,C.white);}

function drawTitle(){
  px(0,0,W,H,C.deep);px(0,218,W,118,C.night);
  for(let i=0;i<30;i++){const x=(i*37+13)%W,y=(i*53+19)%185;i%4?px(x,y,1,1,C.cream):star(x,y);}
  rect(20,78,152,125,'#514466',C.ink,3);rect(26,84,140,113,'#282641',C.ink,2);
  for(let i=0;i<9;i++){const x=34+(i%3)*43,y=105+Math.floor(i/3)*25;rect(x,y,17,14,i===7?C.pink:C.gold,C.ink,2);}
  rect(72,157,48,39,C.wood2,C.ink,3);px(95,160,2,32,C.gold);rect(36,58,120,30,C.cream,C.ink,3);text('500일 꿈속 호텔',96,67,10,C.ink,'center');
  drawBoyfriend(72,270,'down',0,40);drawYuli(121,270,'down',0,40);text('기억 속 방들을 찾아가 보세요',96,294,7,C.cream,'center');
}
function drawLobby(){
  px(0,0,W,H,C.night);px(0,18,W,166,'#755f79');
  for(let x=0;x<W;x+=16)for(let y=184;y<H;y+=16){px(x,y,16,16,((x+y)/16)%2?'#9e6f70':'#b17d75');px(x,y,16,2,'#805a64');}
  rect(14,34,164,73,'#292743',C.ink,3);for(let i=0;i<22;i++)px(22+(i*19)%148,43+(i*23)%52,2,2,i%3?C.gold:C.cream);
  rect(18,130,65,40,'#c69068',C.ink,3);px(24,122,52,12,C.cream);text('FRONT',50,125,6,C.ink,'center');
  rect(112,116,48,68,C.wood2,C.ink,3);px(118,123,36,51,'#513848');text('308',136,135,12,C.gold,'center');
  rect(37,197,38,54,'#44384f',C.ink,3);text('???',56,214,7,'#82758e','center');rect(120,203,48,34,'#3a354d',C.ink,3);text('ROOF',144,214,6,'#786f87','center');
  drawBoyfriend(player.x,player.y,player.dir,player.frame,34);text('호텔 로비',9,7,7,C.cream);
}
function drawVending(x,y){rect(x,y,30,47,'#706f86',C.ink,2);rect(x+5,y+5,20,23,'#313447',C.ink,1);for(let r=0;r<3;r++)for(let c=0;c<3;c++)px(x+7+c*6,y+7+r*7,4,5,['#d67d77','#72a6c6','#d6b66b'][(r+c)%3]);px(x+8,y+33,14,5,C.cream);}
function drawWater(x,y){rect(x,y+9,22,34,'#d7d9df',C.ink,2);rect(x+4,y,14,13,'#8eb8d5',C.ink,2);px(x+8,y+25,6,5,'#6f8295');}
function drawSofa(x,y){rect(x,y,52,24,'#403942',C.ink,2);px(x+5,y+4,19,12,'#58505a');px(x+28,y+4,19,12,'#58505a');}
function drawCounter(x,y){rect(x,y,91,34,C.wood,C.ink,2);px(x+4,y+5,83,5,C.wood2);px(x+8,y+14,30,15,'#68483d');px(x+44,y+14,39,15,'#68483d');}
function drawLargeCounter(x,y){
  rect(x,y,128,43,C.wood,C.ink,3);
  px(x+5,y+5,118,7,C.wood2);
  px(x+10,y+17,50,18,'#68483d');
  px(x+68,y+17,50,18,'#68483d');
  px(x+62,y+15,4,23,C.gold);
  px(x+5,y+38,118,2,'#5f3d35');
}
function drawDumbbells(x,y){rect(x,y,63,11,'#34383b',C.ink,1);for(let i=0;i<7;i++){px(x+4+i*8,y-7,5,7,'#25282b');px(x+5+i*8,y-9,3,2,'#555b60');}}
function drawSmith(x,y){px(x,y,3,53,C.ink);px(x+37,y,3,53,C.ink);px(x+2,y+4,36,3,'#8b9196');px(x+5,y+27,30,3,'#babec1');px(x+10,y+39,20,5,'#383b3f');}
function drawTreadmill(x,y){rect(x,y,28,40,'#35393c',C.ink,2);px(x+5,y+7,18,11,'#18202a');px(x+7,y+28,16,5,'#666d71');px(x+22,y+18,3,13,'#858b8f');}
function drawMachine(x,y,type=0){rect(x,y,28,36,['#53595d','#60686d','#474e52'][type%3],C.ink,2);px(x+6,y+5,16,5,'#9aa0a4');px(x+12,y+10,3,18,C.ink);px(x+5,y+27,18,3,C.deep);}

function drawGymWorld(){
  ctx.save();ctx.translate(-cameraX,0);
  px(0,0,WORLD_W,H,'#d8c1aa');
  px(0,0,WORLD_W,58,'#8c6d62');
  px(0,58,WORLD_W,5,'#5f4a48');
  for(let x=0;x<WORLD_W;x+=16)for(let y=63;y<H;y+=16){px(x,y,16,16,((x+y)/16)%2?'#ba8568':'#c48d6d');px(x,y,16,1,'#9f705c');px(x,y,1,16,'#9f705c');}

  rect(26,26,140,23,'#5c4037',C.ink,2);
  px(33,32,126,4,'#c99b71');
  px(42,39,108,3,'#8c6657');

  drawYuli(yuli.x,yuli.y,yuli.dir,yuli.frame,38);
  drawLargeCounter(32,101);

  rect(68,307,56,29,'#4e3944',C.ink,3);
  px(74,312,44,24,'#2d2938');
  px(87,300,18,9,'#6e4e4b');
  rect(73,278,46,18,'#7c5b59',C.ink,2);

  drawBoyfriend(player.x,player.y,player.dir,player.frame,36);
  ctx.restore();
  text('02.16 · 헬스보이짐',9,7,7,C.cream);
}

function render(now=0){elapsed=now;ctx.setTransform(SCALE,0,0,SCALE,0,0);ctx.clearRect(0,0,W,H);if(scene==='title')drawTitle();if(scene==='lobby')drawLobby();if(scene==='gym')drawGymWorld();requestAnimationFrame(render);}
function showHint(s,ms=1500){hint.textContent=s;hint.classList.remove('hidden');clearTimeout(showHint.t);showHint.t=setTimeout(()=>hint.classList.add('hidden'),ms);}
function showDialogue(lines,cb){dialogueQueue=[...lines];dialogueCallback=cb||null;joystick.classList.add('hidden');actionButton.classList.add('hidden');dialogue.classList.remove('hidden');nextDialogue();}
function nextDialogue(){if(!dialogueQueue.length){dialogue.classList.add('hidden');if(scene!=='title')joystick.classList.remove('hidden');const cb=dialogueCallback;dialogueCallback=null;cb?.();return;}dialogue.textContent=dialogueQueue.shift();}
dialogue.addEventListener('click',nextDialogue);
function enterLobby(){scene='lobby';player={x:96,y:267,dir:'up',frame:0};startButton.classList.add('hidden');joystick.classList.remove('hidden');showHint('308호 문 앞으로 이동해 보세요');}
function enterGym(){scene='gym';cameraX=0;player={x:96,y:300,dir:'up',frame:0};yuli={x:96,y:103,dir:'down',frame:0,state:'counter'};foundYuli=false;actionButton.classList.add('hidden');showDialogue(['308호의 첫 기억이 열렸다.','2월 16일, 헬스보이짐.']);}
function tryAction(){if(scene==='lobby'&&Math.abs(player.x-136)<28&&Math.abs(player.y-166)<46){enterGym();return;}if(scene==='gym'&&foundYuli)showDialogue(['혹시 헬스장 오셨어요?','오 누구세요??','아웃백 교육 같이 받았었는데…'],()=>showHint('첫 장면 초안은 여기까지!',2200));}
function update(dt){
  if(!joy.active||!dialogue.classList.contains('hidden'))return;
  const len=Math.hypot(joy.dx,joy.dy);if(len<8){player.frame=0;return;}
  const vx=joy.dx/len,vy=joy.dy/len,speed=72*dt;player.x+=vx*speed;player.y+=vy*speed;player.frame=1+Math.floor(elapsed/150)%2;
  if(Math.abs(vx)>Math.abs(vy))player.dir=vx>0?'right':'left';else player.dir=vy>0?'down':'up';
  if(scene==='lobby'){player.x=Math.max(15,Math.min(177,player.x));player.y=Math.max(202,Math.min(305,player.y));const near=Math.abs(player.x-136)<28&&Math.abs(player.y-166)<46;actionButton.classList.toggle('hidden',!near);actionButton.textContent='♥';}
  if(scene==='gym'){
    player.x=Math.max(15,Math.min(177,player.x));
    player.y=Math.max(154,Math.min(309,player.y));
    cameraX=0;
    const nearYuli=Math.hypot(player.x-yuli.x,player.y-145)<38;
    foundYuli=nearYuli;
    actionButton.classList.toggle('hidden',!nearYuli);
  }
}
let last=performance.now();function loop(now){update(Math.min(.033,(now-last)/1000));last=now;requestAnimationFrame(loop);}requestAnimationFrame(loop);
function joyMove(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const m=Math.hypot(dx,dy),max=38;if(m>max){dx=dx/m*max;dy=dy/m*max;}joy.dx=dx;joy.dy=dy;joystickKnob.style.transform=`translate(${dx}px,${dy}px)`;}
joystick.addEventListener('pointerdown',e=>{e.preventDefault();joy.active=true;joy.id=e.pointerId;joystick.setPointerCapture(e.pointerId);joyMove(e);});
joystick.addEventListener('pointermove',e=>{if(joy.active&&e.pointerId===joy.id)joyMove(e);});
function joyEnd(e){if(joy.id!==null&&e.pointerId!==joy.id)return;joy.active=false;joy.id=null;joy.dx=joy.dy=0;player.frame=0;joystickKnob.style.transform='translate(0,0)';}
joystick.addEventListener('pointerup',joyEnd);joystick.addEventListener('pointercancel',joyEnd);
startButton.addEventListener('click',enterLobby);startButton.addEventListener('pointerup',e=>{e.preventDefault();if(scene==='title')enterLobby();});actionButton.addEventListener('click',tryAction);
window.addEventListener('keydown',e=>{const map={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-35],ArrowDown:[0,35]};if(map[e.key]){joy.active=true;[joy.dx,joy.dy]=map[e.key];}if(e.key==='Enter'||e.key===' ')tryAction();});
window.addEventListener('keyup',()=>{joy.active=false;joy.dx=joy.dy=0;player.frame=0;});
requestAnimationFrame(render);