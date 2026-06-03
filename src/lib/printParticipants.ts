import { sortByAgeGroupAndCategory, getLevel, LEVEL_ORDER, categoryLabel, ageGroupLabel } from '@/components/admin/types'
import type { AgeGroupRule, CompetitionEntry, Team, Club, Gymnast, Coach } from '@/components/admin/types'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function openPrintWindow(title: string, css: string, headerHtml: string, bodyHtml: string, footerText: string) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #1a1a1a; }
    @page {
      size: A4 portrait;
      margin: 14mm 18mm 18mm 18mm;
      @bottom-center {
        content: counter(page);
        font-family: Arial, Helvetica, sans-serif;
        font-size: 7.5pt;
        color: #aaa;
      }
    }
    .doc-header { padding-bottom: 10px; border-bottom: 2px solid #1a1a1a; margin-bottom: 12px; display: flex; align-items: center; gap: 16px; }
    .logo { height: 56px; width: auto; object-fit: contain; flex-shrink: 0; }
    .header-text h1 { font-size: 13pt; font-weight: bold; line-height: 1.3; }
    .header-text .subtitle { font-size: 9pt; color: #555; margin-top: 2px; }
    .footer { margin-top: 14px; font-size: 7.5pt; color: #aaa; text-align: right; border-top: 1px solid #eee; padding-top: 6px; }
    .new-page { break-before: page; }
    ${css}
    @media print {
      .color-exact { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="doc-header">${headerHtml}</div>
  ${bodyHtml}
  <div class="footer">${footerText}</div>
  <script>window.addEventListener('load', function() { window.print(); });</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
}

function docHeader(competitionName: string, logoUrl: string | null): string {
  const logo = logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="" onerror="this.style.display='none'">` : ''
  return `${logo}<div class="header-text"><h1>Listado de Participantes</h1><p class="subtitle">${escapeHtml(competitionName)}</p></div>`
}

// ─── Inscripciones print ──────────────────────────────────────────────────────

export function printParticipantList({
  competitionName,
  logoUrl,
  entries,
  teams,
  clubs,
  ageGroupRules,
  showPhotoStatus = false,
}: {
  competitionName: string
  logoUrl: string | null
  entries: CompetitionEntry[]
  teams: Team[]
  clubs: Club[]
  ageGroupRules: AgeGroupRule[]
  showPhotoStatus?: boolean
}) {
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]))
  const clubMap = Object.fromEntries(clubs.map((c) => [c.id, c]))
  const agLabelMap = Object.fromEntries(ageGroupRules.map((r) => [r.id, ageGroupLabel(r)]))

  type Item = { dorsal: number | null; gymnast_display: string; club_name: string; hasPhoto: boolean }
  type Group = { age_group: string; category: string; items: Item[] }

  const groupMap = new Map<string, Group>()
  for (const entry of entries) {
    if (entry.dropped_out) continue
    const team = teamMap[entry.team_id]
    if (!team) continue
    const club = clubMap[team.club_id]
    const key = `${team.age_group}||${team.category}`
    if (!groupMap.has(key)) groupMap.set(key, { age_group: team.age_group, category: team.category, items: [] })
    groupMap.get(key)!.items.push({
      dorsal: entry.dorsal,
      gymnast_display: team.gymnast_display,
      club_name: club?.club_name ?? '—',
      hasPhoto: Boolean(team.photo_url),
    })
  }

  const groups = sortByAgeGroupAndCategory([...groupMap.values()], ageGroupRules)

  type LevelGroup = { level: string; groups: Group[]; totalTeams: number }
  const levelMap = new Map<string, LevelGroup>()
  for (const group of groups) {
    if (group.items.length === 0) continue
    const level = getLevel(group.age_group, ageGroupRules)
    if (!levelMap.has(level)) levelMap.set(level, { level, groups: [], totalTeams: 0 })
    const lg = levelMap.get(level)!
    lg.groups.push(group)
    lg.totalTeams += group.items.length
  }
  const presentLevels = LEVEL_ORDER.filter((l) => levelMap.has(l))

  const gridCols = showPhotoStatus ? '34px 1fr 160px 56px' : '34px 1fr 180px'

  let bodyHtml = ''
  presentLevels.forEach((level, levelIdx) => {
    const lg = levelMap.get(level)!
    // Page break before every level except the first
    bodyHtml += `<div class="level-section${levelIdx > 0 ? ' new-page' : ''}">`
    bodyHtml += `<div class="level-header color-exact">
      <span>${escapeHtml(level)}</span>
      <span class="level-count">Total: ${lg.totalTeams} equipo${lg.totalTeams === 1 ? '' : 's'}</span>
    </div>`

    for (const group of lg.groups) {
      const agLabel = agLabelMap[group.age_group] ?? group.age_group
      const catLabel = categoryLabel(group.category, 'es')
      // Wrap category + its rows together so the header doesn't orphan
      bodyHtml += `<div class="cat-group">
        <div class="category-header color-exact">
          <span>${escapeHtml(agLabel)} · ${escapeHtml(catLabel)}</span>
          <span class="count">${group.items.length} equipo${group.items.length === 1 ? '' : 's'}</span>
        </div>
        <div class="team-list">
          ${group.items.map((item) => `
            <div class="team-row">
              <span class="dorsal">${item.dorsal != null ? `#${item.dorsal}` : ''}</span>
              <span class="team-name">${escapeHtml(item.gymnast_display)}</span>
              <span class="club-name">${escapeHtml(item.club_name)}</span>
              ${showPhotoStatus ? `<span class="photo-badge color-exact ${item.hasPhoto ? 'photo-ok' : 'photo-missing'}">${item.hasPhoto ? '✓ foto' : '✗ foto'}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>`
    }

    bodyHtml += `</div>`
  })

  const totalActive = entries.filter((e) => !e.dropped_out).length
  const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  const css = `
    .level-section { margin-top: 12px; }
    .level-header {
      background: #1a1a1a; color: #fff; padding: 5px 10px;
      font-size: 8.5pt; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase;
      display: flex; justify-content: space-between; align-items: center;
      break-after: avoid;
    }
    .level-count { font-weight: normal; font-size: 8pt; letter-spacing: 0; text-transform: none; opacity: 0.85; }
    .cat-group { break-inside: avoid; }
    .category-header {
      background: #f4f4f4; padding: 4px 10px; font-size: 8.5pt; font-weight: 600;
      border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;
      break-after: avoid;
    }
    .count { font-weight: normal; color: #888; font-size: 8pt; }
    .team-row {
      display: grid; grid-template-columns: ${gridCols}; gap: 8px;
      padding: 3.5px 10px; border-bottom: 1px solid #efefef; align-items: center;
    }
    .team-row:nth-child(even) { background: #fafafa; }
    .dorsal { font-weight: 700; font-size: 7.5pt; text-align: center; color: #444; }
    .team-name { font-size: 9pt; font-weight: 600; }
    .club-name { font-size: 8pt; color: #777; text-align: right; }
    .photo-badge { font-size: 7pt; font-weight: 700; text-align: center; padding: 1px 3px; border-radius: 3px; }
    .photo-ok { color: #166534; background: #dcfce7; }
    .photo-missing { color: #991b1b; background: #fee2e2; }
  `

  openPrintWindow(
    `Listado de Participantes – ${competitionName}`,
    css,
    docHeader(competitionName, logoUrl),
    bodyHtml,
    `${totalActive} equipo${totalActive === 1 ? '' : 's'} · Generado el ${date}`,
  )
}

// ─── Licencias print ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function badges(hasPhoto: boolean, hasLicencia: boolean): string {
  const photo = `<span class="badge color-exact ${hasPhoto ? 'ok' : 'missing'}">${hasPhoto ? '✓' : '✗'} foto</span>`
  const lic   = `<span class="badge color-exact ${hasLicencia ? 'ok' : 'missing'}">${hasLicencia ? '✓' : '✗'} lic</span>`
  return `<span class="badges">${photo}${lic}</span>`
}

export function printLicencias({
  competitionName,
  logoUrl,
  entries,
  teams,
  clubs,
  coaches,
  gymnasts,
  ageGroupRules,
}: {
  competitionName: string
  logoUrl: string | null
  entries: CompetitionEntry[]
  teams: Team[]
  clubs: Club[]
  coaches: Coach[]
  gymnasts: Gymnast[]
  ageGroupRules: AgeGroupRule[]
}) {
  const teamMap    = Object.fromEntries(teams.map((t) => [t.id, t]))
  const clubMap    = Object.fromEntries(clubs.map((c) => [c.id, c]))
  const gymnastMap = Object.fromEntries(gymnasts.map((g) => [g.id, g]))

  const clubIds = [...new Set([
    ...entries.filter((e) => !e.dropped_out).map((e) => teamMap[e.team_id]?.club_id).filter(Boolean) as string[],
    ...coaches.map((c) => c.club_id),
  ])].sort((a, b) => (clubMap[a]?.club_name ?? '').localeCompare(clubMap[b]?.club_name ?? '', 'es'))

  let bodyHtml = ''

  clubIds.forEach((cid, clubIdx) => {
    const club = clubMap[cid]
    const clubCoaches = coaches.filter((c) => c.club_id === cid)

    const clubEntries = entries.filter((e) => !e.dropped_out && teamMap[e.team_id]?.club_id === cid)
    const sortableEntries = clubEntries.map((e) => ({
      ...e,
      age_group: teamMap[e.team_id]?.age_group ?? '',
      category:  teamMap[e.team_id]?.category  ?? '',
    }))
    const sortedEntries = sortByAgeGroupAndCategory(sortableEntries, ageGroupRules)

    const allGymnasts = sortedEntries.flatMap((e) =>
      (teamMap[e.team_id]?.gymnast_ids ?? []).map((gid) => gymnastMap[gid]).filter(Boolean) as Gymnast[]
    )
    const totalGymnasts = allGymnasts.length

    // Page break before every club except the first
    bodyHtml += `<div class="club-block${clubIdx > 0 ? ' new-page' : ''}">`
    bodyHtml += `<div class="club-header color-exact">${escapeHtml(club?.club_name ?? cid)}</div>`

    if (clubCoaches.length > 0) {
      bodyHtml += `<div class="section-label color-exact">Entrenadores (${clubCoaches.length})</div>`
      bodyHtml += clubCoaches.map((c, i) => `
        <div class="person-row ${i % 2 === 0 ? '' : 'alt'}">
          <span class="person-name">${escapeHtml(c.full_name)}</span>
          ${c.licence ? `<span class="licence-num">${escapeHtml(c.licence)}</span>` : '<span class="licence-num empty">—</span>'}
          ${badges(Boolean(c.photo_url), Boolean(c.licencia_url))}
        </div>`).join('')
    }

    if (sortedEntries.length > 0) {
      bodyHtml += `<div class="section-label color-exact">Equipos (${sortedEntries.length} equipo${sortedEntries.length === 1 ? '' : 's'} · ${totalGymnasts} gimnasta${totalGymnasts === 1 ? '' : 's'})</div>`
      for (const entry of sortedEntries) {
        const team = teamMap[entry.team_id]
        if (!team) continue
        const catLabel = categoryLabel(team.category, 'es')
        const entryGymnasts = (team.gymnast_ids ?? []).map((gid) => gymnastMap[gid]).filter(Boolean) as Gymnast[]
        // Wrap team label + gymnast rows so the header doesn't orphan
        bodyHtml += `<div class="team-group">
          <div class="team-label">${escapeHtml(team.gymnast_display)} · <span class="cat">${escapeHtml(catLabel)}</span></div>
          ${entryGymnasts.map((g, i) => {
            const name = [g.first_name, g.last_name_1, g.last_name_2].filter(Boolean).join(' ')
            return `<div class="person-row gymnast-row ${i % 2 === 0 ? '' : 'alt'}">
              <span class="person-name">${escapeHtml(name)}</span>
              <span class="dob">${g.date_of_birth ? formatDate(g.date_of_birth) : '—'}</span>
              ${badges(Boolean(g.photo_url), Boolean(g.licencia_url))}
            </div>`
          }).join('')}
        </div>`
      }
    }

    bodyHtml += `</div>`
  })

  const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const totalTeams = entries.filter((e) => !e.dropped_out).length
  const totalGymnastsAll = [...new Set(entries.filter((e) => !e.dropped_out).flatMap((e) => teamMap[e.team_id]?.gymnast_ids ?? []))].length

  const css = `
    .club-block { margin-top: 14px; border: 1px solid #ccc; border-radius: 3px; overflow: hidden; }
    .club-header { background: #1a1a1a; color: #fff; padding: 6px 10px; font-size: 10pt; font-weight: bold; letter-spacing: 0.03em; break-after: avoid; }
    .section-label { background: #e8e8e8; padding: 3px 10px; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #555; border-top: 1px solid #ccc; break-after: avoid; }
    .team-group { break-inside: avoid; }
    .team-label { background: #f8f8f8; padding: 4px 10px; font-size: 8.5pt; font-weight: 600; border-top: 1px solid #e5e5e5; break-after: avoid; }
    .team-label .cat { font-weight: normal; color: #666; }
    .person-row { display: grid; grid-template-columns: 1fr 90px auto; gap: 8px; padding: 3.5px 10px; border-top: 1px solid #f0f0f0; align-items: center; }
    .gymnast-row { grid-template-columns: 1fr 72px auto; padding-left: 20px; }
    .person-row.alt { background: #fafafa; }
    .person-name { font-size: 8.5pt; }
    .dob { font-size: 7.5pt; color: #888; text-align: right; }
    .licence-num { font-size: 7.5pt; color: #666; text-align: right; font-style: italic; }
    .licence-num.empty { color: #ccc; }
    .badges { display: flex; gap: 4px; justify-content: flex-end; }
    .badge { font-size: 6.5pt; font-weight: 700; padding: 1px 4px; border-radius: 3px; white-space: nowrap; }
    .badge.ok      { color: #166534; background: #dcfce7; }
    .badge.missing { color: #991b1b; background: #fee2e2; }
  `

  openPrintWindow(
    `Listado de Participantes – ${competitionName}`,
    css,
    docHeader(competitionName, logoUrl),
    bodyHtml,
    `${totalTeams} equipo${totalTeams === 1 ? '' : 's'} · ${totalGymnastsAll} gimnasta${totalGymnastsAll === 1 ? '' : 's'} · Generado el ${date}`,
  )
}
