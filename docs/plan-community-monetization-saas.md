# 🚀 Plan — Community Monetization SaaS (Clone EU/FR)

> **Objectif :** Reproduire le modèle validé ($730k TTM / 97% marge) sur le marché EU/FR
> **Timeline :** MVP en 4 semaines, premiers revenus en 6 semaines
> **Stack :** Next.js + Supabase + Stripe Connect + Vercel

---

## 📊 Analyse du modèle original

| Métrique | Valeur | Ce que ça signifie |
|---|---|---|
| ARR | $756k | Marché validé |
| TTM Profit | $710k | 97% de marge nette |
| Croissance YoY | 42% | Marché en expansion |
| Churn | 1-3% | Rétention excellente |
| Clients | 500-999 | Base diversifiée |
| Marketing | Zéro | Viralité naturelle |
| Team | Solo | Reproductible seul |

**Insight clé :** Croissance 100% organique sans aucun marketing → le produit se vend seul par bouche-à-oreille dans les communautés.

---

## 🎯 Positionnement EU/FR

### Différenciation vs l'original (US)
- Interface et support 100% en français
- Conformité TVA EU automatique (OSS)
- Stripe EU-native (paiements en EUR)
- Ciblage : communautés trading, crypto, coaching, business FR
- RGPD-compliant by design

### Concurrents directs à surveiller
| Concurrent | Force | Faiblesse |
|---|---|---|
| Whop | Gros, bien financé | 100% anglophone, UX complexe |
| Stan Store | Simple, créateurs US | Pas disponible EU |
| Systeme.io | FR mais généraliste | Pas focalisé communautés |
| Skool | Communautés mais learning | Pas Telegram/Discord natif |

**Fenêtre d'opportunité :** 12-18 mois avant que Whop s'internationalise.

---

## 💰 Business Model

### Tier Freemium (acquisition)
- Accès gratuit à toutes les fonctionnalités
- **Commission : 15%** sur les ventes des créateurs
- Pas de limite de membres
- Bot Telegram/Discord inclus

### Tier Business — 79€/mois (rétention + upsell)
- Commission réduite à **4%**
- Analytics avancés
- Affiliate program personnalisé
- Support prioritaire
- Accès API

### Projection revenus (modèle conservateur)
```
Mois 3  : 50 créateurs actifs × 200€ volume moyen → 1.500€ MRR (take-rate)
Mois 6  : 200 créateurs × 300€ volume + 20 Business plan → 9.000€ + 1.580€ = 10.580€ MRR
Mois 12 : 600 créateurs × 400€ volume + 80 Business plan → 36.000€ + 6.320€ = 42.320€ MRR
```

---

## 🏗️ Architecture Technique

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│            Next.js 14 + Tailwind + shadcn/ui         │
│  Dashboard créateur | Pages de paiement | Analytics  │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│                   API ROUTES                         │
│              Next.js API + tRPC                      │
│   Auth | Payments | Webhooks | Bot Management        │
└──────┬────────────────────────────┬─────────────────┘
       │                            │
┌──────▼──────┐            ┌────────▼────────┐
│  Supabase   │            │  Stripe Connect  │
│  Postgres   │            │  Paiements EU    │
│  Auth       │            │  TVA auto        │
│  Storage    │            │  Payouts créa    │
└─────────────┘            └─────────────────┘
       │
