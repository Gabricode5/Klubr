import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent, calculateFees, extendSubscriptionByDays } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-server'
import { generateInviteLink, revokeMemberAccess } from '@/lib/telegram'
import { sendEmail } from '@/lib/resend'

type MemberDbStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'

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
        const planId = metadata.plan_id
        const communitySlug = metadata.community_slug
        const affiliateCode = metadata.affiliate_code || null
        const referralCode = metadata.referral_code || null

        if (!communitySlug) break

        const { data: community } = await supabase
          .from('communities')
          .select('*, creators(*)')
          .eq('slug', communitySlug)
          .single()

        if (!community) break

        if (!planId) break

        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .eq('active', true)
          .single()

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

        let referredByMemberId: string | null = null
        if (referralCode) {
          const { data: referrer } = await supabase
            .from('members')
            .select('id')
            .eq('referral_code', referralCode)
            .single()
          referredByMemberId = referrer?.id ?? null
        }

        const { data: member, error: memberError } = await supabase
          .from('members')
          .insert({
            community_id: community.id,
            plan_id: plan.id,
            affiliate_id: affiliateId,
            referred_by_member_id: referredByMemberId,
            email: session.customer_details?.email ?? '',
            name: session.customer_details?.name ?? '',
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            status: 'active',
          })
          .select()
          .single()

        if (memberError || !member) break

        const { data: linkedCommunities } = await supabase
          .from('plan_communities')
          .select('community_id, communities(id, name, slug, platform, platform_id, bot_token)')
          .eq('plan_id', plan.id)

        type LinkedCommunity = {
          id: string
          name: string
          slug: string
          platform: 'telegram' | 'discord' | 'whatsapp'
          platform_id: string
          bot_token: string | null
        }

        const communityTargets: LinkedCommunity[] =
          linkedCommunities && linkedCommunities.length > 0
            ? linkedCommunities
                .map((entry) => entry.communities as unknown as LinkedCommunity)
                .filter((entry) => !!entry)
            : [
                {
                  id: community.id,
                  name: community.name,
                  slug: community.slug,
                  platform: community.platform,
                  platform_id: community.platform_id,
                  bot_token: community.bot_token,
                },
              ]

        const amount = (session.amount_total ?? 0) / 100
        const creator = community.creators as {
          commission_rate: number
          id: string
          referral_reward_days: number
        } | null
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

        await supabase.from('member_community_access').insert(
          communityTargets.map((target) => ({
            member_id: member.id,
            community_id: target.id,
          }))
        )

        if (affiliateId) {
          await supabase.rpc('increment_affiliate_earnings', {
            p_affiliate_id: affiliateId,
            p_amount: fees.affiliateFee,
          })
        }

        const inviteLinks: string[] = []
        for (const target of communityTargets) {
          if (target.platform === 'telegram' && target.bot_token) {
            try {
              const inviteLink = await generateInviteLink(
                target.bot_token,
                target.platform_id,
                member.name ?? member.email
              )
              inviteLinks.push(`${target.name}: ${inviteLink}`)
            } catch (botError) {
              console.error('Erreur bot Telegram:', botError)
            }
          }
        }

        if (inviteLinks.length > 0) {
          await supabase.from('members').update({ bot_access_granted: true }).eq('id', member.id)
          await sendEmail({
            to: member.email,
            subject: `Ton accès à ${community.name} est prêt`,
            template: 'welcome',
            data: {
              memberName: member.name ?? 'toi',
              communityName: community.name,
              inviteLink: inviteLinks.join('<br/>'),
              referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/member/${member.referral_code}`,
            },
          })
        }

        if (referredByMemberId && session.subscription && creator?.referral_reward_days) {
          const referrerMember = await supabase
            .from('members')
            .select('stripe_subscription_id')
            .eq('id', referredByMemberId)
            .single()

          if (referrerMember.data?.stripe_subscription_id) {
            await extendSubscriptionByDays(
              referrerMember.data.stripe_subscription_id,
              creator.referral_reward_days
            ).catch((err) => console.error('Erreur extension parrainage:', err))
          }

          await supabase.rpc('increment_successful_referrals', {
            p_member_id: referredByMemberId,
          })
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { data: member } = await supabase
          .from('members')
          .select('*, communities(*), plan_communities(plan_id, communities(*))')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (!member) break

        await supabase
          .from('members')
          .update({ status: 'cancelled', bot_access_granted: false })
          .eq('id', member.id)

        const accesses = await supabase
          .from('member_community_access')
          .select('community_id, communities(platform, platform_id, bot_token)')
          .eq('member_id', member.id)
          .is('revoked_at', null)

        const communitiesToRevoke =
          accesses.data?.map((entry) => entry.communities).filter((item) => !!item) ?? []

        if (member.platform_user_id) {
          for (const linkedCommunity of communitiesToRevoke) {
            const scoped = linkedCommunity as {
              platform: 'telegram' | 'discord' | 'whatsapp'
              platform_id: string
              bot_token: string | null
            }
            if (scoped.platform === 'telegram' && scoped.bot_token) {
              await revokeMemberAccess(
                scoped.bot_token,
                scoped.platform_id,
                parseInt(member.platform_user_id, 10)
              ).catch(console.error)
            }
          }
        }

        await supabase
          .from('member_community_access')
          .update({ revoked_at: new Date().toISOString() })
          .eq('member_id', member.id)
          .is('revoked_at', null)

        const community = member.communities as { name?: string; slug?: string } | null
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
            status: subscription.status as MemberDbStatus,
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
