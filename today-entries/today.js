const variant = document.body.dataset.variant;
const whole = document.body.dataset.view === "whole";
  const COVER = "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 156">
      <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFEBCB"/><stop offset="1" stop-color="#E9944F"/></linearGradient></defs>
      <rect width="112" height="156" fill="url(#s)"/>
      <circle cx="86" cy="34" r="13" fill="#FFD27A" opacity=".9"/>
      <path d="M0 104 Q30 78 58 104 T112 98 V156 H0Z" fill="#DC8244"/>
      <path d="M0 124 Q34 104 64 124 T112 118 V156 H0Z" fill="#B9612C"/>
      <rect x="18" y="16" width="74" height="44" rx="7" fill="#FFFBF4" opacity=".96"/>
      <text x="55" y="36" font-size="17" font-weight="bold" fill="#8A4A18" text-anchor="middle" font-family="PingFang SC,sans-serif">英语</text>
      <text x="55" y="50" font-size="7.5" fill="#A9765A" text-anchor="middle" font-family="PingFang SC,sans-serif">五年级上册</text>
    </svg>`);

  const ROCKET = `<svg viewBox="0 0 24 24"><path d="M12 2.2c2.7 2.3 4.1 5.5 4.1 8.9 0 2-.5 3.9-1.5 5.5l-2.6 1.5-2.6-1.5A11.2 11.2 0 0 1 7.9 11c0-3.4 1.4-6.6 4.1-8.9z" fill="#fff" stroke="#FF6A2B" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9.3" r="2.2" fill="#FFD27A" stroke="#FF6A2B" stroke-width="1.2"/><path d="M7.9 14.2 5.4 17.9l3.4-1.3z" fill="#FF7A45"/><path d="M16.1 14.2l2.5 3.7-3.4-1.3z" fill="#FF7A45"/><path d="M12 18.6c1.1 1.3 1.5 2.8 0 4.2-1.5-1.4-1.1-2.9 0-4.2z" fill="#FFB020"/></svg>`;

  const PLAN_STATE = {
    p0:   { p:0,     v:0,   st:[0,0,0],      date:'预计 12/02' },
    p50:  { p:42.37, v:50,  st:[50,32,18],   date:'预计 11/28' },
    p100: { p:100,   v:118, st:[118,104,36], date:'已完成' }
  };
  const TOTAL_NEW = 5, TOTAL_REV = 3;

  const SCREENS = [
    { k:'s1', tag:'① 未开始',          plan:'p0',   ck:'none',   n:0, r:0, sub:'',     motion:'none' },
    { k:'s2', tag:'② 学到一半',        plan:'p50',  ck:'part',   n:2, r:0, sub:'还差 3 个词就打卡',         motion:'fill' },
    { k:'s3', tag:'③ 新学完成 · 打卡', plan:'p50',  ck:'done',   n:5, r:0, sub:'',  motion:'burst' },
    { k:'s4', tag:'④ 今天全部完成',    plan:'p50',  ck:'static', n:5, r:3, sub:'',     motion:'revfin' },
    { k:'s5', tag:'⑤ 计划已完成',        plan:'p100', ck:'static', n:5, r:3, sub:'本计划已完成',        motion:'sprint' }
  ];

  /* ---------- 学习计划 ---------- */
  const PLAN = (variant, pkey, dynamic, motion, custom, statsOverride) => {
    const d = statsOverride || PLAN_STATE[pkey];
    const finished = d.p >= 100;
    let pct = d.p, num = d.v, play = '';
    if (dynamic && motion === 'fill'){ pct = 0; num = 0; play = 'fill'; }
    if (dynamic && motion === 'sprint'){ pct = 42.37; num = 50; play = 'sprint'; }
    const isDone = finished && !play;
    const dateTxt = isDone ? '已完成' : custom ? '预计 '+custom.eta.replace(/ 月 /,'/').replace(/ 日/,'') : d.date;
    const st = (dynamic && motion === 'fill') ? [0, d.st[1], d.st[2]] : d.st;

    const barrow = `
      <div class="barrow">
        <div class="bar">
          <div class="fill" style="width:${pct}%" data-fill>
            <span class="inbar"><b data-count>${num}</b><i>词</i></span>
            <span class="streaks"><i></i><i></i><i></i></span>
          </div>
          <div class="gate"></div>
          <div class="rocket" style="left:${pct}%" data-rocket>${ROCKET}</div>
          <span class="ring"></span>
          <div class="burst" data-burst></div>
        </div>
        <div class="finish"><b data-finish>${dateTxt}</b></div>
      </div>`;

    const stats = (cls) => `
      <div class="${cls}">
        <div><b><span class="num" data-stat="0">${st[0]}</span>${cls === 'stats3' ? '<small>词</small>' : ''}</b><span>已学</span></div>
        <div><b><span class="num" data-stat="1">${st[1]}</span>${cls === 'stats3' ? '<small>词</small>' : ''}</b><span>已复习</span></div>
        <div><b><span class="num" data-stat="2">${st[2]}</span>${cls === 'stats3' ? '<small>词</small>' : ''}</b><span>已掌握</span></div>
      </div>`;

    return `<div class="planwrap">
      <div class="plan ${variant} ${isDone ? 'done' : ''}" ${play ? `data-play="${play}"` : ''}>
        <button type="button" class="ribbon" data-entry="textbook"><span>切换计划</span></button>
        <div class="top"><div class="ico">🗓️</div><h2>计划学习</h2></div>
        <div class="inner">
          <div class="book">
            <div class="cover"><img src="${custom ? COVER.replace(encodeURIComponent('五年级上册'),encodeURIComponent(customTitle(custom))) : COVER}" alt="封面"></div>
            <div class="bi">
              <button type="button" class="link" data-entry="progress">查看进度</button>
              <div class="txt">
                <h3>${custom ? customTitle(custom) : '五年级上册'}</h3>
                <div class="meta"><i>${custom?.book || '人教PEP版'}</i><em>·</em><b>${custom?unitRange(custom.units):'Unit 1–6'}</b><em>·</em>共 <b>${custom?.total ?? 118}</b> 词</div>
              </div>
              ${variant === 'a' ? stats('footrow') : barrow}
            </div>
          </div>
          ${variant === 'a' ? barrow : stats('stats3')}
        </div>
      </div>
    </div>`;
  };

  /* ---------- 今日打卡 ---------- */
  const CHECKIN = (ck, sub, dynamic, remaining, newPlanDays, firstDay = false, goal = TOTAL_NEW) => {
    const day = firstDay ? 1 : 12;
    const duration = newPlanDays || 25;
    let today = '';
    if (ck === 'none'){
      today = `<div class="halo static"></div><div class="halo a"></div><div class="halo b"></div>
               <div class="target"><div class="badge">未打卡</div></div><div class="tapdot"></div>`;
    } else if (ck === 'part'){
      today = `<div class="target"><div class="fill2" style="height:${goal ? (goal - remaining) / goal * 100 : 0}%"></div><div class="badge">还差 ${remaining} 词</div>
               <div class="feeddot"></div><div class="feeddot b"></div></div>`;
    } else if (ck === 'static'){
      today = `<div class="target"><div class="fill2"></div><div class="badge done">已打卡 ✓</div></div>`;
    } else {
      today = `<div class="target"><div class="fill2" style="${dynamic ? '' : 'height:100%'}"></div><div class="flash"></div>
               <div class="burstc"><i style="--bx:-8px;--by:-12px"></i><i style="--bx:7px;--by:-14px"></i><i style="--bx:-11px;--by:-2px"></i></div>
               <div class="badge done">已打卡 ✓</div></div>`;
    }
    const cls = ck === 'none' ? 'v-none' : (ck === 'part' ? 'v-half' : (ck === 'static' ? 'v-static' : 'v-done'));
    return `<div class="ck ${cls}" data-sub="${sub}">
      <div class="ck-head">
        <div class="ck-title"><div class="ck-ico">🔥</div><h2>学习打卡</h2></div>
        <button type="button" class="entry" data-entry="checkin">打卡记录</button>
      </div>
      <div class="sub">计划第 <b>${day}</b> / <b>${duration}</b> 天<em class="subem">${sub ? ' · '+sub : ''}</em></div>
      <div class="track">
        ${firstDay ? '' : `
        <div class="day past"><div class="c"><div class="bar2" style="height:62%"></div></div><div class="n">5</div></div>
        <div class="day miss"><div class="c"><div class="missbox">✕</div></div><div class="n">6</div></div>
        <div class="day past"><div class="c"><div class="bar2" style="height:100%"></div></div><div class="n">7</div></div>
        <div class="day past"><div class="c"><div class="bar2" style="height:74%"></div></div><div class="n">8</div></div>
        <div class="day past"><div class="c"><div class="bar2" style="height:62%"></div></div><div class="n">9</div></div>
        <div class="day past"><div class="c"><div class="bar2" style="height:88%"></div></div><div class="n">10</div></div>
        <div class="day past"><div class="c"><div class="bar2" style="height:74%"></div></div><div class="n">11</div></div>
        `}
        <div class="day today"><div class="c">${today}</div><div class="n">今天</div></div>
        <div class="day future"><div class="c"><div class="ghost"></div></div><div class="n">${day + 1 <= duration ? day + 1 : '–'}</div></div>
        <div class="day future"><div class="c"><div class="ghost"></div></div><div class="n">${day + 2 <= duration ? day + 2 : '–'}</div></div>
        <div class="day future"><div class="c"><div class="ghost"></div></div><div class="n">${day + 3 <= duration ? day + 3 : '–'}</div></div>
      </div>
    </div>`;
  };

  /* ---------- 今日任务（B · 一直动） ---------- */
  const TASK = (n, r, dynamic, motion, newGoal=TOTAL_NEW, reviewGoal=TOTAL_REV) => {
    const nLeft = newGoal - n, rLeft = reviewGoal - r;
    const newPri = nLeft > 0;
    const revPri = nLeft === 0 && rLeft > 0;
    const newGo = n === 0 ? '开始学' : '继续学';
    const revGo = r ? '继续复习' : '复习';
    const beat = dynamic && (newPri || revPri);
    const revfin = dynamic && motion === 'revfin';

    return `<div class="task ${beat ? 'beat' : ''} ${revfin ? 'revfin' : ''}">
      <div class="th">
        <div class="ti">📖</div><h2>今日任务</h2><div class="sp"></div>

      </div>
      <div class="rows">
        <div class="rw new">
          <span class="dot"></span>
          <div class="info">
            <div class="tt">新学词</div>
            <div class="pb"><i style="width:${newGoal ? n / newGoal * 100 : 0}%"></i></div>
          </div>
          <div class="num">${n}<span>/${newGoal}</span></div>
          ${newPri ? `<button type="button" class="go pri" data-entry="learn"><span class="gl">${newGo}</span></button>` : '<span class="go result">已完成</span>'}
        </div>
        <div class="rw rev">
          <span class="dot"></span>
          <div class="info">
            <div class="tt">复习词</div>
            <div class="pb"><i style="width:${reviewGoal ? r / reviewGoal * 100 : 0}%"></i></div>
          </div>
          <div class="num">${reviewGoal ? `${r}<span>/${reviewGoal}</span>` : '—'}</div>
          ${rLeft ? `<button type="button" class="go ${revPri ? 'mint' : 'ghost'}" data-entry="review"><span class="gl">${revGo}</span></button>` : `<span class="go result${reviewGoal ? '' : ' muted'}">${reviewGoal ? '已完成' : '无到期词'}</span>`}
        </div>
      </div>
    </div>`;
  };

  const TABS = `
    <nav class="tabs" aria-label="底部导航">
      <button type="button" class="tab active" data-prototype-tab="today" aria-current="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.6 12 3l9 7.6V21a1 1 0 0 1-1 1h-5.2v-6.6H9.2V22H4a1 1 0 0 1-1-1z"/></svg>今日</button>
      <button type="button" class="tab" data-prototype-tab="unit" ${whole ? '' : 'disabled'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z"/></svg>单元学</button>
      <button type="button" class="tab" data-prototype-tab="quiz" ${whole ? '' : 'disabled'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8.5 12 2.2 2.2L15.8 9"/></svg>小测</button>
      <button type="button" class="tab" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.4"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg>我的</button>
    </nav>`;

  const phone = (variant, sc, dynamic) => {
    const noanim = !dynamic;
    return `<section class="demo">
      ${whole ? '' : `<div class="tag"><b>${sc.tag}</b>${dynamic ? '<button type="button" class="replay" data-replay>↻ 重播</button>' : ''}</div>`}
      <div class="phone" data-screen="${sc.k}" data-dyn="${dynamic ? 1 : 0}"><div class="shell ${noanim ? 'noanim' : ''}">
        <div class="sbar"><span>9:41</span><div class="island"></div>
          <div style="display:flex;gap:3px;align-items:center">
            <svg width="10" height="7" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
            <svg width="15" height="7" viewBox="0 0 25 12" fill="none"><rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="15" height="8" rx="2" fill="currentColor"/></svg>
          </div>
        </div>
        <div class="scr">
          <div class="ptitle">今日</div>
          ${PLAN(variant, sc.plan, dynamic, sc.motion)}
          ${CHECKIN(sc.ck, sc.sub, dynamic, TOTAL_NEW - sc.n, null, sc.k === 's1')}
          ${TASK(sc.n, sc.r, dynamic, sc.motion, TOTAL_NEW, sc.k === 's1' ? 0 : TOTAL_REV)}
        </div>
        ${TABS}
      </div></div>
      ${whole && variant === 'b' ? '<button type="button" class="replay" data-replay>↻ 重播动效</button>' : ''}
    </section>`;
  };

  const block = (variant, dynamic, title, note) => `
    <section class="sec" id="${dynamic ? 'motion' : 'static'}">
      <div class="t"><b>${title}</b><em>${note}</em></div>
      <div class="grid">${SCREENS.map(sc => phone(variant, sc, dynamic)).join('')}</div>
    </section>`;

  document.getElementById('app').innerHTML = whole
    ? phone(variant, SCREENS[variant === 'a' ? 0 : 4], true)
    : block(variant, false, '静态 · 5 个学习进度', '静态终值')
      + block(variant, true, '动态 · 5 个学习进度', '进入视口播一次 · 点 ↻ 重播');

  /* ================= 动效驱动 ================= */
  const CURVE = [[0,0],[0.12,0.13],[0.38,0.47],[0.64,0.83],[0.85,0.965],[1,1]];
  const TANGENT = (function(){
    const n = CURVE.length, d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d[i] = (CURVE[i+1][1] - CURVE[i][1]) / (CURVE[i+1][0] - CURVE[i][0]);
    m[0] = d[0]; m[n-1] = d[n-2];
    for (let i = 1; i < n - 1; i++) m[i] = (d[i-1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++){
      if (d[i] === 0){ m[i] = 0; m[i+1] = 0; continue; }
      const a = m[i] / d[i], b = m[i+1] / d[i], h = a*a + b*b;
      if (h > 9){ const tau = 3 / Math.sqrt(h); m[i] = tau * a * d[i]; m[i+1] = tau * b * d[i]; }
    }
    return m;
  })();
  function ease(t){
    t = Math.min(1, Math.max(0, t));
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let i = 0;
    while (i < CURVE.length - 2 && t > CURVE[i+1][0]) i++;
    const [x0,y0] = CURVE[i], [x1,y1] = CURVE[i+1];
    const h = x1 - x0, s = (t - x0) / h;
    return (2*s*s*s - 3*s*s + 1) * y0 + (s*s*s - 2*s*s + s) * h * TANGENT[i]
         + (-2*s*s*s + 3*s*s) * y1 + (s*s*s - s*s) * h * TANGENT[i+1];
  }
  const COLORS = ['#FFB020','#FF7A45','#7FE3CD','#FF6A2B'];

  function makePlanPlayer(planEl){
    const q = s => planEl.querySelector(s);
    const fill = q('[data-fill]'), rocket = q('[data-rocket]'), fin = q('[data-finish]'), burst = q('[data-burst]');
    const counts = Array.from(planEl.querySelectorAll('[data-count]'));
    const stats = Array.from(planEl.querySelectorAll('[data-stat]'));
    const sprint = planEl.dataset.play === 'sprint';
    const P0 = sprint ? 50 : 0, P1 = sprint ? 118 : 50;
    const B0 = sprint ? 42.37 : 0, B1 = sprint ? 100 : 42.37;
    const DUR = sprint ? 2600 : 2400;
    const FINAL = sprint ? [118,104,36] : [50,32,18];

    if (burst && !burst.childElementCount){
      for (let i = 0; i < 12; i++){
        const a = (i / 12) * Math.PI * 2 + 0.4;
        const dd = 26 + (i % 3) * 11;
        const el = document.createElement('i');
        el.style.setProperty('--x', (Math.cos(a) * dd).toFixed(0) + 'px');
        el.style.setProperty('--y', (Math.sin(a) * dd * 0.9).toFixed(0) + 'px');
        el.style.background = COLORS[i % COLORS.length];
        el.style.animationDelay = ((i % 4) * 25) + 'ms';
        burst.appendChild(el);
      }
    }
    let raf = 0, t0 = 0, phase = 'idle';
    function setBar(p, v){
      fill.style.width = p.toFixed(2) + '%';
      if (rocket) rocket.style.left = p.toFixed(2) + '%';
      for (const n of counts) n.textContent = v;
      if (stats[0]) stats[0].textContent = v;
    }
    function reset(){
      planEl.classList.remove('done','hit','resetting');
      if (fin) fin.textContent = '预计 11/28';
      stats.forEach((el, i) => { if (i > 0) el.textContent = [50,32,18][i]; });
      setBar(B0, P0);
    }
    function done(){
      planEl.classList.add('done','hit');
      if (fin) fin.textContent = '已完成';
      stats.forEach((el, i) => { el.textContent = FINAL[i]; if (i > 0) el.classList.add('flip'); });
      setTimeout(() => planEl.classList.remove('hit'), 520);
    }
    function play(){
      cancelAnimationFrame(raf);
      reset();
      planEl.classList.add('running');
      phase = 'sprint'; t0 = performance.now();
      raf = requestAnimationFrame(tick);
    }
    function tick(now){
      if (phase !== 'sprint') return;
      const k = Math.min(1, (now - t0) / DUR);
      const e = ease(k);
      setBar(B0 + (B1 - B0) * e, Math.round(P0 + (P1 - P0) * e));
      if (k >= 1){
        setBar(B1, P1);
        planEl.classList.remove('running');
        if (sprint) done();
        else stats.forEach((el, i) => { if (i > 0) el.textContent = FINAL[i]; });
        phase = 'idle';
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    return play;
  }

  function playCheckin(ck){
    if (!ck.classList.contains('v-done')) return;
    const sub = ck.querySelector('.subem');
    const B = ck.dataset.sub || '今天学了 8 个词，很厉害';
    ck.classList.remove('playing');
    sub.textContent = '今天的格子填满了！';
    sub.classList.remove('swap');
    void ck.offsetWidth;
    ck.classList.add('playing');
    clearTimeout(ck._t);
    ck._t = setTimeout(() => {
      if (sub.textContent === '今天的格子填满了！'){
        sub.textContent = B;
        sub.classList.remove('swap'); void sub.offsetWidth; sub.classList.add('swap');
      }
    }, 2200);
  }

  function playTask(taskEl){
    if (!taskEl.classList.contains('revfin')) return;
    taskEl.classList.remove('revfin'); void taskEl.offsetWidth; taskEl.classList.add('revfin');
  }

  const phones = Array.from(document.querySelectorAll('.phone[data-dyn="1"]'));
  const plays = new Map();
  phones.forEach(ph => {
    let lastPlan, playPlan;
    const run = () => {
      const planEl = ph.querySelector('[data-play]');
      if (planEl !== lastPlan) {
        lastPlan = planEl;
        playPlan = planEl ? makePlanPlayer(planEl) : null;
      }
      playPlan?.();
      playCheckin(ph.querySelector('.ck'));
      playTask(ph.querySelector('.task'));
    };
    plays.set(ph, run);
  });

  document.querySelectorAll('[data-replay]').forEach(btn => {
    btn.addEventListener('click', () => {
      const demo = btn.closest('.demo');
      const ph = demo && demo.querySelector('.phone');
      const run = ph && plays.get(ph);
      if (run) run();
    });
  });

  if ('IntersectionObserver' in window){
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= .45 && !seen.has(e.target)){
          seen.add(e.target);
          const run = plays.get(e.target);
          if (run) run();
        }
      });
    }, { threshold: [.45] });
    phones.forEach(ph => io.observe(ph));
  } else {
    phones.forEach((ph, i) => setTimeout(() => plays.get(ph)(), 600 + i * 200));
  }
