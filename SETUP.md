# Setup fiscalite (TVA OSS)

## Stripe Tax - activation

1. Ouvrir Stripe Dashboard > `Tax` > `Get started`.
2. Activer Stripe Tax pour le compte plateforme.
3. Ajouter la registration France:
   - `Tax` > `Registrations` > `Add registration`
   - Country: France
   - Type: OSS Union
   - Renseigner le numero TVA.
4. Verifier que les produits/prix utilises en checkout ont une categorie taxe coherente.
5. Confirmer que `automatic_tax: { enabled: true }` est actif sur les sessions checkout.

## Cron jobs Vercel

Configurer ces endpoints dans `vercel.json`:

- Tous les jours: `POST /api/ai/churn-score`
- Lundi 08:00: `POST /api/ai/weekly-summary`
- 1er du mois: `POST /api/tax/monthly-email`

Ajouter `CRON_SECRET` dans les variables Vercel et envoyer `Authorization: Bearer <CRON_SECRET>`.
