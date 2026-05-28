import { NextRequest, NextResponse } from 'next/server'
import { askClaudeJson } from '@/lib/anthropic'
import { sendRawEmail } from '@/lib/resend'
import { createAdminClient } from '@/lib/supabase'

type WeeklyEmail = { subject: string; html: string }

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: creators } = await supabase.from('creators').select('id, user_id')

    if (!creators?.length) return NextResponse.json({ sent: 0 })

    const now = new Date()
    const startCurrentWeek = new Date(now)
    startCurrentWeek.setDate(now.getDate() - 7)
    const startPreviousWeek = new Date(now)
    startPreviousWeek.setDate(now.getDate() - 14)

    let sent = 0
    for (const creator of creators) {
      const { data: communities } = await supabase
        .from('communities')
        .select('id, name')
        .eq('creator_id', creator.id)

      const communityIds = (communities ?? []).map((c) => c.id)
      if (!communityIds.length) continue

      const { data: currentMembers } = await supabase
        .from('members')
        .select('id, plan_id, churn_score, created_at')
        .in('community_id', communityIds)
        .gte('created_at', startCurrentWeek.toISOString())

      const { data: previousMembers } = await supabase
        .from('members')
        .select('id')
        .in('community_id', communityIds)
        .gte('created_at', startPreviousWeek.toISOString())
        .lt('created_at', startCurrentWeek.toISOString())

      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .in('community_id', communityIds)
        .gte('created_at', startCurrentWeek.toISOString())

      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .in('community_id', communityIds)
        .gte('created_at', startPreviousWeek.toISOString())
        .lt('created_at', startCurrentWeek.toISOString())

      const { data: allMembers } = await supabase
        .from('members')
        .select('plan_id, churn_score')
        .in('community_id', communityIds)

      const { data: user } = await supabase.auth.admin.getUserById(creator.user_id)
      const creatorEmail = user.user?.email
      if (!creatorEmail) continue

      const highRisk = (allMembers ?? []).filter((m) => (m.churn_score ?? 0) > 70).length
      const currentRevenue = (currentTransactions ?? []).reduce((s, t) => s + Number(t.amount), 0)
      const previousRevenue = (previousTransactions ?? []).reduce((s, t) => s + Number(t.amount), 0)

      const retentionByPlan = (allMembers ?? []).reduce<Record<string, { total: number; safe: number }>>(
        (acc, m) => {
          const key = m.plan_id
          const current = acc[key] ?? { total: 0, safe: 0 }
          current.total += 1
          if ((m.churn_score ?? 0) < 50) current.safe += 1
          acc[key] = current
          return acc
        },
        {}
      )

      const bestPlan = Object.entries(retentionByPlan)
        .map(([planId, stats]) => ({
          planId,
          ratio: stats.total > 0 ? stats.safe / stats.total : 0,
        }))
        .sort((a, b) => b.ratio - a.ratio)[0]

      const payload = {
        new_members_current_week: currentMembers?.length ?? 0,
        new_members_previous_week: previousMembers?.length ?? 0,
        revenue_current_week: currentRevenue,
        revenue_previous_week: previousRevenue,
        high_risk_members: highRisk,
        best_retention_plan_id: bestPlan?.planId ?? null,
        communities: communities?.map((c) => c.name) ?? [],
      }

      const summary = await askClaudeJson<WeeklyEmail>(
        'Tu es un analyste SaaS. Réponds exclusivement en JSON valide.',
        `Rédige un email hebdomadaire en français, ton direct et pro.
Inclure:
- nouveaux membres semaine vs semaine passée
- revenus semaine vs semaine passée
- membres à risque de churn
- meilleur plan en rétention
- 1 conseil actionnable
Retourne strictement:
{"subject":"...","html":"<div>...</div>"}
Données:
${JSON.stringify(payload)}`
      )

      await sendRawEmail({
        to: creatorEmail,
        subject: summary.subject,
        html: summary.html,
      })
      sent += 1
    }

    return NextResponse.json({ sent })
  } catch (error) {
    console.error('Erreur weekly-summary:', error)
    return NextResponse.json({ error: 'Failed to build weekly summaries' }, { status: 500 })
  }
}
