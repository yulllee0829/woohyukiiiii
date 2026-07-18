// Restore the original separate leg-extension artwork.
// The machine/exercise sprites contain no dessert; patbingsu appears only after exercise.
const originalDrawLegMachine=drawLegMachine;
const originalDrawLegExercise=drawLegExercise;

// Use the original standalone machine and three-frame exercise sprite exactly as before.
drawLegMachine=function(frame=0){
  originalDrawLegMachine(frame);
};

drawLegExercise=function(frame){
  originalDrawLegExercise(frame);
};

// Hide the dessert before and during exercise. Once the workout finishes,
// draw the separate patbingsu image fully outside the foot pad.
drawFixedPatbingsu=function(){
  if(!bingsuRevealed||bingsuCollected||legExerciseActive)return;
  drawPatbingsu(63,227,28);
};
