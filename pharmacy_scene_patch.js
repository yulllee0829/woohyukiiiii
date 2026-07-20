// Pharmacy scene: mission 3, medicine selection, matcha choco-pie reward, and fadeout.
(function(){
  const ui=document.querySelector('#ui');
  const action=document.querySelector('#actionButton');
  const joystickEl=document.querySelector('#joystick');
  const pocket=document.querySelector('#pocketButton');
  const dialogueEl=document.querySelector('#dialogue');
  const inventoryEl=document.querySelector('#inventoryItems');
  const mission=document.querySelector('#missionBanner');
  const fade=document.querySelector('#gymFadeout');
  if(!ui||!action||!joystickEl||!pocket||!dialogueEl||!inventoryEl||!mission)return;

  const bg=new Image(); bg.src='assets/phar.png?v=20260720-23';
  const woo=new Image(); woo.src='assets/woo.png?v=20260720-23';
  const med1=new Image(); med1.src='assets/m1.png?v=20260720-23';
  const med2=new Image(); med2.src='assets/m2.png?v=20260720-23';
  const choco=new Image(); choco.src='assets/choco.png?v=20260720-23';

  let active=false;
  let introDone=false;
  let talking=false;
  let popupOpen=false;
  let completed=false;
  let entering=false;
  let wooBounds=null;
  let selected=new Set();

  function alphaBounds(img){
    if(!img.complete||!img.naturalWidth)return null;
    try{
      const c=document.createElement('canvas');
      c.width=img.naturalWidth;c.height=img.naturalHeight;
      const cc=c.getContext('2d',{willReadFrequently:true});
      cc.drawImage(img,0,0);
      const d=cc.getImageData(0,0,c.width,c.height).data;
      let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
        if(d[(y*c.width+x)*4+3]>10){
          if(x<minX)minX=x;if(x>maxX)maxX=x;
          if(y<minY)minY=y;if(y>maxY)maxY=y;
        }
      }
      return maxX>=minX?{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1}:null;
    }catch(_){return null;}
  }
  woo.addEventListener('load',()=>{wooBounds=alphaBounds(woo);});

  function drawContained(img,cx,bottom,targetW,flip=false){
    if(!img.complete||!img.naturalWidth)return;
    const b=img===woo?(wooBounds||{x:0,y:0,w:img.naturalWidth,h:img.naturalHeight}):{x:0,y:0,w:img.naturalWidth,h:img.naturalHeight};
    const h=targetW*(b.h/b.w);
    ctx.save();
    if(flip){ctx.translate(Math.round(cx*2),0);ctx.scale(-1,1);}
    ctx.drawImage(img,b.x,b.y,b.w,b.h,Math.round(cx-targetW/2),Math.round(bottom-h),Math.round(targetW),Math.round(h));
    ctx.restore();
  }

  function drawPharmacy(){
    if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,W,H);
    else px(0,0,W,H,'#e8e5dc');
    // woo.png is tightly alpha-cropped at runtime, so neither hair nor shoes are cut.
    drawContained(woo,player.x,player.y,42,player.dir==='left');
  }

  const previousDrawSide=drawGymSideRoom;
  drawGymSideRoom=function(){
    if(active){drawPharmacy();return;}
    previousDrawSide();
  };

  function nearPharmacist(){
    // Pharmacist is fixed behind the counter in phar.png.
    return active&&introDone&&!popupOpen&&!completed&&Math.hypot(player.x-96,player.y-184)<58;
  }

  const previousUpdate=update;
  update=function(dt){
    if(!active){previousUpdate(dt);return;}
    if(!introDone||talking||popupOpen||completed||!dialogueEl.classList.contains('hidden')||!inventoryPanel.classList.contains('hidden')){
      player.frame=0;
      return;
    }
    const len=Math.hypot(joy.dx,joy.dy);
    if(!joy.active||len<8){player.frame=0;}
    else{
      const vx=joy.dx/len,vy=joy.dy/len;
      player.x+=vx*72*dt;player.y+=vy*72*dt;
      player.x=Math.max(14,Math.min(178,player.x));
      // Counter collision: Woohyuk's feet can never cross above its lowest edge.
      player.y=Math.max(178,Math.min(322,player.y));
      player.frame=1+Math.floor(performance.now()/150)%2;
      if(Math.abs(vx)>Math.abs(vy))player.dir=vx>0?'right':'left';else player.dir=vy>0?'down':'up';
    }
    action.classList.toggle('hidden',!nearPharmacist());
  };

  function setMission3(text,bang=true){
    mission.textContent=text;
    mission.classList.remove('hidden','mission-bang');
    if(bang){void mission.offsetWidth;mission.classList.add('mission-bang');}
  }

  function enterPharmacy(){
    if(active||entering)return;
    entering=true;
    active=true;
    completed=false;introDone=false;talking=false;popupOpen=false;selected.clear();
    scene='gymSide';
    player={x:96,y:322,dir:'up',frame:0};
    inventory=[];selectedItem=null;
    window.gymPickupHelpShown=true;
    renderInventory();
    mission.classList.add('hidden');
    inventoryPanel.classList.add('hidden');
    pocket.classList.remove('hidden');
    action.classList.add('hidden');
    joystickEl.classList.add('hidden');
    if(fade)fade.classList.remove('active');
    setTimeout(()=>{
      showDialogue(['우혁 : 머리가 좀 아프네ㅜㅜ 약을 사야겠어!'],()=>{
        introDone=true;
        joystickEl.classList.remove('hidden');
        setMission3('미션 3 : 약 구매하기',true);
      });
    },650);
  }

  // The gym ending already fades to black. Switch scenes while fully dark.
  if(fade){
    new MutationObserver(()=>{
      if(!active&&!entering&&fade.classList.contains('active'))setTimeout(enterPharmacy,2250);
    }).observe(fade,{attributes:true,attributeFilter:['class']});
  }

  // Treat pharmacist dialogue as the same yellow style/position as Damin teacher.
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(active&&Array.isArray(lines)){
      lines=lines.map(line=>typeof line==='string'&&line.startsWith('약사 :')?line.replace(/^약사\s*:/,'홍다민씨 :'):line);
    }
    return previousShowDialogue(lines,...args);
  };

  function syncPharmacistName(){
    if(active&&dialogueEl.classList.contains('speaker-hong'))dialogueEl.dataset.speaker='약사';
  }
  new MutationObserver(syncPharmacistName).observe(dialogueEl,{attributes:true,childList:true,subtree:true,attributeFilter:['class','data-speaker']});

  function medicineDescription(key){
    return key==='m1'
      ? '율리가 좋아지는 약 : 항상 율리가 생각나고, 보고 싶으며 같이 있으면 행복 max가 됨♥'
      : '율리랑 결혼하고 싶어지는 약 : 율리와 결혼 후 행복하게 사는 상상을 계속하게 되며 실제로 결혼하게 됨♥';
  }

  function openMedicinePopup(){
    popupOpen=true;selected.clear();
    joystickEl.classList.add('hidden');action.classList.add('hidden');
    document.querySelector('#medicinePopup')?.remove();
    const panel=document.createElement('section');panel.id='medicinePopup';
    panel.innerHTML=`
      <div class="medicine-title">어떤 약으로 하시겠어요?</div>
      <div class="medicine-grid">
        <button type="button" class="medicine-card" data-med="m1"><img src="assets/m1.png?v=20260720-23" alt="율리가 좋아지는 약"><span>율리가 좋아지는 약</span></button>
        <button type="button" class="medicine-card" data-med="m2"><img src="assets/m2.png?v=20260720-23" alt="율리랑 결혼하고 싶어지는 약"><span>율리랑 결혼하고 싶어지는 약</span></button>
      </div>
      <div id="medicineDescription" class="medicine-description">약을 눌러 설명을 확인해 보세요</div>
      <button type="button" id="medicineConfirm" disabled>선택</button>`;
    ui.appendChild(panel);
    const desc=panel.querySelector('#medicineDescription');
    const confirm=panel.querySelector('#medicineConfirm');
    panel.querySelectorAll('.medicine-card').forEach(card=>card.addEventListener('click',()=>{
      const key=card.dataset.med;
      if(selected.has(key))selected.delete(key);else selected.add(key);
      panel.querySelectorAll('.medicine-card').forEach(c=>c.classList.toggle('selected',selected.has(c.dataset.med)));
      confirm.disabled=selected.size===0;
      confirm.textContent=selected.size===2?'♥둘 다♥':'선택';
      if(selected.size===1)desc.textContent=medicineDescription([...selected][0]);
      else if(selected.size===2)desc.innerHTML=`${medicineDescription('m1')}<br><br>${medicineDescription('m2')}`;
      else desc.textContent='약을 눌러 설명을 확인해 보세요';
    }));
    confirm.addEventListener('click',finishMedicineChoice);
  }

  function missionClear(){
    setMission3('미션 3 CLEAR!',true);
    mission.classList.add('mission-clear');
    joystickEl.classList.add('hidden');action.classList.add('hidden');
    setTimeout(()=>{if(fade)fade.classList.add('active');},1250);
  }

  function addChocoToBag(){
    if(!inventory.includes('말차 초코파이'))inventory.push('말차 초코파이');
    renderInventory();
  }

  function finishMedicineChoice(){
    if(!selected.size)return;
    document.querySelector('#medicinePopup')?.remove();
    popupOpen=false;talking=true;
    if(selected.size===2){
      showDialogue([
        '약사 : 사랑꾼이시네요ㅎㅎ',
        '약사 : 꼭 결혼하세요~',
        '약사 : 말차 초코파이 드세요ㅎㅎ!!'
      ],()=>{
        addChocoToBag();
        showDialogue(['말차 초코파이를 받았다!'],()=>{talking=false;completed=true;missionClear();});
      });
    }else{
      showDialogue(['약사 : 안녕히 가세요~'],()=>{talking=false;completed=true;missionClear();});
    }
  }

  function talkToPharmacist(){
    if(!nearPharmacist()||talking)return;
    talking=true;joystickEl.classList.add('hidden');action.classList.add('hidden');
    showDialogue([
      '우혁 : 머리가 아파서요ㅜㅜ',
      '약사 : 이 두 가지 약이 좋으실 것 같은데, 한번 보시겠어요?'
    ],()=>{talking=false;openMedicinePopup();});
  }

  document.addEventListener('click',event=>{
    if(!active||event.target!==action)return;
    if(nearPharmacist()){
      event.preventDefault();event.stopImmediatePropagation();talkToPharmacist();
    }
  },true);

  // Keep bag and joystick in their normal fixed positions; only context button changes.
  function enforcePharmacyUi(){
    if(active){
      pocket.classList.remove('hidden');
      const talk=nearPharmacist()&&!talking&&!popupOpen&&!completed;
      if(talk)action.classList.remove('hidden');
      action.classList.toggle('action-talk',talk);
      action.classList.toggle('action-hand',false);
      action.setAttribute('aria-label','약사에게 말 걸기');
    }
    requestAnimationFrame(enforcePharmacyUi);
  }
  requestAnimationFrame(enforcePharmacyUi);

  const previousRenderInventory=renderInventory;
  renderInventory=function(){
    previousRenderInventory();
    if(inventory.includes('말차 초코파이')){
      let b=inventoryEl.querySelector('[data-item="말차 초코파이"]');
      if(!b){b=document.createElement('button');b.type='button';b.className='inventory-item';b.dataset.item='말차 초코파이';inventoryEl.appendChild(b);}
      b.innerHTML='<img src="assets/choco.png?v=20260720-23" alt="말차 초코파이"><span>말차 초코파이</span>';
    }
  };

  const style=document.createElement('style');
  style.textContent=`
    #medicinePopup{pointer-events:auto;position:absolute;z-index:82;left:18px;right:18px;top:90px;padding:14px;border:3px solid #4b7185;border-radius:14px;background:rgba(255,250,238,.98);box-shadow:0 5px 0 rgba(49,82,99,.25);color:#2b2138}
    .medicine-title{text-align:center;font-weight:800;margin-bottom:11px;font-size:14.2px}
    .medicine-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .medicine-card{appearance:none;pointer-events:auto;min-width:0;padding:8px 5px;border:2px solid #998c86;border-radius:10px;background:#fff;color:#2b2138;font-weight:700;font-size:12.5px;line-height:1.25}
    .medicine-card img{display:block;width:66px;height:62px;object-fit:contain;margin:0 auto 5px;image-rendering:pixelated}
    .medicine-card.selected{border-color:#d55883;background:#ffe7f0;box-shadow:0 0 0 2px rgba(213,88,131,.18)}
    .medicine-description{margin-top:11px;min-height:58px;padding:10px;border:2px solid #c8bbb2;border-radius:9px;background:#fffaf1;font-size:13px;line-height:1.38}
    #medicineConfirm{appearance:none;pointer-events:auto;width:100%;margin-top:10px;padding:10px;border:2px solid #5e7182;border-radius:10px;background:#dcecf5;color:#314858;font-size:14.2px;font-weight:800;box-shadow:0 3px 0 #a8c3d1}
    #medicineConfirm:disabled{background:#ececec;border-color:#b7b7b7;color:#999;box-shadow:none}
    #missionBanner.mission-clear{background:#fff4c8!important;border-color:#d69c29!important;color:#b56812!important;animation:missionClearBang 1.1s cubic-bezier(.16,.85,.22,1) both!important}
    @keyframes missionClearBang{0%{top:50%;opacity:0;transform:translate(-50%,-50%) scale(.25) rotate(-5deg)}22%{top:50%;opacity:1;transform:translate(-50%,-50%) scale(2.05) rotate(3deg)}48%{top:50%;transform:translate(-50%,-50%) scale(1.12) rotate(-1deg)}100%{top:50%;opacity:1;transform:translate(-50%,-50%) scale(1)}}
    #dialogue.speaker-hong-gym{left:12px!important;top:14%!important}
  `;
  document.head.appendChild(style);
})();
