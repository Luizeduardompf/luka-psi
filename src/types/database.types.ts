export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      genders: {
        Row: {
          id: string
          name: string
          pronoun_treatment: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          pronoun_treatment?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          pronoun_treatment?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          preferred_name: string | null
          professional_name: string | null
          gender_id: string | null
          crp: string | null
          ordem_psicologos: string | null
          phone: string | null
          avatar_url: string | null
          logo_url: string | null
          signature_url: string | null
          address: string | null
          postal_code: string | null
          city: string | null
          country: string | null
          nif: string | null
          birth_date: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          preferred_name?: string | null
          professional_name?: string | null
          gender_id?: string | null
          crp?: string | null
          ordem_psicologos?: string | null
          phone?: string | null
          avatar_url?: string | null
          logo_url?: string | null
          signature_url?: string | null
          address?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          nif?: string | null
          birth_date?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          preferred_name?: string | null
          professional_name?: string | null
          gender_id?: string | null
          crp?: string | null
          ordem_psicologos?: string | null
          phone?: string | null
          avatar_url?: string | null
          logo_url?: string | null
          signature_url?: string | null
          address?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          nif?: string | null
          birth_date?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          psychologist_id: string
          full_name: string
          preferred_name: string | null
          email: string | null
          phone: string | null
          cpf: string | null
          nif: string | null
          document_number: string | null
          document_type: string | null
          date_of_birth: string | null
          gender: string | null
          gender_id: string | null
          profession: string | null
          education: string | null
          civil_status_id: string | null
          status: 'active' | 'inactive' | 'waiting'
          address: string | null
          billing_address: string | null
          postal_code: string | null
          city: string | null
          country_id: string | null
          practice_location_id: string | null
          spouse_name: string | null
          spouse_phone: string | null
          spouse_phone_ddi: string | null
          spouse_email: string | null
          tutor_name: string | null
          tutor_phone: string | null
          tutor_email: string | null
          tutor_phone_ddi: string | null
          additional_contacts: Json | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          insurer_id: string | null
          plan_id: string | null
          emergency_contact_phone_ddi: string | null
          plan_name: string | null
          sns_user_number: string | null
          local_protocol: string | null
          consent_rgpd: boolean
          consent_informed: boolean
          consent_minors: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          psychologist_id: string
          full_name: string
          preferred_name?: string | null
          email?: string | null
          phone?: string | null
          cpf?: string | null
          nif?: string | null
          document_number?: string | null
          document_type?: string | null
          date_of_birth?: string | null
          gender?: string | null
          gender_id?: string | null
          profession?: string | null
          education?: string | null
          civil_status_id?: string | null
          status?: 'active' | 'inactive' | 'waiting'
          address?: string | null
          billing_address?: string | null
          postal_code?: string | null
          city?: string | null
          country_id?: string | null
          practice_location_id?: string | null
          spouse_name?: string | null
          spouse_phone?: string | null
          spouse_phone_ddi?: string | null
          spouse_email?: string | null
          tutor_name?: string | null
          tutor_phone?: string | null
          tutor_email?: string | null
          tutor_phone_ddi?: string | null
          additional_contacts?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          insurer_id?: string | null
          emergency_contact_phone_ddi?: string | null
          plan_id?: string | null
          plan_name?: string | null
          sns_user_number?: string | null
          local_protocol?: string | null
          consent_rgpd?: boolean
          consent_informed?: boolean
          consent_minors?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          psychologist_id?: string
          full_name?: string
          preferred_name?: string | null
          email?: string | null
          phone?: string | null
          cpf?: string | null
          nif?: string | null
          document_number?: string | null
          document_type?: string | null
          date_of_birth?: string | null
          gender?: string | null
          gender_id?: string | null
          profession?: string | null
          education?: string | null
          civil_status_id?: string | null
          status?: 'active' | 'inactive' | 'waiting'
          address?: string | null
          billing_address?: string | null
          postal_code?: string | null
          city?: string | null
          country_id?: string | null
          practice_location_id?: string | null
          spouse_name?: string | null
          spouse_phone?: string | null
          spouse_phone_ddi?: string | null
          spouse_email?: string | null
          tutor_name?: string | null
          tutor_phone?: string | null
          tutor_email?: string | null
          tutor_phone_ddi?: string | null
          additional_contacts?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          insurer_id?: string | null
          emergency_contact_phone_ddi?: string | null
          plan_id?: string | null
          plan_name?: string | null
          sns_user_number?: string | null
          local_protocol?: string | null
          consent_rgpd?: boolean
          consent_informed?: boolean
          consent_minors?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      civil_statuses: {
        Row: {
          id: string
          psychologist_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          psychologist_id: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          psychologist_id?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
      }
      insurers: {
        Row: {
          id: string
          name: string
          psychologist_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          psychologist_id?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          psychologist_id?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          insurer_id: string | null
          name: string
          psychologist_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          insurer_id?: string | null
          name: string
          psychologist_id?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          insurer_id?: string | null
          name?: string
          psychologist_id?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          psychologist_id: string
          patient_id: string
          date: string
          start_time: string
          end_time: string | null
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          type: 'presencial' | 'online'
          session_number: number | null
          notes: string | null
          fee: number | null
          payment_status: 'pending' | 'paid' | 'waived' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          psychologist_id: string
          patient_id: string
          date: string
          start_time: string
          end_time?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          type?: 'presencial' | 'online'
          session_number?: number | null
          notes?: string | null
          fee?: number | null
          payment_status?: 'pending' | 'paid' | 'waived' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          psychologist_id?: string
          patient_id?: string
          date?: string
          start_time?: string
          end_time?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          type?: 'presencial' | 'online'
          session_number?: number | null
          notes?: string | null
          fee?: number | null
          payment_status?: 'pending' | 'paid' | 'waived' | null
          created_at?: string
          updated_at?: string
        }
      }
      // ─── Forms ────────────────────────────────────────────────
      form_templates: {
        Row: {
          id: string
          psychologist_id: string | null
          title: string
          description: string | null
          send_message: string | null
          is_system: boolean
          is_archived: boolean
          cloned_from_id: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          psychologist_id?: string | null
          title: string
          description?: string | null
          send_message?: string | null
          is_system?: boolean
          is_archived?: boolean
          cloned_from_id?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          psychologist_id?: string | null
          title?: string
          description?: string | null
          send_message?: string | null
          is_system?: boolean
          is_archived?: boolean
          cloned_from_id?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      form_sections: {
        Row: {
          id: string
          template_id: string
          title: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          title: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          title?: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      form_questions: {
        Row: {
          id: string
          template_id: string
          section_id: string | null
          type: string
          title: string
          description: string | null
          help_text: string | null
          is_required: boolean
          sort_order: number
          scale_min: number
          scale_max: number
          scale_step: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          section_id?: string | null
          type: string
          title: string
          description?: string | null
          help_text?: string | null
          is_required?: boolean
          sort_order?: number
          scale_min?: number
          scale_max?: number
          scale_step?: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          section_id?: string | null
          type?: string
          title?: string
          description?: string | null
          help_text?: string | null
          is_required?: boolean
          sort_order?: number
          scale_min?: number
          scale_max?: number
          scale_step?: number
          created_at?: string
        }
      }
      form_question_options: {
        Row: {
          id: string
          question_id: string
          label: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          label: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          label?: string
          sort_order?: number
          created_at?: string
        }
      }
      form_submissions: {
        Row: {
          id: string
          psychologist_id: string
          patient_id: string
          template_id: string | null
          token: string
          access_password: string
          expires_at: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'expired'
          custom_message: string | null
          first_opened_at: string | null
          last_opened_at: string | null
          completed_at: string | null
          snapshot: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          psychologist_id: string
          patient_id: string
          template_id?: string | null
          token?: string
          access_password: string
          expires_at?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'expired'
          custom_message?: string | null
          first_opened_at?: string | null
          last_opened_at?: string | null
          completed_at?: string | null
          snapshot: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          psychologist_id?: string
          patient_id?: string
          template_id?: string | null
          token?: string
          access_password?: string
          expires_at?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'expired'
          custom_message?: string | null
          first_opened_at?: string | null
          last_opened_at?: string | null
          completed_at?: string | null
          snapshot?: Json
          created_at?: string
          updated_at?: string
        }
      }
      form_responses: {
        Row: {
          id: string
          submission_id: string
          question_id: string
          answer_text: string | null
          answer_options: Json | null
          answer_number: number | null
          answer_date: string | null
          answer_boolean: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          question_id: string
          answer_text?: string | null
          answer_options?: Json | null
          answer_number?: number | null
          answer_date?: string | null
          answer_boolean?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          question_id?: string
          answer_text?: string | null
          answer_options?: Json | null
          answer_number?: number | null
          answer_date?: string | null
          answer_boolean?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      form_audit_logs: {
        Row: {
          id: string
          submission_id: string
          event: string
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          event: string
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          event?: string
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      expire_form_submissions: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      patient_status: 'active' | 'inactive' | 'waiting'
      session_status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
      session_type: 'presencial' | 'online'
      payment_status: 'pending' | 'paid' | 'waived'
      question_type:
        | 'short_text'
        | 'long_text'
        | 'single_choice'
        | 'multi_choice'
        | 'dropdown'
        | 'date'
        | 'number'
        | 'scale'
        | 'boolean'
      submission_status: 'pending' | 'in_progress' | 'completed' | 'expired'
    }
  }
}

export interface AdditionalContact {
  relation: string
  name: string
  phone: string
  email: string
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
