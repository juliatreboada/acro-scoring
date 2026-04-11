'use client'

import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import type { Lang } from '@/components/aj-scoring/types'
import type { AgeGroupRule } from '@/components/admin/types'
import { CATEGORY_LABELS } from '@/components/admin/types'

// ─── translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Import registrations',
    step1: 'File & club',
    step2: 'Review',
    clubLabel: 'Club',
    clubPlaceholder: 'Search club…',
    newClub: 'New club (not in system)',
    clubName: 'Club name',
    contactName: 'Contact name',
    inviteEmail: 'Invite email',
    ruleset: 'Ruleset',
    fileLabel: 'File (.ods, .xlsx, .csv)',
    parse: 'Parse file',
    noFile: 'Select a file first',
    noClub: 'Select or create a club first',
    noRuleset: 'Select a ruleset',
    parseError: 'Could not read file. Make sure it is a valid .ods, .xlsx or .csv.',
    noTeams: 'No teams found in the file. Check the format (first column must be TOP/BASE).',
    reviewTitle: (n: number) => `${n} team${n !== 1 ? 's' : ''} found — review and edit before confirming`,
    teamN: (n: number) => `Team ${n}`,
    ageGroup: 'Age group',
    category: 'Category',
    coach: 'Coach',
    firstName: 'First name',
    lastName1: 'Surname 1',
    lastName2: 'Surname 2',
    dob: 'Date of birth',
    pairType: 'Pair type',
    womensPair: "Women's Pair",
    mensPair: "Men's Pair",
    mixedPair: "Mixed Pair",
    selectPair: '— select pair type —',
    ageGroupUnmatched: 'Age group not matched — select manually',
    ageGroupNotInCompetition: 'Age group not in this competition — team will not be registered',
    pairTypeRequired: 'Pair type required',
    dobInvalid: 'Invalid date of birth',
    missingName: 'Missing name fields',
    ageOutOfRange: (name: string, age: number, min: number, max: number | null) =>
      `${name}: age ${age} not valid for this group (${min}–${max ?? '∞'})`,
    confirm: 'Confirm import',
    confirming: 'Importing…',
    errorsRemain: 'Fix all errors before confirming',
    back: '← Back',
    done: 'Import complete',
    doneDesc: (teams: number, invite: boolean) =>
      `${teams} team${teams !== 1 ? 's' : ''} registered.${invite ? ' Invite email sent to the new club.' : ''}`,
    inviteNote: '⚠️ New club invite requires a trigger update — see developer notes.',
    importAnother: 'Import another file',
    gymnast: (n: number) => `Gymnast ${n}`,
  },
  es: {
    title: 'Importar inscripciones',
    step1: 'Archivo y club',
    step2: 'Revisión',
    clubLabel: 'Club',
    clubPlaceholder: 'Buscar club…',
    newClub: 'Club nuevo (no registrado)',
    clubName: 'Nombre del club',
    contactName: 'Persona de contacto',
    inviteEmail: 'Email de invitación',
    ruleset: 'Tipo de competición',
    fileLabel: 'Archivo (.ods, .xlsx, .csv)',
    parse: 'Leer archivo',
    noFile: 'Selecciona un archivo primero',
    noClub: 'Selecciona o crea un club primero',
    noRuleset: 'Selecciona el tipo de competición',
    parseError: 'No se pudo leer el archivo. Comprueba que sea un .ods, .xlsx o .csv válido.',
    noTeams: 'No se encontraron equipos. Comprueba el formato (primera columna debe ser TOP/BASE).',
    reviewTitle: (n: number) => `${n} equipo${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''} — revisa y edita antes de confirmar`,
    teamN: (n: number) => `Equipo ${n}`,
    ageGroup: 'Grupo de edad',
    category: 'Categoría',
    coach: 'Entrenador/a',
    firstName: 'Nombre',
    lastName1: 'Primer apellido',
    lastName2: 'Segundo apellido',
    dob: 'Fecha de nacimiento',
    pairType: 'Tipo de pareja',
    womensPair: 'Pareja Femenina',
    mensPair: 'Pareja Masculina',
    mixedPair: 'Pareja Mixta',
    selectPair: '— seleccionar tipo —',
    ageGroupUnmatched: 'Grupo de edad no encontrado — seleccionar manualmente',
    ageGroupNotInCompetition: 'Grupo de edad no incluido en esta competición — el equipo no se inscribirá',
    pairTypeRequired: 'Debes seleccionar el tipo de pareja',
    dobInvalid: 'Fecha de nacimiento inválida',
    missingName: 'Faltan campos de nombre',
    ageOutOfRange: (name: string, age: number, min: number, max: number | null) =>
      `${name}: edad ${age} no válida para este grupo (${min}–${max ?? '∞'})`,
    confirm: 'Confirmar importación',
    confirming: 'Importando…',
    errorsRemain: 'Corrige todos los errores antes de confirmar',
    back: '← Volver',
    done: 'Importación completada',
    doneDesc: (teams: number, invite: boolean) =>
      `${teams} equipo${teams !== 1 ? 's' : ''} registrado${teams !== 1 ? 's' : ''}.${invite ? ' Email de invitación enviado al nuevo club.' : ''}`,
    inviteNote: '⚠️ La invitación a nuevo club requiere una actualización del trigger — ver notas de desarrollo.',
    importAnother: 'Importar otro archivo',
    gymnast: (n: number) => `Gimnasta ${n}`,
  },
}

