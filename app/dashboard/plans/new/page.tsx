'use client'

import { useEffect, useState } from 'react'

interface CommunityOption {
  id: string
  name: string
  platform: string
}

export default function NewPlanPage() {
  const [creatorId, setCreatorId] = useState('')
  const [communities, setCommunities] = useState<CommunityOption[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function run() {
      if (!creatorId) return
      const res = await fetch(`/api/creator/communities?creatorId=${creatorId}`)
      const payload = (await res.json()) as { communities?: CommunityOption[] }
      setCommunities(payload.communities ?? [])
    }
    run().catch(console.error)
  }, [creatorId])

  async function submit(formData: FormData) {
    const payload = {
      creatorId,
      primaryCommunityId: (formData.get('primaryCommunityId') as string) || selected[0],
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      currency: 'eur',
      interval: formData.get('interval'),
      trialDays: Number(formData.get('trialDays') ?? 0),
      communityIds: selected,
    }

    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setMessage(res.ok ? 'Plan créé avec succès.' : 'Erreur de création du plan.')
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">Créer un plan multi-communautés</h1>
      <p className="mt-2 text-sm text-gray-600">Sélectionne plusieurs groupes pour un même plan.</p>

      <form
        className="mt-6 space-y-4"
        action={(fd) => {
          submit(fd).catch(console.error)
        }}
      >
        <input
          className="w-full rounded border p-2"
          placeholder="Creator ID"
          value={creatorId}
          onChange={(e) => setCreatorId(e.target.value)}
        />
        <input name="name" className="w-full rounded border p-2" placeholder="Nom du plan" required />
        <input name="description" className="w-full rounded border p-2" placeholder="Description" />
        <input name="price" type="number" className="w-full rounded border p-2" placeholder="Prix" required />
        <select name="interval" className="w-full rounded border p-2" defaultValue="month">
          <option value="month">Mensuel</option>
          <option value="year">Annuel</option>
          <option value="one_time">One-time</option>
        </select>
        <input name="trialDays" type="number" className="w-full rounded border p-2" placeholder="Jours d'essai" />

        <div className="rounded border p-3">
          <p className="mb-2 text-sm font-medium">Communautés incluses</p>
          <div className="space-y-2">
            {communities.map((community) => (
              <label key={community.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(community.id)}
                  onChange={(e) => {
                    setSelected((prev) =>
                      e.target.checked ? [...prev, community.id] : prev.filter((id) => id !== community.id)
                    )
                  }}
                />
                {community.name} ({community.platform})
              </label>
            ))}
          </div>
        </div>

        <input type="hidden" name="primaryCommunityId" value={selected[0] ?? ''} />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Créer le plan
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </main>
  )
}
