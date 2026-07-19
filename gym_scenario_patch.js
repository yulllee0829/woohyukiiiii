// Full 2/14 Jamsil Gymboy Gym mini-game scenario.
(function(){
  const state={
    active:false,mission:0,yuliPhase:'counter',yuliWalkStart:0,
    hongVisible:false,hongTalked:false,onaoPlaced:false,
    dumbbellCollected:false,blackRollerCollected:false,
    giftMode:false,ending:false
  };

  const asset=(src)=>{const img=new Image();img.src=src;return img;};
  const hongImg=asset('assets/hong.png?v=1');
  const dumbbellImg=asset('assets/item_dumbbell.png?v=1');
  const blackRollerImg=asset('assets/%20%20%20%20item_black_foamroller.png?v=1');
  const onaoImg=asset('assets/item_onao.png?v=1');

  const mission=document.createElement('div');mission.id='missionBanner';mission.classList.add('hidden');document.querySelector('#ui').appendChild(mission);
  const fade=document.createElement('div');fade.id='gymFadeout';document.querySelector('#ui').appendChild(fade);

  function setMission(n){
    state.mission=n;
    if(!n){mission.classList.add('hidden');return;}
    mission.textContent=n===1?'미션 1 : 율리님에게 말 걸기':'미션 2 : 율리 삐진 거 풀어쥬기';
    mission.classList.remove('hidden');
  }
  function showDate(){
    document.querySelector('#gymDateCard')?.remove();
    const el=document.createElement('div');el.id='gymDateCard';el.textContent='2/14 잠실 헬스보이짐';document.querySelector('#ui').appendChild(el);
    setTimeout(()=>el.remove(),2450);
  }
  function showChoices(){
    document.querySelector('#scenarioChoices')?.remove();
    const box=document.createElement('div');box.id='scenarioChoices';
    for(let i=0;i<2;i++){
      const b=document.createElement('button');b.textContent='네';
      b.addEventListener('click',()=>{
        box.remove();
        state.hongTalked=true;state.onaoPlaced=true;
        showDialogue(['홍다민씨 : ㅎㅎ맡겨두신 오나오 드릴게요. 예쁜 사랑 하세요~'],()=>showHint('카운터 위에 오나오가 놓였다!',1800));
      });
      box.appendChild(b);
    }
    document.querySelector('#ui').appendChild(box);
  }
  function startYuliWalk(){
    state.yuliPhase='walking';state.yuliWalkStart=performance.now();
    yuli.dir='right';state.hongVisible=true;
    setTimeout(()=>{state.yuliPhase='side';yuli.x=205;},1550);
  }

  const originalEnterGymScenario=enterGym;
  enterGym=function(){
    originalEnterGymScenario();
    Object.assign(state,{active:true,mission:1,yuliPhase:'counter',yuliWalkStart:0,hongVisible:false,hongTalked:false,onaoPlaced:false,dumbbellCollected:false,blackRollerCollected:false,giftMode:false,ending:false});
    setMission(1);fade.classList.remove('active');
    showDate();
    setTimeout(()=>showDialogue(['우혁 : 엇 혹시 아웃백 교육...???','우혁 : 말 걸어볼까...'],startYuliWalk),2050);
  };

  // Hide the original counter Yuli after she leaves; animate her walking right first.
  const originalDrawYuliScenario=drawYuli;
  drawYuli=function(x,y,dir='down',frame=0,w=34){
    if(state.active&&scene==='gym'){
      if(state.yuliPhase==='side')return;
      if(state.yuliPhase==='walking'){
        const p=Math.min(1,(performance.now()-state.yuliWalkStart)/1500);
        x=96+(112*p);dir='right';frame=1+Math.floor(performance.now()/150)%2;
      }
    }
    originalDrawYuliScenario(x,y,dir,frame,w);
  };

  function drawContained(img,cx,bottom,maxW,maxH){
    if(!img.complete||!img.naturalWidth)return;
    const ratio=img.naturalWidth/img.naturalHeight;
    let w=maxW,h=w/ratio;if(h>maxH){h=maxH;w=h*ratio;}
    ctx.drawImage(img,cx-w/2,bottom-h,w,h);
  }

  // Add Hong in the lobby gym and place ONAO on the counter after the conversation.
  const originalDrawGymWorldScenario=drawGymWorld;
  drawGymWorld=function(){
    originalDrawGymWorldScenario();
    if(!state.active)return;
    if(state.hongVisible){
      ctx.save();ctx.beginPath();ctx.rect(0,72,W,60);ctx.clip();drawContained(hongImg,96,143,34,54);ctx.restore();
    }
    if(state.onaoPlaced&&!inventory.includes('우혁made오나오'))drawContained(onaoImg,96,124,22,18);
    drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
  };

  // Add Yuli to the stretching zone and collectible dumbbell/black roller.
  const originalDrawSideScenario=drawGymSideRoom;
  drawGymSideRoom=function(){
    originalDrawSideScenario();
    if(!state.active)return;

    // Remove the old code-drawn black roller and replace it with the uploaded item PNG.
    px(134,145,47,23,'#bfc3c7');
    px(134,145,47,2,'#e8eaec');
    if(!state.blackRollerCollected)drawContained(blackRollerImg,157,166,38,19);
    if(!state.dumbbellCollected)drawContained(dumbbellImg,55,145,25,19);
    if(state.yuliPhase==='side')originalDrawYuliScenario(154,218,'down',0,45);
    if(!legExerciseActive)drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
  };

  function near(x,y,r){return Math.hypot(player.x-x,player.y-y)<r;}
  function interactionTarget(){
    if(!state.active||legExerciseActive)return null;
    if(scene==='gym'){
      if(state.hongVisible&&!state.hongTalked&&near(96,143,45))return 'hong';
      if(state.onaoPlaced&&!inventory.includes('우혁made오나오')&&near(96,129,45))return 'onao';
    }
    if(scene==='gymSide'){
      if(state.yuliPhase==='side'&&near(154,218,42))return 'yuli';
      if(!state.dumbbellCollected&&near(55,145,34))return 'dumbbell';
      if(!state.blackRollerCollected&&near(157,158,35))return 'blackRoller';
    }
    return null;
  }

  function collectItem(item,label){
    if(!inventory.includes(item))inventory.push(item);
    renderInventory();actionButton.classList.add('hidden');
    showDialogue([`${label}을(를) 가방에 넣었다!`]);
  }

  function beginGiftSelection(){
    state.giftMode=true;inventoryPanel.classList.remove('hidden');renderInventory();
  }

  function talkToYuli(){
    if(state.mission===1){
      showDialogue([
        '우혁 : 혹시 아웃백 잠실롯데점 알바하시나요??',
        '율리 : 엇 네!!!! 어떻게 아셨어요???',
        '우혁 : 메뉴교육 때 뵌 것 같아서요ㅎㅎ',
        '율리 : 아......ㅎ// 제가 얼굴을 잘 기억 못 해서요ㅠㅠ',
        '우혁 : 그러신 것 같아요ㅎㅎ!!',
        '율리 : ㅡ3ㅡ 삐졌어요 저^^',
        '우혁 : 미안해요 장난이었어요ㅜㅜ',
        '율리 : 제가 좋아할 만한 거 찾아와 주시면 용서해 드릴게용*^^*'
      ],()=>setMission(2));
      return;
    }
    showDialogue(['율리 : 머 가져오셨어용ㅎㅎ 기대 마니 된다!'],beginGiftSelection);
  }

  function handleScenarioAction(){
    const target=interactionTarget();if(!target)return false;
    if(target==='hong'){
      showDialogue(['홍다민씨 : 우혁님 안녕하세요^^','우혁 : 아 넵^^','홍다민씨 : 썸녀분이신가요^^'],showChoices);return true;
    }
    if(target==='onao'){
      state.onaoPlaced=false;collectItem('우혁made오나오','우혁made오나오');return true;
    }
    if(target==='dumbbell'){
      state.dumbbellCollected=true;collectItem('아령','아령');return true;
    }
    if(target==='blackRoller'){
      state.blackRollerCollected=true;collectItem('검정 폼롤러','검정 폼롤러');return true;
    }
    if(target==='yuli'){talkToYuli();return true;}
    return false;
  }

  // Capture clicks before older listeners so scenario interactions happen once.
  actionButton.addEventListener('click',e=>{
    if(handleScenarioAction()){e.preventDefault();e.stopImmediatePropagation();}
  },true);

  const originalTryActionScenario=tryAction;
  tryAction=function(){if(handleScenarioAction())return;originalTryActionScenario();};

  const originalUpdateScenario=update;
  update=function(dt){
    originalUpdateScenario(dt);
    if(!state.active||legExerciseActive||!dialogue.classList.contains('hidden')||!inventoryPanel.classList.contains('hidden'))return;
    const target=interactionTarget();
    if(target){actionButton.classList.remove('hidden');foundYuli=target==='yuli';}
    else if(scene==='gymSide'&&state.yuliPhase==='side')foundYuli=false;
  };

  const originalRenderInventoryScenario=renderInventory;
  renderInventory=function(){
    originalRenderInventoryScenario();
    // Replace/append scenario item artwork where older renderers do not know the item.
    const art={
      '아령':'assets/item_dumbbell.png?v=1',
      '검정 폼롤러':'assets/%20%20%20%20item_black_foamroller.png?v=1',
      '우혁made오나오':'assets/item_onao.png?v=1'
    };
    for(const [name,src] of Object.entries(art)){
      if(!inventory.includes(name))continue;
      let b=inventoryItems.querySelector(`[data-item="${name}"]`);
      if(!b){b=document.createElement('button');b.type='button';b.className='inventory-item';b.dataset.item=name;inventoryItems.appendChild(b);}
      b.innerHTML=`<img src="${src}" alt="${name}"><span>${name}</span>`;
      b.onclick=()=>{selectedItem=name;renderInventory();};
    }
    inventoryItems.querySelectorAll('.inventory-item').forEach(b=>b.classList.toggle('scenario-selected',b.dataset.item===selectedItem));
    document.querySelector('#giveItemButton')?.remove();
    if(state.giftMode){
      const give=document.createElement('button');give.id='giveItemButton';give.textContent=selectedItem?`${selectedItem} 주기`:'아이템을 선택해 주세요';give.disabled=!selectedItem;
      give.addEventListener('click',giveSelectedItem);inventoryPanel.appendChild(give);
    }
  };

  function giveSelectedItem(){
    if(!state.giftMode||!selectedItem)return;
    const reactions={
      '팥빙수':['율리 : 어멋ㅎ// 너무 마싯겟다ㅜ 그치만 건강에 안조아ㅜㅜ'],
      '아령':['율리 : 아우 무거워 이걸 왜 가져왓어요ㅡㅡ!'],
      '검정 폼롤러':['율리 : 하나도 안조아요 -3-'],
      '초록 폼롤러':['율리 : 오 시원하겠다! 갖다 놔요ㅋ']
    };
    inventoryPanel.classList.add('hidden');state.giftMode=false;document.querySelector('#giveItemButton')?.remove();
    if(selectedItem==='우혁made오나오'){
      inventory=inventory.filter(v=>v!==selectedItem);selectedItem=null;renderInventory();
      showDialogue(['율리 : 넌 체고얌>< 마싯게 먹을게 고마오ㅎㅎ','율리 : 통은 씻어서 내일 줄게! 낼 데이트하자♥♥','우혁 : 휴,, 다행이담,,♥3♥'],()=>{
        state.ending=true;setMission(0);joystick.classList.add('hidden');pocketButton.classList.add('hidden');actionButton.classList.add('hidden');fade.classList.add('active');
      });
      return;
    }
    const lines=reactions[selectedItem]||['율리 : 음... 다른 걸 찾아와주세용ㅎㅎ'];
    selectedItem=null;showDialogue(lines);
  }
})();
