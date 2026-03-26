'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/aj-scoring/types'

type DbRole = 'super_admin' | 'admin' | 'judge' | 'club'

const ROLE_REDIRECT: Record<DbRole, string> = {
  super_admin: '/admin',
  admin:       '/comp-admin',
  judge:       '/judge',
  club:        '/club',
}

const T = {
  en: {
    title:      'Acro Scoring',
    heading:    'Create your password',
    subtitle:   'You have been invited to Acro Scoring. Set a password to activate your account.',
    password:   'New password',
    confirm:    'Confirm password',
    submit:     'Set password & sign in',
    submitting: 'Setting password…',
    errShort:   'Password must be at least 8 characters.',
    errMatch:   'Passwords do not match.',
    errGeneric: 'Something went wrong. Please try again.',
    noSession:  'This invite link is invalid or has already been used.',
    goToLogin:  'Go to login',
  },
  es: {
    title:      'Acro Scoring',
    heading:    'Crea tu contraseña',
    subtitle:   'Has sido invitado a Acro Scoring. Establece una contraseña para activar tu cuenta.',
    password:   'Nueva contraseña',
    confirm:    'Confirmar contraseña',
    submit:     'Establecer contraseña y entrar',
    submitting: 'Estableciendo contraseña…',
    errShort:   'La contraseña debe tener al menos 8 caracteres.',
    errMatch:   'Las contraseñas no coinciden.',
    errGeneric: 'Algo ha fallado. Inténtalo de nuevo.',
    noSession:  'El enlace de invitación no es válido o ya ha sido usado.',
    goToLogin:  'Ir al inicio de sesión',
  },
}

export default function SetPasswordPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [lang, setLang]         = useState<Lang>('en')
  const [status, setStatus]     = useState<'loading' | 'ready' | 'no_session'>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)

  const t = T[lang]

  useEffect(() => {
    const hash   = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken  = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      // Explicit session exchange from the invite hash tokens
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          if (data.session && !error) {
            // Remove tokens from the URL bar
            window.history.replaceState(null, '', window.location.pathname)
            setStatus('ready')
          } else {
            setStatus('no_session')
          }
        })
    } else {
      // No hash — check for an existing session (e.g. user refreshed the page)
      supabase.auth.getUser().then(({ data: { user } }) => {
        setStatus(user ? 'ready' : 'no_session')
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8)  { setError('short'); return }
    if (password !== confirm)  { setError('match'); return }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('generic')
      setSaving(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role as DbRole | undefined
      router.push(role ? ROLE_REDIRECT[role] : '/')
    } else {
      router.push('/')
    }
  }

  const errorMsg =
    error === 'short'   ? t.errShort :
    error === 'match'   ? t.errMatch :
    error === 'generic' ? t.errGeneric : ''

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all'

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

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md space-y-6">

          {/* logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 shadow-lg mb-2">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t.title}</h1>
          </div>

          {/* loading */}
          {status === 'loading' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex justify-center">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
          )}

          {/* invalid invite */}
          {status === 'no_session' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-center">
              <p className="text-sm text-red-500">{t.noSession}</p>
              <button onClick={() => router.push('/login')}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all">
                {t.goToLogin}
              </button>
            </div>
          )}

          {/* password form */}
          {status === 'ready' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{t.heading}</h2>
                <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.password}</label>
                  <input
                    type="password" required autoFocus autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputCls} placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.confirm}</label>
                  <input
                    type="password" required autoComplete="new-password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className={inputCls} placeholder="••••••••"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMsg}</p>
                )}

                <button type="submit" disabled={saving}
                  className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? t.submitting : t.submit}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
