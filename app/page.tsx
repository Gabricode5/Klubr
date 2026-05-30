import Link from 'next/link'

const features = [
  {
    icon: '💳',
    title: 'Paiements Stripe',
    desc: "Checkout, abonnements récurrents et webhooks prêts à l'emploi. Recevez vos paiements automatiquement.",
  },
  {
    icon: '🤖',
    title: 'IA intégrée',
    desc: 'Score de churn alimenté par Claude AI, résumés hebdomadaires et alertes membres à risque.',
  },
  {
    icon: '📱',
    title: 'Multi-plateformes',
    desc: "Gérez l'accès à Telegram, Discord et WhatsApp depuis un seul tableau de bord.",
  },
  {
    icon: '📊',
    title: 'Fiscalité simplifiée',
    desc: 'Rapports TVA mensuels par pays, export CSV et envoi automatique par email.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Créez votre plan',
    desc: "Définissez vos offres d'abonnement, ajoutez plusieurs communautés et fixez votre prix.",
  },
  {
    num: '02',
    title: 'Partagez votre lien',
    desc: 'Chaque communauté a une page de paiement dédiée. Partagez-la à vos futurs membres.',
  },
  {
    num: '03',
    title: 'Gérez vos membres',
    desc: 'Accès automatiques, relances, scores de churn et rapports — tout est géré pour vous.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold text-slate-900">Klubr</span>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 sm:flex">
            <a href="#features" className="hover:text-slate-900">Fonctionnalités</a>
            <a href="#how" className="hover:text-slate-900">Comment ça marche</a>
          </nav>
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <span className="mb-6 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Plateforme pour créateurs
        </span>
        <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-bold leading-tight text-slate-900">
          Monétisez votre communauté{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            en quelques minutes
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">
          Créez des abonnements, automatisez l'accès à Telegram, Discord ou WhatsApp, et gérez vos membres
          avec des insights IA. Tout en un.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            Démarrer gratuitement →
          </Link>
          <a
            href="#how"
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Voir comment ça marche
          </a>
        </div>

        {/* Hero visual */}
        <div className="mt-20 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl shadow-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-4 text-xs text-slate-400">app.klubr.io/dashboard</span>
          </div>
          <div className="grid grid-cols-4 bg-slate-900 text-left">
            <div className="col-span-1 border-r border-slate-800 p-6">
              <p className="mb-6 text-sm font-bold text-white">Klubr</p>
              {['Dashboard', 'Membres', 'Plans', 'Fiscalité'].map((item) => (
                <p key={item} className="mb-2 rounded px-2 py-1 text-xs text-slate-400 first:bg-indigo-600 first:text-white">
                  {item}
                </p>
              ))}
            </div>
            <div className="col-span-3 bg-slate-50 p-6">
              <p className="mb-4 text-sm font-bold text-slate-900">Dashboard</p>
              <div className="grid grid-cols-3 gap-3 text-left">
                {[
                  { label: 'Membres actifs', val: '142' },
                  { label: 'Revenu ce mois', val: '2 840 €' },
                  { label: 'Taux rétention', val: '94%' },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Tout ce dont vous avez besoin</h2>
            <p className="mt-3 text-slate-500">Une plateforme complète, pensée pour les créateurs.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Lancez-vous en 3 étapes</h2>
            <p className="mt-3 text-slate-500">De zéro à vos premiers abonnés en moins d'une heure.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <span className="mb-4 block text-5xl font-black text-slate-100">{s.num}</span>
                <h3 className="mb-2 font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Prêt à monétiser votre communauté ?</h2>
          <p className="mb-8 text-slate-400">
            Rejoignez les créateurs qui utilisent Klubr pour générer des revenus récurrents.
          </p>
          <Link
            href="/login"
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Klubr — Tous droits réservés
      </footer>
    </div>
  )
}
