import { supabase } from '../services/supabaseClient'

export const getPublicUrl = (bucket, filePath) => {
  if (!bucket || !filePath) return null
  if (typeof filePath === 'string' && /^https?:\/\//i.test(filePath)) return filePath
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data?.publicUrl || null
}

