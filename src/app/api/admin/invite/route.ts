import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// POST /api/admin/invite
// Body (one of):
//   { role: 'admin',       email, full_name, club_name?, phone? }
//   { role: 'judge',       email, full_name, licence?, phone? }
//   { role: 'club',        email, club_name, contact_name?, phone? }
//
// Protected: caller must be an authenticated super_admin.
// The handle_new_user trigger auto-creates the entity row from metadata.

export async function POST(req: NextRequest) {
  // verify caller is super_admin
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
  if (!profiles?.some(p => p.role === 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    role: 'admin' | 'judge' | 'club'
    email: string
    full_name?: string
    club_name?: string
    club_id?: string      // existing club — skip trigger, create profile manually
    contact_name?: string
    licence?: string
    phone?: string
  }

  const { role, email } = body
  if (!role || !email) return NextResponse.json({ error: 'Missing role or email' }, { status: 400 })

  // ── existing club: invite without metadata so the trigger doesn't create a new club,
  //    then create the profile row manually pointing to the existing club.
  if (role === 'club' && body.club_id) {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${req.nextUrl.origin}/auth/set-password`,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id:      crypto.randomUUID(),
      auth_id: data.user.id,
      email,
      role:    'club',
      club_id: body.club_id,
    })
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    return NextResponse.json({ id: data.user.id })
  }

  // ── new entity: pass metadata so the trigger creates the entity row
  const metadata: Record<string, string> = { role }
  if (body.full_name)    metadata.full_name    = body.full_name
  if (body.club_name)    metadata.club_name    = body.club_name
  if (body.contact_name) metadata.contact_name = body.contact_name
  if (body.licence)      metadata.licence      = body.licence
  if (body.phone)        metadata.phone        = body.phone

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: metadata,
    redirectTo: `${req.nextUrl.origin}/auth/set-password`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.user.id })
}
