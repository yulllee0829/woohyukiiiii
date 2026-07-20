// Replace the old hotel title/lobby flow with a single illustrated home screen.
(function(){
  const canvas=document.querySelector('#game');
  const start=document.querySelector('#startButton');
  const pocket=document.querySelector('#pocketButton');
  const action=document.querySelector('#actionButton');
  const joystickEl=document.querySelector('#joystick');
  const inventoryPanelEl=document.querySelector('#inventoryPanel');
  const dialogueEl=document.querySelector('#dialogue');
  const hintEl=document.querySelector('#hint');
  const missionEl=document.querySelector('#missionBanner');
  if(!canvas||!start)return;

  const VERSION='20260720-31';
  const home=new Image();
  home.src=`assets/home.PNG?v=${VERSION}`;

  // The background already contains Yuli and Woohyuk, so draw only that image.
  drawTitle=function(){
    if(home.complete&&home.naturalWidth){
      ctx.drawImage(home,0,0,W,H);
    }else{
      px(0,0,W,H,'#f6eee6');
    }
  };

  start.textContent='';
  start.setAttribute('aria-label','게임 시작');
  start.classList.add('home-start-button');

  const style=document.createElement('style');
  style.textContent=`
    #startButton.home-start-button{
      position:absolute!important;
      left:50%!important;
      right:auto!important;
      top:auto!important;
      bottom:46px!important;
      width:168px!important;
      height:64px!important;
      transform:translateX(-50%)!important;
      padding:0!important;
      border:0!important;
      border-radius:0!important;
      background:transparent url('assets/start.png?v=${VERSION}') center/contain no-repeat!important;
      box-shadow:none!important;
      image-rendering:auto;
      z-index:120!important;
    }
    #startButton.home-start-button:active{
      transform:translateX(-50%) scale(.97)!important;
    }
  `;
  document.head.appendChild(style);

  function keepOnlyStartOnHome(){
    if(scene!=='title')return;
    start.classList.remove('hidden');
    pocket?.classList.add('hidden');
    action?.classList.add('hidden');
    joystickEl?.classList.add('hidden');
    inventoryPanelEl?.classList.add('hidden');
    dialogueEl?.classList.add('hidden');
    hintEl?.classList.add('hidden');
    missionEl?.classList.add('hidden');
  }
  keepOnlyStartOnHome();

  let started=false;
  function startGame(event){
    event?.preventDefault();
    event?.stopImmediatePropagation();
    if(started)return;
    started=true;

    start.classList.add('hidden');
    start.classList.remove('home-start-button');
    missionEl?.classList.add('hidden');
    dialogueEl?.classList.add('hidden');
    hintEl?.classList.add('hidden');
    inventoryPanelEl?.classList.add('hidden');

    // Skip the old hotel lobby completely and start at the first gym scene.
    enterGym();
    joystickEl?.classList.remove('hidden');
    pocket?.classList.remove('hidden');
  }

  // Capture phase blocks the old "enterLobby" handlers already attached by the base script.
  start.addEventListener('pointerup',startGame,true);
  start.addEventListener('click',startGame,true);

  const oldEnterLobby=enterLobby;
  enterLobby=function(){
    if(scene==='title'){
      startGame();
      return;
    }
    return oldEnterLobby();
  };
})();
