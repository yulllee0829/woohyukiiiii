// Place Hong's reply choices inside a Woohyuk-style speech bubble and fine-tune Damin's bubble.
(function(){
  const app=document.querySelector('#app');
  if(!app)return;

  const style=document.createElement('style');
  style.textContent=`
    /* Move Damin teacher's yellow bubble a little farther left and up. */
    #dialogue.speaker-hong-gym{
      left:10px!important;
      top:11%!important;
    }

    /* The two answers appear as one Woohyuk speech bubble near his head. */
    #scenarioChoices{
      left:0!important;
      right:auto!important;
      top:0!important;
      bottom:auto!important;
      width:188px!important;
      display:grid!important;
      grid-template-columns:1fr 1fr!important;
      gap:8px!important;
      padding:27px 12px 12px!important;
      border:3px solid #4b7185!important;
      border-radius:12px!important;
      background:#e8f7ff!important;
      box-shadow:0 4px 0 rgba(49,82,99,.28)!important;
      box-sizing:border-box!important;
    }
    #scenarioChoices::before{
      content:'우혁';
      position:absolute;
      top:5px;
      left:14px;
      font-size:14.2px;
      line-height:1;
      font-weight:800;
      color:#31586b;
    }
    #scenarioChoices button{
      min-width:0!important;
      padding:8px 6px!important;
      border:2px solid #6f94a7!important;
      border-radius:8px!important;
      background:#cfeefa!important;
      color:#294d60!important;
      box-shadow:none!important;
      font-size:14.2px!important;
    }
    #scenarioChoices button:active{
      transform:translateY(1px)!important;
      background:#bde3f3!important;
      box-shadow:none!important;
    }
  `;
  document.head.appendChild(style);

  function followChoices(){
    const box=document.querySelector('#scenarioChoices');
    if(box&&typeof player!=='undefined'&&player){
      const appRect=app.getBoundingClientRect();
      const boxRect=box.getBoundingClientRect();
      const screenX=(player.x/192)*appRect.width;
      const screenY=(player.y/336)*appRect.height;
      const left=Math.max(8,Math.min(appRect.width-boxRect.width-8,screenX-boxRect.width-26));
      const top=Math.max(62,Math.min(appRect.height-boxRect.height-10,screenY-boxRect.height-34));
      box.style.left=`${left}px`;
      box.style.top=`${top}px`;
    }
    requestAnimationFrame(followChoices);
  }
  requestAnimationFrame(followChoices);
})();
