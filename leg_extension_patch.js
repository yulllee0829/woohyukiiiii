// New transparent leg-extension artwork patch.
const legIdleNew=new Image();legIdleNew.src='assets/leg_extension_idle.png?v=1';
const legExerciseNew=new Image();legExerciseNew.src='assets/leg_extension_exercise.png?v=1';
const oldDrawLegMachine=drawLegMachine;
const trimCache=new WeakMap();

// Find one shared crop for the whole sheet. Exercise frames must never be
// trimmed separately, because that makes the machine appear to pulse in size.
function getSharedAlphaTrim(img,cols=1){
  if(!img.complete||!img.naturalWidth)return null;
  let cached=trimCache.get(img);
  if(cached?.cols===cols)return cached.bounds;

  const fw=Math.floor(img.naturalWidth/cols),fh=img.naturalHeight;
  let minX=fw,minY=fh,maxX=-1,maxY=-1;

  for(let frame=0;frame<cols;frame++){
    const c=document.createElement('canvas');c.width=fw;c.height=fh;
    const g=c.getContext('2d',{willReadFrequently:true});
    g.drawImage(img,frame*fw,0,fw,fh,0,0,fw,fh);
    const data=g.getImageData(0,0,fw,fh).data;
    for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
      if(data[(y*fw+x)*4+3]>10){
        if(x<minX)minX=x;if(x>maxX)maxX=x;
        if(y<minY)minY=y;if(y>maxY)maxY=y;
      }
    }
  }

  const bounds=maxX<0?{x:0,y:0,w:fw,h:fh}:{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};
  trimCache.set(img,{cols,bounds});
  return bounds;
}

function drawFixedLeg(img,cols,frame=0){
  const b=getSharedAlphaTrim(img,cols);if(!b)return;
  const fw=Math.floor(img.naturalWidth/cols);

  // Every state uses this exact destination rectangle.
  // No per-frame scaling, centering, or automatic resizing is allowed.
  const dx=38,dy=165,dw=60,dh=81;
  ctx.drawImage(img,frame*fw+b.x,b.y,b.w,b.h,dx,dy,dw,dh);
}

drawLegMachine=function(){
  if(bingsuCollected){oldDrawLegMachine(0);return;}
  drawFixedLeg(legIdleNew,1,0);
};

drawLegExercise=function(frame){drawFixedLeg(legExerciseNew,3,frame);};

// The new PNGs already include the patbingsu in the intended position.
drawFixedPatbingsu=function(){};