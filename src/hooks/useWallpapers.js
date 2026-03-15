import { useEffect, useState } from 'react'
import { mediaService } from '../services/mediaService'
import { mediaAssetsService } from '../services/mediaAssetsService'
import { getPublicUrl } from '../utils/storageUrl'

export const useWallpapers = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [{ data: storageItems }, { data: legacyItems }] = await Promise.all([
        mediaAssetsService.getAllByType('wallpaper', 500),
        mediaService.getAll('wallpapers')
      ])

      const normalizedStorage = (storageItems || [])
        .map((asset) => {
          const url = getPublicUrl('media', asset.url || asset.file_path)
          if (!url) return null
          return {
            id: asset.id,
            movie_id: asset.movie_id,
            image_url: url,
            download_url: url,
            resolution: null,
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
