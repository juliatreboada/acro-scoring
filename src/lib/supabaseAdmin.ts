import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Server-only — never import this in client components or pages
// Uses the service role key which bypasses RLS
const _url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const _key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin: ReturnType<typeof createClient<Database>> = (_url && _key)
  ? createClient<Database>(_url, _key)
  : (null as any)
