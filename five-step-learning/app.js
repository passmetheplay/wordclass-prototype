const steps = [
  ['学', '认识单词', '先听单词，再看本轮要学的词义。'],
  ['读', '跟读单词', '听完可以录下自己的发音，再回听对照。'],
  ['练', '选择词义', '选一个释义，再点「确认答案」。'],
  ['拼', '听音拼词', '点字母拼词。点上方已填字母可以撤回。'],
  ['写', '根据词义写单词', '输入英文后检查拼写，写对就可以学下一词。']
];
const detailTabs = [
  ['单词角', '发音和释义', '分别点播美音和英音。按词性分组，同一词性的不同意思逐项列出。'],
  ['变形', '按语法角色查变形', '列出原形、第三人称单数、过去式、过去分词、现在分词、动名词和可数名词复数。相同拼法可以对应不同用法。'],
  ['固定搭配', '在短语中记词', '每行展示英文搭配和中文意思。'],
  ['词根助记', '从词基记住一组词', '展示真实的构词关系。无法继续拆分的词按完整词基记，用核心画面帮助记忆。'],
  ['例句', '在语境中理解词义', '每句附中文和对应义项，便于对照动词和名词的不同用法。']
];
const iconPaths = {
  sound: '<path d="M4 9v6h4l5 4V5L8 9H4zm12 0a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  forward: '<path d="m9 18 6-6-6-6"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3z"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
  book: '<path d="M4 5h5a3 3 0 0 1 3 3v12a4 4 0 0 0-3-1H4zm16 0h-5a3 3 0 0 0-3 3v12a4 4 0 0 1 3-1h5z"/>',
  mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1m-6 7v3m-3 0h6"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const button = (action, label, attrs = '', className = '') =>
  `<button type="button" class="${className}" data-action="${action}" ${attrs}>${label}</button>`;
const primary = (action, label, attrs = '') => button(action, label, attrs, 'primary');
const soundButton = (accent, label, style = 'round') =>
  button('sound', icon('sound') + (style === 'accent' ? `<span>${label}</span>` : ''), `data-accent="${accent}" aria-label="${label}"`, style);
const startState = {view:'start', index:0, step:0, tab:0};
const blankStep = () => ({choice:null, used:[], answer:'', result:null, visited:false, recording:''});
const newProgress = () => demoWords.map(() => ({lastStep:0, steps:steps.map(blankStep)}));
const state = {...startState};
let progress = newProgress();
const screen = document.querySelector('#demo-screen');
const note = document.querySelector('#demo-note');
const storageKey = 'wordclass-five-step-preview-v1';
let wordFlags = {};
try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) wordFlags = stored;
} catch {}
const audio = new Audio();
audio.preload = 'auto';
let audioRequest = 0;
let audioMessage = '';
let mic = null;
let micMessage = '';
let recordedPlayback = null;

function currentWord() {
  return demoWords[state.index];
}

function currentStep() {
  return progress[state.index].steps[state.step];
}

function phaseComplete(wordProgress) {
  return wordProgress.steps.map((phase, i) => i < 2 ? phase.visited : phase.result === 'ok');
}

function nextUnfinishedWord(index, done) {
  const later = done.findIndex((complete, i) => i > index && !complete);
  return later >= 0 ? later : done.indexOf(false);
}

function statusBar() {
  return '<div class="status"><span>9:41</span><span class="island"></span><span aria-hidden="true">▮▮▮ ▰</span></div>';
}

function topBar(title, backLabel = '') {
  return `<header class="phone-nav">${backLabel ? button('back', icon('back'), `aria-label="${backLabel}"`, 'round back') : ''}<h3 tabindex="-1">${title}</h3></header>`;
}

function wordBar(word, reveal, message) {
  return `<div class="word-bar"><div><span class="label">美式音标</span>
    ${reveal ? `<strong lang="en">${word.word}</strong>` : ''}
    <span class="ipa">${word.us}</span></div>
    ${soundButton('us','重听美式发音')}
    <p class="sound-status" role="status">${message || '点扬声器重听'}</p></div>`;
}

