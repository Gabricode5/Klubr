import { redirect } from 'next/navigation'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server'

async function getStats(userId: string) {
  try {
    const supabase = createAdminClient()

    const { data: communities } = await supabase
      .from('communities')
      .select('id')
      .eq('creator_id', userId)

    const communityIds = (communities ?? []).map((c) => c.id)

    if (communityIds.length === 0) {
      return { totalMembers: 0, activeMembers: 0, totalPlans: 0 }
    }

    const [{ count: totalMembers }, { count: activeMembers }, { count: totalPlans }] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }).in('community_id', communityIds),
      supabase.from('members').select('*', { count: 'exact', head: true }).in('community_id', communityIds).eq('status', 'active'),
      supabase.from('subscription_plans').select('*', { count: 'exact', head: true }).in('community_id', communityIds).eq('active', true),
    ])

    return { totalMembers: totalMembers ?? 0, activeMembers: activeMembers ?? 0, totalPlans: totalPlans ?? 0 }
  } catch {
    return { totalMembers: 0, activeMembers: 0, totalPlans: 0 }
  }
}

export default async function DashboardPage() {
  const userClient = await createServerSupabaseClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) redirect('/login')

  const stats = await getStats(user.id)

  const cards = [
    { label: 'Membres totaux', value: stats.totalMembers, icon: '👥' },
    { label: 'Membres actifs', value: stats.activeMembers, icon: '✅' },
    { label: 'Plans actifs', value: stats.totalPlans, icon: '📦' },
    {
      label: 'Taux de rétention',
      value: stats.totalMembers > 0 ? `${Math.round((stats.activeMembers / stats.totalMembers) * 100)}%` : '—',
      icon: '📈',
    },
  ]

  const quickLinks = [
    { href: '/dashboard/communities/new', label: 'Ajouter une communauté', desc: 'Connecter Telegram et définir les tarifs' },
    { href: '/dashboard/members', label: 'Voir les membres', desc: 'Gérer et analyser vos abonnés' },
    { href: '/dashboard/fiscalite', label: 'Rapport fiscal', desc: 'TVA et exports comptables' },
    { href: '/dashboard/settings/referral', label: 'Parrainage', desc: 'Configurer les récompenses' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Vue d'ensemble de votre activité</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-2xl">{card.icon}</div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Actions rapides</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <p className="font-semibold text-slate-900 group-hover:text-indigo-600">{link.label}</p>
            <p className="mt-1 text-xs text-slate-500">{link.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
