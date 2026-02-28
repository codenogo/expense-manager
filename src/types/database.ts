export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          household_id: string | null
          full_name: string
          role: 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          household_id?: string | null
          full_name: string
          role?: 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string | null
          full_name?: string
          role?: 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      accounts: {
        Row: {
          id: string
          household_id: string
          name: string
          type: 'checking' | 'savings' | 'credit_card' | 'loan' | 'cash' | 'mpesa'
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          type: 'checking' | 'savings' | 'credit_card' | 'loan' | 'cash' | 'mpesa'
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          type?: 'checking' | 'savings' | 'credit_card' | 'loan' | 'cash' | 'mpesa'
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'accounts_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      categories: {
        Row: {
          id: string
          household_id: string
          name: string
          parent_id: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          parent_id?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          parent_id?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          household_id: string
          account_id: string
          category_id: string | null
          amount: number
          type: 'income' | 'expense'
          date: string
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          account_id: string
          category_id?: string | null
          amount: number
          type: 'income' | 'expense'
          date: string
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          account_id?: string
          category_id?: string | null
          amount?: number
          type?: 'income' | 'expense'
          date?: string
          notes?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      budgets: {
        Row: {
          id: string
          household_id: string
          category_id: string
          month: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          category_id: string
          month: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          category_id?: string
          month?: string
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'budgets_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      recurring_items: {
        Row: {
          id: string
          household_id: string
          name: string
          amount: number
          frequency: 'weekly' | 'monthly' | 'yearly'
          next_due_date: string
          category_id: string | null
          account_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          amount: number
          frequency: 'weekly' | 'monthly' | 'yearly'
          next_due_date: string
          category_id?: string | null
          account_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          amount?: number
          frequency?: 'weekly' | 'monthly' | 'yearly'
          next_due_date?: string
          category_id?: string | null
          account_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recurring_items_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      debts: {
        Row: {
          id: string
          household_id: string
          name: string
          type: 'bank_loan' | 'sacco_loan' | 'credit_card' | 'informal'
          balance: number
          interest_rate: number | null
          min_payment: number | null
          owed_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          type: 'bank_loan' | 'sacco_loan' | 'credit_card' | 'informal'
          balance: number
          interest_rate?: number | null
          min_payment?: number | null
          owed_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          type?: 'bank_loan' | 'sacco_loan' | 'credit_card' | 'informal'
          balance?: number
          interest_rate?: number | null
          min_payment?: number | null
          owed_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'debts_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      savings_goals: {
        Row: {
          id: string
          household_id: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string | null
          account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          target_amount: number
          current_amount?: number
          deadline?: string | null
          account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          deadline?: string | null
          account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'savings_goals_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      categorization_rules: {
        Row: {
          id: string
          household_id: string
          match_pattern: string
          match_type: 'contains' | 'exact' | 'starts_with'
          category_id: string
          priority: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          match_pattern: string
          match_type: 'contains' | 'exact' | 'starts_with'
          category_id: string
          priority?: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          match_pattern?: string
          match_type?: 'contains' | 'exact' | 'starts_with'
          category_id?: string
          priority?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categorization_rules_household_id_fkey'
            columns: ['household_id']
            isOneToOne: false
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
