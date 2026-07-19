// Final fixes: remove the gym date narration and let Woohyuk leave the green-roller corner.
(function(){
  const removedOpening='2025년 2월 16일, 헬스보이짐 잠실점.';

  // Permanently filter the location/date narration, regardless of which earlier patch emits it.
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      lines=lines.filter(line=>String(line).trim()!==removedOpening);
      if(!lines.length){
        const cb=args[0];
        if(typeof cb==='function')cb();
        return;
      }
    }
    return previousShowDialogue(lines,...args);
  };

  // The green roller sits in a narrow pocket beside Yuli. After pickup, always allow
  // leftward movement out of that pocket even if an older collision wrapper reverts it.
  const previousUpdate=update;
  update=function(dt){
    const beforeX=player.x;
    const beforeY=player.y;
    const movingLeft=joy.active&&joy.dx<-8;
    const wasInGreenPocket=scene==='gymSide'&&beforeX>158&&beforeY>210&&beforeY<276;

    previousUpdate(dt);

    if(window.foamRollerCollected&&wasInGreenPocket&&movingLeft&&scene==='gymSide'){
      const len=Math.hypot(joy.dx,joy.dy)||1;
      const step=Math.max(1.2,72*dt*Math.abs(joy.dx)/len);
      player.x=Math.max(7,beforeX-step);
      // Keep the escape lane just below Yuli's feet so the player cannot be trapped again.
      if(player.y<246)player.y=246;
    }
  };
})();