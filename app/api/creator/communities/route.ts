import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase-server'

const QuerySchema = z.object({
  creatorId: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { creatorId } = QuerySchema.parse({
      creatorId: searchParams.get('creatorId'),
    })

    const supabase = createAdminClient()
    const { data: communities } = await supabase
      .from('communities')
      .select('id, name, platform')
      .eq('creator_id', creatorId)
      .eq('active', true)
      .order('name')

    return NextResponse.json({ communities: communities ?? [] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'creatorId invalide' }, { status: 400 })
    }
    console.error('Erreur communities creator:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