┌──────▼──────────────────────────────────────────────┐
│                  BOT LAYER                           │
│   Telegram Bot API | Discord.js | WhatsApp Business  │
│   Accès auto | Révocation auto | Gestion membres     │
└─────────────────────────────────────────────────────┘
```

### Stack complète
```
Frontend      : Next.js 14 (App Router) + TypeScript
Styling       : Tailwind CSS + shadcn/ui
Backend       : Next.js API Routes + tRPC
Database      : Supabase (Postgres + Auth + Realtime)
Paiements     : Stripe Connect (marketplace model)
Bots          : Grammy (Telegram) + Discord.js + WhatsApp Business API
Hosting       : Vercel (frontend) + Railway (bots long-running)
Emails        : Resend
Monitoring    : Sentry
Analytics     : PostHog (self-hosted)
```

### Coût infra mensuel estimé
```
Vercel Pro        : 20€/mois
Supabase Pro      : 25€/mois
Railway           : 10€/mois (bots)
Resend            : 0€ (10k emails gratuits)
Sentry            : 0€ (tier gratuit)
PostHog           : 0€ (tier gratuit)
Domaine           : 1€/mois
─────────────────────────────
TOTAL             : ~56€/mois
```

---

## 📁 Structure du Projet

```
community-pay/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Vue principale créateur
│   │   │   ├── communities/          # Gestion communautés
│   │   │   ├── payments/             # Historique paiements
│   │   │   ├── affiliates/           # Programme affiliation
│   │   │   └── settings/             # Config compte + Stripe
│   │   └── layout.tsx
│   ├── pay/
│   │   └── [slug]/page.tsx           # Page paiement publique
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts       # Webhooks Stripe
│   │   │   └── telegram/route.ts     # Webhooks Telegram
│   │   ├── communities/route.ts
│   │   ├── subscriptions/route.ts
│   │   └── bots/route.ts
│   └── layout.tsx
├── lib/
│   ├── stripe.ts                     # Stripe Connect config
│   ├── supabase.ts                   # Client Supabase
│   ├── telegram.ts                   # Grammy bot config
│   ├── discord.ts                    # Discord.js config
│   └── vat.ts                        # Calcul TVA EU
├── bots/
│   ├── telegram/
│   │   ├── index.ts                  # Bot principal
│   │   ├── handlers/
│   │   │   ├── join.ts               # Gestion accès
│   │   │   └── revoke.ts             # Révocation accès
│   │   └── middleware/
│   ├── discord/
│   │   └── index.ts
│   └── whatsapp/
│       └── index.ts
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── dashboard/
│   └── pay-page/
└── types/
    └── database.ts                   # Types Supabase générés
