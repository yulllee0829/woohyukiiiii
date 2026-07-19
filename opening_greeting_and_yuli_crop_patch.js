// Add Woohyuk's greeting before the Outback question and fix Yuli's walking-frame head crop.
(function(){
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      const expanded=[];
      for(const line of lines){
        if(typeof line==='string'&&line.includes('혹시 아웃백 잠실롯데점에서 알바하시나요')){
          expanded.push('우혁 : 안녕하세요..!');
          expanded.push('우혁 : 혹시 아웃백 잠실롯데점에서 알바하시나요?');
        }else{
          expanded.push(line);
        }
      }
      lines=expanded;
    }
    return previousShowDialogue(lines,...args);
  };

  // Horizontal walking frames had too-tight source bounds at the top.
  // Add a small source margin above the frame and preserve the same foot position.
  const previousDrawYuli=drawYuli;
  drawYuli=function(x,y,dir='down',frame=0,w=34){
    if((dir==='left'||dir==='right')&&frame>0&&yuliSheet.complete&&yuliSheet.naturalWidth){
      const cols=3,rows=4;
      const fw=yuliSheet.naturalWidth/cols;
      const fh=yuliSheet.naturalHeight/rows;
      const col=1+((frame-1)%2);
      const row=rowByDir[dir]??0;
      const topPad=Math.max(2,Math.round(fh*0.025));
      const sx=col*fw;
      const sy=Math.max(0,row*fh-topPad);
      const sh=Math.min(yuliSheet.naturalHeight-sy,fh+topPad);
      const targetH=w*(sh/fw);
      const dx=Math.round(x-w/2);
      const dy=Math.round(y-targetH);
      ctx.drawImage(yuliSheet,sx,sy,fw,sh,dx,dy,Math.round(w),Math.round(targetH));
      return;
    }
    return previousDrawYuli(x,y,dir,frame,w);
  };

  const style=document.createElement('style');
  style.textContent='#dialogue{font-size:14.5px!important}';
  document.head.appendChild(style);
})();
