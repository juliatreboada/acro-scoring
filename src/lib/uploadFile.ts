import { createClient } from '@/lib/supabase'

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
