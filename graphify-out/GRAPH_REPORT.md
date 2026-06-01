# Graph Report - Klubr  (2026-06-01)

## Corpus Check
- 56 files · ~15,106 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 416 nodes · 712 edges · 36 communities (26 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9725ca0b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 51 edges
2. `createServerSupabaseClient()` - 23 edges
3. `createClient()` - 18 edges
4. `compilerOptions` - 17 edges
5. `compilerOptions` - 17 edges
6. `🚀 Plan — Community Monetization SaaS (Clone EU/FR)` - 13 edges
7. `sendRawEmail()` - 12 edges
8. `getStripe()` - 11 edges
9. `POST()` - 11 edges
10. `Ce que tu dois builder` - 11 edges

## Surprising Connections (you probably didn't know these)
- `NewCommunityPage()` --calls--> `createClient()`  [INFERRED]
  app/dashboard/communities/new/page.tsx → lib/supabase.ts
- `POST()` --calls--> `calculateFees()`  [EXTRACTED]
  app/api/webhooks/stripe/route.ts → lib/stripe.ts
- `POST()` --calls--> `extendSubscriptionByDays()`  [EXTRACTED]
  app/api/webhooks/stripe/route.ts → lib/stripe.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/api/subscriptions/checkout/route.ts → lib/supabase-server.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/api/ai/churn-score/route.ts → lib/supabase-server.ts

## Import Cycles
- None detected.

## Communities (36 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (24): makeRequest(), mockUser, setupAuth(), validBody, GET(), QuerySchema, POST(), POST() (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (31): 1. Onboarding créateur, 2. Paiement membre, 3. Révocation accès (churn / impayé), 4. Calcul et distribution des revenus, 📊 Analyse du modèle original, 🏗️ Architecture Technique, 💰 Business Model, Cibles prioritaires (marché FR) (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (25): INTERVAL_LABELS, PayPageClientProps, PLATFORM_LABELS, Affiliate, Community, Creator, CreatorSettings, Interval (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (33): dependencies, grammy, next, react, react-dom, resend, stripe, @supabase/ssr (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (17): nav, Sidebar(), DashboardLayout(), createClient(), LoginPage(), BotInfo, CommunityOption, DEFAULT_PLAN (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (14): makeRequest(), mockPlan, CheckoutSchema, POST(), calculateFees(), createCheckoutSession(), createConnectAccount(), createOnboardingLink() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): 10. Landing page, 1. Auth, 2. Onboarding Stripe Connect, 3. Dashboard créateur, 4. Gestion des communautés, 5. Plans d'abonnement, 6. Page de paiement publique, 7. Webhooks Stripe (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (19): MemberRow, MemberSignalSchema, POST(), ResponseSchema, ScoredMember, AnthropicResponse, AnthropicTextBlock, askClaudeJson() (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): Démarrage rapide, Endpoints, Klubr, Nouveaux écrans (différenciants), Structure

### Community 10 - "Community 10"
Cohesion: 0.60
Nodes (3): features, HomePage(), steps

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (3): Cron jobs Vercel, Setup fiscalite (TVA OSS), Stripe Tax - activation

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (31): dependencies, grammy, next, react, react-dom, resend, stripe, @supabase/ssr (+23 more)

### Community 21 - "Community 21"
Cohesion: 0.19
Nodes (17): makeRequest(), mockCommunity, mockMember, mockPlan, EmailPayload, EmailTemplate, getResend(), resend (+9 more)

### Community 24 - "Community 24"
Cohesion: 0.50
Nodes (3): extends, rules, react/no-unescaped-entities

### Community 25 - "Community 25"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 26 - "Community 26"
Cohesion: 0.48
Nodes (3): CopyButton(), MemberReferralPage(), PageProps

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (3): extends, rules, react/no-unescaped-entities

## Knowledge Gaps
- **162 isolated node(s):** `nextConfig`, `config`, `name`, `version`, `private` (+157 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminClient()` connect `Community 0` to `Community 8`, `Community 21`, `Community 26`, `Community 5`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `Database` connect `Community 4` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `nextConfig`, `config`, `name` to the rest of the system?**
  _162 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11884057971014493 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13277310924369748 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._