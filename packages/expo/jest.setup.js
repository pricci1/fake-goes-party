// jotai's atomWithStorage with getOnInit calls localStorage at module load time.
// Provide a minimal in-memory polyfill so atoms initialize without throwing.
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] ?? null,
  setItem: (key, value) => { storage[key] = String(value); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
  key: (index) => Object.keys(storage)[index] ?? null,
  get length() { return Object.keys(storage).length; },
};
