export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_suggestions: {
        Row: {
          accepted: boolean | null;
          content: string;
          conversation_id: string;
          created_at: string | null;
          id: string;
          type: string;
          workspace_id: string;
        };
        Insert: {
          accepted?: boolean | null;
          content: string;
          conversation_id: string;
          created_at?: string | null;
          id?: string;
          type: string;
          workspace_id: string;
        };
        Update: {
          accepted?: boolean | null;
          content?: string;
          conversation_id?: string;
          created_at?: string | null;
          id?: string;
          type?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_suggestions_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      connected_accounts: {
        Row: {
          access_token: string | null;
          account_label: string | null;
          connected_at: string | null;
          expires_at: string | null;
          external_id: string;
          id: string;
          provider: string;
          refresh_token: string | null;
          status: string | null;
          workspace_id: string;
        };
        Insert: {
          access_token?: string | null;
          account_label?: string | null;
          connected_at?: string | null;
          expires_at?: string | null;
          external_id: string;
          id?: string;
          provider: string;
          refresh_token?: string | null;
          status?: string | null;
          workspace_id: string;
        };
        Update: {
          access_token?: string | null;
          account_label?: string | null;
          connected_at?: string | null;
          expires_at?: string | null;
          external_id?: string;
          id?: string;
          provider?: string;
          refresh_token?: string | null;
          status?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connected_accounts_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_channels: {
        Row: {
          contact_id: string;
          display_handle: string | null;
          external_id: string;
          id: string;
          provider: string;
          workspace_id: string;
        };
        Insert: {
          contact_id: string;
          display_handle?: string | null;
          external_id: string;
          id?: string;
          provider: string;
          workspace_id: string;
        };
        Update: {
          contact_id?: string;
          display_handle?: string | null;
          external_id?: string;
          id?: string;
          provider?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_channels_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_channels_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          blacklisted: boolean | null;
          created_at: string | null;
          enriched: boolean | null;
          id: string;
          name: string;
          notes: string | null;
          tags: string[] | null;
          updated_at: string | null;
          workspace_id: string;
        };
        Insert: {
          blacklisted?: boolean | null;
          created_at?: string | null;
          enriched?: boolean | null;
          id?: string;
          name: string;
          notes?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          workspace_id: string;
        };
        Update: {
          blacklisted?: boolean | null;
          created_at?: string | null;
          enriched?: boolean | null;
          id?: string;
          name?: string;
          notes?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          contact_id: string | null;
          created_at: string | null;
          external_id: string | null;
          id: string;
          is_archived: boolean | null;
          is_pinned: boolean | null;
          is_starred: boolean | null;
          last_message_at: string | null;
          last_message_preview: string | null;
          primary_channel: string;
          unread_count: number | null;
          workspace_id: string;
        };
        Insert: {
          contact_id?: string | null;
          created_at?: string | null;
          external_id?: string | null;
          id?: string;
          is_archived?: boolean | null;
          is_pinned?: boolean | null;
          is_starred?: boolean | null;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          primary_channel: string;
          unread_count?: number | null;
          workspace_id: string;
        };
        Update: {
          contact_id?: string | null;
          created_at?: string | null;
          external_id?: string | null;
          id?: string;
          is_archived?: boolean | null;
          is_pinned?: boolean | null;
          is_starred?: boolean | null;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          primary_channel?: string;
          unread_count?: number | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      merge_suggestions: {
        Row: {
          contact_a_id: string;
          contact_b_id: string;
          created_at: string | null;
          decided_at: string | null;
          id: string;
          reason: string;
          score: number;
          status: string;
          workspace_id: string;
        };
        Insert: {
          contact_a_id: string;
          contact_b_id: string;
          created_at?: string | null;
          decided_at?: string | null;
          id?: string;
          reason: string;
          score: number;
          status?: string;
          workspace_id: string;
        };
        Update: {
          contact_a_id?: string;
          contact_b_id?: string;
          created_at?: string | null;
          decided_at?: string | null;
          id?: string;
          reason?: string;
          score?: number;
          status?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "merge_suggestions_contact_a_id_fkey";
            columns: ["contact_a_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "merge_suggestions_contact_b_id_fkey";
            columns: ["contact_b_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "merge_suggestions_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          attachment_urls: string[] | null;
          channel: string;
          content: string;
          conversation_id: string;
          direction: string;
          expires_at: string | null;
          external_id: string | null;
          id: string;
          read_at: string | null;
          sent_at: string | null;
          status: string | null;
        };
        Insert: {
          attachment_urls?: string[] | null;
          channel: string;
          content: string;
          conversation_id: string;
          direction: string;
          expires_at?: string | null;
          external_id?: string | null;
          id?: string;
          read_at?: string | null;
          sent_at?: string | null;
          status?: string | null;
        };
        Update: {
          attachment_urls?: string[] | null;
          channel?: string;
          content?: string;
          conversation_id?: string;
          direction?: string;
          expires_at?: string | null;
          external_id?: string | null;
          id?: string;
          read_at?: string | null;
          sent_at?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      reminders: {
        Row: {
          conversation_id: string | null;
          created_at: string | null;
          done: boolean | null;
          id: string;
          note: string | null;
          remind_at: string;
          workspace_id: string;
        };
        Insert: {
          conversation_id?: string | null;
          created_at?: string | null;
          done?: boolean | null;
          id?: string;
          note?: string | null;
          remind_at: string;
          workspace_id: string;
        };
        Update: {
          conversation_id?: string | null;
          created_at?: string | null;
          done?: boolean | null;
          id?: string;
          note?: string | null;
          remind_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminders_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reminders_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_color: string | null;
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string | null;
          plan: string | null;
          plan_ends_at: string | null;
          theme: string | null;
        };
        Insert: {
          avatar_color?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          id: string;
          name?: string | null;
          plan?: string | null;
          plan_ends_at?: string | null;
          theme?: string | null;
        };
        Update: {
          avatar_color?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string | null;
          plan?: string | null;
          plan_ends_at?: string | null;
          theme?: string | null;
        };
        Relationships: [];
      };
      whitelist: {
        Row: {
          created_at: string | null;
          display_handle: string | null;
          external_id: string;
          id: string;
          provider: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string | null;
          display_handle?: string | null;
          external_id: string;
          id?: string;
          provider: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string | null;
          display_handle?: string | null;
          external_id?: string;
          id?: string;
          provider?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "whitelist_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      workspaces: {
        Row: {
          avatar_color: string | null;
          created_at: string | null;
          id: string;
          is_default: boolean | null;
          name: string;
          user_id: string;
        };
        Insert: {
          avatar_color?: string | null;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          name: string;
          user_id: string;
        };
        Update: {
          avatar_color?: string | null;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspaces_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_merge_suggestions: {
        Args: { p_min_similarity?: number; p_workspace_id: string };
        Returns: number;
      };
      get_decrypted_messages: {
        Args: {
          p_conversation_id: string;
          p_order?: string;
          p_start?: number;
          p_stop?: number;
        };
        Returns: {
          attachment_urls: string[];
          channel: string;
          content: string;
          conversation_id: string;
          direction: string;
          expires_at: string;
          external_id: string;
          id: string;
          read_at: string;
          sent_at: string;
          status: string;
        }[];
      };
      link_contact_channel: {
        Args: { p_contact_channel_id: string; p_target_contact_id: string };
        Returns: string;
      };
      list_contact_conversation_groups: {
        Args: {
          p_start_index?: number;
          p_stop_index?: number;
          p_workspace_id: string;
        };
        Returns: {
          channels: string[];
          contact_name: string;
          conversations: Json;
          group_key: string;
          last_message_at: string;
          total_unread: number;
        }[];
      };
      merge_contacts: {
        Args: { p_source_contact_id: string; p_target_contact_id: string };
        Returns: string;
      };
      run_merge_suggestions_for_all_workspaces: {
        Args: never;
        Returns: undefined;
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      upsert_contact_channel: {
        Args: {
          p_contact_name?: string;
          p_display_handle?: string;
          p_external_id: string;
          p_provider: string;
          p_workspace_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
