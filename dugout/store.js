// everything saved lives in one localStorage blob on this device
(() => {
  const KEY = 'dugout.v1';
  const defaults = () => ({
    favs: [],
    notes: {},
    plan: { title: 'Next practice', items: [], notes: '' },
    prefs: { coach: true, routes: false, quiz: false, sound: false, speed: 1 },
    last: null,
  });

  let state = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    state = { ...state, ...saved, prefs: { ...state.prefs, ...saved.prefs }, plan: { ...state.plan, ...saved.plan } };
  } catch { /* private mode or blocked storage, run from defaults */ }

  const listeners = [];

  DG.store = {
    state,
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* not persisted, still works this session */ }
      listeners.forEach((fn) => fn(state));
    },
    onChange: (fn) => listeners.push(fn),
    isFav: (id) => state.favs.includes(id),
    toggleFav(id) {
      state.favs = state.favs.includes(id) ? state.favs.filter((f) => f !== id) : [...state.favs, id];
      this.save();
      return state.favs.includes(id);
    },
  };
})();
