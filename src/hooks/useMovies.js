import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { movieService } from '../services/movieService'

export const useMovies = (type = 'movie', pageSize = 20) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: items } = await movieService.getMoviesPaged(type, page, pageSize)
      setData(items || [])
      setLoading(false)
    }
    load()
  }, [type, page, pageSize])

  const setPage = (nextPage) => {
    setSearchParams({ page: nextPage })
  }

  return { data, loading, page, setPage }
}
