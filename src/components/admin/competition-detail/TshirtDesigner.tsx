'use client'

import { useState, useMemo } from 'react'
import { useT } from '@/lib/useT'
import type { Lang } from '@/components/scoring/types'
import type {
  Competition, Gymnast, Coach, Judge, Club, CompetitionJudgeNomination,
  TshirtDesignConfig, TshirtElementConfig, TshirtSideConfig,
} from '@/components/admin/types'

// ─── canvas ────────────────────────────────────────────────────────────────────

const CANVAS_W = 250
const CANVAS_H = 290
// T-shirt silhouette in viewBox "0 0 200 232"
const SHIRT_PATH = 'M 72,4 C 65,2 56,6 50,14 L 2,48 L 34,63 L 34,45 C 34,37 38,33 48,33 L 48,228 L 152,228 L 152,33 C 162,33 166,37 166,45 L 166,63 L 198,48 L 150,14 C 144,6 135,2 128,4 L 116,18 C 110,30 105,36 100,36 C 95,36 90,30 84,18 Z'

// ─── types ─────────────────────────────────────────────────────────────────────

type ElementType = keyof TshirtSideConfig
type Side = 'front' | 'back'

const ALL_ELEMENTS: ElementType[] = [
  'competition_logo', 'competition_poster', 'event_name', 'event_dates',
  'club_logos', 'gymnast_names', 'coach_names', 'judge_names',
]
const TEXT_ELEMENTS = new Set<ElementType>(['event_name', 'event_dates', 'gymnast_names', 'coach_names', 'judge_names'])

// ─── defaults ──────────────────────────────────────────────────────────────────

function el(enabled: boolean, x: number, y: number, scale = 1.0, color = '#1e293b'): TshirtElementConfig {
  return { enabled, x, y, scale, color }
}

function defaultSide(front: boolean): TshirtSideConfig {
  return {
    competition_logo:   el(front,  50, 18, 0.9),
    competition_poster: el(false,  50, 50, 0.6),
    event_name:         el(front,  50, 32, 1.0),
    event_dates:        el(front,  50, 44, 0.85),
    club_logos:         el(!front, 50, 75, 0.7),
    gymnast_names:      el(!front, 50, 42, 0.7),
    coach_names:        el(!front, 50, 68, 0.65),
    judge_names:        el(!front, 50, 56, 0.65),
  }
}

const DEFAULT_CONFIG: TshirtDesignConfig = {
  shirt_color: '#ffffff',
  front: defaultSide(true),
  back:  defaultSide(false),
}

// ─── parse ─────────────────────────────────────────────────────────────────────

function parseEl(raw: unknown, def: TshirtElementConfig): TshirtElementConfig {
  if (!raw || typeof raw !== 'object') return { ...def }
  const r = raw as Record<string, unknown>
  return {
    enabled: typeof r.enabled === 'boolean' ? r.enabled : def.enabled,
    x:       typeof r.x       === 'number'  ? r.x       : def.x,
    y:       typeof r.y       === 'number'  ? r.y       : def.y,
    scale:   typeof r.scale   === 'number'  ? r.scale   : def.scale,
    color:   typeof r.color   === 'string'  ? r.color   : def.color,
  }
}

function parseSide(raw: unknown, def: TshirtSideConfig): TshirtSideConfig {
  if (!raw || typeof raw !== 'object') return { ...def }
  const r = raw as Record<string, unknown>
  return {
    competition_logo:   parseEl(r.competition_logo,   def.competition_logo),
    competition_poster: parseEl(r.competition_poster, def.competition_poster),
    event_name:         parseEl(r.event_name,         def.event_name),
    event_dates:        parseEl(r.event_dates,        def.event_dates),
    club_logos:         parseEl(r.club_logos,         def.club_logos),
    gymnast_names:      parseEl(r.gymnast_names,      def.gymnast_names),
    coach_names:        parseEl(r.coach_names,        def.coach_names),
    judge_names:        parseEl(r.judge_names,        def.judge_names),
  }
}

function parseConfig(raw: unknown): TshirtDesignConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_CONFIG, front: defaultSide(true), back: defaultSide(false) }
  const r = raw as Record<string, unknown>
  return {
    shirt_color: typeof r.shirt_color === 'string' ? r.shirt_color : DEFAULT_CONFIG.shirt_color,
    front: parseSide(r.front, DEFAULT_CONFIG.front),
    back:  parseSide(r.back,  DEFAULT_CONFIG.back),
  }
}

// ─── element preview renderer ──────────────────────────────────────────────────

