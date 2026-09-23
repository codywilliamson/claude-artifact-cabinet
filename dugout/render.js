// draws a timeline frame onto the field svg
(() => {
  const { el, toSvg, VIEWBOX, MARK_AT } = DG;
  const H_PX = 1.05;
  const TRAIL_SAMPLES = 24;
  const INFO_HOLD = 1600;
  const MARK_LIFT = 17;
  const SHOUT_LIFT = 20;

  const screen = ({ pos, h }) => {
    const [x, y] = toSvg(pos);
    return [x, y - h * H_PX];
  };
  const fmt = (n) => n.toFixed(1);
  const translate = ([x, y]) => `translate(${fmt(x)} ${fmt(y)})`;
  const show = (node, on) => {
    const want = on ? 'inline' : 'none';
    if (node.getAttribute('display') === want) return false;
    node.setAttribute('display', want);
    return on;
  };

  const trailPath = (b, upTo) => {
    const n = Math.max(1, Math.round(TRAIL_SAMPLES * upTo));
    let d = '';
    for (let j = 0; j <= n; j++) {
      const [x, y] = screen(DG.flight(b, (upTo * j) / n));
      d += `${j ? 'L' : 'M'}${fmt(x)},${fmt(y)}`;
    }
    return d;
  };

  const bubble = (g, text, cls, fontW) => {
    const w = text.length * fontW + 14;
    el('rect', { x: -w / 2, y: -9, width: w, height: 18, rx: cls === 'shout' ? 9 : 3 }, g);
    el('text', {}, g).textContent = text;
  };

  const burst = (g) => {
    const b = el('g', { class: 'burst show' }, g);
    for (let j = 0; j < 7; j++) {
      const a = (j / 7) * Math.PI * 2;
      el('circle', { r: 1.4, style: `--dx:${fmt(Math.cos(a) * 14)}px;--dy:${fmt(Math.sin(a) * 9)}px` }, b);
    }
    return b;
  };

  class Field {
    constructor(svg, onSelect) {
      svg.setAttribute('viewBox', VIEWBOX);
      DG.drawField(el('g', {}, svg));
      this.gRoutes = el('g', {}, svg);
      this.gTrails = el('g', {}, svg);
      const gShadow = el('g', {}, svg);
      this.gActors = el('g', {}, svg);
      this.gFx = el('g', {}, svg);
      const gBall = el('g', {}, svg);
      this.shadow = el('ellipse', { rx: 2.6, ry: 1.2, fill: 'rgba(0,0,0,.5)' }, gShadow);
      this.halo = el('circle', { r: 6, fill: 'rgba(255,225,77,.28)' }, gBall);
      this.ball = el('circle', { r: 2.5, fill: 'url(#dg-ball)', stroke: '#c0392b', 'stroke-width': 0.6 }, gBall);
      this.onSelect = onSelect;
      this.showRoutes = false;
      this.selected = null;
    }

    load(tl) {
      this.tl = tl;
      [this.gRoutes, this.gTrails, this.gActors, this.gFx].forEach((g) => g.replaceChildren());
      this.tokens = {};
      this.routes = {};
      for (const k of tl.keys) {
        const run = DG.isRunner(k);
        const g = el('g', { class: `tok ${run ? 'run' : 'def'}` }, this.gActors);
        el('circle', { r: 15, fill: 'transparent' }, g);
        el('circle', { class: 'ring', r: 12.5 }, g);
        el('circle', { class: 'body', r: 9 }, g);
        el('text', {}, g).textContent = k;
        g.addEventListener('click', () => this.onSelect(k));
        this.tokens[k] = g;
        this.routes[k] = el('g', { class: 'routes', display: 'none' }, this.gRoutes);
      }

      this.fx = tl.steps.map((s) => {
        for (const [k, m] of Object.entries(s.moves)) {
          const [x1, y1] = toSvg(s.from[k]);
          const [x2, y2] = toSvg(m.to);
          if (Math.hypot(x2 - x1, y2 - y1) > 2) el('line', { class: `route ${DG.isRunner(k) ? 'run' : 'def'}`, x1, y1, x2, y2 }, this.routes[k]);
        }
        const fx = {};
        if (s.ball && s.ball.kind !== 'hand') {
          fx.trail = el('path', { class: `trail ${s.ball.hit ? '' : 'throw'}`, fill: 'none', display: 'none' }, this.gTrails);
        }
        if (s.mark) {
          const g = el('g', { display: 'none', transform: translate(this.markSpot(s)) }, this.gFx);
          if (s.mark.tone === 'out') fx.burst = burst(g);
          fx.mark = el('g', { class: `mark show ${s.mark.tone || 'info'}` }, g);
          bubble(fx.mark, s.mark.text, 'mark', 9.2);
          fx.markWrap = g;
        }
        if (s.shout) {
          fx.shout = el('g', { class: 'shout show', display: 'none' }, this.gFx);
          bubble(fx.shout, s.shout.text, 'shout', 5.4);
        }
        return fx;
      });
    }

    markSpot(s) {
      const [x, y] = toSvg(DG.pt(s.mark.at, s.to));
      return [Math.min(330, Math.max(30, x)), y - MARK_LIFT];
    }

    draw(fr) {
      const { actors, ball, i, f, T, step } = fr;
      const focus = new Set(step.focus || []);
      for (const k in this.tokens) {
        const t = this.tokens[k];
        t.setAttribute('transform', translate(toSvg(actors[k])));
        t.classList.toggle('focus', focus.has(k) && k !== this.selected);
        t.classList.toggle('sel', k === this.selected);
        t.classList.toggle('dim', !!this.selected && k !== this.selected);
        show(this.routes[k], this.showRoutes || k === this.selected);
      }

      const [gx, gy] = toSvg(ball.pos);
      if (ball.held) {
        this.ball.setAttribute('cx', fmt(gx + 5.5));
        this.ball.setAttribute('cy', fmt(gy - 4));
        this.ball.setAttribute('r', 2.2);
      } else {
        const [bx, by] = screen(ball);
        this.ball.setAttribute('cx', fmt(bx));
        this.ball.setAttribute('cy', fmt(by));
        this.ball.setAttribute('r', fmt(2.5 + Math.min(ball.h, 60) * 0.035));
      }
      show(this.halo, ball.flying);
      this.halo.setAttribute('cx', this.ball.getAttribute('cx'));
      this.halo.setAttribute('cy', this.ball.getAttribute('cy'));
      show(this.shadow, !ball.held);
      this.shadow.setAttribute('cx', fmt(gx));
      this.shadow.setAttribute('cy', fmt(gy + 1));
      this.shadow.setAttribute('rx', fmt(Math.max(1.2, 2.8 - ball.h * 0.03)));

      const last = this.tl.steps.length - 1;
      this.tl.steps.forEach((s, j) => {
        const fx = this.fx[j];
        if (fx.trail) {
          const b = s.ball;
          const u = j < i ? 1 : j > i ? 0 : Math.max(0, Math.min(1, (f - b.at[0]) / (b.at[1] - b.at[0] || 1)));
          show(fx.trail, u > 0);
          if (u > 0) fx.trail.setAttribute('d', trailPath(b, u));
        }
        // css animations restart whenever display flips back on, so the stamp replays on scrub
        if (fx.markWrap) {
          const tMark = s.start + s.dur * MARK_AT;
          const sticky = s.mark.tone === 'out' || s.mark.tone === 'safe' || j === last;
          show(fx.markWrap, T >= tMark && (sticky || T < tMark + INFO_HOLD));
        }
        if (fx.shout) {
          const on = j === i && f >= (s.shout.from ?? 0.1);
          show(fx.shout, on);
          if (on) {
            const [x, y] = toSvg(actors[s.shout.who]);
            fx.shout.setAttribute('transform', translate([Math.min(320, Math.max(40, x)), y - SHOUT_LIFT]));
          }
        }
      });
    }
  }

  DG.Field = Field;

  // static diagram for library cards: every route plus the ball's path
  DG.thumb = (play) => {
    const svg = el('svg', { class: 'thumb', viewBox: VIEWBOX, 'aria-hidden': 'true' });
    DG.drawField(el('g', {}, svg), true);
    const tl = DG.compile(play);
    for (const s of tl.steps) {
      for (const [k, m] of Object.entries(s.moves)) {
        const [x1, y1] = toSvg(s.from[k]);
        const [x2, y2] = toSvg(m.to);
        el('line', { x1, y1, x2, y2, stroke: DG.isRunner(k) ? '#ff6a45' : '#4db4ff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.9 }, svg);
      }
      if (s.ball && s.ball.kind !== 'pitch' && s.ball.kind !== 'hand') {
        el('path', { d: trailPath(s.ball, 1), fill: 'none', stroke: '#ffe14d', 'stroke-width': 3.4, 'stroke-dasharray': '7 5', 'stroke-linecap': 'round' }, svg);
      }
    }
    for (const [k, p] of Object.entries(tl.final.actors)) {
      const [x, y] = toSvg(p);
      el('circle', { cx: x, cy: y, r: 6.5, fill: DG.isRunner(k) ? '#ff6a45' : '#4db4ff', stroke: '#06121c', 'stroke-width': 1.5 }, svg);
    }
    return svg;
  };
})();