const DETAIL_STYLES = {"textbook": "\n  :root{--ink:#2B211C;--ink2:#7B6A5F;--ink3:#B3A298;--line:rgba(120,86,62,.10);--o:#F4621F;--odeep:#C0530F;--osoft:#FFF1E8;\n    --font:-apple-system,BlinkMacSystemFont,\"SF Pro Rounded\",\"PingFang SC\",\"Noto Sans SC\",Arial,sans-serif;}\n  *{box-sizing:border-box}\n  body{margin:0;font-family:var(--font);color:var(--ink);background:radial-gradient(700px 460px at 6% -8%,#F9EEE2,transparent 60%),#FBF8F4}\n  h1,p{margin:0}\n  .wrap{max-width:640px;margin:0 auto;padding:26px 18px 50px}\n  .kick{font-size:10px;font-weight:900;letter-spacing:1.8px;color:var(--odeep)}\n  h1{font-size:23px;letter-spacing:-.6px;margin:8px 0 6px}\n  .lead{font-size:12px;line-height:1.7;color:var(--ink2)}\n  .screen{width:394px;height:820px;margin:22px auto 0;border-radius:28px;overflow:hidden;position:relative;\n    background:linear-gradient(180deg,#FFF6EC,#FFF9F3 20%,#FFF9F3);\n    box-shadow:0 22px 48px rgba(150,110,70,.18),inset 0 0 0 1px rgba(150,110,70,.08);display:flex;flex-direction:column}\n  .sbar{height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:11px;font-weight:800}\n  .island{position:absolute;left:50%;top:6px;transform:translateX(-50%);width:78px;height:20px;border-radius:99px;background:#111}\n  .nav{display:flex;align-items:center;padding:6px 18px 0}\n  .nav .back{width:26px;height:26px;display:grid;place-items:center;font-size:17px;color:#6F5E52}\n  .nav h2{font-size:16px;font-weight:900;flex:1;text-align:center;padding-right:20px}\n  .body{padding:16px 18px 0}\n  .h{font-size:19px;font-weight:900;letter-spacing:-.4px}\n  .sub{font-size:11px;color:var(--ink3);font-weight:700;margin:3px 0 14px}\n  .row{display:flex;align-items:center;background:#fff;border-radius:14px;padding:13px 14px;margin-bottom:8px;\n    box-shadow:0 6px 16px rgba(150,110,70,.07);font-size:13px}\n  .row .k{font-weight:800;color:var(--ink2);width:64px;font-size:12px}\n  .row .v{font-weight:900}\n  .row .ch{margin-left:auto;color:#C9B9AE;font-weight:900}\n  .row .n{font-size:11px;color:var(--ink3);font-weight:800;margin-left:6px}\n  .sum{background:#fff;border-radius:16px;padding:14px;box-shadow:0 8px 20px rgba(150,110,70,.10);margin-top:6px}\n  .srow{display:flex;font-size:11.5px;font-weight:700;color:var(--ink2);padding:4px 0}\n  .srow b{margin-left:auto;color:var(--ink);font-weight:900}\n  .div{height:1px;background:#F6EDE5;margin:6px 0}\n  .est{display:flex;align-items:baseline;gap:6px}\n  .est b{font-size:26px;font-weight:900;color:var(--odeep);letter-spacing:-.8px}\n  .est span{font-size:11px;color:var(--ink3);font-weight:700}\n  .bottom{margin-top:auto;padding:12px 18px 20px}\n  .cta{height:50px;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;\n    background:linear-gradient(180deg,#FF8A4C,#F4621F);box-shadow:0 10px 22px rgba(244,98,31,.3)}\n  .hint{text-align:center;font-size:9.5px;color:#C0AC9A;font-weight:700;margin-top:8px}\n  .note{max-width:640px;margin:18px auto 0;background:#fff;border-radius:16px;padding:14px 18px 8px;box-shadow:0 8px 20px rgba(180,140,100,.08)}\n  .note .t{font-size:10.5px;font-weight:900;color:var(--odeep);margin-bottom:4px}\n  .note p{font-size:11px;line-height:1.75;color:var(--ink2);margin:6px 0}\n  .note b{color:var(--ink)}\nbody{background:#fff9f3}\n.screen{width:100%;height:auto;min-height:100dvh;border-radius:0;margin:0;box-shadow:none;overflow:visible}\nbutton{font:inherit;color:inherit;cursor:pointer;border:0;background:none}\nbutton:focus-visible,input:focus-visible{outline:2px solid #087f71;outline-offset:2px}\nbutton:disabled{cursor:default;opacity:.56}\n.detail-summary,.plan-heading,.picker-head{display:flex;align-items:center;justify-content:space-between;gap:8px}\n.detail-summary{padding:12px 16px 5px;font-size:15px}\n.minor{flex:none;color:var(--odeep);border-radius:99px;background:var(--osoft);padding:7px 9px;font-size:11px;font-weight:850}\n.picker{background:#fff;border:1px solid #f1decf;border-radius:14px;padding:10px;margin-bottom:8px}\n.picker-head{margin-bottom:7px}\n.choices,.actions{display:flex;gap:6px;flex-wrap:wrap}\n.choices:not(:empty){margin-top:6px}\n.choice{padding:7px 9px;border:1px solid #eeddd1;background:#fff9f4;color:#724b38;border-radius:8px;font-size:11px;font-weight:800}\n.choice[aria-pressed=true]{background:var(--osoft);border-color:#f4a881;color:var(--odeep)}\n.choice small{font-size:9px;color:#866f62}\n.custom-form{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px;font-size:11px}\n.custom-form input{width:70px;border:1px solid #e1c8b6;border-radius:7px;padding:6px}\n.plan-detail button.row,.plan-detail .cta{width:100%;text-align:left}\n.plan-detail .row .k{flex:none}\n.plan-detail .row .n{color:#826d61}\n.plan-detail .bottom{padding-bottom:14px}\n.plan-detail .sum b{font-variant-numeric:tabular-nums}\n.lookup-detail .tabsrow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding-inline:12px;overflow:visible}\n.lookup-detail .tab{min-height:38px;padding-inline:0;text-align:center;font-size:12px}\n.lookup-detail .units{gap:4px;overflow:visible;mask-image:none;-webkit-mask-image:none;padding-inline:14px}\n.lookup-detail .u{flex:1 1 0;min-width:0;min-height:38px;padding:4px 0;text-align:center;white-space:nowrap;font-size:11px;font-weight:850}\n.lookup-detail .card{flex:none;margin-bottom:14px}\n.lookup-detail .en{width:34%;overflow-wrap:anywhere}\n.lookup-detail .empty{padding:22px;text-align:center;color:#826d61;font-size:12px}\n.lookup-detail .st{color:#775f50}\n.record-detail .actions{padding:4px 12px 0}\n.record-detail .range-hint{font-size:10px;color:#775f50;text-align:center}\n.record-detail .ring{width:155px;height:155px;background:conic-gradient(var(--o) 0 var(--percent),#F1E4D8 var(--percent) 100%)}\n.record-detail .seg button{flex:1;text-align:center;font-size:11px;font-weight:900;color:#826d61;padding:6px 0;border-radius:99px}\n.record-detail .seg button.on{background:#fff;color:var(--ink);box-shadow:0 2px 6px rgba(150,110,70,.12)}\n.record-detail .list{flex:none;padding-bottom:12px}\n.record-detail button.star{padding:2px 4px;color:#89653e;font-size:18px}\n.record-detail button.star[aria-pressed=true]{color:#c7561e}\n\n.record-detail .weekday{font-size:8px;font-weight:800;color:#826d61}\n.record-detail .d.on .weekday{color:#fff}\n.record-detail .d.sel .weekday{color:var(--odeep)}\n", "progress": "*{box-sizing:border-box}body{margin:0;padding:14px;background:#FFF8F0;font:14px -apple-system,BlinkMacSystemFont,\"PingFang SC\",sans-serif}button:focus-visible,select:focus-visible{outline:2px solid #0C8270;outline-offset:2px}", "checkin": "\n  :root{--ink:#2B211C;--ink2:#7B6A5F;--ink3:#B3A298;--line:rgba(120,86,62,.10);\n    --o:#F4621F;--odeep:#C0530F;--osoft:#FFF1E8;--mint:#12A78F;\n    --font:-apple-system,BlinkMacSystemFont,\"SF Pro Rounded\",\"PingFang SC\",\"Noto Sans SC\",Arial,sans-serif;}\n  *{box-sizing:border-box}\n  body{margin:0;font-family:var(--font);color:var(--ink);\n    background:radial-gradient(700px 460px at 6% -8%,#F9EEE2 0%,transparent 60%),#FBF8F4}\n  h1,h2,p{margin:0}\n  .wrap{max-width:1260px;margin:0 auto;padding:28px 18px 60px}\n  .kick{font-size:10px;font-weight:900;letter-spacing:1.8px;color:var(--odeep)}\n  h1{font-size:24px;letter-spacing:-.6px;margin:8px 0 8px}\n  .lead{font-size:12px;line-height:1.7;color:var(--ink2);max-width:820px}\n  .lead b{color:var(--ink)}\n  .row{display:flex;gap:20px;justify-content:center;margin-top:22px;flex-wrap:wrap}\n  .item{width:390px}\n  .cap{font-size:10.5px;font-weight:900;color:var(--ink3);margin:0 0 8px 2px}\n  .cap b{color:var(--odeep)}\n\n  .screen{width:390px;height:812px;border-radius:28px;overflow:hidden;position:relative;\n    background:linear-gradient(180deg,#FFF6EC 0%,#FFF9F3 18%,#FFF9F3 100%);\n    box-shadow:0 22px 48px rgba(150,110,70,.18),inset 0 0 0 1px rgba(150,110,70,.08);\n    display:flex;flex-direction:column}\n  .sbar{height:32px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;font-size:10.5px;font-weight:800;flex:none}\n  .island{position:absolute;left:50%;top:6px;transform:translateX(-50%);width:74px;height:19px;border-radius:99px;background:#111}\n  .nav{flex:none;display:flex;align-items:center;padding:4px 16px 0}\n  .nav .back{width:24px;height:24px;display:grid;place-items:center;font-size:16px;color:#6F5E52}\n  .nav h2{font-size:15px;font-weight:900;flex:1;text-align:center;padding-right:18px}\n\n  .week{flex:none;display:flex;gap:4px;padding:10px 12px 8px;overflow:hidden}\n  .d{flex:1;background:#fff;border-radius:11px;padding:8px 2px 9px;text-align:center;border:1.5px solid transparent;box-shadow:0 3px 10px rgba(150,110,70,.06)}\n  .d .w{font-size:7.5px;font-weight:800;color:var(--ink3)}\n  .d .n{font-size:13px;font-weight:900;margin:1px 0 2px}\n  .d .f{font-size:11px;line-height:1}\n  .d.on{background:linear-gradient(180deg,#FF8A4C,#F4621F);border-color:#F4621F}\n  .d.on .w,.d.on .n{color:#fff}\n  .d.sel{background:#FFF1E8;border-color:#FFC9AE}\n  .d.sel .w,.d.sel .n{color:var(--odeep)}\n\n  .ringwrap{flex:none;display:flex;justify-content:center;padding:6px 0 2px}\n  .ring{width:190px;height:190px;border-radius:50%;position:relative;display:grid;place-items:center;\n    background:conic-gradient(var(--o) 0 38%, #F1E4D8 38% 100%);}\n  .ring::before{content:\"\";position:absolute;inset:9px;border-radius:50%;background:#FFFBF6}\n  .ring .in{position:relative;text-align:center}\n  .ring .big{font-size:30px;font-weight:900;letter-spacing:-1.4px;line-height:1}\n  .ring .u{font-size:11px;font-weight:900;color:var(--ink2)}\n  .ring .lb{font-size:9px;font-weight:800;color:var(--ink3);margin-top:3px}\n  .ring .mood{font-size:19px;line-height:1;margin-top:5px}\n\n  .seg{flex:none;display:flex;gap:4px;background:#F6F0E8;border-radius:99px;padding:3px;margin:8px 16px 8px}\n  .seg span{flex:1;text-align:center;font-size:11px;font-weight:900;color:#A2917F;padding:6px 0;border-radius:99px}\n  .seg span.on{background:#fff;color:var(--ink);box-shadow:0 2px 6px rgba(150,110,70,.12)}\n  .seg em{font-style:normal;font-size:9px;color:#C0AC9A;margin-left:3px}\n\n  .list{flex:1;min-height:0;overflow:hidden;padding:0 14px}\n  .w{display:flex;align-items:center;gap:8px;background:#fff;border-radius:13px;padding:11px 12px;margin-bottom:7px;\n    box-shadow:0 4px 12px rgba(150,110,70,.06)}\n  .w .dot{width:6px;height:6px;border-radius:50%;background:var(--o);flex:none}\n  .w.m .dot{background:var(--mint)}\n  .w .en{flex:1;min-width:0}\n  .w .t{font-size:15px;font-weight:900;letter-spacing:-.2px}\n  .w .c{font-size:10px;color:#7B6A5F;font-weight:600;margin-top:2px;line-height:1.35}\n  .w .star{font-size:14px;color:#D8C9BB;flex:none}\n  .empty{padding:18px 0;text-align:center;font-size:10px;color:var(--ink3);font-weight:700}\n\n  .note{max-width:1240px;margin:20px auto 0;background:#fff;border-radius:18px;padding:14px 20px 8px;box-shadow:0 8px 20px rgba(180,140,100,.08)}\n  .note .t{font-size:10.5px;font-weight:900;letter-spacing:.4px;color:var(--odeep);margin-bottom:5px}\n  .note table{width:100%;border-collapse:collapse}\n  .note td{font-size:11px;line-height:1.65;padding:6px 8px;border-bottom:1px solid #F6EDE5;vertical-align:top;color:var(--ink2)}\n  .note tr:last-child td{border-bottom:0}\n  .note td:first-child{width:90px;font-weight:900;color:var(--ink);white-space:nowrap}\n  .note b{color:var(--ink)}\nbody{background:#fff9f3}\n.screen{width:100%;height:auto;min-height:100dvh;border-radius:0;margin:0;box-shadow:none;overflow:visible}\nbutton{font:inherit;color:inherit;cursor:pointer;border:0;background:none}\nbutton:focus-visible,input:focus-visible{outline:2px solid #087f71;outline-offset:2px}\nbutton:disabled{cursor:default;opacity:.56}\n.detail-summary,.plan-heading,.picker-head{display:flex;align-items:center;justify-content:space-between;gap:8px}\n.detail-summary{padding:12px 16px 5px;font-size:15px}\n.minor{flex:none;color:var(--odeep);border-radius:99px;background:var(--osoft);padding:7px 9px;font-size:11px;font-weight:850}\n.picker{background:#fff;border:1px solid #f1decf;border-radius:14px;padding:10px;margin-bottom:8px}\n.picker-head{margin-bottom:7px}\n.choices,.actions{display:flex;gap:6px;flex-wrap:wrap}\n.choices:not(:empty){margin-top:6px}\n.choice{padding:7px 9px;border:1px solid #eeddd1;background:#fff9f4;color:#724b38;border-radius:8px;font-size:11px;font-weight:800}\n.choice[aria-pressed=true]{background:var(--osoft);border-color:#f4a881;color:var(--odeep)}\n.choice small{font-size:9px;color:#866f62}\n.custom-form{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px;font-size:11px}\n.custom-form input{width:70px;border:1px solid #e1c8b6;border-radius:7px;padding:6px}\n.plan-detail button.row,.plan-detail .cta{width:100%;text-align:left}\n.plan-detail .row .k{flex:none}\n.plan-detail .row .n{color:#826d61}\n.plan-detail .bottom{padding-bottom:14px}\n.plan-detail .sum b{font-variant-numeric:tabular-nums}\n.lookup-detail .tabsrow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding-inline:12px;overflow:visible}\n.lookup-detail .tab{min-height:38px;padding-inline:0;text-align:center;font-size:12px}\n.lookup-detail .units{gap:4px;overflow:visible;mask-image:none;-webkit-mask-image:none;padding-inline:14px}\n.lookup-detail .u{flex:1 1 0;min-width:0;min-height:38px;padding:4px 0;text-align:center;white-space:nowrap;font-size:11px;font-weight:850}\n.lookup-detail .card{flex:none;margin-bottom:14px}\n.lookup-detail .en{width:34%;overflow-wrap:anywhere}\n.lookup-detail .empty{padding:22px;text-align:center;color:#826d61;font-size:12px}\n.lookup-detail .st{color:#775f50}\n.record-detail .actions{padding:4px 12px 0}\n.record-detail .range-hint{font-size:10px;color:#775f50;text-align:center}\n.record-detail .ring{width:155px;height:155px;background:conic-gradient(var(--o) 0 var(--percent),#F1E4D8 var(--percent) 100%)}\n.record-detail .seg button{flex:1;text-align:center;font-size:11px;font-weight:900;color:#826d61;padding:6px 0;border-radius:99px}\n.record-detail .seg button.on{background:#fff;color:var(--ink);box-shadow:0 2px 6px rgba(150,110,70,.12)}\n.record-detail .list{flex:none;padding-bottom:12px}\n.record-detail button.star{padding:2px 4px;color:#89653e;font-size:18px}\n.record-detail button.star[aria-pressed=true]{color:#c7561e}\n\n.record-detail .weekday{font-size:8px;font-weight:800;color:#826d61}\n.record-detail .d.on .weekday{color:#fff}\n.record-detail .d.sel .weekday{color:var(--odeep)}\n\n.duration{display:flex;justify-content:space-between;align-items:center;padding:11px 12px;margin:8px 0 12px;border-radius:12px;background:#FFF;color:#5D4A3D;font-size:13px}.range-hint:empty{display:none}\n"};
function mountDetails(initial) {
  const root = document.getElementById('content');
  const {key,context,books,activeId} = initial;
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const send = (action,payload) => parent.postMessage({type:'wordclass-entry',action,payload},'*');
  const button = (attr,label,cls='',pressed) => `<button type="button" ${attr} class="${cls}"${pressed==null?'':` aria-pressed="${pressed}"`}>${label}</button>`;
  const focus = (selector) => root.querySelector(selector)?.focus({preventScroll:true});

  if (key === 'textbook') {
    const unitSizes = [20,18,22,24,18,16];
    const grades = ['三','四','五','六'];
    const example = {grade:'五',term:'上',book:'人教PEP版',units:[1,2,3,4],daily:10};
    let draft = context.custom ? {...context.custom,units:[...context.custom.units]} : {...example,units:[...context.units]};
    let pick = '', custom = false;
    const fields = [['grade','年级'],['term','学期'],['book','教材'],['units','单元范围'],['daily','每天练习']];
    const sizes = () => unitSizes.map((n,i) => n+(grades.indexOf(draft.grade)-2)*2+(draft.term==='下'?2:0)+(draft.book==='外研三起版'?1+(i%2):0));
    const total = () => draft.book ? draft.units.reduce((sum,u)=>sum+sizes()[u-1],0) : 0;
    const eta = () => draft.daily && total() ? Math.ceil(total()/draft.daily) : 0;
    const date = days => {
      const d = new Date(2026,10,9+days);
      return (d.getMonth()+1)+' 月 '+d.getDate()+' 日';
    };
    const range = u => !u.length ? '请选择' : u.length===1 ? 'Unit '+u[0] : u.every((n,i)=>n===u[0]+i) ? 'Unit '+u[0]+' – '+u.at(-1) : u.map(n=>'U'+n).join('、');
    const values = () => ({
      grade:[draft.grade+'年级',''],term:[draft.term ? draft.term+'册':'请选择',''],
      book:[draft.book || '请选择',draft.book?'6 单元':''],
      units:[range(draft.units),total() ? total()+' 词':''],
      daily:[draft.daily+' 词','约 '+Math.ceil(draft.daily*1.5)+' 分钟']
    });
    function panel() {
      if (!pick) return '';
      const name=fields.find(([k])=>k===pick)?.[1] || '已有计划';
      let choices='';
      if (pick==='saved') {
        choices=books.map(b=>button(`data-restore="${b.id}"`,esc(b.label)+(b.id===activeId?' · 当前':''),'choice')).join('');
      } else if (pick==='units') {
        choices=unitSizes.map((_,i)=>button(`data-unit="${i+1}"`,`Unit ${i+1} <small>${sizes()[i]} 词</small>`,'choice',draft.units.includes(i+1))).join('');
        choices=`<div class="actions">${button('data-all','全选','choice')}${button('data-clear','清空','choice')}</div><div class="choices">${choices}</div>`;
      } else {
        const items = pick==='grade'?grades:pick==='term'?['上','下']:pick==='book'?['人教PEP版','外研三起版']:[5,10,15,20];
        const recommended=total()<=50 ? 5 : total()<=100 ? 10 : total()<=150 ? 15 : 20;
        choices=items.map(v=>button(`data-value="${v}"`,pick==='daily'?v+' 词'+(v===recommended?' · 推荐':''):pick==='grade'?v+'年级':pick==='term'?v+'册':v,'choice',draft[pick]===v)).join('');
        if (pick==='daily') choices+=button('data-custom','自定义','choice',custom);
      }
      return `<section class="picker" role="region" aria-label="选择${name}"><div class="picker-head"><b>${name}</b>${button('data-dismiss','完成','minor')}</div><div class="choices">${choices}</div>
        ${pick==='daily'&&custom?'<form class="custom-form"><label for="daily-number">每日词数（最少 3 词）</label><input id="daily-number" name="daily" type="number" min="3" max="999" required inputmode="numeric"><button class="choice">应用</button></form>':''}</section>`;
    }
    function draw() {
      const v=values(), days=eta();
      root.innerHTML=`<div class="screen plan-detail">
        <div class="body"><div class="plan-heading"><div><div class="h">新建学习计划</div></div>${button('data-pick="saved"','已有计划','minor')}</div>
          ${fields.map(([field,name])=>`<button type="button" class="row" data-pick="${field}" aria-expanded="${pick === field}" ${field==='term'&&!draft.grade||field==='book'&&!draft.term||field==='units'&&!draft.book?'disabled':''}><span class="k">${name}</span><span class="v">${v[field][0]}</span><span class="n">${v[field][1]}</span><span class="ch" aria-hidden="true">⌄</span></button>`).join('')}
          ${panel()}
          <div class="sum" aria-live="polite"><div class="srow">总词数<b>${total()} 词</b></div><div class="srow">每天<b>${draft.daily} 词</b></div><div class="div"></div><div class="est"><b>${days || '—'}</b><span>天学完</span></div><div class="srow">预计完成<b>${days?date(days):'—'}</b></div></div>
        </div><div class="bottom"><button class="cta" data-generate ${days?'':'disabled'}>生成新计划</button><div class="hint">生成后今日页从第 1 天开始算</div></div></div>`;
    }
    root.addEventListener('click',e=>{
      const b=e.target.closest('button');
      if (!b) return;
      const ds=b.dataset;
      if (ds.restore) {send('restore',ds.restore);return;}
      if ('generate' in ds) {
        if (eta()) send('generate',{...draft,total:total(),days:eta(),eta:date(eta()),unitSizes:sizes()});
        return;
      }
      if (ds.pick) { pick=ds.pick;custom=false;draw();focus('.picker .choice');return; }
      if ('dismiss' in ds) {const field=pick;pick='';draw();focus(`[data-pick="${field}"]`);return;}
      if (ds.unit) {
        const u=+ds.unit;
        draft.units=draft.units.includes(u)?draft.units.filter(n=>n!==u):[...draft.units,u].sort((a,b)=>a-b);
        draw();focus(`[data-unit="${u}"]`);return;
      }
      if ('all' in ds || 'clear' in ds) { draft.units='all' in ds?[1,2,3,4,5,6]:[];draw();focus('all' in ds?'[data-all]':'[data-clear]');return; }
      if ('custom' in ds) {custom=true;draw();focus('#daily-number');return;}
      if (ds.value) {
        const field=pick, v=ds.value;
        if (field==='grade' && draft.grade!==v) draft={...draft,grade:v,term:'',book:'',units:[]};
        if (field==='term' && draft.term!==v) draft={...draft,term:v,book:'人教PEP版',units:[1,2,3,4,5,6]};
        if (field==='book' && draft.book!==v) draft={...draft,book:v,units:[1,2,3,4,5,6]};
        if (field==='daily') draft={...draft,daily:+v};
        pick='';draw();focus(`[data-pick="${field}"]`);
      }
    });
    root.addEventListener('submit',e=>{
      e.preventDefault();
      if (!e.target.reportValidity()) return;
      draft.daily=Number(new FormData(e.target).get('daily'));
      pick='';draw();focus('[data-pick="daily"]');
    });
    draw();
    return;
  }

  if (key === 'progress') {
    let filter = 0, unit = 0;
    function draw(selector) {
      root.innerHTML = wordRecordView({title:context.title, subtitle:context.bookName,
        scope:'计划内全部', units:context.units, words:context.words, filter, unit, playable:true});
      if (selector) focus(selector);
    }
    root.addEventListener('click', e => {
      const word = e.target.closest('.flow-sound');
      if (word) {
        speakRecordWord(word.querySelector('b').textContent,root.querySelector('.record-feedback'));
        return;
      }
      const button = e.target.closest('button[data-status]');
      if (!button) return;
      filter = Number(button.dataset.status);
      draw(`[data-status="${filter}"]`);
    });
    root.addEventListener('change', e => {
      if (e.target.dataset.action !== 'record-unit') return;
      unit = Number(e.target.value);
      draw('[data-action="record-unit"]');
    });
    draw();
    return;
  }

  const {days,newGoal,reviewGoal,words, favorites} = context;
  let start=days.length-1,end=start,anchor=null,mode='new',quick='',rangeMode='day';
  const starred=new Set(favorites);
  const last=days.length-1;
  const baseDate = new Date(2026,10,9);
  const dateAt = index => new Date(baseDate.getFullYear(),baseDate.getMonth(),baseDate.getDate()+index-last);
  const shortDate = d => (d.getMonth()+1)+'月'+d.getDate()+'日';
  const weekday = d => ['日','一','二','三','四','五','六'][d.getDay()];
  const wordById = new Map(words.map(w=>[w.en,w]));
  const aggregate = (range,kind) => {
    const counts=new Map();
    for (const day of range) for (const word of day[kind]) counts.set(word,(counts.get(word)||0)+1);
    return counts;
  };
  function draw(selector) {
    const range=days.slice(start,end+1), multi=end!==start, minutes=range.reduce((sum,d)=>sum+d.minutes,0);
    const buckets={new:aggregate(range,'new'),rev:aggregate(range,'rev')};
    const title=multi?`${shortDate(dateAt(start))}–${shortDate(dateAt(end))} · ${range.length} 天`:`${dateAt(start).getFullYear()}年${shortDate(dateAt(start))} 周${weekday(dateAt(start))}`;
    const goal=(kind)=>kind==='new'?newGoal:reviewGoal;
    const amount=kind=>start===last&&!multi&&goal(kind)?buckets[kind].size+'/'+goal(kind):String(buckets[kind].size);
    root.innerHTML=`<div class="screen record-detail">
      <div class="detail-summary"><b aria-live="polite">${title}</b></div>
      <div class="actions quick" role="group" aria-label="日期选择方式">${button('data-range="day"','单日','choice',rangeMode==='day')}${button('data-range="range"','日期范围','choice',rangeMode==='range')}</div>
      <div class="actions quick" aria-label="快捷时间范围">${[['week','最近 7 天'],['month','本月'],['all','全部']].map(([k,label])=>button(`data-quick="${k}"`,label,'choice',quick===k)).join('')}</div>
      <div class="week" aria-label="选择单日或起止日期">${days.slice(-7).map((_,i)=>{const index=Math.max(0,days.length-7)+i,d=dateAt(index),on=index>=start&&index<=end;return button(`data-day="${index}" aria-label="${shortDate(d)}"`,`<div class="weekday">周${weekday(d)}</div><div class="n">${d.getDate()}</div>`,'d '+(on?(multi?'sel':'on'):''),on);}).join('')}</div>
      <p class="range-hint" aria-live="polite">${rangeMode==='range' ? anchor==null?'选择起始日期':'已选 '+shortDate(dateAt(anchor))+'，请选择结束日期' : ''}</p>
      <div class="duration"><span>${multi?'累计学习时长':start===last?'今日学习时长':'学习时长'}</span><b>${minutes} 分钟</b></div>
      <div class="seg">${[['new','新学单词'],['rev','复习单词']].map(([k,label])=>button(`data-tab="${k}"`,label+`<em>${amount(k)}</em>`,mode===k?'on':'',mode===k)).join('')}</div>
      <div class="list">${buckets[mode].size?[...buckets[mode]].map(([id,n])=>{const w=wordById.get(id);return `<div class="w ${mode==='rev'?'m':''}"><span class="dot"></span><div class="en"><div class="t">${esc(id)}</div><div class="c">${esc(w?.cn||'')}${mode==='rev'&&n>1?' · 复习 '+n+' 次':''}</div></div>${button(`data-star="${esc(id)}" aria-label="${starred.has(id)?'取消收藏':'收藏'} ${esc(id)}"`,starred.has(id)?'★':'☆','star',starred.has(id))}</div>`;}).join(''):'<p class="empty">所选日期暂无该类单词</p>'}</div>
      </div>`;
    if(selector) focus(selector);
  }
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const d=b.dataset;
    if ('day' in d) {
      const day=+d.day;
      if(rangeMode==='day'){start=end=day;}else if(anchor==null){start=end=day;anchor=day;}else{start=Math.min(anchor,day);end=Math.max(anchor,day);anchor=null;}
      quick='';draw(`[data-day="${day}"]`);
    }
    if(d.range){rangeMode=d.range;anchor=null;quick='';end=start;draw(`[data-range="${rangeMode}"]`);return;}
    if(d.quick) {
      end=last;anchor=null;quick=d.quick;rangeMode='range';
      start=d.quick==='week'?Math.max(0,last-6):d.quick==='month'?Math.max(0,last-baseDate.getDate()+1):0;
      draw(`[data-quick="${quick}"]`);
    }
    if(d.tab){mode=d.tab;draw(`[data-tab="${mode}"]`);}
    if(d.star){
      if(starred.has(d.star))starred.delete(d.star);else starred.add(d.star);
      send('favorite',[...starred]);draw(`[data-star="${CSS.escape(d.star)}"]`);
    }
  });
  draw();
}

