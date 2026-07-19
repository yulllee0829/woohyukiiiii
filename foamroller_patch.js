// Collectible teal bumpy foam roller in the gym side room.
window.foamRollerCollected=false;

const foamRollerImg=new Image();
foamRollerImg.src='assets/item_foamroller.png?v=1';

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

  // Replace it with the new transparent PNG until it is collected.
  if(!window.foamRollerCollected&&foamRollerImg.complete&&foamRollerImg.naturalWidth){
    ctx.drawImage(foamRollerImg,176,213,11,40);
  }

  // The original room renderer already drew Woohyuk, so redraw him above the item.
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
  b.innerHTML='<img src="assets/item_foamroller.png?v=1" alt="초록 폼롤러"><span>초록 폼롤러</span>';
  b.addEventListener('click',()=>selectInventoryItem('초록 폼롤러'));
  inventoryItems.appendChild(b);
};

function collectFoamRoller(){
  if(scene!=='gymSide'||legExerciseActive||window.foamRollerCollected)return false;
  const nearFoam=Math.hypot(player.x-181,player.y-233)<38;
  if(!nearFoam)return false;

  window.foamRollerCollected=true;
  inventory.push('초록 폼롤러');
  renderInventory();
  actionButton.classList.add('hidden');
  showDialogue(['초록 울퉁불퉁 폼롤러를 가방에 넣었다!','가방 버튼을 눌러 확인해 보자ㅎㅎ']);
  return true;
}

// Keep keyboard interaction working through the patched function.
const originalTryActionFoam=tryAction;
tryAction=function(){
  if(collectFoamRoller())return;
  originalTryActionFoam();
};

// The base script registered its click handler before this patch loaded, so add a
// direct pickup handler as well. This fixes the hand button doing nothing on tap.
actionButton.addEventListener('click',()=>{
  collectFoamRoller();
});