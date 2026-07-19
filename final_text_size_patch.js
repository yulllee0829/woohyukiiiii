// Final wording and unified visible text sizing.
(function(){
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      lines=lines.map(line=>{
        if(typeof line!=='string')return line;
        if(line.includes('혹시 아웃백 잠실롯데점')&&line.includes('알바하시나요')){
          return '우혁 : 혹시.. 아웃백 잠실롯데점에서 알바하시나요??';
        }
        if(line.includes('오 시원하겠다! 갖다 놔요ㅋ')||line.includes('초록 폼롤러')&&line.includes('시원')){
          return '율리 : 우아 시원해ㅎㅎ 근데 나 배고파ㅠㅠ';
        }
        return line;
      });
    }
    return previousShowDialogue(lines,...args);
  };

  const style=document.createElement('style');
  style.textContent=`
    #dialogue,
    #dialogue::before,
    #missionBanner,
    #hint,
    .inventory-title,
    .inventory-empty,
    .inventory-item,
    .inventory-help,
    #scenarioChoices,
    #scenarioChoices button,
    #giveItemButton,
    #startButton{
      font-size:14.2px!important;
    }
  `;
  document.head.appendChild(style);
})();
