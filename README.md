# Klubr

Base MVP Next.js pour monétiser des communautés privées (Telegram, Discord, WhatsApp) avec:

- Stripe Checkout + webhooks
- Supabase (Auth + Postgres + RLS)
- Emails transactionnels via Resend
- Gestion d'accès Telegram via bot

## Démarrage rapide

1. Copier les variables:

```bash
cp .env.example .env.local
```

2. Installer les dépendances:

```bash
npm install
```

3. Lancer le projet:

```bash
npm run dev
```

4. Appliquer la migration SQL:

- Exécuter `supabase/migrations/001_initial.sql` dans ton projet Supabase.

## Endpoints

- `POST /api/subscriptions/checkout`
- `POST /api/webhooks/stripe`

## Structure

- `app/` pages et routes API Next.js
- `components/` UI et page de paiement
- `lib/` clients et intégrations Stripe/Supabase/Telegram/Resend
- `types/` types partagés
- `supabase/migrations/` schéma SQL
