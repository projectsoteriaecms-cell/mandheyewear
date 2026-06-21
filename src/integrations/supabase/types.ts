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
      crm_campaign_runs: {
        Row: {
          bounced_count: number
          campaign_id: string
          clicked_count: number
          completed_at: string | null
          error_message: string | null
          id: string
          opened_count: number
          sent_count: number
          started_at: string
          total_recipients: number
        }
        Insert: {
          bounced_count?: number
          campaign_id: string
          clicked_count?: number
          completed_at?: string | null
          error_message?: string | null
          id?: string
          opened_count?: number
          sent_count?: number
          started_at?: string
          total_recipients?: number
        }
        Update: {
          bounced_count?: number
          campaign_id?: string
          clicked_count?: number
          completed_at?: string | null
          error_message?: string | null
          id?: string
          opened_count?: number
          sent_count?: number
          started_at?: string
          total_recipients?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_campaign_runs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_campaign_sent_ledger: {
        Row: {
          campaign_run_id: string
          contact_email: string
          id: string
          resend_message_id: string | null
          sent_at: string
        }
        Insert: {
          campaign_run_id: string
          contact_email: string
          id?: string
          resend_message_id?: string | null
          sent_at?: string
        }
        Update: {
          campaign_run_id?: string
          contact_email?: string
          id?: string
          resend_message_id?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_campaign_sent_ledger_campaign_run_id_fkey"
            columns: ["campaign_run_id"]
            isOneToOne: false
            referencedRelation: "crm_campaign_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_campaign_whatsapp_ledger: {
        Row: {
          campaign_id: string
          contact_phone: string
          created_at: string
          error_message: string | null
          id: string
          status: string
          twilio_message_sid: string | null
        }
        Insert: {
          campaign_id: string
          contact_phone: string
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          twilio_message_sid?: string | null
        }
        Update: {
          campaign_id?: string
          contact_phone?: string
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          twilio_message_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_campaign_whatsapp_ledger_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_campaigns: {
        Row: {
          active_run_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          preview_text: string | null
          scheduled_at: string | null
          segment_id: string | null
          send_heartbeat_at: string | null
          started_at: string | null
          status: string
          subject_line: string | null
          template_id: string | null
          updated_at: string
          whatsapp_body: string | null
          whatsapp_completed_at: string | null
          whatsapp_content_sid: string | null
          whatsapp_enabled: boolean
          whatsapp_failed_count: number
          whatsapp_heartbeat_at: string | null
          whatsapp_sent_count: number
        }
        Insert: {
          active_run_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          preview_text?: string | null
          scheduled_at?: string | null
          segment_id?: string | null
          send_heartbeat_at?: string | null
          started_at?: string | null
          status?: string
          subject_line?: string | null
          template_id?: string | null
          updated_at?: string
          whatsapp_body?: string | null
          whatsapp_completed_at?: string | null
          whatsapp_content_sid?: string | null
          whatsapp_enabled?: boolean
          whatsapp_failed_count?: number
          whatsapp_heartbeat_at?: string | null
          whatsapp_sent_count?: number
        }
        Update: {
          active_run_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          preview_text?: string | null
          scheduled_at?: string | null
          segment_id?: string | null
          send_heartbeat_at?: string | null
          started_at?: string | null
          status?: string
          subject_line?: string | null
          template_id?: string | null
          updated_at?: string
          whatsapp_body?: string | null
          whatsapp_completed_at?: string | null
          whatsapp_content_sid?: string | null
          whatsapp_enabled?: boolean
          whatsapp_failed_count?: number
          whatsapp_heartbeat_at?: string | null
          whatsapp_sent_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_campaigns_active_run_id_fkey"
            columns: ["active_run_id"]
            isOneToOne: false
            referencedRelation: "crm_campaign_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_campaigns_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "crm_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_daily_send_quota: {
        Row: {
          date: string
          quota_limit: number
          sent_count: number
          updated_at: string
        }
        Insert: {
          date?: string
          quota_limit?: number
          sent_count?: number
          updated_at?: string
        }
        Update: {
          date?: string
          quota_limit?: number
          sent_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      crm_email_events: {
        Row: {
          campaign_id: string | null
          campaign_run_id: string | null
          contact_email: string | null
          event_type: string
          id: string
          link_clicked: string | null
          metadata: Json | null
          occurred_at: string
          provider_event_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          campaign_run_id?: string | null
          contact_email?: string | null
          event_type: string
          id?: string
          link_clicked?: string | null
          metadata?: Json | null
          occurred_at?: string
          provider_event_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          campaign_run_id?: string | null
          contact_email?: string | null
          event_type?: string
          id?: string
          link_clicked?: string | null
          metadata?: Json | null
          occurred_at?: string
          provider_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_events_campaign_run_id_fkey"
            columns: ["campaign_run_id"]
            isOneToOne: false
            referencedRelation: "crm_campaign_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_preference_categories: {
        Row: {
          description: string | null
          id: string
          is_opt_in_default: boolean
          label: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          id: string
          is_opt_in_default?: boolean
          label: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          is_opt_in_default?: boolean
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      crm_email_preferences: {
        Row: {
          category_id: string
          email: string
          opted_in: boolean
          updated_at: string
        }
        Insert: {
          category_id: string
          email: string
          opted_in?: boolean
          updated_at?: string
        }
        Update: {
          category_id?: string
          email?: string
          opted_in?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_email_preferences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "crm_email_preference_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_preference_tokens: {
        Row: {
          created_at: string
          email: string
          refreshed_at: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          refreshed_at?: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          refreshed_at?: string
          token?: string
        }
        Relationships: []
      }
      crm_reengagement_triggers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_campaign_id: string | null
          last_contact_count: number
          last_run_at: string | null
          name: string
          template_subject: string | null
          threshold_days: number
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_campaign_id?: string | null
          last_contact_count?: number
          last_run_at?: string | null
          name: string
          template_subject?: string | null
          threshold_days?: number
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_campaign_id?: string | null
          last_contact_count?: number
          last_run_at?: string | null
          name?: string
          template_subject?: string | null
          threshold_days?: number
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_reengagement_triggers_last_campaign_id_fkey"
            columns: ["last_campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_segment_eval_queue: {
        Row: {
          attempt_count: number
          completed_at: string | null
          enqueued_at: string
          last_error: string | null
          max_attempts: number
          next_retry_at: string | null
          segment_id: string
          status: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          enqueued_at?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          segment_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          enqueued_at?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          segment_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_segment_eval_queue_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: true
            referencedRelation: "crm_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_segments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_dynamic: boolean
          last_computed_at: string | null
          last_evaluated_at: string | null
          member_count: number
          name: string
          rules_json: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_dynamic?: boolean
          last_computed_at?: string | null
          last_evaluated_at?: string | null
          member_count?: number
          name: string
          rules_json?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_dynamic?: boolean
          last_computed_at?: string | null
          last_evaluated_at?: string | null
          member_count?: number
          name?: string
          rules_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      crm_service_health: {
        Row: {
          failure_count: number
          last_failure_at: string | null
          service_name: string
          state: string
          tripped_at: string | null
          updated_at: string
        }
        Insert: {
          failure_count?: number
          last_failure_at?: string | null
          service_name: string
          state?: string
          tripped_at?: string | null
          updated_at?: string
        }
        Update: {
          failure_count?: number
          last_failure_at?: string | null
          service_name?: string
          state?: string
          tripped_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_warm_up_schedule: {
        Row: {
          daily_limit: number
          day_from: number
          day_to: number
          id: number
        }
        Insert: {
          daily_limit: number
          day_from: number
          day_to: number
          id?: number
        }
        Update: {
          daily_limit?: number
          day_from?: number
          day_to?: number
          id?: number
        }
        Relationships: []
      }
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
          fitting_booked: boolean
          frame_only: boolean
          id: string
          lens_coatings: string[] | null
          lens_index: string | null
          lens_price: number
          lens_type: string | null
          prescription_data: Json | null
          prescription_id: string | null
          product_id: string
          quantity: number
          requires_fitting: boolean
          reserved_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          fitting_booked?: boolean
          frame_only?: boolean
          id?: string
          lens_coatings?: string[] | null
          lens_index?: string | null
          lens_price?: number
          lens_type?: string | null
          prescription_data?: Json | null
          prescription_id?: string | null
          product_id: string
          quantity?: number
          requires_fitting?: boolean
          reserved_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          fitting_booked?: boolean
          frame_only?: boolean
          id?: string
          lens_coatings?: string[] | null
          lens_index?: string | null
          lens_price?: number
          lens_type?: string | null
          prescription_data?: Json | null
          prescription_id?: string | null
          product_id?: string
          quantity?: number
          requires_fitting?: boolean
          reserved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "user_prescriptions"
            referencedColumns: ["id"]
          },
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
          fitting_booked: boolean
          frame_only: boolean
          id: string
          lens_coatings: string[] | null
          lens_index: string | null
          lens_price: number
          lens_type: string | null
          order_id: string
          prescription_data: Json | null
          prescription_id: string | null
          price_at_purchase: number
          product_id: string
          quantity: number
          requires_fitting: boolean
        }
        Insert: {
          created_at?: string
          fitting_booked?: boolean
          frame_only?: boolean
          id?: string
          lens_coatings?: string[] | null
          lens_index?: string | null
          lens_price?: number
          lens_type?: string | null
          order_id: string
          prescription_data?: Json | null
          prescription_id?: string | null
          price_at_purchase: number
          product_id: string
          quantity?: number
          requires_fitting?: boolean
        }
        Update: {
          created_at?: string
          fitting_booked?: boolean
          frame_only?: boolean
          id?: string
          lens_coatings?: string[] | null
          lens_index?: string | null
          lens_price?: number
          lens_type?: string | null
          order_id?: string
          prescription_data?: Json | null
          prescription_id?: string | null
          price_at_purchase?: number
          product_id?: string
          quantity?: number
          requires_fitting?: boolean
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
      user_prescriptions: {
        Row: {
          clinic_name: string | null
          created_at: string
          document_url: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          issued_date: string | null
          left_eye: Json | null
          notes: string | null
          pd_distance: number | null
          pd_left: number | null
          pd_near: number | null
          pd_right: number | null
          prescriber_name: string | null
          right_eye: Json | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_name?: string | null
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          issued_date?: string | null
          left_eye?: Json | null
          notes?: string | null
          pd_distance?: number | null
          pd_left?: number | null
          pd_near?: number | null
          pd_right?: number | null
          prescriber_name?: string | null
          right_eye?: Json | null
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_name?: string | null
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          issued_date?: string | null
          left_eye?: Json | null
          notes?: string | null
          pd_distance?: number | null
          pd_left?: number | null
          pd_near?: number | null
          pd_right?: number | null
          prescriber_name?: string | null
          right_eye?: Json | null
          source?: string
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
      crm_contacts: {
        Row: {
          email: string | null
          first_seen: string | null
          frame_preferences: Json | null
          full_name: string | null
          is_newsletter_subscriber: boolean | null
          is_registered: boolean | null
          is_suppressed: boolean | null
          is_vto_lead: boolean | null
          last_activity_at: string | null
          last_frame_name: string | null
          last_order_at: string | null
          last_try_on_image_url: string | null
          lifetime_value: number | null
          marketing_consent: boolean | null
          newsletter_active: boolean | null
          order_count: number | null
          phone: string | null
          prescription_on_file: boolean | null
          profile_id: string | null
          try_on_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      crm_apply_email_preferences: {
        Args: { p_email: string; p_prefs: Json; p_unsubscribe_all?: boolean }
        Returns: undefined
      }
      crm_build_trigger_rules: {
        Args: { p_threshold_days: number; p_type: string }
        Returns: Json
      }
      crm_build_where_clause: { Args: { p_node: Json }; Returns: string }
      crm_check_and_claim_send_quota: {
        Args: { p_count: number }
        Returns: {
          allowed: boolean
          quota_limit: number
          remaining: number
          today_sent: number
        }[]
      }
      crm_claim_campaign_for_send: {
        Args: { p_campaign_id?: string }
        Returns: {
          campaign_id: string
          campaign_name: string
          is_new_run: boolean
          rules_json: Json
          run_id: string
          segment_id: string
          subject_line: string
          template_id: string
        }[]
      }
      crm_claim_segment_eval_job: {
        Args: never
        Returns: {
          attempt_count: number
          completed_at: string | null
          enqueued_at: string
          last_error: string | null
          max_attempts: number
          next_retry_at: string | null
          segment_id: string
          status: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "crm_segment_eval_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      crm_cohort_grid: {
        Args: { p_months?: number }
        Returns: {
          active_count: number
          cohort_month: string
          cohort_size: number
          months_after: number
          retention_pct: number
        }[]
      }
      crm_complete_campaign_run: {
        Args: { p_campaign_id: string; p_run_id: string }
        Returns: undefined
      }
      crm_complete_whatsapp: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      crm_contact_stats: {
        Args: never
        Returns: {
          paying_customers: number
          registered: number
          subscribers: number
          suppressed: number
          total_contacts: number
          vto_leads: number
        }[]
      }
      crm_count_segment_members: {
        Args: { p_rules_json: Json }
        Returns: number
      }
      crm_count_whatsapp_recipients: {
        Args: { p_rules_json: Json }
        Returns: number
      }
      crm_enqueue_segment_eval: {
        Args: { p_segment_id: string }
        Returns: string
      }
      crm_ensure_preference_token: {
        Args: { p_email: string }
        Returns: string
      }
      crm_eval_segment_rules: {
        Args: { p_rules: Json }
        Returns: {
          email: string
          first_seen: string
          full_name: string
          is_newsletter_subscriber: boolean
          is_registered: boolean
          is_suppressed: boolean
          is_vto_lead: boolean
          last_activity_at: string
          last_frame_name: string
          last_order_at: string
          lifetime_value: number
          marketing_consent: boolean
          newsletter_active: boolean
          order_count: number
          phone: string
          prescription_on_file: boolean
          try_on_count: number
        }[]
      }
      crm_fire_reengagement_trigger: {
        Args: { p_trigger_id: string }
        Returns: {
          campaign_id: string
          contact_count: number
        }[]
      }
      crm_get_preference_stats: {
        Args: never
        Returns: {
          category_id: string
          category_label: string
          opted_in_count: number
          opted_out_count: number
          sort_order: number
          total_eligible: number
          unsubscribed_total: number
        }[]
      }
      crm_get_send_quota_status: {
        Args: never
        Returns: {
          global_kill: boolean
          pct_used: number
          quota_limit: number
          today_date: string
          today_sent: number
          warmup_day: number
        }[]
      }
      crm_get_unsent_batch: {
        Args: { p_batch_size?: number; p_rules_json: Json; p_run_id: string }
        Returns: {
          email: string
          full_name: string
          preference_token: string
        }[]
      }
      crm_get_unsent_whatsapp_batch: {
        Args: {
          p_batch_size?: number
          p_campaign_id: string
          p_rules_json: Json
        }
        Returns: {
          full_name: string
          phone: string
        }[]
      }
      crm_handle_email_event: {
        Args: {
          p_event_type: string
          p_link_clicked?: string
          p_metadata?: Json
          p_occurred_at?: string
          p_provider_event_id: string
          p_resend_email_id: string
        }
        Returns: Json
      }
      crm_list_triggers: {
        Args: never
        Returns: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          last_campaign_id: string
          last_campaign_name: string
          last_campaign_status: string
          last_contact_count: number
          last_run_at: string
          name: string
          template_subject: string
          threshold_days: number
          trigger_type: string
        }[]
      }
      crm_ltv_by_channel: {
        Args: never
        Returns: {
          avg_ltv: number
          channel: string
          contact_count: number
          conversion_rate: number
          converted_count: number
          total_revenue: number
        }[]
      }
      crm_ltv_summary: {
        Args: never
        Returns: {
          avg_ltv_converted: number
          conversion_rate: number
          converted_count: number
          median_ltv: number
          p90_ltv: number
          total_contacts: number
          total_revenue: number
        }[]
      }
      crm_monthly_revenue_trend: {
        Args: { p_months?: number }
        Returns: {
          month: string
          new_customers: number
          order_count: number
          revenue: number
        }[]
      }
      crm_pause_campaign: {
        Args: { p_campaign_id: string; p_reason?: string }
        Returns: undefined
      }
      crm_preview_campaign_recipients: {
        Args: { p_campaign_id: string; p_sample_limit?: number }
        Returns: {
          sample_emails: string[]
          total_count: number
        }[]
      }
      crm_rls_preflight: { Args: never; Returns: Json }
      crm_rotate_preference_token: {
        Args: { p_email: string }
        Returns: string
      }
      crm_set_global_kill_switch: {
        Args: { p_active: boolean }
        Returns: undefined
      }
      crm_update_send_progress: {
        Args: { p_campaign_id: string; p_run_id: string; p_sent_delta: number }
        Returns: undefined
      }
      crm_update_whatsapp_progress: {
        Args: {
          p_campaign_id: string
          p_failed_delta?: number
          p_sent_delta: number
        }
        Returns: undefined
      }
      crm_whatsapp_campaign_config: {
        Args: { p_campaign_id: string }
        Returns: {
          campaign_id: string
          campaign_name: string
          content_sid: string
          rules_json: Json
          whatsapp_body: string
          whatsapp_enabled: boolean
        }[]
      }
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
      get_product_reviews: {
        Args: { p_product_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          is_verified_purchase: boolean
          product_id: string
          rating: number
          reviewer_avatar_url: string
          reviewer_name: string
          status: string
          title: string
          updated_at: string
        }[]
      }
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
