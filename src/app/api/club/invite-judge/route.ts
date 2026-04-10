import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// POST /api/club/invite-judge
// Body: { email, full_name, phone?, licence? }
// Protected: caller must be an authenticated club.

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'club') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    email: string
    full_name: string
    phone?: string
    licence?: string
  }

  if (!body.email || !body.full_name) {
    return NextResponse.json({ error: 'Missing email or full_name' }, { status: 400 })
  }

  const metadata: Record<string, string> = { role: 'judge', full_name: body.full_name }
  if (body.phone)   metadata.phone   = body.phone
  if (body.licence) metadata.licence = body.licence

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(body.email, {
    data: metadata,
    redirectTo: `${req.nextUrl.origin}/auth/set-password`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.user.id })
}