// ─── types ────────────────────────────────────────────────────────────────────

type Ruleset = 'Base' | 'Escolar' | 'Nacional'

type ParsedGymnast = {
  first_name: string
  last_name_1: string
  last_name_2: string
  dob_raw: string
  date_of_birth: string  // ISO yyyy-MM-dd or ''
  dob_valid: boolean
}

type ParsedTeam = {
  _id: string
  ageGroupRaw: string
  ageGroupId: string
  category: string  // '' = needs Nacional pair selector
  coach: string
  gymnasts: ParsedGymnast[]
  warnings: string[]
}

type ClubOption = { id: string; club_name: string; contact_name: string | null }

// ─── helpers ──────────────────────────────────────────────────────────────────

function normalizeStr(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

// Filter age group rules by ruleset using the age_group name:
//   Base     → rules whose name contains "base"
//   Escolar  → rules whose name contains "escolar"
//   Nacional → rules whose name contains neither
function filterRulesByRuleset(rules: AgeGroupRule[], ruleset: Ruleset): AgeGroupRule[] {
  const key = normalizeStr(ruleset)
  if (key === 'nacional') {
    return rules.filter(r => {
      const ag = normalizeStr(r.age_group)
      return !ag.includes('base') && !ag.includes('escolar')
    })
  }
  return rules.filter(r => normalizeStr(r.age_group).includes(key))
}

function parseDob(raw: string): { iso: string; valid: boolean } {
  const s = String(raw).trim()
  if (!s) return { iso: '', valid: false }

  // yyyy-MM-dd (ISO — from date input or already-formatted cell)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    if (!isNaN(new Date(s + 'T00:00:00').getTime())) return { iso: s, valid: true }
  }

  // dd/MM/yyyy, dd-MM-yyyy, dd/MM/yy, dd-MM-yy  (single or double digit day/month)
  const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/)
  if (m) {
    let year = parseInt(m[3])
    if (m[3].length === 2) year = year < 30 ? 2000 + year : 1900 + year
    const iso = `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
    if (!isNaN(new Date(iso + 'T00:00:00').getTime())) return { iso, valid: true }
  }

  // Excel / ODS date serial (integer or float like 43319.999...)
  const serial = parseFloat(s)
  if (!isNaN(serial) && serial > 1000 && !/[\/\-]/.test(s)) {
    try {
      const jsDate = new Date((Math.round(serial) - 25569) * 86400 * 1000)
      if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() >= 1900) {
        return { iso: jsDate.toISOString().slice(0, 10), valid: true }
      }
    } catch {}
  }

  return { iso: '', valid: false }
}

function deriveCategory(count: number, ruleset: Ruleset): string {
  if (ruleset === 'Escolar' || ruleset === 'Base') {
    if (count === 2) return 'Pairs'
    if (count === 3) return 'Groups 3'
    if (count === 4) return 'Groups 4'
    return ''
  }
  // Nacional
  if (count === 2) return ''  // needs pair type selector
  if (count === 3) return "Women's Group"
  if (count === 4) return "Mixed Group"
  return ''
}

function computeWarnings(
  team: ParsedTeam,
  ruleset: Ruleset,
  lang: Lang,
  competitionAgeGroups: string[],
  ageGroupRules: AgeGroupRule[],
  competitionYear: number,
): string[] {
  const t = T[lang]
  const w: string[] = []

  if (!team.ageGroupId) {
    w.push(t.ageGroupUnmatched)
  } else if (!competitionAgeGroups.includes(team.ageGroupId)) {
    w.push(t.ageGroupNotInCompetition)
  } else {
    // Age validation against age group rule
    const rule = ageGroupRules.find(r => r.id === team.ageGroupId)
    if (rule) {
      const refDate = `${competitionYear}-01-01`
      for (const g of team.gymnasts) {
        if (!g.dob_valid) continue
        const birth = new Date(g.date_of_birth + 'T00:00:00')
        const ref = new Date(refDate + 'T00:00:00')
        let age = ref.getFullYear() - birth.getFullYear()
        const md = ref.getMonth() - birth.getMonth()
        if (md < 0 || (md === 0 && ref.getDate() < birth.getDate())) age--
        const name = [g.first_name, g.last_name_1].filter(Boolean).join(' ')
        if (age < rule.min_age || (rule.max_age !== null && age > rule.max_age)) {
          w.push(t.ageOutOfRange(name, age, rule.min_age, rule.max_age))
        }
      }
    }
  }

  if (!team.category && ruleset === 'Nacional' && team.gymnasts.length === 2) w.push(t.pairTypeRequired)
  if (team.gymnasts.some(g => !g.dob_valid)) w.push(t.dobInvalid)
  if (team.gymnasts.some(g => !g.first_name.trim() || !g.last_name_1.trim())) w.push(t.missingName)
  return w
}

function parseFile(buffer: ArrayBuffer, ruleset: Ruleset, ageGroupRules: AgeGroupRule[]): ParsedTeam[] {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: '' })

  // Skip header row (first row), skip fully empty rows
  const dataRows = rows.slice(1).filter(r => r.some(c => String(c).trim() !== ''))

  const teams: ParsedTeam[] = []
  let current: ParsedTeam | null = null

  for (const row of dataRows) {
    const position = String(row[0] ?? '').trim().toUpperCase()
    const fullName  = String(row[1] ?? '').trim()
    const dobRaw    = String(row[4] ?? '').trim()   // Birthdate — col E, index 4
    const categoria = String(row[5] ?? '').trim()  // CATEGORIA merged cell — col F, index 5
    const coach     = String(row[6] ?? '').trim()  // ENTRENADOR/A — col G, index 6

    if (position === 'TOP') {
      if (current) teams.push(current)

      // If name column is empty, skip this row — it's not a real team entry
      if (!fullName) { current = null; continue }

      // Match age group against ruleset-filtered rules (accent-insensitive)
      const catNorm = normalizeStr(categoria)
      const rulesetPool = filterRulesByRuleset(ageGroupRules, ruleset)
      const matchedRule = catNorm
        ? rulesetPool.find(r => {
            const agNorm = normalizeStr(r.age_group)
            return agNorm === catNorm || agNorm.includes(catNorm) || catNorm.includes(agNorm)
          })
        : undefined

      current = {
        _id: crypto.randomUUID(),
        ageGroupRaw: categoria,
        ageGroupId: matchedRule?.id ?? '',
        category: '',  // derived after collecting gymnasts
        coach,
        gymnasts: [],
        warnings: [],
      }
    }

    if (!current || !fullName) continue
    if (position !== 'TOP' && position !== 'BASE' && position !== '') continue

    const words = fullName.split(/\s+/).filter(Boolean)
    const { iso, valid } = parseDob(dobRaw)

    current.gymnasts.push({
      first_name:    words[0] ?? '',
      last_name_1:   words[1] ?? '',
      last_name_2:   words.slice(2).join(' '),
      dob_raw:       dobRaw,
      date_of_birth: iso,
      dob_valid:     valid,
    })
  }

  if (current) teams.push(current)

  // Derive categories now that gymnast counts are known
  for (const team of teams) {
    team.category = deriveCategory(team.gymnasts.length, ruleset)
    // warnings computed later with full context
  }

  return teams
}

// ─── sub-components ───────────────────────────────────────────────────────────

function WarningBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
      </svg>
      {text}
    </span>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ImportTab({
  lang,
  competitionId,
  ageGroupRules,
  competitionAgeGroups,
  competitionYear,
}: {
  lang: Lang
  competitionId: string
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
  competitionYear: number
}) {
  const t = T[lang]
  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const fileRef = useRef<HTMLInputElement>(null)

  // ── step state ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState<'upload' | 'review' | 'importing' | 'done'>('upload')

  // ── upload step ──────────────────────────────────────────────────────────────
  const [clubs, setClubs] = useState<ClubOption[]>([])
  const [clubSearch, setClubSearch] = useState('')
  const [selectedClubId, setSelectedClubId] = useState<string>('')
  const [isNewClub, setIsNewClub] = useState(false)
  const [newClub, setNewClub] = useState({ club_name: '', email: '', contact_name: '' })
  const [ruleset, setRuleset] = useState<Ruleset | ''>('')
  const [fileError, setFileError] = useState('')
  const [parseError, setParseError] = useState('')
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState('')

  // ── review step ──────────────────────────────────────────────────────────────
  const [teams, setTeams] = useState<ParsedTeam[]>([])

  // ── done step ────────────────────────────────────────────────────────────────
  const [result, setResult] = useState<{ teamsCreated: number; inviteSent: boolean; errors: string[] } | null>(null)

  // ── fetch clubs ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/clubs')
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setClubs(data) : null)
      .catch(() => null)
  }, [])

  const filteredClubs = clubs.filter(c =>
    c.club_name.toLowerCase().includes(clubSearch.toLowerCase())
  )

  // ── file read ─────────────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParseError('')
    const reader = new FileReader()
    reader.onload = ev => {
      const buf = ev.target?.result
      if (buf instanceof ArrayBuffer) setFileBuffer(buf)
    }
    reader.readAsArrayBuffer(file)
  }

  function handleParse() {
    if (!fileBuffer) { setParseError(t.noFile); return }
    if (!ruleset) { setParseError(t.noRuleset); return }
    if (!selectedClubId && !isNewClub) { setParseError(t.noClub); return }
    if (isNewClub && (!newClub.club_name.trim() || !newClub.email.trim())) {
      setParseError(t.noClub); return
    }

    try {
      const parsed = parseFile(fileBuffer, ruleset as Ruleset, ageGroupRules)
      if (!parsed.length) { setParseError(t.noTeams); return }

      // Compute warnings with final context
      const withWarnings = parsed.map(team => ({
        ...team,
        warnings: computeWarnings(team, ruleset as Ruleset, lang, competitionAgeGroups, ageGroupRules, competitionYear),
      }))

      setTeams(withWarnings)
      setParseError('')
      setStep('review')
    } catch {
      setParseError(t.parseError)
    }
  }

  // ── team edit helpers ─────────────────────────────────────────────────────────
  function updateTeam(teamIdx: number, patch: Partial<ParsedTeam>) {
    setTeams(prev => prev.map((team, i) => {
      if (i !== teamIdx) return team
      const updated = { ...team, ...patch }
      updated.warnings = computeWarnings(updated, ruleset as Ruleset, lang, competitionAgeGroups, ageGroupRules, competitionYear)
      return updated
    }))
  }

  function updateGymnast(teamIdx: number, gymIdx: number, patch: Partial<ParsedGymnast>) {
    setTeams(prev => prev.map((team, i) => {
      if (i !== teamIdx) return team
      const gymnasts = team.gymnasts.map((g, j) => {
        if (j !== gymIdx) return g
        const updated = { ...g, ...patch }
        // Re-validate DOB if it changed (date input returns yyyy-MM-dd directly)
        if (patch.date_of_birth !== undefined) {
          const iso = patch.date_of_birth
          updated.date_of_birth = iso
          updated.dob_valid = iso !== '' && !isNaN(new Date(iso + 'T00:00:00').getTime())
        }
        return updated
      })
      const updated = { ...team, gymnasts }
      updated.warnings = computeWarnings(updated, ruleset as Ruleset, lang, competitionAgeGroups, ageGroupRules, competitionYear)
      return updated
    }))
  }

  // ── confirm import ────────────────────────────────────────────────────────────
  const hasErrors = teams.some(t => t.warnings.length > 0)

  async function handleConfirm() {
    if (hasErrors) return
    setStep('importing')

    const body = {
      competitionId,
      clubId: isNewClub ? null : selectedClubId,
      newClub: isNewClub ? {
        club_name: newClub.club_name.trim(),
        email: newClub.email.trim(),
        contact_name: newClub.contact_name.trim() || undefined,
      } : undefined,
      teams: teams.map(team => ({
        ageGroupId: team.ageGroupId,
        category: team.category,
        gymnasts: team.gymnasts.map(g => ({
          first_name:    g.first_name.trim(),
          last_name_1:   g.last_name_1.trim(),
          last_name_2:   g.last_name_2.trim(),
          date_of_birth: g.date_of_birth,
        })),
      })),
    }

    const res = await fetch('/api/admin/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      setStep('review')
      return
    }

    const data = await res.json()
    setResult({ teamsCreated: data.teamsCreated, inviteSent: data.inviteSent, errors: data.errors ?? [] })
    setStep('done')
  }

  function resetAll() {
    setStep('upload')
    setSelectedClubId('')
    setIsNewClub(false)
    setNewClub({ club_name: '', email: '', contact_name: '' })
    setRuleset('')
    setFileBuffer(null)
    setFileName('')
    setParseError('')
    setTeams([])
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── render ────────────────────────────────────────────────────────────────────

  if (step === 'done' && result) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800">{t.done}</h2>
        <p className="text-sm text-slate-500">{t.doneDesc(result.teamsCreated, result.inviteSent)}</p>
        {isNewClub && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">{t.inviteNote}</p>
        )}
        {result.errors.length > 0 && (
          <div className="text-left bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-red-600">Errors:</p>
            {result.errors.map((e, i) => (
              <p key={i} className="text-xs text-red-500">{e}</p>
            ))}
          </div>
        )}
        <button onClick={resetAll}
          className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
          {t.importAnother}
        </button>
      </div>
    )
  }

  if (step === 'review' || step === 'importing') {
    return (
      <div className="space-y-6">
        {/* header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">
              {isNewClub ? newClub.club_name : clubs.find(c => c.id === selectedClubId)?.club_name} · {ruleset}
            </p>
            <h2 className="text-sm font-semibold text-slate-700">{t.reviewTitle(teams.length)}</h2>
          </div>
          <button onClick={() => setStep('upload')}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            {t.back}
          </button>
        </div>

        {/* team cards */}
        <div className="space-y-4">
          {teams.map((team, ti) => (
            <div key={team._id} className={[
              'border rounded-2xl overflow-hidden',
              team.warnings.length ? 'border-red-200' : 'border-slate-200',
            ].join(' ')}>
              {/* team header */}
              <div className={['px-4 py-3 border-b flex flex-wrap items-start gap-3',
                team.warnings.length ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'].join(' ')}>
                <div className="flex items-center gap-1.5 w-16 shrink-0 pt-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t.teamN(ti + 1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTeams(prev => prev.filter((_, i) => i !== ti))}
                    title="Remove team"
                    className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* age group */}
                <div className="flex-1 min-w-36">
                  <label className="block text-xs text-slate-400 mb-1">{t.ageGroup}</label>
                  <select
                    value={team.ageGroupId}
                    onChange={e => updateTeam(ti, { ageGroupId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">— {t.ageGroup} —</option>
                    {(team.ageGroupId
                      ? filterRulesByRuleset(ageGroupRules, ruleset as Ruleset)
                      : ageGroupRules
                    ).map(r => (
                      <option key={r.id} value={r.id}>{r.age_group}</option>
                    ))}
                  </select>
                </div>

                {/* category / pair selector */}
                <div className="flex-1 min-w-36">
                  <label className="block text-xs text-slate-400 mb-1">{t.category}</label>
                  {team.gymnasts.length === 2 && ruleset === 'Nacional' ? (
                    <select
                      value={team.category}
                      onChange={e => updateTeam(ti, { category: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">{t.selectPair}</option>
                      <option value="Women's Pair">{CATEGORY_LABELS[lang]?.["Women's Pair"] ?? t.womensPair}</option>
                      <option value="Men's Pair">{CATEGORY_LABELS[lang]?.["Men's Pair"] ?? t.mensPair}</option>
                      <option value="Mixed Pair">{CATEGORY_LABELS[lang]?.["Mixed Pair"] ?? t.mixedPair}</option>
                    </select>
                  ) : (
                    <input
                      readOnly
                      value={team.category ? (CATEGORY_LABELS[lang]?.[team.category] ?? team.category) : '—'}
                      className={inputCls + ' bg-slate-50 text-slate-400 cursor-default'}
                    />
                  )}
                </div>

                {/* coach */}
                <div className="flex-1 min-w-36">
                  <label className="block text-xs text-slate-400 mb-1">{t.coach}</label>
                  <input
                    type="text"
                    value={team.coach}
                    onChange={e => updateTeam(ti, { coach: e.target.value })}
                    className={inputCls}
                  />
                </div>

                {/* warnings */}
                {team.warnings.length > 0 && (
                  <div className="w-full flex flex-wrap gap-1.5 pt-1">
                    {team.warnings.map(w => <WarningBadge key={w} text={w} />)}
                  </div>
                )}
              </div>

              {/* gymnast rows */}
              <div className="divide-y divide-slate-100">
                {team.gymnasts.map((g, gi) => (
                  <div key={gi} className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">{t.firstName}</label>
                      <input
                        type="text"
                        value={g.first_name}
                        onChange={e => updateGymnast(ti, gi, { first_name: e.target.value })}
                        className={inputCls + (!g.first_name.trim() ? ' border-red-300 focus:ring-red-400' : '')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">{t.lastName1}</label>
                      <input
                        type="text"
                        value={g.last_name_1}
                        onChange={e => updateGymnast(ti, gi, { last_name_1: e.target.value })}
                        className={inputCls + (!g.last_name_1.trim() ? ' border-red-300 focus:ring-red-400' : '')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">{t.lastName2}</label>
                      <input
                        type="text"
                        value={g.last_name_2}
                        onChange={e => updateGymnast(ti, gi, { last_name_2: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">{t.dob}</label>
                      <input
                        type="date"
                        value={g.date_of_birth}
                        onChange={e => updateGymnast(ti, gi, { date_of_birth: e.target.value })}
                        className={inputCls + (!g.dob_valid ? ' border-red-300 focus:ring-red-400' : '')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* confirm */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {hasErrors && (
            <p className="text-xs text-red-500">{t.errorsRemain}</p>
          )}
          <button
            onClick={handleConfirm}
            disabled={hasErrors || step === 'importing'}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {step === 'importing' && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {step === 'importing' ? t.confirming : t.confirm}
          </button>
        </div>
      </div>
    )
  }

  // ── upload step ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-base font-semibold text-slate-800">{t.title}</h2>

      {/* club selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-500">{t.clubLabel}</label>
        {!isNewClub ? (
          <>
            <input
              type="text"
              placeholder={t.clubPlaceholder}
              value={clubSearch}
              onChange={e => { setClubSearch(e.target.value); setSelectedClubId('') }}
              className={inputCls}
            />
            {clubSearch && filteredClubs.length > 0 && !selectedClubId && (
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                {filteredClubs.slice(0, 8).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedClubId(c.id); setClubSearch(c.club_name) }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium text-slate-800">{c.club_name}</span>
                    {c.contact_name && <span className="text-slate-400 text-xs ml-2">{c.contact_name}</span>}
                  </button>
                ))}
              </div>
            )}
            {selectedClubId && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {clubs.find(c => c.id === selectedClubId)?.club_name}
              </p>
            )}
            <button
              type="button"
              onClick={() => { setIsNewClub(true); setSelectedClubId(''); setClubSearch('') }}
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
              + {t.newClub}
            </button>
          </>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t.clubName} *</label>
              <input type="text" value={newClub.club_name}
                onChange={e => setNewClub(p => ({ ...p, club_name: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t.inviteEmail} *</label>
              <input type="email" value={newClub.email}
                onChange={e => setNewClub(p => ({ ...p, email: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t.contactName}</label>
              <input type="text" value={newClub.contact_name}
                onChange={e => setNewClub(p => ({ ...p, contact_name: e.target.value }))}
                className={inputCls} />
            </div>
            <button type="button" onClick={() => setIsNewClub(false)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← {t.clubLabel}
            </button>
          </div>
        )}
      </div>

      {/* ruleset */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">{t.ruleset}</label>
        <div className="flex gap-2">
          {(['Base', 'Escolar', 'Nacional'] as Ruleset[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRuleset(r)}
              className={['px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                ruleset === r
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              ].join(' ')}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* file */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">{t.fileLabel}</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl px-6 py-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
        >
          <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {fileName
            ? <p className="text-sm font-medium text-slate-700">{fileName}</p>
            : <p className="text-sm text-slate-400">.ods · .xlsx · .csv</p>}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".ods,.xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {parseError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {parseError}
        </p>
      )}

      <button
        onClick={handleParse}
        disabled={!fileBuffer}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {t.parse}
      </button>
    </div>
  )
}
