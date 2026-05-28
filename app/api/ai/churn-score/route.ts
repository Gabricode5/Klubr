import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { askClaudeJson } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase'
import { sendRawEmail } from '@/lib/resend'

const MemberSignalSchema = z.object({
  member_id: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  reason: z.string().min(8),
})

const ResponseSchema = z.array(MemberSignalSchema)

type ScoredMember = z.infer<typeof MemberSignalSchema>

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: members } = await supabase
      .from('members')
      .select(
        'id, email, name, plan_id, status, created_at, current_period_end, churn_score, subscription_plans(interval), communities(name, slug)'
      )
      .in('status', ['active', 'trialing', 'past_due'])

    const now = Date.now()
    const memberSignals = (members ?? []).map((member) => {
      const periodEndMs = member.current_period_end ? new Date(member.current_period_end).getTime() : null
      const daysBeforeBilling = periodEndMs ? Math.max(0, Math.round((periodEndMs - now) / 86400000)) : null
      const memberAgeDays = Math.max(0, Math.round((now - new Date(member.created_at).getTime()) / 86400000))
      return {
        member_id: member.id,
        days_before_billing: daysBeforeBilling,
        had_past_due: member.status === 'past_due',
        member_age_days: memberAgeDays,
        plan_interval: member.subscription_plans?.interval ?? 'month',
      }
    })

    if (memberSignals.length === 0) {
      return NextResponse.json({ updated: 0 })
    }

    const system = `Tu es un analyste churn B2C SaaS. Tu réponds uniquement en JSON valide.`
    const prompt = `Calcule un score de churn de 0 à 100 pour chaque membre.
Règles:
- Proche de la prochaine facturation => risque monte.
- Historique ou statut past_due => risque élevé.
- 30 premiers jours plus risqués.
- Si plan_interval = one_time => churn implicite élevé.
Retourne un tableau JSON strict:
[{"member_id":"uuid","score":0-100,"reason":"raison courte"}]
Données:
${JSON.stringify(memberSignals)}`

    const scored = ResponseSchema.parse(await askClaudeJson<ScoredMember[]>(system, prompt))

    for (const member of scored) {
      const previous = members?.find((m) => m.id === member.member_id)?.churn_score ?? null
      await supabase
        .from('members')
        .update({
          churn_score: member.score,
          churn_score_updated_at: new Date().toISOString(),
        })
        .eq('id', member.member_id)

      if (member.score > 70 && (previous === null || previous <= 70)) {
        const targetMember = members?.find((m) => m.id === member.member_id)
        if (!targetMember) continue
        const emailPayload = await askClaudeJson<{ subject: string; html: string }>(
          'Tu es copywriter CRM. Réponds uniquement avec un JSON valide.',
          `Génère un email de relance en français, ton direct et empathique.
Contexte:
- Membre: ${targetMember.name ?? 'Membre'}
- Communauté: ${targetMember.communities?.name ?? 'communauté'}
- Raison risque: ${member.reason}
Retour attendu:
{"subject":"...","html":"<div>...</div>"}
`
        )
        await sendRawEmail({
          to: targetMember.email,
          subject: emailPayload.subject,
          html: emailPayload.html,
        })
      }
    }

    return NextResponse.json({ updated: scored.length })
  } catch (error) {
    console.error('Erreur churn-score:', error)
    return NextResponse.json({ error: 'Failed to compute churn scores' }, { status: 500 })
  }
}
