const todayScreen = document.querySelector('#app .scr');
const todayReplay = document.querySelector('#app [data-replay]');
const tabs = [...document.querySelectorAll('#app [data-prototype-tab]')];
const todayTab = tabs.find(tab => tab.dataset.prototypeTab === 'today');
const embeddedTabs = {
  unit: {title:'单元学', path:'/yibei-plan-progress/?embed=1'},
  quiz: {title:'小测', path:'/wordclass-training-prototype/quiz/?state=books&embed=1'}
};
const slots = new Map();
let activeTab = todayTab;

function mountPrototypeTab(key) {
  const {title,path} = embeddedTabs[key];
  const slot = document.createElement('div');
  slot.className = 'prototype-slot ' + key + '-slot';
  const frame = document.createElement('iframe');
  const url = new URL(path,location.origin);
  if (key === 'unit' && new URLSearchParams(location.search).get('review') === 'none') {
    url.searchParams.set('review','none');
  }
  frame.src = url.href;
  frame.title = title;
  frame.allow = 'microphone';
  slot.append(frame);
  todayScreen.after(slot);
  slots.set(key,slot);
  return slot;
}

function selectPrototypeTab(tab) {
  if (tab === activeTab) return;
  const previous = activeTab.dataset.prototypeTab;
  const key = tab.dataset.prototypeTab;
  const lastSlot = slots.get(previous);
  if (lastSlot) {
    lastSlot.firstElementChild.contentWindow.postMessage({type:'wordclass-' + previous + '-hide'},location.origin);
    lastSlot.hidden = true;
  }
  if (key !== 'today') {
    const slot = slots.get(key) || mountPrototypeTab(key);
    slot.hidden = false;
    if (key === 'quiz') slot.firstElementChild.contentWindow.postMessage({type:'wordclass-quiz-show'},location.origin);
  }
  todayScreen.hidden = key !== 'today';
  if (todayReplay) todayReplay.hidden = todayScreen.hidden;
  activeTab.classList.remove('active');
  activeTab.removeAttribute('aria-current');
  tab.classList.add('active');
  tab.setAttribute('aria-current','page');
  activeTab = tab;
}

for (const tab of tabs) tab.addEventListener('click',() => selectPrototypeTab(tab));
window.addEventListener('pageshow',event => {
  if (event.persisted) selectPrototypeTab(todayTab);
});
