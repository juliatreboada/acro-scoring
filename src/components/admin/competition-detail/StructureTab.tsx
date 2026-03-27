'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Panel, Section, Session, AgeGroupRule } from '@/components/admin/types'
import { ACRO_CATEGORIES, ROUTINE_TYPES, categoriesForRuleset, CATEGORY_LABELS } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    sections: 'Sections',
    addSection: 'Add section',
    sectionLabel: 'Label',
    sectionLabelPlaceholder: 'e.g. Morning, Afternoon…',
    deleteSection: 'Delete section',
    noSections: 'No sections yet',
    noSectionsSub: 'Add a section to start building the schedule.',
    addSession: 'Add session',
    noSessions: 'No sessions in this section yet.',
    panelLabel: 'Panel',
    ageGroup: 'Age group',
    category: 'Category',
    routineType: 'Routine type',
    save: 'Add',
    cancel: 'Cancel',
    deleteSession: 'Remove',
    sessionName: (ag: string, cat: string, rt: string) => `${ag} · ${cat} · ${rt}`,
    sectionN: (n: number) => `Section ${n}`,
    panelBadge: (n: number) => `P${n}`,
    panelN: (n: number) => `Panel ${n}`,
  },
  es: {
    sections: 'Jornadas',
    addSection: 'Añadir jornada',
    sectionLabel: 'Etiqueta',
    sectionLabelPlaceholder: 'p.ej. Mañana, Tarde…',
    deleteSection: 'Eliminar jornada',
    noSections: 'Sin jornadas',
    noSectionsSub: 'Añade una joranada para empezar a construir el programa.',
    addSession: 'Añadir sesión',
    noSessions: 'Sin sesiones en esta jornada.',
    panelLabel: 'Panel',
    ageGroup: 'Grupo de edad',
    category: 'Categoría',
    routineType: 'Tipo de rutina',
    save: 'Añadir',
    cancel: 'Cancelar',
    deleteSession: 'Eliminar',
    sessionName: (ag: string, cat: string, rt: string) => `${ag} · ${cat} · ${rt}`,
    sectionN: (n: number) => `Jornada ${n}`,
    panelBadge: (n: number) => `P${n}`,
    panelN: (n: number) => `Panel ${n}`,
  },
}

// ─── panel colours ────────────────────────────────────────────────────────────

const PANEL_STYLES: Record<number, { badge: string; border: string }> = {
  1: { badge: 'bg-blue-100 text-blue-700',   border: 'border-l-blue-400' },
  2: { badge: 'bg-violet-100 text-violet-700', border: 'border-l-violet-400' },
}

// ─── add-session form ─────────────────────────────────────────────────────────