const WORD_GROUPS = [
  'player:运动员|him:他（宾格）|lovely:可爱的|clever:聪明的|young:年轻的|funny:滑稽的|kind:和蔼的|strict:严格的|quiet:安静的|polite:有礼貌的|helpful:有帮助的|hard-working:勤奋的|shy:害羞的|old:年老的|tall:高的|short:矮的|strong:强壮的|friendly:友好的|thin:瘦的|smart:聪明的',
  'science:科学|team:队伍|Monday:星期一|Tuesday:星期二|Wednesday:星期三|Thursday:星期四|Friday:星期五|Saturday:星期六|Sunday:星期日|weekend:周末|wash:洗|read:读|watch:观看|play:玩|often:经常|sometimes:有时|usually:通常|homework:家庭作业',
  'sandwich:三明治|salad:沙拉|hamburger:汉堡包|ice cream:冰激凌|tea:茶|fresh:新鲜的|healthy:健康的|delicious:美味的|hot:辣的|sweet:甜的|food:食物|drink:饮料|water:水|milk:牛奶|juice:果汁|rice:米饭|bread:面包|chicken:鸡肉|fish:鱼|vegetable:蔬菜|fruit:水果|favorite:最喜欢的',
  'sing:唱歌|song:歌曲|dance:跳舞|draw:画|cartoon:漫画|swim:游泳|cook:烹饪|basketball:篮球|football:足球|pipa:琵琶|kung fu:功夫|speak:说|English:英语|Chinese:中文|learn:学习|practice:练习|run:跑|jump:跳|walk:走|listen:听|write:写|open:打开|close:关闭|help:帮助',
  'clock:时钟|plant:植物|bottle:瓶子|bike:自行车|photo:照片|front:前面|behind:在……后面|beside:在……旁边|between:在……之间|above:在……上面|room:房间|bed:床|desk:书桌|chair:椅子|window:窗户|door:门|wall:墙|floor:地板',
  'forest:森林|river:河流|lake:湖泊|mountain:山|hill:小山|tree:树|bridge:桥|building:建筑物|village:村庄|house:房屋|park:公园|nature:自然|flower:花|grass:草|bird:鸟|cloud:云'
].map(group=>group.split('|').map(pair=>pair.split(':')));
const BASE_UNIT_SIZES = WORD_GROUPS.map(group=>group.length);
const EXTRAS = 'school:学校|garden:花园|apple:苹果|notebook:笔记本|computer:电脑|pencil:铅笔|friend:朋友|book:书|picture:图画|sun:太阳|moon:月亮|star:星星|morning:早晨|spring:春天|summer:夏天|winter:冬天|autumn:秋天|rain:雨|snow:雪|weather:天气|music:音乐|teacher:老师|student:学生|letter:字母|story:故事|map:地图|paper:纸|pen:钢笔|bag:包|box:盒子|train:火车|bus:公共汽车|plane:飞机|ship:船|road:道路|city:城市|shop:商店|market:市场|library:图书馆|classroom:教室|panda:熊猫|tiger:老虎'.split('|').map(pair=>pair.split(':'));
const savedPlans = new Map();
const activePlans = new Map();
const completedPractice = new Map();
let activePractice = null;
let savedFavorites = [];
const originalBook = {id:'original',label:'五年级上册 · 原计划'};
const unitRange = units => units.length===1?'Unit '+units[0]:units.every((n,i)=>n===units[0]+i)?'Unit '+units[0]+'–'+units.at(-1):units.map(n=>'U'+n).join('、');
const customTitle = p => p.grade+'年级'+p.term+'册';
const routeId = route => route.mode+':'+route.state;

