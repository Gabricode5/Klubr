import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'
import { createSupabaseMock } from '../helpers/supabase-mock'

vi.mock('@/lib/supabase-server', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {},
  calculateFees: vi.fn(),
  createCheckoutSession: vi.fn(),
  constructWebhookEvent: vi.fn(),
  extendSubscriptionByDays: vi.fn(),
}))

import { POST } from '@/app/api/subscriptions/checkout/route'
import { createAdminClient } from '@/lib/supabase-server'
import { createCheckoutSession } from '@/lib/stripe'

const mockPlan = {
  id: 'plan-uuid-1234',
  stripe_price_id: 'price_fake123',
  communities: {
    id: 'community-uuid-1234',
    name: 'Ma communauté',
    slug: 'ma-communaute',
    creators: {
      id: 'creator-uuid-1234',
      stripe_account_id: 'acct_fake123',
      stripe_onboarded: true,
      commission_rate: 0.15,
    },
  },
}

function makeRequest(body: unknown): NextRequest {
  return {
    json: () => Promise.resolve(body),
    headers: { get: () => null },
    text: () => Promise.resolve(JSON.stringify(body)),
    method: 'POST',
    url: 'http://localhost/api/subscriptions/checkout',
  } as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/subscriptions/checkout', () => {
  it('retourne 400 si le corps JSON est invalide (Zod)', async () => {
    const req = makeRequest({ planId: 'pas-un-uuid', communitySlug: '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Données invalides')
  })

  it('retourne 400 si planId est absent', async () => {
    const req = makeRequest({ communitySlug: 'ma-communaute' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retourne 404 si le plan est introuvable en base', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      createSupabaseMock({
        subscription_plans: { data: null, error: null },
      }) as ReturnType<typeof createAdminClient>
    )

    const req = makeRequest({
      planId: '123e4567-e89b-12d3-a456-426614174000',
      communitySlug: 'ma-communaute',
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Plan introuvable')
  })

  it("retourne 400 si le créateur n'a pas configuré Stripe", async () => {
    const planSansStripe = {
      ...mockPlan,
      communities: {
        ...mockPlan.communities,
        creators: { ...mockPlan.communities.creators, stripe_onboarded: false },
      },
    }
    vi.mocked(createAdminClient).mockReturnValue(
      createSupabaseMock({
        subscription_plans: { data: planSansStripe, error: null },
      }) as ReturnType<typeof createAdminClient>
    )

    const req = makeRequest({
      planId: '123e4567-e89b-12d3-a456-426614174000',
      communitySlug: 'ma-communaute',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('paiements')
  })

  it('retourne 400 si le prix Stripe est manquant sur le plan', async () => {
    const planSansPrix = { ...mockPlan, stripe_price_id: null }
    vi.mocked(createAdminClient).mockReturnValue(
      createSupabaseMock({
        subscription_plans: { data: planSansPrix, error: null },
      }) as ReturnType<typeof createAdminClient>
    )

    const req = makeRequest({
      planId: '123e4567-e89b-12d3-a456-426614174000',
      communitySlug: 'ma-communaute',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Prix Stripe manquant')
  })

  it('retourne 200 avec une URL de paiement en cas de succès', async () => {
    vi.mocked(createAdminClient).mockReturnValue(
      createSupabaseMock({
        subscription_plans: { data: mockPlan, error: null },
      }) as ReturnType<typeof createAdminClient>
    )
    vi.mocked(createCheckoutSession).mockResolvedValue(
      { url: 'https://checkout.stripe.com/pay/fake' } as Awaited<ReturnType<typeof createCheckoutSession>>
    )

    const req = makeRequest({
      planId: '123e4567-e89b-12d3-a456-426614174000',
      communitySlug: 'ma-communaute',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('https://checkout.stripe.com/pay/fake')
    expect(vi.mocked(createCheckoutSession)).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'plan-uuid-1234',
        priceId: 'price_fake123',
        connectedAccountId: 'acct_fake123',
      })
    )
  })
})