function PreviewElement({ type, cfg, competition, clubs, gymnasts, coaches, judges, judgePool }: {
  type: ElementType; cfg: TshirtElementConfig
  competition: Competition; clubs: Club[]
  gymnasts: Gymnast[]; coaches: Coach[]; judges: Judge[]; judgePool: string[]
}) {
  const base = CANVAS_W * 0.052  // ≈ 13px base unit

  if (type === 'event_name') {
    return (
      <p style={{ color: cfg.color, fontSize: base * 1.1 * cfg.scale, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, maxWidth: CANVAS_W * 0.8, wordBreak: 'break-word' }}>
        {competition.name}
      </p>
    )
  }

  if (type === 'event_dates') {
    const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
    const start = fmt(competition.start_date ?? null)
    const end   = fmt(competition.end_date ?? null)
    const text  = !end || start === end ? start : `${start} – ${end}`
    return (
      <p style={{ color: cfg.color, fontSize: base * 0.85 * cfg.scale, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
        {text || '—'}
      </p>
    )
  }

  if (type === 'competition_logo') {
    const size = base * 4.5 * cfg.scale
    return competition.logo_url
      ? <img src={competition.logo_url} style={{ width: size, height: size, objectFit: 'contain' }} alt="" />
      : <Placeholder w={size} h={size} label="Logo" />
  }

  if (type === 'competition_poster') {
    const w = base * 4 * cfg.scale
    return competition.poster_url
      ? <img src={competition.poster_url} style={{ width: w, objectFit: 'contain', maxHeight: w * 1.4 }} alt="" />
      : <Placeholder w={w} h={w * 1.4} label="Póster" />
  }

  if (type === 'club_logos') {
    const logoSize = base * 2.2 * cfg.scale
    const gap = Math.round(logoSize * 0.15)
    const shown = clubs.slice(0, 10)
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap, justifyContent: 'center', maxWidth: CANVAS_W * 0.75 }}>
        {shown.map(c => c.avatar_url
          ? <img key={c.id} src={c.avatar_url} style={{ width: logoSize, height: logoSize, objectFit: 'contain' }} alt="" />
          : <div key={c.id} style={{ width: logoSize, height: logoSize, borderRadius: 3, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: logoSize * 0.35, fontWeight: 700, color: '#94a3b8' }}>{c.club_name.charAt(0)}</div>
        )}
      </div>
    )
  }

  const names = type === 'gymnast_names'
    ? gymnasts.slice(0, 20).map(g => `${g.first_name} ${g.last_name_1}${g.last_name_2 ? ' ' + g.last_name_2 : ''}`)
    : type === 'coach_names'
    ? coaches.slice(0, 20).map(c => c.full_name)
    : judges.filter(j => judgePool.includes(j.id)).slice(0, 20).map(j => j.full_name)

  const fs = base * 0.8 * cfg.scale
  const shown = names.slice(0, 10)
  return (
    <div style={{ textAlign: 'center', color: cfg.color }}>
      {shown.map((n, i) => <p key={i} style={{ fontSize: fs, lineHeight: 1.4, whiteSpace: 'nowrap' }}>{n}</p>)}
      {names.length > 10 && <p style={{ fontSize: fs * 0.85, color: '#94a3b8', lineHeight: 1.4 }}>+{names.length - 10}</p>}
    </div>
  )
}

function Placeholder({ w, h, label }: { w: number; h: number; label: string }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 4, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: w * 0.18, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
    </div>
  )
}

// ─── t-shirt canvas ────────────────────────────────────────────────────────────

