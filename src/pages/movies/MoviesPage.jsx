import { useMemo } from 'react'
import { useMovies } from '../../hooks/useMovies'
import MovieCard from '../../components/media/MovieCard'
import Loader from '../../components/ui/Loader'
import Row from '../../components/ui/Row'
import { useFilterStore } from '../../store/useFilterStore'

export default function MoviesPage() {
  const { data, loading, page, setPage } = useMovies('movie', 24)
  const { genre, year, setGenre, setYear } = useFilterStore()

  const filtered = useMemo(() => {
    return data.filter((movie) => {
      const matchesGenre = genre ? movie.genres?.includes(genre) : true
      const matchesYear = year ? String(movie.release_year) === String(year) : true
      return matchesGenre && matchesYear
    })
  }, [data, genre, year])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-heading font-bold">Movies</h1>
        <div className="flex flex-wrap gap-3">
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
            className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm"
          />
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <Row title="All Movies">
          {filtered.map((movie) => (
            <div key={movie.id} className="min-w-[180px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </Row>
      )}

      <div className="mt-10 flex justify-center gap-3">
        <button
          onClick={() => setPage(Math.max(page - 1, 1))}
          className="rounded-full bg-white/10 px-4 py-2 text-sm"
        >
          Prev
        </button>
        <span className="text-sm text-gray-400">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="rounded-full bg-white/10 px-4 py-2 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  )
}
