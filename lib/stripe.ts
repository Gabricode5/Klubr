import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export function calculateFees(amount: number, commissionRate: number, affiliateRate = 0) {
  const platformFee = Math.round(amount * commissionRate * 100) / 100
  const affiliateFee = Math.round(amount * affiliateRate * 100) / 100
  const creatorAmount = Math.round((amount - platformFee - affiliateFee) * 100) / 100
  return { platformFee, affiliateFee, creatorAmount }
}

export async function createConnectAccount(email: string) {
  return stripe.accounts.create({
    type: 'express',
    country: 'FR',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    settings: {
      payouts: { schedule: { interval: 'weekly', weekly_anchor: 'monday' } },
    },
  })
}

export async function createOnboardingLink(accountId: string, baseUrl: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/dashboard/settings?stripe=refresh`,
    return_url: `${baseUrl}/dashboard/settings?stripe=success`,
    type: 'account_onboarding',
  })
}

export async function createStripePrice(
  amount: number,
  currency: string,
  interval: 'month' | 'year' | null,
  productName: string
) {
  const product = await stripe.products.create({ name: productName })

  if (!interval) {
    return stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100),
      currency,
    })
  }

  return stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(amount * 100),
    currency,
    recurring: { interval },
  })
}

export async function createCheckoutSession({
  priceId,
  connectedAccountId,
  platformFeePercent,
  communitySlug,
  affiliateCode,
  baseUrl,
}: {
  priceId: string
  connectedAccountId: string
  platformFeePercent: number
  communitySlug: string
  affiliateCode?: string
  baseUrl: string
}) {
  return stripe.checkout.sessions.create(
    {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pay/${communitySlug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pay/${communitySlug}`,
      subscription_data: {
        application_fee_percent: platformFeePercent * 100,
        metadata: {
          community_slug: communitySlug,
          affiliate_code: affiliateCode ?? '',
        },
      },
      metadata: {
        community_slug: communitySlug,
        affiliate_code: affiliateCode ?? '',
      },
      automatic_tax: { enabled: true },
    },
    { stripeAccount: connectedAccountId }
  )
}

export function constructWebhookEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
