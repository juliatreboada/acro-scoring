import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

async function requireSuperAdmin(userId: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from('profiles').select('role').eq('auth_id', userId)
  return data?.some(p => p.role === 'super_admin') ?? false
}

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? null
  if (!token) return null
  const { data: { user } } = await getSupabaseAdmin().auth.getUser(token)
  return user?.id ?? null
}

// POST /api/admin/profiles
// Add a new profile to an existing auth user.
// Body:
//   { email, role: 'judge', full_name?, licence?, phone? }
//   { email, role: 'admin', full_name?, phone? }
//   { email, role: 'club', club_id: string }           ← assign to existing club
//   { email, role: 'club', club_name, contact_name?, phone? } ← create new club
export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin()
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireSuperAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json() as {
    email: string
    role: 'admin' | 'judge' | 'club'
    full_name?: string
    licence?: string
    phone?: string
    club_id?: string       // use existing club
    club_name?: string     // create new club
    contact_name?: string
  }
  const { email, role } = body
  if (!email || !role) return NextResponse.json({ error: 'email and role required' }, { status: 400 })

  // Find existing profiles for this email to get auth_id
  const { data: existing } = await db
    .from('profiles').select('id, auth_id, role').eq('email', email)
  if (!existing?.length) {
    return NextResponse.json(
      { error: 'No user found with that email. Use "Invite new user" to create one.' },
      { status: 404 }
    )
  }

  const auth_id = existing[0].auth_id

  if (existing.some(p => p.role === role)) {
    return NextResponse.json({ error: 'User already has this role' }, { status: 409 })
  }

  const newProfileId = crypto.randomUUID()

  if (role === 'judge') {
    const { error: profErr } = await db.from('profiles').insert({
      id: newProfileId, auth_id, email, role,
    })
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })

    const { error } = await db.from('judges').insert({
      id: newProfileId,
      full_name: body.full_name ?? '',
      licence:   body.licence   ?? null,
      phone:     body.phone     ?? null,
    })
    if (error) {
      await db.from('profiles').delete().eq('id', newProfileId)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

  } else if (role === 'admin') {
    const { error: profErr } = await db.from('profiles').insert({
      id: newProfileId, auth_id, email, role,
    })
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })

    const { error } = await db.from('admins').insert({
      id: newProfileId,
      full_name: body.full_name ?? '',
      phone:     body.phone     ?? null,
    })
    if (error) {
      await db.from('profiles').delete().eq('id', newProfileId)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

  } else if (role === 'club') {
    let clubId = body.club_id ?? null

    // Create a new club if no existing club_id provided
    if (!clubId) {
      if (!body.club_name) return NextResponse.json({ error: 'club_id or club_name required' }, { status: 400 })
      const newClubId = crypto.randomUUID()
      const { error } = await db.from('clubs').insert({
        id:           newClubId,
        club_name:    body.club_name,
        contact_name: body.contact_name ?? null,
        phone:        body.phone        ?? null,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      clubId = newClubId
    }

    const { error: profErr } = await db.from('profiles').insert({
      id: newProfileId, auth_id, email, role, club_id: clubId,
    })
    if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })
  }

  return NextResponse.json({ id: newProfileId })
}

// PATCH /api/admin/profiles
// Edit entity data for a profile.
// Body: { profileId, full_name?, phone?, licence?, club_name?, contact_name? }
export async function PATCH(req: NextRequest) {
  const db = getSupabaseAdmin()
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireSuperAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { profileId, full_name, phone, licence, club_name, contact_name } = await req.json() as {
    profileId: string
    full_name?: string
    phone?: string
    licence?: string
    club_name?: string
    contact_name?: string
  }
  if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })

  const { data: profile } = await db
    .from('profiles').select('role, club_id').eq('id', profileId).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (profile.role === 'judge') {
    const u: Record<string, unknown> = {}
    if (full_name !== undefined) u.full_name = full_name
    if (phone     !== undefined) u.phone     = phone || null
    if (licence   !== undefined) u.licence   = licence || null
    if (Object.keys(u).length) await db.from('judges').update(u as any).eq('id', profileId)
  } else if (profile.role === 'admin') {
    const u: Record<string, unknown> = {}
    if (full_name !== undefined) u.full_name = full_name
    if (phone     !== undefined) u.phone     = phone || null
    if (Object.keys(u).length) await db.from('admins').update(u as any).eq('id', profileId)
  } else if (profile.role === 'club' && profile.club_id) {
    const u: Record<string, unknown> = {}
    if (club_name    !== undefined) u.club_name    = club_name
    if (contact_name !== undefined) u.contact_name = contact_name || null
    if (phone        !== undefined) u.phone        = phone || null
    if (Object.keys(u).length) await db.from('clubs').update(u as any).eq('id', profile.club_id)
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/profiles?profileId=xxx
// Remove a profile (and its entity row for judge/admin).
// For club: only removes the profile — the club entity is kept (other users may share it).
export async function DELETE(req: NextRequest) {
  const db = getSupabaseAdmin()
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireSuperAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const profileId = new URL(req.url).searchParams.get('profileId')
  if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })

  const { data: profile } = await db
    .from('profiles').select('role').eq('id', profileId).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // For judge/admin: delete entity first (FK: entity.id → profiles.id)
  if (profile.role === 'judge') {
    await db.from('judges').delete().eq('id', profileId)
  } else if (profile.role === 'admin') {
    await db.from('admins').delete().eq('id', profileId)
  }
  // For club: keep the clubs entity — other profiles may still reference it

  await db.from('profiles').delete().eq('id', profileId)
  return NextResponse.json({ ok: true })
}
