'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// This page handles invite and password-reset links when the email template
// uses {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=...
// Email security scanners fetch the URL but don't run JavaScript, so the
// token is not consumed until the user actually opens it in a browser.

export default function ConfirmPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type      = params.get('type') as 'invite' | 'recovery' | 'signup' | null

    if (!tokenHash || !type) {
      setError('Invalid confirmation link.')
      return
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      .then(({ error: verifyErr }) => {
        if (verifyErr) {
          setError(verifyErr.message)
        } else {
          // Session is now set — go to set-password for both invite and recovery
          router.replace('/auth/set-password')
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm w-full max-w-sm text-center space-y-4">
        {error ? (
          <>
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all"
            >
              Go to login
            </button>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
