const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const startButton = document.querySelector('#startButton');
const actionButton = document.querySelector('#actionButton');
const dialogue = document.querySelector('#dialogue');
const hint = document.querySelector('#hint');
const controls = document.querySelector('#controls');

const W = 192;
const H = 336;
const SCALE = 2;
ctx.imageSmoothingEnabled = false;

const C = {
  ink: '#30243d', deep: '#17172a', night: '#24213d', purple: '#514466',
  cream: '#fff2d1', paper: '#f6dfb7', gold: '#f3c665', pink: '#f49ab8',
  rose: '#cf6489', mint: '#9fd0a5', green: '#66a678', blue: '#79afd1',
  blue2: '#4f7fa7', skin: '#f1bea0', skinShade: '#d9957c', brown: '#6f4550',
  brown2: '#452f3c', floor: '#ba8e78', wall: '#e7c5ad', gym: '#9eafb5',
  white: '#fffaf0', black: '#17131d'
};

let scene = 'title';
let player = { x: 96, y: 266, dir: 'down', frame: 0 };
let elapsed = 0;
let foundYuli = false;
let dialogueQueue = [];
let dialogueCallback = null;
let moveTimer = null;

function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function outlineRect(x, y, w, h, fill, outline = C.ink, t = 2) {
  px(x, y, w, h, outline);
  px(x + t, y + t, w - t * 2, h - t * 2, fill);
}
function text(str, x, y, size = 8, color = C.cream, align = 'left') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(str, x, y);
  ctx.restore();
}
function star(x, y, color = C.gold) {
  px(x + 1, y, 1, 3, color); px(x, y + 1, 3, 1, color);
}

function drawPerson(x, y, opts = {}) {
  const { hair = C.brown2, shirt = C.blue, pants = C.deep, female = false, dir = 'down', frame = 0, scale = 1 } = opts;
  const s = scale;
  const q = (a, b, c, d, col) => px(x + a*s, y + b*s, c*s, d*s, col);
  const step = frame % 2;
  q(4, 0, 8, 2, hair); q(2, 2, 12, 6, hair);
  if (female) { q(1, 5, 2, 7, hair); q(13, 5, 2, 7, hair); }
  q(3, 5, 10, 8, C.skin);
  if (dir === 'down') { q(5, 8, 2, 2, C.ink); q(9, 8, 2, 2, C.ink); q(7, 11, 2, 1, C.skinShade); }
  if (dir === 'left') q(4, 8, 2, 2, C.ink);
  if (dir === 'right') q(10, 8, 2, 2, C.ink);
  q(3, 13, 10, 8, shirt); q(1, 14, 2, 6, shirt); q(13, 14, 2, 6, shirt);
  q(4, 21, 4, 7, pants); q(8, 21, 4, 7, pants);
  if (step) { q(3, 27, 5, 2, C.brown2); q(9, 27, 4, 2, C.brown2); }
  else { q(4, 27, 4, 2, C.brown2); q(8, 27, 5, 2, C.brown2); }
}

function drawTitle() {
  px(0, 0, W, H, C.deep);
  px(0, 218, W, 118, C.night);
  for (let i = 0; i < 28; i++) {
    const x = (i * 37 + 13) % W;
    const y = (i * 53 + 19) % 180;
    if (i % 4 === 0) star(x, y); else px(x, y, 1, 1, C.cream);
  }
  px(21, 86, 150, 116, C.ink);
  px(24, 89, 144, 110, '#564461');
  px(28, 93, 136, 102, '#2c2946');
  for (let i = 0; i < 9; i++) {
    const wx = 34 + (i % 3) * 43;
    const wy = 111 + Math.floor(i / 3) * 25;
    outlineRect(wx, wy, 17, 14, i === 7 ? C.pink : C.gold, C.ink, 2);
  }
  outlineRect(72, 158, 48, 37, C.brown, C.ink, 3);
  px(95, 159, 2, 34, C.gold);
  px(35, 65, 122, 30, C.ink);
  px(38, 68, 116, 24, C.cream);
  text('500일', 96, 71, 7, C.rose, 'center');
  text('꿈속 호텔', 96, 80, 11, C.ink, 'center');
  drawPerson(66, 228, { hair: C.brown2, shirt: C.blue, pants: C.deep, scale: 1.2 });
  drawPerson(105, 228, { hair: C.brown, shirt: C.pink, pants: C.brown2, female: true, scale: 1.2 });
  px(89, 241, 3, 3, C.pink); px(94, 238, 4, 4, C.pink); px(99, 241, 3, 3, C.pink);
  text('기억 속 방들을 찾아가 보세요', 96, 286, 7, C.cream, 'center');
}

