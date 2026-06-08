'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Gymnast, Team, AgeGroupRule, Apparatus, ApparatusRule } from '@/components/admin/types'
import { CATEGORY_SIZE, categoriesForRuleset, CATEGORY_LABELS } from '@/components/admin/types'
import { gymnastFullName, PhotoAvatar } from './GymnastsTab'
import { useT } from '@/lib/useT'

function birthYear(g: Gymnast): number {
  return parseInt(g.date_of_birth.slice(0, 4), 10)
}

function gymAgeThisYear(g: Gymnast): number {
  return new Date().getFullYear() - birthYear(g)
}

function ageRangeStr(rule: AgeGroupRule): string {
  return rule.max_age != null ? `${rule.min_age}–${rule.max_age}` : `${rule.min_age}+`
}

function buildDisplay(gymnasts: Gymnast[], ids: string[]): string {
  return ids
    .map((id) => gymnasts.find((g) => g.id === id))
    .filter(Boolean)
    .map((g) => [g!.first_name, g!.last_name_1].filter(Boolean).join(' '))
    .join(' / ')
}

function apparatusName(app: Apparatus, lang: Lang): string {
  return lang === 'es' && app.name_es ? app.name_es : app.name
}

type FormState = {
  sport_type: 'acro' | 'rg'
  category: string
  age_group: string
  gymnast_ids: string[]
  apparatus_ids: string[]
  group_size: number
}

const EMPTY_FORM: FormState = {
  sport_type: 'acro', category: '', age_group: '', gymnast_ids: [], apparatus_ids: [], group_size: 5,
}

type SaveData = Omit<Team, 'id' | 'club_id' | 'photo_url'>

