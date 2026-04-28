export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          avatar_url: string | null
          club_name: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          club_name?: string | null
          full_name: string
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          club_name?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      age_group_rules: {
        Row: {
          age_group: string
          id: string
          max_age: number | null
          min_age: number
          routine_count: number
          ruleset: string
          sort_order: number
        }
        Insert: {
          age_group: string
          id?: string
          max_age?: number | null
          min_age: number
          routine_count?: number
          ruleset: string
          sort_order?: number
        }
        Update: {
          age_group?: string
          id?: string
          max_age?: number | null
          min_age?: number
          routine_count?: number
          ruleset?: string
          sort_order?: number
        }
        Relationships: []
      }
      clubs: {
        Row: {
          avatar_url: string | null
          club_name: string
          contact_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          club_name: string
          contact_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          club_name?: string
          contact_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      competition_entries: {
        Row: {
          competition_id: string
          dorsal: number | null
          dropped_out: boolean
          id: string
          registered_at: string
          team_id: string
        }
        Insert: {
          competition_id: string
          dorsal?: number | null
          dropped_out?: boolean
          id?: string
          registered_at?: string
          team_id: string
        }
        Update: {
          competition_id?: string
          dorsal?: number | null
          dropped_out?: boolean
          id?: string
          registered_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_judge_nominations: {
        Row: {
          club_id: string | null
          competition_id: string
          id: string
          judge_id: string
        }
        Insert: {
          club_id?: string | null
          competition_id: string
          id?: string
          judge_id: string
        }
        Update: {
          club_id?: string | null
          competition_id?: string
          id?: string
          judge_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_judge_nominations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_judge_nominations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_judge_nominations_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          admin_id: string | null
          age_groups: string[]
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          poster_url: string | null
          registration_deadline: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["competition_status"]
          ts_music_deadline: string | null
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          age_groups?: string[]
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          poster_url?: string | null
          registration_deadline?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["competition_status"]
          ts_music_deadline?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          age_groups?: string[]
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          poster_url?: string | null
          registration_deadline?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["competition_status"]
          ts_music_deadline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      gymnasts: {
        Row: {
          club_id: string
          created_at: string
          date_of_birth: string
          first_name: string
          id: string
          last_name_1: string
          last_name_2: string | null
          photo_url: string | null
        }
        Insert: {
          club_id: string
          created_at?: string
          date_of_birth: string
          first_name: string
          id?: string
          last_name_1: string
          last_name_2?: string | null
          photo_url?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          date_of_birth?: string
          first_name?: string
          id?: string
          last_name_1?: string
          last_name_2?: string | null
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gymnasts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      judges: {
        Row: {
          avatar_url: string | null
          full_name: string
          id: string
          licence: string | null
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name: string
          id: string
          licence?: string | null
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string
          id?: string
          licence?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "judges_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      panels: {
        Row: {
          competition_id: string
          id: string
          panel_number: number
        }
        Insert: {
          competition_id: string
          id?: string
          panel_number: number
        }
        Update: {
          competition_id?: string
          id?: string
          panel_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "panels_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_id: string | null
          club_id: string | null
          created_at: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          club_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          club_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_music: {
        Row: {
          competition_id: string
          id: string
          music_path: string | null
          routine_type: Database["public"]["Enums"]["routine_type"]
          team_id: string
          ts_path: string | null
          uploaded_at: string
        }
        Insert: {
          competition_id: string
          id?: string
          music_path?: string | null
          routine_type: Database["public"]["Enums"]["routine_type"]
          team_id: string
          ts_path?: string | null
          uploaded_at?: string
        }
        Update: {
          competition_id?: string
          id?: string
          music_path?: string | null
          routine_type?: Database["public"]["Enums"]["routine_type"]
          team_id?: string
          ts_path?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_music_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_music_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_results: {
        Row: {
          a_score: number | null
          approved_at: string | null
          approved_by: string | null
          cjp_penalty: number | null
          cjp_penalty_detail: Json | null
          created_at: string
          dif_penalty: number | null
          dif_score: number | null
          dj_penalty_detail: Json | null
          e_score: number | null
          final_score: number | null
          id: string
          session_id: string
          status: Database["public"]["Enums"]["result_status"]
          team_id: string
          updated_at: string
        }
        Insert: {
          a_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          cjp_penalty?: number | null
          cjp_penalty_detail?: Json | null
          created_at?: string
          dif_penalty?: number | null
          dif_score?: number | null
          dj_penalty_detail?: Json | null
          e_score?: number | null
          final_score?: number | null
          id?: string
          session_id: string
          status?: Database["public"]["Enums"]["result_status"]
          team_id: string
          updated_at?: string
        }
        Update: {
          a_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          cjp_penalty?: number | null
          cjp_penalty_detail?: Json | null
          created_at?: string
          dif_penalty?: number | null
          dif_score?: number | null
          dj_penalty_detail?: Json | null
          e_score?: number | null
          final_score?: number | null
          id?: string
          session_id?: string
          status?: Database["public"]["Enums"]["result_status"]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_results_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_results_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          aj_score: number | null
          cjp_penalty: number | null
          dj_difficulty: number | null
          dj_extra_elements: Json | null
          dj_flags: Json | null
          dj_incorrect_ts: boolean | null
          dj_penalty: number | null
          ej_deductions: Json | null
          ej_extra_elements: Json | null
          ej_score: number | null
          id: string
          section_panel_judge_id: string
          session_id: string
          submitted_at: string
          team_id: string
          updated_at: string
        }
        Insert: {
          aj_score?: number | null
          cjp_penalty?: number | null
          dj_difficulty?: number | null
          dj_extra_elements?: Json | null
          dj_flags?: Json | null
          dj_incorrect_ts?: boolean | null
          dj_penalty?: number | null
          ej_deductions?: Json | null
          ej_extra_elements?: Json | null
          ej_score?: number | null
          id?: string
          section_panel_judge_id: string
          session_id: string
          submitted_at?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          aj_score?: number | null
          cjp_penalty?: number | null
          dj_difficulty?: number | null
          dj_extra_elements?: Json | null
          dj_flags?: Json | null
          dj_incorrect_ts?: boolean | null
          dj_penalty?: number | null
          ej_deductions?: Json | null
          ej_extra_elements?: Json | null
          ej_score?: number | null
          id?: string
          section_panel_judge_id?: string
          session_id?: string
          submitted_at?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_section_panel_judge_id_fkey"
            columns: ["section_panel_judge_id"]
            isOneToOne: false
            referencedRelation: "section_panel_judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      section_panel_judges: {
        Row: {
          id: string
          judge_id: string | null
          panel_id: string
          role: Database["public"]["Enums"]["judge_role"]
          role_number: number
          section_id: string
        }
        Insert: {
          id?: string
          judge_id?: string | null
          panel_id: string
          role: Database["public"]["Enums"]["judge_role"]
          role_number?: number
          section_id: string
        }
        Update: {
          id?: string
          judge_id?: string | null
          panel_id?: string
          role?: Database["public"]["Enums"]["judge_role"]
          role_number?: number
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_panel_judges_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_panel_judges_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_panel_judges_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_panel_locks: {
        Row: {
          locked: boolean
          panel_id: string
          section_id: string
          updated_at: string
        }
        Insert: {
          locked?: boolean
          panel_id: string
          section_id: string
          updated_at?: string
        }
        Update: {
          locked?: boolean
          panel_id?: string
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_panel_locks_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_panel_locks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          competition_id: string
          id: string
          label: string | null
          section_number: number
          starting_time: string | null
          timeline_order: Json | null
          waiting_time_seconds: number | null
          warmup_duration_minutes: number | null
        }
        Insert: {
          competition_id: string
          id?: string
          label?: string | null
          section_number: number
          starting_time?: string | null
          timeline_order?: Json | null
          waiting_time_seconds?: number | null
          warmup_duration_minutes?: number | null
        }
        Update: {
          competition_id?: string
          id?: string
          label?: string | null
          section_number?: number
          starting_time?: string | null
          timeline_order?: Json | null
          waiting_time_seconds?: number | null
          warmup_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_orders: {
        Row: {
          position: number
          session_id: string
          team_id: string
        }
        Insert: {
          position: number
          session_id: string
          team_id: string
        }
        Update: {
          position?: number
          session_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_orders_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          age_group: string
          category: string
          competition_id: string
          current_team_id: string | null
          dj_device: string | null
          dj_method: string | null
          ej_device: string | null
          ej_method: string | null
          id: string
          name: string
          order_index: number
          order_locked: boolean
          panel_id: string
          routine_type: Database["public"]["Enums"]["routine_type"]
          section_id: string
          status: Database["public"]["Enums"]["session_status"]
        }
        Insert: {
          age_group: string
          category: string
          competition_id: string
          current_team_id?: string | null
          dj_device?: string | null
          dj_method?: string | null
          ej_device?: string | null
          ej_method?: string | null
          id?: string
          name: string
          order_index?: number
          order_locked?: boolean
          panel_id: string
          routine_type: Database["public"]["Enums"]["routine_type"]
          section_id: string
          status?: Database["public"]["Enums"]["session_status"]
        }
        Update: {
          age_group?: string
          category?: string
          competition_id?: string
          current_team_id?: string | null
          dj_device?: string | null
          dj_method?: string | null
          ej_device?: string | null
          ej_method?: string | null
          id?: string
          name?: string
          order_index?: number
          order_locked?: boolean
          panel_id?: string
          routine_type?: Database["public"]["Enums"]["routine_type"]
          section_id?: string
          status?: Database["public"]["Enums"]["session_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sessions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_current_team_id_fkey"
            columns: ["current_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      team_gymnasts: {
        Row: {
          gymnast_id: string
          team_id: string
        }
        Insert: {
          gymnast_id: string
          team_id: string
        }
        Update: {
          gymnast_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_gymnasts_gymnast_id_fkey"
            columns: ["gymnast_id"]
            isOneToOne: false
            referencedRelation: "gymnasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_gymnasts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string
          category: string
          club_id: string
          created_at: string
          gymnast_display: string
          id: string
          photo_url: string | null
        }
        Insert: {
          age_group: string
          category: string
          club_id: string
          created_at?: string
          gymnast_display: string
          id?: string
          photo_url?: string | null
        }
        Update: {
          age_group?: string
          category?: string
          club_id?: string
          created_at?: string
          gymnast_display?: string
          id?: string
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      ts_elements: {
        Row: {
          competition_id: string
          created_at: string
          difficulty_value: number
          element_type: string
          id: string
          is_static: boolean
          label: string
          position: number
          routine_type: Database["public"]["Enums"]["routine_type"]
          team_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          difficulty_value?: number
          element_type: string
          id?: string
          is_static?: boolean
          label?: string
          position: number
          routine_type: Database["public"]["Enums"]["routine_type"]
          team_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          difficulty_value?: number
          element_type?: string
          id?: string
          is_static?: boolean
          label?: string
          position?: number
          routine_type?: Database["public"]["Enums"]["routine_type"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ts_elements_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ts_elements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      ts_review_status: {
        Row: {
          team_id: string
          competition_id: string
          routine_type: "Balance" | "Dynamic" | "Combined"
          status: string
          dj1_id: string | null
          dj1_decision: string | null
          dj1_comment: string | null
          dj1_at: string | null
          dj2_id: string | null
          dj2_decision: string | null
          dj2_comment: string | null
          dj2_at: string | null
          final_comment: string | null
          notified_at: string | null
        }
        Insert: {
          team_id: string
          competition_id: string
          routine_type: "Balance" | "Dynamic" | "Combined"
          status?: string
          dj1_id?: string | null
          dj1_decision?: string | null
          dj1_comment?: string | null
          dj1_at?: string | null
          dj2_id?: string | null
          dj2_decision?: string | null
          dj2_comment?: string | null
          dj2_at?: string | null
          final_comment?: string | null
          notified_at?: string | null
        }
        Update: {
          team_id?: string
          competition_id?: string
          routine_type?: "Balance" | "Dynamic" | "Combined"
          status?: string
          dj1_id?: string | null
          dj1_decision?: string | null
          dj1_comment?: string | null
          dj1_at?: string | null
          dj2_id?: string | null
          dj2_decision?: string | null
          dj2_comment?: string | null
          dj2_at?: string | null
          final_comment?: string | null
          notified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ts_review_status_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ts_review_status_dj1_id_fkey"
            columns: ["dj1_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ts_review_status_dj2_id_fkey"
            columns: ["dj2_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ts_review_status_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      tv_state: {
        Row: {
          id: string
          competition_id: string
          session_id: string | null
          team_id: string | null
          revealed: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          session_id?: string | null
          team_id?: string | null
          revealed?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          session_id?: string | null
          team_id?: string | null
          revealed?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tv_state_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: true
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tv_state_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_club_id: { Args: never; Returns: string }
      get_my_judge_id: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      is_competition_admin: {
        Args: { p_competition_id: string }
        Returns: boolean
      }
      is_judge_assigned_to_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
    }
    Enums: {
      competition_status:
        | "draft"
        | "registration_open"
        | "registration_closed"
        | "active"
        | "finished"
      judge_role: "CJP" | "EJ" | "AJ" | "DJ"
      result_status: "provisional" | "approved"
      routine_type: "Balance" | "Dynamic" | "Combined"
      session_status: "waiting" | "active" | "finished"
      user_role: "super_admin" | "admin" | "judge" | "club"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      competition_status: [
        "draft",
        "registration_open",
        "registration_closed",
        "active",
        "finished",
      ],
      judge_role: ["CJP", "EJ", "AJ", "DJ"],
      result_status: ["provisional", "approved"],
      routine_type: ["Balance", "Dynamic", "Combined"],
      session_status: ["waiting", "active", "finished"],
      user_role: ["super_admin", "admin", "judge", "club"],
    },
  },
} as const