function lookupWords(state, custom) {
  const sizes = custom?.unitSizes || BASE_UNIT_SIZES;
  const allowed=custom?.units || [1,2,3,4,5,6];
  const partial = state.plan==='p50' && !custom;
  const completed = state.plan==='p100' && !custom;
  const learned=[18,14,10,8,0,0], reviewed=[12,9,7,4,0,0], mastered=[6,4,4,4,0,0];
  const finalReviewed=[18,16,20,22,16,12], finalMastered=[6,7,7,6,5,5];
  let nextExtra=0;
  return allowed.flatMap(unit=>{
    const group = WORD_GROUPS[unit-1], i=unit-1;
    return Array.from({length:sizes[i]},(_,idx)=>{
      const [en,cn]=group[idx]||EXTRAS[nextExtra++];
      const m=partial?mastered[i]:completed?finalMastered[i]:0;
      const r=partial?reviewed[i]:completed?finalReviewed[i]:0;
      const l=partial?learned[i]:completed?sizes[i]:0;
      return {id:unit+':'+idx,en,cn,unit,status:idx<m?3:idx<r?2:idx<l?1:0};
    });
  });
}
function recordDays(state, custom) {
  const today={minutes:state.n||state.r?state.n===2?18:state.r?24:19:0,new:['player','him','lovely','clever','kind'].slice(0,state.n),rev:['young','science','funny'].slice(0,state.r)};
  if (custom || state.k === 's1') return [{minutes:0,new:[],rev:[]}];
  const days=Array.from({length:12},()=>({minutes:0,new:[],rev:[]}));
  days[0]={minutes:12,new:['food','salad'],rev:['young']};
  days[5]={minutes:9,new:['water'],rev:['funny']};
  days[9]={minutes:state.n===2?19:16,new:['team','clever','quiet','polite','old'],rev:['young','funny','helpful','team','old']};
  days[10]={minutes:state.n===2?15:12,new:['him','lovely','young','school','strong'],rev:['young','science','wash','read','play']};
  days[11]=today;
  return days;
}
function planModel(state, route) {
  const activeId = activePlans.get(routeId(route)) || 'original';
  const custom = savedPlans.get(activeId);
  const practiceId = routeId(route) + ':' + activeId;
  if (!completedPractice.has(practiceId)) completedPractice.set(practiceId, {learn:[],review:[]});
  const completed = completedPractice.get(practiceId);
  const baseWords = lookupWords(state,custom);
  const words = baseWords.map(word => ({
    ...word,
    status:Math.max(word.status, completed.review.includes(word.id) ? 2 : completed.learn.includes(word.id) ? 1 : 0)
  }));
  const baseNew = custom ? 0 : state.n, baseReview = custom ? 0 : state.r;
  const newPool = baseWords.filter(word => word.status === 0 && !completed.learn.includes(word.id));
  const reviewPool = baseWords.filter(word => word.status > 0 && !completed.review.includes(word.id));
  const newGoal = Math.min(custom?.daily ?? TOTAL_NEW, baseNew + completed.learn.length + newPool.length);
  const reviewGoal = custom || state.k === 's1' ? 0 : Math.min(TOTAL_REV,baseReview + completed.review.length + reviewPool.length);
  const n = baseNew + completed.learn.length, r = baseReview + completed.review.length;
  const days = recordDays(state,custom);
  const today = days.at(-1);
  for (const [mode,key] of [['learn','new'],['review','rev']]) {
    const done = new Set(completed[mode]);
    today[key].push(...words.filter(word => done.has(word.id)).map(word => word.en));
  }
  today.minutes += Math.round((completed.learn.length + completed.review.length) * 1.5);
  return {activeId,custom,completed,words,days,newGoal,reviewGoal,n,r,
    queues:{learn:newPool.slice(0,newGoal-n),review:reviewPool.slice(0,reviewGoal-r)}};
}

