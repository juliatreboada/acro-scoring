'use client'

import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { useT } from '@/lib/useT'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, AccreditationConfig, Gymnast, Coach, Judge, Club, CompetitionJudgeNomination } from '@/components/admin/types'

type StaffMember = { id: string; name: string; photo_url: string | null }

// ─── constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: AccreditationConfig = {
  gymnast_color: '#3b82f6',
  coach_color: '#10b981',
  judge_color: '#f59e0b',
  staff_color: '#8b5cf6',
  show_logo: true,
  show_competition_name: true,
  header_height: 22,
  photo_size: 43,
  photo_x: 50,
  name_size: 1.0,
  club_size: 1.0,
  badge_size: 1.0,
  text_x: 50,
  text_bg_opacity: 0,
  bg_image_url: null,
  bg_image_opacity: 100,
}

// Preview card dimensions (pixels)
const CARD_W = 248
const CARD_H = Math.round(CARD_W * 148 / 105)  // ≈ 350px

// Thumbnail dimensions for the grid below
const THUMB_W     = 105
const THUMB_H     = Math.round(CARD_H * THUMB_W / CARD_W)  // ≈ 148
const THUMB_SCALE = THUMB_W / CARD_W

const SAMPLE_PERSON = {
  id: '__sample__', name: 'Ana García Rodríguez', initials: 'AG',
  club_name: 'Club Acrobático', club_logo_url: null, photo_url: null, type: 'gymnast' as const,
}
const SAMPLE_STAFF: Person = {
  id: '__sample_staff__', name: 'Carlos Martínez', initials: 'CM',
  club_name: '', club_logo_url: null, photo_url: null, type: 'staff',
}

// ─── types ────────────────────────────────────────────────────────────────────

type Person = {
  id: string; name: string; initials: string
  club_name: string; club_logo_url: string | null; photo_url: string | null
  type: 'gymnast' | 'coach' | 'judge' | 'staff'
}

type Props = {
  lang: Lang
  competition: Competition
  competitionGymnasts: Gymnast[]
  competitionCoaches: Coach[]
  globalJudges: Judge[]
  judgePool: string[]
  nominations: CompetitionJudgeNomination[]
  clubs: Club[]
  onUpdateConfig: (config: AccreditationConfig) => Promise<void>
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function parseConfig(raw: unknown): AccreditationConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_CONFIG }
  const r = raw as Record<string, unknown>
  return {
    gymnast_color:        typeof r.gymnast_color        === 'string'  ? r.gymnast_color        : DEFAULT_CONFIG.gymnast_color,
    coach_color:          typeof r.coach_color          === 'string'  ? r.coach_color          : DEFAULT_CONFIG.coach_color,
    judge_color:          typeof r.judge_color          === 'string'  ? r.judge_color          : DEFAULT_CONFIG.judge_color,
    staff_color:          typeof r.staff_color          === 'string'  ? r.staff_color          : DEFAULT_CONFIG.staff_color,
    show_logo:            typeof r.show_logo            === 'boolean' ? r.show_logo            : DEFAULT_CONFIG.show_logo,
    show_competition_name:typeof r.show_competition_name=== 'boolean' ? r.show_competition_name: DEFAULT_CONFIG.show_competition_name,
    header_height:        typeof r.header_height        === 'number'  ? r.header_height        : DEFAULT_CONFIG.header_height,
    photo_size:           typeof r.photo_size           === 'number'  ? r.photo_size           : DEFAULT_CONFIG.photo_size,
    photo_x:              typeof r.photo_x              === 'number'  ? r.photo_x              : DEFAULT_CONFIG.photo_x,
    name_size:            typeof r.name_size            === 'number'  ? r.name_size            : DEFAULT_CONFIG.name_size,
    club_size:            typeof r.club_size            === 'number'  ? r.club_size            : DEFAULT_CONFIG.club_size,
    badge_size:           typeof r.badge_size           === 'number'  ? r.badge_size           : DEFAULT_CONFIG.badge_size,
    text_x:               typeof r.text_x               === 'number'  ? r.text_x               : DEFAULT_CONFIG.text_x,
    text_bg_opacity:      typeof r.text_bg_opacity      === 'number'  ? r.text_bg_opacity      : DEFAULT_CONFIG.text_bg_opacity,
    bg_image_url:         typeof r.bg_image_url         === 'string'  ? r.bg_image_url         : DEFAULT_CONFIG.bg_image_url,
    bg_image_opacity:     typeof r.bg_image_opacity     === 'number'  ? r.bg_image_opacity     : DEFAULT_CONFIG.bg_image_opacity,
  }
}