function TeamForm({
  lang, gymnasts, ageGroupRules, agLabels, apparatus, apparatusRules, usedInOtherTeams, initial, onSave, onCancel,
}: {
  lang: Lang
  gymnasts: Gymnast[]
  ageGroupRules: AgeGroupRule[]
  agLabels: Record<string, string>
  apparatus: Apparatus[]
  apparatusRules: ApparatusRule[]
  usedInOtherTeams: Set<string>
  initial: FormState
  onSave: (data: SaveData) => void
  onCancel: () => void
}) {
  const t = useT('TeamsTab', lang)
  const isEditing = initial !== EMPTY_FORM

  const [form, setForm] = useState<FormState>(() => {
    if (initial.sport_type === 'acro') {
      const acroRules = ageGroupRules.filter(r => r.sport_type !== 'rg')
      const rule = acroRules.find(r => r.id === initial.age_group)
      const cats = rule ? categoriesForRuleset(rule.level) : []
      const cat = initial.category && cats.includes(initial.category) ? initial.category : ''
      return { ...initial, category: cat }
    }
    return {
      ...initial,
      group_size: initial.gymnast_ids.length > 1 ? initial.gymnast_ids.length : initial.group_size,
    }
  })

  const acroRules = ageGroupRules.filter(r => r.sport_type !== 'rg')
  const rgRules   = ageGroupRules.filter(r => r.sport_type === 'rg')

  // ── Acro helpers ──────────────────────────────────────────────────────────────

  function acroCategories(ageGroupId: string): string[] {
    if (!ageGroupId) return []
    const rule = acroRules.find(r => r.id === ageGroupId)
    return rule ? categoriesForRuleset(rule.level) : []
  }

  const availableAcroCategories = acroCategories(form.age_group)
  const acroSlotCount = form.category ? (CATEGORY_SIZE[form.category] ?? 2) : 2
  const acroSlots: string[] = Array.from({ length: acroSlotCount }, (_, i) => form.gymnast_ids[i] ?? '')

  // ── RG helpers ────────────────────────────────────────────────────────────────

  const rgApparatusRules = apparatusRules.filter(r => r.age_group_rule_id === form.age_group)
  const rgSlotCount = form.category === 'Individual' ? 1 : form.group_size
  const rgSlots: string[] = Array.from({ length: rgSlotCount }, (_, i) => form.gymnast_ids[i] ?? '')

  // ── shared helpers ────────────────────────────────────────────────────────────

  const selectedRule = ageGroupRules.find(r => r.id === form.age_group)

  function isAgeEligible(g: Gymnast): boolean {
    if (!selectedRule) return true
    const age = new Date().getFullYear() - birthYear(g)
    if (age < selectedRule.min_age) return false
    if (selectedRule.max_age !== null && age > selectedRule.max_age) return false
    return true
  }

  function setSportType(st: 'acro' | 'rg') {
    setForm({ ...EMPTY_FORM, sport_type: st })
  }

  function setAgeGroup(ageGroupId: string) {
    setForm(f => ({ ...f, age_group: ageGroupId, category: '', gymnast_ids: [], apparatus_ids: [] }))
  }

  function setCategory(cat: string) {
    setForm(f => ({ ...f, category: cat, gymnast_ids: [] }))
  }

  function setSlot(idx: number, value: string, slots: string[], slotCount: number) {
    setForm(f => {
      const next = Array.from({ length: slotCount }, (_, i) => f.gymnast_ids[i] ?? '') as string[]
      next[idx] = value
      return { ...f, gymnast_ids: next }
    })
  }

  function toggleApparatus(id: string) {
    setForm(f => ({
      ...f,
      apparatus_ids: f.apparatus_ids.includes(id)
        ? f.apparatus_ids.filter(a => a !== id)
        : [...f.apparatus_ids, id],
    }))
  }

  const sortedGymnasts = [...gymnasts].sort((a, b) => (a.last_name_1 ?? '').localeCompare(b.last_name_1 ?? ''))

  // ── validation ────────────────────────────────────────────────────────────────

  const slots = form.sport_type === 'acro' ? acroSlots : rgSlots
  const isComplete = form.sport_type === 'acro'
    ? !!(form.category && form.age_group && acroSlots.every(s => s !== ''))
    : !!(form.age_group && form.category && form.apparatus_ids.length > 0 && rgSlots.every(s => s !== ''))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isComplete) return
    onSave({
      sport_type:      form.sport_type,
      category:        form.category,
      age_group:       form.age_group,
      gymnast_ids:     slots,
      apparatus_ids:   form.apparatus_ids,
      gymnast_display: buildDisplay(gymnasts, slots),
    })
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  function GymnastSlots({ theSlots, slotCount }: { theSlots: string[]; slotCount: number }) {
    return (
      <>
        {theSlots.map((selectedId, idx) => {
          const candidates = sortedGymnasts.filter(g =>
            !usedInOtherTeams.has(g.id) && !theSlots.some((s, j) => j !== idx && s === g.id)
          )
          return (
            <div key={idx}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t.gymnast(idx + 1)} *</label>
              <select required value={selectedId}
                onChange={(e) => setSlot(idx, e.target.value, theSlots, slotCount)}
                className={inputCls}>
                <option value="">{t.selectGymnast}</option>
                {candidates.map(g => {
                  const eligible = isAgeEligible(g)
                  return (
                    <option key={g.id} value={g.id} disabled={!eligible}>
                      {gymnastFullName(g)} ({gymAgeThisYear(g)}){!eligible ? ' ✕' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">

      {/* sport type toggle — disabled when editing */}
      {!isEditing && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.sportType}</label>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
            {(['acro', 'rg'] as const).map(st => (
              <button key={st} type="button" onClick={() => setSportType(st)}
                className={[
                  'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
                  form.sport_type === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}>
                {t[st]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* age group */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t.ageGroup} *</label>
        <select required value={form.age_group} onChange={e => setAgeGroup(e.target.value)} className={inputCls}>
          <option value="">{t.selectAgeGroup}</option>
          {(form.sport_type === 'acro' ? acroRules : rgRules).map(rule => (
            <option key={rule.id} value={rule.id}>
              {agLabels[rule.id] ?? rule.age_group} ({ageRangeStr(rule)})
            </option>
          ))}
        </select>
      </div>

      {/* ── ACRO-specific fields ─────────────────────────────────────────────── */}
      {form.sport_type === 'acro' && form.age_group && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.category} *</label>
          <select required value={form.category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            <option value="">{t.selectCategory}</option>
            {availableAcroCategories.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[lang]?.[c] ?? c}</option>
            ))}
          </select>
        </div>
      )}

      {form.sport_type === 'acro' && form.age_group && form.category && (
        <GymnastSlots theSlots={acroSlots} slotCount={acroSlotCount} />
      )}

      {/* ── RG-specific fields ───────────────────────────────────────────────── */}
      {form.sport_type === 'rg' && form.age_group && rgApparatusRules.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.apparatus} *</label>
          <div className="flex flex-wrap gap-2">
            {rgApparatusRules.map(rule => {
              const app = apparatus.find(a => a.id === rule.apparatus_id)
              if (!app) return null
              const checked = form.apparatus_ids.includes(app.id)
              return (
                <button key={app.id} type="button" onClick={() => toggleApparatus(app.id)}
                  className={[
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                    checked
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300',
                  ].join(' ')}>
                  {apparatusName(app, lang)}
                  {rule.is_mandatory && <span className="ml-1 text-xs opacity-70">*</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {form.sport_type === 'rg' && form.age_group && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.category} *</label>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
            {(['Individual', 'Group'] as const).map(cat => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={[
                  'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
                  form.category === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}>
                {cat === 'Individual' ? t.individual : t.group}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.sport_type === 'rg' && form.category === 'Group' && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.groupSize} *</label>
          <select value={form.group_size}
            onChange={e => setForm(f => ({ ...f, group_size: Number(e.target.value), gymnast_ids: [] }))}
            className={inputCls}>
            {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}

      {form.sport_type === 'rg' && form.age_group && form.category && (
        <GymnastSlots theSlots={rgSlots} slotCount={rgSlotCount} />
      )}

      {/* actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
          {t.cancel}
        </button>
        <button type="submit" disabled={!isComplete}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {t.save}
        </button>
      </div>
    </form>
  )
}

export default function TeamsTab({
  lang, gymnasts, teams, ageGroupRules, agLabels, apparatus, apparatusRules, onAdd, onUpdate, onArchive, onRestore, onUploadPhoto, onRemovePhoto,
}: {
  lang: Lang
  gymnasts: Gymnast[]
  teams: Team[]
  ageGroupRules: AgeGroupRule[]
  agLabels: Record<string, string>
  apparatus: Apparatus[]
  apparatusRules: ApparatusRule[]
  onAdd: (data: SaveData) => void
  onUpdate: (id: string, data: SaveData) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onUploadPhoto: (id: string, file: File) => Promise<void>
  onRemovePhoto: (id: string) => Promise<void>
}) {
  const t = useT('TeamsTab', lang)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const activeTeams = teams.filter((tm) => !tm.archived_at)
  const archivedTeams = teams.filter((tm) => !!tm.archived_at)

  if (gymnasts.length < 2 && activeTeams.length === 0 && archivedTeams.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">{t.noGymnasts}</p>
  }

  const groupedActive = activeTeams.reduce<Record<string, Team[]>>((acc, team) => {
    ;(acc[team.category] ??= []).push(team)
    return acc
  }, {})

  const allUsed = new Set(teams.flatMap(tm => tm.gymnast_ids ?? []))
  function usedExcluding(teamId: string | null) {
    return new Set(teams.filter(tm => tm.id !== teamId).flatMap(tm => tm.gymnast_ids ?? []))
  }

  function initialForTeam(team: Team): FormState {
    return {
      sport_type:    (team.sport_type ?? 'acro') as 'acro' | 'rg',
      category:      team.category,
      age_group:     team.age_group,
      gymnast_ids:   team.gymnast_ids ?? [],
      apparatus_ids: team.apparatus_ids ?? [],
      group_size:    team.gymnast_ids && team.gymnast_ids.length > 1 ? team.gymnast_ids.length : 5,
    }
  }

  function teamApparatusLabel(team: Team): string {
    const ids = team.apparatus_ids ?? []
    if (!ids.length) return ''
    return ids
      .map(id => apparatus.find(a => a.id === id))
      .filter(Boolean)
      .map(a => apparatusName(a!, lang))
      .join(', ')
  }

  const grouped = teams.reduce<Record<string, Team[]>>((acc, team) => {
    const key = team.category
    ;(acc[key] ??= []).push(team)
    return acc
  }, {})

  function renderTeamRow(team: Team, options: { archived: boolean }) {
    const { archived } = options
    return editingId === team.id ? (
      <TeamForm
        key={team.id}
        lang={lang}
        gymnasts={gymnasts}
        ageGroupRules={ageGroupRules}
        agLabels={agLabels}
        apparatus={apparatus}
        apparatusRules={apparatusRules}
        usedInOtherTeams={usedExcluding(team.id)}
        initial={initialForTeam(team)}
        onCancel={() => setEditingId(null)}
        onSave={(f) => {
          onUpdate(team.id, f)
          setEditingId(null)
        }}
      />
    ) : (
      <div
        key={team.id}
        className={[
          'flex items-center gap-3 rounded-2xl px-4 py-3 border',
          archived ? 'bg-slate-50 border-slate-200 opacity-90' : 'bg-white border-slate-200',
        ].join(' ')}
      >
        <PhotoAvatar
          photoUrl={team.photo_url}
          initials={team.gymnast_display.charAt(0)}
          size="md"
          onUpload={(file) => onUploadPhoto(team.id, file)}
          onRemove={() => onRemovePhoto(team.id)}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{team.gymnast_display}</p>
          <p className="text-xs text-slate-400">
            {agLabels[team.age_group] ?? team.age_group} · {CATEGORY_LABELS[lang]?.[team.category] ?? team.category}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!archived && (
            <button
              type="button"
              onClick={() => setEditingId(team.id)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
          )}
          {archived ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(t.confirmRestore)) onRestore(team.id)
              }}
              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
            >
              {t.restore}
            </button>
          ) : (
            <button
              type="button"
              title={t.confirmArchive}
              onClick={() => {
                if (confirm(t.confirmArchive)) onArchive(team.id)
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">
          {activeTeams.length} active{archivedTeams.length > 0 ? ` · ${archivedTeams.length} archived` : ''}
        </p>
        <p className="text-sm text-slate-500">{teams.length} equipo{teams.length !== 1 ? 's' : ''}</p>
        {!showAdd && !editingId && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.addTeam}
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-4">
          <TeamForm lang={lang} gymnasts={gymnasts} ageGroupRules={ageGroupRules} agLabels={agLabels}
            apparatus={apparatus} apparatusRules={apparatusRules}
            usedInOtherTeams={allUsed} initial={EMPTY_FORM}
            onCancel={() => setShowAdd(false)}
            onSave={data => { onAdd(data); setShowAdd(false) }} />
        </div>
      )}

      {activeTeams.length === 0 && !showAdd ? (
        <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActive).map(([category, catTeams]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                {CATEGORY_LABELS[lang]?.[category] ?? category}
              </p>
              <div className="space-y-2">
                {catTeams.map(team =>
                  editingId === team.id ? (
                    <TeamForm key={team.id} lang={lang} gymnasts={gymnasts}
                      ageGroupRules={ageGroupRules} agLabels={agLabels}
                      apparatus={apparatus} apparatusRules={apparatusRules}
                      usedInOtherTeams={usedExcluding(team.id)}
                      initial={initialForTeam(team)}
                      onCancel={() => setEditingId(null)}
                      onSave={data => { onUpdate(team.id, data); setEditingId(null) }} />
                  ) : (
                    <div key={team.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
                      <PhotoAvatar
                        photoUrl={team.photo_url}
                        initials={team.gymnast_display.charAt(0)}
                        size="md"
                        onUpload={file => onUploadPhoto(team.id, file)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{team.gymnast_display}</p>
                        <p className="text-xs text-slate-400">
                          {agLabels[team.age_group] ?? team.age_group}
                          {' · '}
                          {CATEGORY_LABELS[lang]?.[team.category] ?? team.category}
                          {team.sport_type === 'rg' && teamApparatusLabel(team) && (
                            <> · {teamApparatusLabel(team)}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditingId(team.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button onClick={() => { if (confirm(t.confirmDelete)) onArchive(team.id) }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {archivedTeams.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{t.archivedSection}</p>
          <div className="space-y-2">{archivedTeams.map((team) => renderTeamRow(team, { archived: true }))}</div>
        </div>
      )}
    </div>
  )
}
