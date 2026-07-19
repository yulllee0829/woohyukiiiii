// Refine the gym opening copy and make Yuli leave when the first thought advances.
(function(){
  let splittingOpening=false;

  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,cb){
    if(Array.isArray(lines)){
      // Permanently suppress every legacy opening narration/date line.
      if(lines.some(line=>typeof line==='string'&&(
        line.includes('308호의 첫 기억이 열렸다')||
        line.includes('2월 16일, 헬스보이짐')||
        line.includes('2025년 2월 16일')||
        line.includes('헬스보이짐 잠실점')
      ))){
        if(typeof cb==='function')cb();
        return;
      }

      lines=lines.map(line=>{
        if(typeof line!=='string')return line;
        if(line.includes('혹시 아웃백 잠실롯데점 알바하시나요'))return '우혁 : 혹시 아웃백 잠실롯데점에서 알바하시나요?';
        if(line.includes('엇 혹시 아웃백 교육'))return '우혁 : 엇 아웃백 교육에서 본 것 같은데…';
        if(line.includes('말 걸어볼까'))return '우혁 : 말 걸어볼까…';
        return line;
      });

      // Start Yuli walking when the first thought advances to the second.
      if(!splittingOpening&&lines.length===2&&
         typeof lines[0]==='string'&&lines[0].includes('아웃백 교육에서 본 것 같은데')&&
         typeof lines[1]==='string'&&lines[1].includes('말 걸어볼까')){
        splittingOpening=true;
        const second=lines[1];
        return previousShowDialogue([lines[0]],()=>{
          if(typeof cb==='function')cb();
          previousShowDialogue([second],()=>{splittingOpening=false;});
        });
      }
    }
    return previousShowDialogue(lines,cb);
  };

  // Remove any date card created by an older cached layer.
  function removeDateCard(){document.querySelector('#gymDateCard')?.remove();}
  const previousEnterGym=enterGym;
  enterGym=function(){
    const result=previousEnterGym();
    removeDateCard();
    setTimeout(removeDateCard,0);
    setTimeout(removeDateCard,100);
    setTimeout(removeDateCard,500);
    return result;
  };
})();