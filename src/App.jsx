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

    const movie = async (p = 1) => {
        if (!title.trim()) {
            setError("Enter Movie Title");
            return;
        }
        setError("loading...");
        try {
            const url = `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_CINEMAHUNT_API_KEY}&s=${title}&page=${p}${year ? `&y=${year}` : ""}${type ? `&type=${type}` : ""}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.Response === "False") {
                setError(data.Error);
                return;
            }
            setMovies(p === 1 ? data.Search : [...movies, ...data.Search]);
            setTotal(parseInt(data.totalResults));
            setError("");
        } catch {
            setError("Network Error");
        }
    };

    const details = async (id) => {
        try {
            const detailUrl = `https://www.omdbapi.com/?apikey=${import.meta.env.VITE_CINEMAHUNT_API_KEY}&i=${id}&plot=full`;
            const detailRes = await fetch(detailUrl);
            const details = await detailRes.json();
            setModal(details);
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

    const renderMovies = () =>
        movies.map((m) => (
            <div
                key={m.imdbID}
                onClick={() => details(m.imdbID)}
                className="relative group overflow-hidden rounded-2xl cursor-pointer shadow-xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
            >
                <img
                    src={m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/300x450?text=No+Image"}
                    alt={m.Title}
                    className="w-full h-64 sm:h-72 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h3 className="text-white font-bold text-center text-sm sm:text-lg px-2 mb-1 drop-shadow-lg">
                        {m.Title}
                    </h3>
                    <p className="text-indigo-300 text-xs sm:text-sm font-medium">{m.Year}</p>
                </div>
            </div>
        ));

    const renderModal = () => {
        if (!modal) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-4">
                <div
                    className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 
                   rounded-3xl w-full max-w-lg sm:max-w-xl md:max-w-2xl p-6 overflow-y-auto max-h-[90vh] 
                   shadow-2xl border border-white/20 animate-in slide-in-from-bottom-4 duration-700 ease-out"
                >
                    <button
                        onClick={() => setModal(null)}
                        className="absolute top-4 right-4 text-2xl text-gray-300 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer"
                    >
                        &times;
                    </button>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-indigo-300 mb-6 drop-shadow-lg">
                        {modal.Title}
                    </h2>
                    <div className="flex justify-center items-center mb-6">
                        <img
                            src={
                                modal.Poster !== "N/A"
                                    ? modal.Poster
                                    : "https://via.placeholder.com/200x350?text=No+Image"
                            }
                            alt={modal.Title}
                            className="max-h-64 sm:max-h-80 w-auto object-contain rounded-2xl shadow-xl border border-white/10"
                        />
                    </div>
                    <div className="text-slate-200 space-y-4 text-sm sm:text-base leading-relaxed">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <p>
                                <span className="text-indigo-300 font-semibold">Director:</span> {modal.Director}
                            </p>
                            <p>
                                <span className="text-indigo-300 font-semibold">Actors:</span> {modal.Actors}
                            </p>
                            <p>
                                <span className="text-indigo-300 font-semibold">Runtime:</span> {modal.Runtime}
                            </p>
                            <p>
                                <span className="text-indigo-300 font-semibold">IMDB Rating:</span> ⭐ {modal.imdbRating}
                            </p>
                        </div>
                        <p className="mt-4">
                            <span className="text-indigo-300 font-semibold">Plot:</span> {modal.Plot}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-slate-100 p-4 sm:p-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-center font-extrabold mb-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg tracking-wide">
                🎥 Cinema Scoop
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-center bg-white/10 backdrop-blur-lg p-6 rounded-3xl shadow-2xl max-w-5xl mx-auto mb-8 border border-white/10">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Search for a movie..."
                    className="flex-1 border border-white/20 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-400 outline-none bg-slate-800/70 placeholder-gray-400 transition-all duration-300"
                />
                <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Year"
                    className="w-full sm:w-32 border border-white/20 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-400 outline-none bg-slate-800/70 placeholder-gray-400 transition-all duration-300"
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full sm:w-40 border border-white/20 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none bg-slate-800/70 cursor-pointer transition-all duration-300"
                >
                    <option value="">All</option>
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                    <option value="episode">Episode</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-2xl px-8 py-4 shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                    Search
                </button>
            </div>

            {error === "loading..." ? (
                <div className="flex justify-center items-center mt-8">
                    <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin shadow-lg"></div>
                </div>
            ) : (
                error && (
                    <p className="text-center font-semibold text-red-400 mb-6 text-lg mt-8 bg-red-900/20 p-4 rounded-2xl border border-red-500/20">
                        {error}
                    </p>
                )
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4 max-w-7xl mx-auto">
                {renderMovies()}
            </div>

            {page * 10 < total && (
                <div className="text-center mt-12">
                    <button
                        onClick={handleLoadMore}
                        className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl py-3 px-10 shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                        Load More...
                    </button>
                </div>
            )}

            {renderModal()}
        </div>
    );
};

export default App;
