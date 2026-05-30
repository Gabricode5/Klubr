import { redirect } from 'next/navigation'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server'

function RiskBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">N/A</span>
  if (score < 30) return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{score} Faible</span>
  if (score <= 70) return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">{score} Moyen</span>
  return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">{score} Élevé</span>
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Actif</span>
  if (status === 'cancelled') return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Annulé</span>
  return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">{status}</span>
}

export default async function MembersPage() {
  const userClient = await createServerSupabaseClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createAdminClient()

  // Récupérer uniquement les communautés du créateur connecté
  const { data: communities } = await supabase
    .from('communities')
    .select('id')
    .eq('creator_id', user.id)

  const communityIds = (communities ?? []).map((c) => c.id)

  const { data: members } = communityIds.length > 0
    ? await supabase
        .from('members')
        .select('id, email, status, churn_score, communities(name), subscription_plans(name)')
        .in('community_id', communityIds)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Membres</h1>
          <p className="mt-1 text-sm text-slate-500">{members?.length ?? 0} membres au total</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {!members || members.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl">👥</p>
            <p className="mt-3 font-medium text-slate-700">Aucun membre pour l'instant</p>
            <p className="mt-1 text-sm text-slate-400">Les membres apparaîtront ici après leur premier paiement.</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Communauté</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Statut</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Risque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{member.email}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {(member.communities as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {(member.subscription_plans as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={member.status} /></td>
                  <td className="px-5 py-3.5"><RiskBadge score={member.churn_score} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
