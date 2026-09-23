(() => {
  const { run, bat, pitch } = DG.kit;

  DG.plays.push(
    {
      id: 'sure-out-first',
      cat: 'force',
      title: 'Sure out at first',
      blurb: 'Nobody on. Grounder to 2B. The easiest out in baseball, if everyone does their job.',
      outs: 0,
      cues: [
        'Nobody on base means the throw goes to first. Every time.',
        'Get in front: belly button to the ball, glove on the dirt.',
        'Backups move on contact: RF runs behind first, C runs down the line.',
      ],
      jobs: {
        '2B': 'Field it in front, set your feet, throw to first.',
        '1B': 'Get to the bag on contact. Foot on the base, glove up as a target.',
        RF: 'Sprint in behind first base in case the throw gets away.',
        C: 'Run down the first base line (in foul ground) to back up.',
        P: 'Get out of the way of the ball, then watch the play.',
        B: 'Run hard through the bag. Don\'t slow down before it.',
      },
      steps: [
        pitch(),
        {
          d: 1200, say: 'Crack! Grounder to second. 1B hustles to the bag, backups start moving right now.', focus: ['2B'],
          ball: { to: '2B', kind: 'ground', at: [0, 0.9] },
          moves: { '2B': { to: [22, 74], at: [0, 0.85] }, '1B': { to: 'ON1', at: [0.1, 1] }, B: { to: bat(0.2), at: [0.25, 1] }, RF: [70, 92], C: [6, 2] },
        },
        {
          d: 700, say: 'Field it: feet wide, glove down, eyes watch it all the way in.', focus: ['2B'],
          moves: { '2B': [23, 72], B: bat(0.38), RF: [67, 66], C: [12, 8] },
        },
        {
          d: 900, say: 'Throw to first. 1B stretches toward the throw, foot stays on the bag.', focus: ['2B', '1B'],
          ball: { to: '1B', kind: 'throw', h: 5 },
          moves: { '1B': [39, 46], B: bat(0.7), RF: [63, 44], C: [17, 12] },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1300, say: 'Out! RF and C were already behind first in case it got away. That\'s a team play.', focus: ['RF', 'C'],
          moves: { B: bat(0.95), RF: [60, 38], C: [20, 14] },
        },
      ],
      quiz: { at: 3, q: 'Nobody on base. 2B has the ball. Where does it go?', options: ['First base', 'Second base', 'Home plate'], answer: 0, why: 'With nobody on, the only force is at first. Take the sure out.' },
    },

    {
      id: 'closest-base',
      cat: 'force',
      title: 'Closest base: take it yourself',
      blurb: 'Runner on 1st, grounder near 2nd. Your feet beat any throw.',
      outs: 1,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Runner on 1st means a force at 2nd.',
        'If you\'re closer to the bag than any teammate, run and step on it.',
        'One sure out beats two wild throws. Then run the ball in.',
      ],
      jobs: {
        SS: 'Field it, then run to 2nd and step on it. Then run the ball to the pitcher.',
        '2B': 'Start toward 2nd to cover, then back up the SS.',
        CF: 'Run in behind 2nd base in case of a bobble.',
        '1B': 'Cover first base.',
        R1: 'Forced to run on a ground ball.',
        B: 'Run hard through first.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Grounder to short, just a few steps from 2nd. Runner on 1st has to go.', focus: ['SS'],
          ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
          moves: { SS: { to: [-9, 77], at: [0, 0.9] }, R1: { to: run('FIRST', 'SECOND', 0.2), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] }, '2B': [12, 82], '1B': 'ON1', CF: [2, 118] },
        },
        {
          d: 900, say: 'He\'s closest to 2nd. No throw needed. Run and step on the bag!', focus: ['SS'],
          moves: { SS: [-1, 84], R1: run('FIRST', 'SECOND', 0.45), B: bat(0.38), CF: [2, 106], '2B': [8, 88] },
          mark: { text: 'OUT', at: 'SECOND', tone: 'out' },
        },
        {
          d: 1400, say: 'Got the lead runner. Look at first, and if it\'s close, don\'t force it. Run it in to the pitcher.', focus: ['SS'],
          moves: { SS: [-2, 58], R1: [16, 98], B: 'FIRST' },
          mark: { text: 'RUN IT IN', at: 'SS', tone: 'info' },
        },
        {
          d: 800, say: 'Ball back to the pitcher. Play\'s dead. That\'s how innings end at 8U.',
          ball: { to: 'P', kind: 'throw', h: 2 },
        },
      ],
      quiz: { at: 2, q: 'Runner on 1st. You field it right next to 2nd base. What\'s the play?', options: ['Step on 2nd myself', 'Throw to first', 'Chase the runner'], answer: 0, why: 'It\'s a force at 2nd and you\'re the closest. Your feet beat any throw.' },
    },

    {
      id: 'right-side-feed',
      cat: 'force',
      title: 'Right side: SS covers 2nd',
      blurb: 'Runner on 1st, grounder to 2B. Who covers the bag?',
      outs: 0,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Ball hit to the right side: SS covers 2nd.',
        'Ball hit to the left side: 2B covers 2nd.',
        'Cover like a first baseman: foot on the bag, glove as a target, yell "HERE!"',
      ],
      jobs: {
        '2B': 'Field it and make a short, firm throw to SS at 2nd.',
        SS: 'Sprint to 2nd on contact. Give a target and yell.',
        LF: 'Come in to back up the throw to 2nd.',
        '1B': 'Cover first base.',
        R1: 'Forced to run.',
        B: 'Run hard through first.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Grounder to second, runner on 1st. SS breaks for the bag right on contact.', focus: ['2B', 'SS'],
          ball: { to: '2B', kind: 'ground', at: [0, 0.9] },
          moves: { '2B': { to: [20, 74], at: [0, 0.9] }, SS: { to: 'ON2', at: [0.15, 1] }, R1: { to: run('FIRST', 'SECOND', 0.22), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] }, '1B': 'ON1', LF: [-34, 108] },
        },
        {
          d: 700, say: 'SS gets to the bag and gives a target: "HERE! HERE!"', focus: ['SS'],
          shout: { who: 'SS', text: 'HERE!' },
          moves: { '2B': [19, 73], R1: run('FIRST', 'SECOND', 0.4), B: bat(0.34), LF: [-24, 100] },
        },
        {
          d: 800, say: 'Short, firm throw. Chest high. SS catches with a foot on the bag.', focus: ['2B', 'SS'],
          ball: { to: 'SS', kind: 'throw', h: 3 },
          moves: { R1: run('FIRST', 'SECOND', 0.62), B: bat(0.5) },
          mark: { text: 'OUT', at: 'SECOND', tone: 'out' },
        },
        {
          d: 1200, say: 'Force out at 2nd. No tag needed on a force, just the bag.',
          moves: { R1: [14, 98], B: 'FIRST', SS: [-2, 68] },
        },
      ],
      quiz: { at: 1, q: 'Runner on 1st. Ball is about to be hit to the 2B. Who covers 2nd base?', options: ['Shortstop', 'Second baseman', 'Pitcher'], answer: 0, why: 'Right side ball, SS covers. Left side ball, 2B covers. The fielder never covers his own throw.' },
    },

    {
      id: 'bases-loaded-home',
      cat: 'force',
      title: 'Bases loaded: go home',
      blurb: 'Comebacker to the pitcher. Every base is a force, and home stops the run.',
      outs: 1,
      start: { runners: { R1: 'FIRST', R2: 'SECOND', R3: 'THIRD' } },
      cues: [
        'Bases loaded = a force at every base, including home.',
        'Home is the out that saves a run.',
        'C: foot on the plate like a first baseman. No tag needed.',
      ],
      jobs: {
        P: 'Field it, turn, soft throw home.',
        C: 'Stand on the front of the plate, glove up, yell "HOME!"',
        '1B': 'Cover first.',
        '3B': 'Cover third.',
        R3: 'Forced home. Run!',
        R2: 'Forced to 3rd.',
        R1: 'Forced to 2nd.',
        B: 'Run to first.',
      },
      steps: [
        pitch('Bases loaded. Before the pitch, everybody knows: ball to me, I\'m going HOME.'),
        {
          d: 800, say: 'Comebacker right to the pitcher! Every runner has to go.', focus: ['P'],
          ball: { to: 'P', kind: 'ground', at: [0, 0.9] },
          moves: {
            P: { to: [0, 34], at: [0.1, 0.9] }, C: { to: 'ONH', at: [0.2, 1] }, '1B': 'ON1', '3B': 'ON3',
            R3: { to: run('THIRD', 'HOME', 0.18), at: [0.2, 1] }, R2: { to: run('SECOND', 'THIRD', 0.18), at: [0.2, 1] },
            R1: { to: run('FIRST', 'SECOND', 0.18), at: [0.2, 1] }, B: { to: bat(0.14), at: [0.2, 1] },
          },
        },
        {
          d: 600, say: 'Catcher yells for it. Home is closest to the runner who would score.', focus: ['P', 'C'],
          shout: { who: 'C', text: 'HOME!' },
          moves: { R3: run('THIRD', 'HOME', 0.34), R2: run('SECOND', 'THIRD', 0.34), R1: run('FIRST', 'SECOND', 0.34), B: bat(0.28) },
        },
        {
          d: 700, say: 'Soft throw home. Catcher steps on the plate.', focus: ['C'],
          ball: { to: 'C', kind: 'throw', h: 3 },
          moves: { R3: run('THIRD', 'HOME', 0.52), R2: run('SECOND', 'THIRD', 0.5), R1: run('FIRST', 'SECOND', 0.5), B: bat(0.44) },
          mark: { text: 'OUT', at: 'HOME', tone: 'out' },
        },
        {
          d: 1300, say: 'Out at home, run saved. Force play, so no tag. Ball back to the pitcher.',
          ball: { to: 'P', kind: 'throw', h: 2, at: [0.5, 1] },
          moves: { R3: [-22, -6], R2: 'THIRD', R1: 'SECOND', B: 'FIRST' },
        },
      ],
      quiz: { at: 2, q: 'Bases loaded, comebacker to the pitcher. Best play?', options: ['Throw home', 'Throw to first', 'Run at the runner'], answer: 0, why: 'Every base is a force. Home is a short throw AND it stops the run.' },
    },

    {
      id: 'is-it-a-force',
      cat: 'force',
      title: 'Is it a force?',
      blurb: 'Runner on 2nd only, grounder to 3B. Stepping on 3rd does nothing.',
      outs: 0,
      start: { runners: { R2: 'SECOND' } },
      cues: [
        'A runner is only forced when the base behind him gets filled.',
        'Runner on 2nd alone? First base is empty, so no force at 3rd.',
        'When in doubt, take the sure out at first.',
      ],
      jobs: {
        '3B': 'Field it, ignore the runner, throw to first.',
        '1B': 'Cover the bag.',
        SS: 'Back up behind 3B.',
        RF: 'Back up first base.',
        R2: 'Not forced. At 8U he\'ll usually go anyway.',
        B: 'Run hard through first.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Grounder to third. The runner on 2nd takes off (8U runners always do).', focus: ['3B'],
          ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
          moves: { '3B': { to: [-44, 59], at: [0, 0.9] }, R2: { to: run('SECOND', 'THIRD', 0.25), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] }, '1B': 'ON1', SS: [-36, 72], RF: [72, 96] },
        },
        {
          d: 900, say: 'First base is open behind that runner, so he\'s NOT forced. Stepping on 3rd won\'t get him.', focus: ['3B', 'R2'],
          moves: { '3B': [-42, 58], R2: run('SECOND', 'THIRD', 0.55), B: bat(0.36), RF: [68, 70] },
          mark: { text: 'NO FORCE', at: 'THIRD', tone: 'info' },
        },
        {
          d: 1200, say: 'Big throw across to first. Step toward your target.', focus: ['3B', '1B'],
          ball: { to: '1B', kind: 'throw', h: 7 },
          moves: { R2: 'THIRD', B: bat(0.66), RF: [64, 50], C: [16, 10] },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1100, say: 'Out at first. Runner got to 3rd, and that\'s fine. We got an out.',
          moves: { B: bat(0.9), RF: [62, 42] },
        },
      ],
      wrong: {
        label: 'Steps on 3rd anyway',
        steps: [
          pitch(),
          {
            d: 1100, say: 'Same grounder to third, runner on 2nd takes off.', focus: ['3B'],
            ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
            moves: { '3B': { to: [-44, 59], at: [0, 0.9] }, R2: { to: run('SECOND', 'THIRD', 0.25), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] }, '1B': 'ON1' },
          },
          {
            d: 900, say: '3B runs over and steps on the bag like it\'s a force...', focus: ['3B'],
            moves: { '3B': 'ON3', R2: run('SECOND', 'THIRD', 0.6), B: bat(0.38) },
          },
          {
            d: 1400, say: 'Runner slides in. No force, so he needed a TAG. Safe at 3rd, and safe at first too.', focus: ['R2', 'B'],
            moves: { R2: 'THIRD', B: 'FIRST' },
            mark: { text: 'SAFE', at: 'THIRD', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 2, q: 'Runner on 2nd only. 3B has the ball. Can he just step on 3rd for the out?', options: ['No, throw to first', 'Yes, step on 3rd', 'Yes, throw to 2nd'], answer: 0, why: 'First base was empty, so the runner wasn\'t forced. Only a tag gets him. Take the sure out at first.' },
    },

    {
      id: 'first-baseman-unassisted',
      cat: 'force',
      title: '1B takes it himself',
      blurb: 'Grounder to first, close to the bag. Wave everybody off and step on it.',
      outs: 2,
      cues: [
        'If you field it close to the bag, you ARE the play. Run to it.',
        'Call it loud so the pitcher knows.',
        'Pitcher: any ball to the right side, break toward first.',
      ],
      jobs: {
        '1B': 'Field it, yell "I got it!", beat the runner to the bag.',
        P: 'Break toward first on contact in case 1B needs a cover.',
        '2B': 'Back up behind 1B.',
        B: 'Run hard.',
      },
      steps: [
        pitch(),
        {
          d: 1000, say: 'Grounder to the first baseman, just a few steps off the bag. Pitcher breaks toward first.', focus: ['1B', 'P'],
          ball: { to: '1B', kind: 'ground', at: [0, 0.9] },
          moves: { '1B': { to: [46, 61], at: [0, 0.9] }, P: { to: [18, 40], at: [0.2, 1] }, '2B': [40, 78], B: { to: bat(0.16), at: [0.25, 1] } },
        },
        {
          d: 1100, say: 'He\'s closest. "I GOT IT!" Pitcher peels off. 1B runs and steps on the bag.', focus: ['1B'],
          shout: { who: '1B', text: 'I GOT IT!' },
          moves: { '1B': 'ON1', P: [30, 38], B: bat(0.42) },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1200, say: 'Three outs, hustle in! Pitcher was right there in case he needed a cover.',
          moves: { P: [34, 40], B: bat(0.72) },
        },
      ],
    },
  );
})();
