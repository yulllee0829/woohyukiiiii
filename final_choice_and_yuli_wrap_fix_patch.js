// Final positioning and wrapping fixes for the front choices and Yuli's last mission line.
(function(){
  const app=document.querySelector('#app');
  const dialogueEl=document.querySelector('#dialogue');
  if(!app||!dialogueEl)return;

  let lastFrontWoohyukPosition=null;

  // Keep the ending emoticon attached to "드릴게용" instead of wrapping onto its own line.
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      lines=lines.map(line=>{
        if(typeof line!=='string')return line;
        if(line.includes('제가 좋아할 만한 거 찾아와 주시면 용서해 드릴게용')){
          return line.replace(/드릴게용\s*\*\^\^\*/,'드릴게\u2060용\u2060*\u2060^\u2060^\u2060*');
        }
        return line;
      });
    }
    return previousShowDialogue(lines,...args);
  };

  const style=document.createElement('style');
  style.textContent=`
    /* Give Yuli's bubble just enough width to keep the ending together. */
    #dialogue.speaker-yuli,
    #dialogue.speaker-yuli-mat{
      width:204px!important;
      max-width:calc(100% - 24px)!important;
    }

    /* Keep Damin teacher from being pulled upward by older patches. */
    #dialogue.speaker-hong-gym{
      left:12px!important;
      top:13%!important;
    }
  `;
  document.head.appendChild(style);

  function syncFrontPositions(){
    if(scene==='gym'){
      // Remember the actual front-room Woohyuk bubble position while it is visible.
      if(!dialogueEl.classList.contains('hidden')&&dialogueEl.classList.contains('speaker-woohyuk')){
        const left=parseFloat(dialogueEl.style.left);
        const top=parseFloat(dialogueEl.style.top);
        if(Number.isFinite(left)&&Number.isFinite(top))lastFrontWoohyukPosition={left,top};
      }

      const choices=document.querySelector('#scenarioChoices');
      if(choices){
        const appRect=app.getBoundingClientRect();
        const boxRect=choices.getBoundingClientRect();
        let left,top;

        if(lastFrontWoohyukPosition){
          left=lastFrontWoohyukPosition.left;
          top=lastFrontWoohyukPosition.top;
        }else{
          const screenX=(player.x/192)*appRect.width;
          const screenY=(player.y/336)*appRect.height;
          left=Math.max(12,Math.min(appRect.width-boxRect.width-8,screenX-boxRect.width-36));
          top=Math.max(118,Math.min(appRect.height-boxRect.height-10,screenY-boxRect.height-54));
        }

        // Inline !important beats the older patches that were pulling this box to the top.
        choices.style.setProperty('left',`${left}px`,'important');
        choices.style.setProperty('top',`${top}px`,'important');
        choices.style.setProperty('right','auto','important');
        choices.style.setProperty('bottom','auto','important');
      }
    }
    requestAnimationFrame(syncFrontPositions);
  }

  requestAnimationFrame(syncFrontPositions);
})();