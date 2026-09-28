(() => {
  const { run, bat, pitch } = DG.kit;

  const lfSingle = {
    d: 1900, say: 'Single to left, runner on 1st. SS runs out to be the cutoff. 2B covers 2nd, P backs up 3rd.', focus: ['LF', 'SS'],
    ball: { to: 'LF', kind: 'ground', at: [0, 0.9] },
    moves: {
      LF: { to: [-62, 108], at: [0, 0.85] }, SS: [-26, 98], '2B': 'ON2', '3B': 'ON3', P: [-30, 28],
      R1: { to: run('FIRST', 'SECOND', 0.42), at: [0.15, 1] }, B: { to: bat(0.36), at: [0.15, 1] },
    },
  };

  const gapFly = (say) => ({
    d: 2800, say, focus: ['CF', 'RF'],
    moves: { B: { to: bat(0.5), at: [0.1, 1] }, '2B': [26, 98], SS: 'ON2', '1B': 'ON1' },
  });

  DG.plays.push(
    {
      id: 'play-deep',
      cat: 'deep',
      title: 'Start deep, run in',
      blurb: 'Deep fly to center. Deep outfielders come IN for it. Shallow ones chase it to the fence.',
      outs: 0,
      cues: [
        'Start deeper than feels right. Most 8U hits land in front of you.',
        'Running in is easy. Running backwards is the hardest thing in baseball.',
        'Catch it, crow hop, throw to the cutoff. Never hold it in the outfield.',
      ],
      jobs: {
        CF: 'Start deep. Read it, come in, catch it, throw to the cutoff.',
        SS: 'Run out to the cutoff spot with hands up.',
        '2B': 'Cover 2nd.',
        LF: 'Drift toward CF to back up.',
        RF: 'Drift toward CF to back up.',
        B: 'Run hard, fly balls get dropped.',
      },
      steps: [
        pitch('Before the pitch: outfielders check they\'re DEEP. Deeper than you think.'),
        {
          d: 2600, say: 'Deep fly to center. CF started deep, so he only has to come IN a few steps.', focus: ['CF'],
          ball: { to: 'CF', kind: 'fly', h: 48 },
          moves: { CF: { to: [4, 131], at: [0.15, 0.85] }, SS: [-6, 104], '2B': 'ON2', LF: [-34, 126], RF: [36, 126], B: { to: bat(0.5), at: [0.1, 1] } },
        },
        {
          d: 700, say: 'Catch it out in front, two hands, glove above the eyes.', focus: ['CF'],
          moves: { B: bat(0.6) },
          mark: { text: 'OUT', at: 'CF', tone: 'out' },
        },
        {
          d: 1300, say: 'Crow hop and throw to the cutoff. Ball back in the infield fast.', focus: ['CF', 'SS'],
          shout: { who: 'SS', text: 'HERE!' },
          ball: { to: 'SS', kind: 'throw', h: 10 },
          moves: { B: [24, 10] },
        },
      ],
      wrong: {
        label: 'Plays shallow',
        start: { def: { CF: [0, 106], LF: [-56, 100], RF: [56, 100] } },
        steps: [
          pitch('Same batter. But this time the outfield is playing shallow.'),
          {
            d: 2600, say: 'Same fly ball. CF has to turn and run BACKWARDS...', focus: ['CF'],
            ball: { to: [5, 140], kind: 'fly', h: 48 },
            moves: { CF: { to: [3, 128], at: [0.15, 1] }, SS: [-6, 100], '2B': 'ON2', B: { to: bat(0.5), at: [0.1, 1] } },
          },
          {
            d: 1800, say: 'Over his head. It rolls to the fence.', focus: ['CF'],
            ball: { to: [6, 155], kind: 'roll' },
            moves: { CF: [5, 150], B: 'FIRST' },
            mark: { text: 'OVER HEAD', at: [4, 132], tone: 'info' },
          },
          {
            d: 2800, say: 'By the time he picks it up, the batter is flying around 2nd.', focus: ['B'],
            ball: { to: 'CF', kind: 'hand', at: [0.25, 0.4] },
            moves: { CF: { to: [6, 154], at: [0, 0.3] }, B: 'SECOND' },
          },
          {
            d: 3000, say: 'Relay comes in, but he\'s standing on 3rd. A triple on a routine fly ball.',
            ball: { to: 'SS', kind: 'throw', h: 12, at: [0, 0.5] },
            moves: { SS: [-4, 110], B: 'THIRD' },
            mark: { text: 'SAFE', at: 'THIRD', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 0, q: 'Why do we play the outfield DEEP at 8U?', options: ['Running in is easier than running back', 'So you can rest', 'To be closer to the fence'], answer: 0, why: 'Most 8U hits land short, so everything stays in front of you. A ball over your head is a triple.' },
    },

    {
      id: 'outfield-wall',
      cat: 'deep',
      title: 'Outfield grounder: be the wall',
      blurb: 'Grounder through the hole. Charge it, drop a knee, nothing gets by.',
      outs: 1,
      cues: [
        'Charge the ball. The runner is moving, so you move too.',
        'Knee-down block: knee on the ground, glove between your legs.',
        'Up, crow hop, throw to the cutoff.',
      ],
      jobs: {
        LF: 'Charge, drop a knee to block, throw to SS.',
        SS: 'Dive/reach, then turn and go out as the cutoff.',
        CF: 'Run over behind LF.',
        '2B': 'Cover 2nd.',
        B: 'Round first, look for a bobble.',
      },
      steps: [
        pitch(),
        {
          d: 2000, say: 'Grounder through the hole into left. LF charges in hard. Don\'t wait for it!', focus: ['LF'],
          ball: { to: 'LF', kind: 'ground', at: [0, 0.9] },
          moves: { LF: { to: [-58, 110], at: [0, 0.85] }, SS: { to: [-33, 79], at: [0.1, 0.4] }, CF: [-26, 128], '2B': 'ON2', B: { to: bat(0.45), at: [0.15, 1] } },
        },
        {
          d: 800, say: 'Knee down, glove between the legs. He\'s a wall. Nothing gets by.', focus: ['LF'],
          moves: { LF: [-57, 109], SS: [-30, 94], CF: [-40, 124], B: bat(0.6) },
          mark: { text: 'WALL', at: 'LF', tone: 'info' },
        },
        {
          d: 1600, say: 'Up, crow hop, hit the cutoff. SS has his hands up.', focus: ['LF', 'SS'],
          shout: { who: 'SS', text: 'HERE!' },
          ball: { to: 'SS', kind: 'throw', h: 8 },
          moves: { SS: [-26, 96], B: 'FIRST' },
          mark: { text: 'HELD', at: 'FIRST', tone: 'info' },
        },
      ],
    },

    {
      id: 'gap-talk',
      cat: 'talk',
      title: 'Gap ball: CF is the boss',
      blurb: 'Fly ball between CF and RF. One calls it, one backs up.',
      outs: 1,
      cues: [
        'CF has priority over the corners.',
        'First loud call owns it. The other guy goes BEHIND him.',
        'After the catch, throw to the cutoff (2B on the right side).',
      ],
      jobs: {
        CF: 'Call it early: "I got it! I got it!" Catch it, throw to 2B.',
        RF: 'Go hard until you hear the call, then circle behind CF.',
        '2B': 'Go out to the cutoff spot, hands up.',
        SS: 'Cover 2nd.',
        B: 'Run hard.',
      },
      steps: [
        pitch(),
        {
          ...gapFly('Fly ball in the right-center gap. CF calls it early and loud. RF hears it and circles BEHIND him.'),
          shout: { who: 'CF', text: 'I GOT IT!', from: 0.3 },
          ball: { to: 'CF', kind: 'fly', h: 45 },
          moves: { ...gapFly().moves, CF: { to: [36, 130], at: [0.1, 0.85] }, RF: { to: [44, 142], at: [0.15, 0.95] } },
        },
        {
          d: 800, say: 'Catch. And if it popped out, RF is right there behind him.', focus: ['CF', 'RF'],
          moves: { B: bat(0.62) },
          mark: { text: 'OUT', at: 'CF', tone: 'out' },
        },
        {
          d: 1200, say: 'Throw to the cutoff, 2B on the right side.', focus: ['2B'],
          ball: { to: '2B', kind: 'throw', h: 9 },
          moves: { B: [30, 20] },
        },
      ],
      wrong: {
        label: 'Nobody talks',
        steps: [
          pitch(),
          {
            ...gapFly('Same fly ball. Neither one says anything. Both keep running at it...'),
            ball: { to: [38, 132], kind: 'fly', h: 45 },
            moves: { ...gapFly().moves, CF: { to: [34, 132], at: [0.1, 0.95] }, RF: { to: [43, 131], at: [0.1, 0.95] } },
          },
          {
            d: 1200, say: 'Both pull up so they don\'t crash. It drops between them.', focus: ['CF', 'RF'],
            ball: { to: [42, 150], kind: 'roll' },
            moves: { B: 'FIRST' },
            mark: { text: 'DROPPED', at: [38, 138], tone: 'info' },
          },
          {
            d: 2800, say: 'Ball rolls to the fence while they look at each other. Stand-up double.', focus: ['B'],
            ball: { to: 'RF', kind: 'hand', at: [0.4, 0.5] },
            moves: { RF: { to: [43, 148], at: [0, 0.45] }, B: 'SECOND' },
            mark: { text: 'SAFE', at: 'SECOND', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'Fly ball between CF and RF. Who gets it?', options: ['CF, the center fielder is the boss', 'RF, he was closer at first', 'Whoever runs faster'], answer: 0, why: 'CF has priority over the corners. But whoever calls it loud first owns it, and the other one backs up.' },
    },

    {
      id: 'cutoff-left',
      cat: 'cutoff',
      title: 'Cutoff: keep it moving',
      blurb: 'Single to left, runner on 1st. Cutoff catches on the move, no staring. Give up the base, not the next one.',
      outs: 0,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Outfielder hits the cutoff fast. Not 3rd, not home.',
        'Cutoff catches it MOVING. No stopping, no staring. At 8U the 3B coach just sends the runner.',
        'Let the lead runner take the base. Protect the second runner: don\'t let the batter take 2nd on the throw.',
        'Short, firm throw into the infield. No long hopeful throws.',
      ],
      jobs: {
        LF: 'Charge it, field it, throw to SS. Then stay ready to back up.',
        SS: 'Run out, hands up, yell. Catch it moving, look at the batter, throw short into the infield.',
        '2B': 'Cover 2nd. Stand on the bag and call for it.',
        '3B': 'Cover 3rd.',
        P: 'Back up 3rd base.',
        R1: 'Goes to 2nd, then on to 3rd.',
        B: 'Round first. Stops if the ball is coming in.',
      },
      steps: [
        pitch(),
        lfSingle,
        {
          d: 1200, say: 'LF throws to the cutoff. Not to 3rd. Not home. Cutoff.', focus: ['LF', 'SS'],
          shout: { who: 'SS', text: 'HERE!' },
          ball: { to: 'SS', kind: 'throw', h: 7 },
          moves: { R1: 'SECOND', B: bat(0.75) },
        },
        {
          d: 1300, say: 'SS catches it on the move. No stopping, no staring. R1 is heading to 3rd. Let him have it.', focus: ['SS', 'R1'],
          moves: { SS: [-16, 78], R1: run('SECOND', 'THIRD', 0.85), B: 'FIRST' },
        },
        {
          d: 1200, say: 'The batter peeks at 2nd. SS shows the ball and throws short and firm to 2B on the bag. Batter stays on 1st.', focus: ['SS', '2B'],
          ball: { to: '2B', kind: 'throw', h: 3 },
          moves: { R1: 'THIRD', B: 'FIRST' },
          mark: { text: 'HELD', at: 'FIRST', tone: 'info' },
        },
      ],
      wrong: {
        label: 'Throws to 3rd',
        steps: [
          pitch(),
          { ...lfSingle, say: 'Same single to left, runner on 1st.' },
          {
            d: 1500, say: 'LF tries the long throw to 3rd base...', focus: ['LF'],
            ball: { to: [-50, 34], kind: 'throw', h: 16 },
            moves: { '3B': [-44, 46], R1: 'SECOND', B: 'FIRST' },
          },
          {
            d: 1400, say: 'It skips past 3B. The pitcher got there late.', focus: ['3B', 'P'],
            ball: { to: [-88, 18], kind: 'roll' },
            moves: { '3B': [-70, 28], P: [-58, 18], R1: run('SECOND', 'THIRD', 0.6), B: run('FIRST', 'SECOND', 0.35) },
            mark: { text: 'LOOSE', at: [-70, 30], tone: 'info' },
          },
          {
            d: 1500, say: 'Runner rounds 3rd while 3B chases it down...', focus: ['R1'],
            ball: { to: '3B', kind: 'hand', at: [0.6, 0.8] },
            moves: { '3B': { to: [-86, 20], at: [0, 0.6] }, R1: 'THIRD', B: run('FIRST', 'SECOND', 0.8) },
          },
          {
            d: 2200, say: 'R1 scores, batter\'s on 2nd. One bad throw turned a single into a run.', focus: ['R1'],
            ball: { to: 'C', kind: 'throw', h: 10, at: [0.1, 0.9] },
            moves: { R1: 'HOME', B: 'SECOND' },
            mark: { text: 'SAFE', at: 'HOME', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 3, q: 'SS just caught the cutoff throw. R1 is running to 3rd, the batter is looking at 2nd. What now?', options: ['Keep moving: short throw into the infield, batter stays on 1st', 'Stop and stare the runner down', 'Long throw to 3rd to get R1'], answer: 0, why: 'Staring doesn\'t stop an 8U runner, the coach just waves him. Let R1 have 3rd and make sure the batter doesn\'t get 2nd for free.' },
    },

    {
      id: 'cutoff-right',
      cat: 'cutoff',
      title: 'Right side cutoff: 2B',
      blurb: 'Single to right, runner on 2nd. Runner will score. Keep the ball moving so the batter can\'t take 2nd.',
      outs: 0,
      start: { runners: { R2: 'SECOND' } },
      cues: [
        'Ball to right field: 2B is the cutoff. Ball to left or center: SS.',
        'Accept it: at 8U the 3B coach sends the runner and he probably scores. That\'s OK.',
        'Cutoff does NOT stand and stare. Catch it moving, keep it moving.',
        'Don\'t make the long hopeful throw home. Protect the next runner: the batter stays on 1st.',
        'Throw home only if it\'s a sure thing, a short firm throw and the runner is way late.',
      ],
      jobs: {
        RF: 'Charge it, field it, throw to 2B.',
        '2B': 'Run out toward RF, hands up. Catch on the move, look at the batter, throw into the infield.',
        SS: 'Cover 2nd. Stand on the bag and call for it.',
        '1B': 'Cover 1st.',
        C: 'Cover home. Stay on the plate.',
        P: 'Back up home.',
        R2: 'Rounds 3rd and scores if the coach sends him.',
        B: 'Takes first. Stops if the ball is coming in.',
      },
      steps: [
        pitch(),
        {
          d: 1900, say: 'Single to right, runner on 2nd. 2B runs out to be the cutoff. P goes behind home.', focus: ['RF', '2B'],
          ball: { to: 'RF', kind: 'ground', at: [0, 0.9] },
          moves: {
            RF: { to: [58, 104], at: [0, 0.85] }, '2B': [32, 92], SS: 'ON2', '1B': 'ON1', P: [-4, -14],
            R2: { to: run('SECOND', 'THIRD', 0.45), at: [0.15, 1] }, B: { to: bat(0.36), at: [0.15, 1] },
          },
        },
        {
          d: 1200, say: 'RF throws to the cutoff. Runner rounds 3rd and the coach is waving him home.', focus: ['RF', '2B'],
          shout: { who: '2B', text: 'HERE!' },
          ball: { to: '2B', kind: 'throw', h: 7 },
          moves: { R2: run('THIRD', 'HOME', 0.3), B: bat(0.68) },
        },
        {
          d: 1300, say: '2B catches it on the move. No staring. The runner is going to score. Let him.', focus: ['2B', 'R2'],
          moves: { '2B': [20, 80], R2: run('THIRD', 'HOME', 0.8), B: 'FIRST' },
        },
        {
          d: 1000, say: 'One run scores. That\'s OK. Now protect the next runner.', focus: ['R2'],
          moves: { R2: 'HOME' },
          mark: { text: 'RUN', at: 'HOME', tone: 'safe' },
        },
        {
          d: 1100, say: '2B shows the ball to the batter and throws short to SS on 2nd. Batter stays on 1st.', focus: ['2B', 'SS'],
          ball: { to: 'SS', kind: 'throw', h: 3 },
          mark: { text: 'HELD', at: 'FIRST', tone: 'info' },
        },
      ],
      wrong: {
        label: 'Stares him down',
        steps: [
          pitch(),
          {
            d: 1900, say: 'Single to right, runner on 2nd. 2B is the cutoff.', focus: ['RF', '2B'],
            ball: { to: 'RF', kind: 'ground', at: [0, 0.9] },
            moves: {
              RF: { to: [58, 104], at: [0, 0.85] }, '2B': [32, 92], SS: 'ON2', '1B': 'ON1', P: [-4, -14],
              R2: { to: run('SECOND', 'THIRD', 0.45), at: [0.15, 1] }, B: { to: bat(0.36), at: [0.15, 1] },
            },
          },
          {
            d: 1200, say: 'RF hits the cutoff. Runner rounds 3rd.', focus: ['RF', '2B'],
            shout: { who: '2B', text: 'HERE!' },
            ball: { to: '2B', kind: 'throw', h: 7 },
            moves: { R2: run('THIRD', 'HOME', 0.15), B: bat(0.68) },
          },
          {
            d: 1300, say: '2B catches it, stops, and stares the runner down. He holds the ball...', focus: ['2B', 'R2'],
            moves: { R2: 'THIRD', B: 'FIRST' },
            mark: { text: 'STARE', at: '2B', tone: 'info' },
          },
          {
            d: 1100, say: 'The 3B coach doesn\'t care. He waves the runner home anyway. R2 goes!', focus: ['R2'],
            moves: { R2: run('THIRD', 'HOME', 0.4), B: run('FIRST', 'SECOND', 0.3) },
            mark: { text: 'GO!', at: 'THIRD', tone: 'info' },
          },
          {
            d: 1500, say: '2B panics and rushes a long throw home...', focus: ['2B'],
            ball: { to: [8, -34], kind: 'throw', h: 14 },
            moves: { R2: run('THIRD', 'HOME', 0.85), B: run('FIRST', 'SECOND', 0.7) },
          },
          {
            d: 1800, say: 'It sails past C. R2 scores and the batter takes 2nd. The stare bought nothing.', focus: ['R2', 'B'],
            ball: { to: [10, -50], kind: 'roll' },
            moves: { R2: 'HOME', B: 'SECOND', C: [4, -20] },
            mark: { text: 'SAFE', at: 'HOME', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 3, q: 'Single to right. R2 is scoring and 2B just caught the cutoff throw. What now?', options: ['Let the run score, keep it moving into the infield', 'Stop and stare the runner back', 'Fire a long throw home'], answer: 0, why: 'At 8U the runner is going anyway. Accept the run, don\'t throw it away, and keep the batter from taking 2nd.' },
    },

    ...loadedPlays(),
  );

  function loadedPlays() {
    const HOMEBACK = [-4, -14];
    const setup = (of) => {
      const cfg = {
        LF: { pos: [-62, 108], cut: 'SS', spot: [-26, 98], nm: 'left', cover: 'SS' },
        CF: { pos: [4, 114], cut: 'SS', spot: [-6, 100], nm: 'center', cover: '2B' },
        RF: { pos: [58, 104], cut: '2B', spot: [32, 92], nm: 'right', cover: 'SS' },
      }[of];
      return cfg;
    };
    const hit = (of) => {
      const c = setup(of);
      return {
        d: 1900, say: `Single to ${c.nm} with the bases loaded. ${c.cut} runs out as the cutoff, C stays home, P goes behind home.`, focus: [of, c.cut],
        ball: { to: of, kind: 'ground', at: [0, 0.9] },
        moves: {
          [of]: { to: c.pos, at: [0, 0.85] }, [c.cut]: c.spot, [c.cover]: 'ON2', '3B': 'ON3', '1B': 'ON1', P: HOMEBACK,
          R3: { to: run('THIRD', 'HOME', 0.5), at: [0.15, 1] }, R2: { to: run('SECOND', 'THIRD', 0.5), at: [0.15, 1] },
          R1: { to: run('FIRST', 'SECOND', 0.45), at: [0.15, 1] }, B: { to: bat(0.36), at: [0.15, 1] },
        },
      };
    };
    const wrong = (of, label) => {
      const c = setup(of);
      return {
        label,
        steps: [
          pitch(),
          { ...hit(of), say: `Same single to ${c.nm}, bases loaded.` },
          {
            d: 1600, say: `${of} skips the cutoff and winds up for a long throw home on the fly...`, focus: [of],
            ball: { to: [6, -34], kind: 'throw', h: 22 },
            moves: { R3: 'HOME', R2: run('THIRD', 'HOME', 0.3), R1: 'SECOND', B: bat(0.75) },
            mark: { text: 'RUN 1', at: 'HOME', tone: 'safe' },
          },
          {
            d: 1600, say: 'It sails over C into the backstop. Everybody sees it and takes off.', focus: ['C', 'R2'],
            ball: { to: [12, -52], kind: 'roll' },
            moves: { C: [8, -34], R2: 'HOME', R1: run('SECOND', 'THIRD', 0.7), B: run('FIRST', 'SECOND', 0.7) },
            mark: { text: 'RUN 2', at: 'HOME', tone: 'safe' },
          },
          {
            d: 1800, say: 'R1 scores too, and the batter ends up on 3rd. A single became three runs.', focus: ['R1', 'B'],
            ball: { to: 'C', kind: 'hand', at: [0.5, 0.9] },
            moves: { C: { to: 'HOME', at: [0.4, 1] }, R1: 'HOME', B: 'THIRD' },
            mark: { text: 'RUN 3', at: 'HOME', tone: 'safe' },
          },
        ],
      };
    };
    const base = (of) => {
      const c = setup(of);
      return {
        cat: 'cutoff',
        outs: 0,
        start: { runners: { R1: 'FIRST', R2: 'SECOND', R3: 'THIRD' } },
        wrong: wrong(of, `${of} throws home`),
        _c: c,
      };
    };
    const throwStep = (of) => {
      const c = setup(of);
      return {
        d: 1200, say: `${of} hits the cutoff. R3 scores easily. That's fine, it's one run.`, focus: [of, c.cut],
        shout: { who: c.cut, text: 'HERE!' },
        ball: { to: c.cut, kind: 'throw', h: 7 },
        moves: { R3: 'HOME', R2: run('THIRD', 'HOME', 0.15), R1: run('SECOND', 'THIRD', 0.2), B: bat(0.72) },
        mark: { text: 'RUN 1', at: 'HOME', tone: 'safe' },
      };
    };
    const jobs = (of, cut, cover) => ({
      [of]: `Charge it, field it, throw to ${cut}. Never home from deep.`,
      [cut]: 'Run out, hands up, yell. Catch it on the move, look at the batter, throw into the infield.',
      C: 'Stay home and cover the plate. Call "cutoff" or "hold it."',
      P: 'Back up home, behind the plate.',
      '3B': 'Cover 3rd. Stay on the bag.',
      [cover]: 'Cover 2nd. Stand on the bag and call for it.',
      '1B': 'Cover 1st.',
      R3: 'Scores.',
      B: 'Takes first. Stops if the ball is coming in.',
    });
    const cuesCommon = [
      'Bases loaded single: R3 scores. Accept it. One run is a win here.',
      'Goal: give up one run (maybe two), keep the batter at 1st, keep everybody else from moving up.',
      'Out at home ONLY if the runner is dead to rights. Otherwise the ball goes to the infield.',
      'Same jobs with 1st and 2nd loaded. There\'s just no R3 to score.',
    ];

    const left = { ...base('LF'), id: 'loaded-left', title: 'Bases loaded: single to left',
      blurb: 'Bases loaded, single to left. One run scores, SS is the cutoff, keep everybody else where they are.',
      cues: [...cuesCommon.slice(0, 2), 'LF to SS (the cutoff). C covers home, P backs up home, 3B holds 3rd, 2B covers 2nd.', cuesCommon[2], cuesCommon[3]],
      jobs: jobs('LF', 'SS', '2B'),
      steps: [
        pitch('Bases loaded! Before the pitch: everyone knows their spot. Runs are OK, extra bases are not.'),
        hit('LF'),
        throwStep('LF'),
        {
          d: 1300, say: 'SS catches it moving. R2 is held at 3rd, nobody is a sure out. No home throw.', focus: ['SS', 'R2'],
          moves: { SS: [-16, 78], R2: 'THIRD', R1: run('SECOND', 'THIRD', 0.2), B: 'FIRST' },
        },
        {
          d: 1200, say: 'SS throws short to the pitcher in the circle. Runners on 1st, 2nd, 3rd. One run in.', focus: ['SS', 'P'],
          ball: { to: 'P', kind: 'throw', h: 3 },
          moves: { P: [0, 34], R1: 'SECOND' },
          mark: { text: 'HELD', at: 'FIRST', tone: 'info' },
        },
      ],
      quiz: { at: 2, q: 'Bases loaded, single to left. LF fields it. Where does he throw?', options: ['SS, the cutoff', 'Home plate on the fly', 'Third base'], answer: 0, why: 'R3 scores no matter what. A long throw sails and lets everybody move up. The cutoff keeps it to one run.' },
    };
    delete left._c;

    const center = { ...base('CF'), id: 'loaded-center', title: 'Bases loaded: single to center',
      blurb: 'Bases loaded, single to center. Two runs may score. Don\'t chase them, keep the batter at 1st.',
      cues: [...cuesCommon.slice(0, 2), 'CF to SS (the cutoff). C covers home, P backs up home, 3B on 3rd, 2B covers 2nd.', 'If R2 is sent and would beat it, let him score. Two runs is OK. Never chase a third.', cuesCommon[2]],
      jobs: jobs('CF', 'SS', '2B'),
      steps: [
        pitch('Bases loaded! Before the pitch: everyone knows their spot. Runs are OK, extra bases are not.'),
        hit('CF'),
        throwStep('CF'),
        {
          d: 1300, say: 'SS catches it on the move. R2 was sent and he\'s going to score. Too late to get him. Let him.', focus: ['SS', 'R2'],
          moves: { SS: [-10, 78], R2: run('THIRD', 'HOME', 0.8), R1: run('SECOND', 'THIRD', 0.7), B: 'FIRST' },
        },
        {
          d: 1000, say: 'Two runs in. That\'s OK. Now stop the rest.', focus: ['R2', 'R1'],
          moves: { R2: 'HOME', R1: 'THIRD' },
          mark: { text: 'RUN 2', at: 'HOME', tone: 'safe' },
        },
        {
          d: 1200, say: 'SS shows the ball and throws short to 2B on the bag. Batter stays on 1st, R1 on 3rd.', focus: ['SS', '2B'],
          ball: { to: '2B', kind: 'throw', h: 3 },
          mark: { text: 'HELD', at: 'FIRST', tone: 'info' },
        },
      ],
      quiz: { at: 3, q: 'Bases loaded, single to center. R2 is scoring too. SS has the ball. What now?', options: ['Let it go, throw to the infield so the batter stays on 1st', 'Fire it home for R2', 'Stare at R1 until he stops'], answer: 0, why: 'R2 beats the throw. Two runs are gone either way. A hopeful throw home lets R1 and the batter move up.' },
    };
    delete center._c;

    const right = { ...base('RF'), id: 'loaded-right', title: 'Bases loaded: single to right',
      blurb: 'Bases loaded, single to right. 2B is the cutoff this time. One run in, hold the rest.',
      cues: [...cuesCommon.slice(0, 2), 'RF to 2B (the cutoff). SS covers 2nd. C covers home, P backs up home, 3B on 3rd, 1B on 1st.', 'Sure thing? If R2 is way late, C yells "HOME" and 2B makes ONE short, firm throw. Otherwise infield.', cuesCommon[2]],
      jobs: jobs('RF', '2B', 'SS'),
      steps: [
        pitch('Bases loaded! Before the pitch: everyone knows their spot. Runs are OK, extra bases are not.'),
        hit('RF'),
        throwStep('RF'),
        {
          d: 1300, say: '2B catches it moving. R2 is held at 3rd. Nobody is a sure out. No home throw.', focus: ['2B', 'R2'],
          moves: { '2B': [20, 80], R2: 'THIRD', R1: run('SECOND', 'THIRD', 0.2), B: 'FIRST' },
        },
        {
          d: 1200, say: '2B throws short to SS on 2nd. Bases still loaded, one run in.', focus: ['2B', 'SS'],
          ball: { to: 'SS', kind: 'throw', h: 3 },
          moves: { R1: 'SECOND' },
          mark: { text: 'HELD', at: 'FIRST', tone: 'info' },
        },
      ],
      quiz: { at: 3, q: 'Bases loaded, single to right. 2B caught the cutoff throw and R2 is held at 3rd. Where does it go?', options: ['Home, it\'s a sure out', 'Short, into the infield', 'Long throw to 3rd'], answer: 1, why: 'R2 stopped, R3 already scored. Nobody is dead to rights, so keep it in the infield and hold everyone.' },
    };
    delete right._c;
    return [left, center, right];
  }
})();
