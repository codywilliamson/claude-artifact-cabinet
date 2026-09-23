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
      title: 'Hit the cutoff',
      blurb: 'Single to left, runner on 1st. Throw to the cutoff and everybody freezes.',
      outs: 1,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Every ball in the outfield goes to the cutoff. Not 3rd, not home.',
        'Cutoff: hands up, yell "HERE! HERE!"',
        'Cutoff runs it toward the pitcher. Ball in the circle = play\'s over in most 8U leagues.',
      ],
      jobs: {
        LF: 'Charge it, field it, throw to SS at the cutoff.',
        SS: 'Run out toward LF. Hands up, yell.',
        '2B': 'Cover 2nd.',
        '3B': 'Cover 3rd.',
        P: 'Back up 3rd base.',
        R1: 'Goes to 2nd, looks at 3rd.',
        B: 'Round first.',
      },
      steps: [
        pitch(),
        lfSingle,
        {
          d: 1200, say: 'LF throws to the cutoff. Not to 3rd. Not home. Cutoff.', focus: ['LF', 'SS'],
          shout: { who: 'SS', text: 'HERE!' },
          ball: { to: 'SS', kind: 'throw', h: 7 },
          moves: { R1: run('FIRST', 'SECOND', 0.75), B: bat(0.66) },
        },
        {
          d: 1400, say: 'SS turns and runs it toward the pitcher. The runners freeze.', focus: ['SS'],
          moves: { SS: [-12, 66], R1: 'SECOND', B: 'FIRST', P: [-6, 36] },
          mark: { text: 'FROZEN', at: 'SECOND', tone: 'info' },
        },
        {
          d: 900, say: 'Ball to the pitcher. First and second, no extra bases.',
          ball: { to: 'P', kind: 'throw', h: 2 },
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
      quiz: { at: 2, q: 'Single to left, runner going to 2nd. LF has the ball. Where\'s the throw?', options: ['SS, the cutoff', '3rd base', 'Home plate'], answer: 0, why: 'A long throw at 8U almost never beats the runner, and a miss hands out free bases. The cutoff keeps it tight.' },
    },

    {
      id: 'cutoff-right',
      cat: 'cutoff',
      title: 'Right side cutoff: 2B',
      blurb: 'Single to right, runner on 2nd. 2B is the cutoff and looks the runner back.',
      outs: 0,
      start: { runners: { R2: 'SECOND' } },
      cues: [
        'Ball to right field: 2B is the cutoff.',
        'Ball to left or center: SS is the cutoff.',
        'Cutoff catches it, turns, and looks at the lead runner. He\'ll stop.',
      ],
      jobs: {
        RF: 'Charge it, field it, throw to 2B.',
        '2B': 'Run out toward RF, hands up. Catch, turn, look at the runner.',
        SS: 'Cover 2nd.',
        '1B': 'Cover 1st.',
        P: 'Back up home.',
        R2: 'Rounds 3rd, sees the ball in the infield, goes back.',
        B: 'Takes first.',
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
          d: 1200, say: 'RF throws to the cutoff. Runner rounds 3rd, thinking about home.', focus: ['RF', '2B'],
          shout: { who: '2B', text: 'HERE!' },
          ball: { to: '2B', kind: 'throw', h: 7 },
          moves: { R2: run('THIRD', 'HOME', 0.15), B: bat(0.68) },
        },
        {
          d: 1400, say: '2B catches, turns, and stares down the runner. He sees the ball in and goes back to 3rd.', focus: ['2B', 'R2'],
          moves: { '2B': [18, 76], R2: 'THIRD', B: 'FIRST' },
          mark: { text: 'HOLDS', at: 'THIRD', tone: 'info' },
        },
        {
          d: 900, say: 'Ball to the pitcher. No run scored.',
          ball: { to: 'P', kind: 'throw', h: 4 },
          moves: { P: [0, 30] },
        },
      ],
      quiz: { at: 2, q: 'Single to right, runner rounding 3rd. RF has it. Where\'s the throw?', options: ['2B, the cutoff', 'Home plate', 'Third base'], answer: 0, why: 'The cutoff gets it back to the infield fast. At 8U, a ball in the infield stops runners cold.' },
    },
  );
})();
