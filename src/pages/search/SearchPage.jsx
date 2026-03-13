import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchInput from '../../components/ui/SearchInput'
import MovieCard from '../../components/media/MovieCard'
import Row from '../../components/ui/Row'
import { movieService } from '../../services/movieService'
import { useSearchStore } from '../../store/useSearchStore'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { query, setQuery } = useSearchStore()
  const [results, setResults] = useState([])
  const q = searchParams.get('q') || ''

  useEffect(() => {
    if (q) {
      setQuery(q)
    }
  }, [q, setQuery])

  useEffect(() => {
    const load = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      const { data } = await movieService.searchMovies(query)
      setResults(data || [])
      setSearchParams({ q: query })
    }
    load()
  }, [query, setSearchParams])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mb-6">
        <SearchInput value={query} onChange={setQuery} placeholder="Search movies and series..." />
      </div>
      <p className="text-gray-400 mb-6">Found {results.length} results</p>
      <Row title="Results">
        {results.map((movie) => (
          <div key={movie.id} className="min-w-[180px]">
            <MovieCard movie={movie} />
          </div>
        ))}
      </Row>
    </div>
  )
}
