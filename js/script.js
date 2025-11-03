// ===============================
// GLOBAL DOM ELEMENTS (Safe access)
// ===============================
const spinner = document.getElementById("spinner");
const movieGrid = document.getElementById("movie-grid");
const loadMoreBtn = document.getElementById("load-more");
const searchInput = document.getElementById("search-input");
const navbar = document.getElementById("navbar");
const surpriseBtn = document.getElementById("surpriseBtn"); // 🎲 Surprise Me button
const ratingFilter = document.getElementById('rating');
const ratingValue = document.getElementById('rating-value');
const yearFilter = document.getElementById('year');
const sortByFilter = document.getElementById('sort-by');
const applyFiltersBtn = document.getElementById('apply-filters');

// Theme toggle elements
const themeToggle = document.getElementById("theme-toggle");
const themeKnob = document.getElementById("theme-knob");
const iconSun = document.getElementById("icon-sun");
const iconMoon = document.getElementById("icon-moon");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const menuIcon = document.getElementById("menu-icon");
const closeIcon = document.getElementById("close-icon");

// ===============================
// GLOBAL STATE
// ===============================
let currentPage = 1;
let selectedGenreId = null;

// ===============================
// SPINNER CONTROL
// ===============================
function showSpinner() {
  if (spinner) spinner.classList.remove("hidden");
}
function hideSpinner() {
  if (spinner) spinner.classList.add("hidden");
}

// ===============================
// FETCH HELPERS (Used on index)
// ===============================
async function fetchPopularMovies(page = 1) {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
  );
  return (await res.json()).results;
}

async function fetchMoviesByGenre(genreId, page = 1) {
  const res = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
  );
  return (await res.json()).results;
}

