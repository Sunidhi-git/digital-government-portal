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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          citizen_id: string
          created_at: string
          fee_amount: number
          form_data: Json
          id: string
          is_paid: boolean
          officer_id: string | null
          reference_no: string
          remarks: string | null
          service_id: string
          status: Database["public"]["Enums"]["app_status"]
          updated_at: string
        }
        Insert: {
          citizen_id: string
          created_at?: string
          fee_amount?: number
          form_data?: Json
          id?: string
          is_paid?: boolean
          officer_id?: string | null
          reference_no?: string
          remarks?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
        }
        Update: {
          citizen_id?: string
          created_at?: string
          fee_amount?: number
          form_data?: Json
          id?: string
          is_paid?: boolean
          officer_id?: string | null
          reference_no?: string
          remarks?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          category: string
          citizen_id: string
          created_at: string
          description: string
          id: string
          priority: string
          reference_no: string
          response: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          category: string
          citizen_id: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          reference_no?: string
          response?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          citizen_id?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          reference_no?: string
          response?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          application_id: string | null
          citizen_id: string
          doc_type: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          application_id?: string | null
          citizen_id: string
          doc_type: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          application_id?: string | null
          citizen_id?: string
          doc_type?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      officers: {
        Row: {
          created_at: string
          department: string
          designation: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          region: string | null
        }
        Insert: {
          created_at?: string
          department: string
          designation?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          region?: string | null
        }
        Update: {
          created_at?: string
          department?: string
          designation?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          region?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          application_id: string | null
          citizen_id: string
          created_at: string
          id: string
          method: string
          status: Database["public"]["Enums"]["payment_status"]
          txn_id: string
        }
        Insert: {
          amount: number
          application_id?: string | null
          citizen_id: string
          created_at?: string
          id?: string
          method: string
          status?: Database["public"]["Enums"]["payment_status"]
          txn_id?: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          citizen_id?: string
          created_at?: string
          id?: string
          method?: string
          status?: Database["public"]["Enums"]["payment_status"]
          txn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhaar: string | null
          address: string | null
          created_at: string
          dob: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
        }
        Insert: {
          aadhaar?: string | null
          address?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          aadhaar?: string | null
          address?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          code: string
          created_at: string
          department: string
          description: string | null
          fee: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          processing_days: number
          required_docs: string[]
        }
        Insert: {
          code: string
          created_at?: string
          department: string
          description?: string | null
          fee?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          processing_days?: number
          required_docs?: string[]
        }
        Update: {
          code?: string
          created_at?: string
          department?: string
          description?: string | null
          fee?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          processing_days?: number
          required_docs?: string[]
        }
        Relationships: []
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
      bootstrap_admin: { Args: never; Returns: undefined }
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_self_to_officer: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "citizen" | "officer" | "admin"
      app_status:
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "more_info"
      complaint_status: "open" | "in_progress" | "resolved" | "closed"
      payment_status: "pending" | "success" | "failed" | "refunded"
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
      app_role: ["citizen", "officer", "admin"],
      app_status: [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "more_info",
      ],
      complaint_status: ["open", "in_progress", "resolved", "closed"],
      payment_status: ["pending", "success", "failed", "refunded"],
    },
  },
} as const
