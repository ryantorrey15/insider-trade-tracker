export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stocks: {
        Row: {
          ticker: string
          company_name: string
          sector: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          ticker: string
          company_name: string
          sector?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          ticker?: string
          company_name?: string
          sector?: string | null
          logo_url?: string | null
          updated_at?: string
        }
      }
      people: {
        Row: {
          id: string
          name: string
          title: string
          source: 'insider' | 'congressional'
          party: 'D' | 'R' | 'I' | null
          state: string | null
          chamber: 'Senate' | 'House' | null
          committee_assignments: string[] | null
          avatar_url: string | null
          bio: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          source: 'insider' | 'congressional'
          party?: 'D' | 'R' | 'I' | null
          state?: string | null
          chamber?: 'Senate' | 'House' | null
          committee_assignments?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          title?: string
          source?: 'insider' | 'congressional'
          party?: 'D' | 'R' | 'I' | null
          state?: string | null
          chamber?: 'Senate' | 'House' | null
          committee_assignments?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          metadata?: Json
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          person_id: string
          ticker: string
          trade_type: 'buy' | 'sell' | 'exercise' | 'gift' | 'exchange'
          source: 'insider' | 'congressional'
          amount: number | null
          amount_min: number | null
          amount_max: number | null
          shares: number | null
          price_at_trade: number | null
          trade_date: string
          filed_date: string
          signals: string[] | null
          description: string | null
          transaction_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          ticker: string
          trade_type: 'buy' | 'sell' | 'exercise' | 'gift' | 'exchange'
          source: 'insider' | 'congressional'
          amount?: number | null
          amount_min?: number | null
          amount_max?: number | null
          shares?: number | null
          price_at_trade?: number | null
          trade_date: string
          filed_date: string
          signals?: string[] | null
          description?: string | null
          transaction_id?: string | null
          metadata?: Json
        }
        Update: {
          person_id?: string
          ticker?: string
          trade_type?: 'buy' | 'sell' | 'exercise' | 'gift' | 'exchange'
          source?: 'insider' | 'congressional'
          amount?: number | null
          amount_min?: number | null
          amount_max?: number | null
          shares?: number | null
          price_at_trade?: number | null
          trade_date?: string
          filed_date?: string
          signals?: string[] | null
          description?: string | null
          transaction_id?: string | null
          metadata?: Json
          updated_at?: string
        }
      }
      price_snapshots: {
        Row: {
          id: string
          ticker: string
          date: string
          open: number
          high: number
          low: number
          close: number
          volume: number
        }
        Insert: {
          id?: string
          ticker: string
          date: string
          open: number
          high: number
          low: number
          close: number
          volume: number
        }
        Update: {
          open?: number
          high?: number
          low?: number
          close?: number
          volume?: number
        }
      }
      news_articles: {
        Row: {
          id: string
          title: string
          source: string
          url: string
          published_at: string
          summary: string | null
          related_tickers: string[] | null
          related_person_ids: string[] | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          source: string
          url: string
          published_at: string
          summary?: string | null
          related_tickers?: string[] | null
          related_person_ids?: string[] | null
          metadata?: Json
        }
        Update: {
          title?: string
          source?: string
          url?: string
          published_at?: string
          summary?: string | null
          related_tickers?: string[] | null
          related_person_ids?: string[] | null
          metadata?: Json
        }
      }
      trade_investigations: {
        Row: {
          id: string
          trade_id: string
          summary: string
          signals: string[] | null
          relevance_score: number | null
          ai_blurb: string
          related_news_ids: string[] | null
          generated_at: string
        }
        Insert: {
          id?: string
          trade_id: string
          summary: string
          signals?: string[] | null
          relevance_score?: number | null
          ai_blurb: string
          related_news_ids?: string[] | null
          generated_at?: string
        }
        Update: {
          summary?: string
          signals?: string[] | null
          relevance_score?: number | null
          ai_blurb?: string
          related_news_ids?: string[] | null
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          type: 'ticker' | 'person' | 'signal'
          target_id: string
          target_label: string
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'ticker' | 'person' | 'signal'
          target_id: string
          target_label: string
          enabled?: boolean
          created_at?: string
        }
        Update: {
          enabled?: boolean
          target_label?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
