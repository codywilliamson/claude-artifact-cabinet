// shared bits for writing play scripts
(() => {
  DG.CATS = {
    force: { name: 'Force outs', color: '#ff8f5a' },
    front: { name: 'Get in front', color: '#3ddc84' },
    deep: { name: 'Play deep', color: '#8ec5ff' },
    cutoff: { name: 'Hit the cutoff', color: '#ffe14d' },
    talk: { name: 'Talk & back up', color: '#e79cff' },
  };

  DG.plays = [];

  const CONTACT = [0, 1.5];

  DG.kit = {
    run: DG.along,
    // batter's trip from the box to first, f = fraction of the 60 ft
    bat: (f) => DG.along('BOX', 'FIRST', f),
    pitch: (say = 'Coach pitch. Everybody in ready position: knees bent, glove open, "hit it to me."') => ({
      d: 750, say, ball: { to: CONTACT, kind: 'pitch' },
    }),
  };
})();
