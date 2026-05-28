#!/bin/bash
# setup.sh — Bootstrap CommunityPay
# Usage : bash setup.sh

set -e

echo "🚀 Setup CommunityPay..."

# 1. Créer le projet Next.js
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-git

# 2. Dépendances principales
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  stripe \
  @stripe/stripe-js \
  grammy \
  discord.js \
  resend \
  zod \
  @hookform/resolvers \
  react-hook-form \
  date-fns \
  lucide-react \
  clsx \
  tailwind-merge \
  class-variance-authority

# 3. shadcn/ui
npx shadcn@latest init --defaults
npx shadcn@latest add button card input label badge table tabs dialog sheet toast skeleton avatar dropdown-menu

# 4. Dev dependencies
npm install -D \
  @types/node \
  supabase

# 5. Créer la structure de dossiers
mkdir -p \
  app/\(auth\)/login \
  app/\(auth\)/register \
  app/\(dashboard\)/dashboard/communities \
  app/\(dashboard\)/dashboard/payments \
  app/\(dashboard\)/dashboard/affiliates \
  app/\(dashboard\)/dashboard/settings \
  app/pay/\[slug\] \
  app/api/webhooks/stripe \
  app/api/webhooks/telegram \
  app/api/communities \
  app/api/subscriptions \
  app/api/onboarding \
  lib \
  components/dashboard \
  components/pay-page \
  types \
  bots/telegram/handlers \
  bots/discord \
  supabase/migrations

# 6. Fichier .env.local template
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Bots
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DISCORD_BOT_TOKEN=your_discord_bot_token

# Email
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# 7. .gitignore additions
cat >> .gitignore << 'EOF'

# Local env
.env.local
.env.*.local
EOF

echo "✅ Structure créée. Configure .env.local puis lance : npm run dev"
