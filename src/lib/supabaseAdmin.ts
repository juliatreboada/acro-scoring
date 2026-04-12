import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Server-only — never import this in client components or pages.
// Uses the service role key which bypasses RLS.
//
// Lazy singleton: client is created on first use, not at module load time.
// This ensures process.env is read at request time (runtime) rather than
// potentially being baked as undefined at build time by Next.js/webpack.
let _client: SupabaseClient<Database> | null = null

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_client) return _client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url: string = (process.env as any)['NEXT_PUBLIC_SUPABASE_URL'] ?? ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const key: string = (process.env as any)['SUPABASE_SERVICE_ROLE_KEY'] ?? ''
  if (!url || !key) throw new Error(`Supabase admin env vars missing (url=${!!url}, key=${!!key})`)
  _client = createClient<Database>(url, key)
  return _client
}
