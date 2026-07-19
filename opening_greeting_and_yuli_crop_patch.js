// Add Woohyuk's greeting before the Outback question and repair Yuli's opening walk frames.
(function(){
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      const expanded=[];
      for(const line of lines){
        if(typeof line==='string'&&line.includes('혹시 아웃백 잠실롯데점')&&line.includes('알바하시나요')){
          expanded.push('우혁 : 안녕하세요..!');
          expanded.push('우혁 : 혹시.. 아웃백 잠실롯데점에서 알바하시나요??');
        }else{
          expanded.push(line);
        }
      }
      lines=expanded;
    }
    return previousShowDialogue(lines,...args);
  };

  // The scenario captured an older drawYuli reference, so redraw the moving frame last.
  // Include a generous source margin above the horizontal sprite cell so the hair tip is visible.
  let walkStartedAt=0;
  const previousDrawGymWorld=drawGymWorld;
  drawGymWorld=function(){
    previousDrawGymWorld();
    if(scene!=='gym'||!yuli||yuli.dir!=='right'||yuli.x!==96){
      walkStartedAt=0;
      return;
    }
    if(!walkStartedAt)walkStartedAt=performance.now();
    if(!yuliSheet.complete||!yuliSheet.naturalWidth)return;

    const p=Math.min(1,(performance.now()-walkStartedAt)/1500);
    const x=96+(112*p);
    const frame=1+Math.floor(performance.now()/150)%2;
    const cols=3,rows=4;
    const fw=yuliSheet.naturalWidth/cols;
    const fh=yuliSheet.naturalHeight/rows;
    const col=1+((frame-1)%2);
    const row=rowByDir.right??3;
    const topPad=Math.max(8,Math.round(fh*0.10));
    const sx=col*fw;
    const sy=Math.max(0,row*fh-topPad);
    const sh=Math.min(yuliSheet.naturalHeight-sy,fh+topPad);
    const w=40;
    const targetH=w*(sh/fw);
    const dx=Math.round(x-w/2);
    const dy=Math.round(198-targetH);

    ctx.drawImage(yuliSheet,sx,sy,fw,sh,dx,dy,Math.round(w),Math.round(targetH));
  };

  const style=document.createElement('style');
  style.textContent='#dialogue{font-size:14.2px!important}';
  document.head.appendChild(style);
})();