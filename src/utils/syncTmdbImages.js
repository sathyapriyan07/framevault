import { supabase } from '../services/supabaseClient'

const TMDB_ORIGINAL_BASE_URL = 'https://image.tmdb.org/t/p/original'

const buildTmdbImageUrl = (filePath) => {
  if (!filePath) return null
  return `${TMDB_ORIGINAL_BASE_URL}${filePath}`
}

const normalizeAssets = ({ movieId, type, images }) => {
  const assets = []
  for (const img of images || []) {
    const url = buildTmdbImageUrl(img?.file_path)
    if (!url) continue
    assets.push({
      movie_id: movieId,
      type,
      url,
      file_path: url,
      width: img?.width ?? null,
      height: img?.height ?? null
    })
  }
  return assets
}

const insertAssetsWithFallbacks = async (assets) => {
  if (!assets.length) return { inserted: 0, error: null }

  // Try the richest payload first (url + file_path + width/height). Some DBs may not have all columns.
  let payload = assets
  let { error } = await supabase.from('media_assets').insert(payload)
  if (!error) return { inserted: payload.length, error: null }

  // Fallback 1: drop width/height
  payload = assets.map(({ width, height, ...rest }) => rest)
  ;({ error } = await supabase.from('media_assets').insert(payload))
  if (!error) return { inserted: payload.length, error: null }

  // Fallback 2: drop url (keep file_path as url string so the app can still render)
  payload = payload.map(({ url, ...rest }) => rest)
  ;({ error } = await supabase.from('media_assets').insert(payload))
  if (!error) return { inserted: payload.length, error: null }

  // Fallback 3: file_path might not exist (schema variant). Use url only.
  payload = assets.map(({ file_path, ...rest }) => rest)
  ;({ error } = await supabase.from('media_assets').insert(payload))
  if (!error) return { inserted: payload.length, error: null }

  return { inserted: 0, error }
}

const dedupeByExistingUrls = async ({ movieId, type, candidateUrls }) => {
  const unique = Array.from(new Set((candidateUrls || []).filter(Boolean)))
  if (!unique.length) return unique

  // Prefer `url` column; if it doesn't exist, fallback to `file_path`.
  let existingPaths = []

  const { data: existingUrlRows, error: urlSelectError } = await supabase
    .from('media_assets')
    .select('url')
    .eq('movie_id', movieId)
    .eq('type', type)
    .in('url', unique)

  if (!urlSelectError) {
    existingPaths = (existingUrlRows || []).map((r) => r.url).filter(Boolean)
  } else {
    const { data: existingFilePathRows, error: filePathSelectError } = await supabase
      .from('media_assets')
      .select('file_path')
      .eq('movie_id', movieId)
      .eq('type', type)
      .in('file_path', unique)

    if (!filePathSelectError) {
      existingPaths = (existingFilePathRows || []).map((r) => r.file_path).filter(Boolean)
    }
  }

  const existingSet = new Set(existingPaths)
  return unique.filter((u) => !existingSet.has(u))
}

export const syncTmdbImages = async (tmdbId, movieId, options = {}) => {
  try {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY
    if (!apiKey) {
      return { success: false, error: 'Missing VITE_TMDB_API_KEY (add it to .env and restart dev server).' }
    }
    if (!tmdbId || !movieId) {
      return { success: false, error: 'tmdbId and movieId are required.' }
    }

    const mediaType = options.mediaType === 'tv' || options.mediaType === 'series' ? 'tv' : 'movie'
    const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/images?api_key=${apiKey}`)
    if (!res.ok) {
      return { success: false, error: `TMDB images request failed (${res.status}).` }
    }

    const data = await res.json()

    const logoAssets = normalizeAssets({ movieId, type: 'logo', images: data?.logos })
    const posterAssets = normalizeAssets({ movieId, type: 'poster', images: data?.posters })
    const backdropAssets = normalizeAssets({ movieId, type: 'backdrop', images: data?.backdrops })

    const assetGroups = [
      { type: 'logo', assets: logoAssets },
      { type: 'poster', assets: posterAssets },
      { type: 'backdrop', assets: backdropAssets }
    ]

    let inserted = 0
    let skipped = 0

    for (const group of assetGroups) {
      const urls = group.assets.map((a) => a.url).filter(Boolean)
      const remainingUrls = await dedupeByExistingUrls({ movieId, type: group.type, candidateUrls: urls })
      const remainingSet = new Set(remainingUrls)
      const toInsert = group.assets.filter((a) => remainingSet.has(a.url))

      skipped += urls.length - toInsert.length
      const result = await insertAssetsWithFallbacks(toInsert)
      if (result.error) throw result.error
      inserted += result.inserted
    }

    return { success: true, inserted, skipped, count: inserted + skipped }
  } catch (error) {
    console.error('TMDB Sync Error:', error)
    return { success: false, error: error?.message || 'TMDB Sync Error' }
  }
}

