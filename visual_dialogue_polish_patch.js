// Final dialogue, mission, gift-button, bingsu, and ONAO-heart polish.
(function(){
  const dialogueEl=document.querySelector('#dialogue');
  const inventoryPanel=document.querySelector('#inventoryPanel');
  if(!dialogueEl||!inventoryPanel)return;

  let heartEyes=false;

  // Replace the old one-line bingsu reveal with the requested two-step ivory dialogue.
  const previousShowHint=showHint;
  showHint=function(text,...args){
    if(typeof text==='string'&&text.includes('팥빙수')&&(text.includes('나타났다')||text.includes('발견'))){
      showDialogue(['ㅜㅜ내 앞벅지…😇','??????? 발 받침대 아래 팥빙수가 왜 있지???????']);
      return;
    }
    return previousShowHint(text,...args);
  };

  // Turn Yuli's eyes into hearts as soon as Woohyuk gives her the ONAO.
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)&&lines.some(line=>typeof line==='string'&&(line.includes('넌 체고얌')||line.includes('통은 씻어서 내일 줄게')))){
      heartEyes=true;
    }
    return previousShowDialogue(lines,...args);
  };

  // Keep the displayed speaker name as 다민쌤 after the earlier speaker parser runs.
  function renameSpeaker(){
    if(dialogueEl.dataset.speaker==='홍다민씨')dialogueEl.dataset.speaker='다민쌤';
  }
  new MutationObserver(renameSpeaker).observe(dialogueEl,{attributes:true,attributeFilter:['data-speaker'],childList:true,subtree:true});
  renameSpeaker();

  // Draw tiny pixel hearts directly over Yuli's eyes while she is on the mat.
  const previousDrawGymSideRoom=drawGymSideRoom;
  drawGymSideRoom=function(){
    previousDrawGymSideRoom();
    if(!heartEyes||scene!=='gymSide'||legExerciseActive)return;
    const heart=(x,y)=>{
      px(x,y,2,1,'#ff5c91');
      px(x+3,y,2,1,'#ff5c91');
      px(x,y+1,5,2,'#ff5c91');
      px(x+1,y+3,3,1,'#d93670');
      px(x+2,y+4,1,1,'#d93670');
    };
    // Shift both hearts right so they sit exactly on the visible pupils.
    heart(147,188);
    heart(156,188);
  };

  const style=document.createElement('style');
  style.textContent=`
    #dialogue{
      min-height:0!important;
      width:auto;
      padding:25px 15px 13px!important;
      font-size:15px!important;
      line-height:1.32!important;
      border-width:3px!important;
      box-shadow:0 4px 0 rgba(30,25,42,.28)!important;
    }
    #dialogue::before{
      top:5px!important;
      left:14px!important;
      font-size:13px!important;
      line-height:1.1!important;
    }
    #dialogue.speaker-woohyuk,
    #dialogue.speaker-yuli{width:188px!important;max-width:calc(100% - 16px)!important}
    #dialogue.speaker-hong,
    #dialogue.speaker-hong-gym{width:158px!important;max-width:calc(100% - 28px)!important}
    #dialogue.speaker-system{
      left:16px!important;right:16px!important;width:auto!important;
      padding:14px 15px!important;
      text-align:left;
    }
    #missionBanner{
      padding:8px 15px 7px!important;
      border:2px solid #9b3450!important;
      border-radius:10px!important;
      background:rgba(255,249,238,.97)!important;
      color:#bb3154!important;
      text-shadow:none!important;
      box-shadow:0 3px 0 rgba(91,31,51,.22),0 8px 18px rgba(36,21,29,.12)!important;
      letter-spacing:-.2px;
    }
    #giveItemButton{
      border:2px solid #5e7182!important;
      border-radius:10px!important;
      background:#dcecf5!important;
      color:#314858!important;
      padding:11px 10px!important;
      box-shadow:0 3px 0 #a8c3d1!important;
      font-weight:700!important;
    }
    #giveItemButton:active:not(:disabled){
      transform:translateY(2px)!important;
      box-shadow:0 1px 0 #a8c3d1!important;
    }
    #giveItemButton:disabled{
      background:#ececec!important;
      border-color:#b7b7b7!important;
      color:#969696!important;
      box-shadow:none!important;
      opacity:1!important;
    }
  `;
  document.head.appendChild(style);
})();