function toolBar(flags) {
  return `<nav class="word-tools" aria-label="单词工具">
    ${button('favorite', icon('star') + `<span>${flags.favorite ? '已收藏' : '收藏单词'}</span>`, `aria-pressed="${Boolean(flags.favorite)}"`)}
    ${button('mastery', icon('check') + `<span>${flags.mastery ? '已掌握' : '标记掌握'}</span>`, `aria-pressed="${Boolean(flags.mastery)}"`)}
    ${button('details', icon('book') + '<span>单词详解</span>')}
  </nav>`;
}

function wordRail(index, hideCurrentWord, done) {
  const arrow = (direction, label, disabled, graphic) => button('switch-word', icon(graphic),
    `data-index="${index + direction}" aria-label="${label}" ${disabled ? 'disabled' : ''}`, 'word-arrow');
  return `<section class="word-nav" aria-label="本轮单词">
    <div class="switch-label"><b>本轮单词</b><span>${index + 1} / ${demoWords.length}</span></div>
    <div class="word-switch">
      ${arrow(-1, '上一个词', index === 0, 'back')}
      <div class="word-rail" role="group" aria-label="横滑选择单词">${demoWords.map(({word}, i) => {
        const current = i === index;
        const label = current && hideCurrentWord ? '第 ' + (i + 1) + ' 词' : word;
        const attrs = `data-index="${i}" ${current ? 'aria-current="true"' : ''} aria-label="${label}${done[i] ? '，已完成' : ''}"`;
        return button('select-word', `<span ${current && hideCurrentWord ? '' : 'lang="en"'}>${label}</span>${done[i] ? '<span class="word-check" aria-hidden="true">✓</span>' : ''}`, attrs, 'word-chip');
      }).join('')}</div>
      ${arrow(1, '下一个词', index === demoWords.length - 1, 'forward')}
    </div>
  </section>`;
}

function stepView(model, word, prefix, live) {
  const {step, index, used = [], choice = null, answer = '', result, wordDone = [], phaseDone = []} = model;
  const [,title] = steps[step];
  const checked = result === 'ok';
  const reveal = step < 3 || checked;
  const remainingStep = phaseDone.findIndex(done => !done);
  const followingWord = nextUnfinishedWord(index, wordDone);
  const finishLabel = remainingStep >= 0 ? '补做「' + steps[remainingStep][0] + '」' :
    followingWord < 0 ? '完成本轮' : followingWord === index + 1 ? '下一个词' : '继续未完成词';
  const finish = primary('complete',finishLabel);
  const next = primary('next', '下一步 · ' + (steps[step + 1]?.[0] || ''));
  let task, cta;
  if (step === 0) {
    task = `<section class="task"><span class="label">本轮词义</span><h4>${word.meaning}</h4>
      <div class="example"><b lang="en">${word.examples[0][0]}</b><p>${word.examples[0][1]}</p></div></section>`;
    cta = next;
  } else if (step === 1) {
    const label = live && mic ? (mic.recorder ? '停止录音' : '取消录音') : '录音跟读';
    task = `<section class="task"><p>听完示范，再开口读一遍。</p>
      <div class="actions">${button('record', icon('mic') + label, '', 'soft')}${live && model.recording ? button('replay-recording','回听录音','','soft') : ''}</div>
      <p class="feedback" role="status">${live ? micMessage : ''}</p></section>`;
    cta = next;
  } else if (step === 2) {
    task = `<div class="options" role="group" aria-label="词义选项">${word.choices.map((label,i) =>
      button('choose', label, `data-index="${i}" aria-pressed="${choice === i}" ${checked ? 'disabled' : ''}`, 'option')).join('')}</div>`;
    cta = checked ? next : primary('check', '确认答案', choice === null ? 'disabled' : '');
  } else if (step === 3) {
    task = `<section class="task spelling"><div class="tiles" role="group" aria-label="已填字母">${word.letters.map((_,i) =>
      used[i] === undefined ? '<span class="tile blank" aria-hidden="true">·</span>' :
        button('remove-letter',word.letters[used[i]],`data-index="${i}" aria-label="撤回 ${word.letters[used[i]]}" ${checked ? 'disabled' : ''}`,'tile')).join('')}</div>
      <div class="tiles" role="group" aria-label="字母选项">${word.letters.map((letter,i) =>
        button('letter',letter,`data-index="${i}" ${used.includes(i) || checked ? 'disabled' : ''}`,'tile')).join('')}</div>
      <p class="caption">点上方字母可以撤回。</p></section>`;
    cta = checked ? next : primary('check','检查拼写',used.length < word.letters.length ? 'disabled' : '');
  } else {
    task = `<form class="task write" id="${prefix}-write"><label><span>${word.meaning}</span>
      <input name="answer" placeholder="输入英文" autocomplete="off" autocapitalize="none" spellcheck="false" required value="${escape(answer)}" ${checked ? 'readonly' : ''}></label></form>`;
    cta = checked ? finish :
      `<button class="primary" type="submit" form="${prefix}-write">检查拼写</button>`;
  }
  if (wordDone[index]) cta = finish;
  const flags = live ? wordFlags[word.word] || {} : model.flags || {};
  return `${topBar('五步学习', '返回开始页')}
    ${wordRail(index, !reveal, wordDone)}
    <section class="phase-nav" aria-label="当前单词的五步">
      <div class="switch-label"><b>当前词的步骤</b><span>${step + 1} / ${steps.length}</span></div>
      <div class="step-track" role="group" aria-label="选择学习步骤">${steps.map(([label],i) =>
        button('switch-step', label + (phaseDone[i] && i !== step ? '<span aria-hidden="true"> ✓</span>' : ''),
          `data-index="${i}" ${i === step ? 'aria-current="step"' : ''} aria-label="${label}${phaseDone[i] ? '，已完成' : ''}"`,
          phaseDone[i] ? 'past' : '')).join('')}</div>
    </section>
    <div class="phone-body">
      ${wordBar(word, reveal, live ? audioMessage : model.audioMessage)}
      <h4 class="task-title">${title}</h4>
      ${task}
      <p class="feedback ${result === 'wrong' ? 'wrong' : ''}" role="status">${checked ? '答对了' : result === 'wrong' ? '再试一次' : ''}</p>
    </div>
    <footer class="phone-footer"><div class="cta ${step ? 'cta-pair' : ''}">${step ? button('previous-step','上一步','','secondary') : ''}${cta}</div>${toolBar(flags)}</footer>`;
}

