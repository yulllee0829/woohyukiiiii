// Contextual talk/hand icon and speaker-specific dialogue bubbles.
(function(){
  const action=document.querySelector('#actionButton');
  const dialogueEl=document.querySelector('#dialogue');
  if(!action||!dialogueEl)return;

  let hongDone=false;
  let changingText=false;

  const previousShowHint=showHint;
  showHint=function(text,...args){
    if(typeof text==='string'&&text.includes('오나오가 놓였다'))hongDone=true;
    if(typeof text==='string'&&text.includes('기억이 열렸다'))return;
    return previousShowHint(text,...args);
  };

  // Remove the old opening narration no matter whether it was sent as dialogue or hint text.
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
    let speaker='system';
    let clean=raw;
    const match=raw.match(/^(우혁|율리|홍다민씨)\s*[:：]\s*/);
    if(match){
      speaker=match[1]==='우혁'?'woohyuk':match[1]==='율리'?'yuli':'hong';
      clean=raw.slice(match[0].length);
    }
    const nextClass='speaker-'+speaker;
    for(const cls of ['speaker-woohyuk','speaker-yuli','speaker-hong','speaker-system']){
      dialogueEl.classList.toggle(cls,cls===nextClass);
    }
    dialogueEl.dataset.speaker=speaker==='woohyuk'?'우혁':speaker==='yuli'?'율리':speaker==='hong'?'홍다민씨':'';
    if(clean!==raw){
      changingText=true;
      dialogueEl.textContent=clean;
      changingText=false;
    }
  }

  const style=document.createElement('style');
  style.textContent=`
    #dialogue{max-width:78%;width:auto;min-width:180px;border-radius:12px;padding:21px 14px 12px;line-height:1.4;box-sizing:border-box;font-size:13px}
    #dialogue::before{content:attr(data-speaker);position:absolute;top:4px;left:12px;font-size:10px;font-weight:800;color:#6f2941}
    #dialogue.speaker-woohyuk{left:14px;right:auto;background:#fff4d8;border-color:#493744}
    #dialogue.speaker-yuli{left:auto;right:14px;background:#ffe4ef;border-color:#8d3858}
    #dialogue.speaker-hong{left:auto;right:14px;background:#e7f5ff;border-color:#355d78}
    #dialogue.speaker-system{left:16px;right:16px;max-width:none;width:auto;padding-top:12px}
    #dialogue.speaker-system::before{content:''}
  `;
  document.head.appendChild(style);
  new MutationObserver(applySpeakerBubble).observe(dialogueEl,{childList:true,characterData:true,subtree:true});
  applySpeakerBubble();
  requestAnimationFrame(syncActionIcon);
})();