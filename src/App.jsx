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
  const [modal, setModal] = useState(null);
  const [trailer, setTrailer] = useState(null);

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

  const fetchTrailer = async (query) => {
    try {
      const yt = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
        query + " trailer"
      )}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`;

      const res = await fetch(yt);
      const data = await res.json();

      if (data.items?.length) {
        setTrailer(
          `https://www.youtube.com/embed/${data.items[0].id.videoId}`
        );
      }
    } catch {
      setTrailer(null);
    }
  };

  const openDetails = async (id) => {
    const url = `https://www.omdbapi.com/?apikey=${
      import.meta.env.VITE_CINEMAHUNT_API_KEY
    }&i=${id}&plot=full`;

    const res = await fetch(url);
    const data = await res.json();
    setModal(data);
    fetchTrailer(data.Title);
  };

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0b] to-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            🎬 Cinema Scoop
          </h1>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Discover movies, series & trailers in a cinematic experience
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
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
            className="bg-indigo-600 hover:bg-indigo-500 transition px-8 py-4 rounded-xl font-semibold shadow-lg shadow-indigo-600/30"
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <p className="text-center text-red-400 mt-10 font-medium">
          {error}
        </p>
      )}

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-4 mt-20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {status === "loading"
          ? Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : movies.map((m) => (
              <div
                key={m.imdbID}
                onClick={() => openDetails(m.imdbID)}
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

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                <div className="absolute bottom-0 p-4">
                  <h3 className="font-bold text-sm line-clamp-2">
                    {m.Title}
                  </h3>
                  <div className="flex gap-2 mt-1 text-xs text-gray-300">
                    <span className="px-2 py-0.5 bg-black/60 rounded">
                      {m.Year}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-600/80 rounded">
                      {m.Type}
                    </span>
                  </div>
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
            className="px-10 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
          >
            Load More
          </button>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => {
                setModal(null);
                setTrailer(null);
              }}
              className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-white"
            >
              ×
            </button>

            {trailer && (
              <iframe
                src={trailer}
                title="Trailer"
                className="w-full h-80"
                allowFullScreen
              />
            )}

            <div className="p-8">
              <h2 className="text-3xl font-extrabold mb-4">
                {modal.Title}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {modal.Plot}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm text-gray-400">
                <p><b>Director:</b> {modal.Director}</p>
                <p><b>Actors:</b> {modal.Actors}</p>
                <p><b>Runtime:</b> {modal.Runtime}</p>
                <p><b>IMDb:</b> ⭐ {modal.imdbRating}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
