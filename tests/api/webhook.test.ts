import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'
import { NextRequest } from 'next/server'
import { createSupabaseMock } from '../helpers/supabase-mock'

vi.mock('@/lib/supabase-server', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {},
  calculateFees: (amount: number, commission: number, affiliate = 0) => ({
    platformFee: Math.round(amount * commission * 100) / 100,
    affiliateFee: Math.round(amount * affiliate * 100) / 100,
    creatorAmount: Math.round((amount - amount * commission - amount * affiliate) * 100) / 100,
  }),
  constructWebhookEvent: vi.fn(),
  extendSubscriptionByDays: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/telegram', () => ({
  generateInviteLink: vi.fn().mockResolvedValue('https://t.me/+fakeInviteLink'),
  revokeMemberAccess: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/resend', () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
}))

import { POST } from '@/app/api/webhooks/stripe/route'
import { createAdminClient } from '@/lib/supabase-server'
import { constructWebhookEvent } from '@/lib/stripe'
import { sendEmail } from '@/lib/resend'

const mockCommunity = {
  id: 'community-id',
  name: 'Crypto Insiders',
  slug: 'crypto-insiders',
  platform: 'telegram' as const,
  platform_id: '-100123456',
  bot_token: 'bot:faketoken',
  creators: {
    id: 'creator-id',
    commission_rate: 0.15,
    referral_reward_days: 0,
  },
}

const mockPlan = {
  id: 'plan-id',
  active: true,
}

const mockMember = {
  id: 'member-id',
  email: 'user@example.com',
  name: 'Jean Dupont',
  referral_code: 'REF123',
  platform_user_id: null,
}

function makeWebhookRequest(body: string, signature = 'valid-sig') {
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': signature },
    body,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/webhooks/stripe', () => {
  describe('vérification de la signature', () => {
    it('retourne 400 si le header stripe-signature est absent', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: 'payload',
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toBe('No signature')
    })

    it('retourne 400 si la signature est invalide', async () => {
      vi.mocked(constructWebhookEvent).mockImplementation(() => {
        throw new Error('Signature Stripe invalide')
      })

      const res = await POST(makeWebhookRequest('bad-payload', 'bad-sig'))
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toBe('Invalid signature')
    })
  })

  describe('checkout.session.completed', () => {
    it("crée le membre, la transaction et envoie l'email de bienvenue", async () => {
      const fakeEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { plan_id: 'plan-id', community_slug: 'crypto-insiders', affiliate_code: '', referral_code: '' },
            customer_details: { email: 'user@example.com', name: 'Jean Dupont' },
            subscription: 'sub_fake',
            customer: 'cus_fake',
            amount_total: 2999,
            currency: 'eur',
            payment_intent: 'pi_fake',
          } as unknown as Stripe.Checkout.Session,
        },
      } as Stripe.Event

      vi.mocked(constructWebhookEvent).mockReturnValue(fakeEvent)
      vi.mocked(createAdminClient).mockReturnValue(
        createSupabaseMock({
          communities: { data: mockCommunity, error: null },
          subscription_plans: { data: mockPlan, error: null },
          members: { data: mockMember, error: null },
          plan_communities: { data: [], error: null },
          transactions: { data: {}, error: null },
          member_community_access: { data: {}, error: null },
        }) as ReturnType<typeof createAdminClient>
      )

      const res = await POST(makeWebhookRequest('{}'))
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.received).toBe(true)
      expect(vi.mocked(sendEmail)).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'welcome', to: 'user@example.com' })
      )
    })
  })

  describe('customer.subscription.deleted', () => {
    it("annule le membre et envoie l'email d'expiration", async () => {
      const memberWithCommunity = {
        ...mockMember,
        communities: mockCommunity,
        platform_user_id: null,
      }
      const fakeEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: { id: 'sub_fake' } as Stripe.Subscription,
        },
      } as Stripe.Event

      vi.mocked(constructWebhookEvent).mockReturnValue(fakeEvent)
      vi.mocked(createAdminClient).mockReturnValue(
        createSupabaseMock({
          members: { data: memberWithCommunity, error: null },
          member_community_access: { data: [], error: null },
        }) as ReturnType<typeof createAdminClient>
      )

      const res = await POST(makeWebhookRequest('{}'))
      expect(res.status).toBe(200)
      expect(vi.mocked(sendEmail)).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'cancelled' })
      )
    })
  })

  describe('invoice.payment_failed', () => {
    it("passe le membre en past_due et envoie l'email d'échec", async () => {
      const memberWithCommunity = { ...mockMember, communities: mockCommunity }
      const fakeEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: { subscription: 'sub_fake' } as unknown as Stripe.Invoice,
        },
      } as Stripe.Event

      vi.mocked(constructWebhookEvent).mockReturnValue(fakeEvent)
      vi.mocked(createAdminClient).mockReturnValue(
        createSupabaseMock({
          members: { data: memberWithCommunity, error: null },
        }) as ReturnType<typeof createAdminClient>
      )

      const res = await POST(makeWebhookRequest('{}'))
      expect(res.status).toBe(200)
      expect(vi.mocked(sendEmail)).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'payment_failed' })
      )
    })
  })

  describe('customer.subscription.updated', () => {
    it('répond 200 sans effet de bord supplémentaire', async () => {
      const fakeEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_fake',
            status: 'active',
            current_period_start: 1700000000,
            current_period_end: 1702592000,
          } as Stripe.Subscription,
        },
      } as Stripe.Event

      vi.mocked(constructWebhookEvent).mockReturnValue(fakeEvent)
      vi.mocked(createAdminClient).mockReturnValue(
        createSupabaseMock() as ReturnType<typeof createAdminClient>
      )

      const res = await POST(makeWebhookRequest('{}'))
      expect(res.status).toBe(200)
      expect(vi.mocked(sendEmail)).not.toHaveBeenCalled()
    })
  })
})
