// Blue Hong-response choices, one-time rejected gifts, and final ONAO wording.
(function(){
  const items=document.querySelector('#inventoryItems');
  if(!items)return;

  const rejectedGifts=new Set();

  function visibleName(item){
    return item==='아령'?'덤벨':item;
  }

  function syncRejectedItems(){
    items.querySelectorAll('.inventory-item').forEach(button=>{
      const item=button.dataset.item;
      const rejected=rejectedGifts.has(item);
      button.disabled=rejected;
      button.classList.toggle('gift-rejected',rejected);
      if(rejected){
        button.setAttribute('aria-disabled','true');
        button.title='이미 줘 본 아이템';
      }else{
        button.removeAttribute('aria-disabled');
        button.removeAttribute('title');
      }
    });

    const give=document.querySelector('#giveItemButton');
    if(give&&selectedItem&&rejectedGifts.has(selectedItem)){
      give.disabled=true;
      give.textContent=`${visibleName(selectedItem)} 이미 줘 봄`;
    }
  }

  // Prevent selecting gifts that Yuli already rejected.
  items.addEventListener('click',event=>{
    const button=event.target.closest('.inventory-item');
    if(!button||!rejectedGifts.has(button.dataset.item))return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

  // Remember the item before the scenario clears selectedItem.
  document.addEventListener('click',event=>{
    const give=event.target.closest('#giveItemButton');
    if(!give||give.disabled||!selectedItem)return;
    const item=selectedItem;
    if(item!=='우혁made오나오'){
      rejectedGifts.add(item);
      setTimeout(syncRejectedItems,0);
    }
  },true);

  const observer=new MutationObserver(syncRejectedItems);
  observer.observe(items,{childList:true,subtree:true});
  observer.observe(document.querySelector('#inventoryPanel'),{childList:true,subtree:true});

  // The special item is received from Hong, rather than picked up from the floor.
  const previousShowDialogue=showDialogue;
  showDialogue=function(lines,...args){
    if(Array.isArray(lines)){
      lines=lines.map(line=>{
        if(typeof line==='string'&&line.includes('우혁made오나오')&&
           (line.includes('주웠다')||line.includes('가방에 넣었다')||line.includes('받았다'))){
          return '우혁made오나오를 받았다!';
        }
        return line;
      });
    }
    return previousShowDialogue(lines,...args);
  };

  const style=document.createElement('style');
  style.textContent=`
    /* The two “네” answers are Woohyuk's response, so use his light-blue palette. */
    #scenarioChoices{background:#e8f7ff;border-color:#4b7185;box-shadow:0 6px 0 rgba(49,82,99,.45)}
    #scenarioChoices button{background:#bfe8fa;border-color:#4b7185;box-shadow:0 3px 0 #78b8d5;color:#294d60}
    #scenarioChoices button:active{box-shadow:0 1px 0 #78b8d5}

    /* Items already rejected by Yuli stay visible but cannot be selected again. */
    .inventory-item.gift-rejected,
    .inventory-item.gift-rejected:disabled{
      opacity:.46;
      filter:grayscale(1);
      background:#d9d9d9;
      border-color:#8a8a8a;
      color:#666;
      outline:none;
      transform:none;
      cursor:not-allowed;
    }
  `;
  document.head.appendChild(style);
  syncRejectedItems();
})();