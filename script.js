const scenes = [...document.querySelectorAll('.scene')];
const world = document.querySelector('#chapterWorld');
const dialogue = document.querySelector('#dialogue');
const stepText = document.querySelector('#stepText');
const progressText = document.querySelector('#progressText');

let chapterStep = 0;
let roomCleared = false;

const showScene = (id) => {
  scenes.forEach((scene) => scene.classList.toggle('active', scene.id === id));
};

const say = (text, timeout = 1500) => {
  dialogue.textContent = text;
  dialogue.classList.remove('hidden');
  window.clearTimeout(say.timer);
  say.timer = window.setTimeout(() => dialogue.classList.add('hidden'), timeout);
};

const setStep = (step) => {
  chapterStep = step;
  stepText.textContent = `${step + 1} / 5`;
  renderChapterStep();
};

function renderChapterStep() {
  world.innerHTML = '';
  dialogue.classList.add('hidden');
  if (chapterStep === 0) renderGym();
  if (chapterStep === 1) renderOutback();
  if (chapterStep === 2) renderPNB();
  if (chapterStep === 3) renderPharmacy();
  if (chapterStep === 4) renderBingsu();
}

function addTitle(text) {
  const title = document.createElement('div');
  title.className = 'location-title';
  title.textContent = text;
  world.appendChild(title);
}

function addInstruction(text) {
  const note = document.createElement('div');
  note.className = 'instruction';
  note.textContent = text;
  world.appendChild(note);
}

function renderGym() {
  const floor = document.createElement('div');
  floor.className = 'gym-floor';
  world.appendChild(floor);
  addTitle('잠실 헬스장 · 02.16');
  addInstruction('운동 중인 사람들 사이에서 율리를 찾아보세요.');

  const positions = [
    [15, 28], [42, 22], [72, 31], [24, 56], [54, 52], [79, 61]
  ];
  positions.forEach(([left, top], index) => {
    const npc = document.createElement('button');
    npc.className = `npc ${index === 4 ? 'target' : ''}`;
    npc.style.left = `${left}%`;
    npc.style.top = `${top}%`;
    npc.setAttribute('aria-label', index === 4 ? '율리' : '헬스장 이용객');
    npc.addEventListener('click', () => {
      if (index !== 4) {
        say('이 사람은 아닌 것 같다.');
        return;
      }
      say('율리를 발견했다! 메시지를 보내볼까?');
      setTimeout(() => {
        say('혹시 헬스장 오셨어요?', 1200);
        setTimeout(() => {
          say('오 누구세요??', 1200);
          setTimeout(() => setStep(1), 1300);
        }, 1300);
      }, 1500);
    });
    floor.appendChild(npc);
  });

  [[8,45],[61,43],[36,70]].forEach(([left,top]) => {
    const machine = document.createElement('div');
    machine.className = 'machine';
    machine.style.left = `${left}%`;
    machine.style.top = `${top}%`;
    floor.appendChild(machine);
  });
}

function makeDraggable(el, onDrop) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  const move = (x, y) => {
    el.style.left = `${x - offsetX}px`;
    el.style.top = `${y - offsetY}px`;
    el.style.bottom = 'auto';
  };
  el.addEventListener('pointerdown', (event) => {
    dragging = true;
    el.setPointerCapture(event.pointerId);
    const rect = el.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
  });
  el.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const parent = world.getBoundingClientRect();
    move(event.clientX - parent.left, event.clientY - parent.top);
  });
  el.addEventListener('pointerup', () => {
    dragging = false;
    onDrop?.(el);
  });
}

function renderOutback() {
  addTitle('강남교보타워점');
  addInstruction('숟가락과 포크를 먼저 겹친 뒤, 나이프와 함께 봉투에 넣어주세요.');
  const counter = document.createElement('div');
  counter.className = 'work-counter';
  world.appendChild(counter);

  const bag = document.createElement('div');
  bag.className = 'bag';
  world.appendChild(bag);

  const spoon = document.createElement('div');
  spoon.className = 'utensil spoon';
  spoon.style.left = '10%';
  const fork = document.createElement('div');
  fork.className = 'utensil fork';
  fork.style.left = '26%';
  const knife = document.createElement('div');
  knife.className = 'utensil knife';
  knife.style.left = '43%';
  world.append(spoon, fork, knife);

  let paired = false;
  let packedPair = false;
  let packedKnife = false;

  const overlap = (a, b, margin = 34) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return Math.abs(ar.left - br.left) < margin && Math.abs(ar.top - br.top) < margin;
  };
  const inBag = (el) => {
    const er = el.getBoundingClientRect();
    const br = bag.getBoundingClientRect();
    return er.left > br.left - 25 && er.right < br.right + 25 && er.top > br.top - 25;
  };
  const finish = () => {
    if (packedPair && packedKnife) {
      say('준비 완료!');
      setTimeout(() => setStep(2), 1200);
    }
  };
  const pairCheck = () => {
    if (!paired && overlap(spoon, fork)) {
      paired = true;
      const sr = spoon.getBoundingClientRect();
      const wr = world.getBoundingClientRect();
      fork.style.left = `${sr.left - wr.left + 5}px`;
      fork.style.top = `${sr.top - wr.top}px`;
      fork.style.bottom = 'auto';
      say('찰칵! 숟가락과 포크가 겹쳐졌습니다.');
    }
    if (paired && (inBag(spoon) || inBag(fork))) {
      packedPair = true;
      spoon.style.opacity = '0';
      fork.style.opacity = '0';
      say('수저 세트 포장 완료.');
      finish();
    }
  };
  makeDraggable(spoon, pairCheck);
  makeDraggable(fork, pairCheck);
  makeDraggable(knife, () => {
    if (!inBag(knife)) return;
    packedKnife = true;
    knife.style.opacity = '0';
    say('나이프 포장 완료.');
    finish();
  });
}

