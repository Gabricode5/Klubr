import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { PayPageClient } from '@/components/pay-page/pay-page-client'

interface PageProps {
  params: { slug: string }
  searchParams: { ref?: string }
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createAdminClient()
  const { data: community } = await supabase
    .from('communities')
    .select('name, description, cover_image_url')
    .eq('slug', params.slug)
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
  const supabase = createAdminClient()

  const { data: community } = await supabase
    .from('communities')
    .select('id, name, description, cover_image_url, platform, slug')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (!community) notFound()

  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('community_id', community.id)
    .eq('active', true)
    .order('price', { ascending: true })

  return <PayPageClient community={community} plans={plans ?? []} affiliateCode={searchParams.ref} />
}
