// Final UI, Outback, and pharmacy interaction refinements.
(function(){
  const app=document.querySelector('#app');
  const dialogue=document.querySelector('#dialogue');
  const action=document.querySelector('#actionButton');
  const start=document.querySelector('#startButton');
  const inventoryItems=document.querySelector('#inventoryItems');
  if(!app||!dialogue||!action||!start)return;

  const style=document.createElement('style');
  style.textContent=`
    /* Larger image start button. */
    #startButton.home-start-button{
      width:190px!important;
      height:104px!important;
      background-size:contain!important;
    }

    /* A soft left-to-right reveal for every new dialogue line. */
    #dialogue.dialogue-reveal{
      animation:dialogueReveal .48s steps(22,end) both!important;
      overflow:hidden!important;
    }
    @keyframes dialogueReveal{
      from{clip-path:inset(0 100% 0 0)}
      to{clip-path:inset(0 0 0 0)}
    }

    /* Remove the explicit Outback minigame solution hint. */
    #cutleryGame .cutlery-help{display:none!important}

    /* Wrong-answer Yuli lines must sit above the minigame. */
    #dialogue.cutlery-warning{
      z-index:130!important;
      left:50%!important;
      right:auto!important;
      top:18px!important;
      bottom:auto!important;
      width:190px!important;
      transform:translateX(-50%)!important;
    }

    /* Matcha choco-pie waiting on the pharmacy counter. */
    #pharmacyChocoPickup{
      position:absolute;
      z-index:45;
      left:50%;
      top:31.5%;
      width:46px;
      height:46px;
      object-fit:contain;
      transform:translateX(-50%);
      image-rendering:pixelated;
      pointer-events:none;
      filter:drop-shadow(0 2px 1px rgba(0,0,0,.28));
    }
  `;
  document.head.appendChild(style);

  // Restart the reveal whenever the visible line changes.
  let revealBusy=false;
  new MutationObserver(()=>{
    if(revealBusy||dialogue.classList.contains('hidden'))return;
    revealBusy=true;
    dialogue.classList.remove('dialogue-reveal');
    void dialogue.offsetWidth;
    dialogue.classList.add('dialogue-reveal');
    revealBusy=false;
  }).observe(dialogue,{childList:true,characterData:true,subtree:true});

  // Keep minigame feedback visible above the work panel.
  function syncCutleryWarning(){
    const game=document.querySelector('#cutleryGame');
    const visible=!dialogue.classList.contains('hidden');
    const text=(dialogue.textContent||'').trim();
    const warning=!!game&&visible&&(
      text.includes('너 머하냐ㅋㅋ')||
      text.includes('모해 너 진짜ㅋ')||
      text.includes('아니지롱ㅎㅎ')
    );
    dialogue.classList.toggle('cutlery-warning',warning);
    requestAnimationFrame(syncCutleryWarning);
  }
  requestAnimationFrame(syncCutleryWarning);

  // Scale/reposition Outback sprites at draw time without touching other scenes.
  if(typeof ctx!=='undefined'&&ctx&&typeof ctx.drawImage==='function'){
    const originalDraw=ctx.drawImage.bind(ctx);
    let outbackFrame=null;
    let spriteIndex=0;
    ctx.drawImage=function(...args){
      const src=args[0];
      if(src instanceof HTMLImageElement){
        const url=String(src.src||'');
        if(url.includes('/outback_b1.PNG')){outbackFrame='b1';spriteIndex=0;return originalDraw(...args);}
        if(url.includes('/outback_b2.PNG')){outbackFrame='b2';spriteIndex=0;return originalDraw(...args);}
        if(url.includes('/phar.png'))outbackFrame=null;
      }
      if(outbackFrame&&src instanceof HTMLCanvasElement&&args.length===5){
        let [,x,y,w,h]=args;
        if(outbackFrame==='b1'&&spriteIndex===0&&Math.abs(Number(w)-24)<1){
          const nw=20,nh=h*(nw/w);
          spriteIndex++;
          return originalDraw(src,x+(w-nw)/2,y+(h-nh),nw,nh);
        }
        if(outbackFrame==='b2'&&Math.abs(Number(w)-19)<1){
          const isYuli=spriteIndex===0;
          const nw=16,nh=h*(nw/w);
          spriteIndex++;
          if(isYuli){
            // Move Yuli substantially toward the upper-left corner and trim edge residue.
            const sx=src.width>4?1:0,sy=src.height>4?1:0;
            const sw=Math.max(1,src.width-sx*2),sh=Math.max(1,src.height-sy*2);
            return originalDraw(src,sx,sy,sw,sh,x+(w-nw)/2-18,y+(h-nh)-18,nw,nh);
          }
          return originalDraw(src,x+(w-nw)/2,y+(h-nh),nw,nh);
        }
      }
      return originalDraw(...args);
    };
  }

  // Replace automatic choco-pie receipt with an actual counter pickup.
  let chocoPending=false;
  let chocoCallback=null;
  let systemPickupLine=false;
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)&&lines.some(line=>typeof line==='string'&&line.includes('말차 초코파이를 받았다'))){
      const idx=typeof inventory!=='undefined'?inventory.indexOf('말차 초코파이'):-1;
      if(idx>=0){inventory.splice(idx,1);renderInventory();}
      chocoPending=true;
      chocoCallback=typeof args[0]==='function'?args[0]:null;
      if(!document.querySelector('#pharmacyChocoPickup')){
        const img=document.createElement('img');
        img.id='pharmacyChocoPickup';
        img.src='assets/choco.png?v=20260720-32';
        img.alt='말차 초코파이';
        app.appendChild(img);
      }
      dialogue.classList.add('hidden');
      return;
    }
    return previousShowDialogue(lines,...args);
  };

  function nearChoco(){
    return chocoPending&&typeof player!=='undefined'&&Math.hypot(player.x-96,player.y-188)<54;
  }

  document.addEventListener('click',event=>{
    if(!nearChoco()||event.target!==action)return;
    event.preventDefault();event.stopImmediatePropagation();
    chocoPending=false;
    document.querySelector('#pharmacyChocoPickup')?.remove();
    if(!inventory.includes('말차 초코파이'))inventory.push('말차 초코파이');
    renderInventory();
    const cb=chocoCallback;chocoCallback=null;
    systemPickupLine=true;
    previousShowDialogue(['말차 초코파이를 얻었다!'],()=>{
      systemPickupLine=false;
      if(typeof cb==='function')cb();
    });
  },true);

  function enforceChocoUi(){
    if(chocoPending){
      const hand=nearChoco();
      action.classList.toggle('hidden',!hand);
      action.classList.toggle('action-hand',hand);
      action.classList.toggle('action-talk',false);
      action.setAttribute('aria-label','말차 초코파이 줍기');
    }
    if(systemPickupLine){
      for(const cls of ['speaker-woohyuk','speaker-yuli','speaker-hong','speaker-hong-gym','speaker-system'])dialogue.classList.remove(cls);
      dialogue.classList.add('speaker-system');
      dialogue.dataset.speaker='';
    }
    requestAnimationFrame(enforceChocoUi);
  }
  requestAnimationFrame(enforceChocoUi);
})();
