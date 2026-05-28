import { createAdminClient } from '@/lib/supabase'

function riskLabel(score: number | null) {
  if (score === null) return { label: 'N/A', className: 'bg-gray-100 text-gray-700' }
  if (score < 30) return { label: `${score} Faible`, className: 'bg-green-100 text-green-700' }
  if (score <= 70) return { label: `${score} Moyen`, className: 'bg-orange-100 text-orange-700' }
  return { label: `${score} Elevé`, className: 'bg-red-100 text-red-700' }
}

export default async function MembersDashboardPage() {
  const supabase = createAdminClient()
  const { data: members } = await supabase
    .from('members')
    .select('id, email, status, churn_score, communities(name), subscription_plans(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">Membres</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Communauté</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Risque</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((member) => {
              const risk = riskLabel(member.churn_score)
              return (
                <tr key={member.id} className="border-t">
                  <td className="p-3">{member.email}</td>
                  <td className="p-3">{member.communities?.name ?? '-'}</td>
                  <td className="p-3">{member.subscription_plans?.name ?? '-'}</td>
                  <td className="p-3">{member.status}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${risk.className}`}>
                      {risk.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
