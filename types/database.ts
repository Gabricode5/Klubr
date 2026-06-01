export type Plan = 'free' | 'business'
export type Platform = 'telegram' | 'discord' | 'whatsapp'
export type Interval = 'month' | 'year' | 'one_time'
export type MemberStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'

export interface Creator {
  id: string
  user_id: string
  stripe_account_id: string | null
  stripe_onboarded: boolean
  plan: Plan
  commission_rate: number
  business_plan_end: string | null
  referral_reward_days: number
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  creator_id: string
  name: string
  slug: string
  description: string | null
  cover_image_url: string | null
  platform: Platform
  platform_id: string
  bot_token: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  community_id: string
  name: string
  description: string | null
  price: number
  currency: string
  interval: Interval
  trial_days: number
  stripe_price_id: string | null
  active: boolean
  created_at: string
}

export interface PlanCommunity {
  id: string
  plan_id: string
  community_id: string
  created_at: string
}

export interface Affiliate {
  id: string
  community_id: string
  email: string
  name: string | null
  code: string
  commission_rate: number
  total_earned: number
  total_clicks: number
  created_at: string
}

export interface Member {
  id: string
  community_id: string
  plan_id: string
  affiliate_id: string | null
  email: string
  name: string | null
  platform_user_id: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  referral_code: string | null
  referred_by_member_id: string | null
  successful_referrals: number
  status: MemberStatus
  churn_score: number | null
  churn_score_updated_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  bot_access_granted: boolean
  created_at: string
  updated_at: string
}

export interface MemberCommunityAccess {
  id: string
  member_id: string
  community_id: string
  granted_at: string
  revoked_at: string | null
}

export interface Transaction {
  id: string
  member_id: string
  community_id: string
  affiliate_id: string | null
  amount: number
  currency: string
  platform_fee: number
  affiliate_fee: number
  creator_amount: number
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  status: string
  created_at: string
}

export interface CreatorSettings extends Creator {
  referral_reward_days: number
}

// supabase-js v2 requires Relationships + Views/Functions/Enums/CompositeTypes
// in the Database type to properly infer query result types.
export type Database = {
  public: {
    Tables: {
      creators: {
        Row: Creator
        Insert: Partial<Creator>
        Update: Partial<Creator>
        Relationships: []
      }
      communities: {
        Row: Community
        Insert: Partial<Community>
        Update: Partial<Community>
        Relationships: []
      }
      subscription_plans: {
        Row: SubscriptionPlan
        Insert: Partial<SubscriptionPlan>
        Update: Partial<SubscriptionPlan>
        Relationships: []
      }
      plan_communities: {
        Row: PlanCommunity
        Insert: Partial<PlanCommunity>
        Update: Partial<PlanCommunity>
        Relationships: []
      }
      affiliates: {
        Row: Affiliate
        Insert: Partial<Affiliate>
        Update: Partial<Affiliate>
        Relationships: []
      }
      members: {
        Row: Member
        Insert: Partial<Member>
        Update: Partial<Member>
        Relationships: []
      }
      member_community_access: {
        Row: MemberCommunityAccess
        Insert: Partial<MemberCommunityAccess>
        Update: Partial<MemberCommunityAccess>
        Relationships: []
      }
      transactions: {
        Row: Transaction
        Insert: Partial<Transaction>
        Update: Partial<Transaction>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
