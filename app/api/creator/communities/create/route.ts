import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { name, description, platform, slug, botToken, platformId } = await req.json()

  if (!name || !platform || !slug) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const supabase = createAdminClient()

  await supabase.from('creators').upsert({ id: user.id }, { onConflict: 'id' })

  const { data, error } = await supabase
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

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé. Choisissez un autre nom.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ community: data })
}
