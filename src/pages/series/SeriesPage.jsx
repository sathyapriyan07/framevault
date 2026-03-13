import { useMemo } from 'react'
import { useMovies } from '../../hooks/useMovies'
import MovieCard from '../../components/media/MovieCard'
import Loader from '../../components/ui/Loader'
import Row from '../../components/ui/Row'
import { useFilterStore } from '../../store/useFilterStore'

export default function SeriesPage() {
  const { data, loading, page, setPage } = useMovies('series', 24)
  const { genre, year, setGenre, setYear } = useFilterStore()

  const filtered = useMemo(() => {
    return data.filter((movie) => {
      const matchesGenre = genre ? movie.genres?.includes(genre) : true
      const matchesYear = year ? String(movie.release_year) === String(year) : true
      return matchesGenre && matchesYear
    })
  }, [data, genre, year])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-heading font-bold">Series</h1>
        <div className="flex gap-2 md:gap-3">
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
            className="rounded-full bg-white/5 border border-white/10 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm flex-1 md:flex-none"
          />
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            className="rounded-full bg-white/5 border border-white/10 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm flex-1 md:flex-none"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <Row title="All Series">
          {filtered.map((movie) => (
            <div key={movie.id} className="min-w-[140px] md:min-w-[180px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </Row>
      )}

      <div className="mt-8 md:mt-10 flex justify-center gap-3">
        <button
          onClick={() => setPage(Math.max(page - 1, 1))}
          className="rounded-full bg-white/10 px-4 py-2 text-xs md:text-sm"
        >
          Prev
        </button>
        <span className="text-xs md:text-sm text-gray-400">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="rounded-full bg-white/10 px-4 py-2 text-xs md:text-sm"
        >
          Next
        </button>
      </div>
    </div>
  )
}
