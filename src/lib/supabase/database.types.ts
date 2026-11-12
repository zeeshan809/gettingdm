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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          name: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          name?: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          name?: string
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_email: string | null
          admin_id: string | null
          admin_role: Database["public"]["Enums"]["admin_role"] | null
          created_at: string
          detail: Json
          id: number
          ip: unknown
          reason: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_email?: string | null
          admin_id?: string | null
          admin_role?: Database["public"]["Enums"]["admin_role"] | null
          created_at?: string
          detail?: Json
          id?: never
          ip?: unknown
          reason?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_email?: string | null
          admin_id?: string | null
          admin_role?: Database["public"]["Enums"]["admin_role"] | null
          created_at?: string
          detail?: Json
          id?: never
          ip?: unknown
          reason?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          active: boolean
          created_at: string
          creator_id: string
          cta_label: string
          id: string
          ig_media_id: string
          keywords: string[]
          link_active: boolean
          link_button_label: string
          link_description: string
          link_title: string
          link_url: string
          match_rule: Database["public"]["Enums"]["match_rule"]
          media_caption: string | null
          media_permalink: string | null
          media_posted_at: string | null
          media_thumbnail_url: string | null
          media_type: string | null
          message: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          creator_id?: string
          cta_label?: string
          id?: string
          ig_media_id: string
          keywords: string[]
          link_active?: boolean
          link_button_label?: string
          link_description?: string
          link_title: string
          link_url: string
          match_rule?: Database["public"]["Enums"]["match_rule"]
          media_caption?: string | null
          media_permalink?: string | null
          media_posted_at?: string | null
          media_thumbnail_url?: string | null
          media_type?: string | null
          message: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          creator_id?: string
          cta_label?: string
          id?: string
          ig_media_id?: string
          keywords?: string[]
          link_active?: boolean
          link_button_label?: string
          link_description?: string
          link_title?: string
          link_url?: string
          match_rule?: Database["public"]["Enums"]["match_rule"]
          media_caption?: string | null
          media_permalink?: string | null
          media_posted_at?: string | null
          media_thumbnail_url?: string | null
          media_type?: string | null
          message?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_events: {
        Row: {
          attempts: number
          campaign_id: string | null
          comment_text: string | null
          commenter_ig_id: string | null
          commenter_username: string | null
          creator_id: string
          error: string | null
          id: string
          ig_comment_id: string
          ig_media_id: string
          matched_keyword: string | null
          next_attempt_at: string | null
          processed_at: string | null
          received_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["automation_status"]
        }
        Insert: {
          attempts?: number
          campaign_id?: string | null
          comment_text?: string | null
          commenter_ig_id?: string | null
          commenter_username?: string | null
          creator_id: string
          error?: string | null
          id?: string
          ig_comment_id: string
          ig_media_id: string
          matched_keyword?: string | null
          next_attempt_at?: string | null
          processed_at?: string | null
          received_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["automation_status"]
        }
        Update: {
          attempts?: number
          campaign_id?: string | null
          comment_text?: string | null
          commenter_ig_id?: string | null
          commenter_username?: string | null
          creator_id?: string
          error?: string | null
          id?: string
          ig_comment_id?: string
          ig_media_id?: string
          matched_keyword?: string | null
          next_attempt_at?: string | null
          processed_at?: string | null
          received_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["automation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "comment_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          confirmation_code: string
          creator_id: string | null
          fb_user_id: string
          id: string
          requested_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          confirmation_code: string
          creator_id?: string | null
          fb_user_id: string
          id?: string
          requested_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          confirmation_code?: string
          creator_id?: string | null
          fb_user_id?: string
          id?: string
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_links: {
        Row: {
          active: boolean
          button_label: string
          created_at: string
          creator_id: string
          description: string
          id: string
          position: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          button_label?: string
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          position: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          button_label?: string
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_links_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_accounts: {
        Row: {
          account_type: string | null
          business_id: string | null
          connected_at: string
          creator_id: string
          fb_user_id: string | null
          ig_user_id: string
          last_error: string | null
          page_id: string | null
          page_name: string | null
          profile_picture_url: string | null
          status: Database["public"]["Enums"]["connection_status"]
          token_expires_at: string | null
          updated_at: string
          username: string
        }
        Insert: {
          account_type?: string | null
          business_id?: string | null
          connected_at?: string
          creator_id: string
          fb_user_id?: string | null
          ig_user_id: string
          last_error?: string | null
          page_id?: string | null
          page_name?: string | null
          profile_picture_url?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          token_expires_at?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          account_type?: string | null
          business_id?: string | null
          connected_at?: string
          creator_id?: string
          fb_user_id?: string | null
          ig_user_id?: string
          last_error?: string | null
          page_id?: string | null
          page_name?: string | null
          profile_picture_url?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          token_expires_at?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_accounts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_tokens: {
        Row: {
          access_token_encrypted: string
          creator_id: string
          updated_at: string
        }
        Insert: {
          access_token_encrypted: string
          creator_id: string
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string
          creator_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_tokens_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "instagram_accounts"
            referencedColumns: ["creator_id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          creator_id: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          tone: string
          type: string
        }
        Insert: {
          body?: string
          created_at?: string
          creator_id: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          tone?: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          creator_id?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          tone?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          creator_id: string
          currency: string
          failure_reason: string | null
          id: string
          method: string | null
          plan: Database["public"]["Enums"]["plan_id"] | null
          razorpay_invoice_id: string | null
          razorpay_payment_id: string | null
          razorpay_subscription_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          creator_id: string
          currency?: string
          failure_reason?: string | null
          id?: string
          method?: string | null
          plan?: Database["public"]["Enums"]["plan_id"] | null
          razorpay_invoice_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          method?: string | null
          plan?: Database["public"]["Enums"]["plan_id"] | null
          razorpay_invoice_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          cover_url: string | null
          created_at: string
          email: string
          email_prefs: Json
          full_name: string
          id: string
          onboarding_completed: boolean
          socials: Json
          status: Database["public"]["Enums"]["account_status"]
          theme: Json
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          cover_url?: string | null
          created_at?: string
          email: string
          email_prefs?: Json
          full_name?: string
          id: string
          onboarding_completed?: boolean
          socials?: Json
          status?: Database["public"]["Enums"]["account_status"]
          theme?: Json
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          cover_url?: string | null
          created_at?: string
          email?: string
          email_prefs?: Json
          full_name?: string
          id?: string
          onboarding_completed?: boolean
          socials?: Json
          status?: Database["public"]["Enums"]["account_status"]
          theme?: Json
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      storefront_default_links: {
        Row: {
          active: boolean
          button_label: string
          creator_id: string
          description: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          button_label?: string
          creator_id?: string
          description?: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          button_label?: string
          creator_id?: string
          description?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "storefront_default_links_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          creator_id: string
          id: number
          link_slot: number | null
          referrer: string | null
          type: string
          visitor_hash: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          creator_id: string
          id?: never
          link_slot?: number | null
          referrer?: string | null
          type: string
          visitor_hash?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          creator_id?: string
          id?: never
          link_slot?: number | null
          referrer?: string | null
          type?: string
          visitor_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storefront_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storefront_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          creator_id: string
          current_period_end: string | null
          current_period_start: string | null
          plan: Database["public"]["Enums"]["plan_id"]
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          creator_id: string
          current_period_end?: string | null
          current_period_start?: string | null
          plan?: Database["public"]["Enums"]["plan_id"]
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          creator_id?: string
          current_period_end?: string | null
          current_period_start?: string | null
          plan?: Database["public"]["Enums"]["plan_id"]
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_admin: string | null
          category: string
          created_at: string
          creator_id: string
          id: string
          priority: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_admin?: string | null
          category?: string
          created_at?: string
          creator_id?: string
          id?: string
          priority?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_admin?: string | null
          category?: string
          created_at?: string
          creator_id?: string
          id?: string
          priority?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          from_admin: boolean
          id: string
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          from_admin?: boolean
          id?: string
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          from_admin?: boolean
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          error: string | null
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          received_at: string
        }
        Insert: {
          error?: string | null
          id: string
          payload: Json
          processed_at?: string | null
          provider: string
          received_at?: string
        }
        Update: {
          error?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      campaign_stats: {
        Args: { p_campaign_id?: string; p_from?: string; p_to?: string }
        Returns: {
          campaign_id: string
          clicks: number
          comments: number
          eligible: number
          failed: number
          ineligible: number
          sent: number
          skipped: number
          visits: number
        }[]
      }
      create_support_ticket: {
        Args: { p_body: string; p_category: string; p_subject: string }
        Returns: string
      }
      creator_daily: {
        Args: { p_from: string; p_to: string }
        Returns: {
          clicks: number
          comments: number
          day: string
          eligible: number
          failed: number
          ineligible: number
          sent: number
          skipped: number
          uniques: number
          visits: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_reserved_username: { Args: { u: string }; Returns: boolean }
      ist_range: {
        Args: { p_from: string; p_to: string }
        Returns: Record<string, unknown>
      }
      keyword_stats: {
        Args: { p_from: string; p_to: string }
        Returns: {
          keyword: string
          matches: number
          sent: number
        }[]
      }
      link_stats: {
        Args: { p_from: string; p_to: string }
        Returns: {
          campaign_id: string
          clicks: number
          link_slot: number
          unique_clicks: number
        }[]
      }
      notify: {
        Args: {
          p_body: string
          p_creator: string
          p_link?: string
          p_title: string
          p_tone: string
          p_type: string
        }
        Returns: undefined
      }
      save_storefront: {
        Args: { p_default: Json; p_links: Json; p_profile: Json }
        Returns: undefined
      }
      username_available: { Args: { u: string }; Returns: boolean }
    }
    Enums: {
      account_status: "active" | "suspended"
      admin_role:
        | "super_admin"
        | "operations_admin"
        | "finance_admin"
        | "support_admin"
      automation_status:
        | "received"
        | "processing"
        | "eligible"
        | "queued"
        | "sent"
        | "failed"
        | "skipped"
        | "ineligible"
      connection_status:
        | "connected"
        | "expired"
        | "revoked"
        | "error"
        | "disconnected"
      match_rule: "contains" | "exact" | "starts_with" | "any"
      plan_id: "creator" | "creator_plus"
      subscription_status:
        | "trial"
        | "active"
        | "payment_pending"
        | "past_due"
        | "cancelled"
        | "expired"
        | "suspended"
      ticket_status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["active", "suspended"],
      admin_role: [
        "super_admin",
        "operations_admin",
        "finance_admin",
        "support_admin",
      ],
      automation_status: [
        "received",
        "processing",
        "eligible",
        "queued",
        "sent",
        "failed",
        "skipped",
        "ineligible",
      ],
      connection_status: [
        "connected",
        "expired",
        "revoked",
        "error",
        "disconnected",
      ],
      match_rule: ["contains", "exact", "starts_with", "any"],
      plan_id: ["creator", "creator_plus"],
      subscription_status: [
        "trial",
        "active",
        "payment_pending",
        "past_due",
        "cancelled",
        "expired",
        "suspended",
      ],
      ticket_status: ["open", "in_progress", "waiting", "resolved", "closed"],
    },
  },
} as const
