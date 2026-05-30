import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-server'
import { PayPageClient } from '@/components/pay-page/pay-page-client'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string; r?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = createAdminClient()
  const { data: community } = await supabase
    .from('communities')
    .select('name, description, cover_image_url')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!community) return { title: 'Communauté introuvable' }

  return {
    title: community.name,
    description: community.description ?? `Rejoins ${community.name}`,
    openGraph: {
      title: community.name,
      description: community.description ?? '',
      images: community.cover_image_url ? [community.cover_image_url] : [],
    },
  }
}

export default async function PayPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { ref, r } = await searchParams
  const supabase = createAdminClient()

  const { data: community } = await supabase
    .from('communities')
    .select('id, name, description, cover_image_url, platform, slug')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!community) notFound()

  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('community_id', community.id)
    .eq('active', true)
    .order('price', { ascending: true })

  const planIds = (plans ?? []).map((plan) => plan.id)
  let platformsByPlan: Record<string, string[]> = {}

  if (planIds.length > 0) {
    const { data: planCommunities } = await supabase
      .from('plan_communities')
      .select('plan_id, communities(platform)')
      .in('plan_id', planIds)

    platformsByPlan = (planCommunities ?? []).reduce<Record<string, string[]>>((acc, entry) => {
      const planId = (entry as { plan_id: string }).plan_id
      const platform = (entry as { communities: { platform: string } }).communities?.platform
      if (!platform) return acc
      const current = acc[planId] ?? []
      acc[planId] = current.includes(platform) ? current : [...current, platform]
      return acc
    }, {})
  }

  return (
    <PayPageClient
      community={community}
      plans={plans ?? []}
      affiliateCode={ref}
      referralCode={r}
      platformsByPlan={platformsByPlan}
    />
  )
}
