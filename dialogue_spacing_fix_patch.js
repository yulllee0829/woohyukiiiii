// Keep Yuli's final emoticon on the same line and tighten the dialogue box bottom spacing.
(function(){
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      lines=lines.map(line=>{
        if(typeof line!=='string')return line;
        if(line.includes('제가 좋아할 만한 거 찾아와 주시면 용서해 드릴게용')){
          return line.replace(/용서해 드릴게용\s*\*\^\^\*/,'용서해 드릴게용\u00A0*^^*');
        }
        return line;
      });
    }
    return previousShowDialogue(lines,...args);
  };

  const style=document.createElement('style');
  style.textContent=`
    #dialogue{
      padding-top:25px!important;
      padding-bottom:8px!important;
      line-height:1.28!important;
    }
  `;
  document.head.appendChild(style);
})();