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
      tasks: {
        Row: {
          id: string
          title: string
          completed: boolean
          created_at: string
          due_date: string | null
          deleted_at: string | null
          labels: string[] | null
          category: string | null
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          completed?: boolean
          created_at?: string
          due_date?: string | null
          deleted_at?: string | null
          labels?: string[] | null
          category?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          completed?: boolean
          created_at?: string
          due_date?: string | null
          deleted_at?: string | null
          labels?: string[] | null
          category?: string | null
          user_id?: string
        }
      }
    }
  }
}