function colorForType(type: Person['type'], config: AccreditationConfig): string {
  if (type === 'gymnast') return config.gymnast_color
  if (type === 'coach')   return config.coach_color
  if (type === 'staff')   return config.staff_color
  return config.judge_color
}

// ─── card preview (pixel-based, for screen) ───────────────────────────────────

function CardPreview({ person, config, competition, typeLabel }: {
  person: Person; config: AccreditationConfig; competition: Competition; typeLabel: string
}) {
  const color     = colorForType(person.type, config)
  const headerH   = Math.round(CARD_H * config.header_height / 100)
  const photoD    = Math.round(CARD_W * config.photo_size / 100)
  const bodyH     = CARD_H - headerH
  const nameFont  = Math.round(CARD_W * 0.075 * config.name_size)
  const clubFont  = Math.round(CARD_W * 0.058 * config.club_size)
  const badgeFont = Math.round(CARD_W * 0.052 * config.badge_size)
  const logoSize  = Math.round(headerH * 0.62)
  const topPad    = Math.round(bodyH * 0.04)
  const botPad    = Math.round(bodyH * 0.05)

  // Horizontal positioning
  const bodyInnerW = CARD_W - 20  // 10px padding each side
  const photoML    = Math.round((bodyInnerW - photoD) * config.photo_x / 100)
  const textTA: 'left' | 'center' | 'right' =
    config.text_x <= 25 ? 'left' : config.text_x >= 75 ? 'right' : 'center'
  const textJustify = textTA === 'left' ? 'flex-start' : textTA === 'right' ? 'flex-end' : 'center'
  const textSelf    = textTA === 'left' ? 'flex-start' : textTA === 'right' ? 'flex-end' : 'center'

  // Text background (for legibility over bg image)
  const textBgStyle = config.text_bg_opacity > 0 ? {
    background: `rgba(255,255,255,${(config.text_bg_opacity / 100).toFixed(2)})`,
    borderRadius: 6,
    padding: `${Math.round(bodyH * 0.01) + 2}px ${Math.round(CARD_W * 0.03)}px`,
  } : {}

  return (
    <div style={{
      width: CARD_W, height: CARD_H, display: 'flex', flexDirection: 'column',
      borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0',
      background: 'white', position: 'relative', flexShrink: 0,
    }}>
      {/* background image layer — separate so opacity doesn't affect content */}
      {config.bg_image_url && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `url(${config.bg_image_url}) center/cover no-repeat`,
          opacity: config.bg_image_opacity / 100,
          zIndex: 0,
        }} />
      )}
      {/* header */}
      <div style={{
        height: headerH, background: color, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '4px 10px', overflow: 'hidden',
        position: 'relative', zIndex: 1,
      }}>
        {config.show_logo && competition.logo_url && (
          <img src={competition.logo_url} style={{ height: logoSize, width: logoSize, objectFit: 'contain', flexShrink: 0 }} alt="" />
        )}
        {config.show_competition_name && (
          <span style={{
            color: 'white', fontWeight: 700,
            fontSize: Math.max(9, Math.round(CARD_W * 0.062)),
            textAlign: 'center', lineHeight: 1.2,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {competition.name}
          </span>
        )}
      </div>
      {/* body */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        padding: `${topPad}px 10px 0`, position: 'relative', zIndex: 1,
      }}>
        {/* photo */}
        <div style={{
          width: photoD, height: photoD, borderRadius: '50%', overflow: 'hidden',
          border: '2px solid #e2e8f0', flexShrink: 0,
          background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: photoML,
        }}>
          {person.photo_url ? (
            <img src={person.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          ) : (
            <span style={{ fontSize: Math.round(photoD * 0.3), fontWeight: 700, color: '#94a3b8' }}>
              {person.initials}
            </span>
          )}
        </div>
        {/* name + club (grouped for text background) */}
        <div style={{
          marginTop: Math.round(bodyH * 0.04), alignSelf: textSelf,
          display: 'flex', flexDirection: 'column', alignItems: textJustify,
          maxWidth: '100%', ...textBgStyle,
        }}>
          <p style={{
            fontSize: nameFont, fontWeight: 700, textAlign: textTA,
            color: '#1e293b', lineHeight: 1.2, wordBreak: 'break-word',
          }}>
            {person.name}
          </p>
          {person.type !== 'judge' && person.type !== 'staff' && (person.club_name || person.club_logo_url) && (
            <div style={{
              marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: textJustify,
              gap: Math.round(clubFont * 0.4), flexWrap: 'wrap',
            }}>
              {person.club_logo_url && (
                <img src={person.club_logo_url} style={{
                  height: Math.round(clubFont * 1.5), width: Math.round(clubFont * 1.5),
                  objectFit: 'contain', flexShrink: 0,
                }} alt="" />
              )}
              {person.club_name && (
                <span style={{ fontSize: clubFont, color: '#64748b', lineHeight: 1.2, textAlign: textTA }}>
                  {person.club_name}
                </span>
              )}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        {/* badge */}
        <div style={{
          marginBottom: botPad, alignSelf: textSelf,
          padding: `${Math.round(botPad * 0.35)}px ${Math.round(CARD_W * 0.08)}px`,
          borderRadius: 99, background: color, color: 'white',
          fontWeight: 700, fontSize: badgeFont,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {typeLabel}
        </div>
      </div>
    </div>
  )
}

// ─── slider row ───────────────────────────────────────────────────────────────

function SliderRow({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-medium text-slate-700 tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-slate-700 h-1.5 cursor-pointer"
      />
    </div>
  )
}

// ─── section header ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{label}</p>
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AccreditationsTab({
  lang, competition, competitionGymnasts, competitionCoaches,
  globalJudges, judgePool, nominations, clubs, onUpdateConfig,
}: Props) {
  const t = useT('AccreditationsTab', lang)
  const supabase = createClient()
  const bgInputRef = useRef<HTMLInputElement>(null)

  const [config, setConfig]             = useState<AccreditationConfig>(() => parseConfig(competition.accreditation_config))
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [previewType, setPreviewType]   = useState<Person['type']>('gymnast')
  const [showGymnasts, setShowGymnasts] = useState(true)
  const [showCoaches, setShowCoaches]   = useState(true)
  const [showJudges, setShowJudges]     = useState(true)
  const [showStaff, setShowStaff]       = useState(true)
  const [photoFilter, setPhotoFilter]   = useState<'all' | 'with' | 'without'>('all')
  const [searchQuery, setSearchQuery]   = useState('')
  const [excludedIds, setExcludedIds]   = useState<Set<string>>(new Set())

  // staff management
  const [staffList, setStaffList]           = useState<StaffMember[]>([])
  const [staffName, setStaffName]           = useState('')
  const [addingStaff, setAddingStaff]       = useState(false)
  const [uploadingStaffId, setUploadingStaffId] = useState<string | null>(null)
  const staffPhotoRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    supabase.from('competition_staff')
      .select('id,name,photo_url')
      .eq('competition_id', competition.id)
      .order('created_at')
      .then(({ data }) => { if (data) setStaffList(data as StaffMember[]) })
  }, [competition.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddStaff() {
    const name = staffName.trim()
    if (!name) return
    setAddingStaff(true)
    try {
      const { data } = await supabase.from('competition_staff')
        .insert({ competition_id: competition.id, name })
        .select('id,name,photo_url').single()
      if (data) setStaffList(prev => [...prev, data as StaffMember])
      setStaffName('')
    } finally { setAddingStaff(false) }
  }

  async function handleDeleteStaff(id: string) {
    await supabase.from('competition_staff').delete().eq('id', id)
    setStaffList(prev => prev.filter(s => s.id !== id))
  }

  async function handleStaffPhotoUpload(staffId: string, file: File) {
    setUploadingStaffId(staffId)
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${competition.id}/staff/${staffId}.${ext}`
      await supabase.storage.from('competition-posters').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('competition-posters').getPublicUrl(path)
      const url = data.publicUrl + `?t=${Date.now()}`
      await supabase.from('competition_staff').update({ photo_url: url }).eq('id', staffId)
      setStaffList(prev => prev.map(s => s.id === staffId ? { ...s, photo_url: url } : s))
    } finally { setUploadingStaffId(null) }
  }

  function toggleExclude(key: string) {
    setExcludedIds(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const clubMap     = useMemo(() => Object.fromEntries(clubs.map(c => [c.id, c.club_name])),    [clubs])
  const clubLogoMap = useMemo(() => Object.fromEntries(clubs.map(c => [c.id, c.avatar_url])), [clubs])
  const judgeClubMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const n of nominations) { if (n.judge_id && n.club_id) map[n.judge_id] = n.club_id }
    return map
  }, [nominations])

  const allPersons = useMemo<Person[]>(() => {
    const result: Person[] = []
    for (const g of competitionGymnasts) {
      const name = `${g.first_name} ${g.last_name_1}${g.last_name_2 ? ' ' + g.last_name_2 : ''}`
      result.push({ id: g.id, name, initials: initials(name), club_name: clubMap[g.club_id] ?? '', club_logo_url: clubLogoMap[g.club_id] ?? null, photo_url: g.photo_url, type: 'gymnast' })
    }
    for (const c of competitionCoaches) {
      result.push({ id: c.id, name: c.full_name, initials: initials(c.full_name), club_name: clubMap[c.club_id] ?? '', club_logo_url: clubLogoMap[c.club_id] ?? null, photo_url: c.photo_url, type: 'coach' })
    }
    for (const j of globalJudges.filter(j => judgePool.includes(j.id))) {
      const clubId = judgeClubMap[j.id]
      result.push({ id: j.id, name: j.full_name, initials: initials(j.full_name), club_name: clubId ? (clubMap[clubId] ?? '') : '', club_logo_url: null, photo_url: j.avatar_url, type: 'judge' })
    }
    for (const s of staffList) {
      result.push({ id: s.id, name: s.name, initials: initials(s.name), club_name: '', club_logo_url: null, photo_url: s.photo_url, type: 'staff' })
    }
    return result
  }, [competitionGymnasts, competitionCoaches, globalJudges, judgePool, clubMap, clubLogoMap, judgeClubMap, staffList])

  const printPersons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return allPersons.filter(p => {
      if (p.type === 'gymnast' && !showGymnasts) return false
      if (p.type === 'coach'   && !showCoaches)  return false
      if (p.type === 'judge'   && !showJudges)   return false
      if (p.type === 'staff'   && !showStaff)    return false
      if (photoFilter === 'with'    && !p.photo_url) return false
      if (photoFilter === 'without' &&  p.photo_url) return false
      if (q) {
        const name = p.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        const club = p.club_name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        if (!name.includes(q) && !club.includes(q)) return false
      }
      return true
    })
  }, [allPersons, showGymnasts, showCoaches, showJudges, showStaff, photoFilter, searchQuery])

  // pick a preview person: first of the selected type, or sample
  const previewPerson: Person = useMemo(() => {
    if (previewType === 'staff') return staffList.length > 0
      ? allPersons.find(p => p.type === 'staff') ?? SAMPLE_STAFF
      : SAMPLE_STAFF
    return allPersons.find(p => p.type === previewType) ?? SAMPLE_PERSON
  }, [allPersons, previewType, staffList])

  function labelFor(type: Person['type']): string {
    if (type === 'gymnast') return t.typeGymnast
    if (type === 'coach')   return t.typeCoach
    if (type === 'staff')   return t.typeStaff
    return t.typeJudge
  }

  function set<K extends keyof AccreditationConfig>(key: K, value: AccreditationConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onUpdateConfig(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${competition.id}/accreditation-bg.${ext}`
      await supabase.storage.from('competition-posters').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('competition-posters').getPublicUrl(path)
      set('bg_image_url', data.publicUrl + `?t=${Date.now()}`)
    } finally {
      setUploading(false)
      if (bgInputRef.current) bgInputRef.current.value = ''
    }
  }

  const handlePrint = useCallback(() => {
    const headerMM   = (148  * config.header_height / 100).toFixed(1)
    const photoMM    = (105  * config.photo_size    / 100).toFixed(1)
    const nameMM     = (105  * 0.075 * config.name_size).toFixed(2)
    const clubMM     = (105  * 0.058 * config.club_size).toFixed(2)
    const badgeMM    = (105  * 0.052 * config.badge_size).toFixed(2)
    const cnameMM    = Math.max(2.1, 105 * 0.062).toFixed(2)
    const clubLogoMM = (105  * 0.058 * 1.5 * config.club_size).toFixed(2)
    const bgOpacity  = (config.bg_image_opacity / 100).toFixed(2)
    // Positioning (body inner width = 105 - 2×3mm padding = 99mm)
    const bodyInnerMM = 99
    const photoML_mm  = ((bodyInnerMM - Number(photoMM)) * config.photo_x / 100).toFixed(1)
    const textTA      = config.text_x <= 25 ? 'left' : config.text_x >= 75 ? 'right' : 'center'
    const textJustify = textTA === 'left' ? 'flex-start' : textTA === 'right' ? 'flex-end' : 'center'
    const textBgCss   = config.text_bg_opacity > 0
      ? `background:rgba(255,255,255,${(config.text_bg_opacity/100).toFixed(2)});border-radius:2mm;padding:1mm 2mm;`
      : ''

    function cardHtml(p: Person): string {
      const color = colorForType(p.type, config)
      const typeLabel = ({ gymnast: t.typeGymnast, coach: t.typeCoach, judge: t.typeJudge, staff: t.typeStaff }[p.type] ?? p.type).toUpperCase()
      const photoHtml = p.photo_url
        ? `<img src="${p.photo_url}" alt="" onerror="this.style.display='none';this.nextSibling.style.display='flex'" /><div class="ini" style="display:none">${p.initials}</div>`
        : `<div class="ini">${p.initials}</div>`
      const hdrParts: string[] = []
      if (config.show_logo && competition.logo_url) hdrParts.push(`<img class="logo" src="${competition.logo_url}" alt="" />`)
      if (config.show_competition_name) hdrParts.push(`<span class="cname">${competition.name}</span>`)
      const showClub = p.type !== 'judge' && p.type !== 'staff'
      const clubLogoHtml = showClub && p.club_logo_url ? `<img class="club-logo" src="${p.club_logo_url}" alt="" />` : ''
      const clubHtml = showClub && (p.club_name || clubLogoHtml)
        ? `<div class="club">${clubLogoHtml}${p.club_name ? `<span>${p.club_name}</span>` : ''}</div>`
        : ''
      return `<div class="card">
  ${config.bg_image_url ? '<div class="bg-layer"></div>' : ''}
  <div class="hdr" style="background:${color}">${hdrParts.join('')}</div>
  <div class="body">
    <div class="photo">${photoHtml}</div>
    <div class="text-block"><div class="name">${p.name}</div>${clubHtml}</div>
    <div class="gap"></div>
    <div class="badge" style="background:${color}">${typeLabel}</div>
  </div>
</div>`
    }

    const all = [...printPersons.filter(p => !excludedIds.has(`${p.type}-${p.id}`))]
    while (all.length % 4 !== 0) all.push({ id: `__pad_${all.length}`, name: '', initials: '', club_name: '', club_logo_url: null, photo_url: null, type: 'gymnast' as const })

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;print-color-adjust:exact;-webkit-print-color-adjust:exact}
@page{size:A4 portrait;margin:0}
body{width:210mm;font-family:Arial,Helvetica,sans-serif}
.grid{display:grid;grid-template-columns:105mm 105mm}
.card{width:105mm;height:148mm;display:flex;flex-direction:column;overflow:hidden;break-inside:avoid;border:0.3mm dashed #bbb;position:relative;background:white}
.bg-layer{position:absolute;inset:0;background:url('${config.bg_image_url}') center/cover no-repeat;opacity:${bgOpacity};pointer-events:none}
.hdr{width:100%;height:${headerMM}mm;display:flex;align-items:center;justify-content:center;gap:3mm;padding:2mm 4mm;flex-shrink:0;position:relative;z-index:1}
.logo{height:${(Number(headerMM)*0.62).toFixed(1)}mm;width:${(Number(headerMM)*0.62).toFixed(1)}mm;object-fit:contain;flex-shrink:0}
.cname{color:white;font-size:${cnameMM}mm;font-weight:bold;text-align:center;line-height:1.3;max-width:55mm}
.body{flex:1;display:flex;flex-direction:column;align-items:flex-start;padding:3mm 3mm 0;position:relative;z-index:1}
.photo{width:${photoMM}mm;height:${photoMM}mm;border-radius:50%;overflow:hidden;border:0.5mm solid #e2e8f0;flex-shrink:0;background:#f1f5f9;display:flex;align-items:center;justify-content:center;margin-left:${photoML_mm}mm}
.photo img{width:100%;height:100%;object-fit:cover;display:block}
.ini{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${(Number(photoMM)*0.3).toFixed(1)}mm;font-weight:bold;color:#94a3b8}
.text-block{margin-top:2mm;align-self:${textTA === 'left' ? 'flex-start' : textTA === 'right' ? 'flex-end' : 'center'};display:flex;flex-direction:column;align-items:${textJustify};max-width:90%;${textBgCss}}
.name{font-size:${nameMM}mm;font-weight:bold;text-align:${textTA};color:#1e293b;line-height:1.2}
.club{margin-top:0.5mm;font-size:${clubMM}mm;text-align:${textTA};color:#64748b;display:flex;align-items:center;justify-content:${textJustify};gap:1mm}
.club-logo{height:${clubLogoMM}mm;width:${clubLogoMM}mm;object-fit:contain;flex-shrink:0}
.gap{flex:1}
.badge{margin-bottom:3mm;padding:1mm 4mm;border-radius:20mm;color:white;font-size:${badgeMM}mm;font-weight:bold;letter-spacing:.05em;align-self:${textTA === 'left' ? 'flex-start' : textTA === 'right' ? 'flex-end' : 'center'}}
</style></head><body>
<div class="grid">
${all.map(p => p.name ? cardHtml(p) : '<div class="card"></div>').join('\n')}
</div>
<script>window.onload=function(){window.print();setTimeout(function(){window.close()},300)}</script>
</body></html>`

    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(html)
    win.document.close()
  }, [config, competition, printPersons, t])

  const previewTypes: { type: Person['type']; label: string }[] = [
    { type: 'gymnast', label: t.typeGymnast },
    { type: 'coach',   label: t.typeCoach   },
    { type: 'judge',   label: t.typeJudge   },
    { type: 'staff',   label: t.typeStaff   },
  ]

  return (
    <div className="space-y-6">

      {/* ── editor ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-6">{t.config}</h3>

        <div className="flex flex-col xl:flex-row gap-8">

          {/* controls */}
          <div className="flex-1 space-y-6 min-w-0">

            {/* colors */}
            <div>
              <SectionLabel label={t.colors} />
              <div className="grid grid-cols-4 gap-4">
                {([
                  { key: 'gymnast_color' as const, label: t.colorGymnast },
                  { key: 'coach_color'   as const, label: t.colorCoach   },
                  { key: 'judge_color'   as const, label: t.colorJudge   },
                  { key: 'staff_color'   as const, label: t.colorStaff   },
                ] as const).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="color" value={config[key]}
                      onChange={e => set(key, e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 shrink-0" />
                    <span className="text-xs text-slate-600 truncate">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* header */}
            <div>
              <SectionLabel label={t.headerSection} />
              <div className="space-y-3">
                <SliderRow label={t.headerHeight} value={config.header_height} min={10} max={50} step={1} unit="%" onChange={v => set('header_height', v)} />
                <div className="flex gap-4 pt-1">
                  {([
                    { key: 'show_logo'             as const, label: t.showLogo     },
                    { key: 'show_competition_name' as const, label: t.showCompName },
                  ] as const).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                      <input type="checkbox" checked={config[key]} onChange={e => set(key, e.target.checked)} className="w-3.5 h-3.5 rounded" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* photo */}
            <div>
              <SectionLabel label={t.photoSection} />
              <div className="space-y-3">
                <SliderRow label={t.photoSize} value={config.photo_size} min={15} max={65} step={1} unit="%" onChange={v => set('photo_size', v)} />
                <SliderRow label={t.photoX}    value={config.photo_x}    min={0}  max={100} step={1} unit="" onChange={v => set('photo_x', v)} />
              </div>
            </div>

            {/* text */}
            <div>
              <SectionLabel label={t.textSection} />
              <div className="space-y-3">
                <SliderRow label={t.nameSize}       value={config.name_size}       min={0.5} max={2.0} step={0.05} unit="×"  onChange={v => set('name_size', v)}       />
                <SliderRow label={t.clubSize}       value={config.club_size}       min={0.5} max={2.0} step={0.05} unit="×"  onChange={v => set('club_size', v)}       />
                <SliderRow label={t.badgeSize}      value={config.badge_size}      min={0.5} max={2.0} step={0.05} unit="×"  onChange={v => set('badge_size', v)}      />
                <SliderRow label={t.textX}          value={config.text_x}          min={0}   max={100} step={1}    unit=""   onChange={v => set('text_x', v)}          />
                <SliderRow label={t.textBgOpacity}  value={config.text_bg_opacity} min={0}   max={100} step={5}    unit="%"  onChange={v => set('text_bg_opacity', v)} />
              </div>
            </div>

            {/* background */}
            <div>
              <SectionLabel label={t.bgSection} />
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => set('bg_image_url', null)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${!config.bg_image_url ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                      {t.bgWhite}
                    </button>
                    <button
                      onClick={() => bgInputRef.current?.click()}
                      disabled={uploading}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${config.bg_image_url ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'} disabled:opacity-50`}>
                      {uploading ? t.uploading : config.bg_image_url ? t.bgImage : t.uploadBg}
                    </button>
                    {config.bg_image_url && (
                      <button
                        onClick={() => set('bg_image_url', null)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                        {t.removeBg}
                      </button>
                    )}
                  </div>
                  {config.bg_image_url && (
                    <img src={config.bg_image_url} alt="" className="h-8 w-12 object-cover rounded border border-slate-200" />
                  )}
                </div>
                {config.bg_image_url && (
                  <SliderRow label={t.bgOpacity} value={config.bg_image_opacity} min={0} max={100} step={5} unit="%" onChange={v => set('bg_image_opacity', v)} />
                )}
              </div>
              <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
            </div>

            {/* save */}
            <div className="flex justify-end pt-2">
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors">
                {saved ? t.configSaved : saving ? '…' : t.saveConfig}
              </button>
            </div>
          </div>

          {/* preview */}
          <div className="flex flex-col items-center gap-4 xl:shrink-0">
            <div className="flex items-center justify-between w-full xl:w-auto xl:justify-start gap-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.preview}</span>
              <div className="flex gap-1">
                {previewTypes.map(({ type, label }) => (
                  <button key={type} onClick={() => setPreviewType(type)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${previewType === type ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <CardPreview
              person={previewPerson}
              config={config}
              competition={competition}
              typeLabel={labelFor(previewPerson.type)}
            />
          </div>
        </div>
      </div>

      {/* ── staff management ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{t.staffSection}</h3>

        {/* add staff */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder={t.staffNamePlaceholder}
            value={staffName}
            onChange={e => setStaffName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void handleAddStaff() }}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            onClick={() => void handleAddStaff()}
            disabled={!staffName.trim() || addingStaff}
            className="px-4 py-1.5 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">
            {t.addStaff}
          </button>
        </div>

        {staffList.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noStaff}</p>
        ) : (
          <div className="space-y-2">
            {staffList.map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2 px-3 rounded-xl border border-slate-100 bg-slate-50">
                {/* photo circle */}
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {s.photo_url ? (
                    <img src={s.photo_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{initials(s.name)}</span>
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-slate-800 truncate">{s.name}</span>
                {/* photo upload */}
                <input
                  ref={el => { staffPhotoRefs.current[s.id] = el }}
                  type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) void handleStaffPhotoUpload(s.id, f) }}
                />
                <button
                  onClick={() => staffPhotoRefs.current[s.id]?.click()}
                  disabled={uploadingStaffId === s.id}
                  className="text-xs text-slate-400 hover:text-blue-600 transition-colors shrink-0">
                  {uploadingStaffId === s.id ? '…' : t.uploadPhoto}
                </button>
                <button
                  onClick={() => void handleDeleteStaff(s.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── print section ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-700">{t.acreditaciones}</h3>
            <div className="flex gap-2">
              {([
                { label: t.showGymnasts, state: showGymnasts, set: setShowGymnasts },
                { label: t.showCoaches,  state: showCoaches,  set: setShowCoaches  },
                { label: t.showJudges,   state: showJudges,   set: setShowJudges   },
                { label: t.showStaff,    state: showStaff,    set: setShowStaff    },
              ] as const).map(({ label, state, set: setter }) => (
                <button key={label} onClick={() => setter(!state)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${state ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <div className="flex gap-2">
              {([
                { value: 'all'     as const, label: t.filterAll         },
                { value: 'with'    as const, label: t.filterWithPhoto    },
                { value: 'without' as const, label: t.filterWithoutPhoto },
              ]).map(({ value, label }) => (
                <button key={value} onClick={() => setPhotoFilter(value)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${photoFilter === value ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handlePrint} disabled={printPersons.filter(p => !excludedIds.has(`${p.type}-${p.id}`)).length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m.97-5.671L9 19.5m6.75-5.671L15.75 19.5m-.97-5.671L17.25 19.5M9 6.75h6M9 10.5h6m-6 3.75h6M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {t.printAll} ({printPersons.filter(p => !excludedIds.has(`${p.type}-${p.id}`)).length})
          </button>
        </div>

        {/* search */}
        <div className="mb-4">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {printPersons.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">{t.empty}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {printPersons.map(person => {
              const key = `${person.type}-${person.id}`
              const excluded = excludedIds.has(key)
              return (
                <div key={key} className="group relative cursor-pointer"
                  style={{ width: THUMB_W, height: THUMB_H, borderRadius: 8, flexShrink: 0 }}
                  onClick={() => toggleExclude(key)}
                  title={excluded ? t.clickToInclude : t.clickToExclude}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: THUMB_W, height: THUMB_H, overflow: 'hidden', borderRadius: 8, opacity: excluded ? 0.35 : 1, transition: 'opacity 0.15s' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', transform: `scale(${THUMB_SCALE})` }}>
                      <CardPreview
                        person={person}
                        config={config}
                        competition={competition}
                        typeLabel={labelFor(person.type)}
                      />
                    </div>
                  </div>
                  {excluded ? (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 8, border: '2px dashed #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.08)' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 4 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
