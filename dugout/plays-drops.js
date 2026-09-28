(() => {
  const { run, bat, pitch } = DG.kit;

  DG.plays.push(
    {
      id: 'drop-first-backup',
      cat: 'oops',
      title: '1B drops it: RF backs up',
      blurb: 'Grounder to short, throw to first gets dropped. Somebody behind the bag saves the day.',
      outs: 0,
      cues: [
        'Every throw has a backup. Move on contact, not after the drop.',
        'RF runs behind first base. Drops happen, that\'s why he\'s there.',
        'Pick it up, look at the runner, and keep him at first.',
      ],
      jobs: {
        SS: 'Field it, step, short throw to the chest.',
        '1B': 'Foot on the bag, two hands. If it gets by, chase it.',
        RF: 'Sprint in behind first on contact. Be ready for a bad throw.',
        B: 'Run hard through first. Only go on if nobody backs up.',
      },
      steps: [
        pitch(),
        {
          d: 1200, say: 'Grounder to short. 1B gets to the bag. RF is already running in behind first.', focus: ['SS', 'RF'],
          ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
          moves: { SS: { to: [-22, 74], at: [0, 0.85] }, '1B': { to: 'ON1', at: [0.1, 1] }, B: { to: bat(0.2), at: [0.25, 1] }, RF: [68, 84] },
        },
        {
          d: 700, say: 'SS sets his feet. Backups keep coming.', focus: ['SS', 'RF'],
          moves: { B: bat(0.4), RF: [65, 66] },
        },
        {
          d: 900, say: 'Throw to first... and 1B drops it! It squirts past the bag.', focus: ['1B'],
          ball: { to: [46, 52], kind: 'throw', h: 4 },
          moves: { B: bat(0.72), RF: [63, 54] },
          mark: { text: 'DROPPED', at: 'FIRST', tone: 'info' },
        },
        {
          d: 1000, say: 'RF is right there. He picks it up. The ball stays in front of the fence.', focus: ['RF'],
          ball: { to: 'RF', kind: 'hand', at: [0.25, 0.6] },
          moves: { RF: [58, 56], B: 'FIRST' },
          mark: { text: 'BACKUP', at: 'RF', tone: 'info' },
        },
        {
          d: 1200, say: 'Batter sees the ball and stays at first. Throw it back to the pitcher. Drop = no big deal.', focus: ['RF'],
          ball: { to: 'P', kind: 'throw', h: 4 },
        },
      ],
      wrong: {
        label: 'No backup',
        steps: [
          pitch(),
          {
            d: 1200, say: 'Same grounder. This time RF stays back by the fence, watching.', focus: ['RF'],
            ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
            moves: { SS: { to: [-22, 74], at: [0, 0.85] }, '1B': { to: 'ON1', at: [0.1, 1] }, B: { to: bat(0.2), at: [0.25, 1] } },
          },
          {
            d: 700, say: 'SS sets and throws.', moves: { B: bat(0.4) },
          },
          {
            d: 900, say: 'Dropped again. Nobody is behind the bag.', focus: ['1B'],
            ball: { to: [46, 52], kind: 'throw', h: 4 },
            moves: { B: bat(0.72) },
            mark: { text: 'DROPPED', at: 'FIRST', tone: 'info' },
          },
          {
            d: 1600, say: 'The ball rolls and rolls down the line. Batter sees it and keeps going.', focus: ['B'],
            ball: { to: [80, 96], kind: 'roll' },
            moves: { B: 'SECOND', RF: [76, 110] },
          },
          {
            d: 1800, say: 'RF finally gets there. Batter is on 3rd. One drop turned into a triple.', focus: ['B'],
            ball: { to: 'RF', kind: 'hand', at: [0.1, 0.4] },
            moves: { RF: [80, 98], B: 'THIRD' },
            mark: { text: 'SAFE', at: 'THIRD', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'Grounder to short, throw is going to first. Where is RF?', options: ['Running in behind first', 'Standing by the fence', 'Covering second'], answer: 0, why: 'Move on contact. If the throw gets dropped, RF is already there to stop it.' },
    },

    {
      id: 'drop-second-backup',
      cat: 'oops',
      title: 'Missed at 2nd: CF backs up',
      blurb: 'Force at 2nd, the throw gets by. CF picks it up. No panic throws.',
      outs: 0,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Throw to second, backup behind second. Always.',
        'Missed it? Stay calm. One base is OK, not two.',
        'Backup picks it up, looks, and runs it in. No wild second throw.',
      ],
      jobs: {
        SS: 'Field it, throw chest high to 2B.',
        '2B': 'Cover 2nd, foot on the bag. If it gets by, don\'t chase, yell "CF!"',
        CF: 'Run in behind second on contact. Pick it up.',
        R1: 'Forced to run to second.',
        B: 'Run hard through first.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Grounder to short, runner on 1st. 2B covers the bag. CF runs in behind it.', focus: ['2B', 'CF'],
          ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
          moves: { SS: { to: [-22, 74], at: [0, 0.85] }, '2B': { to: 'ON2', at: [0.1, 1] }, R1: { to: run('FIRST', 'SECOND', 0.22), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] }, CF: [2, 118] },
        },
        {
          d: 900, say: 'Throw to second... it gets by! 2B can\'t catch it.', focus: ['2B'],
          ball: { to: [4, 92], kind: 'throw', h: 3 },
          moves: { R1: run('FIRST', 'SECOND', 0.6), B: bat(0.4), CF: [2, 106] },
          mark: { text: 'MISSED', at: 'SECOND', tone: 'info' },
        },
        {
          d: 1000, say: 'CF was right behind him. He grabs it. Runner is safe at 2nd, and that\'s all.', focus: ['CF'],
          ball: { to: 'CF', kind: 'hand', at: [0.3, 0.6] },
          moves: { R1: 'SECOND', B: bat(0.7), CF: [3, 100] },
          mark: { text: 'SAFE', at: 'SECOND', tone: 'safe' },
        },
        {
          d: 1400, say: 'CF looks at the runners, then runs it in to the pitcher. No hurried throw.', focus: ['CF'],
          moves: { B: 'FIRST', CF: [2, 74] },
          mark: { text: 'RUN IT IN', at: 'CF', tone: 'info' },
        },
        {
          d: 800, say: 'Ball back to the mound. Everybody holds. Reset.',
          ball: { to: 'P', kind: 'throw', h: 2 },
        },
      ],
      wrong: {
        label: 'No backup',
        steps: [
          pitch(),
          {
            d: 1100, say: 'Same play. CF stays deep. Nobody thinks about a backup.', focus: ['CF'],
            ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
            moves: { SS: { to: [-22, 74], at: [0, 0.85] }, '2B': { to: 'ON2', at: [0.1, 1] }, R1: { to: run('FIRST', 'SECOND', 0.22), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] } },
          },
          {
            d: 900, say: 'Throw gets by 2B.', ball: { to: [4, 92], kind: 'throw', h: 3 },
            moves: { R1: run('FIRST', 'SECOND', 0.6), B: bat(0.4) },
            mark: { text: 'MISSED', at: 'SECOND', tone: 'info' },
          },
          {
            d: 1700, say: 'It rolls out to the grass. Runners see it and keep running.', focus: ['R1', 'B'],
            ball: { to: [8, 138], kind: 'roll' },
            moves: { R1: 'THIRD', B: 'SECOND', CF: [6, 140] },
          },
          {
            d: 1200, say: 'CF finally has it. Runners on 2nd and 3rd. A safe out turned into trouble.', focus: ['CF'],
            ball: { to: 'CF', kind: 'hand', at: [0.1, 0.4] },
            mark: { text: 'SAFE', at: 'THIRD', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'Throw to 2nd gets by the bag. Who should be right there?', options: ['CF, behind second', '1B', 'The catcher'], answer: 0, why: 'CF runs in behind second on every ground ball with a runner on first.' },
    },

    {
      id: 'drop-fly-backup',
      cat: 'oops',
      title: 'Dropped fly: pick it up, throw it in',
      blurb: 'LF drops a fly ball. Nobody pouts. CF backs up, runners hold, and the ball goes to the cutoff.',
      outs: 0,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Two hands, glove above your eyes. Squeeze it.',
        'Drop it? Don\'t pout. Pick it up and throw to the cutoff.',
        'Runners hold halfway on a fly ball. A drop doesn\'t cost extra bases.',
      ],
      jobs: {
        LF: 'Two hands. If it pops out, grab it fast and throw to SS.',
        CF: 'Drift over behind LF on every fly ball.',
        SS: 'Go out and be the cutoff. Hands up, yell "HERE!"',
        R1: 'Go halfway and wait. See if it\'s caught.',
        B: 'Run hard, but watch the play.',
      },
      steps: [
        pitch(),
        {
          d: 2400, say: 'Fly ball to left. CF drifts over behind LF. Runner on 1st goes halfway and waits.', focus: ['LF', 'CF'],
          ball: { to: 'LF', kind: 'fly', h: 44 },
          moves: { LF: { to: [-64, 120], at: [0.1, 0.85] }, CF: [-30, 136], SS: [-28, 100], '2B': 'ON2', R1: { to: run('FIRST', 'SECOND', 0.4), at: [0.2, 1] }, B: { to: bat(0.5), at: [0.1, 1] } },
        },
        {
          d: 800, say: 'It bounces off the glove! LF drops it.', focus: ['LF'],
          ball: { to: [-58, 112], kind: 'roll' },
          moves: { B: bat(0.7), R1: run('FIRST', 'SECOND', 0.5) },
          mark: { text: 'DROPPED', at: 'LF', tone: 'info' },
        },
        {
          d: 900, say: 'LF picks it up right away. No pouting. Runners only get one base.', focus: ['LF'],
          ball: { to: 'LF', kind: 'hand', at: [0.2, 0.6] },
          moves: { LF: [-58, 113], R1: 'SECOND', B: 'FIRST', CF: [-40, 128] },
        },
        {
          d: 1300, say: 'Look for the cutoff. SS is yelling "HERE!" Throw it to him.', focus: ['LF', 'SS'],
          shout: { who: 'SS', text: 'HERE!' },
          ball: { to: 'SS', kind: 'throw', h: 9 },
          mark: { text: 'HELD', at: 'SECOND', tone: 'info' },
        },
      ],
      wrong: {
        label: 'Pout and no backup',
        steps: [
          pitch(),
          {
            d: 2400, say: 'Same fly ball. This time the runner takes off for 3rd, nobody is backing up.', focus: ['LF'],
            ball: { to: 'LF', kind: 'fly', h: 44 },
            moves: { LF: { to: [-64, 120], at: [0.1, 0.85] }, R1: { to: run('FIRST', 'SECOND', 0.9), at: [0.2, 1] }, B: { to: bat(0.5), at: [0.1, 1] } },
          },
          {
            d: 900, say: 'Dropped. LF throws his glove down and stares at the ground.', focus: ['LF'],
            ball: { to: [-70, 128], kind: 'roll' },
            moves: { R1: 'SECOND', B: 'FIRST' },
            mark: { text: 'POUTING', at: 'LF', tone: 'info' },
          },
          {
            d: 1900, say: 'The ball keeps rolling. Runners keep running.', focus: ['R1', 'B'],
            ball: { to: [-78, 148], kind: 'roll' },
            moves: { R1: 'THIRD', B: 'SECOND', LF: [-72, 130] },
          },
          {
            d: 1500, say: 'Now runners on 2nd and 3rd. One dropped fly, two extra bases.', focus: ['LF'],
            ball: { to: 'LF', kind: 'hand', at: [0.1, 0.4] },
            moves: { LF: [-78, 147] },
            mark: { text: 'SAFE', at: 'THIRD', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 2, q: 'You drop a fly ball. What do you do first?', options: ['Pick it up and throw to the cutoff', 'Stomp and yell', 'Wait for the coach'], answer: 0, why: 'The play isn\'t over. Pick it up fast and get it in. Runners are only allowed to move if you stand there.' },
    },

    {
      id: 'drop-cutoff-backup',
      cat: 'oops',
      title: 'Cutoff misses: SS backs up',
      blurb: 'RF throws to the cutoff and 2B can\'t hold it. Behind him, SS is ready.',
      outs: 1,
      start: { runners: { R2: 'SECOND' } },
      cues: [
        'The cutoff can miss. So the guy behind him is a backup.',
        'Throw at the cutoff\'s chest. Low and hard is better than high.',
        'Backup grabs it and holds the runner at 3rd.',
      ],
      jobs: {
        RF: 'Pick it up, throw to the cutoff, chest high.',
        '2B': 'Be the cutoff. Hands up, yell "HERE!" Catch with two hands.',
        SS: 'Line up behind the cutoff. If it gets by, run it down.',
        P: 'Back up 3rd or home, whichever is open.',
        R2: 'Rounding third, waiting for the coach.',
      },
      steps: [
        pitch(),
        {
          d: 1900, say: 'Single to right. Runner on 2nd heads for 3rd. 2B is the cutoff, SS lines up right behind him.', focus: ['RF', '2B', 'SS'],
          ball: { to: 'RF', kind: 'ground', at: [0, 0.9] },
          moves: { RF: { to: [62, 106], at: [0, 0.85] }, '2B': [28, 96], SS: [18, 88], R2: { to: run('SECOND', 'THIRD', 0.7), at: [0.15, 1] }, B: { to: bat(0.5), at: [0.15, 1] }, '3B': 'ON3' },
        },
        {
          d: 1100, say: 'RF throws to the cutoff. It\'s hot and bounces off the glove!', focus: ['2B'],
          shout: { who: '2B', text: 'HERE!' },
          ball: { to: [26, 93], kind: 'throw', h: 8 },
          moves: { R2: 'THIRD', B: 'FIRST' },
          mark: { text: 'MISSED', at: '2B', tone: 'info' },
        },
        {
          d: 900, say: 'SS is right behind him and scoops it up. Nobody is going anywhere.', focus: ['SS'],
          ball: { to: 'SS', kind: 'hand', at: [0.2, 0.55] },
          moves: { SS: [22, 90] },
          mark: { text: 'BACKUP', at: 'SS', tone: 'info' },
        },
        {
          d: 1200, say: 'Look at the runners. Runner is held at 3rd. Throw it back to the pitcher.', focus: ['SS'],
          ball: { to: 'P', kind: 'throw', h: 5 },
        },
      ],
      wrong: {
        label: 'Nobody behind the cutoff',
        steps: [
          pitch(),
          {
            d: 1900, say: 'Same single to right. 2B goes out for the cutoff. SS stays at shortstop.', focus: ['2B'],
            ball: { to: 'RF', kind: 'ground', at: [0, 0.9] },
            moves: { RF: { to: [62, 106], at: [0, 0.85] }, '2B': [28, 96], R2: { to: run('SECOND', 'THIRD', 0.7), at: [0.15, 1] }, B: { to: bat(0.5), at: [0.15, 1] }, '3B': 'ON3' },
          },
          {
            d: 1100, say: 'Throw to the cutoff, and it\'s a miss.', focus: ['2B'],
            ball: { to: [26, 93], kind: 'throw', h: 8 },
            moves: { R2: 'THIRD', B: 'FIRST' },
            mark: { text: 'MISSED', at: '2B', tone: 'info' },
          },
          {
            d: 1700, say: 'It rolls toward the corner. Runner sees it and goes home.', focus: ['R2'],
            ball: { to: [40, 110], kind: 'roll' },
            moves: { R2: 'HOME', B: 'SECOND' },
            mark: { text: 'SAFE', at: 'HOME', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 2, q: 'The cutoff man misses the throw. Who saves it?', options: ['The player right behind him', 'The catcher', 'The coach'], answer: 0, why: 'Line up a backup behind the cutoff. A miss should only cost you a second.' },
    },

    {
      id: 'drop-home-backup',
      cat: 'oops',
      title: 'Missed at home: P backs up',
      blurb: 'Throw home gets by the catcher. P is behind the plate, so the run scores but nobody else moves.',
      outs: 1,
      start: { runners: { R1: 'FIRST', R2: 'SECOND', R3: 'THIRD' } },
      cues: [
        'On any throw home, P runs behind the plate.',
        'Catcher: block with your body. Chest to the ball.',
        'Missed one? Get it, look at the runners, then throw. Slow down.',
      ],
      jobs: {
        '3B': 'Field it and throw to home. Chest high, short throw.',
        C: 'Foot on the plate, two hands. Block low balls.',
        P: 'Sprint in behind the plate when a throw goes home.',
        R3: 'Forced home on a ground ball.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Bases loaded. Grounder to third. Force at home! P starts running toward home right away.', focus: ['3B', 'P'],
          ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
          moves: { '3B': { to: [-44, 59], at: [0, 0.9] }, C: { to: 'ONH', at: [0.1, 0.5] }, R3: { to: run('THIRD', 'HOME', 0.25), at: [0.25, 1] }, R2: { to: run('SECOND', 'THIRD', 0.2), at: [0.25, 1] }, R1: { to: run('FIRST', 'SECOND', 0.2), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] }, P: [-8, 20] },
        },
        {
          d: 900, say: 'Throw home... it hits the dirt and gets past C!', focus: ['C'],
          ball: { to: [3, -3], kind: 'throw', h: 4 },
          moves: { R3: run('THIRD', 'HOME', 0.7), R2: run('SECOND', 'THIRD', 0.55), R1: run('FIRST', 'SECOND', 0.55), B: bat(0.4), P: [-4, 4] },
          mark: { text: 'MISSED', at: 'HOME', tone: 'info' },
        },
        {
          d: 1000, say: 'P is right behind the plate. He scoops it up before it goes to the fence.', focus: ['P'],
          ball: { to: 'P', kind: 'hand', at: [0.2, 0.6] },
          moves: { P: [4, -8], R3: 'HOME', R2: 'THIRD', R1: 'SECOND', B: bat(0.7) },
          mark: { text: 'BACKUP', at: 'P', tone: 'info' },
        },
        {
          d: 1400, say: 'The run scored, but that\'s all. P looks around, then walks the ball back to the mound.', focus: ['P'],
          moves: { P: [0, 34], B: 'FIRST' },
        },
      ],
      wrong: {
        label: 'Nobody behind the plate',
        steps: [
          pitch(),
          {
            d: 1100, say: 'Same play. P watches from the mound.', focus: ['P'],
            ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
            moves: { '3B': { to: [-44, 59], at: [0, 0.9] }, C: { to: 'ONH', at: [0.1, 0.5] }, R3: { to: run('THIRD', 'HOME', 0.25), at: [0.25, 1] }, R2: { to: run('SECOND', 'THIRD', 0.2), at: [0.25, 1] }, R1: { to: run('FIRST', 'SECOND', 0.2), at: [0.25, 1] }, B: { to: bat(0.18), at: [0.25, 1] } },
          },
          {
            d: 900, say: 'Throw home gets past C.', ball: { to: [3, -3], kind: 'throw', h: 4 },
            moves: { R3: run('THIRD', 'HOME', 0.7), R2: run('SECOND', 'THIRD', 0.55), R1: run('FIRST', 'SECOND', 0.55), B: bat(0.4) },
            mark: { text: 'MISSED', at: 'HOME', tone: 'info' },
          },
          {
            d: 1800, say: 'It rolls all the way to the backstop. Every runner keeps going.', focus: ['C'],
            ball: { to: [8, -34], kind: 'roll' },
            moves: { R3: 'HOME', R2: 'HOME', R1: 'THIRD', B: 'SECOND', C: [6, -30] },
            mark: { text: 'SAFE', at: 'HOME', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'A throw is going home. What does the pitcher do?', options: ['Run in behind the plate', 'Stay on the mound', 'Cover first'], answer: 0, why: 'Every throw home needs a backup. P is the closest player to the plate.' },
    },

    {
      id: 'bobble-look-first',
      cat: 'oops',
      title: 'Bobble it? Pick up, look, throw',
      blurb: '3B boots the grounder. He stays calm, gets it, and makes a good throw.',
      outs: 0,
      cues: [
        'Two hands. Glove down, other hand ready to trap it.',
        'Drop it? Pick it up and LOOK at your target. No blind throws.',
        'RF backs up first anyway. Bad throws happen.',
      ],
      jobs: {
        '3B': 'If you bobble it, pick it up, set your feet, look, throw.',
        '1B': 'Foot on the bag, big target, yell "HERE!"',
        RF: 'Run in behind first on contact.',
        B: 'Run hard through the bag.',
      },
      steps: [
        pitch(),
        {
          d: 1200, say: 'Grounder to third. RF starts in behind first. 1B gets to the bag.', focus: ['3B', 'RF'],
          ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
          moves: { '3B': { to: [-44, 58], at: [0, 0.9] }, '1B': { to: 'ON1', at: [0.1, 1] }, B: { to: bat(0.15), at: [0.25, 1] }, RF: [66, 84] },
        },
        {
          d: 700, say: 'Bobble! It pops off the glove.', focus: ['3B'],
          ball: { to: [-40, 52], kind: 'roll' },
          moves: { B: bat(0.3), RF: [64, 66] },
          mark: { text: 'BOBBLE', at: '3B', tone: 'info' },
        },
        {
          d: 800, say: 'Stay calm. Pick it up, take one breath, LOOK at first base.', focus: ['3B'],
          ball: { to: '3B', kind: 'hand', at: [0.2, 0.6] },
          moves: { '3B': [-41, 53], B: bat(0.5) },
          mark: { text: 'LOOK', at: '3B', tone: 'info' },
        },
        {
          d: 900, say: 'Set the feet, short throw to the chest. "HERE!" says 1B.', focus: ['3B', '1B'],
          shout: { who: '1B', text: 'HERE!' },
          ball: { to: '1B', kind: 'throw', h: 6 },
          moves: { B: bat(0.9), RF: [62, 48] },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1000, say: 'Out! It was close because he stayed calm. RF was there if it had gone wrong.', focus: ['RF'],
        },
      ],
      wrong: {
        label: 'Throws blind',
        steps: [
          pitch(),
          {
            d: 1200, say: 'Same grounder to third.', focus: ['3B'],
            ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
            moves: { '3B': { to: [-44, 58], at: [0, 0.9] }, '1B': { to: 'ON1', at: [0.1, 1] }, B: { to: bat(0.15), at: [0.25, 1] } },
          },
          {
            d: 700, say: 'Bobble!', ball: { to: [-40, 52], kind: 'roll' }, moves: { B: bat(0.3) },
            mark: { text: 'BOBBLE', at: '3B', tone: 'info' },
          },
          {
            d: 700, say: 'He panics. Grabs it and throws it without looking, without setting his feet.', focus: ['3B'],
            ball: { to: '3B', kind: 'hand', at: [0.1, 0.4] },
            moves: { '3B': [-41, 53], B: bat(0.5) },
            mark: { text: 'HURRY', at: '3B', tone: 'info' },
          },
          {
            d: 900, say: 'The throw sails over 1B\'s head.', focus: ['1B'],
            ball: { to: [64, 76], kind: 'throw', h: 14 },
            moves: { B: bat(0.9) },
            mark: { text: 'WILD', at: 'FIRST', tone: 'info' },
          },
          {
            d: 1500, say: 'Nobody behind first. Batter goes on to 2nd. A calm throw was an out.', focus: ['B'],
            ball: { to: [70, 96], kind: 'roll' },
            moves: { B: 'SECOND', RF: [72, 106] },
            mark: { text: 'SAFE', at: 'SECOND', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 2, q: 'You bobble a grounder with a runner coming. What next?', options: ['Pick it up, look, then throw', 'Throw it right now, as hard as you can', 'Give up on the play'], answer: 0, why: 'A rushed throw makes it worse. One breath, look at your target, throw to the chest.' },
    },
  );
})();