const unitModule = new URL('/yibei-plan-progress/',location.origin);
function renderEntry(body,key,state,route) {
  const model = planModel(state,route);
  const {activeId,custom,words} = model;
  const frame = document.createElement('iframe');
  frame.title = entryTitles[key];
  frame.className = 'embedded-entry';
  if (key === 'learn' || key === 'review') {
    const entries = model.queues[key];
    activePractice = {frame,entries,model,key,route,state,index:0};
    const url = new URL(unitModule);
    url.search = new URLSearchParams({embed:'1',practice:key});
    frame.allow = 'microphone';
    frame.src = url.href;
    frame.addEventListener('load', () => {
      frame.contentWindow.postMessage({type:'wordclass-plan-start',entries,vocabulary:words},location.origin);
    }, {once:true});
    body.replaceChildren(frame);
    return;
  }

  const context = {custom,title:custom ? customTitle(custom) : '五年级上册',
    bookName:custom?.book || '人教 PEP 版',units:custom?.units || [1,2,3,4,5,6],words};
  if (key === 'checkin') Object.assign(context,{days:model.days,newGoal:model.newGoal,reviewGoal:model.reviewGoal,
    words:[...words,...EXTRAS.map(([en,cn])=>({en,cn}))],favorites:savedFavorites});
  const config = {key,context,books:[originalBook,...Array.from(savedPlans,([id,p])=>({
    id,label:customTitle(p)+' · '+p.book+' · '+unitRange(p.units)+' · 每天 '+p.daily+' 词'
  }))],activeId};
  frame.setAttribute('sandbox','allow-scripts allow-forms');
  const serialize = value => JSON.stringify(value).replaceAll('<','\\u003c');
  const recordAssets = key === 'progress' ? `<link rel="stylesheet" href="${new URL('record-view.css?v=1',unitModule)}"><script src="${new URL('record-view.js?v=1',unitModule)}"></script>` : '';
  frame.srcdoc = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<style>'+DETAIL_STYLES[key]+'</style>'+recordAssets+'<body><main id="content"></main><script>('+mountDetails.toString()+')('+serialize(config)+');</script></body></html>';
  body.replaceChildren(frame);
}

