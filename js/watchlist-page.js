// js/watchlist-page.js
const grid = document.getElementById('watchlist-grid');
const empty = document.getElementById('empty-msg');

function renderWatchlist() {
  const movies = watchlist.getAll();
  grid.innerHTML = '';
  if (!movies.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  movies.forEach(m => {
    const card = document.createElement('div');
    card.className = 'bg-gray-100 dark:bg-gray-800 p-2 rounded relative';
    card.innerHTML = `
      <img class="w-full h-64 object-cover rounded" src="${IMAGE_BASE + m.poster_path}" alt="${m.title}" />
      <h3 class="mt-2 text-center text-lg font-semibold">${m.title}</h3>
      <button data-id="${m.id}" class="remove-btn absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700">✕</button>
    `;
    grid.appendChild(card);
  });

  // delegate remove clicks
  grid.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
      const id = e.target.dataset.id;
      watchlist.remove(id);
      renderWatchlist();   // refresh UI
    }
  });
}

document.addEventListener('DOMContentLoaded', renderWatchlist);