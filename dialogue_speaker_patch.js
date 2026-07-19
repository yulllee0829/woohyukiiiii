// Contextual talk/hand icon and speaker-specific dialogue bubbles.
(function(){
  const action=document.querySelector('#actionButton');
  const dialogueEl=document.querySelector('#dialogue');
  if(!action||!dialogueEl)return;

  let hongDone=false;
  const previousShowHint=showHint;
  showHint=function(text,...args){
    if(typeof text==='string'&&text.includes('오나오가 놓였다'))hongDone=true;
    return previousShowHint(text,...args);
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
    const raw=(dialogueEl.textContent||'').trim();
    dialogueEl.classList.remove('speaker-woohyuk','speaker-yuli','speaker-hong','speaker-system');
    let speaker='system';
    if(/^우혁\s*[:：]/.test(raw))speaker='woohyuk';
    else if(/^율리\s*[:：]/.test(raw))speaker='yuli';
    else if(/^홍다민씨\s*[:：]/.test(raw))speaker='hong';
    dialogueEl.classList.add('speaker-'+speaker);
    dialogueEl.dataset.speaker=speaker==='woohyuk'?'우혁':speaker==='yuli'?'율리':speaker==='hong'?'홍다민씨':'';
  }

  const style=document.createElement('style');
  style.textContent=`
    #dialogue{max-width:78%;width:auto;min-width:180px;border-radius:12px;padding:23px 14px 13px;line-height:1.45;box-sizing:border-box}
    #dialogue::before{content:attr(data-speaker);position:absolute;top:5px;left:12px;font-size:12px;font-weight:800;color:#6f2941}
    #dialogue.speaker-woohyuk{left:14px;right:auto;background:#fff4d8;border-color:#493744}
    #dialogue.speaker-yuli{left:auto;right:14px;background:#ffe4ef;border-color:#8d3858}
    #dialogue.speaker-hong{left:auto;right:14px;background:#e7f5ff;border-color:#355d78}
    #dialogue.speaker-system{left:16px;right:16px;max-width:none;width:auto;padding-top:13px}
    #dialogue.speaker-system::before{content:''}
  `;
  document.head.appendChild(style);
  new MutationObserver(applySpeakerBubble).observe(dialogueEl,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});
  applySpeakerBubble();
  requestAnimationFrame(syncActionIcon);
})();