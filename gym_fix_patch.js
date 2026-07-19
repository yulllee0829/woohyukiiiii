// Final interaction and presentation fixes for the gym mini-game.
(function(){
  const missionBanner=document.querySelector('#missionBanner');
  const actionButtonEl=document.querySelector('#actionButton');

  function missionTwoActive(){
    return !!missionBanner && missionBanner.textContent.includes('미션 2');
  }

  // Correct the mission wording whenever the scenario updates it.
  function correctMissionText(){
    if(missionBanner&&missionBanner.textContent.includes('율리 삐진 거 풀어쥬기')){
      missionBanner.textContent='미션 2 : 율리 삐진 거 풀어주기';
    }
  }
  correctMissionText();
  if(missionBanner)new MutationObserver(correctMissionText).observe(missionBanner,{childList:true,characterData:true,subtree:true});

  // Never show the old room-transition message.
  const previousShowHint=showHint;
  showHint=function(text,...args){
    if(typeof text==='string'&&text.includes('기억이 열렸다'))return;
    return previousShowHint(text,...args);
  };

  // Every collectible now says "주웠다". Only the very first pickup explains the bag button.
  window.gymPickupHelpShown=false;
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      const filtered=lines.filter(line=>!(typeof line==='string'&&line.includes('가방 버튼을 눌러 확인해')));
      let pickup=false;
      const rewritten=filtered.map(line=>{
        if(typeof line!=='string')return line;
        if(line.includes('초록 울퉁불퉁 폼롤러를 가방에 넣었다')||line.includes('초록 폼롤러를 가방에 넣었다')){
          pickup=true;return '초록 폼롤러를 주웠다!';
        }
        if(line.includes('검정 폼롤러를 가방에 넣었다')||line.includes('검정 폼롤러을(를) 가방에 넣었다')){
          pickup=true;return '검정 폼롤러를 주웠다!';
        }
        if(line.includes('덤벨을 가방에 넣었다')||line.includes('아령을(를) 가방에 넣었다')){
          pickup=true;return '덤벨을 주웠다!';
        }
        if(line.includes('우혁made오나오를 가방에 넣었다')){
          pickup=true;return '우혁made오나오를 주웠다!';
        }
        if(line.includes('팥빙수')&&line.includes('가방에 넣었다')){
          pickup=true;return '팥빙수를 주웠다!';
        }
        return line;
      });
      if(pickup&&!window.gymPickupHelpShown){
        rewritten.push('가방 버튼을 눌러 확인해보자!');
        window.gymPickupHelpShown=true;
      }
      return previousShowDialogue(rewritten,...args);
    }
    return previousShowDialogue(lines,...args);
  };

  // Reset the first-pickup help each time the gym scenario begins.
  const previousEnterGym=enterGym;
  enterGym=function(){
    window.gymPickupHelpShown=false;
    return previousEnterGym();
  };

  function nearGreenFoam(){
    return scene==='gymSide'&&!legExerciseActive&&!window.foamRollerCollected&&Math.hypot(player.x-181,player.y-237)<36;
  }

  // Block the green foam roller before mission 2, including direct action-button clicks.
  document.addEventListener('click',event=>{
    if(event.target===actionButtonEl&&!missionTwoActive()&&nearGreenFoam()){
      event.preventDefault();
      event.stopImmediatePropagation();
      actionButtonEl.classList.add('hidden');
    }
  },true);

  const previousTryAction=tryAction;
  tryAction=function(){
    if(!missionTwoActive()&&nearGreenFoam())return;
    return previousTryAction();
  };

  const previousUpdate=update;
  update=function(dt){
    previousUpdate(dt);
    if(!missionTwoActive()&&nearGreenFoam())actionButtonEl.classList.add('hidden');
  };

  // Crop the uploaded black roller to its visible alpha bounds, then redraw it much larger.
  const blackImg=new Image();
  let blackBounds=null;
  blackImg.src='assets/%20%20%20%20item_black_foamroller.png?v=2';
  blackImg.addEventListener('load',()=>{
    try{
      const c=document.createElement('canvas');
      c.width=blackImg.naturalWidth;c.height=blackImg.naturalHeight;
      const cctx=c.getContext('2d',{willReadFrequently:true});
      cctx.drawImage(blackImg,0,0);
      const data=cctx.getImageData(0,0,c.width,c.height).data;
      let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
        if(data[(y*c.width+x)*4+3]>12){
          if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
        }
      }
      if(maxX>=minX&&maxY>=minY)blackBounds={x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};
    }catch(_){blackBounds=null;}
  });

  const previousDrawGymSideRoom=drawGymSideRoom;
  drawGymSideRoom=function(){
    previousDrawGymSideRoom();
    if(scene!=='gymSide')return;

    // Blend the old replacement block back into the mat instead of leaving a raised-looking strip.
    px(134,145,47,23,'#bfc3c7');

    const collected=typeof inventory!=='undefined'&&inventory.includes('검정 폼롤러');
    if(!collected&&blackImg.complete&&blackImg.naturalWidth){
      const b=blackBounds||{x:0,y:0,w:blackImg.naturalWidth,h:blackImg.naturalHeight};
      const targetW=78;
      const targetH=targetW*(b.h/b.w);
      const cx=157,bottom=171;
      ctx.drawImage(blackImg,b.x,b.y,b.w,b.h,cx-targetW/2,bottom-targetH,targetW,targetH);
    }
    if(!legExerciseActive)drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
  };
})();