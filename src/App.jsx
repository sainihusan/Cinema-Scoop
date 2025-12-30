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
      setError("Enter movie title");
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
      setError("Network error");
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
          `https://www.youtube.com/embed/${data.items[0].id.videoId}`
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
      const url = `https://www.omdbapi.com/?apikey=${
        import.meta.env.VITE_CINEMAHUNT_API_KEY
      }&i=${id}&plot=full`;

      const res = await fetch(url);
      const data = await res.json();

      setModal(data);
      fetchTrailer(data.Title);
    } catch {
      setError("Failed to load details");
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
    <div className="min-h-screen bg-[#0c0c0c] text-gray-100 px-4 pb-12">
      {/* Header */}
      <header className="max-w-7xl mx-auto py-8 flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">
          🎬 Cinema Scoop
        </h1>
        <p className="text-gray-400 text-sm">
          Explore movies & series with interactive previews
        </p>
      </header>

      {/* Search Toolbar */}
      <div className="max-w-7xl mx-auto bg-[#141414] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Search title"
          className="flex-1 bg-black px-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-indigo-500"
        />

        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
          className="w-full md:w-28 bg-black px-4 py-3 rounded-lg border border-white/10"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full md:w-36 bg-black px-4 py-3 rounded-lg border border-white/10"
        >
          <option value="">All</option>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
          <option value="episode">Episode</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-indigo-600 hover:bg-indigo-500 transition px-8 py-3 rounded-lg font-semibold"
        >
          Search
        </button>
      </div>

      {/* Status */}
      {error === "loading..." ? (
        <div className="flex justify-center mt-10">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        error && (
          <p className="text-center text-red-400 mt-8 font-medium">
            {error}
          </p>
        )
      )}

      {/* Movie Grid */}
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((m) => (
          <div
            key={m.imdbID}
            onClick={() => details(m.imdbID)}
            className="group cursor-pointer rounded-xl overflow-hidden bg-[#141414] border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            {/* Poster */}
            <div className="relative">
              <img
                src={
                  m.Poster !== "N/A"
                    ? m.Poster
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={m.Title}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Type Badge */}
              <span className="absolute top-2 right-2 bg-black/80 text-xs px-2 py-1 rounded">
                {m.Type}
              </span>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                <p className="text-sm font-semibold">
                  View Details →
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-1">
                {m.Title}
              </h3>
              <p className="text-gray-400 text-xs">{m.Year}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {page * 10 < total && (
        <div className="text-center mt-12">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 bg-[#1f1f1f] border border-white/10 rounded-lg hover:bg-[#262626] transition"
          >
            Load More
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] max-w-3xl w-full rounded-xl p-6 relative border border-white/10">
            <button
              onClick={() => {
                setModal(null);
                setTrailer(null);
              }}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-white"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4">{modal.Title}</h2>

            {trailer && (
              <iframe
                src={trailer}
                title="Trailer"
                className="w-full h-72 rounded-lg mb-4"
                allowFullScreen
              />
            )}

            <p className="text-gray-300 text-sm leading-relaxed">
              {modal.Plot}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
              <p><b>Director:</b> {modal.Director}</p>
              <p><b>Actors:</b> {modal.Actors}</p>
              <p><b>Runtime:</b> {modal.Runtime}</p>
              <p><b>IMDB:</b> ⭐ {modal.imdbRating}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
