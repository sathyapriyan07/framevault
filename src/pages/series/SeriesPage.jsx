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
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 pt-4 md:py-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-heading font-bold">Series</h1>
        </div>
        
        <div className="flex gap-3 mb-6">
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
            className="flex-1 px-3 py-2 text-sm rounded-full bg-[#111111] border border-[#222222] text-white placeholder-neutral-500"
          />
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            className="flex-1 px-3 py-2 text-sm rounded-full bg-[#111111] border border-[#222222] text-white placeholder-neutral-500"
          />
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(Math.max(page - 1, 1))}
            className="px-4 py-2 rounded-full bg-[#111111] hover:bg-[#222222] text-sm"
          >
            Prev
          </button>
          <span className="text-sm text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-full bg-[#111111] hover:bg-[#222222] text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