function drawLobby() {
  px(0, 0, W, H, C.night);
  px(0, 18, W, 166, '#755f79');
  for (let x = 0; x < W; x += 16) for (let y = 184; y < H; y += 16) {
    px(x, y, 16, 16, ((x + y) / 16) % 2 ? '#9e6f70' : '#b17d75');
    px(x, y, 16, 2, '#805a64');
  }
  outlineRect(14, 34, 164, 73, '#292743', C.ink, 3);
  for (let i = 0; i < 22; i++) px(22 + (i*19)%148, 43 + (i*23)%52, 2, 2, i%3 ? C.gold : C.cream);
  px(89, 54, 14, 24, '#161526'); px(77, 67, 38, 14, '#1f1c31');
  for (let i=0;i<6;i++) px(79+i*6, 69+(i%2)*3, 3, 3, C.gold);
  outlineRect(18, 130, 65, 40, '#c69068', C.ink, 3);
  px(24, 122, 52, 12, C.paper); text('FRONT', 50, 125, 6, C.ink, 'center');
  outlineRect(112, 116, 48, 68, C.brown, C.ink, 3);
  px(118, 123, 36, 51, '#513848');
  text('308', 136, 135, 12, C.gold, 'center');
  px(147, 151, 3, 3, C.gold);
  outlineRect(37, 197, 38, 54, '#44384f', C.ink, 3);
  text('???', 56, 214, 7, '#82758e', 'center');
  outlineRect(120, 203, 48, 34, '#3a354d', C.ink, 3);
  text('ROOF', 144, 214, 6, '#786f87', 'center');
  drawPerson(player.x - 8, player.y - 28, { hair: C.brown2, shirt: C.blue, pants: C.deep, dir: player.dir, frame: player.frame });
  text('호텔 로비', 9, 7, 7, C.cream);
  if (Math.abs(player.x - 136) < 28 && Math.abs(player.y - 166) < 40) {
    outlineRect(107, 92, 58, 18, C.cream, C.ink, 2); text('308호 들어가기', 136, 98, 6, C.ink, 'center');
  }
}

function drawMachine(x, y, type = 0) {
  const colors = ['#637783', '#758994', '#566b78'];
  outlineRect(x, y, 25, 30, colors[type % colors.length], C.ink, 2);
  px(x + 5, y + 4, 15, 5, C.gym); px(x + 11, y + 9, 3, 15, C.ink);
  px(x + 5, y + 22, 15, 3, C.deep);
}
function drawGym() {
  px(0, 0, W, H, '#c6d0d0');
  px(0, 0, W, 79, '#8497a0');
  px(0, 79, W, 5, C.ink);
  for (let x=0;x<W;x+=16) for(let y=84;y<H;y+=16) {
    px(x,y,16,16,((x+y)/16)%2?'#697980':'#75858c');
    px(x,y,16,1,'#5c6a72'); px(x,y,1,16,'#5c6a72');
  }
  outlineRect(10, 17, 72, 39, '#b9c8ca', C.ink, 3);
  px(18, 25, 56, 22, '#8fa1a8');
  text('JAMSIL GYM', 46, 31, 6, C.cream, 'center');
  drawMachine(13, 102, 0); drawMachine(52, 95, 1); drawMachine(151, 102, 2);
  drawMachine(21, 201, 2); drawMachine(145, 208, 0);
  const npcs = [
    {x:33,y:150,h:C.black,s:'#d78968'}, {x:75,y:135,h:'#76504b',s:'#7fa477'},
    {x:132,y:151,h:'#3d343c',s:'#b984bd'}, {x:47,y:238,h:'#6b4c45',s:'#d6a35c'},
    {x:112,y:226,h:C.brown,s:C.pink,f:true,target:true}, {x:157,y:257,h:'#403944',s:'#6f9dc3'}
  ];
  npcs.forEach((n,i)=>{
    drawPerson(n.x-8,n.y-28,{hair:n.h,shirt:n.s,pants:C.deep,female:n.f,frame:Math.floor(elapsed/500+i)%2});
    if(n.target && Math.floor(elapsed/450)%2===0) { px(n.x-1,n.y-40,3,3,C.pink); px(n.x+3,n.y-43,4,4,C.pink); }
  });
  text('02.16 · 잠실', 9, 7, 7, C.cream);
  outlineRect(12, 289, 168, 28, C.cream, C.ink, 3);
  text(foundYuli ? '메시지를 보내볼까?' : '운동 중인 사람들 사이에서 율리를 찾아보자', 96, 299, 6, C.ink, 'center');
}

