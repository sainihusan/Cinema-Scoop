import { useEffect, useState } from "react";

const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#111] border border-white/10 overflow-hidden animate-pulse">
    <div className="h-72 bg-gray-800" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
    </div>
  </div>
);

export default function App() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 🎬 HERO STATES
  const [heroTrailer, setHeroTrailer] = useState(null);
  const [heroMovie, setHeroMovie] = useState(null);

  // MODAL
  const [modal, setModal] = useState(null);

  const fetchMovies = async (p = 1) => {
    if (!title.trim()) {
      setError("Enter a movie title");
      return;
    }

    setStatus("loading");
    setError("");

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
        setStatus("idle");
        return;
      }

      setMovies(p === 1 ? data.Search : [...movies, ...data.Search]);
      setTotal(Number(data.totalResults));
      setStatus("idle");
    } catch {
      setError("Network error");
      setStatus("idle");
    }
  };

  // 🎥 FETCH TRAILER FOR HERO
  const fetchTrailer = async (movie) => {
    try {
      const yt = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
        movie.Title + " official trailer"
      )}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`;

      const res = await fetch(yt);
      const data = await res.json();

      if (data.items?.length) {
        setHeroTrailer(data.items[0].id.videoId);
        setHeroMovie(movie);
      }
    } catch {
      setHeroTrailer(null);
    }
  };

  const openMovie = async (id) => {
    const url = `https://www.omdbapi.com/?apikey=${
      import.meta.env.VITE_CINEMAHUNT_API_KEY
    }&i=${id}&plot=full`;

    const res = await fetch(url);
    const data = await res.json();

    setModal(data);
    fetchTrailer(data); // 👈 play in background
  };

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 🎬 HERO BACKGROUND TRAILER */}
      {heroTrailer && heroMovie && (
        <section className="relative h-[85vh] overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${heroTrailer}?autoplay=1&mute=1&controls=0&loop=1&playlist=${heroTrailer}&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full scale-125"
            allow="autoplay; fullscreen"
            title="Background Trailer"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Text */}
          <div className="relative z-10 max-w-7xl mx-auto h-full flex items-end px-6 pb-24">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                {heroMovie.Title}
              </h1>
              <p className="mt-2 text-lg text-gray-300">
                {heroMovie.Year}
              </p>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setModal(heroMovie)}
                  className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  View Details
                </button>

                <button
                  onClick={() => {
                    setHeroTrailer(null);
                    setHeroMovie(null);
                  }}
                  className="px-6 py-3 bg-black/60 border border-white/20 rounded-xl hover:bg-black/80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 🔍 SEARCH */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-4 shadow-2xl">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Search movies..."
            className="flex-1 bg-black/60 px-5 py-4 rounded-xl border border-white/10 focus:border-indigo-500 outline-none"
          />

          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            className="w-full md:w-28 bg-black/60 px-4 py-4 rounded-xl border border-white/10"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full md:w-36 bg-black/60 px-4 py-4 rounded-xl border border-white/10"
          >
            <option value="">All</option>
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </select>

          <button
            onClick={() => {
              setPage(1);
              fetchMovies(1);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <p className="text-center text-red-400 mt-10">{error}</p>
      )}

      {/* 🎞️ MOVIE GRID */}
      <div className="max-w-7xl mx-auto px-4 mt-24 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {status === "loading"
          ? Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : movies.map((m) => (
              <div
                key={m.imdbID}
                onClick={() => openMovie(m.imdbID)}
                className="group cursor-pointer relative rounded-2xl overflow-hidden bg-[#111] shadow-xl hover:-translate-y-3 transition duration-500"
              >
                <img
                  src={
                    m.Poster !== "N/A"
                      ? m.Poster
                      : "https://via.placeholder.com/300x450"
                  }
                  alt={m.Title}
                  className="h-72 w-full object-cover group-hover:scale-110 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute bottom-0 p-4">
                  <h3 className="font-bold text-sm line-clamp-2">
                    {m.Title}
                  </h3>
                  <span className="mt-1 inline-block text-xs px-2 py-0.5 bg-black/60 rounded">
                    {m.Year}
                  </span>
                </div>
              </div>
            ))}
      </div>

      {/* LOAD MORE */}
      {page * 10 < total && (
        <div className="text-center mt-16">
          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchMovies(next);
            }}
            className="px-10 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10"
          >
            Load More
          </button>
        </div>
      )}

      {/* 🎬 MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] max-w-3xl w-full rounded-2xl p-8 relative">
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-white"
            >
              ×
            </button>

            <h2 className="text-3xl font-extrabold mb-4">
              {modal.Title}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {modal.Plot}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
