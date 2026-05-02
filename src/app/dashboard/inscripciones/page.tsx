'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, Calendar, Clock, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Modulo = Database['public']['Tables']['modulos']['Row'];
type Clase = Database['public']['Tables']['clases']['Row'];

interface EnrolledModulo extends Modulo {
  docente: {
    profile: {
      nombre: string;
      apellido: string;
    } | null;
  } | null;
  clases?: Clase[];
}

export default function MisInscripcionesPage() {
  const { profile } = useAuth();
  const [modulos, setModulos] = useState<EnrolledModulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModulo, setExpandedModulo] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.rol === 'alumno') {
      fetchMisModulos();
    }
  }, [profile]);

  const fetchMisModulos = async () => {
    try {
      const { data: alumno } = await supabase.from('alumnos').select('id').eq('profile_id', profile!.id).single();
      if (!alumno) return;

      const { data: inscripciones } = await supabase
        .from('inscripciones')
        .select(`
          modulo:modulos(
            *,
            docente:docentes(
              profile:profiles(nombre, apellido)
            ),
            clases(*)
          )
        `)
        .eq('alumno_id', alumno.id);

      if (inscripciones) {
        // Extract modulos
        const mods = inscripciones.map(i => {
          const mod = i.modulo as unknown as EnrolledModulo;
          return mod;
        }).filter(Boolean);
        setModulos(mods);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4 p-4"><div className="h-8 bg-gray-200 rounded w-1/4"></div><div className="h-32 bg-gray-200 rounded"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Clases</h1>
        <p className="text-gray-500 dark:text-gray-400">Módulos en los que estás inscrito actualmente.</p>
      </div>

      <div className="space-y-4">
        {modulos.map(modulo => {
          const docenteName = modulo.docente?.profile 
            ? `${modulo.docente.profile.nombre} ${modulo.docente.profile.apellido}`
            : 'Sin docente';
            
          const isExpanded = expandedModulo === modulo.id;

          return (
            <div key={modulo.id} className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm transition-all">
              <div 
                className="p-6 cursor-pointer flex justify-between items-center hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                onClick={() => setExpandedModulo(isExpanded ? null : modulo.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--color-uees-blue)]/10 text-[var(--color-uees-blue)] dark:text-[var(--color-uees-gold)] rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{modulo.nombre}</h3>
                    <p className="text-sm text-gray-500">{docenteName} • Ciclo {modulo.ciclo}</p>
                  </div>
                </div>
                <div>
                  {isExpanded ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/50 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Materias y Horarios Programados</h4>
                  
                  {(!modulo.clases || modulo.clases.length === 0) ? (
                    <p className="text-sm text-gray-500">El docente aún no ha programado materias para este módulo.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {modulo.clases.map(clase => (
                        <div key={clase.id} className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-gray-200 dark:border-neutral-700">
                          <h5 className="font-bold text-gray-900 dark:text-white mb-1">{clase.titulo}</h5>
                          {clase.descripcion && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{clase.descripcion}</p>}
                          
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Calendar className="w-4 h-4 text-[var(--color-uees-blue)] dark:text-[var(--color-uees-gold)]" />
                              <span>{clase.dia_semana}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Clock className="w-4 h-4 text-[var(--color-uees-blue)] dark:text-[var(--color-uees-gold)]" />
                              <span>{clase.hora_inicio} - {clase.hora_fin}</span>
                            </div>
                            
                            {clase.enlace_clase && (
                              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-neutral-700">
                                <a 
                                  href={clase.enlace_clase} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-uees-blue)] dark:text-[var(--color-uees-gold)] hover:underline"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  Unirse a la clase
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {modulos.length === 0 && (
          <div className="py-12 text-center text-gray-500 bg-white dark:bg-neutral-800 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p>Aún no te has inscrito en ningún módulo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
