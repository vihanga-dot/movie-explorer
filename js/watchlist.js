// js/watchlist.js
const STORAGE_KEY = 'movieApp_watchlist';

const watchlist = {
  _load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  _save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  add(movie) {               // movie = {id, title, poster_path}
    const list = this._load();
    if (!list.some(m => m.id === movie.id)) {
      list.push(movie);
      this._save(list);
    }
  },

  remove(id) {
    let list = this._load();
    list = list.filter(m => m.id !== Number(id));
    this._save(list);
  },

  getAll() {
    return this._load();
  },

  isSaved(id) {
    return this._load().some(m => m.id === Number(id));
  }
};

// make it available everywhere
window.watchlist = watchlist;

// Export for CommonJS (e.g. if this file is used in a Node/CommonJS bundle)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = watchlist;
}