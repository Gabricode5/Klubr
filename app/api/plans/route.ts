import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server'

const PlanSchema = z.object({
  primaryCommunityId: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('eur'),
  interval: z.enum(['month', 'year', 'one_time']),
  trialDays: z.number().int().min(0).default(0),
  communityIds: z.array(z.string().uuid()).min(1),
})

export async function POST(req: NextRequest) {
  try {
    const userClient = await createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = PlanSchema.parse(await req.json())
    const supabase = createAdminClient()

    // Vérifier que la communauté appartient à l'utilisateur connecté
    const { data: community } = await supabase
      .from('communities')
      .select('id')
      .eq('id', body.primaryCommunityId)
      .eq('creator_id', user.id)
      .single()

    if (!community) {
      return NextResponse.json({ error: 'Communauté introuvable ou accès refusé' }, { status: 403 })
    }

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        community_id: body.primaryCommunityId,
        name: body.name,
        description: body.description ?? null,
        price: body.price,
        currency: body.currency,
        interval: body.interval,
        trial_days: body.trialDays,
        active: true,
      })
      .select('id')
      .single()

    if (error || !plan) {
      return NextResponse.json({ error: 'Plan non créé' }, { status: 400 })
    }

    await supabase.from('plan_communities').insert(
      body.communityIds.map((communityId) => ({
        plan_id: plan.id,
        community_id: communityId,
      }))
    )

    return NextResponse.json({ planId: plan.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Payload invalide', details: error.issues }, { status: 400 })
    }
    console.error('Erreur création plan:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