function drawToday(state,route) {
  const dynamic = route.mode === 'motion';
  const ph = document.querySelector(`[data-screen="${route.state}"][data-dyn="${dynamic ? 1 : 0}"]`);
  const target = ph?.querySelector('.scr');
  if (!target) return;
  const {custom,completed,words,n,r,newGoal,reviewGoal} = planModel(state,route);
  const touched = Boolean(custom || completed.learn.length || completed.review.length);
  const learned = words.filter(word => word.status >= 1).length;
  const stats = [learned,words.filter(word => word.status >= 2).length,words.filter(word => word.status === 3).length];
  const view = {v:learned,p:words.length ? learned/words.length*100 : 0,st:stats,date:learned === words.length ? '已完成' : PLAN_STATE[state.plan].date};
  const checked = newGoal > 0 && n >= newGoal;
  const checkin = touched ? checked ? 'static' : n ? 'part' : 'none' : state.ck;
  const copy = touched ? '' : state.sub;
  const motion = touched ? 'none' : state.motion;
  const fresh = document.createElement('div');
  fresh.innerHTML = PLAN(variant,state.plan,dynamic,motion,custom,touched ? view : null) +
    CHECKIN(checkin,copy,dynamic,newGoal-n,custom?.days,Boolean(custom || state.k === 's1'),newGoal) +
    TASK(n,r,dynamic,motion,newGoal,reviewGoal);
  target.querySelectorAll('.planwrap,.ck,.task').forEach(node=>node.replaceWith(fresh.firstElementChild));
  if (opener?.dataset.entry) {
    opener = target.querySelector(`[data-entry="${opener.dataset.entry}"]`) || target.querySelector('[data-entry="progress"]');
  }
}

