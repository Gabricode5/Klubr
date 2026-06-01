'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface CommunityOption {
  id: string
  name: string
  platform: string
}

const platformLabel: Record<string, string> = {
  telegram: 'Telegram',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
}

export default function NewPlanPage() {
  const [userId, setUserId] = useState('')
  const [communities, setCommunities] = useState<CommunityOption[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        fetch(`/api/creator/communities`)
          .then((r) => r.json())
          .then((payload: { communities?: CommunityOption[] }) =>
            setCommunities(payload.communities ?? [])
          )
          .catch(console.error)
      }
    })
  }, [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const fd = new FormData(e.currentTarget)
    const payload = {
      creatorId: userId,
      primaryCommunityId: selected[0] ?? '',
      name: fd.get('name'),
      description: fd.get('description'),
      price: Number(fd.get('price')),
      currency: 'eur',
      interval: fd.get('interval'),
      trialDays: Number(fd.get('trialDays') ?? 0),
      communityIds: selected,
    }
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setMessage(res.ok ? { type: 'success', text: 'Plan créé avec succès !' } : { type: 'error', text: 'Erreur lors de la création du plan.' })
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Créer un plan</h1>
        <p className="mt-1 text-sm text-slate-500">Définissez un plan d'abonnement multi-communautés.</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nom du plan</label>
            <input
              name="name"
              required
              placeholder="ex: Accès Premium"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <input
              name="description"
              placeholder="ex: Accès illimité à tous nos groupes"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Prix (€)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="9.99"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Fréquence</label>
              <select
                name="interval"
                defaultValue="month"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="month">Mensuel</option>
                <option value="year">Annuel</option>
                <option value="one_time">Paiement unique</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Jours d'essai gratuit</label>
            <input
              name="trialDays"
              type="number"
              min="0"
              defaultValue="0"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Communautés incluses</label>
            {communities.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune communauté trouvée pour votre compte.</p>
            ) : (
              <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                {communities.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                      checked={selected.includes(c.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                        )
                      }
                    />
                    <span className="text-sm text-slate-700">{c.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {platformLabel[c.platform] ?? c.platform}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className={`rounded-lg px-3 py-2 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || selected.length === 0}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer le plan'}
          </button>
        </form>
      </div>
    </div>
  )
}
