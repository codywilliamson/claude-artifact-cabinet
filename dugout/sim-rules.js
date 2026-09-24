// decides what happens on an at-bat and where every runner ends up
// fates: { to: base } safe (4 = scored), { out: base } force/tag out, { caught }, { doubled }, { k }
(() => {
  const LEVEL = { rookie: 0, solid: 1, sharp: 2 };
  const NUM = { P: 1, C: 2, '1B': 3, '2B': 4, '3B': 5, SS: 6, LF: 7, CF: 8, RF: 9 };
  const RUNNERS = ['R1', 'R2', 'R3'];
  const OF_NAME = { LF: 'left', CF: 'center', RF: 'right' };

  // batting odds index by batting level, the rest by fielding level
  const ODDS = {
    strikeout: [0.2, 0.13, 0.08],
    ofHit: [18, 24, 30],
    hitType: [[80, 17, 3], [70, 24, 6], [60, 30, 10]],
    clean: [0.48, 0.64, 0.8],
    throw: [0.62, 0.78, 0.9],
    turnTwo: [0.2, 0.4, 0.6],
    backup: [0.3, 0.6, 0.85],
    pop: [0.45, 0.65, 0.82],
    fly: [0.28, 0.45, 0.65],
    liner: [0.4, 0.55, 0.7],
    cutoff: [0.5, 0.7, 0.85],
  };
  const MIX = [['ground', 48], ['pop', 11], ['fly', 14], ['line', 9]];
  const GROUND = [['SS', 28], ['2B', 24], ['3B', 20], ['1B', 14], ['P', 14]];
  const POPS = [['2B', 25], ['SS', 25], ['3B', 15], ['1B', 15], ['P', 12], ['C', 8]];
  const OF = [['LF', 36], ['CF', 34], ['RF', 30]];
  const OF_BEHIND = { '3B': 'LF', SS: 'LF', P: 'CF', '2B': 'RF', '1B': 'RF' };
  const SELF_FORCE = 0.35;
  const DOUBLED_OFF = 0.4;

  const chance = (p) => Math.random() < p;
  const weighted = (pairs) => {
    let r = Math.random() * pairs.reduce((s, [, w]) => s + w, 0);
    for (const [v, w] of pairs) if ((r -= w) < 0) return v;
    return pairs[0][0];
  };

  const present = (bases) => RUNNERS.filter((_, i) => bases[i]);
  const startBase = (k) => (k === 'B' ? 0 : Number(k[1]));

  const advanceAll = (bases, n, batterTo = n) => {
    const fates = { B: { to: batterTo } };
    for (const k of present(bases)) fates[k] = { to: Math.min(4, startBase(k) + n) };
    return fates;
  };

  const forcedOnly = (bases) => {
    const forced = [bases[0], bases[0] && bases[1], bases[0] && bases[1] && bases[2]];
    const fates = { B: { to: 1 } };
    for (const k of present(bases)) {
      const s = startBase(k);
      fates[k] = { to: forced[s - 1] ? s + 1 : s };
    }
    return fates;
  };

  const hold = (bases, batter) => {
    const fates = { B: batter };
    for (const k of present(bases)) fates[k] = { to: startBase(k) };
    return fates;
  };

  // 8U single: runners on 2nd and 3rd score, runner on 1st takes 2nd (3rd with an extra base)
  const singleFates = (bases, extra = 0) => {
    const fates = { B: { to: 1 + extra } };
    for (const k of present(bases)) {
      const s = startBase(k);
      fates[k] = { to: s >= 2 ? 4 : 2 + extra };
    }
    return fates;
  };

  const coverFor = (F) => (['2B', '1B', 'P'].includes(F) ? 'SS' : '2B');

  const toFirst = (st, F) => ({
    kind: 'ground', fielder: F,
    throws: [F === '1B' ? { self: true, bag: 'ON1', out: 'B' } : { to: '1B', bag: 'ON1', out: 'B' }],
    fates: { ...advanceAll(st.bases, 1), B: { out: 1 } },
    label: F === '1B' ? 'Ground out, 3 unassisted' : `Ground out, ${NUM[F]}-3`,
    ref: F === '1B' ? 'first-baseman-unassisted' : 'sure-out-first',
    lesson: 'Sure out at first. That\'s the play.',
  });

  const forceSecond = (st, F, two) => {
    const fates = { ...advanceAll(st.bases, 1), R1: { out: 2 }, B: two ? { out: 1 } : { to: 1 } };
    if (F === '1B' && two) {
      return {
        kind: 'ground', fielder: F, fates,
        throws: [{ self: true, bag: 'ON1', out: 'B' }, { to: 'SS', bag: 'ON2', out: 'R1', tag: true }],
        label: 'Double play, 3-6', ref: 'dp-first-then-tag',
        lesson: 'First base out means no force at 2nd. That tag was the right call.',
      };
    }
    const self = (F === 'SS' || F === '2B') && chance(SELF_FORCE);
    const cover = coverFor(F);
    const throws = [self ? { self: true, bag: 'ON2', out: 'R1' } : { to: cover, bag: 'ON2', out: 'R1' }];
    if (two) throws.push({ to: '1B', bag: 'ON1', out: 'B' });
    const path = self ? `${NUM[F]}` : `${NUM[F]}-${NUM[cover]}`;
    return {
      kind: 'ground', fielder: F, throws, fates,
      label: two ? `Double play, ${path}-3` : `Force out at 2nd, ${path}`,
      ref: two ? (self ? 'dp-ss-unassisted' : F === '2B' ? 'dp-4-6-3' : 'dp-6-4-3') : self ? 'closest-base' : cover === 'SS' ? 'right-side-feed' : 'dp-6-4-3',
      lesson: two ? 'Lead runner first, then first base. Two outs on one ball!' : 'Got the lead runner. One sure out beats two wild throws.',
    };
  };

  const forceHome = (st, F, two) => ({
    kind: 'ground', fielder: F,
    throws: [{ to: 'C', bag: 'ONH', out: 'R3' }, ...(two ? [{ to: '1B', bag: 'ON1', out: 'B' }] : [])],
    fates: { R1: { to: 2 }, R2: { to: 3 }, R3: { out: 4 }, B: two ? { out: 1 } : { to: 1 } },
    label: two ? `Double play, ${NUM[F]}-2-3` : `Force out at home, ${NUM[F]}-2`,
    ref: two ? 'dp-home-to-first' : 'bases-loaded-home',
    lesson: two ? 'Home, then first. The run is erased and it\'s two outs.' : 'Bases loaded, go home. Run saved.',
  });

  const badFeed = (st, F) => ({
    kind: 'ground', fielder: F, error: true,
    throws: [{ to: coverFor(F), bag: 'ON2', wild: true }],
    fates: advanceAll(st.bases, 2),
    label: 'Error, throw to 2nd gets away', ref: 'dp-6-4-3',
    lesson: 'Set your feet before the feed. Get one before you think about two.',
  });

  const wildFirst = (st, F, backedUp) => ({
    kind: 'ground', fielder: F, error: true,
    throws: [{ to: '1B', bag: 'ON1', wild: true, backup: backedUp }],
    fates: advanceAll(st.bases, backedUp ? 1 : 2),
    label: backedUp ? 'Error on the throw, RF backs it up' : 'Error, throw gets away at 1st',
    ref: 'back-up-first',
    lesson: backedUp ? 'RF was backing up. That saved a base.' : 'Nobody backing up first means free bases.',
  });

  const lateThrow = (st, F) => ({
    kind: 'ground', fielder: F, hit: true,
    throws: [{ to: '1B', bag: 'ON1', late: true }],
    fates: advanceAll(st.bases, 1),
    label: 'Infield single', ref: 'sure-out-first',
    lesson: 'Beat out. Charge slow rollers and get rid of it quicker.',
  });

  const bobble = (st, F) => ({
    kind: 'ground', fielder: F, error: true, bobble: true, throws: [],
    fates: advanceAll(st.bases, 1),
    label: 'Error, bobbled grounder', ref: 'knock-it-down',
    lesson: 'Knock it down and pick it up. Stay calm, there\'s time.',
  });

  const throughToOF = (st, F) => {
    const of = OF_BEHIND[F];
    return {
      kind: 'hit', via: F, of, hitType: 'single', hit: true, cutoffOk: true,
      fates: singleFates(st.bases),
      label: `Single through the infield to ${OF_NAME[of]}`, ref: 'belly-button',
      lesson: 'Belly button to the ball keeps grounders in the infield.',
    };
  };

  const groundBall = (st, odds) => {
    const F = weighted(GROUND);
    const [on1, on2, on3] = st.bases;
    if (!chance(odds('clean'))) return chance(0.5) ? bobble(st, F) : throughToOF(st, F);
    if (on1 && on2 && on3 && st.outs < 2 && ['P', '1B', '3B'].includes(F)) return forceHome(st, F, chance(odds('turnTwo')));
    if (on1 && st.outs < 2) {
      if (!chance(odds('throw'))) return badFeed(st, F);
      return forceSecond(st, F, chance(odds('turnTwo')));
    }
    if (on1 && (F === 'SS' || F === '2B')) return forceSecond(st, F, false);
    if (F === '1B' || chance(odds('throw'))) return toFirst(st, F);
    return chance(0.5) ? lateThrow(st, F) : wildFirst(st, F, chance(odds('backup')));
  };

  const popUp = (st, odds) => {
    const F = weighted(POPS);
    return chance(odds('pop'))
      ? { kind: 'pop', fielder: F, caught: true, fates: hold(st.bases, { caught: true }), label: `Pop out to ${NUM[F]}`, ref: 'pop-up-call-it', lesson: 'Loud call, two hands, easy out.' }
      : { kind: 'pop', fielder: F, caught: false, error: true, fates: forcedOnly(st.bases), label: 'Error, pop-up dropped', ref: 'pop-up-call-it', lesson: 'Call it twice and catch it with two hands above your eyes.' };
  };

  const flyBall = (st, odds) => {
    const F = weighted(OF);
    return chance(odds('fly'))
      ? { kind: 'fly', fielder: F, caught: true, fates: hold(st.bases, { caught: true }), label: `Fly out to ${OF_NAME[F]}`, ref: 'play-deep', lesson: 'Started deep, came in, caught it.' }
      : { kind: 'fly', fielder: F, caught: false, error: true, fates: singleFates(st.bases, 1), label: `Error, fly ball dropped in ${OF_NAME[F]}`, ref: 'play-deep', lesson: 'Get under it early and catch it out in front.' };
  };

  const lineDrive = (st, odds, bat) => {
    const F = weighted(GROUND);
    if (!chance(odds('liner'))) return ofHit(st, odds, bat, OF_BEHIND[F]);
    const doubled = st.bases[0] && st.outs < 2 && chance(DOUBLED_OFF);
    if (!doubled) return { kind: 'line', fielder: F, caught: true, fates: hold(st.bases, { caught: true }), label: `Line out to ${NUM[F]}`, ref: null, lesson: 'Glove up, eyes on it. Great catch.' };
    return {
      kind: 'line', fielder: F, caught: true,
      throws: [F === '1B' ? { self: true, bag: 'ON1', out: 'R1' } : { to: '1B', bag: 'ON1', out: 'R1' }],
      fates: { ...hold(st.bases, { caught: true }), R1: { doubled: true } },
      label: `Double play, line out doubled off 1st`, ref: 'dp-doubled-off',
      lesson: 'After the catch, look where the runner came from.',
    };
  };

  const ofHit = (st, odds, bat, of = weighted(OF)) => {
    const hitType = weighted([['single', ODDS.hitType[bat][0]], ['double', ODDS.hitType[bat][1]], ['hr', ODDS.hitType[bat][2]]]);
    if (hitType === 'double') return { kind: 'hit', of, hitType, hit: true, fates: advanceAll(st.bases, 4, 2), label: `Double to ${OF_NAME[of]}`, ref: 'gap-talk', lesson: 'Deep outfielders keep balls in front. Hit the relay.' };
    if (hitType === 'hr') return { kind: 'hit', of, hitType, hit: true, fates: advanceAll(st.bases, 4, 4), label: `Inside-the-park home run to ${OF_NAME[of]}`, ref: 'play-deep', lesson: 'Over the head means everybody scores. Play deeper.' };
    const cutoffOk = chance(odds('cutoff'));
    return {
      kind: 'hit', of, hitType, hit: true, cutoffOk, error: !cutoffOk,
      fates: singleFates(st.bases, cutoffOk ? 0 : 1),
      label: cutoffOk ? `Single to ${OF_NAME[of]}` : `Single to ${OF_NAME[of]}, extra base on the throw`,
      ref: of === 'RF' ? 'cutoff-right' : 'cutoff-left',
      lesson: cutoffOk ? 'Hit the cutoff and the runners stop.' : 'Skipped the cutoff and gave away a base.',
    };
  };

  DG.simRules = {
    resolve(st, batLevel, fieldLevel) {
      const bat = LEVEL[batLevel];
      const odds = (name) => ODDS[name][LEVEL[fieldLevel]];
      if (chance(ODDS.strikeout[bat])) return { kind: 'k', fates: { B: { k: true } }, label: 'Strikeout', ref: null, lesson: '' };
      const type = weighted([...MIX, ['hit', ODDS.ofHit[bat]]]);
      if (type === 'ground') return groundBall(st, odds);
      if (type === 'pop') return popUp(st, odds);
      if (type === 'fly') return flyBall(st, odds);
      if (type === 'line') return lineDrive(st, odds, bat);
      return ofHit(st, odds, bat);
    },
    startBase,
    isOut: (fate) => !('to' in fate),
  };
})();
