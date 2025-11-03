// ====================================
// 🔁 Reusable Navbar Loader
// ====================================

document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById("navbar-container");

  if (navbarContainer) {
    navbarContainer.innerHTML = `
      <header
        id="navbar"
        class="sticky top-0 z-50 backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 border-b border-transparent"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a
              href="index.html"
              class="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white"
            >
              <span class="text-2xl">🎬</span>
              <span>Movie Explorer</span>
            </a>

            <!-- Center nav links -->
            <nav
              class="hidden md:flex items-center gap-6 text-gray-700 dark:text-gray-200"
            >
              <a href="index.html" class="nav-link hover:text-blue-500">Home</a>
              <a href="watchlist.html" class="nav-link hover:text-blue-500">Watchlist</a>
              <a href="recommendations.html" class="nav-link hover:text-blue-500">Recommendations</a>
            </nav>

            <!-- Theme toggle -->
            <button
              id="theme-toggle"
              class="relative w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-500 flex items-center px-1 hover:ring-2 hover:ring-yellow-400 dark:hover:ring-blue-500"
            >
              <!-- Moving knob -->
              <span
                id="theme-knob"
                class="absolute left-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-500 dark:translate-x-7"
              ></span>

              <!-- Sun icon -->
              <svg
                id="icon-sun"
                class="w-4 h-4 text-yellow-500 transition-opacity duration-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 011.06-1.06l1.591 1.59a.75.75 0 01-1.06 1.06l-1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM17.894 17.894a.75.75 0 011.06 1.06l-1.59 1.591a.75.75 0 01-1.06-1.06l1.59-1.591zM12 18.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM5.106 17.894a.75.75 0 011.06-1.06l1.591 1.59a.75.75 0 01-1.06 1.06l-1.591-1.59zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM6.106 5.106a.75.75 0 011.06 1.06l-1.59 1.591a.75.75 0 01-1.06-1.06l1.59-1.591z"
                />
              </svg>

              <!-- Moon icon -->
              <svg
                id="icon-moon"
                class="w-4 h-4 text-blue-400 opacity-0 dark:opacity-100 transition-opacity duration-500 absolute right-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73 8.15 8.15 0 01-8.14-8.1 8.59 8.59 0 01.25-2A1 1 0 005.57 4.36a10.08 10.08 0 105.32 15.35 1 1 0 0010.75-6.71z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
    `;
  }
});
