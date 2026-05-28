import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">Klubr</h1>
      <p className="mb-8 text-gray-600">
        Plateforme de monétisation de communautés Telegram/Discord/WhatsApp via Stripe et Supabase.
      </p>
      <Link
        href="/pay/demo"
        className="inline-flex w-fit items-center rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800"
      >
        Voir un exemple de page de paiement
      </Link>
    </main>
  )
}
