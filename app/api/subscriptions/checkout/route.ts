import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase-server'
import { createCheckoutSession } from '@/lib/stripe'

const CheckoutSchema = z.object({
  planId: z.string().uuid(),
  communitySlug: z.string().min(1),
  affiliateCode: z.string().optional(),
  referralCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { planId, communitySlug, affiliateCode, referralCode } = CheckoutSchema.parse(body)

    const supabase = createAdminClient()

    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*, communities(*, creators(*))')
      .eq('id', planId)
      .eq('active', true)
      .single()

    if (!plan) {
      return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })
    }

    const community = plan.communities as any
    const creator = community?.creators as any

    if (!creator?.stripe_account_id || !creator?.stripe_onboarded) {
      return NextResponse.json(
        { error: "Le créateur n'a pas encore configuré les paiements" },
        { status: 400 }
      )
    }

    if (!plan.stripe_price_id) {
      return NextResponse.json({ error: 'Prix Stripe manquant' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

    const session = await createCheckoutSession({
      planId: plan.id,
      priceId: plan.stripe_price_id,
      connectedAccountId: creator.stripe_account_id,
      platformFeePercent: creator.commission_rate,
      communitySlug,
      affiliateCode,
      referralCode,
      baseUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    console.error('Erreur création checkout:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
