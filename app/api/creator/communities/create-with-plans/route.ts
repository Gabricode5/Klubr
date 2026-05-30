import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { name, description, platform, slug, botToken, platformId, plans } = await req.json()

  if (!name || !platform || !slug || !plans?.length) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const supabase = createAdminClient()

  await supabase.from('creators').upsert({ id: user.id }, { onConflict: 'id' })

  const { data: community, error: communityError } = await supabase
    .from('communities')
    .insert({
      creator_id: user.id,
      name,
      description: description || null,
      platform,
      slug,
      bot_token: botToken || null,
      platform_id: platformId || null,
      active: true,
    })
    .select()
    .single()

  if (communityError) {
    if (communityError.code === '23505') {
      return NextResponse.json({ error: 'Ce nom est déjà utilisé. Choisissez un autre nom.' }, { status: 409 })
    }
    return NextResponse.json({ error: communityError.message }, { status: 500 })
  }

  const planRows = plans.map((p: { name: string; price: number; interval: string; trialDays: number }) => ({
    community_id: community.id,
    name: p.name,
    price: p.price,
    currency: 'eur',
    interval: p.interval,
    trial_days: p.trialDays ?? 0,
    active: true,
  }))

  const { error: plansError } = await supabase.from('subscription_plans').insert(planRows)

  if (plansError) {
    await supabase.from('communities').delete().eq('id', community.id)
    return NextResponse.json({ error: plansError.message }, { status: 500 })
  }

  return NextResponse.json({ community, slug })
}
