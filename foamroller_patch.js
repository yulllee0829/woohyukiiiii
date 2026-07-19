// Collectible teal bumpy foam roller in the gym side room.
window.foamRollerCollected=false;

const originalEnterGymFoam=enterGym;
enterGym=function(){
  window.foamRollerCollected=false;
  originalEnterGymFoam();
};

const originalDrawGymSideRoomFoam=drawGymSideRoom;
drawGymSideRoom=function(){
  originalDrawGymSideRoomFoam();
  if(!window.foamRollerCollected)return;

  // Cover the original roller with the exercise-mat surface, then redraw Woohyuk
  // so the player can walk through this spot after collecting it.
  px(176,214,11,39,'#bfc3c7');
  px(176,214,11,2,'#e8eaec');
  px(176,249,11,2,'#969da3');
  drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
};

const originalRenderInventoryFoam=renderInventory;
renderInventory=function(){
  originalRenderInventoryFoam();
  if(!inventory.includes('초록 폼롤러'))return;
  if(inventoryItems.querySelector('[data-item="초록 폼롤러"]'))return;

  const b=document.createElement('button');
  b.type='button';
  b.className='inventory-item';
  b.dataset.item='초록 폼롤러';
  b.innerHTML='<span class="foamroller-icon" aria-hidden="true"></span><span>초록 폼롤러</span>';
  b.addEventListener('click',()=>selectInventoryItem('초록 폼롤러'));
  inventoryItems.appendChild(b);
};

const originalTryActionFoam=tryAction;
tryAction=function(){
  if(scene==='gymSide'&&!legExerciseActive&&!window.foamRollerCollected){
    const nearFoam=Math.hypot(player.x-181,player.y-233)<38;
    if(nearFoam){
      window.foamRollerCollected=true;
      inventory.push('초록 폼롤러');
      renderInventory();
      actionButton.classList.add('hidden');
      showDialogue(['초록 울퉁불퉁 폼롤러를 가방에 넣었다!','가방 버튼을 눌러 확인해 보자ㅎㅎ']);
      return;
    }
  }
  originalTryActionFoam();
};