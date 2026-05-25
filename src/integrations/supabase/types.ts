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
      appointments: {
        Row: {
          branch_id: string
          created_at: string
          doctor_id: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string
          service_type: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time: string
          service_type: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string
          service_type?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          branch_id: string
          id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          branch_id: string
          id?: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          branch_id?: string
          id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_assignments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string | null
          features: string[] | null
          hours_saturday: string | null
          hours_sunday: string | null
          hours_weekdays: string | null
          id: string
          is_active: boolean | null
          is_head_office: boolean | null
          is_mh_location: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          region: string
          state: string
          type: Database["public"]["Enums"]["branch_type"]
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email?: string | null
          features?: string[] | null
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          id?: string
          is_active?: boolean | null
          is_head_office?: boolean | null
          is_mh_location?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          region: string
          state: string
          type?: Database["public"]["Enums"]["branch_type"]
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string | null
          features?: string[] | null
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          id?: string
          is_active?: boolean | null
          is_head_office?: boolean | null
          is_mh_location?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          region?: string
          state?: string
          type?: Database["public"]["Enums"]["branch_type"]
          updated_at?: string
        }
        Relationships: []
      }
      browse_nudge_log: {
        Row: {
          id: string
          product_id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          sent_at?: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "browse_nudge_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_abandonment_events: {
        Row: {
          abandoned_at: string
          cart_snapshot: Json
          created_at: string | null
          currency: string | null
          discount_code: string | null
          id: string
          recovered_at: string | null
          step_1_sent_at: string | null
          step_2_sent_at: string | null
          step_3_sent_at: string | null
          total_value: number
          user_id: string
        }
        Insert: {
          abandoned_at?: string
          cart_snapshot?: Json
          created_at?: string | null
          currency?: string | null
          discount_code?: string | null
          id?: string
          recovered_at?: string | null
          step_1_sent_at?: string | null
          step_2_sent_at?: string | null
          step_3_sent_at?: string | null
          total_value?: number
          user_id: string
        }
        Update: {
          abandoned_at?: string
          cart_snapshot?: Json
          created_at?: string | null
          currency?: string | null
          discount_code?: string | null
          id?: string
          recovered_at?: string | null
          step_1_sent_at?: string | null
          step_2_sent_at?: string | null
          step_3_sent_at?: string | null
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          prescription_data: Json | null
          product_id: string
          quantity: number
          reserved_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          prescription_data?: Json | null
          product_id: string
          quantity?: number
          reserved_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          prescription_data?: Json | null
          product_id?: string
          quantity?: number
          reserved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          brand_line: Database["public"]["Enums"]["brand_line"]
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          brand_line: Database["public"]["Enums"]["brand_line"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          brand_line?: Database["public"]["Enums"]["brand_line"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      frame_attributes: {
        Row: {
          ar_overlay_url: string | null
          best_for_faces: string | null
          best_for_occasions: string | null
          bridge_size: number | null
          created_at: string
          frame_material: string | null
          frame_shape: string | null
          front_color: string | null
          has_clip_on: boolean | null
          id: string
          lens_height: number | null
          lens_width: number | null
          model_code: string | null
          pd_range_max: number | null
          pd_range_min: number | null
          product_id: string
          progressive_compatible: boolean | null
          rx_sph_max: number | null
          rx_sph_min: number | null
          size_label: string | null
          temple_color: string | null
          temple_length: number | null
          total_width: number | null
        }
        Insert: {
          ar_overlay_url?: string | null
          best_for_faces?: string | null
          best_for_occasions?: string | null
          bridge_size?: number | null
          created_at?: string
          frame_material?: string | null
          frame_shape?: string | null
          front_color?: string | null
          has_clip_on?: boolean | null
          id?: string
          lens_height?: number | null
          lens_width?: number | null
          model_code?: string | null
          pd_range_max?: number | null
          pd_range_min?: number | null
          product_id: string
          progressive_compatible?: boolean | null
          rx_sph_max?: number | null
          rx_sph_min?: number | null
          size_label?: string | null
          temple_color?: string | null
          temple_length?: number | null
          total_width?: number | null
        }
        Update: {
          ar_overlay_url?: string | null
          best_for_faces?: string | null
          best_for_occasions?: string | null
          bridge_size?: number | null
          created_at?: string
          frame_material?: string | null
          frame_shape?: string | null
          front_color?: string | null
          has_clip_on?: boolean | null
          id?: string
          lens_height?: number | null
          lens_width?: number | null
          model_code?: string | null
          pd_range_max?: number | null
          pd_range_min?: number | null
          product_id?: string
          progressive_compatible?: boolean | null
          rx_sph_max?: number | null
          rx_sph_min?: number | null
          size_label?: string | null
          temple_color?: string | null
          temple_length?: number | null
          total_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "frame_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      import_history: {
        Row: {
          created_at: string
          duration_seconds: number | null
          error_details: Json | null
          failed_records: number
          file_name: string | null
          id: string
          import_type: string
          new_products: number
          performed_by: string
          total_records: number
          updated_products: number
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          error_details?: Json | null
          failed_records?: number
          file_name?: string | null
          id?: string
          import_type?: string
          new_products?: number
          performed_by: string
          total_records?: number
          updated_products?: number
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          error_details?: Json | null
          failed_records?: number
          file_name?: string | null
          id?: string
          import_type?: string
          new_products?: number
          performed_by?: string
          total_records?: number
          updated_products?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          bin_location: string | null
          branch_id: string
          created_at: string
          id: string
          last_received_date: string | null
          last_stock_count_date: string | null
          low_stock_threshold: number | null
          product_id: string
          quantity_on_hand: number
          quantity_reserved: number
          updated_at: string
        }
        Insert: {
          bin_location?: string | null
          branch_id: string
          created_at?: string
          id?: string
          last_received_date?: string | null
          last_stock_count_date?: string | null
          low_stock_threshold?: number | null
          product_id: string
          quantity_on_hand?: number
          quantity_reserved?: number
          updated_at?: string
        }
        Update: {
          bin_location?: string | null
          branch_id?: string
          created_at?: string
          id?: string
          last_received_date?: string | null
          last_stock_count_date?: string | null
          low_stock_threshold?: number | null
          product_id?: string
          quantity_on_hand?: number
          quantity_reserved?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          notes: string | null
          performed_by: string
          product_id: string
          quantity_after: number
          quantity_before: number
          quantity_change: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          notes?: string | null
          performed_by: string
          product_id: string
          quantity_after: number
          quantity_before: number
          quantity_change: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          performed_by?: string
          product_id?: string
          quantity_after?: number
          quantity_before?: number
          quantity_change?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lens_attributes: {
        Row: {
          axis: number | null
          coating: string | null
          created_at: string
          cyl: number | null
          id: string
          lens_material: string | null
          lens_type: string | null
          product_id: string
          sph: number | null
        }
        Insert: {
          axis?: number | null
          coating?: string | null
          created_at?: string
          cyl?: number | null
          id?: string
          lens_material?: string | null
          lens_type?: string | null
          product_id: string
          sph?: number | null
        }
        Update: {
          axis?: number | null
          coating?: string | null
          created_at?: string
          cyl?: number | null
          id?: string
          lens_material?: string | null
          lens_type?: string | null
          product_id?: string
          sph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lens_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      logistics_partners: {
        Row: {
          api_endpoint: string | null
          contact_email: string | null
          contact_phone: string | null
          coverage_zones: string[] | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          coverage_zones?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          coverage_zones?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json | null
          read: boolean
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          prescription_data: Json | null
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          prescription_data?: Json | null
          price_at_purchase: number
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          prescription_data?: Json | null
          price_at_purchase?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string | null
          delivered_at: string | null
          estimated_delivery_date: string | null
          fulfillment_branch_id: string | null
          id: string
          logistics_notes: string | null
          logistics_partner: string | null
          notes: string | null
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          review_requested_at: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_fee: number | null
          shipping_zone: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          estimated_delivery_date?: string | null
          fulfillment_branch_id?: string | null
          id?: string
          logistics_notes?: string | null
          logistics_partner?: string | null
          notes?: string | null
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          review_requested_at?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_fee?: number | null
          shipping_zone?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          delivered_at?: string | null
          estimated_delivery_date?: string | null
          fulfillment_branch_id?: string | null
          id?: string
          logistics_notes?: string | null
          logistics_partner?: string | null
          notes?: string | null
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          review_requested_at?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_fee?: number | null
          shipping_zone?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_fulfillment_branch_id_fkey"
            columns: ["fulfillment_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      personalization_analytics: {
        Row: {
          created_at: string
          id: string
          metric_type: string
          metric_value: Json
          period_end: string
          period_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_type: string
          metric_value: Json
          period_end: string
          period_start: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_type?: string
          metric_value?: Json
          period_end?: string
          period_start?: string
        }
        Relationships: []
      }
      poll_responses: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          response: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          response: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          response?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "style_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_name: string | null
          document_url: string | null
          expiry_date: string
          id: string
          is_verified: boolean | null
          issue_date: string
          notes: string | null
          rx_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_name?: string | null
          document_url?: string | null
          expiry_date: string
          id?: string
          is_verified?: boolean | null
          issue_date: string
          notes?: string | null
          rx_data?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_name?: string | null
          document_url?: string | null
          expiry_date?: string
          id?: string
          is_verified?: boolean | null
          issue_date?: string
          notes?: string | null
          rx_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      product_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_verified_purchase: boolean
          product_id: string
          rating: number
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean
          product_id: string
          rating: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_images: string[] | null
          brand: string | null
          brand_line: Database["public"]["Enums"]["brand_line"]
          bridge_size: string | null
          category_id: string | null
          color: string | null
          cost_price: number | null
          created_at: string
          currency: string | null
          description: string | null
          description_html: string | null
          description_raw: string | null
          external_id: string | null
          frame_width: string | null
          gender: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_prescription_compatible: boolean | null
          item_type: Database["public"]["Enums"]["item_type"] | null
          lead_time_days: number | null
          material: string | null
          name: string
          price: number
          price_tier: Database["public"]["Enums"]["price_tier"] | null
          primary_image_locked: boolean
          record_type: Database["public"]["Enums"]["record_type"] | null
          reorder_level: number | null
          reorder_quantity: number | null
          sku: string
          style: string | null
          supplier_id: string | null
          tagline: string | null
          temple_length: string | null
          unit: string | null
          updated_at: string
          zoho_item_id: string | null
        }
        Insert: {
          additional_images?: string[] | null
          brand?: string | null
          brand_line: Database["public"]["Enums"]["brand_line"]
          bridge_size?: string | null
          category_id?: string | null
          color?: string | null
          cost_price?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          description_html?: string | null
          description_raw?: string | null
          external_id?: string | null
          frame_width?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_prescription_compatible?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"] | null
          lead_time_days?: number | null
          material?: string | null
          name: string
          price: number
          price_tier?: Database["public"]["Enums"]["price_tier"] | null
          primary_image_locked?: boolean
          record_type?: Database["public"]["Enums"]["record_type"] | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          sku: string
          style?: string | null
          supplier_id?: string | null
          tagline?: string | null
          temple_length?: string | null
          unit?: string | null
          updated_at?: string
          zoho_item_id?: string | null
        }
        Update: {
          additional_images?: string[] | null
          brand?: string | null
          brand_line?: Database["public"]["Enums"]["brand_line"]
          bridge_size?: string | null
          category_id?: string | null
          color?: string | null
          cost_price?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          description_html?: string | null
          description_raw?: string | null
          external_id?: string | null
          frame_width?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_prescription_compatible?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"] | null
          lead_time_days?: number | null
          material?: string | null
          name?: string
          price?: number
          price_tier?: Database["public"]["Enums"]["price_tier"] | null
          primary_image_locked?: boolean
          record_type?: Database["public"]["Enums"]["record_type"] | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          sku?: string
          style?: string | null
          supplier_id?: string | null
          tagline?: string | null
          temple_length?: string | null
          unit?: string | null
          updated_at?: string
          zoho_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          face_dimensions: Json | null
          frame_preferences: Json | null
          full_name: string | null
          id: string
          phone_number: string | null
          prescription_on_file: boolean | null
          updated_at: string
          user_id: string
          vto_photo_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          face_dimensions?: Json | null
          frame_preferences?: Json | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          prescription_on_file?: boolean | null
          updated_at?: string
          user_id: string
          vto_photo_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          face_dimensions?: Json | null
          frame_preferences?: Json | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          prescription_on_file?: boolean | null
          updated_at?: string
          user_id?: string
          vto_photo_url?: string | null
        }
        Relationships: []
      }
      promo_banners: {
        Row: {
          created_at: string
          date_label: string
          description: string
          disclaimer: string
          discount_prefix: string
          discount_value: string
          featured_product_ids: string[]
          id: string
          is_active: boolean
          title_line1: string
          title_line2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_label?: string
          description?: string
          disclaimer?: string
          discount_prefix?: string
          discount_value?: string
          featured_product_ids?: string[]
          id?: string
          is_active?: boolean
          title_line1?: string
          title_line2?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_label?: string
          description?: string
          disclaimer?: string
          discount_prefix?: string
          discount_value?: string
          featured_product_ids?: string[]
          id?: string
          is_active?: boolean
          title_line1?: string
          title_line2?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number | null
          total_cost: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          purchase_order_id: string
          quantity_ordered: number
          quantity_received?: number | null
          total_cost?: number | null
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          total_cost?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          created_by: string
          currency: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          received_date: string | null
          status: Database["public"]["Enums"]["purchase_order_status"]
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          created_by: string
          currency?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          received_date?: string | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string
          currency?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          received_date?: string | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          requires_appointment: boolean | null
          service_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          requires_appointment?: boolean | null
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          requires_appointment?: boolean | null
          service_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          base_fee: number
          created_at: string
          description: string | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean
          label: string
          max_delivery_days: number
          min_delivery_days: number
          zone_key: string
        }
        Insert: {
          base_fee?: number
          created_at?: string
          description?: string | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean
          label: string
          max_delivery_days?: number
          min_delivery_days?: number
          zone_key: string
        }
        Update: {
          base_fee?: number
          created_at?: string
          description?: string | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean
          label?: string
          max_delivery_days?: number
          min_delivery_days?: number
          zone_key?: string
        }
        Relationships: []
      }
      slideshow_items: {
        Row: {
          created_at: string
          discount_label: string | null
          discount_percent: number | null
          display_order: number
          id: string
          is_active: boolean
          product_id: string
        }
        Insert: {
          created_at?: string
          discount_label?: string | null
          discount_percent?: number | null
          display_order?: number
          id?: string
          is_active?: boolean
          product_id: string
        }
        Update: {
          created_at?: string
          discount_label?: string | null
          discount_percent?: number | null
          display_order?: number
          id?: string
          is_active?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slideshow_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          id: string
          performed_by: string
          product_id: string
          quantity_after: number
          quantity_before: number
          quantity_change: number | null
          reason: string
        }
        Insert: {
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          id?: string
          performed_by: string
          product_id: string
          quantity_after: number
          quantity_before: number
          quantity_change?: number | null
          reason: string
        }
        Update: {
          adjustment_type?: Database["public"]["Enums"]["adjustment_type"]
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          id?: string
          performed_by?: string
          product_id?: string
          quantity_after?: number
          quantity_before?: number
          quantity_change?: number | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity_received: number | null
          quantity_requested: number
          quantity_sent: number | null
          stock_transfer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity_received?: number | null
          quantity_requested: number
          quantity_sent?: number | null
          stock_transfer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity_received?: number | null
          quantity_requested?: number
          quantity_sent?: number | null
          stock_transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_stock_transfer_id_fkey"
            columns: ["stock_transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          completed_at: string | null
          created_at: string
          from_branch_id: string
          id: string
          initiated_by: string
          notes: string | null
          received_by: string | null
          shipped_at: string | null
          status: Database["public"]["Enums"]["transfer_status"]
          to_branch_id: string
          transfer_number: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          from_branch_id: string
          id?: string
          initiated_by: string
          notes?: string | null
          received_by?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_branch_id: string
          transfer_number: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          from_branch_id?: string
          id?: string
          initiated_by?: string
          notes?: string | null
          received_by?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_branch_id?: string
          transfer_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_branch_id_fkey"
            columns: ["from_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_branch_id_fkey"
            columns: ["to_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      style_polls: {
        Row: {
          category: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          options: Json
          poll_type: string
          question: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          options?: Json
          poll_type?: string
          question: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          options?: Json
          poll_type?: string
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          state: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          category: string | null
          created_at: string
          id: string
          metadata: Json | null
          product_id: string | null
          search_query: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          category?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          search_query?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          category?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          search_query?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_measurements: {
        Row: {
          bridge_width_mm: number | null
          confidence_score: number | null
          created_at: string
          face_shape: string | null
          face_width_mm: number | null
          id: string
          image_url: string | null
          measurement_type: string
          pupillary_distance_mm: number | null
          raw_analysis: Json | null
          temple_width_mm: number | null
          user_id: string
        }
        Insert: {
          bridge_width_mm?: number | null
          confidence_score?: number | null
          created_at?: string
          face_shape?: string | null
          face_width_mm?: number | null
          id?: string
          image_url?: string | null
          measurement_type?: string
          pupillary_distance_mm?: number | null
          raw_analysis?: Json | null
          temple_width_mm?: number | null
          user_id: string
        }
        Update: {
          bridge_width_mm?: number | null
          confidence_score?: number | null
          created_at?: string
          face_shape?: string | null
          face_width_mm?: number | null
          id?: string
          image_url?: string | null
          measurement_type?: string
          pupillary_distance_mm?: number | null
          raw_analysis?: Json | null
          temple_width_mm?: number | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      vto_email_leads: {
        Row: {
          created_at: string
          email: string
          frame_id: string | null
          frame_name: string | null
          id: string
          marketing_consent: boolean
          source: string
          try_on_image_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          frame_id?: string | null
          frame_name?: string | null
          id?: string
          marketing_consent?: boolean
          source?: string
          try_on_image_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          frame_id?: string | null
          frame_name?: string | null
          id?: string
          marketing_consent?: boolean
          source?: string
          try_on_image_url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vto_email_leads_frame_id_fkey"
            columns: ["frame_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      zoho_sync_log: {
        Row: {
          completed_at: string | null
          direction: string
          error_details: Json | null
          id: string
          metadata: Json | null
          performed_by: string | null
          records_failed: number | null
          records_processed: number | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          direction: string
          error_details?: Json | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          records_failed?: number | null
          records_processed?: number | null
          started_at?: string | null
          status?: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          direction?: string
          error_details?: Json | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          records_failed?: number | null
          records_processed?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      zoho_warehouse_mapping: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          zoho_location_id: string
          zoho_location_name: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          zoho_location_id: string
          zoho_location_name?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          zoho_location_id?: string
          zoho_location_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zoho_warehouse_mapping_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      branch_ids_for_user: {
        Args: { _user_id: string }
        Returns: {
          branch_id: string
        }[]
      }
      check_product_availability: {
        Args: { p_product_id: string }
        Returns: Json
      }
      create_staff_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type?: Database["public"]["Enums"]["notification_type"]
        }
        Returns: undefined
      }
      create_user_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type?: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_product_category_counts: {
        Args: never
        Returns: {
          category: string
          count: number
        }[]
      }
      get_product_image_category_stats: { Args: never; Returns: Json }
      get_product_image_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      adjustment_type:
        | "count_correction"
        | "damage"
        | "expiry"
        | "write_off"
        | "other"
      app_role:
        | "user"
        | "customer"
        | "branch_staff"
        | "branch_manager"
        | "admin"
        | "super_admin"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "checked_in"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      branch_type: "physical_store" | "online_warehouse"
      brand_line: "soteria_medical" | "m_and_h_fashion"
      item_type:
        | "frames"
        | "lenses"
        | "contact_lenses"
        | "solutions"
        | "medications"
        | "accessories"
        | "other"
        | "cleanser"
        | "packaging"
      notification_type:
        | "info"
        | "warning"
        | "error"
        | "success"
        | "low_stock"
        | "new_order"
        | "transfer_request"
        | "appointment"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "ready_for_pickup"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "packed"
        | "shipped_local"
        | "shipped_interstate"
        | "shipped_international"
        | "in_transit_hub"
        | "customs_clearance"
        | "in_transit_country"
        | "out_for_delivery"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      price_tier: "budget" | "standard" | "premium" | "luxury"
      purchase_order_status:
        | "draft"
        | "submitted"
        | "approved"
        | "partially_received"
        | "received"
        | "cancelled"
      record_type: "inventory_item" | "service"
      transaction_type:
        | "purchase_received"
        | "sale"
        | "return_in"
        | "return_out"
        | "transfer_in"
        | "transfer_out"
        | "adjustment"
        | "write_off"
        | "initial_stock"
        | "zoho_sync"
      transfer_status: "pending" | "in_transit" | "received" | "cancelled"
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
      adjustment_type: [
        "count_correction",
        "damage",
        "expiry",
        "write_off",
        "other",
      ],
      app_role: [
        "user",
        "customer",
        "branch_staff",
        "branch_manager",
        "admin",
        "super_admin",
      ],
      appointment_status: [
        "scheduled",
        "confirmed",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      branch_type: ["physical_store", "online_warehouse"],
      brand_line: ["soteria_medical", "m_and_h_fashion"],
      item_type: [
        "frames",
        "lenses",
        "contact_lenses",
        "solutions",
        "medications",
        "accessories",
        "other",
        "cleanser",
        "packaging",
      ],
      notification_type: [
        "info",
        "warning",
        "error",
        "success",
        "low_stock",
        "new_order",
        "transfer_request",
        "appointment",
      ],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "ready_for_pickup",
        "shipped",
        "delivered",
        "cancelled",
        "packed",
        "shipped_local",
        "shipped_interstate",
        "shipped_international",
        "in_transit_hub",
        "customs_clearance",
        "in_transit_country",
        "out_for_delivery",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      price_tier: ["budget", "standard", "premium", "luxury"],
      purchase_order_status: [
        "draft",
        "submitted",
        "approved",
        "partially_received",
        "received",
        "cancelled",
      ],
      record_type: ["inventory_item", "service"],
      transaction_type: [
        "purchase_received",
        "sale",
        "return_in",
        "return_out",
        "transfer_in",
        "transfer_out",
        "adjustment",
        "write_off",
        "initial_stock",
        "zoho_sync",
      ],
      transfer_status: ["pending", "in_transit", "received", "cancelled"],
    },
  },
} as const
