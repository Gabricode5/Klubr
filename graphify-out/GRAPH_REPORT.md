# Graph Report - Klubr  (2026-06-01)

## Corpus Check
- 59 files · ~17,564 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 285 nodes · 388 edges · 24 communities (16 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `95ec32cb`
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

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 33 edges
2. `compilerOptions` - 17 edges
3. `🚀 Plan — Community Monetization SaaS (Clone EU/FR)` - 13 edges
4. `createServerSupabaseClient()` - 12 edges
5. `createClient()` - 11 edges
6. `Ce que tu dois builder` - 11 edges
7. `POST()` - 9 edges
8. `CommunityPay — Build complet` - 9 edges
9. `sendRawEmail()` - 7 edges
10. `scripts` - 7 edges

## Surprising Connections (you probably didn't know these)
- `NewCommunityPage()` --calls--> `createClient()`  [INFERRED]
  app/dashboard/communities/new/page.tsx → lib/supabase.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/api/ai/churn-score/route.ts → lib/supabase-server.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/api/ai/weekly-summary/route.ts → lib/supabase-server.ts
- `GET()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/api/creator/communities/route.ts → lib/supabase-server.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/api/subscriptions/checkout/route.ts → lib/supabase-server.ts

## Import Cycles
- None detected.

## Communities (24 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (23): mockUser, validBody, GET(), QuerySchema, CopyButton(), POST(), POST(), DashboardPage() (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (31): 1. Onboarding créateur, 2. Paiement membre, 3. Révocation accès (churn / impayé), 4. Calcul et distribution des revenus, 📊 Analyse du modèle original, 🏗️ Architecture Technique, 💰 Business Model, Cibles prioritaires (marché FR) (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (26): INTERVAL_LABELS, PayPageClientProps, PLATFORM_LABELS, Affiliate, Community, Creator, CreatorSettings, Database (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (20): dependencies, grammy, next, react, react-dom, resend, stripe, @supabase/ssr (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (13): nav, Sidebar(), createClient(), LoginPage(), BotInfo, CommunityOption, DEFAULT_PLAN, NewCommunityPage() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (18): mockPlan, setupAuth(), CheckoutSchema, POST(), createSupabaseMock(), sendEmail(), calculateFees(), constructWebhookEvent() (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): 10. Landing page, 1. Auth, 2. Onboarding Stripe Connect, 3. Dashboard créateur, 4. Gestion des communautés, 5. Plans d'abonnement, 6. Page de paiement publique, 7. Webhooks Stripe (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (14): MemberSignalSchema, POST(), ResponseSchema, ScoredMember, AnthropicResponse, AnthropicTextBlock, askClaudeJson(), EmailPayload (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): Démarrage rapide, Endpoints, Klubr, Nouveaux écrans (différenciants), Structure

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (3): Cron jobs Vercel, Setup fiscalite (TVA OSS), Stripe Tax - activation

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript (+3 more)

## Knowledge Gaps
- **144 isolated node(s):** `MemberSignalSchema`, `ResponseSchema`, `ScoredMember`, `WeeklyEmail`, `QuerySchema` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminClient()` connect `Community 0` to `Community 8`, `Community 5`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `Database` connect `Community 2` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `MemberSignalSchema`, `ResponseSchema`, `ScoredMember` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10121457489878542 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09032258064516129 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._