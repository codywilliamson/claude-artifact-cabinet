// aggressive runners: the other team dares us to throw. Sure outs, short throws, run the ball at them.
(() => {
  const { run, bat, pitch } = DG.kit;
  const SS_FIELD = { to: [-22, 74], at: [0, 0.85] };

  DG.plays.push(
    {
      id: 'hustle-first-round',
      cat: 'hustle',
      title: 'Batter rounds 1st: don\'t take the dare',
      blurb: 'Infield single, batter turns hard toward 2nd to make 1B throw. Run at him or hand it to the pitcher.',
      outs: 0,
      cues: [
        'Runner rounding the bag wants a hurried throw. Don\'t give it to him.',
        'Run the ball at the runner. He has to stop and go back.',
        'Ball to the pitcher ends it.',
      ],
      jobs: {
        '3B': 'Field it, short throw to first.',
        '1B': 'Catch it, then look. Run at the runner with the ball up. No long throw.',
        '2B': 'Cover second, glove out. Be the short throw if 1B needs one.',
        P: 'Step into the circle. Take the ball.',
        B: 'Hustle! Round first and see if they throw.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Slow roller to third. 3B charges and throws.', focus: ['3B'],
          ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
          moves: { '3B': { to: [-44, 50], at: [0, 0.85] }, B: { to: bat(0.3), at: [0.25, 1] }, '1B': { to: 'ON1', at: [0.1, 1] } },
        },
        {
          d: 900, say: 'Throw is in time, but the batter is safe on a close play. He doesn\'t stop. He turns for 2nd.', focus: ['B', '1B'],
          ball: { to: '1B', kind: 'throw', h: 5 },
          moves: { B: run('FIRST', 'SECOND', 0.25), '2B': 'ON2' },
          mark: { text: 'DARING', at: 'FIRST', tone: 'info' },
        },
        {
          d: 1000, say: '1B looks at him, then runs at him with the ball up. The runner has to stop.', focus: ['1B', 'B'],
          shout: { who: '1B', text: 'BACK!' },
          moves: { '1B': [46, 52], B: run('FIRST', 'SECOND', 0.05) },
          mark: { text: 'RUN AT HIM', at: '1B', tone: 'info' },
        },
        {
          d: 900, say: 'Runner is back on the bag. 1B hands the ball to the pitcher. Play over.', focus: ['P'],
          ball: { to: 'P', kind: 'throw', h: 3 },
          moves: { B: 'FIRST' },
          mark: { text: 'HELD', at: 'FIRST', tone: 'safe' },
        },
      ],
      wrong: {
        label: 'Long throw to 2nd',
        steps: [
          pitch(),
          {
            d: 1100, say: 'Same roller. Same throw.', focus: ['3B'],
            ball: { to: '3B', kind: 'ground', at: [0, 0.9] },
            moves: { '3B': { to: [-44, 50], at: [0, 0.85] }, B: { to: bat(0.3), at: [0.25, 1] }, '1B': { to: 'ON1', at: [0.1, 1] } },
          },
          {
            d: 900, say: 'Batter is safe and turns for 2nd.', focus: ['B'],
            ball: { to: '1B', kind: 'throw', h: 5 },
            moves: { B: run('FIRST', 'SECOND', 0.25), '2B': [12, 80] },
          },
          {
            d: 900, say: '1B panics and fires to second. Too hard, too high.', focus: ['1B'],
            ball: { to: [6, 112], kind: 'throw', h: 12 },
            moves: { B: run('FIRST', 'SECOND', 0.7) },
            mark: { text: 'OVER HIS HEAD', at: 'SECOND', tone: 'info' },
          },
          {
            d: 1600, say: 'It rolls into center. The runner sees it and keeps going.', focus: ['B'],
            ball: { to: [8, 128], kind: 'roll' },
            moves: { B: 'THIRD', CF: [8, 126] },
          },
          {
            d: 1000, say: 'Runner on 3rd. One dare, one bad throw, one free base.', focus: ['B'],
            ball: { to: 'CF', kind: 'hand', at: [0.1, 0.4] },
            mark: { text: 'SAFE', at: 'THIRD', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 2, q: 'The batter rounds first and dares you to throw. What do you do?', options: ['Run at him with the ball up', 'Fire it to second', 'Throw it home'], answer: 0, why: 'Running at him makes him stop. The long throw is what he wants you to make.' },
    },

    {
      id: 'hustle-third-break',
      cat: 'hustle',
      title: 'Runner breaks from 3rd: take the sure out',
      blurb: 'Grounder to short, the runner on 3rd takes off for home. SS throws to first and gives up the run.',
      outs: 0,
      start: { runners: { R3: 'THIRD' } },
      cues: [
        'The sure out beats the hopeful one.',
        'He is trying to bait a hard throw home. Say no thanks.',
        'One run is okay. A wild throw that lets two score is not.',
      ],
      jobs: {
        SS: 'Field it, look at the runner once, then step and throw to first.',
        '1B': 'Foot on the bag, two hands.',
        C: 'Stay at home, glove up, but don\'t expect a throw. Back up if needed.',
        R3: 'Go if the coach says go. Slide or run hard.',
      },
      steps: [
        pitch(),
        {
          d: 1100, say: 'Grounder to short. The runner on 3rd takes off for home right away.', focus: ['SS', 'R3'],
          ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
          moves: { SS: SS_FIELD, R3: { to: run('THIRD', 'HOME', 0.45), at: [0.2, 1] }, B: { to: bat(0.2), at: [0.25, 1] }, '1B': { to: 'ON1', at: [0.1, 1] } },
        },
        {
          d: 800, say: 'SS looks at home. Too far, runner is almost there. Take the sure out at first.', focus: ['SS'],
          moves: { R3: run('THIRD', 'HOME', 0.85), B: bat(0.45) },
          mark: { text: 'SURE OUT', at: 'FIRST', tone: 'info' },
        },
        {
          d: 900, say: 'Chest high to first. Batter is out.', focus: ['1B'],
          ball: { to: '1B', kind: 'throw', h: 4 },
          moves: { R3: 'HOME', B: bat(0.85) },
          mark: { text: 'OUT', at: 'FIRST', tone: 'out' },
        },
        {
          d: 1200, say: 'One run scores, one out. Ball goes to the pitcher and nobody else moves.', focus: ['P'],
          ball: { to: 'P', kind: 'throw', h: 4 },
          mark: { text: 'RUN', at: 'HOME', tone: 'safe' },
        },
      ],
      wrong: {
        label: 'Rush a throw home',
        steps: [
          pitch(),
          {
            d: 1100, say: 'Same grounder. Runner breaks from 3rd.', focus: ['SS', 'R3'],
            ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
            moves: { SS: SS_FIELD, R3: { to: run('THIRD', 'HOME', 0.45), at: [0.2, 1] }, B: { to: bat(0.2), at: [0.25, 1] }, '1B': { to: 'ON1', at: [0.1, 1] } },
          },
          {
            d: 800, say: 'SS panics and throws home as hard as he can, off balance.', focus: ['SS'],
            ball: { to: [-8, -34], kind: 'throw', h: 10 },
            moves: { R3: run('THIRD', 'HOME', 0.9), B: bat(0.5) },
            mark: { text: 'WAY HIGH', at: 'HOME', tone: 'info' },
          },
          {
            d: 1700, say: 'Into the backstop. The run scores and the batter keeps going.', focus: ['B', 'C'],
            ball: { to: [-14, -46], kind: 'roll' },
            moves: { R3: 'HOME', B: 'SECOND', C: [-12, -40] },
          },
          {
            d: 1000, say: 'Run scores AND the batter is on 2nd. No outs. A sure out became a mess.', focus: ['B'],
            ball: { to: 'C', kind: 'hand', at: [0.1, 0.4] },
            mark: { text: 'SAFE', at: 'SECOND', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'Runner on 3rd is already running home. Where does the ball go?', options: ['First base, for the sure out', 'Home, as hard as you can', 'Back to the pitcher'], answer: 0, why: 'Take the out you can get. A wild throw home costs a run plus a free base.' },
    },

    {
      id: 'hustle-first-to-third',
      cat: 'hustle',
      title: '1st to 3rd on a single: cut it off',
      blurb: 'Single to center, runner on 1st never stops. Throw to the cutoff, let him have 3rd, keep the batter at first.',
      outs: 0,
      start: { runners: { R1: 'FIRST' } },
      cues: [
        'Long throw to 3rd is the dare. Throw to the cutoff instead.',
        'Cutoff catches it and looks. If the runner is safe, hold the ball.',
        'Every throw has a backup. P backs up 3rd.',
      ],
      jobs: {
        CF: 'Get it in front, throw to SS. Chest high.',
        SS: 'Be the cutoff. Yell "HERE!" Catch it and hold it.',
        '3B': 'Cover third, foot on the bag.',
        P: 'Run behind third base. Wild throws stop with you.',
        R1: 'Run hard. Watch the coach at third.',
      },
      steps: [
        pitch(),
        {
          d: 1700, say: 'Single up the middle. The runner on 1st keeps running. Coach at 3rd waves him on.', focus: ['CF', 'R1'],
          ball: { to: 'CF', kind: 'ground', at: [0, 0.9] },
          moves: { CF: { to: [2, 118], at: [0, 0.85] }, R1: { to: 'THIRD', via: ['SECOND'], at: [0.15, 1] }, B: { to: bat(0.7), at: [0.15, 1] }, '3B': 'ON3', SS: [-14, 96], P: [-44, 64] },
        },
        {
          d: 1000, say: 'CF throws to the cutoff. SS yells "HERE!" Nobody throws to 3rd.', focus: ['CF', 'SS'],
          shout: { who: 'SS', text: 'HERE!' },
          ball: { to: 'SS', kind: 'throw', h: 8 },
          moves: { B: 'FIRST', P: [-46, 56] },
        },
        {
          d: 900, say: 'Runner is safe at 3rd. SS looks at the batter and holds the ball.', focus: ['SS'],
          mark: { text: 'HELD', at: 'FIRST', tone: 'info' },
        },
        {
          d: 900, say: 'Runner on 3rd, batter on 1st. Ball goes in to the pitcher.', focus: ['P'],
          ball: { to: 'P', kind: 'throw', h: 5 },
          moves: { P: [0, 38] },
          mark: { text: 'SAFE', at: 'THIRD', tone: 'safe' },
        },
      ],
      wrong: {
        label: 'CF throws to 3rd',
        steps: [
          pitch(),
          {
            d: 1700, say: 'Same single. Runner flying around 2nd.', focus: ['CF', 'R1'],
            ball: { to: 'CF', kind: 'ground', at: [0, 0.9] },
            moves: { CF: { to: [2, 118], at: [0, 0.85] }, R1: { to: 'THIRD', via: ['SECOND'], at: [0.15, 1] }, B: { to: bat(0.7), at: [0.15, 1] }, '3B': 'ON3' },
          },
          {
            d: 1100, say: 'CF tries the long throw to 3rd. Nobody is backing up.', focus: ['CF'],
            ball: { to: [-64, 30], kind: 'throw', h: 14 },
            moves: { B: 'FIRST' },
            mark: { text: 'SAILS', at: 'THIRD', tone: 'info' },
          },
          {
            d: 1500, say: 'It goes foul, near the dugout. The runner sees it and heads for home.', focus: ['R1'],
            ball: { to: [-76, 24], kind: 'roll' },
            moves: { R1: run('THIRD', 'HOME', 0.6), '3B': [-70, 26] },
          },
          {
            d: 900, say: 'He scores. The batter takes 2nd too. A single became a run and more.', focus: ['R1', 'B'],
            moves: { R1: 'HOME', B: 'SECOND' },
            mark: { text: 'RUN', at: 'HOME', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'Runner on 1st is going to 3rd on a single. CF should...', options: ['Throw to the cutoff', 'Throw right to third', 'Throw home'], answer: 0, why: 'The cutoff keeps the ball in front of us. A long throw to 3rd can sail and the runner scores.' },
    },

    {
      id: 'hustle-pickle',
      cat: 'hustle',
      title: 'Rundown: run at him, one throw',
      blurb: 'Runner is stuck between 3rd and home. Run hard at him, make him choose, throw once.',
      outs: 0,
      start: { runners: { R3: run('THIRD', 'HOME', 0.35) } },
      cues: [
        'Run the ball at the runner with it held up. Do not throw early.',
        'Make him commit to a base, then make one short throw.',
        'Every extra throw is another chance for a mistake.',
      ],
      jobs: {
        C: 'Get the ball, run hard at the runner. Hold it up.',
        '3B': 'Stand on the bag, glove out, yell "HERE!"',
        P: 'Back up the catcher. Stay behind the play.',
        R3: 'Pick a base and go. Don\'t stop and turn around.',
      },
      steps: [
        {
          d: 800, say: 'Runner is caught off 3rd. P throws to the catcher.', focus: ['P', 'C'],
          ball: { to: 'C', kind: 'throw', h: 3 },
          moves: { '3B': 'ON3' },
        },
        {
          d: 1000, say: 'C runs hard at him, ball held up in the air. Not throwing yet.', focus: ['C', 'R3'],
          moves: { C: [-14, 14], R3: run('THIRD', 'HOME', 0.15), P: [-8, 22] },
          mark: { text: 'RUN AT HIM', at: 'C', tone: 'info' },
        },
        {
          d: 800, say: 'He gives up and heads back to 3rd. 3B yells "HERE!"', focus: ['3B', 'R3'],
          shout: { who: '3B', text: 'HERE!' },
          moves: { R3: run('THIRD', 'HOME', 0.03), C: [-20, 22] },
        },
        {
          d: 700, say: 'ONE short throw to 3rd. Tag him.', focus: ['C', '3B'],
          ball: { to: '3B', kind: 'throw', h: 3 },
          moves: { R3: 'THIRD' },
          mark: { text: 'OUT', at: 'THIRD', tone: 'out' },
        },
      ],
      wrong: {
        label: 'Throwing back and forth',
        steps: [
          {
            d: 800, say: 'Same spot. P throws to the catcher.',
            ball: { to: 'C', kind: 'throw', h: 3 },
            moves: { '3B': 'ON3' },
          },
          {
            d: 700, say: 'C throws right away, from far away.', focus: ['C'],
            ball: { to: '3B', kind: 'throw', h: 5 },
            moves: { R3: run('THIRD', 'HOME', 0.15) },
          },
          {
            d: 700, say: '3B throws back. Runner goes back and forth.', focus: ['3B'],
            ball: { to: 'C', kind: 'throw', h: 5 },
            moves: { R3: run('THIRD', 'HOME', 0.55) },
          },
          {
            d: 800, say: 'Third throw is rushed and goes wide.', focus: ['C'],
            ball: { to: [-66, 46], kind: 'throw', h: 6 },
            moves: { R3: run('THIRD', 'HOME', 0.4) },
            mark: { text: 'WIDE', at: 'THIRD', tone: 'info' },
          },
          {
            d: 1300, say: 'Runner sees it and dashes home.', focus: ['R3'],
            ball: { to: [-72, 48], kind: 'roll' },
            moves: { R3: 'HOME', '3B': [-68, 46] },
            mark: { text: 'SAFE', at: 'HOME', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'In a rundown, what do you do with the ball first?', options: ['Run at the runner with it up', 'Throw it right away', 'Toss it to the pitcher'], answer: 0, why: 'Running at him forces him to pick a base. Then one short throw does the job.' },
    },

    {
      id: 'hustle-double-overthrow',
      cat: 'hustle',
      title: 'Overthrow at 1st: stop the second one',
      blurb: 'The throw gets by 1B and the batter heads for 2nd. RF stays calm, looks, and runs it in.',
      outs: 0,
      cues: [
        'One bad throw is a base. Two bad throws is a run.',
        'Backup picks it up and looks. No rushed throw.',
        'Runner going to 2nd is fine. Keep him from 3rd.',
      ],
      jobs: {
        SS: 'Field it, step, throw chest high.',
        RF: 'Run behind first on contact. Grab it, look, then run it toward the infield.',
        '2B': 'Be the cutoff or cover second. Hands up, yell "HERE!"',
        B: 'Hustle. If the ball gets by, go for 2nd.',
      },
      steps: [
        pitch(),
        {
          d: 1200, say: 'Grounder to short. RF is running in behind first.', focus: ['SS', 'RF'],
          ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
          moves: { SS: SS_FIELD, '1B': { to: 'ON1', at: [0.1, 1] }, B: { to: bat(0.2), at: [0.25, 1] }, RF: [66, 80] },
        },
        {
          d: 900, say: 'Throw is high and gets by 1B! The batter sees it and turns for 2nd.', focus: ['1B', 'B'],
          ball: { to: [56, 62], kind: 'throw', h: 12 },
          moves: { B: run('FIRST', 'SECOND', 0.3), RF: [62, 64], '2B': 'ON2' },
          mark: { text: 'OVERTHROW', at: 'FIRST', tone: 'info' },
        },
        {
          d: 900, say: 'RF picks it up right away. Runner is heading for 2nd, daring another throw.', focus: ['RF'],
          ball: { to: 'RF', kind: 'hand', at: [0.2, 0.6] },
          moves: { RF: [58, 62], B: run('FIRST', 'SECOND', 0.75) },
          mark: { text: 'BACKUP', at: 'RF', tone: 'info' },
        },
        {
          d: 1300, say: 'RF looks, does NOT rush. He runs it in toward the infield. Runner stops at 2nd.', focus: ['RF', 'B'],
          moves: { RF: [40, 56], B: 'SECOND' },
          mark: { text: 'RUN IT IN', at: 'RF', tone: 'info' },
        },
        {
          d: 900, say: 'Short flip to the pitcher. Runner on 2nd, and that\'s all.', focus: ['P'],
          ball: { to: 'P', kind: 'throw', h: 4 },
          mark: { text: 'SAFE', at: 'SECOND', tone: 'safe' },
        },
      ],
      wrong: {
        label: 'Rushed second throw',
        steps: [
          pitch(),
          {
            d: 1200, say: 'Same grounder. RF is running in behind first.', focus: ['SS', 'RF'],
            ball: { to: 'SS', kind: 'ground', at: [0, 0.9] },
            moves: { SS: SS_FIELD, '1B': { to: 'ON1', at: [0.1, 1] }, B: { to: bat(0.2), at: [0.25, 1] }, RF: [66, 80] },
          },
          {
            d: 900, say: 'Overthrow gets by 1B. Batter turns for 2nd.', focus: ['B'],
            ball: { to: [56, 62], kind: 'throw', h: 12 },
            moves: { B: run('FIRST', 'SECOND', 0.3), RF: [62, 64], '2B': 'ON2' },
            mark: { text: 'OVERTHROW', at: 'FIRST', tone: 'info' },
          },
          {
            d: 900, say: 'RF grabs it and throws right away, off balance, to 2nd.', focus: ['RF'],
            ball: { to: [4, 112], kind: 'throw', h: 13 },
            moves: { RF: [58, 62], B: run('FIRST', 'SECOND', 0.85) },
            mark: { text: 'OVER HIS HEAD', at: 'SECOND', tone: 'info' },
          },
          {
            d: 1500, say: 'Second bad throw. It rolls into center and the runner keeps going.', focus: ['B'],
            ball: { to: [10, 130], kind: 'roll' },
            moves: { B: 'THIRD', CF: [10, 128] },
          },
          {
            d: 1400, say: 'CF throws home late. The runner scores. One bad throw was a base, two was a run.', focus: ['B', 'C'],
            ball: { to: [0, -6], kind: 'throw', h: 10 },
            moves: { B: 'HOME' },
            mark: { text: 'RUN', at: 'HOME', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 3, q: 'You backed up an overthrow and the runner is going to 2nd. What now?', options: ['Look, then run it in', 'Rush a throw to second', 'Throw home'], answer: 0, why: 'One bad throw is a base. Rush another and it can be a run.' },
    },

    {
      id: 'hustle-ball-to-p',
      cat: 'hustle',
      title: 'Runner off 2nd: ball to the pitcher',
      blurb: 'Play is over but the runner keeps creeping toward 3rd. Get the ball to the pitcher and he stays put.',
      outs: 0,
      start: { runners: { R2: 'SECOND' } },
      cues: [
        'Ball to the pitcher ends it (check your league rule).',
        'Get it in the circle fast, then look at the runner.',
        'Do not throw around the horn to catch him.',
      ],
      jobs: {
        SS: 'Have the ball? Hand it to P. Then cover second.',
        P: 'Step into the circle. Show the ball and look at the runner.',
        '3B': 'Stay on the bag. Yell "BALL!" if he leaves.',
        R2: 'When the ball is with the pitcher, stay on the base.',
      },
      steps: [
        {
          d: 900, say: 'Ball is with SS after the play. The runner on 2nd takes a big lead and edges toward 3rd.', focus: ['R2', 'SS'],
          ball: { to: 'SS', kind: 'throw', h: 3 },
          moves: { R2: run('SECOND', 'THIRD', 0.15), '3B': 'ON3' },
        },
        {
          d: 900, say: 'SS gives it to the pitcher right away. Short, easy throw.', focus: ['SS', 'P'],
          ball: { to: 'P', kind: 'throw', h: 3 },
          moves: { R2: run('SECOND', 'THIRD', 0.22), SS: [-8, 72] },
          mark: { text: 'IN THE CIRCLE', at: 'P', tone: 'info' },
        },
        {
          d: 1000, say: 'Pitcher steps toward the runner with the ball up. The runner stops and goes back.', focus: ['P', 'R2'],
          shout: { who: '3B', text: 'BALL!' },
          moves: { P: [0, 46], R2: 'SECOND', SS: 'ON2' },
        },
        {
          d: 900, say: 'Runner stays on 2nd. Nobody threw anywhere.', focus: ['R2'],
          moves: { P: [0, 38] },
          mark: { text: 'HELD', at: 'SECOND', tone: 'safe' },
        },
      ],
      wrong: {
        label: 'Around the horn',
        steps: [
          {
            d: 900, say: 'Same spot. Runner is creeping toward 3rd.', focus: ['R2'],
            ball: { to: 'SS', kind: 'throw', h: 3 },
            moves: { R2: run('SECOND', 'THIRD', 0.15), '3B': 'ON3' },
          },
          {
            d: 900, say: 'SS skips the pitcher and fires to third to catch him.', focus: ['SS'],
            ball: { to: '3B', kind: 'throw', h: 6 },
            moves: { R2: run('SECOND', 'THIRD', 0.5) },
          },
          {
            d: 800, say: 'Runner dives back. 3B throws to second, but SS is not there.', focus: ['3B'],
            ball: { to: [8, 104], kind: 'throw', h: 8 },
            moves: { R2: run('SECOND', 'THIRD', 0.2) },
            mark: { text: 'NO ONE THERE', at: 'SECOND', tone: 'info' },
          },
          {
            d: 1500, say: 'It rolls to CF. Runner goes to 3rd, then home.', focus: ['R2'],
            ball: { to: [8, 132], kind: 'roll' },
            moves: { R2: 'HOME', CF: [8, 130] },
            mark: { text: 'RUN', at: 'HOME', tone: 'safe' },
          },
        ],
      },
      quiz: { at: 1, q: 'The play is over and a runner is creeping. Where does the ball go?', options: ['To the pitcher', 'Around the horn', 'Home plate'], answer: 0, why: 'Ball to the pitcher ends it. Extra throws only give away bases.' },
    },
  );
})();
