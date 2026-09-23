// practice plan: queued plays and drills with minutes and checkoffs
(() => {
  const $ = (id) => document.getElementById(id);
  const { store } = DG;
  const plan = store.state.plan;
  const DEFAULT_MIN = 10;
  const MIN_STEP = 5;
  const MAX_MIN = 60;
  const CONFIRM_MS = 3000;
  let handlers = {};

  const uid = () => Math.random().toString(36).slice(2, 9);
  const playOf = (item) => DG.plays.find((p) => p.id === item.ref);

  const button = (html, label, onClick) => {
    const b = document.createElement('button');
    b.innerHTML = html;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', onClick);
    return b;
  };

  const update = (fn) => { fn(); store.save(); render(); };

  const move = (i, dir) => update(() => {
    const [item] = plan.items.splice(i, 1);
    plan.items.splice(i + dir, 0, item);
  });

  const row = (item, i) => {
    const p = item.type === 'play' ? playOf(item) : null;
    const li = document.createElement('li');
    li.className = `plan-item${item.done ? ' done' : ''}`;

    const check = button('<svg><use href="#i-check"/></svg>', item.done ? 'Mark not done' : 'Mark done', () => update(() => { item.done = !item.done; }));
    check.className = 'pi-check';

    const main = document.createElement('div');
    main.className = 'pi-main';
    const title = document.createElement(p ? 'button' : 'span');
    title.className = `pi-title${p ? ' link' : ''}`;
    title.textContent = p ? p.title : item.text;
    if (p) title.addEventListener('click', () => handlers.open(p.id));
    const meta = document.createElement('div');
    meta.className = 'pi-meta';
    const mins = document.createElement('b');
    mins.textContent = `${item.min} min`;
    meta.append(
      document.createTextNode(p ? DG.CATS[p.cat].name : 'Drill'),
      button('&minus;', 'Less time', () => update(() => { item.min = Math.max(MIN_STEP, item.min - MIN_STEP); })),
      mins,
      button('+', 'More time', () => update(() => { item.min = Math.min(MAX_MIN, item.min + MIN_STEP); })),
    );
    main.append(title, meta);

    const side = document.createElement('div');
    side.className = 'pi-side';
    const up = button('<svg><use href="#i-up"/></svg>', 'Move up', () => move(i, -1));
    const down = button('<svg><use href="#i-down"/></svg>', 'Move down', () => move(i, 1));
    up.disabled = i === 0;
    down.disabled = i === plan.items.length - 1;
    side.append(up, down, button('<svg><use href="#i-x"/></svg>', 'Remove', () => update(() => plan.items.splice(i, 1))));

    li.append(check, main, side);
    return li;
  };

  function render() {
    plan.items = plan.items.filter((it) => it.type !== 'play' || playOf(it));
    $('plan-list').replaceChildren(...plan.items.map(row));
    $('plan-empty').hidden = plan.items.length > 0;
    const total = plan.items.reduce((s, it) => s + it.min, 0);
    const done = plan.items.filter((it) => it.done).reduce((s, it) => s + it.min, 0);
    $('plan-min').textContent = total;
    $('plan-bar').style.width = `${total ? (done / total) * 100 : 0}%`;
    $('plan-count').textContent = plan.items.length || '';
  }

  $('plan-title').value = plan.title;
  $('plan-title').addEventListener('change', (e) => { plan.title = e.target.value.trim() || 'Next practice'; store.save(); });
  $('plan-notes').value = plan.notes;
  $('plan-notes').addEventListener('change', (e) => { plan.notes = e.target.value; store.save(); });

  $('plan-add').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('drill-text');
    const text = input.value.trim();
    if (!text) return;
    update(() => plan.items.push({ id: uid(), type: 'drill', text, min: DEFAULT_MIN, done: false }));
    input.value = '';
  });

  $('plan-reset').addEventListener('click', () => update(() => plan.items.forEach((it) => { it.done = false; })));

  const clear = $('plan-clear');
  let armed;
  clear.addEventListener('click', () => {
    if (!armed) {
      clear.classList.add('armed');
      clear.textContent = 'Tap again to clear';
      armed = setTimeout(disarm, CONFIRM_MS);
      return;
    }
    disarm();
    update(() => { plan.items = []; });
  });
  function disarm() {
    clearTimeout(armed);
    armed = null;
    clear.classList.remove('armed');
    clear.textContent = 'Clear plan';
  }

  DG.practice = {
    init(h) { handlers = h; render(); },
    has: (id) => plan.items.some((it) => it.ref === id),
    add(id) {
      update(() => plan.items.push({ id: uid(), type: 'play', ref: id, min: DEFAULT_MIN, done: false }));
    },
  };
})();
