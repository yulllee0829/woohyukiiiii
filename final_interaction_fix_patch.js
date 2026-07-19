// Final cleanup for pickup messages, bingsu reveal, and contextual interaction icons.
(function(){
  const action=document.querySelector('#actionButton');
  if(!action)return;

  let pickupHelpShown=false;
  let hongConversationFinished=false;

  const previousEnterGym=enterGym;
  enterGym=function(){
    pickupHelpShown=false;
    hongConversationFinished=false;
    return previousEnterGym();
  };

  // Show the bingsu discovery as a normal ivory dialogue bubble, not a top hint.
  const previousShowHint=showHint;
  showHint=function(text,...args){
    if(typeof text==='string'&&text.includes('팥빙수')&&(text.includes('나타났다')||text.includes('발견'))){
      showDialogue(['발 받침대 아래 팥빙수가 있다!']);
      return;
    }
    return previousShowHint(text,...args);
  };

  // Normalize pickup wording and show the bag guide only once: after the first collected item.
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(!Array.isArray(lines))return previousShowDialogue(lines,...args);

    if(lines.some(line=>typeof line==='string'&&line.includes('맡겨두신 오나오'))){
      hongConversationFinished=true;
    }

    let pickupItem=null;
    const cleaned=[];
    for(const original of lines){
      if(typeof original!=='string'){cleaned.push(original);continue;}
      const line=original.trim();

      // Always remove legacy bag/pocket help. It is added back only once below.
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

    if(pickupItem&&!pickupHelpShown){
      cleaned.push('가방 버튼을 눌러 확인해보자!');
      pickupHelpShown=true;
      window.gymPickupHelpShown=true;
    }

    return previousShowDialogue(cleaned,...args);
  };

  function nearGreenFoam(){
    return scene==='gymSide'&&!legExerciseActive&&!window.foamRollerCollected&&Math.hypot(player.x-181,player.y-237)<38;
  }

  function nearYuli(){
    return scene==='gymSide'&&Math.hypot(player.x-154,player.y-218)<48;
  }

  function nearHong(){
    return scene==='gym'&&!hongConversationFinished&&Math.hypot(player.x-96,player.y-124)<58;
  }

  function nearOnao(){
    return scene==='gym'&&hongConversationFinished&&!inventory.includes('우혁made오나오')&&Math.hypot(player.x-96,player.y-129)<48;
  }

  // Run last so older patches cannot overwrite the intended icon.
  function enforceInteractionIcon(){
    const onao=nearOnao();
    if(onao)action.classList.remove('hidden');

    const visible=!action.classList.contains('hidden');
    const collectible=nearGreenFoam()||onao;
    const talk=visible&&!collectible&&(nearYuli()||nearHong());

    action.classList.toggle('action-talk',visible&&talk);
    action.classList.toggle('action-hand',visible&&!talk);
    action.setAttribute('aria-label',talk?'말 걸기':'아이템 줍기');
    requestAnimationFrame(enforceInteractionIcon);
  }
  requestAnimationFrame(enforceInteractionIcon);
})();