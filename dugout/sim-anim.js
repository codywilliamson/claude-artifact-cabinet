// turns an at-bat result from sim-rules into an animated play script
(() => {
  const { SPOTS, DEFENSE, pt } = DG;
  const { startBase } = DG.simRules;

  const SPEED = 15;
  const B_DELAY = 0.35;
  const R_DELAY = 0.1;
  const THROW_FPS = 50;
  const FIELDER_FPS = 17;
  const SET = 0.4;
  const PIVOT = 0.3;
  const PITCH_MS = 750;
  const HANG = { pop: 2.8, fly: 2.6, line: 0.6 };
  const SAMPLES = 4;
  const MIN_SETTLE = 1.1;
  const CONTACT = [0, 1.5];
  const DUGOUT = [-30, -12];
  const DP_SPOT = [0, 50];
  const TAG_SPOT = [4, 81];
  const MISSED_THROW = [-58, 30];
  const BASE_SPOT = ['HOME', 'FIRST', 'SECOND', 'THIRD', 'HOME'];
  const EXIT = { 1: [54, 32], 2: [14, 98], 3: [-56, 36], 4: [-24, -8] };
  const NAME = { P: 'the pitcher', C: 'the catcher', '1B': 'first', '2B': 'second', SS: 'short', '3B': 'third', LF: 'left', CF: 'center', RF: 'right' };
  const BAG = { ON1: 'first', ON2: 'second', ONH: 'home' };
  const BAG_BASE = { ON1: 'FIRST', ON2: 'SECOND', ONH: 'HOME' };
  const CUTOFF = { LF: 'SS', CF: 'SS', RF: '2B' };
  const CUTOFF_SPOT = { LF: [-30, 98], CF: [-4, 106], RF: [30, 98] };
  const GROUND_SPOT = { P: [0, 31], '1B': [46, 58], '2B': [19, 73], SS: [-19, 73], '3B': [-44, 57] };
  const POP_SPOT = { P: [4, 46], C: [6, 8], '1B': [44, 66], '2B': [26, 90], SS: [-24, 90], '3B': [-46, 66] };
  const SINGLE_SPOT = { LF: [-58, 108], CF: [2, 118], RF: [58, 108] };
  const DEEP_SPOT = { LF: [-64, 140], CF: [16, 146], RF: [66, 138] };
  const FENCE_SPOT = { LF: [-78, 136], CF: [20, 156], RF: [80, 134] };
  const HIT_WORD = { single: 'SINGLE', double: 'DOUBLE', hr: 'HOME RUN' };

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const round = ([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  const jitter = ([x, y], r) => round([x + (Math.random() * 2 - 1) * r, y + (Math.random() * 2 - 1) * r]);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  // runner paths and positions over time (seconds after contact)
  const pathFor = (k, from, to) => {
    const pts = [k === 'B' ? SPOTS.BOX : pt(BASE_SPOT[from])];
    for (let b = from + 1; b <= to; b++) pts.push(pt(BASE_SPOT[b]));
    return pts;
  };
  const lengthOf = (pts) => pts.slice(1).reduce((s, p, i) => s + dist(p, pts[i]), 0);
  const walk = (pts, d) => {
    for (let i = 1; i < pts.length; i++) {
      const len = dist(pts[i - 1], pts[i]);
      if (d <= len) return lerp(pts[i - 1], pts[i], len ? d / len : 1);
      d -= len;
    }
    return pts[pts.length - 1];
  };
  const cornersBetween = (pts, d0, d1) => {
    const out = [];
    let acc = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      acc += dist(pts[i - 1], pts[i]);
      if (acc > d0 + 0.5 && acc < d1 - 0.5) out.push(pts[i]);
    }
    return out;
  };
  const distAt = (s, t) => {
    if (s.freezeAt != null) t = Math.min(t, s.freezeAt);
    const fwd = (tt) => Math.max(0, Math.min(s.cap, (tt - s.delay) * SPEED));
    if (s.retAt != null && t > s.retAt) return Math.max(0, fwd(s.retAt) - (t - s.retAt) * s.retSpeed);
    return fwd(t);
  };

  const specFor = (k, fate, ctx) => {
    const s = startBase(k);
    const delay = k === 'B' ? B_DELAY : R_DELAY;
    if (fate.k) return { pts: [SPOTS.BOX], cap: 0, delay, exit: DUGOUT };
    if (fate.caught) {
      const pts = pathFor(k, 0, 1);
      return { pts, cap: lengthOf(pts), delay, freezeAt: ctx.catchAt, exit: DUGOUT };
    }
    if (fate.doubled) {
      return { pts: pathFor(k, s, s + 1), cap: 22, delay: 0, retAt: ctx.catchAt + 0.3, retSpeed: 8, freezeAt: ctx.outAt[k], exit: EXIT[s] };
    }
    if ('out' in fate) {
      const pts = pathFor(k, s, fate.out);
      return { pts, cap: lengthOf(pts) - 5, delay, freezeAt: ctx.outAt[k] ?? ctx.end, exit: EXIT[fate.out] };
    }
    if (fate.to === s) {
      const pts = pathFor(k, s, Math.min(4, s + 1));
      return ctx.catchAt != null ? { pts, cap: 14, delay, retAt: ctx.catchAt + 0.2, retSpeed: 10, home: true } : { pts, cap: 0, delay, home: true };
    }
    const pts = pathFor(k, s, fate.to);
    return { pts, cap: lengthOf(pts), delay, scored: fate.to === 4 };
  };

  const moveFor = (s, a, b) => {
    const d0 = distAt(s, a);
    const ds = Array.from({ length: SAMPLES + 1 }, (_, j) => distAt(s, a + ((b - a) * (j + 1)) / (SAMPLES + 1)));
    if (ds.every((d) => Math.abs(d - d0) < 0.3)) return null;
    return { to: round(walk(s.pts, ds[SAMPLES])), via: ds.slice(0, SAMPLES).map((d) => round(walk(s.pts, d))), lin: true };
  };

  const settleMove = (s, a) => {
    if (s.exit) return { to: s.exit, lin: true };
    if (s.home) return distAt(s, a) > 0.3 ? { to: s.pts[0], lin: true } : null;
    const d0 = distAt(s, a);
    const corners = cornersBetween(s.pts, d0, s.cap);
    const end = walk(s.pts, s.cap);
    if (s.scored) return { to: DUGOUT, via: [...corners, end], lin: true };
    if (s.cap - d0 < 0.3) return null;
    return { to: round(end), via: corners.length ? corners : undefined, lin: true };
  };

  const settleTime = (s, a) => {
    if (s.exit) return 1;
    if (s.home) return distAt(s, a) / 10;
    return (s.cap - distAt(s, a)) / SPEED + (s.scored ? 1.2 : 0);
  };

  const runnersOf = (st) => Object.fromEntries(['R1', 'R2', 'R3'].filter((_, i) => st.bases[i]).map((k) => [k, BASE_SPOT[startBase(k)]]));

  const preCue = (st) => {
    const [on1, on2, on3] = st.bases;
    const sit = DG.situation({ start: { runners: runnersOf(st) } }).text;
    let cue = 'Nobody on: every grounder goes to first.';
    if (on1 && on2 && on3) cue = st.outs < 2 ? 'Bases loaded: ball to me, I go home.' : 'Two outs: take the easiest out.';
    else if (on1) cue = st.outs < 2 ? 'Runner on 1st: lead runner first, then try for two.' : 'Two outs: get the sure out.';
    else if (on2 || on3) cue = 'No force at 3rd. Grounder? Sure out at first.';
    return `${sit}, ${plural(st.outs, 'out')}. ${cue}`;
  };

  const strikeout = (res, st) => ({
    id: 'sim', title: res.label, start: { runners: runnersOf(st) },
    steps: [
      { d: 700, say: preCue(st), ball: { to: 'C', kind: 'pitch' } },
      { d: 600, say: 'Swing and a miss. Then another.', ball: { to: 'P', kind: 'throw', h: 3 } },
      { d: 700, say: 'Strike three!', ball: { to: 'C', kind: 'pitch' }, mark: { text: 'STRIKE 3', at: 'HOME', tone: 'out' } },
      { d: 1100, say: 'Strikeout. Defense, stay ready: the next one could be yours.', ball: { to: 'P', kind: 'throw', h: 3, at: [0.3, 1] }, moves: { B: { to: DUGOUT, lin: true } } },
    ],
  });

  function build(res, st) {
    if (res.kind === 'k') return strikeout(res, st);
    const keys = ['B', ...Object.keys(runnersOf(st))];
    const beats = [];
    const fpos = { ...DEFENSE };
    const ctx = { outAt: {}, catchAt: null, end: 0 };
    let t = 0;
    let holder = null;

    const beat = (d, spec) => {
      const b = { a: t, b: t + d, ...spec, moves: spec.moves || {} };
      t += d;
      beats.push(b);
      for (const [k, v] of Object.entries(b.moves)) fpos[k] = pt(v.to ?? v);
      return b;
    };

    const throwAll = (list) => list.forEach((th, i) => {
      const from = fpos[holder];
      const bagPt = pt(th.bag);
      const outMark = { text: 'OUT', at: BAG_BASE[th.bag], tone: 'out' };
      if (th.self) {
        beat(dist(from, bagPt) / FIELDER_FPS + 0.15, {
          say: th.bag === 'ON2' ? `${holder} is closest. He steps on 2nd himself. Out!` : `${holder} takes it to the bag himself. Out!`,
          focus: [holder], moves: { [holder]: { to: th.bag } }, mark: outMark,
        });
        ctx.outAt[th.out] = t;
        return;
      }
      const r = th.to;
      const d = dist(from, bagPt) / THROW_FPS + 0.25 + (i ? PIVOT : 0);
      const ball = { to: r, kind: 'throw', h: 3 + dist(from, bagPt) / 14, at: [i ? PIVOT / d : 0, 1] };
      if (th.wild && th.backup) {
        beat(d + 0.2, { say: 'Throw sails over first... but RF was backing up!', focus: ['RF'], ball: { to: 'RF', kind: 'throw', h: 12 }, moves: { RF: [60, 32] } });
        holder = 'RF';
      } else if (th.wild && th.bag === 'ON2') {
        beat(d + 0.2, { say: 'The feed sails past second!', ball: { to: [8, 104], kind: 'throw', h: 10 } });
        beat(1, { say: 'CF was backing up, but every runner moves up.', focus: ['CF'], ball: { to: 'CF', kind: 'roll' } });
        holder = 'CF';
      } else if (th.wild) {
        beat(d + 0.2, { say: 'Throw gets away at first!', ball: { to: [60, 30], kind: 'throw', h: 12 } });
        beat(1.2, { say: 'Nobody backing up. It rolls to the fence.', focus: ['RF'], ball: { to: [90, 24], kind: 'roll' }, moves: { RF: { to: [86, 40], at: [0.1, 1] } } });
        beat(0.7, { say: 'RF finally tracks it down.', ball: { to: 'RF', kind: 'hand', at: [0.4, 1] }, moves: { RF: [89, 27] } });
        holder = 'RF';
      } else if (th.late) {
        const arrive = B_DELAY + lengthOf(pathFor('B', 0, 1)) / SPEED;
        const dd = Math.max(d, arrive - t + 0.3);
        beat(dd, { say: 'Throw to first... too late. Safe!', focus: ['B'], ball: { ...ball, at: [1 - (d - 0.1) / dd, 1] }, mark: { text: 'SAFE', at: 'FIRST', tone: 'safe' } });
        holder = r;
      } else {
        let say = `Throw to ${BAG[th.bag]}. Out!`;
        if (th.tag) say = 'Throw to 2nd. First base is already out, so no force. TAG him... out!';
        else if (res.kind === 'line') say = 'He has to get back to first. Throw it there... doubled off!';
        else if (th.bag === 'ONH') say = 'Throw home, foot on the plate. Out, run saved!';
        else if (th.bag === 'ON2') say = `Feed to ${r} at second. Lead runner is out!`;
        else if (i > 0) say = 'On to first... DOUBLE PLAY!';
        beat(d, { say, focus: [holder, r], ball, moves: th.tag ? { [r]: { to: TAG_SPOT, at: [0.7, 1] } } : {}, mark: outMark });
        ctx.outAt[th.out] = t;
        holder = r;
      }
    });

    const cutoffThrow = (of) => {
      const cutoff = CUTOFF[of];
      beat(dist(fpos[of], fpos[cutoff]) / THROW_FPS + 0.35, {
        say: `${of} hits the cutoff. ${cutoff} has his hands up.`, shout: { who: cutoff, text: 'HERE!' },
        focus: [of, cutoff], ball: { to: cutoff, kind: 'throw', h: 9 },
      });
      holder = cutoff;
    };

    const outfieldSetup = (of) => {
      const cutoff = CUTOFF[of];
      const other = cutoff === 'SS' ? '2B' : 'SS';
      return {
        [cutoff]: { to: CUTOFF_SPOT[of], at: [0.2, 1] }, [other]: { to: 'ON2', at: [0.2, 1] },
        '1B': { to: 'ON1', at: [0.3, 1] }, '3B': { to: 'ON3', at: [0.3, 1] }, P: of === 'RF' ? [-4, -14] : [-50, 26],
      };
    };

    if (res.kind === 'ground') {
      const F = res.fielder;
      const spot = jitter(GROUND_SPOT[F], 3);
      const throws = res.throws;
      const covers = Object.fromEntries(throws.filter((th) => th.to).map((th) => [th.to, th.bag]));
      if (F !== '1B' && !covers['1B']) covers['1B'] = 'ON1';
      const moves = { [F]: { to: spot, at: [0, 0.9] } };
      for (const [k, bag] of Object.entries(covers)) if (k !== F) moves[k] = { to: bag, at: [0.15, 1] };
      const firstThrow = throws.some((th) => th.bag === 'ON1' && !th.self);
      const nobodyBacks = throws.some((th) => th.wild && th.bag === 'ON1' && !th.backup);
      if (firstThrow && !nobodyBacks) moves.RF = [62, 40];
      if (firstThrow && !covers.C) moves.C = [14, 9];
      if (throws.some((th) => th.bag === 'ON2')) moves.CF = [0, 114];
      const lead = throws[0];
      let note = '';
      if (lead?.bag === 'ON2' && !lead.self) note = ` ${lead.to} covers 2nd.`;
      if (lead?.bag === 'ONH') note = ' Catcher, foot on the plate.';
      beat(dist(CONTACT, spot) / 45 + 0.3, {
        say: `Grounder to ${NAME[F]}.${note}`, focus: [F], moves,
        ball: res.bobble ? { to: spot, kind: 'ground' } : { to: F, kind: 'ground', at: [0, 0.92] },
      });
      if (res.bobble) {
        const loose = jitter([spot[0] + 3, spot[1] + 5], 2);
        beat(0.5, { say: 'Bobbled! It squirts away.', focus: [F], ball: { to: loose, kind: 'roll' }, mark: { text: 'BOBBLE', at: loose, tone: 'info' } });
        beat(0.7, { say: 'He picks it up, but there\'s no play.', ball: { to: F, kind: 'hand', at: [0.5, 1] }, moves: { [F]: loose } });
        holder = F;
      } else {
        const setSay = lead?.bag === 'ONH' ? 'Field it, turn, look home.' : lead?.bag === 'ON2' ? 'Runner on 1st. Lead runner first.' : 'Get in front, set the feet.';
        beat(SET, { say: setSay, focus: [F] });
        holder = F;
        throwAll(throws);
      }
    } else if (res.kind === 'hit') {
      const of = res.of;
      const moves = outfieldSetup(of);
      if (res.via) moves[res.via] = moves[res.via] || { to: lerp(DEFENSE[res.via], GROUND_SPOT[res.via], 1.3), at: [0, 0.35] };
      if (res.hitType === 'single') {
        const spot = jitter(SINGLE_SPOT[of], 5);
        const kind = res.via || Math.random() < 0.5 ? 'ground' : 'line';
        const say = res.via ? `Grounder toward ${NAME[res.via]}... it gets through!` : `Base hit to ${NAME[of]}. ${CUTOFF[of]} goes out as the cutoff.`;
        beat(dist(CONTACT, spot) / (kind === 'line' ? 70 : 42) + 0.3, { say, focus: [of], ball: { to: of, kind, at: [0, 0.95] }, moves: { ...moves, [of]: { to: spot, at: [0, 0.9] } } });
        holder = of;
        if (res.cutoffOk) cutoffThrow(of);
        else {
          beat(dist(spot, MISSED_THROW) / THROW_FPS + 0.3, { say: `${of} skips the cutoff and throws for third...`, focus: [of], ball: { to: MISSED_THROW, kind: 'throw', h: 14 } });
          beat(0.9, { say: 'It gets past third! The pitcher was backing up, but the runners take an extra base.', focus: ['P'], ball: { to: 'P', kind: 'roll' }, moves: { P: [-58, 24] } });
          holder = 'P';
        }
      } else {
        const deep = jitter(DEEP_SPOT[of], 5);
        const fence = FENCE_SPOT[of];
        const hr = res.hitType === 'hr';
        beat(1.5, { say: hr ? `Crushed! Over ${NAME[of]}'s head!` : `Into the gap in ${NAME[of]}!`, focus: [of], ball: { to: deep, kind: 'line', h: hr ? 30 : 14 }, moves: { ...moves, [of]: { to: lerp(DEFENSE[of], deep, 0.6), at: [0.1, 1] } } });
        beat(1.3, { say: 'It rolls to the fence.', ball: { to: fence, kind: 'roll' }, moves: { [of]: lerp(DEFENSE[of], fence, 0.9) } });
        beat(0.6, { say: 'Pick it up and hit the relay.', ball: { to: of, kind: 'hand', at: [0.4, 1] }, moves: { [of]: fence } });
        holder = of;
        cutoffThrow(of);
      }
    } else {
      const F = res.fielder;
      const outfield = res.kind === 'fly';
      let spot = jitter(GROUND_SPOT[F] || DEFENSE[F], 2);
      if (outfield) spot = jitter([DEFENSE[F][0], DEFENSE[F][1] - 12], 10);
      if (res.kind === 'pop') spot = jitter(POP_SPOT[F], 4);
      const moves = outfield ? outfieldSetup(F) : {};
      const what = { pop: `Pop-up for ${NAME[F]}.`, fly: `Fly ball to ${NAME[F]}.`, line: `Line drive at ${NAME[F]}!` }[res.kind];
      if (res.caught) {
        beat(HANG[res.kind], {
          say: res.kind === 'line' ? what : `${what} "I got it!"`, focus: [F],
          shout: res.kind === 'line' ? undefined : { who: F, text: 'I GOT IT!', from: 0.3 },
          ball: { to: F, kind: res.kind }, moves: { ...moves, [F]: { to: spot, at: [0.1, 0.85] } },
          mark: { text: 'OUT', at: F, tone: 'out' },
        });
        ctx.catchAt = t;
        holder = F;
        throwAll(res.throws || []);
      } else {
        beat(HANG[res.kind], { say: `${what} It drops!`, focus: [F], ball: { to: spot, kind: res.kind }, moves: { ...moves, [F]: { to: jitter(spot, 4), at: [0.1, 0.9] } }, mark: { text: 'DROPPED', at: spot, tone: 'info' } });
        beat(0.6, { say: 'Pick it up and get it in.', ball: { to: F, kind: 'hand', at: [0.3, 1] }, moves: { [F]: spot } });
        holder = F;
      }
      if (outfield) cutoffThrow(F);
    }

    // settle: runners finish, ball goes back to the pitcher
    ctx.end = t;
    const specs = Object.fromEntries(keys.map((k) => [k, specFor(k, res.fates[k], ctx)]));
    const settleD = Math.max(MIN_SETTLE, ...keys.map((k) => settleTime(specs[k], t))) + 0.3;
    const outs = Object.values(res.fates).filter(DG.simRules.isOut).length;
    const bTo = res.fates.B.to;
    let mark;
    if (res.runs > 0) mark = { text: res.runs === 1 ? '1 RUN' : `${res.runs} RUNS`, at: 'HOME', tone: 'safe' };
    else if (outs >= 2) mark = { text: 'DOUBLE PLAY', at: DP_SPOT, tone: 'info' };
    else if (bTo) mark = { text: res.hit ? HIT_WORD[res.hitType] || 'SAFE' : 'SAFE', at: BASE_SPOT[bTo], tone: 'safe' };
    const runsSay = res.runs ? `${plural(res.runs, 'run')} ${res.runs === 1 ? 'scores' : 'score'}. ` : '';
    const settleMoves = {};
    if (['SS', '2B'].includes(holder) && fpos[holder][1] > 90) settleMoves[holder] = { to: lerp(fpos[holder], [0, 52], 0.4), at: [0, 0.5] };
    beat(settleD, {
      say: `${res.label}. ${runsSay}${res.limitNote || ''}${res.lesson}`,
      ball: holder && holder !== 'P' ? { to: 'P', kind: 'throw', h: 4, at: [0.55, 1] } : undefined,
      moves: settleMoves, mark,
    });

    const last = beats.length - 1;
    const steps = beats.map((b, i) => {
      const moves = { ...b.moves };
      for (const k of keys) {
        const m = i === last ? settleMove(specs[k], b.a) : moveFor(specs[k], b.a, b.b);
        if (m) moves[k] = m;
      }
      const { a, b: end, ...rest } = b;
      return { ...rest, d: Math.round((end - a) * 1000), moves };
    });

    return { id: 'sim', title: res.label, start: { runners: runnersOf(st) }, steps: [{ d: PITCH_MS, say: preCue(st), ball: { to: CONTACT, kind: 'pitch' } }, ...steps] };
  }

  DG.simAnim = { build };
})();
