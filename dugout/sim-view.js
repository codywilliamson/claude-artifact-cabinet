// game tab: scoreboard, clock, animated at-bats and the play-by-play log
(() => {
  const $ = (id) => document.getElementById(id);
  const { store, sim } = DG;
  const prefs = store.state.prefs;
  const SPEEDS = [1, 2, 4];
  const BETWEEN_MS = 800;
  const MAX_DT = 50;
  const CONFIRM_MS = 3000;
  const IDLE_PLAY = { id: 'idle', start: {}, steps: [{ d: 1, say: 'Tap play to start the game. Change teams and rules in Game setup.' }] };
  const BASE_NAMES = ['FIRST', 'SECOND', 'THIRD'];

  store.state.gameSettings = { ...sim.defaults(), ...store.state.gameSettings };
  store.state.game ||= sim.newGame(store.state.gameSettings);
  prefs.gameSpeed ||= 1;
  prefs.gameHold ??= false;
  let g = store.state.game;

  const field = new DG.Field($('g-field'), () => {});
  let tl;
  let cur = null;
  let T = 0;
  let playing = false;
  let replaying = false;
  let lastFrame = 0;
  let lastI = -1;
  let waitTimer;
  let armed;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const outsDots = (n) => `<span class="outs" aria-label="${n} outs">${[0, 1].map((o) => `<i class="${o < n ? 'on' : ''}"></i>`).join('')}</span>`;

  function renderBoard() {
    const n = Math.max(g.settings.innings, g.line.away.length, g.line.home.length);
    const cols = Array.from({ length: n }, (_, i) => i);
    const row = (side) => {
      const cells = cols.map((i) => {
        const now = !g.over && g.inning === i + 1 && (g.half === 'top') === (side === 'away');
        return `<td class="${now ? 'now' : ''}">${g.line[side][i] ?? ''}</td>`;
      }).join('');
      return `<tr class="${sim.isUs(g, side) ? 'us' : ''}"><th scope="row">${esc(sim.teamName(g, side))}</th>${cells}<td class="tot">${sim.total(g, side)}</td><td>${g.hits[side]}</td><td>${g.errors[side]}</td></tr>`;
    };
    $('g-board').innerHTML = `<thead><tr><th scope="col"><span class="sr">Team</span></th>${cols.map((i) => `<th scope="col">${i + 1}</th>`).join('')}<th class="tot" scope="col">R</th><th scope="col">H</th><th scope="col">E</th></tr></thead><tbody>${row('away')}${row('home')}</tbody>`;
  }

  function renderStatus() {
    const runners = BASE_NAMES.filter((_, i) => g.bases[i]);
    $('g-sit').innerHTML = `${DG.diamondSvg(runners)}<span>${g.over ? esc(g.result) : sim.halfText(g.inning, g.half)}</span>${g.over ? '' : outsDots(g.outs)}`;
    const limit = g.settings.timeLimit;
    $('g-clock').textContent = limit ? `${sim.clockText(g.clock)} / ${sim.clockText(limit)}` : sim.clockText(g.clock);
    $('g-clock-bar').style.width = limit ? `${Math.min(100, (g.clock / limit) * 100)}%` : '0%';
    $('g-clock-bar').classList.toggle('late', !!limit && g.clock >= limit);
    const runLimit = g.settings.runLimit;
    $('g-limit').innerHTML = runLimit && !g.over
      ? `<span>Runs this half</span>${Array.from({ length: runLimit }, (_, i) => `<i class="${i < g.halfRuns ? 'on' : ''}"></i>`).join('')}`
      : '';
  }

  function renderLog() {
    const items = [];
    let lastHalf = null;
    for (const e of [...g.log].reverse()) {
      const key = `${e.inning}${e.half}`;
      if (key !== lastHalf) {
        lastHalf = key;
        const head = document.createElement('li');
        head.className = 'gl-head';
        head.textContent = `${sim.halfText(e.inning, e.half)} · ${sim.teamName(g, e.side)} batting`;
        items.push(head);
      }
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.className = `gl-item${e === cur ? ' current' : ''}${sim.isUs(g, e.side) ? ' us' : ''}`;
      b.innerHTML = `<span class="gl-who">${esc(e.batter)}</span><span class="gl-what">${esc(e.label)}</span>${e.runs ? `<span class="gl-runs">+${e.runs}</span>` : ''}${outsDots(Math.min(e.outs, 2))}${e.endHalf ? `<span class="gl-end">${esc(e.endHalf)}, switch sides</span>` : ''}`;
      b.setAttribute('aria-label', `Replay: ${e.batter}, ${e.label}`);
      b.addEventListener('click', () => replay(e));
      li.append(b);
      items.push(li);
    }
    $('g-log').replaceChildren(...items);
    $('g-count').textContent = g.log.length ? `${g.log.length} at-bats` : '';
  }

  function renderAll() {
    renderBoard();
    renderStatus();
    renderLog();
    const f = $('g-final');
    f.hidden = !g.over;
    if (g.over) {
      $('g-final-reason').textContent = g.endReason;
      $('g-final-score').textContent = g.result;
    }
  }

  function draw() {
    const fr = DG.frameAt(tl, T);
    field.draw(fr);
    if (fr.i === lastI) return;
    lastI = fr.i;
    const p = $('g-say');
    p.replaceChildren();
    if (cur) p.append(Object.assign(document.createElement('b'), { textContent: `${cur.batter}: ` }));
    p.append(fr.step.say);
    p.classList.remove('swap');
    void p.offsetWidth;
    p.classList.add('swap');
  }

  function load(entry, atEnd = false) {
    cur = entry;
    tl = DG.compile(entry ? entry.play : IDLE_PLAY);
    field.load(tl);
    T = atEnd ? tl.total : 0;
    lastI = -1;
    $('g-ab').textContent = entry ? `${entry.half === 'top' ? 'T' : 'B'}${entry.inning}` : 'AB';
    const ref = entry?.ref && DG.plays.find((p) => p.id === entry.ref);
    $('g-learn').hidden = !ref;
    if (ref) $('g-learn').textContent = `Learn this play: ${ref.title}`;
    draw();
    for (const b of document.querySelectorAll('.gl-item')) b.classList.remove('current');
  }

  function setPlaying(on) {
    playing = on;
    $('g-play').querySelector('use').setAttribute('href', on ? '#i-pause' : '#i-play');
    $('g-play').setAttribute('aria-label', on ? 'Pause' : 'Play');
    $('g-play').classList.toggle('nudge', !on && !g.over);
  }

  function tick(now) {
    if (!playing) return;
    const dt = Math.min(MAX_DT, now - lastFrame);
    lastFrame = now;
    const next = Math.min(tl.total, T + dt * prefs.gameSpeed);
    if (prefs.sound) for (const e of DG.events(tl, T, next)) DG.sfx.play(e);
    T = next;
    draw();
    if (T >= tl.total) return finished();
    requestAnimationFrame(tick);
  }

  function start() {
    if (prefs.sound) DG.sfx.unlock();
    lastFrame = performance.now();
    setPlaying(true);
    requestAnimationFrame(tick);
  }

  // the board catches up once the at-bat has played out, so it never spoils the result
  function finished() {
    if (!replaying) renderAll();
    if (replaying || g.over || prefs.gameHold) {
      replaying = false;
      setPlaying(false);
      return;
    }
    waitTimer = setTimeout(() => playing && nextAtBat(), BETWEEN_MS / prefs.gameSpeed);
  }

  function nextAtBat() {
    clearTimeout(waitTimer);
    replaying = false;
    renderAll();
    const entry = sim.next(g);
    if (!entry) return;
    store.save();
    load(entry);
    start();
  }

  function replay(entry) {
    clearTimeout(waitTimer);
    replaying = true;
    load(entry);
    renderLog();
    start();
    $('g-field').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function pause() {
    clearTimeout(waitTimer);
    setPlaying(false);
  }

  function newGame() {
    pause();
    g = store.state.game = sim.newGame(store.state.gameSettings);
    store.save();
    load(null);
    renderAll();
    setPlaying(false);
  }

  // setup form
  const FIELDS = {
    'gs-us': ['us', String], 'gs-them': ['them', String], 'gs-innings': ['innings', Number], 'gs-limit': ['runLimit', Number],
    'gs-time': ['timeLimit', Number], 'gs-us-level': ['usLevel', String], 'gs-them-level': ['themLevel', String], 'gs-roster': ['roster', String],
  };
  const fillForm = () => {
    const s = store.state.gameSettings;
    for (const [id, [key]] of Object.entries(FIELDS)) $(id).value = s[key];
    $('gs-home').value = s.usHome ? 'home' : 'away';
  };
  const readForm = () => {
    const s = store.state.gameSettings;
    for (const [id, [key, cast]] of Object.entries(FIELDS)) s[key] = cast($(id).value);
    s.us = s.us.trim() || 'Us';
    s.them = s.them.trim() || 'Them';
    s.usHome = $('gs-home').value === 'home';
    store.save();
  };
  const disarm = () => {
    clearTimeout(armed);
    armed = null;
    $('gs-start').textContent = 'Start new game';
    $('gs-start').classList.remove('armed');
  };

  $('g-form').addEventListener('change', readForm);
  $('g-form').addEventListener('submit', (e) => {
    e.preventDefault();
    readForm();
    if (g.log.length && !g.over && !armed) {
      $('gs-start').textContent = 'Tap again to end this game';
      $('gs-start').classList.add('armed');
      armed = setTimeout(disarm, CONFIRM_MS);
      return;
    }
    disarm();
    $('g-setup').open = false;
    newGame();
  });

  $('g-play').addEventListener('click', () => {
    if (playing) return pause();
    if (cur && T < tl.total) return start();
    if (!g.over) nextAtBat();
  });
  $('g-next').addEventListener('click', () => !g.over && nextAtBat());
  $('g-replay').addEventListener('click', () => cur && replay(cur));
  $('g-final-new').addEventListener('click', newGame);
  $('g-learn').addEventListener('click', () => { pause(); DG.openPlay(cur.ref); });
  $('g-skip').addEventListener('click', () => {
    pause();
    const last = sim.simToEnd(g);
    store.save();
    if (last) load(last, true);
    renderAll();
  });

  const bindToggle = (id, key) => {
    const b = $(id);
    b.setAttribute('aria-pressed', !!prefs[key]);
    b.addEventListener('click', () => {
      prefs[key] = !prefs[key];
      b.setAttribute('aria-pressed', prefs[key]);
      store.save();
      if (key === 'sound' && prefs.sound) DG.sfx.unlock();
    });
  };
  bindToggle('g-hold', 'gameHold');
  bindToggle('g-sound', 'sound');

  $('g-speed').textContent = `${prefs.gameSpeed}x`;
  $('g-speed').addEventListener('click', () => {
    prefs.gameSpeed = SPEEDS[(SPEEDS.indexOf(prefs.gameSpeed) + 1) % SPEEDS.length];
    $('g-speed').textContent = `${prefs.gameSpeed}x`;
    store.save();
  });

  fillForm();
  load(g.log[g.log.length - 1] || null, true);
  renderAll();
  setPlaying(false);

  DG.game = { pause };
})();
