import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// POST /api/admin/users
// Body: { ids: string[] }
// Returns: AdminUser[] — id, full_name, email
// Protected: caller must be super_admin or admin.
// In the new schema profiles.email is stored directly, no auth.admin lookup needed.

export async function POST(req: NextRequest) {
  try {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profiles } = await supabase
    .from('profiles').select('role').eq('auth_id', user.id)
  if (!profiles?.some(p => ['super_admin', 'admin'].includes(p.role))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { ids } = await req.json() as { ids: string[] }
  if (!ids?.length) return NextResponse.json([])

  const [profilesRes, adminsRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('id, email').in('id', ids),
    supabaseAdmin.from('admins').select('id, full_name').in('id', ids),
  ])

  const nameMap = Object.fromEntries(
    (adminsRes.data ?? []).map(a => [a.id, a.full_name])
  )

  const result = (profilesRes.data ?? []).map(p => ({
    id:        p.id,
    full_name: nameMap[p.id] ?? '',
    email:     p.email ?? '',
  }))

  return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unexpected server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
