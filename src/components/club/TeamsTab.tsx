'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Gymnast, Team, AgeGroupRule } from '@/components/admin/types'
import { CATEGORY_SIZE, categoriesForRuleset, CATEGORY_LABELS } from '@/components/admin/types'
import { gymnastFullName, PhotoAvatar } from './GymnastsTab'

const T = {
  en: {
    addTeam: 'Add team',
    category: 'Category',
    ageGroup: 'Age group',
    gymnast: (n: number) => `Gymnast ${n}`,
    save: 'Save',
    cancel: 'Cancel',
    empty: 'No teams yet.',
    noGymnasts: 'Add at least 2 gymnasts to your roster before creating a team.',
    confirmDelete: 'Remove this team?',
    selectCategory: 'Select category',
    selectAgeGroup: 'Select age group',
    selectGymnast: '— select gymnast —',
  },
  es: {
    addTeam: 'Añadir equipo',
    category: 'Categoría',
    ageGroup: 'Grupo de edad',
    gymnast: (n: number) => `Gimnasta ${n}`,
    save: 'Guardar',
    cancel: 'Cancelar',
    empty: 'Aún no hay equipos.',
    noGymnasts: 'Añade al menos 2 gimnastas antes de crear un equipo.',
    confirmDelete: '¿Eliminar este equipo?',
    selectCategory: 'Seleccionar categoría',
    selectAgeGroup: 'Seleccionar grupo de edad',
    selectGymnast: '— seleccionar gimnasta —',
  },
}

// Uses birth year only (not exact date) so birthday month doesn't affect eligibility
function birthYear(g: Gymnast): number {
  return parseInt(g.date_of_birth.slice(0, 4), 10)
}

function gymAgeThisYear(g: Gymnast): number {
  return new Date().getFullYear() - birthYear(g)
}

function ageRangeStr(rule: AgeGroupRule): string {
  return rule.max_age != null ? `${rule.min_age}–${rule.max_age}` : `${rule.min_age}+`
}

// Build gymnast_display from selected gymnasts: "Fernández García / Ruiz López"
function buildDisplay(gymnasts: Gymnast[], ids: string[]): string {
  return ids
    .map((id) => gymnasts.find((g) => g.id === id))
    .filter(Boolean)
    .map((g) => [g!.first_name, g!.last_name_1].filter(Boolean).join(' '))
    .join(' / ')
}

type FormState = { category: string; age_group: string; gymnast_ids: string[] }
const EMPTY_FORM: FormState = { category: '', age_group: '', gymnast_ids: [] }

