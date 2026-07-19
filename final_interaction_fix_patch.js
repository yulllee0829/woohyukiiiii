// Final cleanup for pickup messages, old bingsu hints, and contextual interaction icons.
(function(){
  const action=document.querySelector('#actionButton');
  if(!action)return;

  // Remove the obsolete bingsu discovery hint that appears under the mission banner.
  const previousShowHint=showHint;
  showHint=function(text,...args){
    if(typeof text==='string'&&text.includes('팥빙수')&&(text.includes('나타났다')||text.includes('발견')))return;
    return previousShowHint(text,...args);
  };

  // Normalize every pickup to "주웠다!" and show the bag guide only for the actual first item.
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(!Array.isArray(lines))return previousShowDialogue(lines,...args);

    let pickupItem=null;
    const cleaned=[];
    for(const original of lines){
      if(typeof original!=='string'){cleaned.push(original);continue;}
      const line=original.trim();

      if((line.includes('가방')||line.includes('주머니'))&&line.includes('버튼')&&line.includes('확인'))continue;

      if(line.includes('팥빙수')&&(line.includes('가방에 넣었다')||line.includes('주머니에 넣었다')||line.includes('주웠다'))){
        pickupItem='팥빙수';cleaned.push('팥빙수를 주웠다!');continue;
      }
      if((line.includes('초록 폼롤러')||line.includes('초록 울퉁불퉁 폼롤러'))&&(line.includes('가방에 넣었다')||line.includes('주머니에 넣었다')||line.includes('주웠다'))){
        pickupItem='초록 폼롤러';cleaned.push('초록 폼롤러를 주웠다!');continue;
      }
      if(line.includes('검정 폼롤러')&&(line.includes('가방에 넣었다')||line.includes('주머니에 넣었다')||line.includes('주웠다'))){
        pickupItem='검정 폼롤러';cleaned.push('검정 폼롤러를 주웠다!');continue;
      }
      if((line.includes('덤벨')||line.includes('아령'))&&(line.includes('가방에 넣었다')||line.includes('주머니에 넣었다')||line.includes('주웠다'))){
        pickupItem='덤벨';cleaned.push('덤벨을 주웠다!');continue;
      }
      if(line.includes('우혁made오나오')&&(line.includes('가방에 넣었다')||line.includes('주머니에 넣었다')||line.includes('주웠다'))){
        pickupItem='우혁made오나오';cleaned.push('우혁made오나오를 주웠다!');continue;
      }
      cleaned.push(original);
    }

    if(pickupItem){
      const collectibleCount=Array.isArray(inventory)
        ? inventory.filter(item=>['팥빙수','초록 폼롤러','검정 폼롤러','아령','덤벨','우혁made오나오'].includes(item)).length
        : 0;
      if(collectibleCount===1)cleaned.push('가방 버튼을 눌러 확인해보자!');
      window.gymPickupHelpShown=true;
    }

    return previousShowDialogue(cleaned,...args);
  };

  let hongConversationFinished=false;
  const dialogueWatcher=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)&&lines.some(line=>typeof line==='string'&&line.includes('맡겨두신 오나오'))){
      hongConversationFinished=true;
    }
    return dialogueWatcher(lines,...args);
  };

  function nearGreenFoam(){
    return scene==='gymSide'&&!legExerciseActive&&!window.foamRollerCollected&&Math.hypot(player.x-181,player.y-237)<38;
  }

  // This runs last so older patches cannot overwrite the intended icon.
  function enforceInteractionIcon(){
    const visible=!action.classList.contains('hidden');
    let talk=false;

    // Collectibles always take priority over nearby people.
    if(visible&&!nearGreenFoam()){
      if(scene==='gymSide'&&Math.hypot(player.x-154,player.y-218)<48)talk=true;
      if(scene==='gym'&&!hongConversationFinished&&Math.hypot(player.x-96,player.y-124)<58)talk=true;
    }

    action.classList.toggle('action-talk',visible&&talk);
    action.classList.toggle('action-hand',visible&&!talk);
    action.setAttribute('aria-label',talk?'말 걸기':'아이템 줍기');
    requestAnimationFrame(enforceInteractionIcon);
  }
  requestAnimationFrame(enforceInteractionIcon);
})();