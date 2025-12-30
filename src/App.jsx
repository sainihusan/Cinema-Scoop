import { useState } from "react";

const App = () => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null);
  const [trailer, setTrailer] = useState(null);

  const movie = async (p = 1) => {
    if (!title.trim()) {
      setError("Enter Movie Title");
      return;
    }

    setError("loading...");
    try {
      const url = `https://www.omdbapi.com/?apikey=${
        import.meta.env.VITE_CINEMAHUNT_API_KEY
      }&s=${title}&page=${p}${year ? `&y=${year}` : ""}${
        type ? `&type=${type}` : ""
      }`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.Response === "False") {
        setMovies([]);
        setTotal(0);
        setError(data.Error);
        return;
      }

      setMovies(p === 1 ? data.Search : [...movies, ...data.Search]);
      setTotal(parseInt(data.totalResults));
      setError("");
    } catch {
      setError("Network Error");
      setMovies([]);
      setTotal(0);
    }
  };

  const fetchTrailer = async (query) => {
    try {
      const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(
        query + " trailer"
      )}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`;

      const res = await fetch(ytUrl);
      const data = await res.json();

      if (data.items?.length) {
        setTrailer(
          `https://www.youtube.com/embed/${data.items[0].id.videoId}?autoplay=1`
        );
      } else {
        setTrailer(null);
      }
    } catch {
      setTrailer(null);
    }
  };

  const details = async (id) => {
    try {
      const detailUrl = `https://www.omdbapi.com/?apikey=${
        import.meta.env.VITE_CINEMAHUNT_API_KEY
      }&i=${id}&plot=full`;

      const res = await fetch(detailUrl);
      const data = await res.json();

      setModal(data);
      fetchTrailer(data.Title);
    } catch {
      setError("Failed to fetch details");
    }
  };

  const handleSearch = () => {
    setPage(1);
    movie(1);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    movie(next);
  };

  return (
    <div className="min-h-screen relative bg-[#020617] text-slate-100 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),transparent_60%)]" />

      <div className="relative z-10 p-4 sm:p-6">
        {/* Title */}
        <h1 className="text-center mb-12">
          <span className="block text-xs tracking-[0.4em] text-indigo-400 uppercase mb-2">
            Discover Movies
          </span>
          <span className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(99,102,241,0.6)]">
            Cinema Scoop
          </span>
        </h1>

        {/* Search Card */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-5xl mx-auto mb-10 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Search movies, series..."
            className="flex-1 p-4 rounded-2xl bg-black/50 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
          />

          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            className="w-full sm:w-28 p-4 rounded-2xl bg-black/50 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full sm:w-36 p-4 rounded-2xl bg-black/50 border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
          >
            <option value="">All</option>
            <option value="movie">Movie</option>
            <option value="series">Series</option>
            <option value="episode">Episode</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-xl"
          >
            Search
          </button>
        </div>

        {/* Loader / Error */}
        {error === "loading..." ? (
          <div className="flex justify-center mt-10">
            <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          error && (
            <p className="text-center text-red-400 font-semibold mb-6">
              {error}
            </p>
          )
        )}

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 max-w-7xl mx-auto">
          {movies.map((m) => (
            <div
              key={m.imdbID}
              onClick={() => details(m.imdbID)}
              className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-indigo-500/30"
            >
              <img
                src={
                  m.Poster !== "N/A"
                    ? m.Poster
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={m.Title}
                className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-75"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition">
                <h3 className="text-sm sm:text-lg font-bold text-center">
                  {m.Title}
                </h3>
                <p className="text-indigo-400 text-center text-xs">
                  {m.Year}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {page * 10 < total && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="px-10 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold transition-all transform hover:scale-105 shadow-xl"
            >
              Load More
            </button>
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <div className="relative max-w-3xl w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 rounded-3xl p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setModal(null);
                  setTrailer(null);
                }}
                className="absolute top-4 right-4 text-3xl text-gray-300 hover:text-white"
              >
                &times;
              </button>

              <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                {modal.Title}
              </h2>

              {trailer ? (
                <iframe
                  src={trailer}
                  title="Trailer"
                  className="w-full h-72 rounded-2xl mb-6"
                  allowFullScreen
                />
              ) : (
                <p className="text-center text-gray-400 mb-6">
                  Trailer not available
                </p>
              )}

              <div className="space-y-3 text-sm sm:text-base">
                <p>
                  <span className="text-indigo-400 font-semibold">Director:</span>{" "}
                  {modal.Director}
                </p>
                <p>
                  <span className="text-indigo-400 font-semibold">Actors:</span>{" "}
                  {modal.Actors}
                </p>
                <p>
                  <span className="text-indigo-400 font-semibold">Runtime:</span>{" "}
                  {modal.Runtime}
                </p>
                <p>
                  <span className="text-indigo-400 font-semibold">
                    IMDB Rating:
                  </span>{" "}
                  ⭐ {modal.imdbRating}
                </p>
                <p>
                  <span className="text-indigo-400 font-semibold">Plot:</span>{" "}
                  {modal.Plot}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
