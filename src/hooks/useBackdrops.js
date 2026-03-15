import { useEffect, useState } from 'react'
import { mediaService } from '../services/mediaService'
import { mediaAssetsService } from '../services/mediaAssetsService'
import { getPublicUrl } from '../utils/storageUrl'

export const useBackdrops = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [{ data: storageItems }, { data: legacyItems }] = await Promise.all([
        mediaAssetsService.getAllByType('backdrop', 500),
        mediaService.getAll('backdrops')
      ])

      const normalizedStorage = (storageItems || [])
        .map((asset) => {
          const url = getPublicUrl('media', asset.file_path)
          if (!url) return null
          return {
            id: asset.id,
            movie_id: asset.movie_id,
            backdrop_url: url,
            download_url: url,
            created_at: asset.created_at
          }
        })
        .filter(Boolean)

      setData([...(normalizedStorage || []), ...(legacyItems || [])])
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading }
}
