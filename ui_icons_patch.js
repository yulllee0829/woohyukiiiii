// Contextual pixel UI controls: bag is always on the right; interaction icon sits to its left.
(function(){
  function syncInteractionIcon(){
    const visible=!actionButton.classList.contains('hidden');
    let mode='hand';

    // Only conversations use the speech-bubble half of ui_actions.png.
    if(scene==='gym'&&foundYuli)mode='talk';

    actionButton.classList.toggle('action-talk',visible&&mode==='talk');
    actionButton.classList.toggle('action-hand',visible&&mode==='hand');
    actionButton.setAttribute('aria-label',mode==='talk'?'대화하기':'상호작용하기');
    requestAnimationFrame(syncInteractionIcon);
  }

  pocketButton.textContent='';
  actionButton.textContent='';
  pocketButton.setAttribute('aria-label','주머니 열기');
  requestAnimationFrame(syncInteractionIcon);
})();