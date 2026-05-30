'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ReferralSettingsPage() {
  const [userId, setUserId] = useState('')
  const [days, setDays] = useState(7)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  async function save() {
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/creator/referral-config', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ creatorId: userId, referralRewardDays: days }),
    })
    setMessage(res.ok ? { type: 'success', text: 'Configuration sauvegardée.' } : { type: 'error', text: 'Erreur de sauvegarde.' })
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Récompense parrainage</h1>
        <p className="mt-1 text-sm text-slate-500">
          Définissez le nombre de jours offerts au parrain par conversion réussie.
        </p>
      </div>

      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Jours offerts au parrain
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-2 w-full appearance-none rounded-full bg-slate-200 accent-indigo-600"
            />
            <span className="w-16 rounded-lg border border-slate-200 px-3 py-1.5 text-center text-sm font-bold text-slate-900">
              {days}j
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Chaque fois qu'un membre parraine quelqu'un, il gagne <strong>{days} jours</strong> d'abonnement gratuit.
          </p>
        </div>

        {message && (
          <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        <button
          onClick={save}
          disabled={loading || !userId}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}
