import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase'

const Schema = z.object({
  creatorId: z.string().uuid(),
  referralRewardDays: z.number().int().min(1).max(90),
})

export async function POST(req: NextRequest) {
  try {
    const { creatorId, referralRewardDays } = Schema.parse(await req.json())
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('creators')
      .update({ referral_reward_days: referralRewardDays })
      .eq('id', creatorId)

    if (error) {
      return NextResponse.json({ error: 'Update impossible' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })
    }
    console.error('Erreur referral config:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
