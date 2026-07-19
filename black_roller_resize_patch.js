// Redraw the black foam roller at a size comparable to the green roller.
(function(){
  const img=new Image();
  let bounds=null;
  img.src='assets/%20%20%20%20item_black_foamroller.png?v=4';
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

    // Remove every trace of the old oversized roller and rebuild the top of the mat.
    px(112,138,80,40,'#191919');
    px(112,146,80,1,'#2a2a2a');
    px(127,150,64,28,'#111111');
    px(124,146,64,32,'#737a80');
    px(126,148,60,30,'#bfc3c7');
    px(128,150,56,2,'#e8eaec');
    px(128,152,2,26,'#d9dde0');

    const collected=typeof inventory!=='undefined'&&inventory.includes('검정 폼롤러');
    if(!collected&&img.complete&&img.naturalWidth){
      const b=bounds||{x:0,y:0,w:img.naturalWidth,h:img.naturalHeight};
      const targetW=32;
      const targetH=targetW*(b.h/b.w);
      const cx=157,bottom=162;
      ctx.drawImage(img,b.x,b.y,b.w,b.h,cx-targetW/2,bottom-targetH,targetW,targetH);
    }

    // Repaint Yuli and Woohyuk above the mat/roller layer.
    if(typeof drawYuli==='function')drawYuli(154,218,'down',0,45);
    if(!legExerciseActive)drawBoyfriend(player.x,player.y,player.dir,player.frame,42);
  };
})();