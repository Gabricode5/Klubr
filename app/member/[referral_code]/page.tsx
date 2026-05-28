import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'

interface PageProps {
  params: { referral_code: string }
}

export default async function MemberReferralPage({ params }: PageProps) {
  const supabase = createAdminClient()
  const { data: member } = await supabase
    .from('members')
    .select('id, name, referral_code, successful_referrals, communities(slug, name)')
    .eq('referral_code', params.referral_code)
    .single()

  if (!member?.referral_code) notFound()

  const community = member.communities as { slug: string; name: string } | null
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${community?.slug}?r=${member.referral_code}`

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Ton lien de parrainage</h1>
      <p className="mt-2 text-gray-600">
        {member.name ?? 'Membre'}, partage ce lien pour parrainer de nouveaux abonnés sur{' '}
        {community?.name ?? 'ta communauté'}.
      </p>
      <div className="mt-6 rounded-lg border bg-gray-50 p-4 break-all">{shareUrl}</div>
      <p className="mt-4 text-sm text-gray-700">
        Parrainages réussis: <strong>{member.successful_referrals}</strong>
      </p>
    </main>
  )
}
