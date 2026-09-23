// play library: filter chips, search, cards with a route diagram
(() => {
  const $ = (id) => document.getElementById(id);
  const { store } = DG;
  const FAVS = 'favs';
  const ALL = 'all';
  const thumbs = {};
  let filter = ALL;
  let query = '';
  let handlers = {};

  const chip = (key, label, color) => {
    const b = document.createElement('button');
    b.dataset.key = key;
    b.textContent = label;
    if (color) b.style.setProperty('--c', color);
    b.setAttribute('aria-pressed', key === filter);
    b.addEventListener('click', () => { filter = key; render(); });
    return b;
  };

  const matches = (p) => {
    if (filter === FAVS && !store.isFav(p.id)) return false;
    if (filter !== FAVS && filter !== ALL && p.cat !== filter) return false;
    if (!query) return true;
    const hay = [p.title, p.blurb, DG.CATS[p.cat].name, ...p.cues, DG.situation(p).text].join(' ').toLowerCase();
    return query.split(/\s+/).every((w) => hay.includes(w));
  };

  const iconBtn = (icon, label, pressed, onClick) => {
    const b = document.createElement('button');
    b.className = 'icon-btn';
    b.setAttribute('aria-label', label);
    if (pressed !== null) b.setAttribute('aria-pressed', pressed);
    b.innerHTML = `<svg><use href="#${icon}"/></svg>`;
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(b); });
    return b;
  };

  const card = (p, i) => {
    const cat = DG.CATS[p.cat];
    const li = document.createElement('li');
    li.className = 'card';
    li.style.setProperty('--c', cat.color);
    li.style.setProperty('--i', i);
    li.classList.toggle('current', DG.player.current()?.id === p.id);

    const open = document.createElement('button');
    open.className = 'card-open';
    open.setAttribute('aria-label', `Open ${p.title}`);
    open.addEventListener('click', () => handlers.open(p.id));
    thumbs[p.id] ||= DG.thumb(p);
    const body = document.createElement('span');
    body.className = 'card-body';
    body.innerHTML = '<span class="card-cat"></span><span class="card-title"></span><span class="card-blurb"></span><span class="card-tags"></span>';
    body.children[0].textContent = cat.name;
    body.children[1].textContent = p.title;
    body.children[2].textContent = p.blurb;
    const tags = [DG.situation(p).text, p.wrong && 'Do / Don\'t', p.quiz && 'Quiz'].filter(Boolean);
    body.children[3].replaceChildren(...tags.map((t) => Object.assign(document.createElement('span'), { textContent: t })));
    open.append(thumbs[p.id], body);

    const side = document.createElement('div');
    side.className = 'card-side';
    side.append(
      iconBtn('i-star', `Favorite ${p.title}`, store.isFav(p.id), (b) => handlers.fav(p.id, b)),
      iconBtn('i-plus', `Add ${p.title} to practice`, null, () => handlers.add(p.id)),
    );
    li.append(open, side);
    return li;
  };

  function render() {
    const cats = $('cats');
    cats.replaceChildren(
      chip(ALL, 'All'),
      chip(FAVS, `Starred${store.state.favs.length ? ` ${store.state.favs.length}` : ''}`, '#ffe14d'),
      ...Object.entries(DG.CATS).map(([k, c]) => chip(k, c.name, c.color)),
    );
    const list = DG.plays.filter(matches);
    $('lib-count').textContent = `${list.length} of ${DG.plays.length}`;
    const lib = $('lib');
    lib.replaceChildren(...list.map(card));
    if (!list.length) {
      const empty = document.createElement('li');
      empty.className = 'lib-empty';
      empty.textContent = filter === FAVS ? 'No starred plays yet. Tap the star on any play.' : 'No plays match that search.';
      lib.append(empty);
    }
  }

  $('search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); render(); });

  DG.library = {
    init(h) { handlers = h; render(); },
    render,
  };
})();
