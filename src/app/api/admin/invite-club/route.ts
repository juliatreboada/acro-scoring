import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// POST /api/admin/invite-club
// Body: { email: string, club_name?: string }
// Protected: caller must be admin or super_admin.
// The handle_new_user trigger auto-creates the club row from metadata.

export async function POST(req: NextRequest) {
  try {
    const db = getSupabaseAdmin()

    const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? null
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user }, error: authError } = await db.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profiles } = await db
      .from('profiles').select('role').eq('auth_id', user.id)
    if (!profiles?.some(p => p.role === 'admin' || p.role === 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json() as { email: string; club_name?: string }
    const { email, club_name } = body
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const proto = req.headers.get('x-forwarded-proto') ?? 'https'
    const host  = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? req.nextUrl.host
    const siteOrigin = `${proto}://${host}`

    const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
      data: {
        role: 'club',
        club_name: club_name?.trim() || email.split('@')[0],
      },
      redirectTo: `${siteOrigin}/auth/confirm`,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ id: data.user.id })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unexpected server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
