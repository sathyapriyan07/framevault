import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SearchInput from './SearchInput'
import { movieService } from '../../services/movieService'
import { personService } from '../../services/personService'
import MovieCard from '../media/MovieCard'
import PersonCard from '../media/PersonCard'

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [movieResults, setMovieResults] = useState([])
  const [personResults, setPersonResults] = useState([])

  useEffect(() => {
    const load = async () => {
      if (!query.trim()) {
        setMovieResults([])
        setPersonResults([])
        return
      }
      const [movies, persons] = await Promise.all([
        movieService.searchMovies(query),
        personService.searchPersons(query)
      ])
      setMovieResults(movies.data || [])
      setPersonResults(persons.data || [])
    }
    load()
  }, [query])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 px-4 pt-24">
      <div className="w-full max-w-4xl rounded-3xl bg-dark-card p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-heading font-semibold">Search</h2>
          <button onClick={onClose} className="rounded-full bg-white/10 px-4 py-2 text-sm">
            Close
          </button>
        </div>
        <div className="mt-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search movies, series, or persons..." />
        </div>
        <div className="mt-6 space-y-8 max-h-[60vh] overflow-y-auto pr-1">
          {movieResults.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-400 mb-3">Movies & Series</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {movieResults.slice(0, 8).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}
          {personResults.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-400 mb-3">Persons</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {personResults.slice(0, 8).map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          )}
          {!movieResults.length && !personResults.length && query && (
            <p className="text-gray-400">No results found.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
