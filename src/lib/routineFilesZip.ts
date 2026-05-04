import { zipSync } from 'fflate'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import type { Section, Panel, Session, SessionOrder, CompetitionEntry, Team, Club } from '@/components/admin/types'
import { orderedTimelinePerformances } from '@/lib/timelinePerformances'

function slugify(s: string, maxLen = 48): string {
  const base = s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return (base || 'x').slice(0, maxLen)
}

function extFromUrl(url: string, fallback: '.pdf' | '.mp3'): string {
  try {
    const u = new URL(url)
    const path = u.pathname
    const dot = path.lastIndexOf('.')
    if (dot !== -1 && dot < path.length - 1) {
      const ext = path.slice(dot).toLowerCase()
      if (/^\.[a-z0-9]{1,8}$/.test(ext)) return ext
    }
  } catch {
    /* ignore */
  }
  return fallback
}

function sectionDirName(section: Section): string {
  const num = String(section.section_number).padStart(2, '0')
  const label = section.label?.trim()
  if (label) return `section-${num}-${slugify(label, 32)}`
  return `section-${num}`
}

export type RoutineFilesZipResult =
  | {
      ok: true
      included: number
      missingInDb: number
      fetchFailed: number
    }
  | { ok: false; error: string }

export async function buildAndDownloadRoutineFilesZip(params: {
  kind: 'ts' | 'music'
  competitionId: string
  /** Used for default download filename only */
  competitionName?: string | null
  sections: Section[]
  panels: Panel[]
  sessions: Session[]
  sessionOrders: SessionOrder[]
  entries: CompetitionEntry[]
  globalTeams: Team[]
  clubs: Club[]
  supabase: SupabaseClient<Database>
}): Promise<RoutineFilesZipResult> {
  const {
    kind,
    competitionId,
    competitionName,
    sections,
    panels,
    sessions,
    sessionOrders,
    entries,
    globalTeams,
    clubs,
    supabase,
  } = params

  const sortedPanels = [...panels].sort((a, b) => a.panel_number - b.panel_number)
  const sortedSections = [...sections].sort((a, b) => a.section_number - b.section_number)

  const { data: musicRows, error: musicErr } = await supabase
    .from('routine_music')
    .select('team_id, routine_type, ts_path, music_path')
    .eq('competition_id', competitionId)

  if (musicErr) {
    return { ok: false, error: musicErr.message }
  }

  type Row = { team_id: string; routine_type: string; ts_path: string | null; music_path: string | null }
  const urlByKey = new Map<string, string | null>()
  for (const row of (musicRows ?? []) as Row[]) {
    const key = `${row.team_id}|${row.routine_type}`
    const url = kind === 'ts' ? row.ts_path : row.music_path
    urlByKey.set(key, url ?? null)
  }

  const teamById = Object.fromEntries(globalTeams.map((t) => [t.id, t]))
  const clubById = Object.fromEntries(clubs.map((c) => [c.id, c]))
  const dorsalByTeam = Object.fromEntries(entries.map((e) => [e.team_id, e.dorsal]))

  const files: Record<string, Uint8Array> = {}
  let included = 0
  let missingInDb = 0
  let fetchFailed = 0
  const usedNames = new Set<string>()

  for (const section of sortedSections) {
    const sectionSessions = sessions.filter((s) => s.section_id === section.id)
    const slots = orderedTimelinePerformances(
      section,
      sortedPanels,
      sectionSessions,
      sessionOrders,
      entries,
      globalTeams,
    )
    const dir = sectionDirName(section)
    let seq = 0

    for (const slot of slots) {
      seq += 1
      const key = `${slot.team_id}|${slot.routine_type}`
      const url = urlByKey.get(key)
      if (!url?.trim()) {
        missingInDb += 1
        continue
      }
      const team = teamById[slot.team_id]
      const club = team ? clubById[team.club_id] : undefined
      const dorsal = dorsalByTeam[slot.team_id]
      const clubSlug = slugify(club?.club_name ?? 'club', 24)
      const fallbackExt = kind === 'ts' ? '.pdf' : '.mp3'
      const ext = extFromUrl(url, fallbackExt)
      const prefix = `${String(seq).padStart(3, '0')}-d${dorsal ?? '0'}-${slot.routine_type}-${clubSlug}`
      let arcPath = `${dir}/${prefix}${ext}`
      let n = 1
      while (usedNames.has(arcPath)) {
        arcPath = `${dir}/${prefix}-${n}${ext}`
        n += 1
      }
      usedNames.add(arcPath)

      try {
        const res = await fetch(url)
        if (!res.ok) {
          fetchFailed += 1
          continue
        }
        const buf = await res.arrayBuffer()
        files[arcPath] = new Uint8Array(buf)
        included += 1
      } catch {
        fetchFailed += 1
      }
    }
  }

  if (included === 0) {
    return {
      ok: false,
      error:
        missingInDb > 0 && fetchFailed === 0
          ? 'No files found in database for this order.'
          : 'Could not include any files (check uploads and network).',
    }
  }

  try {
    const zipped = zipSync(files, { level: 6 })
    const blob = new Blob([new Uint8Array(zipped)], { type: 'application/zip' })
    const slug = slugify(competitionName?.trim() || 'competition', 40)
    const label = kind === 'ts' ? 'TS' : 'music'
    const filename = `${slug}-${label}-${new Date().toISOString().slice(0, 10)}.zip`
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(href)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'ZIP failed'
    return { ok: false, error: msg }
  }

  return { ok: true, included, missingInDb, fetchFailed }
}
