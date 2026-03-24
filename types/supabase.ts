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
      activity_logs: {
        Row: {
          action_type: string
          deletion_scheduled_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          institution_id: string
          ip_address: string | null
          metadata: Json | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          deletion_scheduled_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          institution_id: string
          ip_address?: string | null
          metadata?: Json | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          deletion_scheduled_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          institution_id?: string
          ip_address?: string | null
          metadata?: Json | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          expires_at: string | null
          id: string
          institution_id: string
          priority: string
          target_audience: string[]
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          institution_id: string
          priority?: string
          target_audience: string[]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          institution_id?: string
          priority?: string
          target_audience?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_session_questions: {
        Row: {
          correct_answer: Json
          marks: number
          options: Json | null
          order_index: number
          question_id: string
          question_text: string
          question_type: string
          session_id: string
        }
        Insert: {
          correct_answer: Json
          marks: number
          options?: Json | null
          order_index: number
          question_id: string
          question_text: string
          question_type: string
          session_id: string
        }
        Update: {
          correct_answer?: Json
          marks?: number
          options?: Json | null
          order_index?: number
          question_id?: string
          question_text?: string
          question_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_session_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          cohort_id: string
          created_at: string
          deleted_at: string | null
          expires_at: string
          id: string
          paper_id: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          deleted_at?: string | null
          expires_at: string
          id?: string
          paper_id: string
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          deleted_at?: string | null
          expires_at?: string
          id?: string
          paper_id?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "exam_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_history: {
        Row: {
          cohort_id: string
          created_at: string
          id: string
          student_id: string
          updated_at: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          cohort_id: string
          created_at?: string
          id?: string
          student_id: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          cohort_id?: string
          created_at?: string
          id?: string
          student_id?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cohort_history_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          institution_id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          institution_id: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          institution_id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_papers: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          institution_id: string
          level_id: string
          pass_percentage: number | null
          status: string
          title: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          institution_id: string
          level_id: string
          pass_percentage?: number | null
          status?: string
          title: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          institution_id?: string
          level_id?: string
          pass_percentage?: number | null
          status?: string
          title?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_papers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_papers_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_boundaries: {
        Row: {
          color_hex: string | null
          created_at: string
          grade_name: string
          id: string
          institution_id: string
          min_percentage: number
          updated_at: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          grade_name: string
          id?: string
          institution_id: string
          min_percentage: number
          updated_at?: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          grade_name?: string
          id?: string
          institution_id?: string
          min_percentage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_boundaries_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          logo_url: string | null
          name: string
          session_timeout_seconds: number
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          session_timeout_seconds?: number
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          session_timeout_seconds?: number
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      levels: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          institution_id: string
          min_days_required: number | null
          name: string
          sequence_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          institution_id: string
          min_days_required?: number | null
          name: string
          sequence_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          min_days_required?: number | null
          name?: string
          sequence_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "levels_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_submissions_staging: {
        Row: {
          client_ts: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          hmac_timestamp: string | null
          id: string
          institution_id: string
          payload: Json
          processing_started_at: string | null
          server_received_at: string
          session_id: string | null
          status: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          client_ts?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          hmac_timestamp?: string | null
          id?: string
          institution_id: string
          payload: Json
          processing_started_at?: string | null
          server_received_at?: string
          session_id?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          client_ts?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          hmac_timestamp?: string | null
          id?: string
          institution_id?: string
          payload?: Json
          processing_started_at?: string | null
          server_received_at?: string
          session_id?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_submissions_staging_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          forced_password_reset: boolean
          full_name: string
          id: string
          institution_id: string
          locked_at: string | null
          role: string
          updated_at: string
          version_seq: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          forced_password_reset?: boolean
          full_name: string
          id: string
          institution_id: string
          locked_at?: string | null
          role: string
          updated_at?: string
          version_seq?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          forced_password_reset?: boolean
          full_name?: string
          id?: string
          institution_id?: string
          locked_at?: string | null
          role?: string
          updated_at?: string
          version_seq?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: Json
          created_at: string
          deleted_at: string | null
          id: string
          marks: number
          metadata: Json | null
          options: Json | null
          order_index: number
          paper_id: string
          question_text: string
          question_type: string
          updated_at: string
        }
        Insert: {
          correct_answer: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          marks?: number
          metadata?: Json | null
          options?: Json | null
          order_index: number
          paper_id: string
          question_text: string
          question_type: string
          updated_at?: string
        }
        Update: {
          correct_answer?: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          marks?: number
          metadata?: Json | null
          options?: Json | null
          order_index?: number
          paper_id?: string
          question_text?: string
          question_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "exam_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_answers: {
        Row: {
          answered_at: string
          created_at: string
          id: string
          idempotency_key: string
          is_correct: boolean | null
          question_id: string
          selected_option: string | null
          submission_id: string
        }
        Insert: {
          answered_at?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          is_correct?: boolean | null
          question_id: string
          selected_option?: string | null
          submission_id: string
        }
        Update: {
          answered_at?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          is_correct?: boolean | null
          question_id?: string
          selected_option?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          cohort_id: string
          consent_verified: boolean
          created_at: string
          deleted_at: string | null
          deletion_scheduled_at: string | null
          device_id: string | null
          dob: string | null
          full_name: string
          gender: string | null
          grade_section: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          id_card_url: string | null
          institution_id: string | null
          level_id: string
          roll_number: string | null
          updated_at: string
        }
        Insert: {
          cohort_id: string
          consent_verified?: boolean
          created_at?: string
          deleted_at?: string | null
          deletion_scheduled_at?: string | null
          device_id?: string | null
          dob?: string | null
          full_name: string
          gender?: string | null
          grade_section?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id: string
          id_card_url?: string | null
          institution_id?: string | null
          level_id: string
          roll_number?: string | null
          updated_at?: string
        }
        Update: {
          cohort_id?: string
          consent_verified?: boolean
          created_at?: string
          deleted_at?: string | null
          deletion_scheduled_at?: string | null
          device_id?: string | null
          dob?: string | null
          full_name?: string
          gender?: string | null
          grade_section?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          id_card_url?: string | null
          institution_id?: string | null
          level_id?: string
          roll_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          completed_at: string | null
          created_at: string
          deletion_scheduled_at: string | null
          grade: string | null
          id: string
          idempotency_key: string | null
          percentage: number | null
          result_published_at: string | null
          score: number
          session_id: string
          student_id: string
          sync_status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deletion_scheduled_at?: string | null
          grade?: string | null
          id?: string
          idempotency_key?: string | null
          percentage?: number | null
          result_published_at?: string | null
          score?: number
          session_id: string
          student_id: string
          sync_status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deletion_scheduled_at?: string | null
          grade?: string | null
          id?: string
          idempotency_key?: string | null
          percentage?: number | null
          result_published_at?: string | null
          score?: number
          session_id?: string
          student_id?: string
          sync_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          deleted_at: string | null
          designation: string | null
          employee_id: string | null
          full_name: string
          id: string
          specialization: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          designation?: string | null
          employee_id?: string | null
          full_name: string
          id: string
          specialization?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          designation?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          specialization?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bulk_import_students: { Args: { p_data: Json }; Returns: Json }
      calculate_results: { Args: { p_submission_id: string }; Returns: Json }
      get_live_monitor_data: {
        Args: { p_paper_id: string }
        Returns: {
          answers_submitted: number
          completed_at: string
          full_name: string
          last_seen_at: string
          status: string
          student_id: string
          sync_status: string
          total_questions: number
        }[]
      }
      validate_and_migrate_offline_submission:
        | { Args: { p_payload: Json }; Returns: Json }
        | {
            Args: {
              p_client_ts: number
              p_hmac_timestamp: string
              p_staging_id: string
            }
            Returns: Json
          }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