function TeamForm({
  lang, gymnasts, ageGroupRules, agLabels, usedInOtherTeams, initial, onSave, onCancel,
}: {
  lang: Lang
  gymnasts: Gymnast[]
  ageGroupRules: AgeGroupRule[]
  agLabels: Record<string, string>
  usedInOtherTeams: Set<string>
  initial: FormState
  onSave: (f: FormState & { gymnast_display: string }) => void
  onCancel: () => void
}) {
  const t = T[lang]

  function getCategoriesForAgeGroup(ageGroupId: string): string[] {
    if (!ageGroupId) return []   // hide category until age group is chosen
    const rule = ageGroupRules.find(r => r.id === ageGroupId)
    if (!rule) return []
    return categoriesForRuleset(rule.age_group)
  }

  const [form, setForm] = useState<FormState>(() => {
    const cats = getCategoriesForAgeGroup(initial.age_group)
    const cat = initial.category && cats.includes(initial.category) ? initial.category : ''
    return { ...initial, category: cat }
  })

  const availableCategories = getCategoriesForAgeGroup(form.age_group)
  const slotCount = form.category ? (CATEGORY_SIZE[form.category] ?? 2) : 2
  // ensure gymnast_ids array has exactly slotCount entries (pad with '' or trim)
  const slots: string[] = Array.from({ length: slotCount }, (_, i) => form.gymnast_ids[i] ?? '')

  function setSlot(idx: number, value: string) {
    setForm((f) => {
      const next = Array.from({ length: slotCount }, (_, i) => f.gymnast_ids[i] ?? '') as string[]
      next[idx] = value
      return { ...f, gymnast_ids: next }
    })
  }

  // when age group changes, recompute available categories and reset category + slots
  function setAgeGroup(ageGroupId: string) {
    setForm((f) => ({ ...f, age_group: ageGroupId, category: '', gymnast_ids: [] }))
  }

  // when category changes, reset slots
  function setCategory(cat: string) {
    setForm((f) => ({ ...f, category: cat, gymnast_ids: [] }))
  }

  // Age validation: get the selected rule's min/max age
  const selectedRule = ageGroupRules.find(r => r.id === form.age_group)

  function isAgeEligible(g: Gymnast): boolean {
    if (!selectedRule) return true
    // Year-based only: birth year determines eligibility, birthday month is irrelevant
    const age = new Date().getFullYear() - birthYear(g)
    if (age < selectedRule.min_age) return false
    if (selectedRule.max_age !== null && age > selectedRule.max_age) return false
    return true
  }

  const isComplete = form.category && form.age_group && slots.every((s) => s !== '')

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  const sortedGymnasts = [...gymnasts].sort((a, b) => (a.last_name_1 ?? '').localeCompare(b.last_name_1 ?? ''))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isComplete) return
    onSave({ ...form, gymnast_ids: slots, gymnast_display: buildDisplay(gymnasts, slots) })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      {/* age group */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t.ageGroup} *</label>
        <select required value={form.age_group} onChange={(e) => setAgeGroup(e.target.value)} className={inputCls}>
          <option value="">{t.selectAgeGroup}</option>
          {ageGroupRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {agLabels[rule.id] ?? rule.age_group} ({ageRangeStr(rule)})
            </option>
          ))}
        </select>
      </div>

      {/* category — only shown after age group is chosen */}
      {form.age_group && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.category} *</label>
          <select required value={form.category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            <option value="">{t.selectCategory}</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[lang]?.[c] ?? c}</option>
            ))}
          </select>
        </div>
      )}

      {/* gymnast slots — only shown after category is chosen */}
      {form.age_group && form.category && slots.map((selectedId, idx) => {
        // show all gymnasts not used elsewhere / not in another slot; disable ineligible by age
        const candidates = sortedGymnasts.filter((g) =>
          !usedInOtherTeams.has(g.id) &&
          !slots.some((s, j) => j !== idx && s === g.id)
        )
        return (
          <div key={idx}>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t.gymnast(idx + 1)} *</label>
            <select required value={selectedId} onChange={(e) => setSlot(idx, e.target.value)} className={inputCls}>
              <option value="">{t.selectGymnast}</option>
              {candidates.map((g) => {
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
  lang, gymnasts, teams, ageGroupRules, agLabels, onAdd, onUpdate, onDelete, onUploadPhoto,
}: {
  lang: Lang
  gymnasts: Gymnast[]
  teams: Team[]
  ageGroupRules: AgeGroupRule[]
  agLabels: Record<string, string>
  onAdd: (f: FormState & { gymnast_display: string }) => void
  onUpdate: (id: string, f: FormState & { gymnast_display: string }) => void
  onDelete: (id: string) => void
  onUploadPhoto: (id: string, file: File) => Promise<void>
}) {
  const t = T[lang]
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (gymnasts.length < 2 && teams.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">{t.noGymnasts}</p>
  }

  // gymnasts used in any existing team
  const allUsed = new Set(teams.flatMap((t) => t.gymnast_ids ?? []))
  // gymnasts used in teams other than the one being edited
  function usedExcluding(teamId: string | null) {
    return new Set(teams.filter((t) => t.id !== teamId).flatMap((t) => t.gymnast_ids ?? []))
  }

  const grouped = teams.reduce<Record<string, Team[]>>((acc, team) => {
    ;(acc[team.category] ??= []).push(team)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">{teams.length} team{teams.length !== 1 ? 's' : ''}</p>
        {!showAdd && !editingId && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all">
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
            usedInOtherTeams={allUsed} initial={EMPTY_FORM}
            onCancel={() => setShowAdd(false)}
            onSave={(f) => { onAdd(f); setShowAdd(false) }} />
        </div>
      )}

      {teams.length === 0 && !showAdd ? (
        <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catTeams]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                {CATEGORY_LABELS[lang]?.[category] ?? category}
              </p>
              <div className="space-y-2">
                {catTeams.map((team) =>
                  editingId === team.id ? (
                    <TeamForm key={team.id} lang={lang} gymnasts={gymnasts}
                      ageGroupRules={ageGroupRules} agLabels={agLabels}
                      usedInOtherTeams={usedExcluding(team.id)}
                      initial={{ category: team.category, age_group: team.age_group, gymnast_ids: team.gymnast_ids ?? [] }}
                      onCancel={() => setEditingId(null)}
                      onSave={(f) => { onUpdate(team.id, f); setEditingId(null) }} />
                  ) : (
                    <div key={team.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
                      <PhotoAvatar
                        photoUrl={team.photo_url}
                        initials={team.gymnast_display.charAt(0)}
                        size="md"
                        onUpload={(file) => onUploadPhoto(team.id, file)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{team.gymnast_display}</p>
                        <p className="text-xs text-slate-400">
                          {agLabels[team.age_group] ?? team.age_group} · {CATEGORY_LABELS[lang]?.[team.category] ?? team.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditingId(team.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button onClick={() => { if (confirm(t.confirmDelete)) onDelete(team.id) }}
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
    </div>
  )
}