function listCard(rows) {
  return `<ul class="detail-list card">${rows.map(([main,desc]) => `<li><b lang="en">${main}</b><span>${desc}</span></li>`).join('')}</ul>`;
}

function detailView(model, word, prefix, live) {
  const tab = model.tab;
  const panels = [
    () => `<div class="accents">${['us','uk'].map(accent => {
      const label = accent === 'us' ? '美式发音' : '英式发音';
      return `<div class="accent-card">${soundButton(accent,label,'accent')}<span class="ipa">${word[accent]}</span></div>`;
    }).join('')}</div>
    <p class="sound-status" role="status">${live ? audioMessage : '可分别点播两个口音'}</p>
    ${word.senses.map(([type, senses]) => `<section class="card sense"><h4>${type}</h4><ol>${senses.map(([title,desc]) =>
      `<li><b>${title}</b><p>${desc}</p></li>`).join('')}</ol></section>`).join('')}`,
    () => listCard(word.forms),
    () => listCard(word.pairs),
    () => `<section class="card root"><span class="label">词基</span><h4 lang="en">${word.word}</h4><p>${word.base}</p></section>
      ${listCard(word.family.map(([parts, name, meaning]) => [name, parts + ' · ' + meaning]))}`,
    () => `<ul class="examples">${word.examples.map(([en,cn,meaning]) =>
      `<li class="card"><span class="label">${meaning}</span><b lang="en">${en}</b><p>${cn}</p></li>`).join('')}</ul>`
  ];
  return `${topBar('单词详解', '返回学习步骤')}
    <div class="detail-head"><strong lang="en">${word.word}</strong></div>
    <div class="detail-tabs" role="tablist" aria-label="单词详解分类">${detailTabs.map(([label],i) =>
      button('tab',label,`id="${prefix}-tab-${i}" data-index="${i}" role="tab" aria-controls="${prefix}-panel" aria-selected="${tab === i}" tabindex="${tab === i ? 0 : -1}"`)).join('')}</div>
    <div class="phone-body detail-body" id="${prefix}-panel" role="tabpanel" aria-labelledby="${prefix}-tab-${tab}">
      ${panels[tab]()}
    </div>`;
}

