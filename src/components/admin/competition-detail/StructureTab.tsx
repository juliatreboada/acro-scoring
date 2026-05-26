'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Panel, Section, Session, AgeGroupRule, Apparatus, ApparatusRule, RankingMergeGroup } from '@/components/admin/types'
import { ROUTINE_TYPES, categoriesForRuleset, CATEGORY_LABELS, rgRulesetLabel } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    sections: 'Sections',
    addSection: 'Add section',
    sectionLabel: 'Label',
    sectionLabelPlaceholder: 'e.g. Morning, Afternoon…',
    startingTime: 'Start time',
    waitingSec: 'Wait (s)',
    warmupMin: 'Warmup (min)',
    deleteSection: 'Delete section',
    noSections: 'No sections yet',
    noSectionsSub: 'Add a section to start building the schedule.',
    addSession: 'Add session',
    noSessions: 'No sessions in this section yet.',
    panelLabel: 'Panel',
    ageGroup: 'Age group',
    ruleset: 'Modality',
    category: 'Category',
    routineType: 'Routine type',
    apparatus: 'Apparatus',
    save: 'Add',
    cancel: 'Cancel',
    deleteSession: 'Remove',
    sessionName: (ag: string, cat: string, rt: string) => `${ag} · ${cat} · ${rt}`,
    sectionN: (n: number) => `Section ${n}`,
    panelBadge: (n: number) => `P${n}`,
    panelN: (n: number) => `Panel ${n}`,
    mergeRanking: 'Shared ranking (TV & results)',
    mergeNone: 'Per category (default)',
    newMergeGroup: 'New merge group',
    newMergeGroupShort: 'New',
    labelEs: 'Label (ES)',
    labelEn: 'Label (EN)',
    createGroup: 'Create & assign',
    smallFieldHint: (n: number) =>
      `Only ${n} team(s) registered in this category. You can assign a shared ranking with another session (same age group & routine type) below — optional.`,
   },
  es: {
    sections: 'Jornadas',
    addSection: 'Añadir jornada',
    sectionLabel: 'Etiqueta',
    sectionLabelPlaceholder: 'p.ej. Mañana, Tarde…',
    startingTime: 'Hora inicio',
    waitingSec: 'Espera (s)',
    warmupMin: 'Calent. (min)',
    deleteSection: 'Eliminar jornada',
    noSections: 'Sin jornadas',
    noSectionsSub: 'Añade una joranada para empezar a construir el programa.',
    addSession: 'Añadir sesión',
    noSessions: 'Sin sesiones en esta jornada.',
    panelLabel: 'Panel',
    ageGroup: 'Grupo de edad',
    ruleset: 'Modalidad',
    category: 'Categoría',
    routineType: 'Tipo de rutina',
    apparatus: 'Aparato',
    save: 'Añadir',
    cancel: 'Cancelar',
    deleteSession: 'Eliminar',
    sessionName: (ag: string, cat: string, rt: string) => `${ag} · ${cat} · ${rt}`,
    sectionN: (n: number) => `Jornada ${n}`,
    panelBadge: (n: number) => `P${n}`,
    panelN: (n: number) => `Panel ${n}`,
    mergeRanking: 'Clasificación conjunta (TV y resultados)',
    mergeNone: 'Por categoría (predeterminado)',
    newMergeGroup: 'Nuevo grupo de fusión',
    newMergeGroupShort: 'Nuevo',
    labelEs: 'Etiqueta (ES)',
    labelEn: 'Etiqueta (EN)',
    createGroup: 'Crear y asignar',
    smallFieldHint: (n: number) =>
      `Solo ${n} equipo(s) inscrito(s) en esta categoría. Puedes usar una clasificación conjunta con otra sesión (mismo grupo de edad y tipo de rutina) abajo — opcional.`,
   },
}

// ─── panel colours ────────────────────────────────────────────────────────────

const PANEL_STYLES: Record<number, { badge: string; border: string }> = {
  1: { badge: 'bg-blue-100 text-blue-700',   border: 'border-l-blue-400' },
  2: { badge: 'bg-violet-100 text-violet-700', border: 'border-l-violet-400' },
}

