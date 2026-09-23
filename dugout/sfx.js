// synthesized ballpark sounds, no audio files
(() => {
  let ctx;
  const audio = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

  const noise = (dur, freq, q, gain) => {
    const c = audio();
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = c.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(c.destination);
    src.start();
  };

  const tone = (freq, dur, gain, type = 'triangle', delay = 0) => {
    const c = audio();
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur);
  };

  const SOUNDS = {
    crack: () => { noise(0.14, 2600, 1.1, 1.6); tone(140, 0.06, 0.25, 'square'); },
    pop: () => noise(0.07, 800, 2.2, 1.1),
    out: () => { tone(660, 0.12, 0.12); tone(990, 0.2, 0.12, 'triangle', 0.11); },
    mark: () => tone(520, 0.1, 0.06),
  };

  DG.sfx = {
    unlock: () => { try { audio().resume(); } catch { /* no audio support */ } },
    play: (name) => { try { SOUNDS[name]?.(); } catch { /* audio blocked */ } },
  };
})();