function render(now = 0) {
  elapsed = now;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (scene === 'title') drawTitle();
  if (scene === 'lobby') drawLobby();
  if (scene === 'gym') drawGym();
  requestAnimationFrame(render);
}

function showDialogue(lines, callback) {
  dialogueQueue = [...lines];
  dialogueCallback = callback || null;
  controls.classList.add('hidden');
  actionButton.classList.add('hidden');
  dialogue.classList.remove('hidden');
  nextDialogue();
}
function nextDialogue() {
  if (!dialogueQueue.length) {
    dialogue.classList.add('hidden');
    if (scene === 'lobby' || scene === 'gym') controls.classList.remove('hidden');
    const cb = dialogueCallback; dialogueCallback = null; cb?.();
    return;
  }
  dialogue.textContent = dialogueQueue.shift();
}
dialogue.addEventListener('click', nextDialogue);

function enterLobby() {
  scene = 'lobby'; player = {x:96,y:266,dir:'up',frame:0};
  startButton.classList.add('hidden'); controls.classList.remove('hidden');
  hint.textContent = '방향키로 308호 문 앞까지 이동해 보세요'; hint.classList.remove('hidden');
  setTimeout(()=>hint.classList.add('hidden'),2200);
}

function tryAction() {
  if (scene === 'lobby' && Math.abs(player.x - 136) < 28 && Math.abs(player.y - 166) < 40) {
    scene = 'gym'; controls.classList.add('hidden');
    showDialogue(['308호의 첫 기억이 열렸다.', '2월 16일, 잠실 헬스장.'], ()=>controls.classList.remove('hidden'));
  }
  if (scene === 'gym' && foundYuli) {
    controls.classList.add('hidden'); actionButton.classList.add('hidden');
    showDialogue(['혹시 헬스장 오셨어요?', '오 누구세요??', '아웃백 교육 같이 받았었는데…'], ()=>{
      hint.textContent = '첫 장면 초안은 여기까지!'; hint.classList.remove('hidden');
      setTimeout(()=>hint.classList.add('hidden'),2500);
    });
  }
}

function move(dir) {
  if (scene !== 'lobby') return;
  const speed = 5;
  player.dir = dir; player.frame++;
  if (dir === 'left') player.x -= speed;
  if (dir === 'right') player.x += speed;
  if (dir === 'up') player.y -= speed;
  if (dir === 'down') player.y += speed;
  player.x = Math.max(15, Math.min(177, player.x));
  player.y = Math.max(202, Math.min(305, player.y));
  const nearDoor = Math.abs(player.x - 136) < 28 && Math.abs(player.y - 166) < 40;
  actionButton.classList.toggle('hidden', !nearDoor);
  if (nearDoor) actionButton.textContent = '308호 열기';
}

startButton.addEventListener('click', enterLobby);
actionButton.addEventListener('click', tryAction);

document.querySelectorAll('[data-dir]').forEach(btn => {
  const dir = btn.dataset.dir;
  const start = e => { e.preventDefault(); move(dir); clearInterval(moveTimer); moveTimer = setInterval(()=>move(dir),100); };
  const stop = () => clearInterval(moveTimer);
  btn.addEventListener('pointerdown', start); btn.addEventListener('pointerup', stop); btn.addEventListener('pointercancel', stop); btn.addEventListener('pointerleave', stop);
});

canvas.addEventListener('pointerdown', e => {
  if (scene !== 'gym' || !dialogue.classList.contains('hidden')) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * W / rect.width;
  const y = (e.clientY - rect.top) * H / rect.height;
  const hitYuli = x > 93 && x < 131 && y > 188 && y < 247;
  if (hitYuli) {
    foundYuli = true;
    actionButton.textContent = '메시지 보내기'; actionButton.classList.remove('hidden');
    controls.classList.add('hidden');
    hint.textContent = '찾았다!'; hint.classList.remove('hidden');
    setTimeout(()=>hint.classList.add('hidden'),900);
  } else {
    hint.textContent = '이 사람은 아닌 것 같다'; hint.classList.remove('hidden');
    setTimeout(()=>hint.classList.add('hidden'),800);
  }
});

window.addEventListener('keydown', e => {
  const map = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
  if (map[e.key]) move(map[e.key]);
  if (e.key === 'Enter' || e.key === ' ') tryAction();
});

requestAnimationFrame(render);