function applyPlan(route,id) {
  activePlans.set(routeId(route),id);
  const state = SCREENS.find(item=>item.k === route.state);
  drawToday(state,route);
  if (route.mode === 'motion') {
    const phone = document.querySelector(`[data-screen="${route.state}"][data-dyn="1"]`);
    plays.get(phone)?.();
  }
}

window.addEventListener('message', event => {
  const frame = entryBody.querySelector('iframe');
  const route = readRoute();
  const msg = event.data;
  if (!route || !entryDialog.open || !frame || event.source !== frame.contentWindow) return;
  if (activePractice?.frame === frame && event.origin === location.origin) {
    const session = activePractice;
    if (msg?.type === 'wordclass-plan-back') goBack();
    if (msg?.type !== 'wordclass-plan-word' || msg.index !== session.index || !session.entries[session.index]) return;
    session.model.completed[session.key].push(session.entries[session.index++].id);
    drawToday(session.state,session.route);
    return;
  }
  if (msg?.type !== 'wordclass-entry') return;
  if (route.key === 'checkin' && msg.action === 'favorite' && Array.isArray(msg.payload)) {
    savedFavorites = msg.payload.filter(item => typeof item === 'string');
    return;
  }
  if (route.key !== 'textbook') return;
  if (msg.action === 'generate') {
    const id = 'plan-' + (savedPlans.size + 1);
    savedPlans.set(id,msg.payload);
    applyPlan(route,id);
    goBack();
  } else if (msg.action === 'restore' && (msg.payload === 'original' || savedPlans.has(msg.payload))) {
    applyPlan(route,msg.payload);
    goBack();
  }
});

