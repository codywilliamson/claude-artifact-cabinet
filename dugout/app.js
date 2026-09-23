// boot: tabs, deep links, and glue between player, library and practice
(() => {
  const $ = (id) => document.getElementById(id);
  const { store } = DG;
  const TOAST_MS = 1800;
  let toastTimer;

  const toast = (text) => {
    const t = $('toast');
    t.textContent = text;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), TOAST_MS);
  };

  const pop = (btn) => {
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
  };

  const showView = (name) => {
    for (const b of document.querySelectorAll('.tabs button')) b.setAttribute('aria-selected', b.dataset.view === name);
    $('view-plays').hidden = name !== 'plays';
    $('view-practice').hidden = name !== 'practice';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const syncFav = () => $('p-fav').setAttribute('aria-pressed', store.isFav(DG.player.current().id));

  const open = (id, autoplay = true) => {
    const p = DG.plays.find((x) => x.id === id) || DG.plays[0];
    DG.player.load(p, autoplay);
    syncFav();
    DG.library.render();
    showView('plays');
    try { history.replaceState(null, '', `#${p.id}`); } catch { /* sandboxed frame */ }
  };

  const fav = (id, btn) => {
    const on = store.toggleFav(id);
    pop(btn);
    toast(on ? 'Starred' : 'Unstarred');
    syncFav();
    DG.library.render();
  };

  const add = (id) => {
    const p = DG.plays.find((x) => x.id === id);
    if (DG.practice.has(id)) return toast('Already in the plan');
    DG.practice.add(id);
    pop($('tab-practice'));
    toast(`Added: ${p.title}`);
  };

  for (const b of document.querySelectorAll('.tabs button')) b.addEventListener('click', () => showView(b.dataset.view));
  $('p-fav').addEventListener('click', (e) => fav(DG.player.current().id, e.currentTarget));
  $('p-add').addEventListener('click', (e) => { pop(e.currentTarget); add(DG.player.current().id); });

  DG.library.init({ open, fav, add });
  DG.practice.init({ open });

  const fromHash = location.hash.slice(1);
  open(DG.plays.some((p) => p.id === fromHash) ? fromHash : store.state.last || DG.plays[0].id, false);
})();
