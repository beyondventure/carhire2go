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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_type: Database["public"]["Enums"]["booking_type"]
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          consumer_id: string
          created_at: string
          driver_id: string | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          dropoff_name: string | null
          estimated_max_price: number | null
          estimated_min_price: number | null
          final_price: number | null
          id: string
          matched_at: string | null
          matching_started_at: string | null
          negotiated_price: number | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          pickup_name: string | null
          provider_id: string | null
          scheduled_date: string
          scheduled_time: string
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          vehicle_id: string | null
          vehicle_preference: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Insert: {
          booking_type: Database["public"]["Enums"]["booking_type"]
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          consumer_id: string
          created_at?: string
          driver_id?: string | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          dropoff_name?: string | null
          estimated_max_price?: number | null
          estimated_min_price?: number | null
          final_price?: number | null
          id?: string
          matched_at?: string | null
          matching_started_at?: string | null
          negotiated_price?: number | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          pickup_name?: string | null
          provider_id?: string | null
          scheduled_date: string
          scheduled_time: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vehicle_id?: string | null
          vehicle_preference?:
            | Database["public"]["Enums"]["vehicle_type"]
            | null
        }
        Update: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          consumer_id?: string
          created_at?: string
          driver_id?: string | null
          dropoff_address?: string
          dropoff_lat?: number
          dropoff_lng?: number
          dropoff_name?: string | null
          estimated_max_price?: number | null
          estimated_min_price?: number | null
          final_price?: number | null
          id?: string
          matched_at?: string | null
          matching_started_at?: string | null
          negotiated_price?: number | null
          pickup_address?: string
          pickup_lat?: number
          pickup_lng?: number
          pickup_name?: string | null
          provider_id?: string | null
          scheduled_date?: string
          scheduled_time?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vehicle_id?: string | null
          vehicle_preference?:
            | Database["public"]["Enums"]["vehicle_type"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string
          id: string
          message_type: string
          proposed_price: number | null
          sender_id: string
          sender_role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          proposed_price?: number | null
          sender_id: string
          sender_role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          proposed_price?: number | null
          sender_id?: string
          sender_role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          assigned_vehicle_id: string | null
          available: boolean | null
          created_at: string
          id: string
          license_expiry: string
          license_number: string
          nin_number: string | null
          nin_verified: boolean | null
          provider_id: string | null
          rating: number | null
          total_trips: number | null
          updated_at: string
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          assigned_vehicle_id?: string | null
          available?: boolean | null
          created_at?: string
          id?: string
          license_expiry: string
          license_number: string
          nin_number?: string | null
          nin_verified?: boolean | null
          provider_id?: string | null
          rating?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          assigned_vehicle_id?: string | null
          available?: boolean | null
          created_at?: string
          id?: string
          license_expiry?: string
          license_number?: string
          nin_number?: string | null
          nin_verified?: boolean | null
          provider_id?: string | null
          rating?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assigned_vehicle"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_booking_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_booking_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_booking_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          consumer_id: string
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          flutterwave_ref: string | null
          flutterwave_tx_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          provider_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          consumer_id: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          flutterwave_ref?: string | null
          flutterwave_tx_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          provider_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          consumer_id?: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          flutterwave_ref?: string | null
          flutterwave_tx_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          provider_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          acceptance_rate: number | null
          account_name: string | null
          account_number: string | null
          allows_negotiation: boolean
          bank_name: string | null
          business_address: string | null
          business_name: string | null
          cac_document_url: string | null
          cac_number: string | null
          cac_verified: boolean | null
          created_at: string
          id: string
          nin_number: string | null
          nin_verified: boolean | null
          provider_type: Database["public"]["Enums"]["provider_type"]
          rating: number | null
          response_time: number | null
          service_areas: string[] | null
          total_bookings: number | null
          updated_at: string
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          acceptance_rate?: number | null
          account_name?: string | null
          account_number?: string | null
          allows_negotiation?: boolean
          bank_name?: string | null
          business_address?: string | null
          business_name?: string | null
          cac_document_url?: string | null
          cac_number?: string | null
          cac_verified?: boolean | null
          created_at?: string
          id?: string
          nin_number?: string | null
          nin_verified?: boolean | null
          provider_type?: Database["public"]["Enums"]["provider_type"]
          rating?: number | null
          response_time?: number | null
          service_areas?: string[] | null
          total_bookings?: number | null
          updated_at?: string
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          acceptance_rate?: number | null
          account_name?: string | null
          account_number?: string | null
          allows_negotiation?: boolean
          bank_name?: string | null
          business_address?: string | null
          business_name?: string | null
          cac_document_url?: string | null
          cac_number?: string | null
          cac_verified?: boolean | null
          created_at?: string
          id?: string
          nin_number?: string | null
          nin_verified?: boolean | null
          provider_type?: Database["public"]["Enums"]["provider_type"]
          rating?: number | null
          response_time?: number | null
          service_areas?: string[] | null
          total_bookings?: number | null
          updated_at?: string
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          role?: string
          updated_at?: string
          user_id?: string
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
      vehicles: {
        Row: {
          assigned_driver_id: string | null
          available: boolean | null
          color: string
          created_at: string
          daily_rate: number
          id: string
          images: string[] | null
          make: string
          model: string
          plate_number: string
          provider_id: string
          seats: number
          updated_at: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          verified: boolean | null
          year: number
        }
        Insert: {
          assigned_driver_id?: string | null
          available?: boolean | null
          color: string
          created_at?: string
          daily_rate: number
          id?: string
          images?: string[] | null
          make: string
          model: string
          plate_number: string
          provider_id: string
          seats?: number
          updated_at?: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          verified?: boolean | null
          year: number
        }
        Update: {
          assigned_driver_id?: string | null
          available?: boolean | null
          color?: string
          created_at?: string
          daily_rate?: number
          id?: string
          images?: string[] | null
          make?: string
          model?: string
          plate_number?: string
          provider_id?: string
          seats?: number
          updated_at?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          verified?: boolean | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "consumer" | "provider" | "driver" | "admin"
      booking_status:
        | "pending"
        | "matching"
        | "matched"
        | "negotiating"
        | "confirmed"
        | "in-progress"
        | "completed"
        | "cancelled"
      booking_type:
        | "full-day"
        | "half-day"
        | "to-and-fro"
        | "point-to-point"
        | "event"
      provider_type: "individual" | "company"
      vehicle_type: "sedan" | "suv" | "luxury" | "van" | "bus"
      verification_status: "pending" | "under_review" | "approved" | "rejected"
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
      app_role: ["consumer", "provider", "driver", "admin"],
      booking_status: [
        "pending",
        "matching",
        "matched",
        "negotiating",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
      ],
      booking_type: [
        "full-day",
        "half-day",
        "to-and-fro",
        "point-to-point",
        "event",
      ],
      provider_type: ["individual", "company"],
      vehicle_type: ["sedan", "suv", "luxury", "van", "bus"],
      verification_status: ["pending", "under_review", "approved", "rejected"],
    },
  },
} as const
