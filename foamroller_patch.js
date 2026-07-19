// Collectible teal foam roller in the gym side room.
window.foamRollerCollected=false;

const foamRollerImg=new Image();
let foamRollerBounds=null;
let foamRollerCroppedSrc='assets/item_foamroller.png?v=3';
foamRollerImg.src='assets/item_foamroller.png?v=3';

foamRollerImg.addEventListener('load',()=>{
  // Detect the visible alpha bounds so the large transparent canvas does not squash the item.
  try{
    const c=document.createElement('canvas');
    c.width=foamRollerImg.naturalWidth;c.height=foamRollerImg.naturalHeight;
    const cctx=c.getContext('2d',{willReadFrequently:true});
    cctx.drawImage(foamRollerImg,0,0);
    const data=cctx.getImageData(0,0,c.width,c.height).data;
    let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
      if(data[(y*c.width+x)*4+3]>12){
        if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      }
    }
    if(maxX>=minX&&maxY>=minY){
      foamRollerBounds={x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};
      const out=document.createElement('canvas');
      out.width=foamRollerBounds.w;out.height=foamRollerBounds.h;
      out.getContext('2d').drawImage(foamRollerImg,foamRollerBounds.x,foamRollerBounds.y,foamRollerBounds.w,foamRollerBounds.h,0,0,out.width,out.height);
      foamRollerCroppedSrc=out.toDataURL('image/png');
      if(window.foamRollerCollected)renderInventory();
    }
  }catch(_){foamRollerBounds=null;}
});

const originalEnterGymFoam=enterGym;
enterGym=function(){
  window.foamRollerCollected=false;
  originalEnterGymFoam();
};

const originalDrawGymSideRoomFoam=drawGymSideRoom;
drawGymSideRoom=function(){
  originalDrawGymSideRoomFoam();

  // Restore the exact exercise-mat surface beneath the old canvas roller.
  // The former extra highlight/shadow lines caused a visible stain after pickup.
  px(176,214,10,39,'#bfc3c7');
  px(186,214,2,39,'#737a80');

  // Draw the uploaded PNG at 2/3 of its previous size while preserving its aspect ratio.
  if(!window.foamRollerCollected&&foamRollerImg.complete&&foamRollerImg.naturalWidth){
    const b=foamRollerBounds||{x:0,y:0,w:foamRollerImg.naturalWidth,h:foamRollerImg.naturalHeight};
    const targetH=28;
    const targetW=Math.max(6,targetH*(b.w/b.h));
    const centerX=181;
    const bottomY=251;
    ctx.drawImage(foamRollerImg,b.x,b.y,b.w,b.h,centerX-targetW/2,bottomY-targetH,targetW,targetH);
  }

  // Keep Woohyuk above the item.
  drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
};

// Render every inventory item explicitly. The base renderer treated every unknown item as a key.
renderInventory=function(){
  inventoryItems.innerHTML='';
  if(!inventory.length){
    inventoryItems.innerHTML='<div class="inventory-empty">아직 아무것도 없어요</div>';
    return;
  }

  for(const item of inventory){
    const b=document.createElement('button');
    b.type='button';b.className='inventory-item';b.draggable=true;b.dataset.item=item;

    if(item==='팥빙수'){
      b.innerHTML='<img src="assets/patbingsu.png?v=2" alt="팥빙수"><span>팥빙수</span>';
    }else if(item==='초록 폼롤러'){
      const img=document.createElement('img');
      img.src=foamRollerCroppedSrc;img.alt='초록 폼롤러';
      const label=document.createElement('span');label.textContent='초록 폼롤러';
      b.append(img,label);
    }else if(item==='다음 방 열쇠'){
      b.innerHTML='<span class="key-icon">🗝️</span><span>다음 방 열쇠</span>';
    }else{
      const label=document.createElement('span');label.textContent=item;
      b.appendChild(label);
    }

    b.addEventListener('dragstart',e=>{selectedItem=item;e.dataTransfer?.setData('text/plain',item);});
    b.addEventListener('click',()=>selectInventoryItem(item));
    inventoryItems.appendChild(b);
  }
};

function isNearFoamRoller(){
  return scene==='gymSide'&&!legExerciseActive&&!window.foamRollerCollected&&Math.hypot(player.x-181,player.y-237)<34;
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

const originalTryActionFoam=tryAction;
tryAction=function(){
  if(collectFoamRoller())return;
  originalTryActionFoam();
};

actionButton.addEventListener('click',event=>{
  if(collectFoamRoller()){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
},true);

const originalUpdateFoam=update;
update=function(dt){
  originalUpdateFoam(dt);
  if(scene!=='gymSide'||legExerciseActive)return;
  const nearMachine=!bingsuRevealed&&Math.hypot(player.x-74,player.y-228)<44;
  const nearBingsu=bingsuRevealed&&!bingsuCollected&&Math.hypot(player.x-77,player.y-241)<25;
  const nearFoam=isNearFoamRoller();
  actionButton.classList.toggle('hidden',!(nearMachine||nearBingsu||nearFoam));
};