import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent, calculateFees } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import { generateInviteLink, revokeMemberAccess } from '@/lib/telegram'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('Webhook signature invalide:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata ?? {}
        const communitySlug = metadata.community_slug
        const affiliateCode = metadata.affiliate_code || null

        if (!communitySlug) break

        const { data: community } = await supabase
          .from('communities')
          .select('*, creators(*)')
          .eq('slug', communitySlug)
          .single()

        if (!community) break

        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('community_id', community.id)
          .eq('active', true)
          .limit(1)

        const plan = plans?.[0]
        if (!plan) break

        let affiliateId: string | null = null
        if (affiliateCode) {
          const { data: affiliate } = await supabase
            .from('affiliates')
            .select('id')
            .eq('code', affiliateCode)
            .eq('community_id', community.id)
            .single()
          affiliateId = affiliate?.id ?? null
        }

        const { data: member, error: memberError } = await supabase
          .from('members')
          .insert({
            community_id: community.id,
            plan_id: plan.id,
            affiliate_id: affiliateId,
            email: session.customer_details?.email ?? '',
            name: session.customer_details?.name ?? '',
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            status: 'active',
          })
          .select()
          .single()

        if (memberError || !member) break

        const amount = (session.amount_total ?? 0) / 100
        const creator = community.creators as any
        const commissionRate = creator?.commission_rate ?? 0.15
        const affiliateRate = affiliateId ? 0.2 : 0
        const fees = calculateFees(amount, commissionRate, affiliateRate)

        await supabase.from('transactions').insert({
          member_id: member.id,
          community_id: community.id,
          affiliate_id: affiliateId,
          amount,
          currency: session.currency ?? 'eur',
          platform_fee: fees.platformFee,
          affiliate_fee: fees.affiliateFee,
          creator_amount: fees.creatorAmount,
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'succeeded',
        })

        if (affiliateId) {
          await supabase.rpc('increment_affiliate_earnings', {
            p_affiliate_id: affiliateId,
            p_amount: fees.affiliateFee,
          })
        }

        if (community.platform === 'telegram' && community.bot_token) {
          try {
            const inviteLink = await generateInviteLink(
              community.bot_token,
              community.platform_id,
              member.name ?? member.email
            )

            await supabase.from('members').update({ bot_access_granted: true }).eq('id', member.id)

            await sendEmail({
              to: member.email,
              subject: `Ton accès à ${community.name} est prêt`,
              template: 'welcome',
              data: {
                memberName: member.name ?? 'toi',
                communityName: community.name,
                inviteLink,
              },
            })
          } catch (botError) {
            console.error('Erreur bot Telegram:', botError)
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { data: member } = await supabase
          .from('members')
          .select('*, communities(*)')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (!member) break

        await supabase
          .from('members')
          .update({ status: 'cancelled', bot_access_granted: false })
          .eq('id', member.id)

        const community = member.communities as any

        if (community?.platform === 'telegram' && community?.bot_token && member.platform_user_id) {
          await revokeMemberAccess(
            community.bot_token,
            community.platform_id,
            parseInt(member.platform_user_id, 10)
          ).catch(console.error)
        }

        await sendEmail({
          to: member.email,
          subject: `Ton accès à ${community?.name} a expiré`,
          template: 'cancelled',
          data: { communityName: community?.name, communitySlug: community?.slug },
        })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        const { data: member } = await supabase
          .from('members')
          .select('*, communities(*)')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (!member) break

        await supabase.from('members').update({ status: 'past_due' }).eq('id', member.id)

        const community = member.communities as any

        await sendEmail({
          to: member.email,
          subject: `Problème de paiement - ${community?.name}`,
          template: 'payment_failed',
          data: {
            communityName: community?.name,
            communitySlug: community?.slug,
          },
        })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('members')
          .update({
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur traitement webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
