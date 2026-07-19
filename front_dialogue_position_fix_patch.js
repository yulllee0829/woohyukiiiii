// Final front-desk dialogue positioning and ONAO hint cleanup.
(function(){
  const app=document.querySelector('#app');
  const dialogueEl=document.querySelector('#dialogue');
  if(!app||!dialogueEl)return;

  // Remove the obsolete top caption when Hong places the ONAO on the counter.
  const previousShowHint=showHint;
  showHint=function(text,...args){
    if(typeof text==='string'&&text.includes('카운터 위에 오나오가 놓였다'))return;
    return previousShowHint(text,...args);
  };

  // Nudge Damin teacher's yellow bubble a little farther left/up.
  const style=document.createElement('style');
  style.textContent=`
    #dialogue.speaker-hong-gym{left:6px!important;top:9.5%!important}
  `;
  document.head.appendChild(style);

  function placeFrontUi(){
    const appRect=app.getBoundingClientRect();
    const screenX=(player.x/192)*appRect.width;
    const screenY=(player.y/336)*appRect.height;

    // In the front room, keep Woohyuk's bubble a little farther away from his head.
    if(scene==='gym'&&!dialogueEl.classList.contains('hidden')&&dialogueEl.classList.contains('speaker-woohyuk')){
      const r=dialogueEl.getBoundingClientRect();
      const left=Math.max(12,Math.min(appRect.width-r.width-8,screenX-r.width-36));
      const top=Math.max(118,Math.min(appRect.height-r.height-10,screenY-r.height-54));
      dialogueEl.style.left=`${left}px`;
      dialogueEl.style.top=`${top}px`;
      dialogueEl.style.right='auto';
      dialogueEl.style.bottom='auto';
    }

    // Put the two “네” choices at the exact same front-room Woohyuk-bubble position.
    const choices=document.querySelector('#scenarioChoices');
    if(choices&&scene==='gym'){
      const r=choices.getBoundingClientRect();
      const left=Math.max(12,Math.min(appRect.width-r.width-8,screenX-r.width-36));
      const top=Math.max(118,Math.min(appRect.height-r.height-10,screenY-r.height-54));
      choices.style.left=`${left}px`;
      choices.style.top=`${top}px`;
      choices.style.right='auto';
      choices.style.bottom='auto';
    }

    requestAnimationFrame(placeFrontUi);
  }
  requestAnimationFrame(placeFrontUi);
})();
