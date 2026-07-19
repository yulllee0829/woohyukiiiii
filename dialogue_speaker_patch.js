// Contextual talk/hand icon and speaker-specific dialogue bubbles.
(function(){
  const action=document.querySelector('#actionButton');
  const dialogueEl=document.querySelector('#dialogue');
  const app=document.querySelector('#app');
  if(!action||!dialogueEl||!app)return;

  let hongDone=false;
  let changingText=false;
  let lastSpeaker='system';

  const previousShowHint=showHint;
  showHint=function(text,...args){
    if(typeof text==='string'&&text.includes('오나오가 놓였다'))hongDone=true;
    if(typeof text==='string'&&text.includes('기억이 열렸다'))return;
    return previousShowHint(text,...args);
  };

  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      lines=lines.filter(line=>!(typeof line==='string'&&line.includes('기억이 열렸다')));
      if(!lines.length){
        const cb=args[0];
        if(typeof cb==='function')cb();
        return;
      }
    }
    return previousShowDialogue(lines,...args);
  };

  function isNearHong(){
    return scene==='gym'&&Math.hypot(player.x-96,player.y-124)<58;
  }

  function syncActionIcon(){
    const visible=!action.classList.contains('hidden');
    const talkToYuli=visible&&!!foundYuli;
    const talkToHong=visible&&!hongDone&&isNearHong();
    const talk=talkToYuli||talkToHong;
    action.classList.toggle('action-talk',talk);
    action.classList.toggle('action-hand',visible&&!talk);
    action.setAttribute('aria-label',talk?'말 걸기':'아이템 줍기');
    requestAnimationFrame(syncActionIcon);
  }

  function applySpeakerBubble(){
    if(changingText)return;
    const raw=(dialogueEl.textContent||'').trim();
    let speaker=lastSpeaker;
    let clean=raw;
    const match=raw.match(/^(우혁|율리|홍다민씨)\s*[:：]\s*/);
    if(match){
      speaker=match[1]==='우혁'?'woohyuk':match[1]==='율리'?'yuli':'hong';
      lastSpeaker=speaker;
      clean=raw.slice(match[0].length);
    }else if(dialogueEl.classList.contains('hidden')||!raw){
      speaker='system';
      lastSpeaker='system';
    }

    const nextClass='speaker-'+speaker;
    for(const cls of ['speaker-woohyuk','speaker-yuli','speaker-hong','speaker-system']){
      dialogueEl.classList.toggle(cls,cls===nextClass);
    }

    const talkingByHong=speaker==='hong'&&scene==='gym';
    const woohyukTalkingToHong=speaker==='woohyuk'&&scene==='gym'&&isNearHong();
    const yuliOnMat=speaker==='yuli'&&scene==='gymSide';
    const woohyukTalkingToYuli=speaker==='woohyuk'&&scene==='gymSide';
    dialogueEl.classList.toggle('speaker-yuli-mat',yuliOnMat);
    dialogueEl.classList.toggle('speaker-hong-gym',talkingByHong);
    dialogueEl.classList.toggle('speaker-woohyuk-hong',woohyukTalkingToHong);
    dialogueEl.classList.toggle('speaker-woohyuk-yuli',woohyukTalkingToYuli);
    dialogueEl.dataset.speaker=speaker==='woohyuk'?'우혁':speaker==='yuli'?'율리':speaker==='hong'?'홍다민씨':'';

    if(clean!==raw){
      changingText=true;
      dialogueEl.textContent=clean;
      changingText=false;
    }
  }

  const style=document.createElement('style');
  style.textContent=`
    #dialogue{min-width:0;min-height:68px;border-radius:12px;padding:22px 13px 10px;line-height:1.35;box-sizing:border-box;font-size:14px}
    #dialogue::before{content:attr(data-speaker);position:absolute;top:4px;left:12px;font-size:11px;font-weight:800;color:#6f2941}
    #dialogue.speaker-woohyuk{right:auto;width:174px;max-width:calc(100% - 16px);background:#e8f7ff;border-color:#4b7185}
    #dialogue.speaker-yuli{left:48px;right:auto;width:174px;max-width:calc(100% - 62px);background:#ffe8f1;border-color:#98506b}
    #dialogue.speaker-hong{left:18px;right:auto;width:145px;max-width:calc(100% - 32px);background:#fff6cf;border-color:#88733d}
    #dialogue.speaker-system{left:16px;right:16px;width:auto;max-width:none;padding-top:12px;background:#fff5dd;border-color:#2b2138}
    #dialogue.speaker-system::before{content:''}

    #dialogue.speaker-yuli-mat{left:104px;right:auto;top:39%;bottom:auto;width:174px;max-width:calc(100% - 118px)}
    #dialogue.speaker-hong-gym{left:22px;right:auto;top:14%;bottom:auto;width:145px;max-width:calc(100% - 36px)}
  `;
  document.head.appendChild(style);

  function followWoohyukBubble(){
    const active=!dialogueEl.classList.contains('hidden')&&dialogueEl.classList.contains('speaker-woohyuk');
    if(active&&player){
      const appRect=app.getBoundingClientRect();
      const bubbleRect=dialogueEl.getBoundingClientRect();
      const screenX=(player.x/192)*appRect.width;
      const screenY=(player.y/336)*appRect.height;
      const left=Math.max(8,Math.min(appRect.width-bubbleRect.width-8,screenX-bubbleRect.width-28));
      const top=Math.max(62,Math.min(appRect.height-bubbleRect.height-10,screenY-bubbleRect.height-36));
      dialogueEl.style.left=`${left}px`;
      dialogueEl.style.top=`${top}px`;
      dialogueEl.style.right='auto';
      dialogueEl.style.bottom='auto';
    }else{
      dialogueEl.style.removeProperty('left');
      dialogueEl.style.removeProperty('top');
      dialogueEl.style.removeProperty('right');
      dialogueEl.style.removeProperty('bottom');
    }
    requestAnimationFrame(followWoohyukBubble);
  }

  document.addEventListener('pointerup',event=>{
    if(dialogueEl.classList.contains('hidden'))return;
    if(event.target===dialogueEl||dialogueEl.contains(event.target))return;
    if(document.querySelector('#scenarioChoices')&&!document.querySelector('#scenarioChoices').classList.contains('hidden'))return;
    event.preventDefault();
    nextDialogue();
  },false);

  new MutationObserver(applySpeakerBubble).observe(dialogueEl,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});
  applySpeakerBubble();
  requestAnimationFrame(syncActionIcon);
  requestAnimationFrame(followWoohyukBubble);
})();