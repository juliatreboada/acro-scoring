'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Judge, Panel, Section, SectionPanelJudge, Role, Club, CompetitionJudgeNomination } from '@/components/admin/types'
import { ROLE_CONFIG } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    pool: 'Competition judges',
    poolHint: 'Add judges from the global pool who will attend this competition.',
    addJudge: 'Add judge',
    newJudge: 'New judge',
    noPool: 'No judges added yet.',
    removeFromPool: 'Remove',
    assignments: 'Role assignments',
    assignmentsHint: 'Assign judges to each role per section and panel. Assignments can differ between sections.',
    unassigned: 'Unassigned',
    selectJudge: 'Select judge…',
    sectionN: (n: number) => `Section ${n}`,
    panelN: (n: number) => `Panel ${n}`,
    noSections: 'No sections defined yet. Go to Structure to add sections.',
    warningRemove: 'This judge is assigned to one or more roles. Remove anyway?',
    fieldName: 'Full name',
    fieldEmail: 'Email',
    fieldPhone: 'Phone (optional)',
    fieldLicence: 'Licence',
    cancel: 'Cancel',
    create: 'Create & add',
  },
  es: {
    pool: 'Jueces de la competición',
    poolHint: 'Añade jueces del pool global que asistirán a esta competición.',
    addJudge: 'Añadir juez',
    newJudge: 'Nuevo juez',
    noPool: 'Sin jueces añadidos.',
    removeFromPool: 'Quitar',
    assignments: 'Asignación de roles',
    assignmentsHint: 'Asigna jueces a cada rol por sección y panel. Las asignaciones pueden cambiar entre secciones.',
    unassigned: 'Sin asignar',
    selectJudge: 'Seleccionar juez…',
    sectionN: (n: number) => `Sección ${n}`,
    panelN: (n: number) => `Panel ${n}`,
    noSections: 'Sin secciones definidas. Ve a Estructura para añadir secciones.',
    warningRemove: 'Este juez tiene roles asignados. ¿Quitar igualmente?',
    fieldName: 'Nombre completo',
    fieldEmail: 'Email',
    fieldPhone: 'Teléfono (opcional)',
    fieldLicence: 'Licencia',
    cancel: 'Cancelar',
    create: 'Crear y añadir',
  },
}

const ROLE_ORDER: Role[] = ['CJP', 'DJ', 'EJ', 'AJ']

const PANEL_HEADER: Record<number, string> = {
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-violet-50 text-violet-700 border-violet-200',
}

// ─── avatar ───────────────────────────────────────────────────────────────────

function Avatar({ judge, size = 'md' }: { judge: Judge; size?: 'sm' | 'md' }) {
  const initials = judge.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
  return judge.avatar_url ? (
    <img src={judge.avatar_url} alt={judge.full_name} className={[sz, 'rounded-full object-cover'].join(' ')} />
  ) : (
    <div className={[sz, 'rounded-full bg-slate-200 text-slate-600 font-semibold flex items-center justify-center shrink-0'].join(' ')}>
      {initials}
    </div>
  )
}

// ─── judge pool ───────────────────────────────────────────────────────────────

const EMPTY_FORM = { full_name: '', email: '', phone: '', licence: '' }