function phoneView(model, prefix, live = false) {
  const word = demoWords[model.index];
  let view;
  if (model.view === 'step') view = stepView(model, word, prefix, live);
  else if (model.view === 'detail') view = detailView(model, word, prefix, live);
  else if (model.view === 'done') view = `${topBar('学习小结')}<div class="phone-body landing">
    <div class="landing-mark">${icon('check')}</div><h4>本轮完成</h4><p>已走完 ${demoWords.length} 个单词的五步。</p></div>
    <footer class="phone-footer"><div class="cta">${primary('start','再体验一轮')}</div></footer>`;
  else view = `${topBar('五步学习法')}<div class="phone-body landing">
    <div class="landing-mark">${icon('book')}</div><h4>从听懂到写对</h4><p>按「学、读、练、拼、写」<br>完成 ${demoWords.length} 个单词。</p></div>
    <footer class="phone-footer"><div class="cta">${primary('start','开始体验')}</div></footer>`;
  return statusBar() + view;
}

function render({focus, preserveScroll = false} = {}) {
  const oldScroll = preserveScroll ? screen.querySelector('.phone-body')?.scrollTop || 0 : 0;
  const railScroll = screen.querySelector('.word-rail')?.scrollLeft || 0;
  const wordDone = progress.map(word => phaseComplete(word).every(Boolean));
  const model = {...state, ...currentStep(), wordDone, phaseDone:phaseComplete(progress[state.index])};
  screen.innerHTML = phoneView(model, 'demo', true);
  screen.querySelector('.phone-body').scrollTop = oldScroll;
  const rail = screen.querySelector('.word-rail');
  if (rail) {
    rail.scrollLeft = railScroll;
    const active = rail.querySelector('[aria-current="true"]');
    const bounds = rail.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.left < bounds.left || item.right > bounds.right) {
      rail.scrollLeft += item.left - bounds.left - (bounds.width - item.width) / 2;
    }
  }
  if (focus) screen.querySelector(focus)?.focus({preventScroll:true});
  const title = state.view === 'step' ? steps[state.step][1] : state.view === 'detail' ? detailTabs[state.tab][0] : state.view === 'done' ? '本轮完成' : '体验入口';
  note.textContent = '当前页面 · ' + title;
}

function setAudioMessage(text) {
  audioMessage = text;
  const node = screen.querySelector('.sound-status');
  if (node) node.textContent = text || '点扬声器重听';
}

function stopAudio() {
  audioRequest++;
  audio.pause();
  recordedPlayback?.pause();
  recordedPlayback = null;
  setAudioMessage('');
}

async function playWord(accent) {
  stopAudio();
  const request = audioRequest;
  const word = currentWord();
  const label = accent === 'us' ? '美式发音' : '英式发音';
  audio.src = 'audio/' + word.word + '-' + accent + '.mp3';
  setAudioMessage('正在播放' + label);
  audio.onended = () => {
    if (request === audioRequest) setAudioMessage('已播报 · 可重听');
  };
  try {
    await audio.play();
  } catch {
    if (request === audioRequest) setAudioMessage('请点扬声器重听');
  }
}

function clearRecording() {
  const request = mic;
  mic = null;
  if (request?.recorder?.state === 'recording') request.recorder.stop();
  request?.stream?.getTracks().forEach(track => track.stop());
  micMessage = '';
}

function releaseRecordings() {
  for (const word of progress) {
    for (const phase of word.steps) {
      if (phase.recording) URL.revokeObjectURL(phase.recording);
      phase.recording = '';
    }
  }
}