async function searchMovies(query) {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      query
    )}`
  );
  return (await res.json()).results;
}

// ===============================
// RENDER FUNCTIONS
// ===============================
function renderMovies(movies) {
  if (!movieGrid) return;

  if (movies.length === 0) {
    movieGrid.innerHTML = `
      <p class="col-span-full text-center text-gray-500 dark:text-gray-400 mt-10">
        No movies found 🎬 Try a different search!
      </p>`;
    return;
  }

  movies.forEach((movie) => {
    if (!movie.poster_path) return;

    const isSaved = watchlist?.isSaved(movie.id);
    const card = document.createElement("div");
    card.className =
      "movie-card opacity-0 translate-y-4 bg-gray-100 dark:bg-gray-800 p-2 rounded cursor-pointer hover:scale-105 transition relative";

    card.innerHTML = `
      <div class="relative group">
        <img class="rounded-lg shadow-md group-hover:opacity-80 transition" 
             src="${IMAGE_BASE + movie.poster_path}" 
             alt="${movie.title}" />
        <span class="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">
          ⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
        </span>
      </div>
      <h3 class="mt-2 text-center text-lg font-semibold">${movie.title}</h3>
      <button 
        data-id="${movie.id}" 
        data-title="${movie.title}" 
        data-poster="${movie.poster_path}"
        class="watchlist-toggle absolute bottom-2 right-2 px-2 py-1 text-xs rounded ${
          isSaved
            ? "bg-green-600 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }">
        ${isSaved ? "✓ In watchlist" : "+ Add"}
      </button>
    `;

    // Click handling
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("watchlist-toggle")) {
        const userUid = localStorage.getItem('userUid');
        if (!userUid) {
          alert("Please log in to add movies to your watchlist.");
          window.location.href = 'login.html';
          return;
        }

        const btn = e.target;
        const id = btn.dataset.id;

        if (watchlist.isSaved(id)) {
          watchlist.remove(id);
          btn.textContent = "+ Add";
          btn.classList.remove("bg-green-600");
          btn.classList.add("bg-blue-600", "hover:bg-blue-700");
        } else {
          watchlist.add({
            id: Number(id),
            title: btn.dataset.title,
            poster_path: btn.dataset.poster,
          });
          btn.textContent = "✓ In watchlist";
          btn.classList.remove("bg-blue-600", "hover:bg-blue-700");
          btn.classList.add("bg-green-600");
        }
        return;
      }
      window.location.href = `movie.html?id=${movie.id}`;
    });

    movieGrid.appendChild(card);
    setTimeout(() => {
      card.classList.add("opacity-100", "translate-y-0");
    }, 50);
  });
}

// ===============================
// GENRE FILTERING (index.html only)
// ===============================
async function fetchGenres() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  const data = await res.json();
  renderGenreButtons(data.genres);
}

function renderGenreButtons(genres) {
  const container = document.getElementById("genre-filters");
  if (!container) return;

  container.innerHTML = "";
  genres.forEach((genre) => {
    const btn = document.createElement("button");
    btn.textContent = genre.name;
    btn.dataset.id = genre.id;
    btn.className =
      "genre-btn px-3 py-1 text-sm rounded transition bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 hover:text-white";
    btn.addEventListener("click", () => toggleGenre(genre.id, btn));
    container.appendChild(btn);
  });
}

async function toggleGenre(genreId, btn) {
  const allBtns = document.querySelectorAll(".genre-btn");

  if (selectedGenreId === genreId) {
    // Deselect the current genre
    selectedGenreId = null;
    allBtns.forEach((b) => {
      b.classList.remove("bg-blue-600", "text-white", "active");
    });
    resetToPopular();
    return;
  }

  // Select the new genre
  selectedGenreId = genreId;
  allBtns.forEach((b) => {
    b.classList.remove("bg-blue-600", "text-white", "active");
  });
  btn.classList.add("bg-blue-600", "text-white", "active");

  showSpinner();
  const movies = await fetchMoviesByGenre(genreId);
  hideSpinner();

  if (movieGrid) {
    movieGrid.innerHTML = "";
    renderMovies(movies);
    if (loadMoreBtn) loadMoreBtn.style.display = "block";
  }
}

function resetToPopular() {
  if (movieGrid) movieGrid.innerHTML = "";
  currentPage = 1;
  if (loadMoreBtn) loadMoreBtn.style.display = "block";
  loadInitialMovies();
}

// ===============================
// INITIAL MOVIES (index.html)
// ===============================
async function loadInitialMovies() {
  if (!movieGrid) return;
  showSpinner();
  const movies = await fetchPopularMovies();
  hideSpinner();
  renderMovies(movies);
}

// ===============================
// LIVE SEARCH WITH ANIMATION (index.html)
// ===============================
if (searchInput) {
  let typingTimer;
  const typingDelay = 500; // ms — wait after user stops typing
  let currentSearchQuery = "";

  searchInput.addEventListener("input", () => {
    clearTimeout(typingTimer);
    const query = searchInput.value.trim();

    // If cleared, reset to popular
    if (!query) {
      currentSearchQuery = "";
      resetToPopular();
      return;
    }

    typingTimer = setTimeout(async () => {
      // Avoid duplicate queries
      if (query === currentSearchQuery) return;
      currentSearchQuery = query;

      // Add subtle animation on search
      searchInput.classList.add("animate-pulse");
      showSpinner();

      try {
        const results = await searchMovies(query);
        hideSpinner();
        searchInput.classList.remove("animate-pulse");

        // Render results
        movieGrid.innerHTML = "";
        renderMovies(results);
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
      } catch (err) {
        console.error("Search error:", err);
        hideSpinner();
        searchInput.classList.remove("animate-pulse");
      }
    }, typingDelay);
  });
}


// ===============================
// THEME TOGGLE (works globally)
// ===============================
function setupThemeToggle() {
  if (!themeToggle) return;

  const html = document.documentElement;

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") html.classList.add("dark");
  else html.classList.remove("dark");

  const updateUI = () => {
    const isDark = html.classList.contains("dark");

    // Knob movement
    if (themeKnob) {
      themeKnob.classList.toggle("translate-x-7", isDark);
      themeKnob.classList.toggle("translate-x-0", !isDark);
    }

    // Icon visibility
    if (iconSun) iconSun.classList.toggle("hidden", isDark);
    if (iconMoon) iconMoon.classList.toggle("hidden", !isDark);

    // Background color
    themeToggle.classList.toggle("bg-gray-300", !isDark);
    themeToggle.classList.toggle("bg-gray-700", isDark);
  };

  updateUI();

  // On click toggle theme
  themeToggle.addEventListener("click", () => {
    html.classList.toggle("dark");
    const newTheme = html.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    updateUI();
  });

  // Mobile menu toggle (unchanged)
  mobileMenuBtn.addEventListener("click", () => {
    const isHidden = mobileMenu.classList.contains("hidden");

    if (isHidden) {
      mobileMenu.classList.remove("hidden");
      requestAnimationFrame(() => {
        mobileMenu.classList.remove("opacity-0", "scale-y-0");
        mobileMenu.classList.add("opacity-100", "scale-y-100");
      });
      menuIcon.classList.add("hidden");
      closeIcon.classList.remove("hidden");
    } else {
      mobileMenu.classList.add("opacity-0", "scale-y-0");
      mobileMenu.classList.remove("opacity-100", "scale-y-100");
      menuIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
      setTimeout(() => mobileMenu.classList.add("hidden"), 400);
    }
  });
}

// ===============================
// NAVBAR SCROLL EFFECT
// ===============================
if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) navbar.classList.add("shadow-lg");
    else navbar.classList.remove("shadow-lg");
  });
}

let isFetching = false;

window.addEventListener("scroll", async () => {
  if (!movieGrid || isFetching) return;

  const scrollPosition = window.innerHeight + window.scrollY;
  const bottom = document.body.offsetHeight - 100;

  if (scrollPosition >= bottom) {
    isFetching = true;
    currentPage++;

    showSpinner();

    let movies;
    if (ratingFilter.value > 0 || yearFilter.value !== "" || sortByFilter.value !== "popularity.desc") {
      movies = await fetchFilteredMovies(currentPage);
    } else if (selectedGenreId !== null) {
      movies = await fetchMoviesByGenre(selectedGenreId, currentPage);
    } else {
      movies = await fetchPopularMovies(currentPage);
    }

    hideSpinner();

    if (movies.length > 0) {
      renderMovies(movies);
    }

    isFetching = false;
  }
});

// ===============================
// AUTH UI MANAGEMENT
// ===============================
function updateAuthUI() {
  const userUid = localStorage.getItem('userUid');
  const authLinks = document.getElementById('auth-links');
  const userLinks = document.getElementById('user-links');
  const mobileAuthLinks = document.getElementById('mobile-auth-links');
  const mobileUserLinks = document.getElementById('mobile-user-links');

  if (userUid) {
    authLinks.style.display = 'none';
    userLinks.style.display = 'flex';
    mobileAuthLinks.style.display = 'none';
    mobileUserLinks.style.display = 'flex';
  } else {
    authLinks.style.display = 'flex';
    userLinks.style.display = 'none';
    mobileAuthLinks.style.display = 'flex';
    mobileUserLinks.style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('userUid');
  window.location.href = 'login.html';
}

function populateYearFilter() {
  if (!yearFilter) return;
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  }
}

async function fetchFilteredMovies(page = 1) {
  const rating = ratingFilter.value;
  const year = yearFilter.value;
  const sortBy = sortByFilter.value;

  let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}&vote_average.gte=${rating}&sort_by=${sortBy}`;
  if (year) {
    url += `&primary_release_year=${year}`;
  }
  if (selectedGenreId) {
    url += `&with_genres=${selectedGenreId}`;
  }

  const res = await fetch(url);
  return (await res.json()).results;
}

// ===============================
// PAGE INIT
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  updateAuthUI();
  populateYearFilter();

  if (ratingFilter) {
    ratingFilter.addEventListener('input', () => {
      ratingValue.textContent = ratingFilter.value;
    });
  }

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', async () => {
      currentPage = 1;
      showSpinner();
      const movies = await fetchFilteredMovies();
      hideSpinner();
      movieGrid.innerHTML = '';
      renderMovies(movies);
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', logout);
  }

  if (movieGrid) {
    loadInitialMovies();
    fetchGenres();
  }
});
