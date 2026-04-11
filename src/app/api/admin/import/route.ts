import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// POST /api/admin/import
// Protected: admin or super_admin

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerProfiles } = await supabase
    .from('profiles').select('role').eq('auth_id', user.id)
  if (!callerProfiles?.some(p => ['super_admin', 'admin'].includes(p.role))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    competitionId: string
    clubId: string | null
    newClub?: { club_name: string; email: string; contact_name?: string }
    teams: {
      ageGroupId: string
      category: string
      gymnasts: { first_name: string; last_name_1: string; last_name_2: string; date_of_birth: string }[]
    }[]
  }

  const { competitionId, teams } = body
  if (!competitionId || !teams?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // ── 1. Resolve club ──────────────────────────────────────────────────────────
  let clubId = body.clubId
  let inviteSent = false

  if (!clubId) {
    const nc = body.newClub
    if (!nc?.club_name || !nc?.email) {
      return NextResponse.json({ error: 'New club requires club_name and email' }, { status: 400 })
    }

    const newClubId   = crypto.randomUUID()
    const { error: clubErr } = await supabaseAdmin
      .from('clubs')
      .insert({ id: newClubId, club_name: nc.club_name, contact_name: nc.contact_name ?? null })
    if (clubErr) return NextResponse.json({ error: `Club: ${clubErr.message}` }, { status: 500 })

    const profileId = crypto.randomUUID()
    const { error: profErr } = await supabaseAdmin
      .from('profiles')
      .insert({ id: profileId, email: nc.email, role: 'club', club_id: newClubId })
    if (profErr) return NextResponse.json({ error: `Profile: ${profErr.message}` }, { status: 500 })

    clubId = newClubId

    const origin = req.nextUrl.origin
    const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(nc.email, {
      data: { role: 'club', club_name: nc.club_name, contact_name: nc.contact_name ?? '', pending_profile_id: profileId },
      redirectTo: `${origin}/auth/set-password`,
    })
    if (!inviteErr) inviteSent = true
  }

  // ── 2. Create gymnasts + teams + entries (with deduplication) ─────────────
  let teamsCreated = 0
  const errors: string[] = []

  for (const team of teams) {
    const { ageGroupId, category, gymnasts } = team
    if (!ageGroupId || !category || !gymnasts.length) continue

    // ── Resolve gymnasts: reuse existing by name (case-insensitive) ──────────
    const resolvedGymnasts: { id: string; first_name: string; last_name_1: string }[] = []

    for (const g of gymnasts) {
      const { data: existingList } = await supabaseAdmin
        .from('gymnasts')
        .select('id, first_name, last_name_1')
        .eq('club_id', clubId!)
        .ilike('first_name', g.first_name.trim())
        .ilike('last_name_1', g.last_name_1.trim())

      const existing = existingList?.[0] ?? null

      if (existing) {
        resolvedGymnasts.push(existing)
      } else {
        const { data: inserted, error: gymErr } = await supabaseAdmin
          .from('gymnasts')
          .insert({
            club_id: clubId!,
            first_name: g.first_name.trim(),
            last_name_1: g.last_name_1.trim(),
            last_name_2: g.last_name_2?.trim() || null,
            date_of_birth: g.date_of_birth,
          })
          .select('id, first_name, last_name_1')
          .single()

        if (gymErr || !inserted) {
          errors.push(`Gymnast ${g.first_name} ${g.last_name_1}: ${gymErr?.message ?? 'insert failed'}`)
          break
        }
        resolvedGymnasts.push(inserted)
      }
    }

    if (resolvedGymnasts.length !== gymnasts.length) continue

    const gymnast_ids = resolvedGymnasts.map(g => g.id)
    const gymnast_display = resolvedGymnasts
      .map(g => [g.first_name, g.last_name_1].filter(Boolean).join(' '))
      .join(' / ')

    // ── Resolve team: reuse if same gymnasts + category + age_group ──────────
    let teamId: string | null = null

    // Find teams that contain any of these gymnasts (for this club)
    const { data: gymTeamRows } = await supabaseAdmin
      .from('team_gymnasts')
      .select('team_id')
      .in('gymnast_id', gymnast_ids)

    const candidateIds = [...new Set(gymTeamRows?.map(r => r.team_id) ?? [])]

    for (const tid of candidateIds) {
      // Check this team belongs to the right club, category, age_group
      const { data: t } = await supabaseAdmin
        .from('teams')
        .select('id')
        .eq('id', tid)
        .eq('club_id', clubId!)
        .eq('category', category)
        .eq('age_group', ageGroupId)
        .maybeSingle()

      if (!t) continue

      // Check exact gymnast set matches
      const { data: tg } = await supabaseAdmin
        .from('team_gymnasts')
        .select('gymnast_id')
        .eq('team_id', tid)

      const existingIds = (tg?.map(r => r.gymnast_id) ?? []).sort()
      const expectedIds = [...gymnast_ids].sort()

      if (existingIds.length === expectedIds.length &&
          existingIds.every((id, i) => id === expectedIds[i])) {
        teamId = tid
        break
      }
    }

    if (!teamId) {
      const { data: insertedTeam, error: teamErr } = await supabaseAdmin
        .from('teams')
        .insert({ club_id: clubId!, age_group: ageGroupId, category, gymnast_display })
        .select('id')
        .single()

      if (teamErr || !insertedTeam) {
        errors.push(`Team ${gymnast_display}: ${teamErr?.message ?? 'insert failed'}`)
        continue
      }

      teamId = insertedTeam.id

      await supabaseAdmin
        .from('team_gymnasts')
        .insert(gymnast_ids.map(gid => ({ team_id: teamId!, gymnast_id: gid })))
    }

    // ── Create competition entry if not already registered ───────────────────
    const { data: existingEntry } = await supabaseAdmin
      .from('competition_entries')
      .select('id')
      .eq('competition_id', competitionId)
      .eq('team_id', teamId!)
      .maybeSingle()

    if (!existingEntry) {
      const { error: entryErr } = await supabaseAdmin
        .from('competition_entries')
        .insert({ competition_id: competitionId, team_id: teamId! })

      if (entryErr) {
        errors.push(`Entry for ${gymnast_display}: ${entryErr.message}`)
      } else {
        teamsCreated++
      }
    }
  }

  return NextResponse.json({ clubId, teamsCreated, inviteSent, errors })
}