async function recordVoice() {
  if (mic?.recorder?.state === 'recording') {
    mic.recorder.stop();
    return;
  }
  if (mic) {
    mic = null;
    micMessage = '';
    render({focus:'[data-action="record"]',preserveScroll:true});
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    micMessage = '当前浏览器无法录音，可以直接跟读。';
    render({focus:'[data-action="record"]',preserveScroll:true});
    return;
  }
  stopAudio();
  clearRecording();
  const phase = currentStep();
  if (phase.recording) URL.revokeObjectURL(phase.recording);
  phase.recording = '';
  const request = {};
  mic = request;
  micMessage = '正在请求麦克风权限';
  render({focus:'[data-action="record"]',preserveScroll:true});
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    if (mic !== request) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    request.stream = stream;
    const recorder = new MediaRecorder(stream);
    request.recorder = recorder;
    const chunks = [];
    recorder.addEventListener('dataavailable', event => chunks.push(event.data));
    recorder.addEventListener('stop', () => {
      stream.getTracks().forEach(track => track.stop());
      if (mic !== request) return;
      mic = null;
      phase.recording = URL.createObjectURL(new Blob(chunks, {type:recorder.mimeType}));
      micMessage = '录音已完成';
      render({focus:'[data-action="replay-recording"]',preserveScroll:true});
    });
    recorder.start();
    micMessage = '正在录音';
  } catch {
    request.stream?.getTracks().forEach(track => track.stop());
    if (mic !== request) return;
    mic = null;
    micMessage = '未能开启麦克风，可以直接跟读。';
  }
  render({focus:'[data-action="record"]',preserveScroll:true});
}

function enterStep(step, index = state.index, focus = '.phone-nav h3') {
  stopAudio();
  clearRecording();
  Object.assign(state, {view:'step',index,step});
  progress[index].lastStep = step;
  currentStep().visited = true;
  render({focus});
  playWord('us');
}

function switchWord(index) {
  if (index === state.index || !progress[index]) return;
  enterStep(progress[index].lastStep, index, '[data-action="select-word"][aria-current="true"]');
}

function goBack() {
  stopAudio();
  if (state.view === 'detail') {
    state.view = 'step';
    render({focus:'[data-action="details"]'});
    return;
  }
  clearRecording();
  Object.assign(state, startState);
  render({focus:'[data-action="start"]'});
}

function changeTab(index) {
  stopAudio();
  state.tab = index;
  render({focus:`[data-action="tab"][data-index="${index}"]`});
}

function checkAnswer(correct) {
  currentStep().result = correct ? 'ok' : 'wrong';
  render({focus:correct ? '.cta button' : state.step === 4 ? '[name="answer"]' : undefined, preserveScroll:true});
}

screen.addEventListener('click', event => {
  const target = event.target.closest('button[data-action]');
  if (!target) return;
  const {action, index, accent} = target.dataset;
  const word = currentWord();
  const phase = currentStep();
  if (action === 'start') {
    releaseRecordings();
    progress = newProgress();
    enterStep(0,0);
  }
  else if (action === 'back') goBack();
  else if (action === 'select-word' || action === 'switch-word') switchWord(Number(index));
  else if (action === 'switch-step' && Number(index) !== state.step) {
    enterStep(Number(index), state.index, '[data-action="switch-step"][aria-current="step"]');
  }
  else if (action === 'previous-step') enterStep(state.step - 1);
  else if (action === 'next') enterStep(state.step + 1);
  else if (action === 'sound') playWord(accent);
  else if (action === 'record') recordVoice();
  else if (action === 'replay-recording') {
    stopAudio();
    recordedPlayback = new Audio(phase.recording);
    recordedPlayback.play().catch(() => {
      micMessage = '当前浏览器无法回听该录音。';
      render({preserveScroll:true});
    });
  } else if (action === 'favorite' || action === 'mastery') {
    const flags = wordFlags[word.word] || {};
    wordFlags[word.word] = {...flags, [action]:!flags[action]};
    try { localStorage.setItem(storageKey, JSON.stringify(wordFlags)); } catch {}
    render({focus:`[data-action="${action}"]`,preserveScroll:true});
  } else if (action === 'details') {
    stopAudio();
    if (mic) clearRecording();
    Object.assign(state, {view:'detail',tab:0});
    render({focus:'.phone-nav h3'});
  } else if (action === 'tab') changeTab(Number(index));
  else if (action === 'choose') {
    phase.choice = Number(index);
    phase.result = null;
    render({focus:`[data-action="choose"][data-index="${index}"]`,preserveScroll:true});
  } else if (action === 'letter' || action === 'remove-letter') {
    if (action === 'letter') phase.used.push(Number(index));
    else phase.used.splice(Number(index),1);
    phase.result = null;
    render({focus:'[data-action="letter"]:not(:disabled), .cta button:not(:disabled)',preserveScroll:true});
  } else if (action === 'check') {
    checkAnswer(state.step === 2 ? word.choices[phase.choice] === word.meaning :
      phase.used.map(i => word.letters[i]).join('') === word.word);
  } else if (action === 'complete') {
    const missing = phaseComplete(progress[state.index]).indexOf(false);
    const followingWord = nextUnfinishedWord(state.index,progress.map(word => phaseComplete(word).every(Boolean)));
    if (missing >= 0) enterStep(missing);
    else if (followingWord >= 0) switchWord(followingWord);
    else {
      stopAudio();
      state.view = 'done';
      render({focus:'.phone-nav h3'});
    }
  }
});
screen.addEventListener('input', event => {
  if (event.target.name === 'answer') currentStep().answer = event.target.value;
});
screen.addEventListener('submit', event => {
  event.preventDefault();
  checkAnswer(currentStep().answer.trim().toLowerCase() === currentWord().word);
});
screen.addEventListener('keydown', event => {
  if (!event.target.matches('[role="tab"]')) return;
  const tab = state.tab;
  const positions = {ArrowLeft:(tab + 4) % 5, ArrowRight:(tab + 1) % 5, Home:0, End:4};
  if (!Object.hasOwn(positions,event.key)) return;
  event.preventDefault();
  changeTab(positions[event.key]);
});
window.addEventListener('pagehide', () => { stopAudio(); clearRecording(); releaseRecordings(); });