/** Merge groups this session may join: same competition, empty group or peers share age_group + routine_type. */
function mergeGroupsForSessionRow(
  session: Session,
  allSessions: Session[],
  groups: RankingMergeGroup[],
): RankingMergeGroup[] {
  const valid = groups.filter((g) => {
    const peers = allSessions.filter(
      (s) => s.ranking_merge_group_id === g.id && s.id !== session.id,
    )
    if (peers.length === 0) return true
    return peers.every(
      (p) => p.age_group === session.age_group && p.routine_type === session.routine_type,
    )
  })
  if (session.ranking_merge_group_id) {
    const cur = groups.find((g) => g.id === session.ranking_merge_group_id)
    if (cur && !valid.some((g) => g.id === cur.id)) {
      return [...valid, cur].sort((a, b) => a.id.localeCompare(b.id))
    }
  }
  return valid
}

function groupOptionLabel(g: RankingMergeGroup, lang: Lang) {
  const a = (g.label_es || '').trim()
  const b = (g.label_en || '').trim()
  if (lang === 'en') return b || a || g.id.slice(0, 8)
  return a || b || g.id.slice(0, 8)
}

// ─── add-session form ─────────────────────────────────────────────────────────

type AddSessionFormProps = {
  lang: Lang
  panel: Panel
  sportType: string
  competitionYear: number
  ageGroups: string[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  apparatus: Apparatus[]
  apparatusRules: ApparatusRule[]
  sectionId: string
  nextOrderIndex: number
  onAdd: (s: Omit<Session, 'id'>) => void
  onCancel: () => void
}

function AddSessionForm({ lang, panel, sportType, competitionYear, ageGroups, agLabels, ageGroupRules, apparatus, apparatusRules, sectionId, nextOrderIndex, onAdd, onCancel }: AddSessionFormProps) {
  const t = T[lang]
  const isRG = sportType === 'rg'

  // Acro state
  const [ageGroup, setAgeGroupState] = useState('')
  const [category, setCategory] = useState('')
  const [routineType, setRoutineType] = useState<'Balance' | 'Dynamic' | 'Combined' | ''>('')

  // RG state: first selector = unique age_group+level combos; second = ruleset; third = apparatus
  const [rgBaseKey, setRgBaseKey] = useState('')   // "{age_group}||{level}"
  const [rgRuleset, setRgRuleset] = useState('')   // Individual | Group | Equipos
  const [rgApparatus, setRgApparatus] = useState('')

  // Build unique {age_group}||{level} options for RG from the competition's selected age groups
  const rgBaseOptions: { key: string; label: string }[] = (() => {
    if (!isRG) return []
    const seen = new Set<string>()
    const out: { key: string; label: string }[] = []
    for (const agId of ageGroups) {
      const rule = ageGroupRules.find(r => r.id === agId)
      if (!rule) continue
      const key = `${rule.age_group}||${rule.level}`
      if (!seen.has(key)) {
        seen.add(key)
        out.push({ key, label: `${rule.age_group} ${rule.level}` })
      }
    }
    return out
  })()

  // Build ruleset options from rules matching the selected rgBaseKey
  const rgRulesetOptions: string[] = (() => {
    if (!isRG || !rgBaseKey) return []
    const [ag, lv] = rgBaseKey.split('||')
    const seen = new Set<string>()
    for (const agId of ageGroups) {
      const rule = ageGroupRules.find(r => r.id === agId)
      if (!rule || rule.age_group !== ag || rule.level !== lv) continue
      if (!seen.has(rule.ruleset)) seen.add(rule.ruleset)
    }
    return Array.from(seen)
  })()

  // Resolve the actual AgeGroupRule UUID from rgBaseKey + rgRuleset
  const resolvedRuleId: string = (() => {
    if (!isRG || !rgBaseKey || !rgRuleset) return ''
    const [ag, lv] = rgBaseKey.split('||')
    return ageGroupRules.find(r =>
      ageGroups.includes(r.id) && r.age_group === ag && r.level === lv && r.ruleset === rgRuleset
    )?.id ?? ''
  })()

  // Acro helpers
  const selectedRule = ageGroupRules.find(r => r.id === ageGroup)
  const availableCategories: string[] = ageGroup ? categoriesForRuleset(selectedRule?.level ?? '') : []
  const availableRoutineTypes: (typeof ROUTINE_TYPES[number])[] = (() => {
    const count = selectedRule?.routine_count ?? 3
    if (count === 1) return ['Combined']
    if (count === 2) return ['Balance', 'Dynamic']
    return ['Balance', 'Dynamic', 'Combined']
  })()

  // RG apparatus derived from apparatus_rules for the resolved rule + competition year
  const availableApparatus: Apparatus[] = (() => {
    if (!isRG || !resolvedRuleId) return []
    const rules = apparatusRules
      .filter(r => r.age_group_rule_id === resolvedRuleId && r.year === competitionYear)
      .sort((a, b) => a.sort_order - b.sort_order)
    return rules.map(r => apparatus.find(a => a.id === r.apparatus_id)).filter((a): a is Apparatus => !!a)
  })()

  // Chain: auto-select first item in each RG selector as options become available
  useEffect(() => {
    if (rgBaseOptions.length > 0) setRgBaseKey(rgBaseOptions[0].key)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rgRulesetOptions.length > 0) setRgRuleset(rgRulesetOptions[0])
    else setRgRuleset('')
  }, [rgBaseKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (availableApparatus.length > 0) setRgApparatus(availableApparatus[0].name)
    else setRgApparatus('')
  }, [resolvedRuleId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAgeGroupChange(ag: string) { setAgeGroupState(ag); setCategory(''); setRoutineType('') }
  function handleCategoryChange(cat: string) { setCategory(cat); setRoutineType('') }
  function handleRgBaseChange(key: string) { setRgBaseKey(key); setRgRuleset(''); setRgApparatus('') }
  function handleRgRulesetChange(rs: string) { setRgRuleset(rs); setRgApparatus('') }

  function handleAdd() {
    if (isRG) {
      if (!resolvedRuleId || !rgRuleset || !rgApparatus) return
      const [ag, lv] = rgBaseKey.split('||')
      const sessionAg = `${ag} ${lv}`
      onAdd({
        competition_id: panel.competition_id,
        panel_id: panel.id,
        section_id: sectionId,
        name: t.sessionName(sessionAg, rgRulesetLabel(rgRuleset), rgApparatus),
        age_group: resolvedRuleId,
        category: rgRuleset,
        routine_type: rgApparatus as Session['routine_type'],
        status: 'waiting',
        order_index: nextOrderIndex,
        dj_method: null,
        ej_method: null,
        ranking_merge_group_id: null,
      })
    } else {
      if (!ageGroup || !category || !routineType) return
      onAdd({
        competition_id: panel.competition_id,
        panel_id: panel.id,
        section_id: sectionId,
        name: t.sessionName(agLabels[ageGroup] ?? ageGroup, category, routineType),
        age_group: ageGroup,
        category,
        routine_type: routineType,
        status: 'waiting',
        order_index: nextOrderIndex,
        dj_method: null,
        ej_method: null,
        ranking_merge_group_id: null,
      })
    }
  }

  const canAdd = isRG ? !!(resolvedRuleId && rgRuleset && rgApparatus) : !!(ageGroup && category && routineType)
  const selectCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
      <div className="space-y-2">
        {isRG ? (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">{t.ageGroup}</label>
              <select value={rgBaseKey} onChange={(e) => handleRgBaseChange(e.target.value)} className={selectCls}>
                <option value="">—</option>
                {rgBaseOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            {rgBaseKey && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">{t.ruleset}</label>
                <select value={rgRuleset} onChange={(e) => handleRgRulesetChange(e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {rgRulesetOptions.map(rs => <option key={rs} value={rs}>{rgRulesetLabel(rs)}</option>)}
                </select>
              </div>
            )}
            {rgBaseKey && rgRuleset && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">{t.apparatus}</label>
                {availableApparatus.length === 1 ? (
                  <div className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 bg-slate-50">
                    {availableApparatus[0].name}
                  </div>
                ) : (
                  <select value={rgApparatus} onChange={(e) => setRgApparatus(e.target.value)} className={selectCls}>
                    {availableApparatus.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">{t.ageGroup}</label>
              <select value={ageGroup} onChange={(e) => handleAgeGroupChange(e.target.value)} className={selectCls}>
                <option value="">—</option>
                {ageGroups.map((ag) => <option key={ag} value={ag}>{agLabels[ag] ?? ag}</option>)}
              </select>
            </div>
            {ageGroup && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">{t.category}</label>
                <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[lang]?.[c] ?? c}</option>
                  ))}
                </select>
              </div>
            )}
            {ageGroup && category && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">{t.routineType}</label>
                <select value={routineType} onChange={(e) => setRoutineType(e.target.value as 'Balance' | 'Dynamic' | 'Combined')} className={selectCls}>
                  <option value="">—</option>
                  {availableRoutineTypes.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
          {t.cancel}
        </button>
        <button onClick={handleAdd} disabled={!canAdd}
          className="flex-1 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all">
          {t.save}
        </button>
      </div>
    </div>
  )
}

// ─── session row ──────────────────────────────────────────────────────────────

function SessionRow({
  session,
  borderStyle,
  onDelete,
  lang,
  allSessions,
  rankingMergeGroups,
  eligibleTeamCount,
  onAssignMergeGroup,
  onCreateMergeGroup,
}: {
  session: Session
  borderStyle: string
  onDelete: () => void
  lang: Lang
  allSessions: Session[]
  rankingMergeGroups: RankingMergeGroup[]
  eligibleTeamCount: number
  onAssignMergeGroup: (sessionId: string, mergeGroupId: string | null) => void | Promise<void>
  onCreateMergeGroup: (labelEs: string, labelEn: string) => Promise<string | null>
}) {
  const t = T[lang]
  const rowGroups = mergeGroupsForSessionRow(session, allSessions, rankingMergeGroups)
  const showSmallFieldHint = eligibleTeamCount < 3
  const [creating, setCreating] = useState(false)
  const [newEs, setNewEs] = useState('')
  const [newEn, setNewEn] = useState('')

  useEffect(() => {
    setCreating(false)
    setNewEs('')
    setNewEn('')
  }, [session.id])

  const submitNewGroup = useCallback(async () => {
    const gid = await onCreateMergeGroup(newEs.trim(), newEn.trim())
    if (gid) await onAssignMergeGroup(session.id, gid)
    setCreating(false)
    setNewEs('')
    setNewEn('')
  }, [onAssignMergeGroup, onCreateMergeGroup, newEs, newEn, session.id])

  const selectCls =
    'max-w-[11rem] text-xs border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400'

  return (
    <div
      className={[
        'flex flex-col gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl border-l-4',
        borderStyle,
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-medium text-slate-700 leading-snug">{session.name}</p>
          {showSmallFieldHint && (
            <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1 leading-snug">
              {t.smallFieldHint(eligibleTeamCount)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <label className="text-[10px] text-slate-500 shrink-0">{t.mergeRanking}</label>
            <select
              className={selectCls}
              value={session.ranking_merge_group_id ?? ''}
              onChange={(e) => onAssignMergeGroup(session.id, e.target.value || null)}
            >
              <option value="">{t.mergeNone}</option>
              {rowGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {groupOptionLabel(g, lang)}
                </option>
              ))}
            </select>
            <button
              type="button"
              title={t.newMergeGroup}
              onClick={() => setCreating((c) => !c)}
              className="text-[10px] font-medium text-blue-600 hover:text-blue-800 px-1 py-0.5 rounded"
            >
              {t.newMergeGroupShort}
            </button>
          </div>
          {creating && (
            <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] mt-1">
              <input
                value={newEs}
                onChange={(e) => setNewEs(e.target.value)}
                placeholder={t.labelEs}
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <input
                value={newEn}
                onChange={(e) => setNewEn(e.target.value)}
                placeholder={t.labelEn}
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={() => void submitNewGroup()}
                className="self-start mt-0.5 px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-semibold hover:bg-blue-700"
              >
                {t.createGroup}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 text-xs text-slate-300 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
        >
          {t.deleteSession}
        </button>
      </div>
    </div>
  )
}

// ─── panel column ─────────────────────────────────────────────────────────────

function PanelColumn({ lang, panel, sportType, competitionYear, sessions, ageGroups, agLabels, ageGroupRules, apparatus, apparatusRules, sectionId, onAddSession, onDeleteSession, allCompetitionSessions, rankingMergeGroups, sessionEligibleTeamCounts, onAssignMergeGroup, onCreateMergeGroup }: {
  lang: Lang
  panel: Panel
  sportType: string
  competitionYear: number
  sessions: Session[]
  ageGroups: string[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  apparatus: Apparatus[]
  apparatusRules: ApparatusRule[]
  sectionId: string
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (id: string) => void
  allCompetitionSessions: Session[]
  rankingMergeGroups: RankingMergeGroup[]
  sessionEligibleTeamCounts: Record<string, number>
  onAssignMergeGroup: (sessionId: string, mergeGroupId: string | null) => void | Promise<void>
  onCreateMergeGroup: (labelEs: string, labelEn: string) => Promise<string | null>
}) {
  const t = T[lang]
  const [showForm, setShowForm] = useState(false)
  const styles = PANEL_STYLES[panel.panel_number]

  return (
    <div className="flex flex-col gap-2">
      {/* column header */}
      <div className={['flex items-center gap-2 px-3 py-1.5 rounded-lg', styles.badge].join(' ')}>
        <span className="text-xs font-bold">{t.panelN(panel.panel_number)}</span>
      </div>

      {/* sessions */}
      {sessions.map((s) => (
        <SessionRow
          key={s.id}
          session={s}
          borderStyle={styles.border}
          onDelete={() => onDeleteSession(s.id)}
          lang={lang}
          allSessions={allCompetitionSessions}
          rankingMergeGroups={rankingMergeGroups}
          eligibleTeamCount={sessionEligibleTeamCounts[s.id] ?? 0}
          onAssignMergeGroup={onAssignMergeGroup}
          onCreateMergeGroup={onCreateMergeGroup}
        />
      ))}

      {/* add form */}
      {showForm ? (
        <AddSessionForm
          lang={lang}
          panel={panel}
          sportType={sportType}
          competitionYear={competitionYear}
          ageGroups={ageGroups}
          agLabels={agLabels}
          ageGroupRules={ageGroupRules}
          apparatus={apparatus}
          apparatusRules={apparatusRules}
          sectionId={sectionId}
          nextOrderIndex={sessions.length + 1}
          onAdd={(s) => { onAddSession(s); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-1 py-2 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-dashed border-slate-200 hover:border-blue-300 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t.addSession}
        </button>
      )}
    </div>
  )
}

// ─── section block ────────────────────────────────────────────────────────────

type SectionTimes = {
  starting_time: string | null
  waiting_time_seconds: number | null
  warmup_duration_minutes: number | null
}

type SectionBlockProps = {
  lang: Lang
  section: Section
  sessions: Session[]
  allCompetitionSessions: Session[]
  panels: Panel[]
  sportType: string
  competitionYear: number
  ageGroups: string[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  apparatus: Apparatus[]
  apparatusRules: ApparatusRule[]
  rankingMergeGroups: RankingMergeGroup[]
  sessionEligibleTeamCounts: Record<string, number>
  onUpdateLabel: (label: string) => void
  onUpdateTimes: (times: SectionTimes) => void
  onDelete: () => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (id: string) => void
  onAssignMergeGroup: (sessionId: string, mergeGroupId: string | null) => void | Promise<void>
  onCreateMergeGroup: (labelEs: string, labelEn: string) => Promise<string | null>
}

function SectionBlock({
  lang, section, sessions, allCompetitionSessions, panels, sportType, competitionYear, ageGroups, agLabels, ageGroupRules,
  apparatus, apparatusRules, rankingMergeGroups, sessionEligibleTeamCounts,
  onUpdateLabel, onUpdateTimes, onDelete, onAddSession, onDeleteSession, onAssignMergeGroup, onCreateMergeGroup,
}: SectionBlockProps) {
  const t = T[lang]
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState(section.label ?? '')
  const [startingTime, setStartingTime]   = useState(section.starting_time?.slice(0, 5) ?? '')
  const [waitingSec, setWaitingSec]       = useState(section.waiting_time_seconds?.toString() ?? '')
  const [warmupMin, setWarmupMin]         = useState(section.warmup_duration_minutes?.toString() ?? '')
  const twoPanel = panels.length === 2

  function saveTimes() {
    onUpdateTimes({
      starting_time:           startingTime || null,
      waiting_time_seconds:    waitingSec !== '' ? parseInt(waitingSec, 10) : null,
      warmup_duration_minutes: warmupMin  !== '' ? parseInt(warmupMin,  10) : null,
    })
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400'

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      {/* section header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <span className="shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wide">
          {t.sectionN(section.section_number)}
        </span>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => onUpdateLabel(label.trim())}
          placeholder={t.sectionLabelPlaceholder}
          className="flex-1 text-sm font-medium text-slate-700 bg-transparent border-none outline-none placeholder:text-slate-300"
        />
        <button onClick={onDelete}
          className="shrink-0 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all">
          {t.deleteSection}
        </button>
      </div>

      {/* timing row */}
      <div className="flex items-end gap-3 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
        <div className="flex flex-col gap-1 w-28">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{t.startingTime}</label>
          <input type="time" value={startingTime}
            onChange={(e) => setStartingTime(e.target.value)}
            onBlur={saveTimes}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1 w-20">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{t.waitingSec}</label>
          <input type="number" min={0} value={waitingSec}
            onChange={(e) => setWaitingSec(e.target.value)}
            onBlur={saveTimes}
            placeholder="0"
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1 w-24">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{t.warmupMin}</label>
          <input type="number" min={0} value={warmupMin}
            onChange={(e) => setWarmupMin(e.target.value)}
            onBlur={saveTimes}
            placeholder="0"
            className={inputCls}
          />
        </div>
      </div>

      {/* sessions — 2-column when 2 panels, single column otherwise */}
      <div className="p-4">
        {twoPanel ? (
          <div className="grid grid-cols-2 gap-4">
            {panels.sort((a, b) => a.panel_number - b.panel_number).map((panel) => (
              <PanelColumn
                key={panel.id}
                lang={lang}
                panel={panel}
                sportType={sportType}
                competitionYear={competitionYear}
                sessions={sessions.filter((s) => s.panel_id === panel.id)}
                ageGroups={ageGroups}
                agLabels={agLabels}
                ageGroupRules={ageGroupRules}
                apparatus={apparatus}
                apparatusRules={apparatusRules}
                sectionId={section.id}
                onAddSession={onAddSession}
                onDeleteSession={onDeleteSession}
                allCompetitionSessions={allCompetitionSessions}
                rankingMergeGroups={rankingMergeGroups}
                sessionEligibleTeamCounts={sessionEligibleTeamCounts}
                onAssignMergeGroup={onAssignMergeGroup}
                onCreateMergeGroup={onCreateMergeGroup}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.length === 0 && !showForm && (
              <p className="text-sm text-slate-400 text-center py-2">{t.noSessions}</p>
            )}
            {sessions.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                borderStyle={PANEL_STYLES[1].border}
                onDelete={() => onDeleteSession(s.id)}
                lang={lang}
                allSessions={allCompetitionSessions}
                rankingMergeGroups={rankingMergeGroups}
                eligibleTeamCount={sessionEligibleTeamCounts[s.id] ?? 0}
                onAssignMergeGroup={onAssignMergeGroup}
                onCreateMergeGroup={onCreateMergeGroup}
              />
            ))}
            {showForm ? (
              <AddSessionForm
                lang={lang}
                panel={panels[0]}
                sportType={sportType}
                competitionYear={competitionYear}
                ageGroups={ageGroups}
                agLabels={agLabels}
                ageGroupRules={ageGroupRules}
                apparatus={apparatus}
                apparatusRules={apparatusRules}
                sectionId={section.id}
                nextOrderIndex={sessions.length + 1}
                onAdd={(s) => { onAddSession(s); setShowForm(false) }}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-dashed border-slate-200 hover:border-blue-300 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t.addSession}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


// ─── main component ───────────────────────────────────────────────────────────

export type StructureTabProps = {
  lang: Lang
  competitionId: string
  sportType: string
  competitionYear: number
  ageGroups: string[]          // age group IDs enabled for this competition
  agLabels: Record<string, string>  // UUID → display label
  ageGroupRules: AgeGroupRule[]
  apparatus: Apparatus[]
  apparatusRules: ApparatusRule[]
  panels: Panel[]
  sections: Section[]
  sessions: Session[]
  rankingMergeGroups: RankingMergeGroup[]
  sessionEligibleTeamCounts: Record<string, number>
  onAddSection: () => void
  onUpdateSectionLabel: (sectionId: string, label: string) => void
  onUpdateSectionTimes: (sectionId: string, times: SectionTimes) => void
  onDeleteSection: (sectionId: string) => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (sessionId: string) => void
  onAssignSessionMergeGroup: (sessionId: string, mergeGroupId: string | null) => void | Promise<void>
  onCreateRankingMergeGroup: (labelEs: string, labelEn: string) => Promise<string | null>
}

export default function StructureTab({
  lang, competitionId, sportType, competitionYear, ageGroups, agLabels, ageGroupRules,
  apparatus, apparatusRules, rankingMergeGroups, sessionEligibleTeamCounts, panels, sections, sessions,
  onAddSection, onUpdateSectionLabel, onUpdateSectionTimes, onDeleteSection,
  onAddSession, onDeleteSession, onAssignSessionMergeGroup, onCreateRankingMergeGroup,
}: StructureTabProps) {
  const t = T[lang]
  const sorted = [...sections].sort((a, b) => a.section_number - b.section_number)
  const [activeSectionId, setActiveSectionId] = useState<string>(sorted[0]?.id ?? '')

  // auto-select the newest section when one is added
  useEffect(() => {
    if (sorted.length === 0) { setActiveSectionId(''); return }
    if (!sorted.find(s => s.id === activeSectionId)) {
      setActiveSectionId(sorted[sorted.length - 1].id)
    }
  }, [sections]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeSection = sorted.find(s => s.id === activeSectionId) ?? sorted[0]

  function handleDelete(sec: Section) {
    const idx = sorted.findIndex(s => s.id === sec.id)
    const next = sorted[idx + 1] ?? sorted[idx - 1]
    onDeleteSection(sec.id)
    if (next) setActiveSectionId(next.id)
  }

  if (sections.length === 0) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm font-medium text-slate-500">{t.noSections}</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">{t.noSectionsSub}</p>
          <button onClick={onAddSection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.addSection}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* section tab bar */}
      <div className="flex items-center border-b border-slate-200 mb-6 gap-0">
        {sorted.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSectionId(sec.id)}
            className={[
              'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
              activeSectionId === sec.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {sec.label ?? t.sectionN(sec.section_number)}
          </button>
        ))}
        {/* add section button as a + tab */}
        <button
          onClick={onAddSection}
          className="px-3 py-2.5 text-slate-400 hover:text-blue-600 border-b-2 border-transparent transition-all"
          title={t.addSection}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* active section content */}
      {activeSection && (
        <SectionBlock
          key={activeSection.id}
          lang={lang}
          section={activeSection}
          sessions={sessions
            .filter(s => s.section_id === activeSection.id)
            .sort((a, b) => a.order_index - b.order_index)}
          allCompetitionSessions={sessions}
          panels={panels}
          sportType={sportType}
          competitionYear={competitionYear}
          ageGroups={ageGroups}
          agLabels={agLabels}
          ageGroupRules={ageGroupRules}
          apparatus={apparatus}
          apparatusRules={apparatusRules}
          rankingMergeGroups={rankingMergeGroups}
          sessionEligibleTeamCounts={sessionEligibleTeamCounts}
          onUpdateLabel={(label) => onUpdateSectionLabel(activeSection.id, label)}
          onUpdateTimes={(times) => onUpdateSectionTimes(activeSection.id, times)}
          onDelete={() => handleDelete(activeSection)}
          onAddSession={onAddSession}
          onDeleteSession={onDeleteSession}
          onAssignMergeGroup={onAssignSessionMergeGroup}
          onCreateMergeGroup={onCreateRankingMergeGroup}
        />
      )}
    </div>
  )
}
