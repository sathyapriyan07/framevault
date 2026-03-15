import { supabase } from '../services/supabaseClient'

export const getPublicUrl = (bucket, filePath) => {
  if (!bucket || !filePath) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data?.publicUrl || null
}

