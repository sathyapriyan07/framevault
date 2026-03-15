import { useEffect, useState } from 'react'
import { mediaService } from '../services/mediaService'
import { mediaAssetsService } from '../services/mediaAssetsService'
import { getPublicUrl } from '../utils/storageUrl'

export const useLogos = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [{ data: storageItems }, { data: legacyItems }] = await Promise.all([
        mediaAssetsService.getAllByType('logo', 500),
        mediaService.getAll('logos')
      ])

      const normalizedStorage = (storageItems || [])
        .map((asset) => {
          const url = getPublicUrl('media', asset.url || asset.file_path)
          if (!url) return null
          return {
            id: asset.id,
            movie_id: asset.movie_id,
            logo_url: url,
            png_download: url,
            svg_download: null,
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
