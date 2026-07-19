// Final wording and movement tuning for the stretching-mat conversation.
(function(){
  const mission=document.querySelector('#missionBanner');
  const dialogueEl=document.querySelector('#dialogue');

  function fixMission(){
    if(mission&&mission.textContent.includes('미션 2')){
      mission.textContent='미션 2 : 삐진 율리 풀어주기';
    }
  }
  fixMission();
  if(mission)new MutationObserver(fixMission).observe(mission,{childList:true,characterData:true,subtree:true});

  // Let Woohyuk approach Yuli a little more closely without allowing overlap.
  const previousUpdate=update;
  update=function(dt){
    const beforeX=player.x,beforeY=player.y;
    const len=Math.hypot(joy.dx,joy.dy);
    let candidateX=beforeX,candidateY=beforeY;
    if(scene==='gymSide'&&len>=8&&dialogue.classList.contains('hidden')&&inventoryPanel.classList.contains('hidden')){
      candidateX=beforeX+(joy.dx/len)*72*dt;
      candidateY=beforeY+(joy.dy/len)*72*dt;
    }

    previousUpdate(dt);

    const wasNearYuli=scene==='gymSide'&&Math.abs(beforeX-154)<34&&Math.abs(beforeY-218)<40;
    const gotReverted=Math.abs(player.x-beforeX)<0.01&&Math.abs(player.y-beforeY)<0.01;
    const candidateStillSafe=Math.abs(candidateX-154)>=18||Math.abs(candidateY-218)>=23;
    if(wasNearYuli&&gotReverted&&candidateStillSafe){
      player.x=Math.max(7,Math.min(180,candidateX));
      player.y=Math.max(92,Math.min(330,candidateY));
    }
  };

  // Keep Yuli's mat bubble in the upper-left whenever she is speaking there.
  function syncMatBubble(){
    if(dialogueEl){
      const yuliSpeaking=dialogueEl.classList.contains('speaker-yuli');
      dialogueEl.classList.toggle('speaker-yuli-mat',yuliSpeaking&&scene==='gymSide');
    }
    requestAnimationFrame(syncMatBubble);
  }
  requestAnimationFrame(syncMatBubble);
})();