// Replace the canvas-drawn dumbbell rack with the uploaded PNG.
const dumbbellRackImg=new Image();
dumbbellRackImg.src='dumbbell_rack.png?v=2';

const originalDrawGymSideRoomRack=drawGymSideRoom;
drawGymSideRoom=function(){
  originalDrawGymSideRoomRack();

  // Erase the old pixel rack by restoring the floor tiles behind it.
  const tile=32;
  for(let y=82;y<122;y+=tile){
    for(let x=32;x<160;x+=tile){
      const alt=((x/tile)+Math.floor((y-82)/tile))%2;
      px(x,y,tile,tile,alt?'#202020':'#191919');
      px(x,y,tile,1,'#2a2a2a');
      px(x,y,1,tile,'#101010');
    }
  }

  // Draw the uploaded rack one visual step higher while preserving proportions.
  if(dumbbellRackImg.complete&&dumbbellRackImg.naturalWidth){
    const targetW=132;
    const targetH=targetW*(dumbbellRackImg.naturalHeight/dumbbellRackImg.naturalWidth);
    const x=(W-targetW)/2;
    const y=68;
    ctx.drawImage(dumbbellRackImg,x,y,targetW,targetH);
  }

  // Keep the walking character above the rack replacement.
  if(!legExerciseActive)drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
};

// Let Woohyuk overlap the lower part of the rack, but stop him around the first shelf.
// This keeps roughly the lower 2/3 approachable without letting him walk over the top row.
const originalUpdateRack=update;
update=function(dt){
  const oldX=player.x;
  const oldY=player.y;
  originalUpdateRack(dt);
  if(scene!=='gymSide'||legExerciseActive)return;

  const overRackX=player.x>30&&player.x<162;
  const crossedRackLimit=overRackX&&player.y<112&&oldY>=112;
  if(crossedRackLimit){
    player.x=oldX;
    player.y=112;
  }
};