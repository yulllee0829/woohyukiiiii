// Collectible teal foam roller in the gym side room.
window.foamRollerCollected=false;

const foamRollerImg=new Image();
foamRollerImg.src='assets/item_foamroller.png?v=2';

const originalEnterGymFoam=enterGym;
enterGym=function(){
  window.foamRollerCollected=false;
  originalEnterGymFoam();
};

const originalDrawGymSideRoomFoam=drawGymSideRoom;
drawGymSideRoom=function(){
  originalDrawGymSideRoomFoam();

  // Cover the old canvas-drawn teal roller with the exercise-mat surface.
  px(176,214,11,39,'#bfc3c7');
  px(176,214,11,2,'#e8eaec');
  px(176,249,11,2,'#969da3');

  // Draw the uploaded transparent PNG until it is collected.
  if(!window.foamRollerCollected&&foamRollerImg.complete&&foamRollerImg.naturalWidth){
    ctx.drawImage(foamRollerImg,174,210,15,44);
  }

  // Keep Woohyuk above the item.
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
  b.innerHTML='<img src="assets/item_foamroller.png?v=2" alt="초록 폼롤러"><span>초록 폼롤러</span>';
  b.addEventListener('click',()=>selectInventoryItem('초록 폼롤러'));
  inventoryItems.appendChild(b);
};

function isNearFoamRoller(){
  return scene==='gymSide'&&!legExerciseActive&&!window.foamRollerCollected&&Math.hypot(player.x-181,player.y-233)<38;
}

function collectFoamRoller(){
  if(!isNearFoamRoller())return false;

  window.foamRollerCollected=true;
  if(!inventory.includes('초록 폼롤러'))inventory.push('초록 폼롤러');
  renderInventory();
  actionButton.classList.add('hidden');
  showDialogue(['초록 울퉁불퉁 폼롤러를 가방에 넣었다!','가방 버튼을 눌러 확인해 보자ㅎㅎ']);
  return true;
}

// Preserve every existing interaction while adding foam-roller pickup.
const originalTryActionFoam=tryAction;
tryAction=function(){
  if(collectFoamRoller())return;
  originalTryActionFoam();
};

// The original click listener captured the old tryAction function, so handle pickup directly too.
actionButton.addEventListener('click',event=>{
  if(collectFoamRoller()){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
},true);

// Keep the hand button synchronized even while the player is standing still.
const originalUpdateFoam=update;
update=function(dt){
  originalUpdateFoam(dt);
  if(scene!=='gymSide'||legExerciseActive)return;

  const nearMachine=!bingsuRevealed&&Math.hypot(player.x-74,player.y-228)<44;
  const nearBingsu=bingsuRevealed&&!bingsuCollected&&Math.hypot(player.x-77,player.y-241)<25;
  const nearFoam=isNearFoamRoller();
  actionButton.classList.toggle('hidden',!(nearMachine||nearBingsu||nearFoam));
};
