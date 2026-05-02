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
      alumnos: {
        Row: {
          ciclo_actual: string | null
          id: string
          profile_id: string | null
        }
        Insert: {
          ciclo_actual?: string | null
          id?: string
          profile_id?: string | null
        }
        Update: {
          ciclo_actual?: string | null
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clases: {
        Row: {
          contenido: string | null
          descripcion: string | null
          dia_semana: string | null
          enlace_clase: string | null
          fecha: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          modulo_id: string | null
          titulo: string
        }
        Insert: {
          contenido?: string | null
          descripcion?: string | null
          dia_semana?: string | null
          enlace_clase?: string | null
          fecha?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          modulo_id?: string | null
          titulo: string
        }
        Update: {
          contenido?: string | null
          descripcion?: string | null
          dia_semana?: string | null
          enlace_clase?: string | null
          fecha?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          modulo_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "clases_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      docentes: {
        Row: {
          aprobado: boolean | null
          especialidad: string | null
          id: string
          profile_id: string | null
        }
        Insert: {
          aprobado?: boolean | null
          especialidad?: string | null
          id?: string
          profile_id?: string | null
        }
        Update: {
          aprobado?: boolean | null
          especialidad?: string | null
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "docentes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones: {
        Row: {
          alumno_id: string | null
          fecha_inscripcion: string | null
          id: string
          modulo_id: string | null
        }
        Insert: {
          alumno_id?: string | null
          fecha_inscripcion?: string | null
          id?: string
          modulo_id?: string | null
        }
        Update: {
          alumno_id?: string | null
          fecha_inscripcion?: string | null
          id?: string
          modulo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          ciclo: string
          descripcion: string | null
          docente_id: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
        }
        Insert: {
          ciclo: string
          descripcion?: string | null
          docente_id?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          ciclo?: string
          descripcion?: string | null
          docente_id?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "modulos_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "docentes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          apellido: string | null
          email: string | null
          fecha_creacion: string | null
          id: string
          nombre: string | null
          rol: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          apellido?: string | null
          email?: string | null
          fecha_creacion?: string | null
          id: string
          nombre?: string | null
          rol?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          apellido?: string | null
          email?: string | null
          fecha_creacion?: string | null
          id?: string
          nombre?: string | null
          rol?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_modulos: {
        Args: never
        Returns: {
          ciclo: string
          descripcion: string | null
          docente_id: string | null
          fecha_creacion: string | null
          id: string
          nombre: string
        }[]
        SetofOptions: {
          from: "*"
          to: "modulos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_alumno: { Args: never; Returns: boolean }
      is_docente: { Args: never; Returns: boolean }
    }
    Enums: {
      user_role: "admin" | "docente" | "alumno"
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
      user_role: ["admin", "docente", "alumno"],
    },
  },
} as const
