(() => {
  const { run, bat, pitch } = DG.kit;

  const ssHit = (say) => ({
    d: 1200, say, focus: ['SS'],
    moves: { B: { to: bat(0.2), at: [0.25, 1] }, '1B': 'ON1', LF: { to: [-50, 106], at: [0.2, 1] } },
  });

  const thirdGrounder = (backups) => ({
    d: 1200, say: 'Grounder to third. The second it\'s hit, RF and C are already moving to back up first.', focus: backups ? ['RF', 'C'] : ['3B'],
    ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
    moves: { '3B': { to: [-44, 60], at: [0, 0.9] }, '1B': 'ON1', B: { to: bat(0.2), at: [0.25, 1] }, ...(backups && { RF: [70, 82], C: [8, 4] }) },
  });

  DG.plays.push(
    {
      id: 'belly-button',
      cat: 'front',
      title: 'Belly button to the ball',
      blurb: 'Grounder to the SS\'s right. Shuffle over and get the body in front, don\'t reach.',
      outs: 0,
      cues: [
        'Move your feet first, then your glove.',
        'Belly button on the ball. If it bounces funny, it hits you and stays in front.',
        'Glove fingers touch the dirt. It\'s easier to come up than go down.',
      ],
      jobs: {
        SS: 'Shuffle right, body in front, field it, crow hop, throw to first.',
        LF: 'Charge in behind SS in case it gets through.',
        '1B': 'Cover first.',
        B: 'Run hard.',
      },
      steps: [
        pitch(),
        {
          ...ssHit('Ball\'s hit to his right. Don\'t reach! Shuffle the feet and get the belly button on the ball.'),
          ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
          moves: { ...ssHit().moves, SS: { to: [-31, 77], at: [0, 0.8] } },
        },
        {
          d: 700, say: 'Glove down, fingers in the dirt. Even a bad hop hits his body and stays in front.', focus: ['SS'],
          moves: { SS: [-30, 75.5], B: bat(0.36), LF: [-44, 97] },
        },
        {
          d: 1100, say: 'Crow hop, glove shoulder points at first, throw.', focus: ['SS', '1B'],
          ball: { to: '1B', kind: 'throw', h: 7 },
          moves: { B: bat(0.64), C: [14, 10] },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1100, say: 'Out! LF was already charging behind him, just in case.',
          moves: { B: bat(0.88) },
        },
      ],
      wrong: {
        label: 'Reaches to the side',
        steps: [
          pitch(),
          {
            ...ssHit('Same ball to his right. He stays flat-footed and stabs sideways with the glove...'),
            ball: { to: [-36, 88], kind: 'ground' },
            moves: { ...ssHit().moves, SS: { to: [-27, 79], at: [0.3, 0.8] } },
          },
          {
            d: 1300, say: 'It skips under the glove and into left field.', focus: ['LF'],
            ball: { to: 'LF', kind: 'roll' },
            moves: { LF: [-44, 106], B: bat(0.52), SS: [-24, 86] },
            mark: { text: 'THROUGH', at: [-34, 94], tone: 'info' },
          },
          {
            d: 2000, say: 'Batter\'s safe at first and thinking about second. An out became a base hit.', focus: ['B'],
            ball: { to: 'SS', kind: 'throw', h: 8, at: [0.3, 1] },
            moves: { B: 'FIRST', SS: [-14, 86] },
            mark: { text: 'SAFE', at: 'FIRST', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'Ground ball is coming to your right side. What moves first?', options: ['My feet', 'My glove', 'Nothing, wait for it'], answer: 0, why: 'Feet get the body in front. A glove stuck out to the side is how balls get through.' },
    },

    {
      id: 'knock-it-down',
      cat: 'front',
      title: 'Knock it down',
      blurb: 'A rocket at third. Can\'t catch it clean? Block it. A ball in front is still an out.',
      outs: 1,
      cues: [
        'Too hard to catch? Knock it down with anything: glove, chest, knees.',
        '8U runners are slow. You have more time than you think.',
        'The only bad play is letting it get behind you.',
      ],
      jobs: {
        '3B': 'Stay square, knock it down, pick it up, throw to first.',
        SS: 'Slide over behind 3B.',
        C: 'Back up first down the line.',
        B: 'Run hard.',
      },
      steps: [
        pitch(),
        {
          d: 650, say: 'Rocket at third! Too hard to catch clean...', focus: ['3B'],
          ball: { to: [-47, 57], kind: 'ground' },
          moves: { '3B': { to: [-47, 56], at: [0, 0.6] }, '1B': 'ON1', SS: [-34, 72], B: { to: bat(0.08), at: [0.4, 1] } },
        },
        {
          d: 650, say: 'He stays in front. It smacks his chest and drops right at his feet. That\'s a WIN.', focus: ['3B'],
          shout: { who: '3B', text: 'OOF!' },
          ball: { to: [-44, 62], kind: 'roll' },
          moves: { B: bat(0.22) },
        },
        {
          d: 700, say: 'Pick it up. Don\'t panic, there\'s time.', focus: ['3B'],
          ball: { to: '3B', kind: 'hand', at: [0.4, 1] },
          moves: { '3B': [-43, 61], B: bat(0.38), C: [10, 6] },
        },
        {
          d: 1300, say: 'Crow hop. Throw across the diamond.', focus: ['3B', '1B'],
          ball: { to: '1B', kind: 'throw', h: 8 },
          moves: { B: bat(0.7), C: [16, 11] },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 900, say: 'Out! A ball that stays in front of you is always still alive.',
          moves: { B: bat(0.9) },
        },
      ],
    },

    {
      id: 'pop-up-call-it',
      cat: 'talk',
      title: 'Pop-up: call it twice',
      blurb: 'High pop between 1B, 2B and the pitcher. Loud and early wins.',
      outs: 1,
      cues: [
        'Call it twice, loud: "I got it! I got it!"',
        'Hear a call? Peel away and point at the ball.',
        'Two hands, catch it above your forehead.',
      ],
      jobs: {
        '2B': 'Call it early and loud. Catch it with two hands.',
        '1B': 'Drift in, hear the call, peel off and point.',
        P: 'Drift over, hear the call, get out of the way.',
        B: 'Run anyway. Pop-ups get dropped.',
      },
      steps: [
        pitch(),
        {
          d: 2800, say: 'Pop-up way up between three players. 2B calls it early: "I got it! I got it!"', focus: ['2B'],
          shout: { who: '2B', text: 'I GOT IT!', from: 0.25 },
          ball: { to: '2B', kind: 'pop', at: [0, 1] },
          moves: { '2B': { to: [30, 66], at: [0.1, 0.8] }, '1B': { to: [42, 60], at: [0.1, 0.6] }, P: { to: [14, 48], at: [0.1, 0.6] }, B: { to: bat(0.45), at: [0.1, 1] } },
        },
        {
          d: 1100, say: 'Two hands, above the forehead. Everyone else stopped and pointed.', focus: ['2B'],
          moves: { '1B': [44, 56], P: [10, 44], B: bat(0.65) },
          mark: { text: 'OUT', at: '2B', tone: 'out' },
        },
      ],
      wrong: {
        label: 'Nobody calls it',
        steps: [
          pitch(),
          {
            d: 2800, say: 'Same pop-up. Nobody says a word. All three keep coming...', focus: ['2B', '1B', 'P'],
            ball: { to: [31, 63], kind: 'pop' },
            moves: { '2B': { to: [29, 67], at: [0.1, 0.9] }, '1B': { to: [36, 61], at: [0.1, 0.9] }, P: { to: [26, 57], at: [0.1, 0.9] }, B: { to: bat(0.45), at: [0.1, 1] } },
          },
          {
            d: 1400, say: 'They all pull up at the last second. It drops right between them.', focus: ['B'],
            ball: { to: [33, 58], kind: 'roll' },
            moves: { B: 'FIRST' },
            mark: { text: 'DROPPED', at: [31, 70], tone: 'info' },
          },
          {
            d: 1000, say: 'Easiest out in baseball, gone. Batter\'s safe.',
            mark: { text: 'SAFE', at: 'FIRST', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'Pop-up between you and two teammates. What do you do?', options: ['Yell "I got it!" twice, loud', 'Run to it quietly', 'Wait and see who gets there'], answer: 0, why: 'The loud call is what keeps three kids from colliding. First loud call owns it.' },
    },

    {
      id: 'back-up-first',
      cat: 'talk',
      title: 'Back up first base',
      blurb: 'Throw sails over first. With a backup, it\'s nothing. Without one, it\'s a triple.',
      outs: 0,
      cues: [
        'Every throw needs someone behind it.',
        'RF backs up first on every infield grounder.',
        'C runs down the line on every ground ball with nobody on.',
      ],
      jobs: {
        RF: 'On contact, sprint to a spot behind first in foul ground.',
        C: 'Run down the line behind first.',
        '3B': 'Field it and throw to first.',
        '1B': 'Cover the bag. If it\'s over your head, let it go to the backup.',
        '2B': 'Cover 2nd once the ball gets away.',
        B: 'Run through first, look for the overthrow.',
      },
      steps: [
        pitch(),
        thirdGrounder(true),
        {
          d: 700, say: '3B sets his feet. RF is almost behind first already.', focus: ['RF'],
          moves: { '3B': [-43, 59], B: bat(0.36), RF: [64, 52], C: [14, 9] },
        },
        {
          d: 1100, say: 'Throw sails high, over the first baseman...', focus: ['RF'],
          ball: { to: 'RF', kind: 'throw', h: 14 },
          moves: { '1B': [41, 46], RF: [58, 38], B: bat(0.66), '2B': 'ON2' },
          mark: { text: 'OVERTHROW', at: 'FIRST', tone: 'info' },
        },
        {
          d: 1400, say: 'RF was right there. Throw to 2nd, runner has to stop at first. No damage.',
          ball: { to: '2B', kind: 'throw', h: 6, at: [0.2, 1] },
          moves: { B: 'FIRST' },
          mark: { text: 'HELD', at: 'FIRST', tone: 'info' },
        },
      ],
      wrong: {
        label: 'Nobody backs up',
        steps: [
          pitch(),
          thirdGrounder(false),
          {
            d: 700, say: '3B sets his feet. RF is standing still way out in right.', focus: ['RF'],
            moves: { '3B': [-43, 59], B: bat(0.36) },
          },
          {
            d: 1100, say: 'Throw sails high, over the first baseman...',
            ball: { to: [58, 34], kind: 'throw', h: 14 },
            moves: { '1B': [41, 46], B: bat(0.66) },
          },
          {
            d: 1500, say: 'Nobody behind first. It rolls all the way to the fence.', focus: ['RF'],
            ball: { to: [90, 30], kind: 'roll' },
            moves: { B: 'FIRST', RF: [84, 70] },
          },
          {
            d: 1600, say: 'RF finally tracks it down...',
            ball: { to: 'RF', kind: 'hand', at: [0.6, 0.8] },
            moves: { RF: [88, 34], B: run('FIRST', 'SECOND', 0.45), '2B': 'ON2' },
          },
          {
            d: 1800, say: 'Batter cruises into 2nd. A routine grounder turned into a double.',
            ball: { to: '2B', kind: 'throw', h: 10 },
            moves: { B: 'SECOND' },
            mark: { text: 'SAFE', at: 'SECOND', tone: 'safe' },
          },
        ],
      },
    },
  );
})();
