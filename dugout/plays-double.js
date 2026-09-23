(() => {
  const { run, bat, pitch } = DG.kit;
  const DP_SPOT = [0, 50];
  const dpMark = { text: 'DOUBLE PLAY', at: DP_SPOT, tone: 'info' };

  const ssGrounder = {
    d: 1100, say: 'Grounder to short, runner on 1st. 2B sprints to the bag. Double play is on.', focus: ['SS', '2B'],
    shout: { who: '2B', text: 'HERE!', from: 0.55 },
    ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
    moves: {
      SS: { to: [-18, 76], at: [0, 0.9] }, '2B': { to: 'ON2', at: [0.15, 1] }, '1B': 'ON1', CF: [0, 118],
      R1: { to: run('FIRST', 'SECOND', 0.2), at: [0.25, 1] }, B: { to: bat(0.15), at: [0.25, 1] },
    },
  };

  const firstBaseGrounder = {
    d: 1000, say: 'Grounder to 1B right by the bag, runner on 1st.', focus: ['1B'],
    ball: { to: '1B', kind: 'ground', at: [0, 0.9] },
    moves: {
      '1B': { to: [44, 58], at: [0, 0.9] }, SS: { to: 'ON2', at: [0.15, 1] }, '2B': [30, 74], P: [18, 40],
      R1: { to: run('FIRST', 'SECOND', 0.2), at: [0.25, 1] }, B: { to: bat(0.16), at: [0.25, 1] },
    },
  };

  const stepOnFirst = {
    d: 600, say: '1B steps on first. Batter\'s out. That\'s one.', focus: ['1B'],
    moves: { '1B': 'ON1', R1: run('FIRST', 'SECOND', 0.42), B: bat(0.32) },
    mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
  };

  DG.plays.push(
    {
      id: 'dp-6-4-3',
      cat: 'double',
      title: '6-4-3 double play',
      blurb: 'Grounder to short, runner on 1st. Short to second to first.',
      outs: 0,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Get the lead runner first. The second out is a bonus.',
        'Feed it firm and chest high. No rainbows.',
        '2B: catch it, drag your foot across the bag, square to first, throw.',
      ],
      jobs: {
        SS: 'Field it, set your feet, firm feed to 2B at the bag.',
        '2B': 'Sprint to 2nd on contact. Catch, foot on the bag, turn and throw to first.',
        '1B': 'Get to the bag, stretch for the second throw.',
        CF: 'Charge in behind 2nd in case the feed gets away.',
        R1: 'Forced. Run hard and slide.',
        B: 'Run hard, it\'s a race with the second throw.',
      },
      steps: [
        pitch(),
        ssGrounder,
        {
          d: 650, say: 'Feed to 2B. Firm, chest high. Lead runner first.', focus: ['SS', '2B'],
          ball: { to: '2B', kind: 'throw', h: 3 },
          moves: { R1: run('FIRST', 'SECOND', 0.45), B: bat(0.32) },
          mark: { text: 'OUT', at: 'SECOND', tone: 'out' },
        },
        {
          d: 450, say: '2B drags his foot across the bag and squares up to first, out of the runner\'s way.', focus: ['2B'],
          moves: { '2B': [5, 81], R1: [12, 95], B: bat(0.45) },
        },
        {
          d: 800, say: 'Throw to first. 1B stretches.', focus: ['2B', '1B'],
          ball: { to: '1B', kind: 'throw', h: 5 },
          moves: { '1B': [39, 46], B: bat(0.72) },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1400, say: 'Two outs on one ball. And if the batter beats the second throw? Still a win. We got the lead runner.',
          moves: { B: bat(0.95) },
          mark: dpMark,
        },
      ],
      wrong: {
        label: 'Rushes the feed',
        steps: [
          pitch(),
          ssGrounder,
          {
            d: 800, say: 'SS is thinking about two before he has one. He rushes the feed without setting his feet...', focus: ['SS'],
            ball: { to: [10, 98], kind: 'throw', h: 5 },
            moves: { '2B': [3, 86], R1: run('FIRST', 'SECOND', 0.5), B: bat(0.34) },
          },
          {
            d: 1400, say: 'It sails past 2B into center. CF was backing up, but now nobody is out.', focus: ['CF'],
            ball: { to: 'CF', kind: 'roll' },
            moves: { CF: [6, 108], R1: 'SECOND', B: 'FIRST' },
            mark: { text: 'SAFE', at: 'SECOND', tone: 'safe' },
          },
          {
            d: 1000, say: 'Zero outs instead of two. Get the first one, THEN think about two.',
            mark: { text: 'SAFE', at: 'FIRST', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 2, q: 'Runner on 1st, grounder to you at short. Which out do you get FIRST?', options: ['The lead runner at 2nd', 'The batter at 1st', 'Tag the runner going by'], answer: 0, why: 'Lead runner first. If the second throw doesn\'t make it, you still got the out that matters most.' },
    },

    {
      id: 'dp-4-6-3',
      cat: 'double',
      title: '4-6-3 double play',
      blurb: 'Grounder to second, runner on 1st. SS takes the feed and turns it.',
      outs: 1,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Right side ball: SS covers 2nd.',
        'Short feed from 2B. Underhand is fine if you\'re close.',
        'SS: foot across the bag, move away from the runner, throw.',
      ],
      jobs: {
        '2B': 'Field it, short firm feed to SS.',
        SS: 'Sprint to 2nd, catch the feed, drag the bag, throw to first.',
        '1B': 'Cover the bag.',
        LF: 'Come in to back up 2nd.',
        R1: 'Forced. Run hard.',
        B: 'Run hard.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Grounder to second, runner on 1st. SS races to the bag.', focus: ['2B', 'SS'],
          shout: { who: 'SS', text: 'HERE!', from: 0.55 },
          ball: { to: '2B', kind: 'ground', at: [0, 0.9] },
          moves: {
            '2B': { to: [20, 73], at: [0, 0.9] }, SS: { to: 'ON2', at: [0.15, 1] }, '1B': 'ON1', LF: [-34, 108],
            R1: { to: run('FIRST', 'SECOND', 0.22), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] },
          },
        },
        {
          d: 700, say: 'Short feed to SS. Chest high.', focus: ['2B', 'SS'],
          ball: { to: 'SS', kind: 'throw', h: 3 },
          moves: { SS: [2, 84], R1: run('FIRST', 'SECOND', 0.45), B: bat(0.34) },
          mark: { text: 'OUT', at: 'SECOND', tone: 'out' },
        },
        {
          d: 450, say: 'SS drags his foot across the bag and steps toward first, away from the slide.', focus: ['SS'],
          moves: { SS: [5, 86], R1: [-10, 96], B: bat(0.47) },
        },
        {
          d: 900, say: 'Throw to first.', focus: ['SS', '1B'],
          ball: { to: '1B', kind: 'throw', h: 6 },
          moves: { '1B': [39, 46], B: bat(0.75) },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1300, say: 'Inning over. Hustle in!',
          moves: { B: bat(0.95) },
          mark: dpMark,
        },
      ],
      quiz: { at: 3, q: 'SS just got the force at 2nd. What now?', options: ['Throw to first', 'Tag the runner too', 'Hold the ball'], answer: 0, why: 'The batter is forced at first too. Throw it. No tag needed on a force.' },
    },

    {
      id: 'dp-ss-unassisted',
      cat: 'double',
      title: 'Step and throw',
      blurb: 'Grounder right by 2nd. SS steps on the bag himself, then throws to first.',
      outs: 0,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Closest to the bag? Your feet are the feed.',
        'Step on 2nd while you\'re already moving toward first.',
        'The easiest double play there is at 8U.',
      ],
      jobs: {
        SS: 'Field it, step on 2nd, keep moving toward first, throw.',
        '2B': 'Head for 2nd, see SS has it, back him up.',
        '1B': 'Cover the bag.',
        CF: 'Charge in behind 2nd.',
        R1: 'Forced. Run hard.',
        B: 'Run hard.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Grounder right by the bag, runner on 1st. SS is the closest. No feed needed.', focus: ['SS'],
          ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
          moves: {
            SS: { to: [-6, 79], at: [0, 0.9] }, '2B': [12, 84], '1B': 'ON1', CF: [0, 118],
            R1: { to: run('FIRST', 'SECOND', 0.2), at: [0.25, 1] }, B: { to: bat(0.16), at: [0.25, 1] },
          },
        },
        {
          d: 600, say: 'Step on 2nd himself. That\'s one.', focus: ['SS'],
          moves: { SS: [-1, 84], R1: run('FIRST', 'SECOND', 0.42), B: bat(0.3) },
          mark: { text: 'OUT', at: 'SECOND', tone: 'out' },
        },
        {
          d: 900, say: 'He\'s already moving toward first. Set, throw.', focus: ['SS', '1B'],
          ball: { to: '1B', kind: 'throw', h: 5, at: [0.2, 1] },
          moves: { SS: [3, 82], '1B': [39, 46], R1: [14, 98], B: bat(0.62) },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1200, say: 'Two outs, one throw. His feet made the first out.',
          moves: { B: bat(0.85) },
          mark: dpMark,
        },
      ],
      quiz: { at: 2, q: 'You field it 5 feet from 2nd, runner on 1st. Fastest way to get two?', options: ['Step on 2nd, throw to 1st', 'Throw to 2B, he throws to 1st', 'Throw to 1st first'], answer: 0, why: 'Your feet beat any feed. One step for the first out, one throw for the second.' },
    },

    {
      id: 'dp-home-to-first',
      cat: 'double',
      title: 'Bases loaded: home to first',
      blurb: 'Comebacker with the bases full. Pitcher to catcher to first.',
      outs: 0,
      start: { runners: { R1: 'FIRST', R2: 'SECOND', R3: 'THIRD' } },
      cues: [
        'Bases loaded: home first. It stops the run.',
        'C: foot on the plate, catch it, step INSIDE the line and throw to first.',
        'The batter is always forced at first.',
      ],
      jobs: {
        P: 'Field it, soft throw home.',
        C: 'Foot on the plate. Catch, step inside toward the mound, throw to first.',
        '1B': 'Cover the bag, give C a big target.',
        '3B': 'Cover third.',
        R3: 'Forced home.',
        R2: 'Forced to 3rd.',
        R1: 'Forced to 2nd.',
        B: 'Run inside the running lane.',
      },
      steps: [
        pitch('Bases loaded, nobody out. Everyone knows the double play: home, then first.'),
        {
          d: 800, say: 'Comebacker to the pitcher. Every runner has to go.', focus: ['P'],
          ball: { to: 'P', kind: 'ground', at: [0, 0.9] },
          moves: {
            P: { to: [0, 34], at: [0.1, 0.9] }, C: { to: 'ONH', at: [0.2, 1] }, '1B': 'ON1', '3B': 'ON3',
            R3: { to: run('THIRD', 'HOME', 0.18), at: [0.2, 1] }, R2: { to: run('SECOND', 'THIRD', 0.18), at: [0.2, 1] },
            R1: { to: run('FIRST', 'SECOND', 0.18), at: [0.2, 1] }, B: { to: bat(0.14), at: [0.2, 1] },
          },
        },
        {
          d: 650, say: 'Soft throw home. C catches with his foot on the plate.', focus: ['C'],
          shout: { who: 'C', text: 'HOME!' },
          ball: { to: 'C', kind: 'throw', h: 3 },
          moves: { R3: run('THIRD', 'HOME', 0.4), R2: run('SECOND', 'THIRD', 0.38), R1: run('FIRST', 'SECOND', 0.38), B: bat(0.3) },
          mark: { text: 'OUT', at: 'HOME', tone: 'out' },
        },
        {
          d: 450, say: 'C steps inside, toward the mound, so his throw doesn\'t hit the runner.', focus: ['C'],
          moves: { C: [-1, 7], R3: [-20, -6], R2: run('SECOND', 'THIRD', 0.5), R1: run('FIRST', 'SECOND', 0.5), B: bat(0.42) },
        },
        {
          d: 1000, say: 'Throw to first.', focus: ['C', '1B'],
          ball: { to: '1B', kind: 'throw', h: 6 },
          moves: { '1B': [39, 46], R2: 'THIRD', R1: 'SECOND', B: bat(0.74) },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1200, say: 'Home to first. Two outs, and the run that was coming in doesn\'t count.',
          moves: { B: bat(0.95) },
          mark: dpMark,
        },
      ],
      quiz: { at: 3, q: 'C just got the force at home. Is there another out to get?', options: ['Yes, throw to first', 'No, the play is over', 'Chase the runner from 3rd'], answer: 0, why: 'The batter is always forced at first. Home to first is the classic bases-loaded double play.' },
    },

    {
      id: 'dp-first-then-tag',
      cat: 'double',
      title: 'First, then TAG at second',
      blurb: '1B steps on first, then throws to 2nd. The force is gone, so SS has to tag.',
      outs: 1,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Once the batter is out at first, the runner from 1st is no longer forced.',
        'No force = TAG. Glove down in front of the bag, let him slide into it.',
        'Say it at practice: "First base out? Tag at second."',
      ],
      jobs: {
        '1B': 'Field it, step on first, throw to 2nd.',
        SS: 'Cover 2nd. Catch it and TAG the runner.',
        P: 'Break toward first in case 1B needs a cover.',
        '2B': 'Back up the throw.',
        R1: 'Not forced after the out at first, but still has to make it to 2nd or get back.',
        B: 'Run hard.',
      },
      steps: [
        pitch(),
        firstBaseGrounder,
        stepOnFirst,
        {
          d: 1000, say: 'Throw to 2nd. The runner is NOT forced anymore, so SS has to TAG him.', focus: ['SS'],
          ball: { to: 'SS', kind: 'throw', h: 5 },
          moves: { SS: { to: [4, 82], at: [0.7, 1] }, R1: run('FIRST', 'SECOND', 0.82), B: [46, 44] },
        },
        {
          d: 800, say: 'Tag! Glove down in front of the bag. Let the runner slide into it.', focus: ['SS', 'R1'],
          moves: { SS: [5, 80], R1: run('FIRST', 'SECOND', 0.88) },
          mark: { text: 'OUT', at: 'SECOND', tone: 'out' },
        },
        {
          d: 1200, say: 'Double play. Step first, then the tag.',
          moves: { R1: [16, 98] },
          mark: dpMark,
        },
      ],
      wrong: {
        label: 'Just stands on 2nd',
        steps: [
          pitch(),
          firstBaseGrounder,
          stepOnFirst,
          {
            d: 1000, say: 'Throw to 2nd. SS stands on the bag like it\'s still a force...', focus: ['SS'],
            ball: { to: 'SS', kind: 'throw', h: 5 },
            moves: { R1: run('FIRST', 'SECOND', 0.82), B: [46, 44] },
          },
          {
            d: 1100, say: 'Runner slides in. SAFE. Once first base was out, the force was gone. He needed a tag.', focus: ['R1'],
            moves: { R1: 'SECOND' },
            mark: { text: 'SAFE', at: 'SECOND', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 3, q: '1B just stepped on first. The runner from 1st is heading to 2nd. What does SS have to do?', options: ['Tag the runner', 'Step on the bag', 'Nothing, he\'s already out'], answer: 0, why: 'Stepping on first takes away the force. With no force, only a tag gets the runner.' },
    },

    {
      id: 'dp-doubled-off',
      cat: 'double',
      title: 'Line drive: double him off',
      blurb: 'Liner caught, runner already took off. Beat him back to first.',
      outs: 0,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Caught in the air? Every runner has to go back and touch his base.',
        'After the catch, look where the runner came from.',
        '1B: get back to the bag and yell for it.',
      ],
      jobs: {
        '2B': 'Catch the liner, turn, throw to first.',
        '1B': 'Get back on the bag and yell.',
        R1: 'Took off on contact. Now has to scramble back.',
        B: 'Out on the catch.',
      },
      steps: [
        pitch('Runner on 1st, nobody out. 8U runners take off the second the bat hits the ball...'),
        {
          d: 600, say: 'Line drive right at 2B. Caught! That\'s one.', focus: ['2B'],
          ball: { to: '2B', kind: 'line', at: [0, 0.9] },
          moves: { '2B': { to: [26, 78], at: [0, 0.6] }, '1B': { to: 'ON1', at: [0.3, 1] }, R1: { to: run('FIRST', 'SECOND', 0.18), at: [0.1, 1] }, B: { to: bat(0.08), at: [0.3, 1] } },
          mark: { text: 'OUT', at: '2B', tone: 'out' },
        },
        {
          d: 700, say: 'The runner left first. He has to go BACK and touch it. Beat him there.', focus: ['2B', 'R1'],
          shout: { who: '1B', text: 'HERE!' },
          moves: { R1: run('FIRST', 'SECOND', 0.12), B: [8, 10] },
        },
        {
          d: 800, say: 'Throw to first. 1B\'s foot is on the bag.', focus: ['2B', '1B'],
          ball: { to: '1B', kind: 'throw', h: 4 },
          moves: { R1: run('FIRST', 'SECOND', 0.05) },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1200, say: 'Doubled off. Two outs because he looked where the runner came from.',
          moves: { R1: [30, 30] },
          mark: dpMark,
        },
      ],
      quiz: { at: 2, q: 'You caught a line drive. The runner from 1st already took off. What now?', options: ['Throw to first before he gets back', 'Throw to second', 'Celebrate the catch'], answer: 0, why: 'On a caught ball, runners have to go back to their base. Beat him there and it\'s a double play.' },
    },
  );
})();
