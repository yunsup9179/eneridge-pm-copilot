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
      projects: {
        Row: {
          id: string
          name: string
          location: string | null
          customer: string | null
          city: string | null
          utility: string | null
          program: string | null
          charger_type: string | null
          port_count: number | null
          phase: string | null
          status: string | null
          project_stage: string | null
          priority: string | null
          target_construction_start: string | null
          target_cod: string | null
          internal_owner: string | null
          summary: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          customer?: string | null
          city?: string | null
          utility?: string | null
          program?: string | null
          charger_type?: string | null
          port_count?: number | null
          phase?: string | null
          status?: string | null
          project_stage?: string | null
          priority?: string | null
          target_construction_start?: string | null
          target_cod?: string | null
          internal_owner?: string | null
          summary?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          customer?: string | null
          city?: string | null
          utility?: string | null
          program?: string | null
          charger_type?: string | null
          port_count?: number | null
          phase?: string | null
          status?: string | null
          project_stage?: string | null
          priority?: string | null
          target_construction_start?: string | null
          target_cod?: string | null
          internal_owner?: string | null
          summary?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      project_charger_groups: {
        Row: {
          id: string
          project_id: string | null
          charger_model: string | null
          charger_category: string | null
          power_rating_kw: number | null
          charger_count: number | null
          port_count: number | null
          port_configuration: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          charger_model?: string | null
          charger_category?: string | null
          power_rating_kw?: number | null
          charger_count?: number | null
          port_count?: number | null
          port_configuration?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          charger_model?: string | null
          charger_category?: string | null
          power_rating_kw?: number | null
          charger_count?: number | null
          port_count?: number | null
          port_configuration?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_charger_groups_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_charger_connectors: {
        Row: {
          id: string
          charger_group_id: string | null
          connector_type: string | null
          connector_count_per_charger: number | null
          total_connector_count: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          charger_group_id?: string | null
          connector_type?: string | null
          connector_count_per_charger?: number | null
          total_connector_count?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          charger_group_id?: string | null
          connector_type?: string | null
          connector_count_per_charger?: number | null
          total_connector_count?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_charger_connectors_charger_group_id_fkey"
            columns: ["charger_group_id"]
            referencedRelation: "project_charger_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      action_items: {
        Row: {
          id: string
          project_id: string | null
          title: string
          description: string | null
          assigned_to: string | null
          external_party: string | null
          due_date: string | null
          follow_up_date: string | null
          priority: string | null
          status: string | null
          source_type: string | null
          source_reference: string | null
          notes: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          title: string
          description?: string | null
          assigned_to?: string | null
          external_party?: string | null
          due_date?: string | null
          follow_up_date?: string | null
          priority?: string | null
          status?: string | null
          source_type?: string | null
          source_reference?: string | null
          notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          assigned_to?: string | null
          external_party?: string | null
          due_date?: string | null
          follow_up_date?: string | null
          priority?: string | null
          status?: string | null
          source_type?: string | null
          source_reference?: string | null
          notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          id: string
          project_id: string | null
          category: string | null
          description: string
          impact: string | null
          likelihood: string | null
          severity: string | null
          mitigation_plan: string | null
          owner: string | null
          status: string | null
          related_document_id: string | null
          ai_detected: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          category?: string | null
          description: string
          impact?: string | null
          likelihood?: string | null
          severity?: string | null
          mitigation_plan?: string | null
          owner?: string | null
          status?: string | null
          related_document_id?: string | null
          ai_detected?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          category?: string | null
          description?: string
          impact?: string | null
          likelihood?: string | null
          severity?: string | null
          mitigation_plan?: string | null
          owner?: string | null
          status?: string | null
          related_document_id?: string | null
          ai_detected?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_related_document_id_fkey"
            columns: ["related_document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          id: string
          name: string
          company: string | null
          role: string | null
          email: string | null
          phone: string | null
          notes: string | null
          communication_style: string | null
          last_contacted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          role?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          communication_style?: string | null
          last_contacted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          role?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          communication_style?: string | null
          last_contacted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          project_id: string | null
          file_name: string
          file_type: string | null
          document_type: string | null
          version: string | null
          storage_path: string | null
          storage_url: string | null
          status: string | null
          ai_summary: string | null
          key_terms: Json | null
          action_items_extracted: Json | null
          risks_extracted: Json | null
          uploaded_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          file_name: string
          file_type?: string | null
          document_type?: string | null
          version?: string | null
          storage_path?: string | null
          storage_url?: string | null
          status?: string | null
          ai_summary?: string | null
          key_terms?: Json | null
          action_items_extracted?: Json | null
          risks_extracted?: Json | null
          uploaded_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          file_name?: string
          file_type?: string | null
          document_type?: string | null
          version?: string | null
          storage_path?: string | null
          storage_url?: string | null
          status?: string | null
          ai_summary?: string | null
          key_terms?: Json | null
          action_items_extracted?: Json | null
          risks_extracted?: Json | null
          uploaded_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analysis_logs: {
        Row: {
          id: string
          project_id: string | null
          document_id: string | null
          agent_type: string | null
          input_type: string | null
          input_content: string | null
          output: Json | null
          confidence: number | null
          user_approved: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          document_id?: string | null
          agent_type?: string | null
          input_type?: string | null
          input_content?: string | null
          output?: Json | null
          confidence?: number | null
          user_approved?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          document_id?: string | null
          agent_type?: string | null
          input_type?: string | null
          input_content?: string | null
          output?: Json | null
          confidence?: number | null
          user_approved?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_logs_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analysis_logs_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contacts: {
        Row: {
          project_id: string
          contact_id: string
          relationship_type: string | null
        }
        Insert: {
          project_id: string
          contact_id: string
          relationship_type?: string | null
        }
        Update: {
          project_id?: string
          contact_id?: string
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_contacts_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contacts_contact_id_fkey"
            columns: ["contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      project_financials: {
        Row: {
          id: string
          project_id: string | null
          estimated_total_cost: number | null
          actual_total_cost: number | null
          equipment_cost: number | null
          installation_cost: number | null
          utility_cost: number | null
          soft_cost: number | null
          rebate_applicable: boolean | null
          rebate_program: string | null
          rebate_amount: number | null
          grant_amount: number | null
          match_share_amount: number | null
          customer_contribution: number | null
          eneridge_out_of_pocket: number | null
          reimbursement_status: string | null
          reimbursement_received: number | null
          retention_amount: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id?: string | null
          estimated_total_cost?: number | null
          actual_total_cost?: number | null
          equipment_cost?: number | null
          installation_cost?: number | null
          utility_cost?: number | null
          soft_cost?: number | null
          rebate_applicable?: boolean | null
          rebate_program?: string | null
          rebate_amount?: number | null
          grant_amount?: number | null
          match_share_amount?: number | null
          customer_contribution?: number | null
          eneridge_out_of_pocket?: number | null
          reimbursement_status?: string | null
          reimbursement_received?: number | null
          retention_amount?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string | null
          estimated_total_cost?: number | null
          actual_total_cost?: number | null
          equipment_cost?: number | null
          installation_cost?: number | null
          utility_cost?: number | null
          soft_cost?: number | null
          rebate_applicable?: boolean | null
          rebate_program?: string | null
          rebate_amount?: number | null
          grant_amount?: number | null
          match_share_amount?: number | null
          customer_contribution?: number | null
          eneridge_out_of_pocket?: number | null
          reimbursement_status?: string | null
          reimbursement_received?: number | null
          retention_amount?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_financials_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      set_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