function galleryCard(id, title, description, model, bullets) {
  return `<article class="spec-row gallery-row" id="${id}">
    <div class="phone" inert aria-label="${title}手机图"><div class="screen">${phoneView(model,id)}</div></div>
    <aside class="note"><span class="eyebrow">手机图 · ${id.split('-').at(-1)}</span><h3>${title}</h3><p>${description}</p>
      <ul>${bullets.map(text => `<li>${text}</li>`).join('')}</ul><a href="#demo">返回动态原型 ↑</a>
    </aside>
  </article>`;
}
const phaseNotes = [
  '本页显示英文、音标、本轮词义和一条例句。',
  '录音是可选操作。浏览器授权后可录音和回听。',
  '选项选中后才能确认。答错留在本页，可换选项重试。',
  '保留音标和重听入口。拼写通过前，词卡不显示英文答案。',
  '中文提供作答提示。写对后才出现「下一个词」或「完成本轮」。'
];
document.querySelector('#step-gallery').innerHTML =
  galleryCard('step-00','体验入口','点击开始后进入第一个词的「学」。',startState,['浏览器收到点击后即可播放音频。']) +
  galleryCard('navigation-01','选词与切步骤','示例停在第 2 个词的「拼」。',
    {...startState,view:'step',index:1,step:3,used:[2,3],wordDone:[true],phaseDone:[true,true,true,false,false],audioMessage:'已播报 · 可重听'},
    ['上排横滑点词，也可用两侧箭头切相邻词。勾号表示该词五步均完成。','下排可直接点任一步，底部「上一步」只退当前词的一步。','切回之前的词会恢复上次所在步骤和答案。拼、写时，当前词先显示序号。']) +
  steps.map(([name,title,description],step) => galleryCard(`step-0${step + 1}`,`${step + 1} · ${name} · ${title}`,description,
    {...startState,view:'step',step,phaseDone:steps.map((_,i) => i < step),audioMessage:'已播报 · 可重听',flags:step === 2 ? {favorite:true,mastery:true} : {}},
    [phaseNotes[step], '进入时自动播放美式发音，音标和三个单词入口固定在各步。'])).join('') +
  galleryCard('step-06','本轮完成','五个单词都完成五步后出现学习小结。',{...startState,view:'done'},['再次体验会从第一个词开始。收藏和掌握状态保存在当前浏览器。']);
document.querySelector('#detail-gallery').innerHTML = detailTabs.map(([label,title,description],tab) =>
  galleryCard(`detail-0${tab+1}`,`${tab+1} · ${label}`,title,{...startState,view:'detail',tab},
    [description,'顶部横向切换五个标签，左上返回原学习步骤。'])).join('');
document.querySelector('#step-links').innerHTML = steps.map(([label],step) =>
  `<a href="#step-0${step+1}">${label}</a>`).join('');
document.querySelector('#detail-links').innerHTML = detailTabs.map(([label],tab) =>
  `<a href="#detail-0${tab+1}">${label}</a>`).join('');
render();
