// turns a play script into a timeline you can sample at any time T (ms)
(() => {
  const { SPOTS, DEFENSE } = DG;
  const RUNNERS = ['B', 'R1', 'R2', 'R3'];
  const MARK_AT = 0.72;
  const DEFAULT_H = { ground: 0, roll: 0, hand: 0, pitch: 3, throw: 6, line: 8, fly: 42, pop: 58 };
  const HAND_H = 4;
  const HIT_KINDS = ['ground', 'line', 'fly', 'pop'];

  const isRunner = (k) => RUNNERS.includes(k);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const local = (f, [a, b]) => clamp01((f - a) / (b - a || 1));

  const pt = (v, actors = {}) => {
    if (Array.isArray(v)) return v;
    if (SPOTS[v]) return SPOTS[v];
    if (actors[v]) return actors[v];
    throw new Error(`unknown spot: ${v}`);
  };

  // runners move at a steady pace across steps, fielders accelerate and settle
  const normMove = (k, v) => {
    const m = v && !Array.isArray(v) && typeof v === 'object' ? v : { to: v };
    return { to: m.to, at: m.at || [0, 1], lin: m.lin ?? isRunner(k) };
  };

  const posAt = (step, k, f) => {
    const m = step.moves[k];
    if (!m) return step.from[k];
    const u = local(f, m.at);
    return lerp(step.from[k], m.to, m.lin ? u : easeInOut(u));
  };

  const flight = (b, u) => {
    const grounded = b.kind === 'ground' || b.kind === 'roll';
    const p = grounded ? 1 - (1 - u) ** 1.5 : u;
    const pos = lerp(b.from, b.to, p);
    let h = 0;
    if (b.kind === 'ground') h = 4 * Math.abs(Math.sin(u * Math.PI * 3)) * (1 - u) ** 2;
    else if (!grounded && b.kind !== 'hand') h = HAND_H * (1 - u) + 3 * u + b.h * 4 * u * (1 - u);
    return { pos, h };
  };

  DG.compile = (play, variant = 'right') => {
    const src = variant === 'wrong' && play.wrong ? { ...play, ...play.wrong } : play;
    let actors = { ...DEFENSE, B: SPOTS.BOX };
    for (const [k, v] of Object.entries(src.start?.def || {})) actors[k] = pt(v);
    for (const [k, v] of Object.entries(src.start?.runners || {})) actors[k] = pt(v);
    const keys = Object.keys(actors);
    let ball = { pos: actors.P, holder: 'P' };
    let t = 0;

    const steps = src.steps.map((s, i) => {
      const moves = {};
      for (const [k, v] of Object.entries(s.moves || {})) {
        const m = normMove(k, v);
        moves[k] = { ...m, to: pt(m.to, actors) };
      }
      const step = { ...s, i, start: t, dur: s.d, from: actors, moves, holder: ball.holder, ballPos: ball.pos, ball: null };
      const end = { ...actors };
      for (const k in moves) end[k] = moves[k].to;

      if (s.ball) {
        const kind = s.ball.kind || 'throw';
        const at = s.ball.at || [0, 1];
        const catcher = keys.includes(s.ball.to) ? s.ball.to : null;
        const from = ball.holder ? posAt(step, ball.holder, at[0]) : ball.pos;
        const to = catcher ? posAt(step, catcher, at[1]) : pt(s.ball.to);
        step.ball = { kind, at, from, to, catcher, h: s.ball.h ?? DEFAULT_H[kind], hit: HIT_KINDS.includes(kind) };
        ball = { pos: to, holder: catcher };
      }
      step.to = end;
      actors = end;
      t += s.d;
      return step;
    });

    return { play, variant, steps, keys, total: t, final: { actors, ball } };
  };

  const settled = (holder, pos, actors) => ({ pos: holder ? actors[holder] : pos, h: holder ? HAND_H : 0, held: !!holder, flying: false });

  DG.frameAt = (tl, T) => {
    T = Math.max(0, Math.min(tl.total, T));
    let i = tl.steps.findIndex((s) => T < s.start + s.dur);
    if (i < 0) i = tl.steps.length - 1;
    const step = tl.steps[i];
    const f = clamp01((T - step.start) / step.dur);
    const actors = {};
    for (const k of tl.keys) actors[k] = posAt(step, k, f);

    const b = step.ball;
    let ball;
    if (!b) ball = settled(step.holder, step.ballPos, actors);
    else {
      const u = (f - b.at[0]) / (b.at[1] - b.at[0] || 1);
      if (u <= 0) ball = settled(step.holder, step.ballPos, actors);
      else if (u >= 1) ball = settled(b.catcher, b.to, actors);
      else ball = { ...flight(b, u), held: false, flying: true, kind: b.kind };
    }
    return { T, i, f, step, actors, ball };
  };

  // sound + haptic cues crossed while moving forward from t0 to t1
  DG.events = (tl, t0, t1) => {
    const out = [];
    if (t1 <= t0) return out;
    const crossed = (t) => t0 < t && t <= t1;
    for (const s of tl.steps) {
      const b = s.ball;
      if (b) {
        if (b.hit && crossed(s.start + b.at[0] * s.dur)) out.push('crack');
        if (b.catcher && crossed(s.start + b.at[1] * s.dur)) out.push('pop');
      }
      if (s.mark && crossed(s.start + s.dur * MARK_AT)) out.push(s.mark.tone === 'out' ? 'out' : 'mark');
    }
    return out;
  };

  DG.along = (a, b, f) => lerp(pt(a), pt(b), f);
  Object.assign(DG, { pt, flight, isRunner, MARK_AT });
})();
