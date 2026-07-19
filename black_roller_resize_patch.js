// Redraw the black foam roller at a size comparable to the green roller.
(function(){
  const img=new Image();
  let bounds=null;
  img.src='assets/%20%20%20%20item_black_foamroller.png?v=3';
  img.addEventListener('load',()=>{
    try{
      const c=document.createElement('canvas');
      c.width=img.naturalWidth;c.height=img.naturalHeight;
      const cctx=c.getContext('2d',{willReadFrequently:true});
      cctx.drawImage(img,0,0);
      const data=cctx.getImageData(0,0,c.width,c.height).data;
      let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
        if(data[(y*c.width+x)*4+3]>12){
          if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
        }
      }
      if(maxX>=minX&&maxY>=minY)bounds={x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};
    }catch(_){bounds=null;}
  });

  const previousDraw=drawGymSideRoom;
  drawGymSideRoom=function(){
    previousDraw();
    if(scene!=='gymSide')return;

    // Clear the oversized redraw and restore this section of the mat.
    px(124,142,68,35,'#bfc3c7');
    px(124,142,68,2,'#737a80');
    px(126,144,64,2,'#e8eaec');
    px(126,146,2,29,'#d9dde0');

    const collected=typeof inventory!=='undefined'&&inventory.includes('검정 폼롤러');
    if(!collected&&img.complete&&img.naturalWidth){
      const b=bounds||{x:0,y:0,w:img.naturalWidth,h:img.naturalHeight};
      const targetW=38;
      const targetH=targetW*(b.h/b.w);
      const cx=157,bottom=166;
      ctx.drawImage(img,b.x,b.y,b.w,b.h,cx-targetW/2,bottom-targetH,targetW,targetH);
    }
    if(!legExerciseActive)drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
  };
})();