function JudgePool({ lang, judges, globalJudges, assignments, nominations, clubs, onAdd, onRemove, onCreateJudge }: {
  lang: Lang
  judges: Judge[]
  globalJudges: Judge[]
  assignments: SectionPanelJudge[]
  nominations: CompetitionJudgeNomination[]
  clubs: Club[]
  onAdd: (judgeId: string) => void
  onRemove: (judgeId: string) => void
  onCreateJudge?: (data: Omit<Judge, 'id' | 'avatar_url'>) => void
}) {
  const t = T[lang]
  const [showPicker, setShowPicker] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const poolIds = new Set(judges.map((j) => j.id))
  const available = globalJudges.filter((j) => !poolIds.has(j.id))
  const clubById = Object.fromEntries(clubs.map((c) => [c.id, c]))

  function handleRemove(judgeId: string) {
    const isAssigned = assignments.some((a) => a.judge_id === judgeId)
    if (isAssigned && !confirm(t.warningRemove)) return
    onRemove(judgeId)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) return
    onCreateJudge?.({ full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim() || null, licence: form.licence.trim() || null })
    setForm(EMPTY_FORM)
    setShowCreateForm(false)
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">{t.pool}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.poolHint}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onCreateJudge && (
            <button onClick={() => { setShowCreateForm((v) => !v); setShowPicker(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              {t.newJudge}
            </button>
          )}
          {available.length > 0 && (
            <div className="relative">
              <button onClick={() => { setShowPicker((v) => !v); setShowCreateForm(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t.addJudge}
              </button>

              {showPicker && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {available.map((j) => (
                    <button key={j.id} onClick={() => { onAdd(j.id); setShowPicker(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left">
                      <Avatar judge={j} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{j.full_name}</p>
                        {j.email && <p className="text-xs text-slate-400 truncate">{j.email}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.fieldName} *</label>
              <input
                type="text" required value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.fieldEmail} *</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.fieldLicence} *</label>
              <input
                type="text" required value={form.licence}
                onChange={(e) => setForm((f) => ({ ...f, licence: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">{t.fieldPhone}</label>
              <input
                type="text" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => { setShowCreateForm(false); setForm(EMPTY_FORM) }}
              className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all">
              {t.cancel}
            </button>
            <button type="submit"
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all">
              {t.create}
            </button>
          </div>
        </form>
      )}

      {judges.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-xl">
          {t.noPool}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {judges.map((j) => {
            const nom = nominations.find((n) => n.judge_id === j.id)
            const nominatingClub = nom?.club_id ? clubById[nom.club_id] : null
            return (
              <div key={j.id} className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-slate-200 rounded-xl">
                <Avatar judge={j} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 leading-tight">{j.full_name}</p>
                  {nominatingClub ? (
                    <p className="text-xs text-slate-400 leading-tight">{nominatingClub.club_name}</p>
                  ) : (
                    <p className="text-xs text-blue-400 leading-tight">admin</p>
                  )}
                </div>
                <button onClick={() => handleRemove(j.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors ml-1 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ─── role group ───────────────────────────────────────────────────────────────

function RoleGroup({ role, slots, poolJudges, onAssign, onAddSlot, onRemoveSlot, lang }: {
  role: Role
  slots: SectionPanelJudge[]
  poolJudges: Judge[]
  onAssign: (slotId: string, judgeId: string | null) => void
  onAddSlot: () => void
  onRemoveSlot: () => void
  lang: Lang
}) {
  const t = T[lang]
  const cfg = ROLE_CONFIG[role]
  const canAdd = slots.length < cfg.max
  const canRemove = slots.length > cfg.min

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{role}</span>
        <div className="flex items-center gap-1">
          {canRemove && (
            <button onClick={onRemoveSlot}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-bold">
              −
            </button>
          )}
          {canAdd && (
            <button onClick={onAddSlot}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-xs font-bold">
              +
            </button>
          )}
        </div>
      </div>

      {slots.map((slot) => {
        const assigned = poolJudges.find((j) => j.id === slot.judge_id)
        return (
          <div key={slot.id} className="flex items-center gap-2">
            {assigned
              ? <Avatar judge={assigned} size="sm" />
              : <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 shrink-0" />
            }
            <select
              value={slot.judge_id ?? ''}
              onChange={(e) => onAssign(slot.id, e.target.value || null)}
              className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.selectJudge}</option>
              {poolJudges.map((j) => (
                <option key={j.id} value={j.id}>{j.full_name}</option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}

// ─── panel assignment column ──────────────────────────────────────────────────

function PanelAssignmentColumn({ lang, panel, section, slots, poolJudges, onAssign, onAddSlot, onRemoveSlot }: {
  lang: Lang
  panel: Panel
  section: Section
  slots: SectionPanelJudge[]
  poolJudges: Judge[]
  onAssign: (slotId: string, judgeId: string | null) => void
  onAddSlot: (role: Role) => void
  onRemoveSlot: (role: Role) => void
}) {
  const t = T[lang]
  const headerCls = PANEL_HEADER[panel.panel_number] ?? PANEL_HEADER[1]

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className={['px-4 py-2 text-xs font-bold border-b', headerCls].join(' ')}>
        {t.panelN(panel.panel_number)}
      </div>
      <div className="p-4 space-y-4">
        {ROLE_ORDER.map((role) => {
          const roleSlots = slots
            .filter((s) => s.role === role)
            .sort((a, b) => a.role_number - b.role_number)
          return (
            <RoleGroup
              key={role}
              role={role}
              slots={roleSlots}
              poolJudges={poolJudges}
              onAssign={onAssign}
              onAddSlot={() => onAddSlot(role)}
              onRemoveSlot={() => onRemoveSlot(role)}
              lang={lang}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── section assignment block ─────────────────────────────────────────────────

function SectionAssignmentBlock({ lang, section, panels, slots, poolJudges, onAssign, onAddSlot, onRemoveSlot }: {
  lang: Lang
  section: Section
  panels: Panel[]
  slots: SectionPanelJudge[]
  poolJudges: Judge[]
  onAssign: (slotId: string, judgeId: string | null) => void
  onAddSlot: (sectionId: string, panelId: string, role: Role) => void
  onRemoveSlot: (sectionId: string, panelId: string, role: Role) => void
}) {
  const t = T[lang]
  const label = section.label ? `${t.sectionN(section.section_number)} · ${section.label}` : t.sectionN(section.section_number)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-600">{label}</h3>
      <div className={['grid gap-4', panels.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm'].join(' ')}>
        {[...panels].sort((a, b) => a.panel_number - b.panel_number).map((panel) => (
          <PanelAssignmentColumn
            key={panel.id}
            lang={lang}
            panel={panel}
            section={section}
            slots={slots.filter((s) => s.panel_id === panel.id)}
            poolJudges={poolJudges}
            onAssign={onAssign}
            onAddSlot={(role) => onAddSlot(section.id, panel.id, role)}
            onRemoveSlot={(role) => onRemoveSlot(section.id, panel.id, role)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export type JudgesTabProps = {
  lang: Lang
  globalJudges: Judge[]
  judgePool: string[]             // judge IDs in this competition's pool
  nominations: CompetitionJudgeNomination[]
  clubs: Club[]
  assignments: SectionPanelJudge[]
  sections: Section[]
  panels: Panel[]
  onAddToPool: (judgeId: string) => void
  onRemoveFromPool: (judgeId: string) => void
  onAssignJudge: (slotId: string, judgeId: string | null) => void
  onAddSlot: (sectionId: string, panelId: string, role: Role) => void
  onRemoveSlot: (sectionId: string, panelId: string, role: Role) => void
  onCreateJudge?: (data: Omit<Judge, 'id' | 'avatar_url'>) => void
}

export default function JudgesTab({
  lang, globalJudges, judgePool, nominations, clubs, assignments, sections, panels,
  onAddToPool, onRemoveFromPool, onAssignJudge, onAddSlot, onRemoveSlot, onCreateJudge,
}: JudgesTabProps) {
  const t = T[lang]
  const poolJudges = globalJudges.filter((j) => judgePool.includes(j.id))
  const sortedSections = [...sections].sort((a, b) => a.section_number - b.section_number)
  const [activeSectionId, setActiveSectionId] = useState<string>(sortedSections[0]?.id ?? '')

  const activeSection = sortedSections.find((s) => s.id === activeSectionId) ?? sortedSections[0]

  function tabLabel(sec: Section) {
    return sec.label ?? t.sectionN(sec.section_number)
  }

  return (
    <div className="space-y-10">
      <JudgePool
        lang={lang}
        judges={poolJudges}
        globalJudges={globalJudges}
        assignments={assignments}
        nominations={nominations}
        clubs={clubs}
        onAdd={onAddToPool}
        onRemove={onRemoveFromPool}
        onCreateJudge={onCreateJudge}
      />

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-1">{t.assignments}</h2>
        <p className="text-xs text-slate-400 mb-4">{t.assignmentsHint}</p>

        {sortedSections.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-xl">
            {t.noSections}
          </p>
        ) : (
          <>
            {/* section tabs */}
            <div className="flex border-b border-slate-200 mb-6 gap-0">
              {sortedSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={[
                    'px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
                    activeSectionId === sec.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600',
                  ].join(' ')}
                >
                  {tabLabel(sec)}
                </button>
              ))}
            </div>

            {/* active section */}
            {activeSection && (
              <SectionAssignmentBlock
                lang={lang}
                section={activeSection}
                panels={panels}
                slots={assignments.filter((a) => a.section_id === activeSection.id)}
                poolJudges={poolJudges}
                onAssign={onAssignJudge}
                onAddSlot={onAddSlot}
                onRemoveSlot={onRemoveSlot}
              />
            )}
          </>
        )}
      </section>
    </div>
  )
}
