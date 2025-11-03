// js/recommendations.js
const watchlist = window.watchlist;

const recGrid   = document.getElementById('rec-grid');
const spinner   = document.getElementById('rec-spinner');
const emptyMsg  = document.getElementById('rec-empty');
const countTxt  = document.getElementById('rec-count');

/* ---------- local ratings (optional) ---------- */
const RATING_KEY = 'movieApp_ratings';
function getRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATING_KEY)) || {};
  } catch {
    return {};
  }
}
function avgRating() {
  const ratings = Object.values(getRatings());
  if (!ratings.length) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

/* ---------- build user taste vector ---------- */
async function buildUserVector() {
  const genreFreq = {};
  const keywordFreq = {};
  const directorFreq = {};
  const actorFreq = {};
  const ratings = getRatings();

  const items = watchlist.getAll();
  if (!items.length) return null;

  for (const m of items) {
    const res = await fetch(`${BASE_URL}/movie/${m.id}?api_key=${API_KEY}&append_to_response=keywords,credits`);
    const detail = await res.json();

    detail.genres?.forEach(g => {
      genreFreq[g.id] = (genreFreq[g.id] || 0) + 1;
    });

    detail.keywords?.keywords?.forEach(k => {
      keywordFreq[k.name] = (keywordFreq[k.name] || 0) + 1;
    });

    const director = detail.credits?.crew?.find(c => c.job === 'Director');
    if (director) {
      directorFreq[director.id] = (directorFreq[director.id] || 0) + 1;
    }
    detail.credits?.cast?.slice(0, 5).forEach(a => {
      actorFreq[a.id] = (actorFreq[a.id] || 0) + 1;
    });
  }

  // normalise to 0-1
  const total = Object.values(genreFreq).reduce((a, b) => a + b, 0);
  Object.keys(genreFreq).forEach(id => genreFreq[id] = genreFreq[id] / total);

  const totalK = Object.values(keywordFreq).reduce((a, b) => a + b, 0);
  Object.keys(keywordFreq).forEach(k => keywordFreq[k] = keywordFreq[k] / totalK);

  const totalD = Object.values(directorFreq).reduce((a, b) => a + b, 0);
  Object.keys(directorFreq).forEach(id => directorFreq[id] = directorFreq[id] / totalD);

  const totalA = Object.values(actorFreq).reduce((a, b) => a + b, 0);
  Object.keys(actorFreq).forEach(id => actorFreq[id] = actorFreq[id] / totalA);

  return {
    genres: genreFreq,
    keywords: keywordFreq,
    directors: directorFreq,
    actors: actorFreq,
    avgRating: avgRating(),
    watchlistIds: new Set(watchlist.getAll().map(m => m.id))
  };
}

/* ---------- scoring ---------- */
async function score(movie, vector) {
  if (vector.watchlistIds.has(movie.id)) return -Infinity;

  // genre match
  let genreScore = 0;
  movie.genre_ids?.forEach(id => {
    genreScore += vector.genres[id] || 0;
  });
  genreScore = genreScore / Math.max(movie.genre_ids?.length, 1);

  // keyword match (we fetch keywords for candidate later – here we use overview as cheap proxy)
  let keywordScore = 0;
  const words = (movie.overview || '').toLowerCase().split(/\W+/);
  words.forEach(w => {
    keywordScore += vector.keywords[w] || 0;
  });
  keywordScore = keywordScore / Math.max(words.length, 1);

  // rating proximity
  const ratingScore = 1 - Math.abs((movie.vote_average - vector.avgRating) / 10);

  // year boost (recent)
  const year = new Date(movie.release_date).getFullYear();
  const yearScore = year >= 2015 ? 0.1 : 0;

  // director and actor score
  let directorScore = 0;
  let actorScore = 0;
  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  if (director && vector.directors[director.id]) {
    directorScore = vector.directors[director.id];
  }
  movie.credits?.cast?.slice(0, 5).forEach(a => {
    if (vector.actors[a.id]) {
      actorScore += vector.actors[a.id];
    }
  });
  actorScore = actorScore / 5;


  return directorScore * 3 + actorScore * 2 + genreScore * 2 + keywordScore * 1 + ratingScore * 1 + yearScore;
}

/* ---------- fetch candidates ---------- */
async function fetchCandidates(vector) {
  const similarMovies = await Promise.all(watchlist.getAll().map(m =>
    fetch(`${BASE_URL}/movie/${m.id}/similar?api_key=${API_KEY}&append_to_response=credits`).then(r => r.json())
  ));

  const topDirectors = Object.keys(vector.directors).sort((a, b) => vector.directors[b] - vector.directors[a]).slice(0, 3);
  const directorMovies = await Promise.all(topDirectors.map(id =>
    fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_crew=${id}&append_to_response=credits`).then(r => r.json())
  ));

  const topActors = Object.keys(vector.actors).sort((a, b) => vector.actors[b] - vector.actors[a]).slice(0, 5);
  const actorMovies = await Promise.all(topActors.map(id =>
    fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_cast=${id}&append_to_response=credits`).then(r => r.json())
  ));

  const pools = [
    ...similarMovies.flatMap(s => s.results),
    ...directorMovies.flatMap(s => s.results),
    ...actorMovies.flatMap(s => s.results)
  ];

  // de-duplicate
  const map = new Map();
  pools.forEach(m => {
    if (!map.has(m.id)) map.set(m.id, m);
  });
  return [...map.values()];
}

/* ---------- rank ---------- */
async function rankCandidates(vector) {
  const candidates = await fetchCandidates(vector);
  for (const c of candidates) {
    c._score = await score(c, vector);
    // Boost score with popularity to show popular movies at top while maintaining personalization
    // Use popularity as a bonus to the personalization score, but don't overwhelm personal preferences
    if (c.popularity) {
      // Normalize popularity (typically ranges 0-30) and add as weighted factor
      c._score += (c.popularity * 0.1); // Add popularity as a bonus that enhances personalization
    }
  }
  candidates.sort((a, b) => b._score - a._score);
  return candidates.slice(0, 24);
}

/* ---------- render ---------- */
function renderRecs(movies) {
  spinner.classList.add('hidden');
  if (!movies.length) {
    emptyMsg.classList.remove('hidden');
    return;
  }
  countTxt.textContent = `(found ${movies.length})`;
  movies.forEach(m => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <img src="${IMAGE_BASE + m.poster_path}" alt="${m.title}" class="w-full h-80 object-cover rounded-lg shadow">
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg"></div>
      <div class="absolute bottom-2 left-3 text-white">
        <h3 class="font-bold text-sm truncate">${m.title}</h3>
        <p class="text-xs">⭐ ${m.vote_average.toFixed(1)}</p>
      </div>
      <button data-id="${m.id}" class="add-rec absolute top-2 right-2 bg-blue-600/80 hover:bg-blue-600 text-white px-2 py-1 text-xs rounded">+</button>
    `;
    card.querySelector('.add-rec').addEventListener('click', e => {
      e.stopPropagation();
      watchlist.add({id: m.id, title: m.title, poster_path: m.poster_path});
      e.target.textContent = '✓';
      e.target.disabled = true;
    });
    recGrid.appendChild(card);
  });
}



/* ---------- boot ---------- */
(async function init() {
  const vector = await buildUserVector();
  if (!vector) {
    spinner.classList.add('hidden');
    emptyMsg.classList.remove('hidden');
    return;
  }
  const ranked = await rankCandidates(vector);
  renderRecs(ranked);
})();
