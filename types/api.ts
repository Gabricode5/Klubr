// Types partagés entre les routes API et les pages

export interface CommunityOption {
  id: string
  name: string
  platform: string
}

export interface MemberRow {
  id: string
  email: string
  name: string | null
  plan_id: string | null
  status: string
  created_at: string
  current_period_end: string | null
  churn_score: number | null
  subscription_plans: { interval: string } | null
  communities: { name: string; slug: string } | null
}

export interface ScoredMember {
  member_id: string
  score: number
  reason: string
}

export interface WeeklyEmail {
  subject: string
  html: string
}

export interface CountryTaxRow {
  country: string
  tax_collected: number
  total_amount: number
  currency: string
}

export interface TaxReport {
  countries: CountryTaxRow[]
  total_tax_collected: number
}

export interface PlanInput {
  name: string
  price: number
  interval: string
  trialDays: number
}
