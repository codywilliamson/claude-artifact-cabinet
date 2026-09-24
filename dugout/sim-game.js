// game state: innings, outs, the run limit per half, and the game clock
(() => {
  const OPPONENT_LINEUP = 11;
  const PA_MINUTES = [1.2, 2.2];
  const STRIKEOUT_EXTRA = 0.5;
  const CHANGEOVER = 1.5;
  const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
  const { isOut } = DG.simRules;

  const defaults = () => ({
    us: 'Us', them: 'Them', usHome: true, innings: 4, runLimit: 5, timeLimit: 75,
    usLevel: 'solid', themLevel: 'solid', roster: '',
  });

  const newGame = (settings) => ({
    settings: { ...settings },
    inning: 1, half: 'top', outs: 0, bases: [false, false, false], halfRuns: 0, clock: 0,
    line: { away: [], home: [] }, hits: { away: 0, home: 0 }, errors: { away: 0, home: 0 },
    order: { away: 0, home: 0 }, log: [], over: false, result: '',
  });

  const total = (g, side) => g.line[side].reduce((s, r) => s + (Number(r) || 0), 0);
  const isUs = (g, side) => (side === 'home') === g.settings.usHome;
  const teamName = (g, side) => (isUs(g, side) ? g.settings.us : g.settings.them);
  const levelOf = (g, side) => (isUs(g, side) ? g.settings.usLevel : g.settings.themLevel);
  const roster = (g) => g.settings.roster.split('\n').map((s) => s.trim()).filter(Boolean);
  const lastInning = (g) => g.inning >= g.settings.innings || (g.settings.timeLimit && g.clock >= g.settings.timeLimit);

  const batterName = (g, side) => {
    const i = g.order[side]++;
    const names = isUs(g, side) ? roster(g) : [];
    return names.length ? names[i % names.length] : `${teamName(g, side)} #${(i % OPPONENT_LINEUP) + 1}`;
  };

  const finish = (g, reason) => {
    const a = total(g, 'away');
    const h = total(g, 'home');
    g.over = true;
    g.result = a === h ? `Tie, ${a}-${h}` : `${teamName(g, a > h ? 'away' : 'home')} win ${Math.max(a, h)}-${Math.min(a, h)}`;
    g.endReason = reason;
  };

  const endHalf = (g, entry, reason) => {
    entry.endHalf = reason;
    g.clock += CHANGEOVER;
    g.outs = 0;
    g.bases = [false, false, false];
    g.halfRuns = 0;
    if (g.half === 'top') {
      if (lastInning(g) && total(g, 'home') > total(g, 'away')) {
        g.line.home[g.inning - 1] = 'X';
        return finish(g, 'Home team already ahead');
      }
      g.half = 'bottom';
      return;
    }
    if (lastInning(g)) return finish(g, g.inning < g.settings.innings ? 'Time limit, no new inning' : 'Final');
    g.inning++;
    g.half = 'top';
  };

  const next = (g) => {
    if (g.over) return null;
    const side = g.half === 'top' ? 'away' : 'home';
    const field = side === 'away' ? 'home' : 'away';
    const st = { bases: [...g.bases], outs: g.outs };
    const res = DG.simRules.resolve(st, levelOf(g, side), levelOf(g, field));
    const fates = Object.values(res.fates);
    const outs = fates.filter(isOut).length;
    let runs = fates.filter((f) => f.to === 4).length;
    if (st.outs + outs >= 3) runs = 0;
    const limit = g.settings.runLimit;
    const room = limit ? limit - g.halfRuns : Infinity;
    res.runs = Math.min(runs, room);
    const limitHit = limit && g.halfRuns + res.runs >= limit;
    if (limitHit) res.limitNote = `That's ${limit} runs, the limit. Switch sides! `;

    const entry = {
      n: g.log.length + 1, inning: g.inning, half: g.half, side,
      batter: batterName(g, side), label: res.label, runs: res.runs, ref: res.ref,
      play: DG.simAnim.build(res, st),
    };

    const i = g.inning - 1;
    g.line[side][i] = (Number(g.line[side][i]) || 0) + res.runs;
    g.halfRuns += res.runs;
    g.outs = Math.min(3, g.outs + outs);
    g.bases = [1, 2, 3].map((b) => fates.some((f) => f.to === b));
    if (res.hit) g.hits[side]++;
    if (res.error) g.errors[field]++;
    g.clock += PA_MINUTES[0] + Math.random() * (PA_MINUTES[1] - PA_MINUTES[0]) + (res.kind === 'k' ? STRIKEOUT_EXTRA : 0);
    entry.outs = g.outs;
    entry.score = { away: total(g, 'away'), home: total(g, 'home') };
    g.log.push(entry);

    if (g.half === 'bottom' && lastInning(g) && total(g, 'home') > total(g, 'away')) finish(g, 'Walk-off!');
    else if (g.outs >= 3) endHalf(g, entry, '3 outs');
    else if (limitHit) endHalf(g, entry, `${limit}-run limit`);
    return entry;
  };

  const simToEnd = (g) => {
    let last = null;
    while (!g.over) last = next(g);
    return last;
  };

  const clockText = (min) => `${Math.floor(min / 60)}:${String(Math.floor(min % 60)).padStart(2, '0')}`;
  const halfText = (inning, half) => `${half === 'top' ? 'Top' : 'Bottom'} ${ORDINAL[inning - 1] || `${inning}th`}`;

  DG.sim = { defaults, newGame, next, simToEnd, total, teamName, isUs, clockText, halfText };
})();
