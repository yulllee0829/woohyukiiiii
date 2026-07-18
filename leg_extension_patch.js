// Fixed-size transparent leg-extension artwork patch.
const legIdleNew=new Image();legIdleNew.src='assets/leg_extension_idle.png?v=1';
const legExerciseNew=new Image();legExerciseNew.src='assets/leg_extension_exercise.png?v=1';
const oldDrawLegMachine=drawLegMachine;
const sharedTrimCache=new WeakMap();
const renderedLegCache=new Map();

function getSharedAlphaTrim(img,cols=1){
  if(!img.complete||!img.naturalWidth)return null;
  const cached=sharedTrimCache.get(img);
  if(cached?.cols===cols)return cached.bounds;
  const fw=Math.floor(img.naturalWidth/cols),fh=img.naturalHeight;
  let minX=fw,minY=fh,maxX=-1,maxY=-1;
  for(let frame=0;frame<cols;frame++){
    const c=document.createElement('canvas');c.width=fw;c.height=fh;
    const g=c.getContext('2d',{willReadFrequently:true});
    g.drawImage(img,frame*fw,0,fw,fh,0,0,fw,fh);
    const data=g.getImageData(0,0,fw,fh).data;
    for(let y=0;y<fh;y++)for(let x=0;x<fw;x++)if(data[(y*fw+x)*4+3]>10){
      if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
    }
  }
  const bounds=maxX<0?{x:0,y:0,w:fw,h:fh}:{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};
  sharedTrimCache.set(img,{cols,bounds});
  return bounds;
}

// All states use exactly this footprint, so neither the machine nor Woohyuk pulses.
const LEG_X=41,LEG_Y=169,LEG_W=54,LEG_H=73;
const BINGSU_X=66,BINGSU_Y=226,BINGSU_W=25;

function getFixedLegFrame(img,cols,frame=0){
  if(!img.complete||!img.naturalWidth)return null;
  const key=`${img.src}|${cols}|${frame}`;
  if(renderedLegCache.has(key))return renderedLegCache.get(key);
  const b=getSharedAlphaTrim(img,cols);if(!b)return null;
  const fw=Math.floor(img.naturalWidth/cols);
  const c=document.createElement('canvas');c.width=LEG_W;c.height=LEG_H;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage(img,frame*fw+b.x,b.y,b.w,b.h,0,0,LEG_W,LEG_H);
  // Remove the dessert baked into each source frame. A single fixed dessert is
  // drawn separately, preventing it from jumping between animation frames.
  g.clearRect(29,44,25,29);
  renderedLegCache.set(key,c);
  return c;
}

function drawFixedMachineImage(img,cols,frame=0){
  const c=getFixedLegFrame(img,cols,frame);if(c)ctx.drawImage(c,LEG_X,LEG_Y,LEG_W,LEG_H);
}

function drawFixedBingsu(){drawPatbingsu(BINGSU_X,BINGSU_Y,BINGSU_W);}

drawLegMachine=function(){
  if(bingsuCollected){
    // Shrink the post-collection legacy machine to the same footprint too.
    ctx.save();ctx.translate(LEG_X,LEG_Y);ctx.scale(LEG_W/60,LEG_H/81);ctx.translate(-38,-165);oldDrawLegMachine(0);ctx.restore();
    return;
  }
  if(!bingsuRevealed)drawFixedBingsu();
  drawFixedMachineImage(legIdleNew,1,0);
  // After the workout, the dessert must be fully outside and visible.
  if(bingsuRevealed)drawFixedBingsu();
};

drawLegExercise=function(frame){
  drawFixedBingsu();
  drawFixedMachineImage(legExerciseNew,3,frame);
};

// Dessert rendering is handled above in one fixed position only.
drawFixedPatbingsu=function(){};
