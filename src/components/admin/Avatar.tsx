import ClickableImg from '@/components/shared/ClickableImg'
import type { Club, Team, Judge } from '@/components/admin/types'

// ─── ClubAvatar ───────────────────────────────────────────────────────────────

type ClubAvatarSize = 'xs' | 'sm' | 'md'

const CLUB_SIZE: Record<ClubAvatarSize, { box: string; text: string }> = {
  xs: { box: 'w-5 h-5', text: 'text-[9px]' },
  sm: { box: 'w-6 h-6', text: 'text-[10px]' },
  md: { box: 'w-8 h-8', text: 'text-xs' },
}

export function ClubAvatar({ club, size = 'sm', shape = 'circle', ring = false }: {
  club: Club | null | undefined
  size?: ClubAvatarSize
  shape?: 'circle' | 'square'
  ring?: boolean
}) {
  if (!club) return null
  const { box, text } = CLUB_SIZE[size]
  const roundCls = shape === 'circle' ? 'rounded-full' : 'rounded-lg'
  const ringCls  = ring ? 'ring-2 ring-white' : ''
  const base = [box, roundCls, ringCls, 'shrink-0'].filter(Boolean).join(' ')
  return club.avatar_url ? (
    <img src={club.avatar_url} alt={club.club_name} className={[base, 'object-cover'].join(' ')} />
  ) : (
    <div className={[base, 'bg-slate-200 text-slate-500 font-semibold flex items-center justify-center', text].join(' ')}>
      {club.club_name.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── TeamAvatar ───────────────────────────────────────────────────────────────

export function TeamAvatar({ team }: { team: Team }) {
  const initials = team.gymnast_display
    .split('/')
    .map((n) => n.trim()[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return team.photo_url ? (
    <ClickableImg src={team.photo_url} alt={team.gymnast_display} className="w-10 h-10 rounded-lg object-cover shrink-0" />
  ) : (
    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold flex items-center justify-center shrink-0">
      {initials}
    </div>
  )
}

// ─── JudgeAvatar ──────────────────────────────────────────────────────────────

export function JudgeAvatar({ judge, size = 'md' }: { judge: Judge; size?: 'sm' | 'md' }) {
  const initials = judge.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
  return judge.avatar_url ? (
    <ClickableImg src={judge.avatar_url} alt={judge.full_name} className={[sz, 'rounded-full object-cover'].join(' ')} />
  ) : (
    <div className={[sz, 'rounded-full bg-slate-200 text-slate-600 font-semibold flex items-center justify-center shrink-0'].join(' ')}>
      {initials}
    </div>
  )
}