function ShirtCanvas({ config, side, competition, clubs, gymnasts, coaches, judges, judgePool }: {
  config: TshirtDesignConfig; side: Side
  competition: Competition; clubs: Club[]
  gymnasts: Gymnast[]; coaches: Coach[]; judges: Judge[]; judgePool: string[]
}) {
  const sideConfig = config[side]
  const enabled = ALL_ELEMENTS.filter(t => sideConfig[t].enabled)

  return (
    <div style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative', flexShrink: 0 }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 200 232"
        preserveAspectRatio="none"
      >
        <path d={SHIRT_PATH} fill={config.shirt_color} stroke="#94a3b8" strokeWidth="1.5" />
      </svg>
      {enabled.map(type => {
        const cfg = sideConfig[type]
        return (
          <div key={type} style={{
            position: 'absolute',
            left: `${cfg.x}%`, top: `${cfg.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 1, maxWidth: '90%',
          }}>
            <PreviewElement
              type={type} cfg={cfg} competition={competition}
              clubs={clubs} gymnasts={gymnasts} coaches={coaches}
              judges={judges} judgePool={judgePool}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── slider row ────────────────────────────────────────────────────────────────

function SliderRow({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-medium text-slate-600 tabular-nums">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-slate-700 h-1.5 cursor-pointer" />
    </div>
  )
}

// ─── props ─────────────────────────────────────────────────────────────────────

type Props = {
  lang: Lang
  competition: Competition
  clubs: Club[]
  competitionGymnasts: Gymnast[]
  competitionCoaches: Coach[]
  globalJudges: Judge[]
  judgePool: string[]
  nominations: CompetitionJudgeNomination[]
  onUpdateDesign: (config: TshirtDesignConfig) => Promise<void>
}

// ─── main component ────────────────────────────────────────────────────────────

export default function TshirtDesigner({
  lang, competition, clubs, competitionGymnasts, competitionCoaches,
  globalJudges, judgePool, onUpdateDesign,
}: Props) {
  const t = useT('TshirtDesigner', lang)

  const [config, setConfig]   = useState<TshirtDesignConfig>(() => parseConfig(competition.tshirt_design_config))
  const [side, setSide]       = useState<Side>('front')
  const [expanded, setExpanded] = useState<ElementType | null>(null)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  const sideConfig = config[side]

  function setEl(type: ElementType, key: keyof TshirtElementConfig, value: unknown) {
    setConfig(prev => ({
      ...prev,
      [side]: { ...prev[side], [type]: { ...prev[side][type], [key]: value } },
    }))
  }

  function toggleEl(type: ElementType, enabled: boolean) {
    setEl(type, 'enabled', enabled)
    if (enabled) setExpanded(type)
    else if (expanded === type) setExpanded(null)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onUpdateDesign(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const elementLabel = (type: ElementType): string => (t as Record<string, string>)[type] ?? type

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-6">{t.title}</h3>

      <div className="flex flex-col xl:flex-row gap-8">

        {/* ── controls ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* side switcher + shirt color */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(['front', 'back'] as Side[]).map(s => (
                <button key={s} onClick={() => setSide(s)}
                  className={`px-4 py-1.5 text-xs font-semibold transition-colors ${side === s ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:text-slate-700'}`}>
                  {s === 'front' ? t.front : t.back}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={config.shirt_color}
                onChange={e => setConfig(prev => ({ ...prev, shirt_color: e.target.value }))}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5" />
              <span className="text-xs text-slate-500">{t.shirtColor}</span>
            </div>
          </div>

          {/* element list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.elements}</p>
            {ALL_ELEMENTS.map(type => {
              const cfg = sideConfig[type]
              const isText = TEXT_ELEMENTS.has(type)
              const isExpanded = expanded === type && cfg.enabled

              return (
                <div key={type} className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <input type="checkbox" checked={cfg.enabled} onChange={e => toggleEl(type, e.target.checked)}
                      className="w-4 h-4 rounded accent-slate-700 cursor-pointer shrink-0" />
                    <span className={`flex-1 text-sm ${cfg.enabled ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                      {elementLabel(type)}
                    </span>
                    {cfg.enabled && (
                      <button onClick={() => setExpanded(isExpanded ? null : type)}
                        className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0.5 space-y-2 bg-slate-50 border-t border-slate-100">
                      <SliderRow label="X" value={cfg.x} min={0} max={100} step={1} unit="" onChange={v => setEl(type, 'x', v)} />
                      <SliderRow label="Y" value={cfg.y} min={0} max={100} step={1} unit="" onChange={v => setEl(type, 'y', v)} />
                      <SliderRow label={t.scale} value={cfg.scale} min={0.3} max={2.0} step={0.05} unit="×" onChange={v => setEl(type, 'scale', v)} />
                      {isText && (
                        <div className="flex items-center gap-2 pt-1">
                          <input type="color" value={cfg.color} onChange={e => setEl(type, 'color', e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border border-slate-200 p-0.5" />
                          <span className="text-xs text-slate-500">{t.textColor}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* save */}
          <div className="flex justify-end pt-1">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors">
              {saved ? t.saved : saving ? '…' : t.save}
            </button>
          </div>
        </div>

        {/* ── preview ── */}
        <div className="flex flex-col items-center gap-3 xl:shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-start xl:self-center">
            {side === 'front' ? t.front : t.back}
          </span>
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <ShirtCanvas
              config={config} side={side}
              competition={competition} clubs={clubs}
              gymnasts={competitionGymnasts} coaches={competitionCoaches}
              judges={globalJudges} judgePool={judgePool}
            />
          </div>
          <p className="text-xs text-slate-400">{t.previewNote}</p>
        </div>

      </div>
    </div>
  )
}
