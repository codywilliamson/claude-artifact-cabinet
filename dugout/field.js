// field geometry in feet (home = 0,0, +y toward center field) and the static field art
(() => {
  const DG = (window.DG = {});
  const NS = 'http://www.w3.org/2000/svg';
  const SCALE = 1.35;
  const HOME_PX = [180, 330];
  const FENCE = 160;
  const VIEWBOX = '0 92 360 258';

  const SPOTS = {
    HOME: [0, 0], FIRST: [42.4, 42.4], SECOND: [0, 84.9], THIRD: [-42.4, 42.4],
    MOUND: [0, 38], BOX: [-5, 1],
    ON1: [40.5, 44.5], ON2: [1.5, 83], ON3: [-40.5, 44.5], ONH: [0, 2.5],
    PAST1: [52, 50], PAST3: [-44, 34],
  };

  // deep outfield on purpose, that's half the lesson at 8U
  const DEFENSE = {
    P: [0, 38], C: [0, -6], '1B': [50, 56], '2B': [24, 80], SS: [-24, 80],
    '3B': [-50, 56], LF: [-74, 128], CF: [0, 142], RF: [74, 128],
  };

  const toSvg = ([x, y]) => [HOME_PX[0] + x * SCALE, HOME_PX[1] - y * SCALE];

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  // one shared defs block so thumbnails don't duplicate ids
  const ensureDefs = () => {
    if (document.getElementById('dg-defs')) return;
    const svg = el('svg', { id: 'dg-defs', width: 0, height: 0, 'aria-hidden': 'true', style: 'position:absolute' });
    const defs = el('defs', {}, svg);
    const grass = el('pattern', { id: 'dg-grass', width: 18, height: 18, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45 180 330)' }, defs);
    el('rect', { width: 18, height: 18, fill: '#1b5a36' }, grass);
    el('rect', { width: 9, height: 18, fill: '#1f663e' }, grass);
    const clay = el('radialGradient', { id: 'dg-clay' }, defs);
    el('stop', { offset: '0', 'stop-color': '#d6925c' }, clay);
    el('stop', { offset: '1', 'stop-color': '#b56d3b' }, clay);
    const glow = el('radialGradient', { id: 'dg-glow' }, defs);
    el('stop', { offset: '0', 'stop-color': '#fff6d0', 'stop-opacity': '0.34' }, glow);
    el('stop', { offset: '1', 'stop-color': '#fff6d0', 'stop-opacity': '0' }, glow);
    const clip = el('clipPath', { id: 'dg-wedge' }, defs);
    el('path', { d: wedgePath(FENCE) }, clip);
    const ball = el('radialGradient', { id: 'dg-ball', cx: '0.35', cy: '0.35' }, defs);
    el('stop', { offset: '0', 'stop-color': '#ffffff' }, ball);
    el('stop', { offset: '1', 'stop-color': '#e6e0cf' }, ball);
    document.body.prepend(svg);
  };

  const foulPoint = (r, side) => toSvg([side * r * Math.SQRT1_2, r * Math.SQRT1_2]);

  function wedgePath(r) {
    const [lx, ly] = foulPoint(r, -1);
    const [rx, ry] = foulPoint(r, 1);
    return `M${HOME_PX} L${lx},${ly} A${r * SCALE},${r * SCALE} 0 0 1 ${rx},${ry} Z`;
  }

  const arcPath = (r) => {
    const [lx, ly] = foulPoint(r, -1);
    const [rx, ry] = foulPoint(r, 1);
    return `M${lx},${ly} A${r * SCALE},${r * SCALE} 0 0 1 ${rx},${ry}`;
  };

  const circle = (at, rFeet, attrs, g) => {
    const [cx, cy] = toSvg(at);
    return el('circle', { cx, cy, r: rFeet * SCALE, ...attrs }, g);
  };

  const poly = (pts, attrs, g) => el('polygon', { points: pts.map(toSvg).join(' '), ...attrs }, g);

  const drawBase = (at, g) => {
    const [x, y] = toSvg(at);
    el('rect', { x: x - 2.6, y: y - 2.6, width: 5.2, height: 5.2, fill: '#fbf8ef', transform: `rotate(45 ${x} ${y})` }, g);
  };

  DG.drawField = (g, mini = false) => {
    ensureDefs();
    el('rect', { x: 0, y: 0, width: 360, height: 350, fill: '#113a25' }, g);
    el('path', { d: wedgePath(FENCE), fill: 'url(#dg-grass)' }, g);
    el('path', { d: arcPath(FENCE - 4), fill: 'none', stroke: '#7d5233', 'stroke-width': 8 * SCALE, 'clip-path': 'url(#dg-wedge)' }, g);
    el('path', { d: arcPath(FENCE), fill: 'none', stroke: '#0a2217', 'stroke-width': 5 }, g);
    el('path', { d: arcPath(FENCE + 1.6), fill: 'none', stroke: '#ffe14d', 'stroke-width': 1.1, opacity: 0.85 }, g);

    circle([0, 36], 62, { fill: 'url(#dg-clay)', 'clip-path': 'url(#dg-wedge)' }, g);
    circle(SPOTS.HOME, 12, { fill: 'url(#dg-clay)' }, g);
    poly([[0, 9], [35, 43], [0, 77], [-35, 43]], { fill: 'url(#dg-grass)' }, g);
    circle(SPOTS.MOUND, 7, { fill: 'url(#dg-clay)' }, g);

    const [lx, ly] = foulPoint(FENCE, -1);
    const [rx, ry] = foulPoint(FENCE, 1);
    const chalk = { stroke: '#f4f0e6', 'stroke-width': 1.1, opacity: 0.9 };
    el('line', { x1: HOME_PX[0], y1: HOME_PX[1], x2: lx, y2: ly, ...chalk }, g);
    el('line', { x1: HOME_PX[0], y1: HOME_PX[1], x2: rx, y2: ry, ...chalk }, g);

    if (!mini) {
      for (const side of [-1, 1]) {
        const [bx, by] = toSvg([side > 0 ? 2.2 : -6.2, 3]);
        el('rect', { x: bx, y: by, width: 4 * SCALE, height: 6 * SCALE, fill: 'none', stroke: '#f4f0e6', 'stroke-width': 0.7, opacity: 0.7 }, g);
      }
      const [mx, my] = toSvg(SPOTS.MOUND);
      el('rect', { x: mx - 3, y: my - 0.8, width: 6, height: 1.6, fill: '#fbf8ef' }, g);
    }

    drawBase(SPOTS.FIRST, g);
    drawBase(SPOTS.SECOND, g);
    drawBase(SPOTS.THIRD, g);
    const [hx, hy] = HOME_PX;
    el('path', { d: `M${hx - 3},${hy - 3} h6 v3 l-3,3 l-3,-3z`, fill: '#fbf8ef' }, g);

    if (!mini) {
      el('circle', { cx: 18, cy: 96, r: 110, fill: 'url(#dg-glow)' }, g);
      el('circle', { cx: 342, cy: 96, r: 110, fill: 'url(#dg-glow)' }, g);
      const [fx, fy] = toSvg([0, FENCE + 4]);
      el('text', { x: fx, y: fy, 'text-anchor': 'middle', fill: '#ffe14d', 'font-size': 7, 'font-family': 'Barlow Condensed, sans-serif', 'font-weight': 700, 'letter-spacing': '0.1em', opacity: 0.8 }, g).textContent = "160'";
      el('text', { x: 10, y: 343, fill: '#f4f0e6', 'font-size': 6.5, 'font-family': 'Barlow Condensed, sans-serif', 'font-weight': 600, 'letter-spacing': '0.12em', opacity: 0.45 }, g).textContent = "60' BASES · COACH PITCH";
    }
  };

  Object.assign(DG, { NS, SCALE, VIEWBOX, SPOTS, DEFENSE, toSvg, el });
})();
