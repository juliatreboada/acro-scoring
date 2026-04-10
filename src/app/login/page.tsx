'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/aj-scoring/types'

// ─── role routing ──────────────────────────────────────────────────────────────

type DbRole = 'super_admin' | 'admin' | 'judge' | 'club'

const ROLE_REDIRECT: Record<DbRole, string> = {
  super_admin: '/admin',
  admin:       '/comp-admin',
  judge:       '/judge',
  club:        '/club',
}

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Nosa Acro Suite',
    subtitle: 'Sign in to your account',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    errorCredentials: 'Invalid email or password.',
    errorGeneric: 'Something went wrong. Please try again.',
    alreadyLogged: 'Already signed in as',
    goToDashboard: 'Go to dashboard',
    logOut: 'Sign in with a different account',
    devTitle: 'Dev quick-access',
    devHint: 'Click to pre-fill credentials',
    roles: {
      super_admin: 'Super Admin',
      admin:       'Competition Admin',
      judge:       'Judge',
      club:        'Club',
    } as Record<DbRole, string>,
  },
  es: {
    title: 'Nosa Acro Suite',
    subtitle: 'Inicia sesión en tu cuenta',
    email: 'Email',
    password: 'Contraseña',
    signIn: 'Entrar',
    signingIn: 'Entrando…',
    errorCredentials: 'Email o contraseña incorrectos.',
    errorGeneric: 'Algo ha fallado. Inténtalo de nuevo.',
    alreadyLogged: 'Ya has iniciado sesión como',
    goToDashboard: 'Ir al panel',
    logOut: 'Iniciar sesión con otra cuenta',
    devTitle: 'Acceso rápido (dev)',
    devHint: 'Haz clic para rellenar las credenciales',
    roles: {
      super_admin: 'Super Admin',
      admin:       'Admin de competición',
      judge:       'Juez',
      club:        'Club',
    } as Record<DbRole, string>,
  },
}

// ─── role styles ──────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<DbRole, { card: string; badge: string }> = {
  super_admin: { card: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50',   badge: 'bg-violet-100  text-violet-700'  },
  admin:       { card: 'border-blue-200   hover:border-blue-400   hover:bg-blue-50',     badge: 'bg-blue-100    text-blue-700'    },
  judge:       { card: 'border-amber-200  hover:border-amber-400  hover:bg-amber-50',    badge: 'bg-amber-100   text-amber-700'   },
  club:        { card: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
}

// ─── dev accounts ─────────────────────────────────────────────────────────────
// Create these in Supabase Dashboard → Authentication → Users

const DEV_ACCOUNTS: { role: DbRole; email: string; password: string; name: string }[] = [
  { role: 'super_admin', email: 'admin@acro.es',  password: 'admin123',  name: 'Laura González' },
  { role: 'admin',       email: 'comp@acro.es',   password: 'comp123',   name: 'Marcos Ruiz'    },
  { role: 'judge',       email: 'judge@acro.es',  password: 'judge123',  name: 'García López'   },
  { role: 'club',        email: 'club@acro.es',   password: 'club123',   name: 'RC Olimpia'     },
]

// ─── role icons ───────────────────────────────────────────────────────────────

function RoleIcon({ role }: { role: DbRole }) {
  if (role === 'super_admin') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
  if (role === 'admin') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
  if (role === 'judge') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [lang, setLang]         = useState<Lang>('es')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [session, setSession]   = useState<{ name: string; role: DbRole } | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const t = T[lang]

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('auth_id', user.id).single()
        if (profile) {
          setSession({ name: user.email?.split('@')[0] ?? '—', role: profile.role as DbRole })
        }
      }
      setCheckingSession(false)
    }
    checkSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError(authError?.message?.includes('Invalid') ? t.errorCredentials : t.errorGeneric)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role as DbRole | undefined
    router.push(role ? ROLE_REDIRECT[role] : '/')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (checkingSession) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">

      {/* lang toggle */}
      <div className="flex justify-end p-4">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          {(['en', 'es'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={['px-3 py-1 rounded-md text-sm font-medium transition-all',
                lang === l ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* centre card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md space-y-6">

          {/* logo + title */}
          <div className="text-center space-y-2">
            <img src="/logo-nobg.png" alt="Nosa Acro Suite" className="w-20 h-20 object-contain mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t.title}</h1>
            <p className="text-sm text-slate-500">{t.subtitle}</p>
          </div>

          {/* already-logged-in banner */}
          {session && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-sm text-slate-600">
                {t.alreadyLogged} <span className="font-semibold text-slate-800">{session.name}</span>
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={() => router.push(ROLE_REDIRECT[session.role])}
                  className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all">
                  {t.goToDashboard}
                </button>
                <button onClick={handleSignOut}
                  className="w-full px-4 py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors">
                  {t.logOut}
                </button>
              </div>
            </div>
          )}

          {/* login form */}
          {!session && (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.email}</label>
                <input
                  type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                  placeholder="you@acro.es"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.password}</label>
                <input
                  type="password" required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? t.signingIn : t.signIn}
              </button>
            </form>
          )}

          {/* dev quick-access — local only, stripped from production builds */}
          {process.env.NODE_ENV === 'development' && !session && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-5 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.devTitle}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.devHint}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEV_ACCOUNTS.map((acc) => {
                  const s = ROLE_STYLES[acc.role]
                  return (
                    <button key={acc.role}
                      onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                      className={['group border rounded-xl p-3 text-left transition-all', s.card].join(' ')}>
                      <span className={['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold mb-2', s.badge].join(' ')}>
                        <RoleIcon role={acc.role} />
                        {t.roles[acc.role]}
                      </span>
                      <p className="text-sm font-semibold text-slate-700 leading-tight">{acc.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{acc.email}</p>
                      <p className="text-xs text-slate-300 mt-0.5 font-mono">pw: <span className="text-slate-400">{acc.password}</span></p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
