// the play viewer: transport, captions, quiz freeze, jobs and notes
(() => {
  const $ = (id) => document.getElementById(id);
  const { store } = DG;
  const prefs = store.state.prefs;
  const SPEEDS = [0.25, 0.5, 1, 2];
  const EPS = 1;
  const MAX_DT = 50;
  const NOTE_SAVE_MS = 400;
  const BASES = { FIRST: [27, 17], SECOND: [17, 7], THIRD: [7, 17] };
  const NAMES = {
    P: 'Pitcher', C: 'Catcher', '1B': 'First base', '2B': 'Second base', SS: 'Shortstop', '3B': 'Third base',
    LF: 'Left field', CF: 'Center field', RF: 'Right field', B: 'Batter', R1: 'Runner on 1st', R2: 'Runner on 2nd', R3: 'Runner on 3rd',
  };
  const IDLE_JOB = 'Ready position before every pitch. Know where the ball goes if it comes to you.';

  const ui = {
    title: $('p-title'), cat: $('p-cat'), sit: $('p-sit'), variant: $('p-variant'),
    wrap: $('field-wrap'), banner: $('wrong-banner'), stepNo: $('step-no'), say: $('step-say'),
    scrub: $('scrub'), ticks: $('ticks'), play: $('c-play'), speed: $('c-speed'),
    quiz: $('quiz'), quizQ: $('quiz-q'), quizOpts: $('quiz-opts'), quizWhy: $('quiz-why'), quizGo: $('quiz-go'),
    cues: $('cues'), posGrid: $('pos-grid'), jobText: $('job-text'), notes: $('notes'), saved: $('notes-saved'),
    tCoach: $('t-coach'), tRoutes: $('t-routes'), tQuiz: $('t-quiz'), tSound: $('t-sound'),
  };

  const field = new DG.Field($('field'), (k) => select(k));
  let play, tl;
  let variant = 'right';
  let T = 0;
  let playing = false;
  let boundary = null;
  let quizDone = false;
  let lastI = -1;
  let lastFrame = 0;
  let noteTimer;

  DG.situation = (p) => {
    const runners = Object.values(p.start?.runners || {});
    const short = { FIRST: '1st', SECOND: '2nd', THIRD: '3rd' };
    const text = runners.length === 0 ? 'Bases empty'
      : runners.length === 3 ? 'Bases loaded'
      : `${runners.length > 1 ? 'Runners' : 'Runner'} on ${runners.map((r) => short[r]).join(' & ')}`;
    return { runners, text };
  };

  const diamondSvg = (runners) => {
    const bases = Object.entries(BASES).map(([b, [x, y]]) =>
      `<rect x="${x - 3.5}" y="${y - 3.5}" width="7" height="7" transform="rotate(45 ${x} ${y})" fill="${runners.includes(b) ? 'var(--optic)' : 'none'}" stroke="rgba(244,240,230,.7)" stroke-width="1.2"/>`).join('');
    return `<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M17 5 29 17 17 29 5 17Z" fill="none" stroke="rgba(244,240,230,.2)"/>${bases}</svg>`;
  };

  const quizT = () => (variant === 'right' && prefs.quiz && play.quiz ? tl.steps[play.quiz.at].start : null);

  function render() {
    const fr = DG.frameAt(tl, T);
    field.draw(fr);
    if (fr.i !== lastI) {
      lastI = fr.i;
      ui.say.textContent = fr.step.say;
      ui.say.classList.remove('swap');
      void ui.say.offsetWidth;
      ui.say.classList.add('swap');
      ui.stepNo.textContent = `${fr.i + 1}/${tl.steps.length}`;
    }
    ui.scrub.value = Math.round((T / tl.total) * 1000);
  }

  function setPlaying(on) {
    playing = on;
    ui.play.querySelector('use').setAttribute('href', on ? '#i-pause' : '#i-play');
    ui.play.setAttribute('aria-label', on ? 'Pause' : 'Play');
    ui.play.classList.toggle('nudge', !on && T < tl.total && ui.quiz.hidden);
  }

  function emit(t0, t1) {
    for (const e of DG.events(tl, t0, t1)) {
      if (prefs.sound) DG.sfx.play(e);
      if (e === 'out') try { navigator.vibrate?.(40); } catch { /* no haptics */ }
    }
  }

  function tick(now) {
    if (!playing) return;
    const dt = Math.min(MAX_DT, now - lastFrame);
    lastFrame = now;
    const next = T + dt * prefs.speed;
    const qt = quizT();
    const step = DG.frameAt(tl, T).step;
    const end = step.start + step.dur;

    if (qt !== null && !quizDone && T <= qt && next > qt) {
      T = qt;
      showQuiz();
    } else if (next >= tl.total) {
      emit(T, tl.total);
      T = tl.total;
      setPlaying(false);
    } else if (prefs.coach && next >= end) {
      emit(T, end);
      T = end - EPS;
      boundary = end;
      setPlaying(false);
    } else {
      emit(T, next);
      T = next;
    }
    render();
    if (playing) requestAnimationFrame(tick);
  }

  function start() {
    if (T >= tl.total) seek(0);
    if (boundary !== null) T = boundary;
    boundary = null;
    if (prefs.sound) DG.sfx.unlock();
    lastFrame = performance.now();
    setPlaying(true);
    requestAnimationFrame(tick);
  }

  function seek(t) {
    T = Math.max(0, Math.min(tl.total, t));
    boundary = null;
    const qt = quizT();
    if (qt !== null && T <= qt) quizDone = false;
    hideQuiz();
    setPlaying(false);
    render();
  }

  function goStep(i) {
    if (i >= tl.steps.length) return seek(tl.total);
    seek(tl.steps[Math.max(0, i)].start);
  }

  function next() {
    if (boundary !== null) return start();
    const i = DG.frameAt(tl, T).i + 1;
    if (i >= tl.steps.length) return seek(tl.total);
    goStep(i);
    start();
  }

  function prev() {
    const fr = DG.frameAt(tl, T);
    goStep(fr.f > 0.25 ? fr.i : fr.i - 1);
  }

  function showQuiz() {
    const q = play.quiz;
    setPlaying(false);
    ui.quizQ.textContent = q.q;
    ui.quizWhy.hidden = true;
    ui.quizGo.hidden = true;
    const order = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
    ui.quizOpts.replaceChildren(...order.map((i) => {
      const b = document.createElement('button');
      b.textContent = q.options[i];
      b.dataset.i = i;
      b.addEventListener('click', () => answer(i));
      return b;
    }));
    ui.quiz.hidden = false;
    ui.play.classList.remove('nudge');
  }

  function answer(i) {
    if (quizDone) return;
    quizDone = true;
    const q = play.quiz;
    const right = i === q.answer;
    for (const b of ui.quizOpts.children) {
      const bi = Number(b.dataset.i);
      if (bi === q.answer) b.classList.add('right');
      else if (bi === i) b.classList.add('wrong');
    }
    ui.quizWhy.textContent = `${right ? 'Yes! ' : 'Not quite. '}${q.why}`;
    ui.quizWhy.hidden = false;
    ui.quizGo.hidden = false;
    if (right && prefs.sound) DG.sfx.play('out');
  }

  function hideQuiz() { ui.quiz.hidden = true; }

  function drawTicks() {
    const qt = quizT();
    ui.ticks.replaceChildren(...tl.steps.slice(1).map((s) => tickAt(s.start, s.start === qt)));
    if (qt === 0) ui.ticks.append(tickAt(0, true));
  }

  function tickAt(t, isQuiz) {
    const i = document.createElement('i');
    i.style.left = `${(t / tl.total) * 100}%`;
    if (isQuiz) i.className = 'quiz';
    return i;
  }

  function select(k) {
    field.selected = k && field.selected !== k ? k : null;
    for (const b of ui.posGrid.children) b.setAttribute('aria-pressed', b.dataset.k === field.selected);
    const sel = field.selected;
    ui.jobText.replaceChildren();
    if (sel) {
      const b = document.createElement('b');
      b.textContent = `${NAMES[sel]}: `;
      ui.jobText.append(b, play.jobs?.[sel] || (DG.isRunner(sel) ? 'Run hard and watch your base coach.' : IDLE_JOB));
      showInfo('jobs');
    } else ui.jobText.textContent = 'Tap a position (or a player on the field) to see their job.';
    if (tl) render();
  }

  function showInfo(name) {
    for (const b of document.querySelectorAll('.info-tabs button')) b.setAttribute('aria-selected', b.dataset.info === name);
    for (const n of ['cues', 'jobs', 'notes']) $(`info-${n}`).hidden = n !== name;
  }

  function setVariant(v, autoplay = false) {
    variant = v;
    tl = DG.compile(play, v);
    field.load(tl);
    T = 0;
    boundary = null;
    quizDone = false;
    lastI = -1;
    ui.variant.hidden = !play.wrong;
    ui.banner.hidden = v !== 'wrong';
    ui.wrap.classList.toggle('is-wrong', v === 'wrong');
    for (const b of ui.variant.children) b.setAttribute('aria-pressed', b.dataset.v === v);
    ui.tQuiz.hidden = !play.quiz;
    hideQuiz();
    drawTicks();
    render();
    if (autoplay) start();
    else setPlaying(false);
  }

  function load(p, autoplay = false) {
    play = p;
    const cat = DG.CATS[p.cat];
    ui.cat.textContent = cat.name;
    ui.cat.style.setProperty('--cat', cat.color);
    ui.title.textContent = p.title;
    const sit = DG.situation(p);
    ui.sit.innerHTML = `${diamondSvg(sit.runners)}<span>${sit.text}</span><span class="outs" aria-label="${p.outs} outs">${[0, 1].map((o) => `<i class="${o < p.outs ? 'on' : ''}"></i>`).join('')}</span>`;
    ui.cues.replaceChildren(...p.cues.map((c, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${i + 1}</b><span></span>`;
      li.lastChild.textContent = c;
      return li;
    }));
    ui.notes.value = store.state.notes[p.id] || '';
    ui.saved.textContent = 'Saved on this phone';
    field.selected = null;
    setVariant('right', autoplay);
    const withJobs = tl.keys.filter((k) => p.jobs?.[k]).concat(tl.keys.filter((k) => !p.jobs?.[k]));
    ui.posGrid.replaceChildren(...withJobs.map((k) => {
      const b = document.createElement('button');
      b.dataset.k = k;
      b.className = DG.isRunner(k) ? 'run' : '';
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span></span>';
      b.firstChild.textContent = k;
      b.addEventListener('click', () => select(k));
      return b;
    }));
    select(null);
    showInfo('cues');
    store.state.last = p.id;
    store.save();
  }

  const syncToggle = (btn, key) => btn.setAttribute('aria-pressed', prefs[key]);
  const bindToggle = (btn, key, after) => {
    syncToggle(btn, key);
    btn.addEventListener('click', () => {
      prefs[key] = !prefs[key];
      syncToggle(btn, key);
      store.save();
      after?.();
    });
  };

  bindToggle(ui.tCoach, 'coach');
  bindToggle(ui.tRoutes, 'routes', () => { field.showRoutes = prefs.routes; render(); });
  bindToggle(ui.tQuiz, 'quiz', () => { quizDone = false; drawTicks(); });
  bindToggle(ui.tSound, 'sound', () => prefs.sound && DG.sfx.unlock());
  field.showRoutes = prefs.routes;

  ui.speed.textContent = `${prefs.speed}x`;
  ui.speed.addEventListener('click', () => {
    prefs.speed = SPEEDS[(SPEEDS.indexOf(prefs.speed) + 1) % SPEEDS.length];
    ui.speed.textContent = `${prefs.speed}x`;
    store.save();
  });

  ui.play.addEventListener('click', () => (playing ? setPlaying(false) : (ui.quiz.hidden || quizDone) && (hideQuiz(), start())));
  $('c-next').addEventListener('click', next);
  $('c-prev').addEventListener('click', prev);
  $('c-restart').addEventListener('click', () => { seek(0); start(); });
  ui.scrub.addEventListener('input', () => seek((ui.scrub.value / 1000) * tl.total));
  ui.quizGo.addEventListener('click', () => { hideQuiz(); start(); });
  ui.variant.addEventListener('click', (e) => {
    const v = e.target.closest('button')?.dataset.v;
    if (v && v !== variant) setVariant(v, true);
  });
  for (const b of document.querySelectorAll('.info-tabs button')) b.addEventListener('click', () => showInfo(b.dataset.info));

  ui.notes.addEventListener('input', () => {
    store.state.notes[play.id] = ui.notes.value;
    ui.saved.textContent = 'Saving...';
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { store.save(); ui.saved.textContent = 'Saved on this phone'; }, NOTE_SAVE_MS);
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || $('view-plays').hidden) return;
    if (e.key === ' ') { e.preventDefault(); ui.play.click(); }
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  DG.player = { load, current: () => play };
})();
