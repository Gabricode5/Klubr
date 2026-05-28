# CommunityPay — Build complet

## Contexte
Je veux que tu buildes de A à Z un SaaS de monétisation de communautés en ligne, inspiré du modèle validé de Whop.com mais ciblant le marché francophone EU.

## Ce que fait le produit
Un créateur (coach, trader, expert) peut connecter son groupe Telegram, Discord ou WhatsApp, créer des plans d'abonnement payants, et partager une page de paiement publique. Quand un membre paie, il reçoit automatiquement l'accès au groupe. Quand son abonnement expire ou échoue, il est kické automatiquement.

## Business model
- Freemium : gratuit avec 15% de commission sur les ventes
- Plan Business à 79€/mois : commission réduite à 4%
- Double revenu : take-rate + SaaS mensuel

## Stack technique
- Next.js 14 App Router + TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth + RLS)
- Stripe Connect (modèle marketplace)
- Grammy pour les bots Telegram
- Discord.js pour les bots Discord
- Resend pour les emails transactionnels
- Déploiement Vercel

## Ce que tu dois builder

### 1. Auth
Inscription / connexion créateur via Supabase Auth. À l'inscription, créer automatiquement un profil créateur en DB.

### 2. Onboarding Stripe Connect
Le créateur connecte son compte Stripe Express pour recevoir les paiements. Sans ça, il ne peut pas activer sa communauté.

### 3. Dashboard créateur
- MRR, membres actifs, churn, croissance MoM
- Graphique revenus 30 jours
- Liste des dernières transactions

### 4. Gestion des communautés
Créer une communauté = choisir la plateforme (Telegram/Discord/WhatsApp), entrer l'ID du groupe et le token du bot. Vérifier que le bot est bien admin avant de valider.

### 5. Plans d'abonnement
Par communauté : créer des plans (mensuel, annuel, one-time) avec prix, période d'essai, description. Chaque plan crée un prix dans Stripe.

### 6. Page de paiement publique
Route `/pay/[slug]` accessible sans auth. Affiche la communauté, les plans disponibles, et un bouton qui lance le Stripe Checkout. Lien d'affiliation via `?ref=CODE`.

### 7. Webhooks Stripe
C'est le cœur du système :
- `checkout.session.completed` → créer le membre en DB + envoyer le lien d'invitation Telegram par email
- `customer.subscription.deleted` → kicker le membre du groupe + email
- `invoice.payment_failed` → passer le membre en past_due + email de relance
- `customer.subscription.updated` → mettre à jour les dates en DB

### 8. Gestion des membres
Tableau des membres par communauté avec statut, plan, dates. Possibilité de révoquer manuellement l'accès.

### 9. Programme d'affiliation
Le créateur peut créer des affiliés avec un code unique. Chaque vente tracée via `?ref=CODE` génère une commission (20% par défaut) pour l'affilié.

### 10. Landing page
Page marketing simple : hero, comment ça marche, pricing, FAQ.

## Schéma DB (tables principales)
- `creators` : profil créateur + stripe_account_id + plan + commission_rate
- `communities` : nom, slug, platform, platform_id, bot_token
- `subscription_plans` : prix, intervalle, stripe_price_id
- `members` : email, statut, stripe_subscription_id, platform_user_id
- `affiliates` : code, commission_rate, total_earned
- `transactions` : amount, platform_fee, creator_amount

Activer RLS sur toutes les tables. Un créateur ne voit que ses propres données.

## Règles
- TypeScript strict, jamais de `any`
- Validation zod sur tous les inputs API
- Vérifier la signature sur tous les webhooks Stripe
- Jamais de secrets côté client
- Gestion d'erreur sur toutes les fonctions async
- Le footer de chaque page de paiement doit afficher "Propulsé par CommunityPay" avec un lien vers la landing page (viral loop)

## Commence par
1. Initialiser le projet Next.js avec la stack complète
2. Créer le schéma Supabase et les migrations
3. Builder feature par feature dans l'ordre ci-dessus