const entryTitles = {textbook:'切换计划',progress:'计划进度',checkin:'打卡记录',learn:'今日学词',review:'今日复习'};
const entryDialog = document.getElementById('entry-dialog');
const entryBody = document.getElementById('entry-body');
const entryTitle = document.getElementById('entry-title');
const closeEntryButton = document.getElementById('entry-back');
let opener = null;
let activeEntry = null;
let closing = false;

function readRoute() {
  const [key, state, mode] = location.hash.slice(1).split('/');
  return Object.hasOwn(entryTitles,key) && SCREENS.some(s=>s.k===state) && /^(static|motion)$/.test(mode)
    ? {key,state,mode} : null;
}
function showEntryRoute() {
  const route = readRoute();
  if (!route) {
    if (entryDialog.open) {
      activePractice = null;
      entryBody.replaceChildren();
      closing = true;
      entryDialog.close();
      closing = false;
      opener?.focus({preventScroll:true});
    }
    activeEntry = null;
    return;
  }
  const routeKey = location.hash;
  if (routeKey === activeEntry) return;
  activeEntry = routeKey;
  activePractice = null;
  const state = SCREENS.find(item=>item.k===route.state);
  entryTitle.textContent = entryTitles[route.key];
  renderEntry(entryBody, route.key, state, route);
  if (!entryDialog.open) entryDialog.showModal();
  closeEntryButton.focus({preventScroll:true});
}
function goBack() {
  if (history.state?.wordclassEntry) history.back();
  else {
    history.replaceState(null,'',location.pathname+location.search);
    showEntryRoute();
  }
}
document.addEventListener('click',event=>{
  const trigger = event.target.closest('[data-entry]');
  if (!trigger) return;
  const phone = trigger.closest('.phone');
  opener = trigger;
  const mode = phone.dataset.dyn === '1' ? 'motion' : 'static';
  const path = [trigger.dataset.entry,phone.dataset.screen,mode].join('/');
  history.pushState({wordclassEntry:true},'', '#'+path);
  showEntryRoute();
});
closeEntryButton.addEventListener('click', goBack);
entryDialog.addEventListener('cancel', event=>{event.preventDefault();goBack();});
entryDialog.addEventListener('close',()=>{if (!closing && readRoute()) goBack();});
window.addEventListener('popstate',showEntryRoute);
window.addEventListener('hashchange',showEntryRoute);
function openTodayHome() {
  if (location.hash || history.state?.wordclassEntry) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  showEntryRoute();
}
if (whole) {
  openTodayHome();
  window.addEventListener('pageshow', event => { if (event.persisted) openTodayHome(); });
} else {
  showEntryRoute();
}
