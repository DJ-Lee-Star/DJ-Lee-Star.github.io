const STATE_KEY = 'wb_demo_state';

const defaultState = {
  currentPage: 'p0',
  mode: 'auto',
  speed: 1.0,
  editHistory: [],
  approvalLevel: null,
  verifyComplete: false,
};

export const StateManager = {
  _cache: null,

  load() {
    if (this._cache) return this._cache;
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      this._cache = raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
    } catch {
      this._cache = { ...defaultState };
    }
    return this._cache;
  },

  save(partial) {
    const state = { ...this.load(), ...partial };
    this._cache = state;
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
    return state;
  },

  get(key) {
    return this.load()[key];
  },

  set(key, value) {
    return this.save({ [key]: value });
  },

  reset() {
    this._cache = null;
    sessionStorage.removeItem(STATE_KEY);
    return this.load();
  },

  addEdit(record) {
    const edits = [...(this.get('editHistory') || []), record];
    this.set('editHistory', edits);
    return edits;
  },
};
