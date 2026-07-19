// Stabilize inventory selection and keep the gym gift flow separate from the old key scenario.
(function(){
  const items=document.querySelector('#inventoryItems');
  if(!items)return;

  function refreshLabels(){
    items.querySelectorAll('.inventory-item').forEach(button=>{
      const item=button.dataset.item;
      if(item==='아령'){
        const label=button.querySelector('span');
        if(label)label.textContent='덤벨';
      }
      button.classList.toggle('scenario-selected',item===selectedItem);
    });
  }

  // Capture inventory clicks before the legacy handlers. This prevents the old
  // patbingsu -> next-room-key branch and makes every item select reliably.
  items.addEventListener('click',event=>{
    const button=event.target.closest('.inventory-item');
    if(!button||!items.contains(button))return;
    const item=button.dataset.item;
    if(!item)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    selectedItem=item;
    refreshLabels();

    const give=document.querySelector('#giveItemButton');
    if(give){
      const shown=item==='아령'?'덤벨':item;
      give.disabled=false;
      give.textContent=`${shown} 주기`;
    }
  },true);

  // Keep the visible name as '덤벨' whenever another patch rebuilds the bag.
  const observer=new MutationObserver(refreshLabels);
  observer.observe(items,{childList:true,subtree:true});
  refreshLabels();

  // Normalize the requested patbingsu response even if an older wrapper supplied
  // the previous spelling.
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      lines=lines.map(line=>{
        if(typeof line==='string'&&line.includes('너무 마싯겟다')&&line.includes('건강에 안조아')){
          return '율리 : 어멋ㅎ// 너무 맛있겠다ㅠ 그치만 건강에 안 좋아ㅠㅠ';
        }
        return line;
      });
    }
    return previousShowDialogue(lines,...args);
  };
})();