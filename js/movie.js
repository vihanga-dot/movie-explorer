// Get movie ID from URL
const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

// Fetch and display movie details
async function fetchMovieDetails(id) {
  const container = document.getElementById('movie-details'); // ← add this
  if (!container) return;                                   // ← add this
  const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
  const movie = await res.json();

  const isSaved = watchlist.isSaved(movie.id);
  container.innerHTML = `
  <img src="${IMAGE_BASE + movie.poster_path}" alt="${
    movie.title
  }" class="w-full md:w-1/3 rounded-lg shadow" />
  <div>
    <h2 class="text-3xl font-bold mb-2">${movie.title}</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Release Date: ${
      movie.release_date
    }</p>
    <p class="mb-4">${movie.overview}</p>
    <p class="font-semibold">Genres:</p>
    <div class="flex flex-wrap gap-2 mt-1">
      ${movie.genres
        .map(
          (g) =>
            `<span class="px-2 py-1 bg-blue-600 text-white text-sm rounded">${g.name}</span>`
        )
        .join("")}
    </div>
    <p class="mt-4 font-semibold">Rating: ⭐ ${movie.vote_average} / 10</p>
    <button id="detail-toggle" class="mt-4 px-4 py-2 rounded text-white ${
      isSaved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
    }">
      ${isSaved ? "✓ In watchlist" : "+ Add to watchlist"}
    </button>
  </div>
`;

  // handle toggle
  document
    .getElementById("detail-toggle")
    .addEventListener("click", function () {
      const userUid = localStorage.getItem('userUid');
      if (!userUid) {
        alert("Please log in to add movies to your watchlist.");
        window.location.href = 'login.html';
        return;
      }

      if (watchlist.isSaved(movie.id)) {
        watchlist.remove(movie.id);
        this.textContent = "+ Add to watchlist";
        this.classList.remove("bg-green-600");
        this.classList.add("bg-blue-600", "hover:bg-blue-700");
      } else {
        watchlist.add({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
        });
        this.textContent = "✓ In watchlist";
        this.classList.remove("bg-blue-600", "hover:bg-blue-700");
        this.classList.add("bg-green-600");
      }
    });
}

fetchMovieDetails(movieId);
