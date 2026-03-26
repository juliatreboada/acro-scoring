'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Gymnast, Team } from '@/components/admin/types'
import { ACRO_CATEGORIES, CATEGORY_SIZE } from '@/components/admin/types'
import { gymnastFullName } from './GymnastsTab'

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
    ageGroups: ['Youth', 'Junior FIG', 'Senior FIG'],
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
    ageGroups: ['Youth', 'Junior FIG', 'Senior FIG'],
  },
}

// Build gymnast_display from selected gymnasts: "Fernández García / Ruiz López"
function buildDisplay(gymnasts: Gymnast[], ids: string[]): string {
  return ids
    .map((id) => gymnasts.find((g) => g.id === id))
    .filter(Boolean)
    .map((g) => [g!.last_name_1, g!.last_name_2].filter(Boolean).join(' '))
    .join(' / ')
}

type FormState = { category: string; age_group: string; gymnast_ids: string[] }
const EMPTY_FORM: FormState = { category: '', age_group: '', gymnast_ids: [] }

function TeamForm({
  lang, gymnasts, usedInOtherTeams, initial, onSave, onCancel,
}: {
  lang: Lang
  gymnasts: Gymnast[]
  usedInOtherTeams: Set<string>
  initial: FormState
  onSave: (f: FormState & { gymnast_display: string }) => void
  onCancel: () => void
}) {
  const t = T[lang]
  const [form, setForm] = useState<FormState>(initial)

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

  // when category changes, reset slots
  function setCategory(cat: string) {
    setForm((f) => ({ ...f, category: cat, gymnast_ids: [] }))
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
      {/* category */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t.category} *</label>
        <select required value={form.category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          <option value="">{t.selectCategory}</option>
          {ACRO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* age group */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t.ageGroup} *</label>
        <select required value={form.age_group} onChange={(e) => setForm((f) => ({ ...f, age_group: e.target.value }))} className={inputCls}>
          <option value="">{t.selectAgeGroup}</option>
          {t.ageGroups.map((ag) => <option key={ag} value={ag}>{ag}</option>)}
        </select>
      </div>

      {/* gymnast slots */}
      {slots.map((selectedId, idx) => {
        // available: not used in another team AND not selected in another slot
        const available = sortedGymnasts.filter((g) =>
          !usedInOtherTeams.has(g.id) &&
          !slots.some((s, j) => j !== idx && s === g.id)
        )
        return (
          <div key={idx}>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t.gymnast(idx + 1)} *</label>
            <select required value={selectedId} onChange={(e) => setSlot(idx, e.target.value)} className={inputCls}>
              <option value="">{t.selectGymnast}</option>
              {available.map((g) => (
                <option key={g.id} value={g.id}>{gymnastFullName(g)}</option>
              ))}
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
  lang, gymnasts, teams, onAdd, onUpdate, onDelete,
}: {
  lang: Lang
  gymnasts: Gymnast[]
  teams: Team[]
  onAdd: (f: FormState & { gymnast_display: string }) => void
  onUpdate: (id: string, f: FormState & { gymnast_display: string }) => void
  onDelete: (id: string) => void
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
          <TeamForm lang={lang} gymnasts={gymnasts} usedInOtherTeams={allUsed} initial={EMPTY_FORM}
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
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{category}</p>
              <div className="space-y-2">
                {catTeams.map((team) =>
                  editingId === team.id ? (
                    <TeamForm key={team.id} lang={lang} gymnasts={gymnasts}
                      usedInOtherTeams={usedExcluding(team.id)}
                      initial={{ category: team.category, age_group: team.age_group, gymnast_ids: team.gymnast_ids ?? [] }}
                      onCancel={() => setEditingId(null)}
                      onSave={(f) => { onUpdate(team.id, f); setEditingId(null) }} />
                  ) : (
                    <div key={team.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{team.gymnast_display}</p>
                        <p className="text-xs text-slate-400">{team.age_group}</p>
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