function renderShop({ title, products, correctIndex, successText, nextStep, pharmacy = false }) {
  const shop = document.createElement('div');
  shop.className = 'shop';
  world.appendChild(shop);
  addTitle(title);
  addInstruction('선반으로 걸어가 정답 상품을 직접 골라주세요. 직원 율리가 열심히 힌트를 주는 중입니다.');

  const shelf = document.createElement('div');
  shelf.className = 'shelf';
  shop.appendChild(shelf);

  products.forEach((product, index) => {
    const item = document.createElement('button');
    item.className = `product ${index === correctIndex ? 'correct' : ''}`;
    item.dataset.tag = product.tag;
    item.textContent = product.icon;
    item.addEventListener('click', () => {
      if (index !== correctIndex) {
        say('율리 직원이 고개를 세차게 젓는다.');
        return;
      }
      say(successText, 1700);
      setTimeout(() => setStep(nextStep), 1800);
    });
    shelf.appendChild(item);
  });

  const clerk = document.createElement('div');
  clerk.className = 'clerk';
  clerk.title = pharmacy ? '수상한 약사 율리' : 'PNB 직원 율리';
  shop.appendChild(clerk);
}

function renderPNB() {
  renderShop({
    title: '전주 PNB 초코파이',
    products: [
      { icon: '🍫', tag: '기본' },
      { icon: '🍓', tag: '딸기' },
      { icon: '🍌', tag: '바나나' },
      { icon: '🍵', tag: '말차' }
    ],
    correctIndex: 3,
    successText: '말차 초코파이를 찾았다! 율리 직원이 아주 만족해한다.',
    nextStep: 3
  });
}

function renderPharmacy() {
  renderShop({
    title: '길목의 수상한 약국',
    products: [
      { icon: '⚡', tag: '체력' },
      { icon: '💪', tag: '근육' },
      { icon: '🌙', tag: '숙면' },
      { icon: '💗', tag: '???' }
    ],
    correctIndex: 3,
    successText: '효과: 율리를 좋아하게 됨 · 이미 적용 중',
    nextStep: 4,
    pharmacy: true
  });
}

function renderBingsu() {
  const scene = document.createElement('div');
  scene.className = 'bingsu-table';
  world.appendChild(scene);
  addTitle('03.07 늦은 밤');
  addInstruction('마지막 딸기를 빙수 위에 올려주세요.');

  const windowEl = document.createElement('div');
  windowEl.className = 'city-window';
  const bowl = document.createElement('div');
  bowl.className = 'bowl';
  const clock = document.createElement('div');
  clock.className = 'clock';
  clock.textContent = '23:59';
  const strawberry = document.createElement('div');
  strawberry.className = 'strawberry';
  scene.append(windowEl, bowl, clock, strawberry);

  makeDraggable(strawberry, () => {
    const sr = strawberry.getBoundingClientRect();
    const br = bowl.getBoundingClientRect();
    const centered = sr.left < br.right && sr.right > br.left && sr.top < br.top + 40;
    if (!centered) {
      say('딸기가 아직 빙수 위에 올라가지 않았다.');
      return;
    }
    strawberry.style.left = '50%';
    strawberry.style.top = `${br.top - world.getBoundingClientRect().top - 102}px`;
    strawberry.style.bottom = 'auto';
    strawberry.style.transform = 'translateX(-50%)';
    say('빙수 완성!');
    setTimeout(() => {
      clock.textContent = '00:00';
      setTimeout(() => {
        roomCleared = true;
        progressText.textContent = '완료 1 / 1';
        showScene('clearScene');
      }, 1200);
    }, 900);
  });
}

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'enter-hotel') showScene('lobbyScene');
  if (action === 'enter-room') {
    showScene('roomScene');
    setStep(0);
  }
  if (action === 'back-lobby' || action === 'return-lobby') showScene('lobbyScene');
});

showScene('titleScene');
