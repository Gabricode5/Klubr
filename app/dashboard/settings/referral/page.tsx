'use client'

import { useState } from 'react'

export default function ReferralSettingsPage() {
  const [creatorId, setCreatorId] = useState('')
  const [days, setDays] = useState(7)
  const [message, setMessage] = useState('')

  async function save() {
    const res = await fetch('/api/creator/referral-config', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        creatorId,
        referralRewardDays: days,
      }),
    })
    setMessage(res.ok ? 'Configuration sauvegardée.' : 'Erreur de sauvegarde.')
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold">Récompense parrainage</h1>
      <p className="mt-2 text-sm text-gray-600">Nombre de jours offerts au parrain par conversion.</p>
      <div className="mt-6 space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="Creator ID"
          value={creatorId}
          onChange={(e) => setCreatorId(e.target.value)}
        />
        <input
          type="number"
          min={1}
          max={90}
          className="w-full rounded border p-2"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={() => save()}>
          Sauvegarder
        </button>
      </div>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </main>
  )
}
