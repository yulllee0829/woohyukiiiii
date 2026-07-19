// Restore the original separate leg-extension artwork.
// The machine/exercise sprites contain no dessert; patbingsu appears only after exercise.
const originalDrawLegMachine=drawLegMachine;
const originalDrawLegExercise=drawLegExercise;

// Scale the whole machine + seated Woohyuk around the same bottom-center point.
// This keeps every exercise frame aligned while matching walking Woohyuk more closely.
const LEG_SCALE=.9;
const LEG_ANCHOR_X=68;
const LEG_ANCHOR_Y=246;
function drawScaledLeg(drawFn,frame){
  ctx.save();
  ctx.translate(LEG_ANCHOR_X,LEG_ANCHOR_Y);
  ctx.scale(LEG_SCALE,LEG_SCALE);
  ctx.translate(-LEG_ANCHOR_X,-LEG_ANCHOR_Y);
  drawFn(frame);
  ctx.restore();
}

drawLegMachine=function(frame=0){drawScaledLeg(originalDrawLegMachine,frame);};
drawLegExercise=function(frame){drawScaledLeg(originalDrawLegExercise,frame);};

// Hide the dessert before and during exercise. Once the workout finishes,
// draw the separate patbingsu image fully outside the foot pad.
drawFixedPatbingsu=function(){
  if(!bingsuRevealed||bingsuCollected||legExerciseActive)return;
  drawPatbingsu(63,227,28);
};

// Replace movement handling with a collision box that hugs the visible machine.
// The player's foot point can pass immediately beside it, but cannot enter the artwork.
update=function(dt){
  if(legExerciseActive)return;
  if(!joy.active||!dialogue.classList.contains('hidden')||!inventoryPanel.classList.contains('hidden'))return;
  const len=Math.hypot(joy.dx,joy.dy);
  if(len<8){player.frame=0;return;}
  const oldX=player.x,oldY=player.y;
  const vx=joy.dx/len,vy=joy.dy/len,speed=72*dt;
  player.x+=vx*speed;player.y+=vy*speed;
  player.frame=1+Math.floor(elapsed/150)%2;
  if(Math.abs(vx)>Math.abs(vy))player.dir=vx>0?'right':'left';else player.dir=vy>0?'down':'up';
  if(scene==='lobby'){
    player.x=Math.max(15,Math.min(177,player.x));player.y=Math.max(202,Math.min(305,player.y));
    const near=Math.abs(player.x-136)<28&&Math.abs(player.y-166)<46;
    actionButton.classList.toggle('hidden',!near);actionButton.textContent='♥';
  }
  if(scene==='gym'){
    player.y=Math.max(88,Math.min(330,player.y));cameraX=0;
    if(player.x>=186){scene='gymSide';player.x=14;actionButton.classList.add('hidden');return;}
    player.x=Math.max(12,player.x);
    const inDeskX=player.x>22&&player.x<170,inDeskY=player.y>119&&player.y<171;
    if(inDeskX&&inDeskY){const cameFromFront=oldY>=171,cameFromBack=oldY<=119;if(cameFromFront)player.y=171;else if(cameFromBack)player.y=119;else{player.x=oldX;player.y=oldY;}}
    const nearYuli=Math.hypot(player.x-yuli.x,player.y-yuli.y)<34;foundYuli=nearYuli;actionButton.classList.toggle('hidden',!nearYuli);
  }
  if(scene==='gymSide'){
    player.y=Math.max(92,Math.min(330,player.y));
    if(player.x<=6){scene='gym';player.x=178;actionButton.classList.add('hidden');return;}
    player.x=Math.min(180,player.x);
    const hitsRack=player.x>40&&player.x<151&&player.y>77&&player.y<121;
    const hitsDarkRoller=player.x>133&&player.x<179&&player.y>148&&player.y<166;
    const hitsTealRoller=player.x>172&&player.x<189&&player.y>210&&player.y<256;
    const hitsPurpleBall=Math.hypot(player.x-165.5,player.y-262.5)<8;
    const hitsYellowBall=Math.hypot(player.x-176.5,player.y-262.5)<8;
    // Tightest safe footprint for the scaled machine: only the pixels occupied by it.
    const hitsLegMachine=player.x>42&&player.x<94&&player.y>173&&player.y<244;
    if(hitsRack||hitsDarkRoller||hitsTealRoller||hitsPurpleBall||hitsYellowBall||hitsLegMachine){player.x=oldX;player.y=oldY;}
    const nearMachine=!bingsuRevealed&&Math.hypot(player.x-74,player.y-228)<44;
    const nearBingsu=bingsuRevealed&&!bingsuCollected&&Math.hypot(player.x-77,player.y-241)<28;
    actionButton.classList.toggle('hidden',!(nearMachine||nearBingsu));actionButton.textContent=nearBingsu?'획득':'운동하기';
  }
};