import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Server-only — never import this in client components or pages
// Uses the service role key which bypasses RLS
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
