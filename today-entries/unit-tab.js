const todayScreen = document.querySelector('#app .scr');
const todayTab = document.querySelector('#app [data-prototype-tab="today"]');
const unitTab = document.querySelector('#app [data-prototype-tab="unit"]');
const todayReplay = document.querySelector('#app [data-replay]');
const unitSlot = document.createElement('div');
unitSlot.className = 'unit-slot';
unitSlot.hidden = true;
todayScreen.after(unitSlot);

function selectPrototypeTab(tab) {
  const showUnit = tab === unitTab;
  if (showUnit && !unitSlot.firstElementChild) {
    const frame = document.createElement('iframe');
    const url = new URL('/yibei-plan-progress/?embed=1', location.origin);
    if (new URLSearchParams(location.search).get('review') === 'none') {
      url.searchParams.set('review', 'none');
    }
    frame.src = url.href;
    frame.title = '单元学';
    frame.allow = 'microphone';
    unitSlot.append(frame);
  }
  if (!showUnit && !unitSlot.hidden) {
    unitSlot.firstElementChild.contentWindow.postMessage({type:'wordclass-unit-hide'}, location.origin);
  }

  todayScreen.hidden = showUnit;
  unitSlot.hidden = !showUnit;
  if (todayReplay) todayReplay.hidden = showUnit;
  const previous = showUnit ? todayTab : unitTab;
  previous.classList.remove('active');
  previous.removeAttribute('aria-current');
  tab.classList.add('active');
  tab.setAttribute('aria-current', 'page');
}

todayTab.addEventListener('click', () => selectPrototypeTab(todayTab));
unitTab.addEventListener('click', () => selectPrototypeTab(unitTab));
window.addEventListener('pageshow', event => {
  if (event.persisted) selectPrototypeTab(todayTab);
});
