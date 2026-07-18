// New transparent leg-extension artwork patch.
const legIdleNew=new Image();legIdleNew.src='assets/leg_extension_idle.png?v=1';
const legExerciseNew=new Image();legExerciseNew.src='assets/leg_extension_exercise.png?v=1';
const oldDrawLegMachine=drawLegMachine;
const trimCache=new WeakMap();

function getAlphaTrim(img,cols=1,frame=0){
  if(!img.complete||!img.naturalWidth)return null;
  let perImage=trimCache.get(img);
  if(!perImage){perImage={};trimCache.set(img,perImage);}
  const key=`${cols}:${frame}`;
  if(perImage[key])return perImage[key];
  const fw=Math.floor(img.naturalWidth/cols),fh=img.naturalHeight,sx=frame*fw;
  const c=document.createElement('canvas');c.width=fw;c.height=fh;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,sx,0,fw,fh,0,0,fw,fh);
  const data=g.getImageData(0,0,fw,fh).data;
  let minX=fw,minY=fh,maxX=-1,maxY=-1;
  for(let y=0;y<fh;y++)for(let x=0;x<fw;x++)if(data[(y*fw+x)*4+3]>10){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
  const b=maxX<0?{sx,sy:0,sw:fw,sh:fh}:{sx:sx+minX,sy:minY,sw:maxX-minX+1,sh:maxY-minY+1};
  perImage[key]=b;return b;
}

function drawTrimmedLeg(img,cols,frame){
  const b=getAlphaTrim(img,cols,frame);if(!b)return;
  const boxX=29,boxY=151,boxW=78,boxH=98;
  const scale=Math.min(boxW/b.sw,boxH/b.sh),dw=Math.round(b.sw*scale),dh=Math.round(b.sh*scale);
  const dx=Math.round(boxX+(boxW-dw)/2),dy=Math.round(boxY+boxH-dh);
  ctx.drawImage(img,b.sx,b.sy,b.sw,b.sh,dx,dy,dw,dh);
}

drawLegMachine=function(){
  if(bingsuCollected){oldDrawLegMachine(0);return;}
  drawTrimmedLeg(legIdleNew,1,0);
};

drawLegExercise=function(frame){drawTrimmedLeg(legExerciseNew,3,frame);};

// The new PNGs already contain the patbingsu in the correct fixed position.
drawFixedPatbingsu=function(){};
