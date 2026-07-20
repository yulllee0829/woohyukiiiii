// Ensure Woohyuk's greeting always appears immediately before the first Outback question.
(function(){
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      const hasOutbackQuestion=lines.some(line=>
        typeof line==='string'&&
        line.includes('아웃백 잠실롯데점')&&
        line.includes('알바하시나요')
      );

      if(hasOutbackQuestion){
        const rebuilt=[];
        let greetingInserted=false;
        for(const line of lines){
          const isQuestion=typeof line==='string'&&line.includes('아웃백 잠실롯데점')&&line.includes('알바하시나요');
          if(isQuestion&&!greetingInserted){
            const previous=rebuilt[rebuilt.length-1];
            const alreadyHasGreeting=typeof previous==='string'&&previous.includes('안녕하세요');
            if(!alreadyHasGreeting)rebuilt.push('우혁 : 안녕하세요..!');
            rebuilt.push('우혁 : 혹시.. 아웃백 잠실롯데점에서 알바하시나요??');
            greetingInserted=true;
          }else if(!(typeof line==='string'&&line.includes('안녕하세요')&&greetingInserted)){
            rebuilt.push(line);
          }
        }
        lines=rebuilt;
      }
    }
    return previousShowDialogue(lines,...args);
  };
})();
