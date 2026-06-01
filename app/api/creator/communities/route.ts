import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const userClient = await createServerSupabaseClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const supabase = createAdminClient()
    const { data: communities } = await supabase
      .from('communities')
      .select('id, name, platform')
      .eq('creator_id', user.id)
      .eq('active', true)
      .order('name')

    return NextResponse.json({ communities: communities ?? [] })
  } catch (error) {
    console.error('Erreur communities creator:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