```

---

## 🗄️ Schéma Base de Données

```sql
-- Créateurs
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_account_id TEXT UNIQUE,        -- Stripe Connect account
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'free',             -- 'free' | 'business'
  commission_rate DECIMAL DEFAULT 0.15, -- 15% ou 4%
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communautés
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,            -- URL page paiement
  platform TEXT NOT NULL,              -- 'telegram' | 'discord' | 'whatsapp'
  platform_id TEXT NOT NULL,           -- ID groupe/serveur
  bot_token TEXT,                       -- Token bot dédié
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans de souscription
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id),
  name TEXT NOT NULL,                  -- 'Mensuel', 'Annuel', etc.
  price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'eur',
  interval TEXT NOT NULL,              -- 'month' | 'year' | 'one_time'
  trial_days INTEGER DEFAULT 0,
  stripe_price_id TEXT UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membres (souscripteurs)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id),
  plan_id UUID REFERENCES subscription_plans(id),
  email TEXT NOT NULL,
  platform_user_id TEXT,               -- ID Telegram/Discord
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active',        -- 'active' | 'cancelled' | 'past_due'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliés
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id),
  email TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL DEFAULT 0.20, -- 20% par défaut
  total_earned DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  community_id UUID REFERENCES communities(id),
  amount DECIMAL NOT NULL,
  platform_fee DECIMAL NOT NULL,       -- Notre commission
  creator_amount DECIMAL NOT NULL,     -- Ce que reçoit le créateur
  stripe_payment_intent_id TEXT,
  affiliate_id UUID REFERENCES affiliates(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ⚙️ Flux Technique Core

### 1. Onboarding créateur
```
1. Inscription → Supabase Auth
2. Connexion Stripe Connect (Express account)
3. Création communauté + config bot
4. Bot ajouté au groupe Telegram/Discord
5. Génération page paiement (slug unique)
6. Page live en < 2 minutes
```

### 2. Paiement membre
```
1. Membre visite /pay/[slug]
2. Choisit un plan → Stripe Checkout
3. Webhook Stripe → paiement confirmé
4. Bot invite automatiquement dans le groupe
5. Subscription créée en DB
6. Email de confirmation (Resend)
```

### 3. Révocation accès (churn / impayé)
```
1. Stripe webhook → subscription.deleted ou invoice.payment_failed
2. Bot kick automatique du groupe
3. Email de relance (si impayé)
4. Status membre → 'cancelled' en DB
```

### 4. Calcul et distribution des revenus
```
Exemple : membre paie 100€

Platform fee (15%) = 15€ → notre compte
Creator amount     = 85€ → Stripe Connect creator account
Stripe fees        = ~3€ (déduit du platform fee)
Net platform fee   = ~12€ par transaction
```

---

## 📅 Roadmap MVP (4 semaines)

### Semaine 1 — Foundation
- [ ] Setup projet Next.js + Supabase + Stripe Connect
- [ ] Auth (inscription / connexion créateur)
- [ ] Onboarding Stripe Connect (Express)
- [ ] Schéma DB + migrations
- [ ] Bot Telegram de base (join/kick)

### Semaine 2 — Core Product
- [ ] Dashboard créateur (création communauté)
- [ ] Pages de paiement publiques (/pay/[slug])
- [ ] Stripe Checkout + webhooks
- [ ] Automatisation accès/révocation Telegram
- [ ] Gestion subscriptions (mensuel/annuel)

### Semaine 3 — Polish + Discord
- [ ] Bot Discord (join/kick automatique)
- [ ] Analytics basiques (revenus, membres, churn)
- [ ] Email flows (Resend) : bienvenue, renouvellement, échec paiement
- [ ] Calcul TVA EU automatique
- [ ] Page pricing + upgrade Business plan

### Semaine 4 — Growth Features
- [ ] Programme d'affiliation
- [ ] Page personnalisable (logo, couleurs, description)
- [ ] Dashboard analytics avancé (MRR, LTV, churn)
- [ ] Multi-communautés par créateur
- [ ] Tests end-to-end + fix bugs

---

## 🚀 Go-to-Market

### Cibles prioritaires (marché FR)
1. **Traders / signaux** — communautés Telegram payantes très nombreuses en FR
2. **Coachs business** — formation + groupe privé
3. **Crypto / NFT** — alpha groups, whitelists
4. **Créateurs de contenu** — accès exclusif fans
5. **Experts niche** — immobilier, bourse, développement perso

### Plan lancement (J-14 à J+30)

**J-14 : Pré-lancement**
- Créer liste d'attente (simple landing page)
- Identifier 20 créateurs FR sur Twitter/X avec communautés actives
- DM personnalisés : "Je build un outil pour monétiser ta communauté Telegram, tu veux tester en beta gratuite ?"

**J-7 : Beta fermée**
- Onboarder 5-10 bêta testeurs manuellement
- Leur setup complet (tu fais tout à leur place)
- Collecter feedback + témoignages

**J0 : Lancement public**
- Post Twitter/X build-in-public avec métriques bêta
- Post Indie Hackers
- Post dans communautés FR : r/france_bourse, groupes Facebook créateurs
- Product Hunt (si traction prouvée)

**J+7 à J+30 : Acquisition organique**
- Chaque page de paiement créée = "Propulsé par [NomProduit]" visible
- Programme de parrainage : créateur qui amène un autre créateur = 1 mois Business offert
- Contenu Twitter/X : partager les revenus des créateurs (avec permission) → preuve sociale

### Viral Loop intégré
```
Membre paie → voit "Propulsé par [Produit]" → devient créateur
Créateur active affiliation → ses membres deviennent affiliés → nouveaux membres
```

---

## 📈 Métriques à tracker dès J1

```
North Star Metric  : Volume total traité (€)
─────────────────────────────────────────────
Acquisition        : Nouveaux créateurs/semaine
Activation         : Créateurs avec ≥1 membre payant
Rétention          : Churn créateurs mensuel
Revenu             : MRR (take-rate + Business plans)
Référence          : % créateurs venus par affiliation
```

---

## ⚠️ Risques et mitigation

| Risque | Probabilité | Mitigation |
|---|---|---|
| Whop s'internationalise | Haute | Aller vite, 12-18 mois de fenêtre |
| Telegram change l'API bots | Moyenne | Architecture multi-plateformes dès le début |
| Stripe refuse le modèle marketplace | Faible | Stripe Connect prévu pour ça, mais préparer Lemon Squeezy en backup |
| Créateurs qui quittent pour Whop | Moyenne | Lock-in via affiliés + analytics (données difficiles à migrer) |
| Fraude (faux membres) | Moyenne | Vérification email + webhook Stripe strict |

---

## 🏁 Définition du succès

```
Mois 1  : 10 créateurs actifs, premier € encaissé
Mois 3  : 50 créateurs, 1.500€ MRR
Mois 6  : 200 créateurs, 10.000€ MRR
Mois 12 : 600 créateurs, 40.000€ MRR → valorisation ~2M€ (5x ARR)
```

---

*Plan généré le 28/05/2026 — basé sur l'analyse d'un SaaS validé à $730k TTM / 97% marge*
