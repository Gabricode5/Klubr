'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Community, SubscriptionPlan } from '@/types/database'

interface PayPageClientProps {
  community: Pick<Community, 'id' | 'name' | 'description' | 'cover_image_url' | 'platform' | 'slug'>
  plans: SubscriptionPlan[]
  affiliateCode?: string
}

const PLATFORM_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
}

const INTERVAL_LABELS: Record<string, string> = {
  month: '/mois',
  year: '/an',
  one_time: 'accès à vie',
}

export function PayPageClient({ community, plans, affiliateCode }: PayPageClientProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(planId: string) {
    setLoading(planId)
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          communitySlug: community.slug,
          affiliateCode,
        }),
      })

      const payload = await res.json()
      if (!res.ok || payload.error || !payload.url) {
        throw new Error(payload.error ?? 'Impossible de créer la session de paiement')
      }

      window.location.href = payload.url
    } catch (err) {
      console.error('Erreur checkout:', err)
      alert('Une erreur est survenue. Réessaie dans quelques instants.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-12 text-center">
          {community.cover_image_url && (
            <img
              src={community.cover_image_url}
              alt={community.name}
              className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover shadow-md"
            />
          )}
          <Badge variant="secondary" className="mb-3">
            {PLATFORM_LABELS[community.platform]}
          </Badge>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">{community.name}</h1>
          {community.description && (
            <p className="text-lg leading-relaxed text-gray-600">{community.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer border-2 transition-colors hover:border-black"
              onClick={() => handleCheckout(plan.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{plan.price.toFixed(0)}EUR</span>
                    <span className="ml-1 text-sm text-gray-500">{INTERVAL_LABELS[plan.interval]}</span>
                  </div>
                </div>
                {plan.description && <CardDescription>{plan.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {plan.trial_days > 0 && (
                  <Badge variant="secondary" className="mb-3">
                    {plan.trial_days} jours d'essai gratuit
                  </Badge>
                )}
                <Button
                  className="w-full"
                  disabled={loading === plan.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCheckout(plan.id)
                  }}
                >
                  {loading === plan.id ? 'Chargement...' : 'Rejoindre maintenant'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
