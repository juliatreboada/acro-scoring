'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Panel, Section, Session } from '@/components/admin/types'
import { ACRO_CATEGORIES, ROUTINE_TYPES } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    panels: 'Judging panels',
    panelsHint: 'Choose how many panels will judge this competition',
    panel: (n: number) => `${n} panel`,
    panels2: '2 panels',
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
    warningPanelChange: 'Changing to 1 panel will reassign all sessions to Panel 1.',
  },
  es: {
    panels: 'Paneles de jueces',
    panelsHint: 'Elige cuántos paneles juzgarán esta competición',
    panels2: '2 paneles',
    sections: 'Secciones',
    addSection: 'Añadir sección',
    sectionLabel: 'Etiqueta',
    sectionLabelPlaceholder: 'p.ej. Mañana, Tarde…',
    deleteSection: 'Eliminar sección',
    noSections: 'Sin secciones',
    noSectionsSub: 'Añade una sección para empezar a construir el programa.',
    addSession: 'Añadir sesión',
    noSessions: 'Sin sesiones en esta sección.',
    panelLabel: 'Panel',
    ageGroup: 'Grupo de edad',
    category: 'Categoría',
    routineType: 'Tipo de rutina',
    save: 'Añadir',
    cancel: 'Cancelar',
    deleteSession: 'Eliminar',
    sessionName: (ag: string, cat: string, rt: string) => `${ag} · ${cat} · ${rt}`,
    sectionN: (n: number) => `Sección ${n}`,
    panelBadge: (n: number) => `P${n}`,
    panelN: (n: number) => `Panel ${n}`,
    warningPanelChange: 'Cambiar a 1 panel reasignará todas las sesiones al Panel 1.',
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
  sectionId: string
  nextOrderIndex: number
  onAdd: (s: Omit<Session, 'id'>) => void
  onCancel: () => void
}

function AddSessionForm({ lang, panel, ageGroups, agLabels, sectionId, nextOrderIndex, onAdd, onCancel }: AddSessionFormProps) {
  const t = T[lang]
  const [ageGroup, setAgeGroup] = useState(ageGroups[0] ?? '')
  const [category, setCategory] = useState<string>(ACRO_CATEGORIES[0])
  const [routineType, setRoutineType] = useState<'Balance' | 'Dynamic' | 'Combined'>('Balance')

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
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={selectCls}>
            {ageGroups.map((ag) => <option key={ag} value={ag}>{agLabels[ag] ?? ag}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">{t.category}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            {ACRO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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

function PanelColumn({ lang, panel, sessions, ageGroups, agLabels, sectionId, onAddSession, onDeleteSession }: {
  lang: Lang
  panel: Panel
  sessions: Session[]
  ageGroups: string[]
  agLabels: Record<string, string>
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
  onUpdateLabel: (label: string) => void
  onDelete: () => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (id: string) => void
}

function SectionBlock({
  lang, section, sessions, panels, ageGroups, agLabels,
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
  panels: Panel[]
  sections: Section[]
  sessions: Session[]
  onSetPanelCount: (count: 1 | 2) => void
  onAddSection: () => void
  onUpdateSectionLabel: (sectionId: string, label: string) => void
  onDeleteSection: (sectionId: string) => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (sessionId: string) => void
}

export default function StructureTab({
  lang, competitionId, ageGroups, agLabels, panels, sections, sessions,
  onSetPanelCount, onAddSection, onUpdateSectionLabel, onDeleteSection,
  onAddSession, onDeleteSession,
}: StructureTabProps) {
  const t = T[lang]
  const panelCount = panels.length as 1 | 2

  function handlePanelCountChange(count: 1 | 2) {
    if (count === panelCount) return
    if (count === 1 && sessions.length > 0) {
      if (!confirm(t.warningPanelChange)) return
    }
    onSetPanelCount(count)
  }

  return (
    <div className="space-y-8">
      {/* ── panels ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-1">{t.panels}</h2>
        <p className="text-xs text-slate-400 mb-3">{t.panelsHint}</p>
        <div className="flex gap-3">
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              onClick={() => handlePanelCountChange(n)}
              className={[
                'flex-1 max-w-[160px] py-4 rounded-2xl border-2 text-sm font-semibold transition-all',
                panelCount === n
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300',
              ].join(' ')}
            >
              <span className="text-2xl font-bold block mb-1">{n}</span>
              {n === 1 ? t.panelN(1) : t.panels2}
            </button>
          ))}
        </div>
      </section>

      {/* ── sections ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">{t.sections}</h2>
          <button onClick={onAddSection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.addSection}
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-medium text-slate-500">{t.noSections}</p>
            <p className="text-xs text-slate-400 mt-1">{t.noSectionsSub}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...sections].sort((a, b) => a.section_number - b.section_number).map((sec) => (
              <SectionBlock
                key={sec.id}
                lang={lang}
                section={sec}
                sessions={sessions
                  .filter((s) => s.section_id === sec.id)
                  .sort((a, b) => a.order_index - b.order_index)}
                panels={panels}
                ageGroups={ageGroups}
                agLabels={agLabels}
                onUpdateLabel={(label) => onUpdateSectionLabel(sec.id, label)}
                onDelete={() => onDeleteSection(sec.id)}
                onAddSession={onAddSession}
                onDeleteSession={onDeleteSession}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
