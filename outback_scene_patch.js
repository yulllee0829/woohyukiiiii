// Outback scenes: entrance intro, indoor mission 4, and cutlery-packing minigame.
(function(){
  const ui=document.querySelector('#ui');
  const action=document.querySelector('#actionButton');
  const joystick=document.querySelector('#joystick');
  const pocket=document.querySelector('#pocketButton');
  const dialogue=document.querySelector('#dialogue');
  const mission=document.querySelector('#missionBanner');
  const fade=document.querySelector('#gymFadeout');
  if(!ui||!action||!joystick||!pocket||!dialogue||!mission)return;

  const VERSION='20260720-28';
  const b1=new Image(); b1.src=`assets/outback_b1.PNG?v=${VERSION}`;
  const b2=new Image(); b2.src=`assets/outback_b2.PNG?v=${VERSION}`;
  const boy=new Image(); boy.src=`assets/boyfriend_ob.png?v=${VERSION}`;
  const yuliImg=new Image(); yuliImg.src=`assets/yuli_ob.png?v=${VERSION}`;
  const itemSrc={spoon:`assets/s.png?v=${VERSION}`,knife:`assets/n.png?v=${VERSION}`,fork:`assets/f.png?v=${VERSION}`,bag:`assets/b.png?v=${VERSION}`};

  let mode='off'; // off, entrance, inside, minigame, done
  let introDone=false,talking=false,yuliFacing='right';
  const boyFrames={},yuliFrames={};

  function buildFrames(img,target){
    if(!img.complete||!img.naturalWidth)return;
    const fw=Math.floor(img.naturalWidth/3),fh=Math.floor(img.naturalHeight/4);
    const temp=document.createElement('canvas');temp.width=fw;temp.height=fh;
    const tc=temp.getContext('2d',{willReadFrequently:true});
    for(let r=0;r<4;r++)for(let c=0;c<3;c++){
      tc.clearRect(0,0,fw,fh);tc.drawImage(img,c*fw,r*fh,fw,fh,0,0,fw,fh);
      const im=tc.getImageData(0,0,fw,fh),d=im.data;
      const seen=new Uint8Array(fw*fh),q=[];
      const pale=i=>d[i*4]>230&&d[i*4+1]>230&&d[i*4+2]>230;
      const push=(x,y)=>{if(x<0||y<0||x>=fw||y>=fh)return;const i=y*fw+x;if(seen[i]||!pale(i))return;seen[i]=1;q.push(i)};
      for(let x=0;x<fw;x++){push(x,0);push(x,fh-1)}for(let y=0;y<fh;y++){push(0,y);push(fw-1,y)}
      for(let i=0;i<q.length;i++){const p=q[i],x=p%fw,y=(p/fw)|0;d[p*4+3]=0;push(x-1,y);push(x+1,y);push(x,y-1);push(x,y+1)}
      tc.putImageData(im,0,0);
      let minX=fw,minY=fh,maxX=-1,maxY=-1;
      for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){if(im.data[(y*fw+x)*4+3]>10){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}}
      const out=document.createElement('canvas');
      if(maxX>=minX){out.width=maxX-minX+1;out.height=maxY-minY+1;out.getContext('2d').drawImage(temp,minX,minY,out.width,out.height,0,0,out.width,out.height)}
      target[`${r}-${c}`]=out;
    }
  }
  boy.addEventListener('load',()=>buildFrames(boy,boyFrames));
  yuliImg.addEventListener('load',()=>buildFrames(yuliImg,yuliFrames));

  function drawSprite(frames,dir,frame,x,bottom,w){
    const row={down:0,up:1,left:2,right:3}[dir]??0;
    const col=frame===0?0:1+((frame-1)%2),im=frames[`${row}-${col}`];
    if(!im||!im.width)return;
    const h=w*(im.height/im.width);ctx.drawImage(im,Math.round(x-w/2),Math.round(bottom-h),Math.round(w),Math.round(h));
  }

  function drawOutback(){
    const bg=mode==='entrance'?b1:b2;
    if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,W,H);else px(0,0,W,H,'#32261e');
    if(mode==='entrance')drawSprite(boyFrames,'up',0,96,292,34);
    if(mode==='inside'||mode==='minigame'){
      drawSprite(yuliFrames,yuliFacing,0,151,184,35);
      drawSprite(boyFrames,player.dir,player.frame,player.x,player.y,35);
    }
  }
  const oldDraw=drawGymSideRoom;
  drawGymSideRoom=function(){if(mode!=='off'){drawOutback();return}oldDraw()};

  function nearYuli(){return mode==='inside'&&introDone&&!talking&&Math.hypot(player.x-151,player.y-184)<48}
  const oldUpdate=update;
  update=function(dt){
    if(mode!=='inside'){if(mode==='off')oldUpdate(dt);return}
    if(!introDone||talking||!dialogue.classList.contains('hidden')||!document.querySelector('#inventoryPanel').classList.contains('hidden')){player.frame=0;return}
    const len=Math.hypot(joy.dx,joy.dy);
    if(joy.active&&len>=8){
      const vx=joy.dx/len,vy=joy.dy/len;
      let nx=player.x+vx*68*dt,ny=player.y+vy*68*dt;
      // Walkable dining-floor region only; keep out of tables/walls.
      nx=Math.max(18,Math.min(176,nx));ny=Math.max(154,Math.min(320,ny));
      // central table obstacle
      if(nx>64&&nx<134&&ny>190&&ny<244){ny=player.y<217?190:244}
      player.x=nx;player.y=ny;player.frame=1+Math.floor(performance.now()/150)%2;
      player.dir=Math.abs(vx)>Math.abs(vy)?(vx>0?'right':'left'):(vy>0?'down':'up');
    }else player.frame=0;
    const talk=nearYuli();action.classList.toggle('hidden',!talk);action.classList.toggle('action-talk',talk);action.classList.toggle('action-hand',false);
  };

  const oldShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(mode!=='off'&&Array.isArray(lines)) lines=lines.map(s=>typeof s==='string'?s.replace(/^카이\s*:/,'우혁 :').replace(/^주디\s*:/,'율리 :'):s);
    return oldShowDialogue(lines,...args);
  };

  function beginEntrance(){
    if(mode!=='off')return;mode='entrance';scene='gymSide';player={x:96,y:292,dir:'up',frame:0};
    joystick.classList.add('hidden');action.classList.add('hidden');pocket.classList.remove('hidden');
    if(fade)fade.classList.remove('active');
    setTimeout(()=>showDialogue(['우혁 : 율리가 일하고 있으려낭~','우혁 : 끝나고 데이트 가야지~'],()=>{
      if(fade)fade.classList.add('active');setTimeout(beginInside,1050);
    }),700);
  }
  function beginInside(){
    mode='inside';introDone=false;yuliFacing='right';player={x:28,y:292,dir:'right',frame:1};
    if(fade)fade.classList.remove('active');
    let start=performance.now();
    const walk=()=>{if(mode!=='inside'||introDone)return;const p=Math.min(1,(performance.now()-start)/1600);player.x=28+70*p;player.frame=1+Math.floor(performance.now()/160)%2;if(p<1)requestAnimationFrame(walk);else{player.frame=0;showDialogue(['우혁 : 주디님이다ㅎㅎ'],()=>{introDone=true;joystick.classList.remove('hidden');mission.textContent='미션 4 : 율리 일 도와주기!!';mission.classList.remove('hidden','mission-bang');void mission.offsetWidth;mission.classList.add('mission-bang')})}};requestAnimationFrame(walk);
  }

  function talkYuli(){
    if(!nearYuli()||talking)return;talking=true;yuliFacing='down';joystick.classList.add('hidden');action.classList.add('hidden');
    showDialogue(['카이 : 주디님 안녕하세용','주디 : 하이용','주디 : 이것 좀 도와주실래요ㅎㅎ','카이 : 제가 전문인건 어떻게 아시구ㅋㅋ','주디 : 네 믿을게요^^'],()=>{talking=false;openCutleryGame()});
  }
  document.addEventListener('click',e=>{if(mode==='inside'&&e.target===action&&nearYuli()){e.preventDefault();e.stopImmediatePropagation();talkYuli()}},true);

  function openCutleryGame(){
    mode='minigame';document.querySelector('#cutleryGame')?.remove();
    const panel=document.createElement('section');panel.id='cutleryGame';
    panel.innerHTML=`<div class="cutlery-title">수저 세트 포장하기</div><div class="cutlery-work"><div class="drag-item spoon" data-kind="spoon"><img src="${itemSrc.spoon}"></div><div class="drag-item knife" data-kind="knife"><img src="${itemSrc.knife}"></div><div class="drag-item fork" data-kind="fork"><img src="${itemSrc.fork}"></div><div class="bag-zone"><img src="${itemSrc.bag}"></div></div><div class="cutlery-help">포크를 숟가락 위에 먼저 포갠 뒤 봉투에 넣어 주세요.</div>`;
    ui.appendChild(panel);setupDrag(panel);
  }

  function setupDrag(panel){
    const work=panel.querySelector('.cutlery-work'),bag=panel.querySelector('.bag-zone');
    let stacked=false,knifeIn=false,setIn=false,drag=null,ox=0,oy=0;
    const home={};panel.querySelectorAll('.drag-item').forEach(el=>{home[el.dataset.kind]={left:el.offsetLeft,top:el.offsetTop}});
    const overlap=(a,b)=>{const r=a.getBoundingClientRect(),s=b.getBoundingClientRect();return r.left<s.right&&r.right>s.left&&r.top<s.bottom&&r.bottom>s.top};
    const reset=el=>{const h=home[el.dataset.kind];el.style.left=h.left+'px';el.style.top=h.top+'px'};
    function yuliLine(text){showDialogue([`주디 : ${text}`])}
    panel.querySelectorAll('.drag-item').forEach(el=>{
      el.addEventListener('pointerdown',e=>{drag=el;const r=el.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;el.setPointerCapture(e.pointerId);el.classList.add('dragging')});
      el.addEventListener('pointermove',e=>{if(drag!==el)return;const r=work.getBoundingClientRect();el.style.left=(e.clientX-r.left-ox)+'px';el.style.top=(e.clientY-r.top-oy)+'px'});
      el.addEventListener('pointerup',e=>{if(drag!==el)return;drag=null;el.classList.remove('dragging');const kind=el.dataset.kind;
        const spoon=panel.querySelector('.spoon'),fork=panel.querySelector('.fork');
        if(kind==='fork'&&overlap(fork,spoon)){stacked=true;fork.classList.add('stacked');fork.style.left=(spoon.offsetLeft+8)+'px';fork.style.top=(spoon.offsetTop-2)+'px';return}
        if(kind==='spoon'&&overlap(spoon,fork)&&!stacked){yuliLine('아니지롱ㅎㅎ');reset(spoon);return}
        if(overlap(el,bag)){
          if(kind==='knife'){knifeIn=true;el.classList.add('packed')}
          else if(stacked&&(kind==='spoon'||kind==='fork')){setIn=true;spoon.classList.add('packed');fork.classList.add('packed')}
          else {yuliLine(kind==='spoon'?'너 머하냐ㅋㅋ':'모해 너 진짜ㅋ');reset(el)}
          if(knifeIn&&setIn)finishCutlery();
        }
      });
    });
    // Stacked pair moves together when spoon is dragged.
    const spoon=panel.querySelector('.spoon'),fork=panel.querySelector('.fork');
    spoon.addEventListener('pointermove',()=>{if(stacked&&drag===spoon){fork.style.left=(spoon.offsetLeft+8)+'px';fork.style.top=(spoon.offsetTop-2)+'px'}});
  }

  function finishCutlery(){
    document.querySelector('#cutleryGame')?.remove();mode='inside';talking=true;
    showDialogue(['주디 : 올~ 칼각인데ㅎㅎ','카이 : 맞지 맞지','주디 : 나 대신 100개만 말아조ㅋ'],()=>{
      mode='done';mission.textContent='미션 4 CLEAR!';mission.classList.remove('hidden','mission-bang');mission.classList.add('mission-clear');void mission.offsetWidth;mission.classList.add('mission-bang');
      setTimeout(()=>{if(fade)fade.classList.add('active')},1400);
    });
  }

  // Pharmacy mission 3 ends by showing CLEAR and activating the shared fade.
  let armed=false;
  new MutationObserver(()=>{if((mission.textContent||'').includes('미션 3 CLEAR'))armed=true;if(armed&&mode==='off'&&fade&&fade.classList.contains('active'))setTimeout(beginEntrance,950)}).observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});

  const style=document.createElement('style');style.textContent=`
    #cutleryGame{position:absolute;z-index:95;left:14px;right:14px;top:78px;padding:13px;border:3px solid #78665d;border-radius:14px;background:#fffaf0;color:#2b2138;box-shadow:0 5px 0 rgba(45,31,28,.26);pointer-events:auto}
    .cutlery-title{text-align:center;font-weight:900;font-size:14.2px;margin-bottom:8px}.cutlery-work{position:relative;height:330px;border:2px solid #d5c8b9;border-radius:11px;background:#fff;overflow:hidden}
    .drag-item,.bag-zone{position:absolute;touch-action:none;user-select:none}.drag-item{width:56px;height:155px;z-index:3}.drag-item img,.bag-zone img{width:100%;height:100%;object-fit:contain;pointer-events:none}.drag-item.spoon{left:10px;top:70px}.drag-item.knife{left:77px;top:70px}.drag-item.fork{left:142px;top:70px}.bag-zone{right:7px;top:42px;width:86px;height:232px;border:2px dashed #c79a9e;border-radius:10px;background:#fff8f6}.drag-item.dragging{z-index:10}.drag-item.stacked{z-index:5}.drag-item.packed{opacity:0;pointer-events:none}.cutlery-help{padding-top:9px;text-align:center;font-size:13px;line-height:1.35}
  `;document.head.appendChild(style);
})();