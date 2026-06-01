import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-server'
import { CopyButton } from '@/components/copy-button'

interface PageProps {
  params: Promise<{ referral_code: string }>
}

export default async function MemberReferralPage({ params }: PageProps) {
  const { referral_code } = await params
  const supabase = createAdminClient()
  const { data: member } = await supabase
    .from('members')
    .select('id, name, referral_code, successful_referrals, communities(slug, name)')
    .eq('referral_code', referral_code)
    .single()

  if (!member?.referral_code) notFound()

  const community = member.communities as unknown as { slug: string; name: string } | null
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${community?.slug}?r=${member.referral_code}`

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl">
            🔗
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Ton lien de parrainage</h1>
          <p className="mt-2 text-sm text-slate-500">
            {member.name ?? 'Membre'}, partage ce lien pour inviter de nouveaux abonnés sur{' '}
            <strong>{community?.name ?? 'ta communauté'}</strong>.
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="break-all text-sm font-mono text-slate-700">{shareUrl}</p>
        </div>

        <div className="mb-6">
          <CopyButton text={shareUrl} />
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-sm text-emerald-700">
            Parrainages réussis :{' '}
            <strong className="text-lg">{member.successful_referrals}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