type AddSessionFormProps = {
  lang: Lang
  panel: Panel          // always pre-determined (from column or single-panel context)
  ageGroups: string[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  sectionId: string
  nextOrderIndex: number
  onAdd: (s: Omit<Session, 'id'>) => void
  onCancel: () => void
}

function AddSessionForm({ lang, panel, ageGroups, agLabels, ageGroupRules, sectionId, nextOrderIndex, onAdd, onCancel }: AddSessionFormProps) {
  const t = T[lang]

  function getCategoriesForAgeGroup(ageGroupId: string): string[] {
    const rule = ageGroupRules.find(r => r.id === ageGroupId)
    if (!rule) return [...ACRO_CATEGORIES]
    return categoriesForRuleset(rule.ruleset)
  }

  const initialAgeGroup = ageGroups[0] ?? ''
  const initialCategories = getCategoriesForAgeGroup(initialAgeGroup)

  const [ageGroup, setAgeGroupState] = useState(initialAgeGroup)
  const [availableCategories, setAvailableCategories] = useState<string[]>(initialCategories)
  const [category, setCategory] = useState<string>(initialCategories[0] ?? ACRO_CATEGORIES[0])
  const [routineType, setRoutineType] = useState<'Balance' | 'Dynamic' | 'Combined'>('Balance')

  function handleAgeGroupChange(ag: string) {
    const cats = getCategoriesForAgeGroup(ag)
    setAgeGroupState(ag)
    setAvailableCategories(cats)
    setCategory(cats[0] ?? '')
  }

  function handleAdd() {
    if (!ageGroup) return
    onAdd({
      competition_id: panel.competition_id,
      panel_id: panel.id,
      section_id: sectionId,
      name: t.sessionName(agLabels[ageGroup] ?? ageGroup, category, routineType),
      age_group: agLabels[ageGroup] ?? ageGroup,
      category,
      routine_type: routineType,
      status: 'waiting',
      order_index: nextOrderIndex,
    })
  }

  const selectCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
      <div className="space-y-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">{t.ageGroup}</label>
          <select value={ageGroup} onChange={(e) => handleAgeGroupChange(e.target.value)} className={selectCls}>
            {ageGroups.map((ag) => <option key={ag} value={ag}>{agLabels[ag] ?? ag}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">{t.category}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[lang]?.[c] ?? c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">{t.routineType}</label>
          <select value={routineType} onChange={(e) => setRoutineType(e.target.value as typeof routineType)} className={selectCls}>
            {ROUTINE_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
          {t.cancel}
        </button>
        <button onClick={handleAdd} disabled={!ageGroup}
          className="flex-1 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all">
          {t.save}
        </button>
      </div>
    </div>
  )
}

// ─── session row ──────────────────────────────────────────────────────────────

function SessionRow({ session, borderStyle, onDelete, lang }: {
  session: Session
  borderStyle: string
  onDelete: () => void
  lang: Lang
}) {
  const t = T[lang]
  return (
    <div className={['flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200 rounded-xl border-l-4', borderStyle].join(' ')}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 leading-snug">{session.name}</p>
      </div>
      <button onClick={onDelete}
        className="shrink-0 text-xs text-slate-300 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all">
        {t.deleteSession}
      </button>
    </div>
  )
}

// ─── panel column ─────────────────────────────────────────────────────────────

function PanelColumn({ lang, panel, sessions, ageGroups, agLabels, ageGroupRules, sectionId, onAddSession, onDeleteSession }: {
  lang: Lang
  panel: Panel
  sessions: Session[]
  ageGroups: string[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  sectionId: string
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (id: string) => void
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
        />
      ))}

      {/* add form */}
      {showForm ? (
        <AddSessionForm
          lang={lang}
          panel={panel}
          ageGroups={ageGroups}
          agLabels={agLabels}
          ageGroupRules={ageGroupRules}
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

type SectionBlockProps = {
  lang: Lang
  section: Section
  sessions: Session[]
  panels: Panel[]
  ageGroups: string[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  onUpdateLabel: (label: string) => void
  onDelete: () => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (id: string) => void
}

function SectionBlock({
  lang, section, sessions, panels, ageGroups, agLabels, ageGroupRules,
  onUpdateLabel, onDelete, onAddSession, onDeleteSession,
}: SectionBlockProps) {
  const t = T[lang]
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState(section.label ?? '')
  const twoPanel = panels.length === 2

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

      {/* sessions — 2-column when 2 panels, single column otherwise */}
      <div className="p-4">
        {twoPanel ? (
          <div className="grid grid-cols-2 gap-4">
            {panels.sort((a, b) => a.panel_number - b.panel_number).map((panel) => (
              <PanelColumn
                key={panel.id}
                lang={lang}
                panel={panel}
                sessions={sessions.filter((s) => s.panel_id === panel.id)}
                ageGroups={ageGroups}
                agLabels={agLabels}
                ageGroupRules={ageGroupRules}
                sectionId={section.id}
                onAddSession={onAddSession}
                onDeleteSession={onDeleteSession}
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
              />
            ))}
            {showForm ? (
              <AddSessionForm
                lang={lang}
                panel={panels[0]}
                ageGroups={ageGroups}
                agLabels={agLabels}
                ageGroupRules={ageGroupRules}
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
  ageGroups: string[]          // age group IDs enabled for this competition
  agLabels: Record<string, string>  // UUID → display label
  ageGroupRules: AgeGroupRule[]
  panels: Panel[]
  sections: Section[]
  sessions: Session[]
  onAddSection: () => void
  onUpdateSectionLabel: (sectionId: string, label: string) => void
  onDeleteSection: (sectionId: string) => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (sessionId: string) => void
}

export default function StructureTab({
  lang, competitionId, ageGroups, agLabels, ageGroupRules, panels, sections, sessions,
  onAddSection, onUpdateSectionLabel, onDeleteSection,
  onAddSession, onDeleteSession,
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
          panels={panels}
          ageGroups={ageGroups}
          agLabels={agLabels}
          ageGroupRules={ageGroupRules}
          onUpdateLabel={(label) => onUpdateSectionLabel(activeSection.id, label)}
          onDelete={() => handleDelete(activeSection)}
          onAddSession={onAddSession}
          onDeleteSession={onDeleteSession}
        />
      )}
    </div>
  )
}
