// Replace the canvas-drawn dumbbell rack with the uploaded PNG.
const dumbbellRackImg=new Image();
dumbbellRackImg.src='dumbbell_rack.png?v=1';

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

  // Draw the uploaded rack while preserving its original proportions.
  if(dumbbellRackImg.complete&&dumbbellRackImg.naturalWidth){
    const targetW=132;
    const targetH=targetW*(dumbbellRackImg.naturalHeight/dumbbellRackImg.naturalWidth);
    const x=(W-targetW)/2;
    const y=84;
    ctx.drawImage(dumbbellRackImg,x,y,targetW,targetH);
  }

  // Keep the walking character above the rack replacement.
  if(!legExerciseActive)drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
};
