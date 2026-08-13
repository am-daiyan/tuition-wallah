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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          body: string
          created_at: string
          error: string | null
          id: string
          payload: Json
          recipient: string | null
          status: string
          subject: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          recipient?: string | null
          status?: string
          subject: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          recipient?: string | null
          status?: string
          subject?: string
          type?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          details: string
          id: string
          status: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          category: string
          created_at?: string
          details: string
          id?: string
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          details?: string
          id?: string
          status?: Database["public"]["Enums"]["complaint_status"]
          student_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      replacement_requests: {
        Row: {
          assignment_id: string | null
          created_at: string
          current_teacher_id: string | null
          extra_info: string | null
          id: string
          new_teacher_id: string | null
          preferred_timing: string | null
          reason: string
          requirements: string | null
          status: Database["public"]["Enums"]["replacement_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          current_teacher_id?: string | null
          extra_info?: string | null
          id?: string
          new_teacher_id?: string | null
          preferred_timing?: string | null
          reason: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["replacement_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          current_teacher_id?: string | null
          extra_info?: string | null
          id?: string
          new_teacher_id?: string | null
          preferred_timing?: string | null
          reason?: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["replacement_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "replacement_requests_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "tuition_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replacement_requests_current_teacher_id_fkey"
            columns: ["current_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replacement_requests_new_teacher_id_fkey"
            columns: ["new_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replacement_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          comment: string | null
          created_at: string
          hidden: boolean
          id: string
          rating: number
          student_id: string
          teacher_id: string
        }
        Insert: {
          author_name?: string
          comment?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          rating: number
          student_id: string
          teacher_id: string
        }
        Update: {
          author_name?: string
          comment?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          rating?: number
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          board: string
          created_at: string
          id: string
          location: string
          notes: string | null
          preferred_timing: string | null
          student_class: string
          subjects: string[]
          teaching_mode: string
          updated_at: string
        }
        Insert: {
          board: string
          created_at?: string
          id: string
          location?: string
          notes?: string | null
          preferred_timing?: string | null
          student_class: string
          subjects?: string[]
          teaching_mode?: string
          updated_at?: string
        }
        Update: {
          board?: string
          created_at?: string
          id?: string
          location?: string
          notes?: string | null
          preferred_timing?: string | null
          student_class?: string
          subjects?: string[]
          teaching_mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          admin_notes: string | null
          available_days: string[]
          available_from: string | null
          available_to: string | null
          bio: string | null
          boards: string[]
          classes: string[]
          created_at: string
          email: string | null
          experience_years: number
          full_name: string
          id: string
          location: string
          phone: string
          photo_path: string | null
          profile_id: string | null
          qualification: string
          rating: number
          review_count: number
          status: Database["public"]["Enums"]["teacher_status"]
          subjects: string[]
          teaching_modes: string[]
          updated_at: string
          verified: boolean
        }
        Insert: {
          admin_notes?: string | null
          available_days?: string[]
          available_from?: string | null
          available_to?: string | null
          bio?: string | null
          boards?: string[]
          classes?: string[]
          created_at?: string
          email?: string | null
          experience_years?: number
          full_name: string
          id?: string
          location?: string
          phone: string
          photo_path?: string | null
          profile_id?: string | null
          qualification: string
          rating?: number
          review_count?: number
          status?: Database["public"]["Enums"]["teacher_status"]
          subjects?: string[]
          teaching_modes?: string[]
          updated_at?: string
          verified?: boolean
        }
        Update: {
          admin_notes?: string | null
          available_days?: string[]
          available_from?: string | null
          available_to?: string | null
          bio?: string | null
          boards?: string[]
          classes?: string[]
          created_at?: string
          email?: string | null
          experience_years?: number
          full_name?: string
          id?: string
          location?: string
          phone?: string
          photo_path?: string | null
          profile_id?: string | null
          qualification?: string
          rating?: number
          review_count?: number
          status?: Database["public"]["Enums"]["teacher_status"]
          subjects?: string[]
          teaching_modes?: string[]
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_assignments: {
        Row: {
          created_at: string
          days: string[]
          end_date: string | null
          id: string
          meeting_link: string | null
          request_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          subjects: string[]
          teacher_id: string
          teaching_mode: string
          time_slot: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          days?: string[]
          end_date?: string | null
          id?: string
          meeting_link?: string | null
          request_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          subjects?: string[]
          teacher_id: string
          teaching_mode?: string
          time_slot?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          days?: string[]
          end_date?: string | null
          id?: string
          meeting_link?: string | null
          request_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id?: string
          subjects?: string[]
          teacher_id?: string
          teaching_mode?: string
          time_slot?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "tuition_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_requests: {
        Row: {
          admin_notes: string | null
          board: string
          created_at: string
          id: string
          location: string
          preferred_days: string[]
          preferred_teacher_id: string | null
          preferred_time: string | null
          requirements: string | null
          status: Database["public"]["Enums"]["request_status"]
          student_class: string
          student_id: string
          subjects: string[]
          teaching_mode: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          board: string
          created_at?: string
          id?: string
          location: string
          preferred_days?: string[]
          preferred_teacher_id?: string | null
          preferred_time?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          student_class: string
          student_id: string
          subjects?: string[]
          teaching_mode?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          board?: string
          created_at?: string
          id?: string
          location?: string
          preferred_days?: string[]
          preferred_teacher_id?: string | null
          preferred_time?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          student_class?: string
          student_id?: string
          subjects?: string[]
          teaching_mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_requests_preferred_teacher_id_fkey"
            columns: ["preferred_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
      assignment_status: "active" | "ended" | "replaced"
      complaint_status: "open" | "under_review" | "resolved" | "closed"
      replacement_status: "open" | "under_review" | "assigned" | "rejected"
      request_status: "open" | "assigned" | "closed" | "cancelled"
      teacher_status:
        | "pending"
        | "under_review"
        | "interview"
        | "approved"
        | "rejected"
        | "suspended"
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
      app_role: ["admin", "teacher", "student"],
      assignment_status: ["active", "ended", "replaced"],
      complaint_status: ["open", "under_review", "resolved", "closed"],
      replacement_status: ["open", "under_review", "assigned", "rejected"],
      request_status: ["open", "assigned", "closed", "cancelled"],
      teacher_status: [
        "pending",
        "under_review",
        "interview",
        "approved",
        "rejected",
        "suspended",
      ],
    },
  },
} as const
