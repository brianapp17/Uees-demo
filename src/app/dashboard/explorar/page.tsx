'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, Calendar, User, PlusCircle } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Modulo = Database['public']['Tables']['modulos']['Row'];
type Docente = Database['public']['Tables']['docentes']['Row'];

interface ModuloWithDocente extends Modulo {
  docente: {
    profile: {
      nombre: string;
      apellido: string;
    } | null;
  } | null;
}

export default function ExplorarModulosPage() {
  const { profile } = useAuth();
  const [modulos, setModulos] = useState<ModuloWithDocente[]>([]);
  const [inscritos, setInscritos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchModulos();
      fetchInscripciones();
    }
  }, [profile]);

  const fetchModulos = async () => {
    try {
      const { data, error } = await supabase
        .from('modulos')
        .select(`
          *,
          docente:docentes(
            profile:profiles(nombre, apellido)
          )
        `);
      
      if (data) {
        // Workaround for type mapping from complex select
        setModulos(data as unknown as ModuloWithDocente[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInscripciones = async () => {
    // get my inscripciones to disable buttons
    const { data } = await supabase
      .from('inscripciones')
      .select('modulo_id');
      
    if (data) {
      setInscritos(new Set(data.map(i => i.modulo_id as string)));
    }
  };

  const inscribirse = async (moduloId: string) => {
    // Get alumno_id based on profile_id
    const { data: alumno } = await supabase
      .from('alumnos')
      .select('id')
      .eq('profile_id', profile!.id)
      .single();

    if (!alumno) return alert('Error: No se encontró el registro de alumno');

    const { error } = await supabase
      .from('inscripciones')
      .insert({
        alumno_id: alumno.id,
        modulo_id: moduloId
      });

    if (error) {
      alert('Error al inscribirse: ' + error.message);
    } else {
      setInscritos(prev => new Set(prev).add(moduloId));
      alert('¡Inscripción exitosa!');
    }
  };

  if (loading) return <div>Cargando módulos...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explorar Módulos</h1>
        <p className="text-gray-500 dark:text-gray-400">Encuentra e inscríbete en nuevos módulos para este ciclo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulos.map((modulo) => {
          const isEnrolled = inscritos.has(modulo.id);
          const docenteName = modulo.docente?.profile 
            ? `${modulo.docente.profile.nombre} ${modulo.docente.profile.apellido}`
            : 'Docente no asignado';

          return (
            <div key={modulo.id} className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="h-32 bg-gradient-to-br from-[var(--color-uees-blue)] to-blue-800 p-6 flex items-end">
                <h3 className="text-xl font-bold text-white">{modulo.nombre}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
                  {modulo.descripcion || 'Sin descripción'}
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span>{docenteName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Ciclo {modulo.ciclo}</span>
                  </div>
                </div>
                <button
                  onClick={() => inscribirse(modulo.id)}
                  disabled={isEnrolled}
                  className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
                    isEnrolled 
                      ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 cursor-not-allowed'
                      : 'bg-[var(--color-uees-gold)] text-black hover:bg-yellow-500'
                  }`}
                >
                  {isEnrolled ? (
                    'Inscrito'
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Inscribirse
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {modulos.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No hay módulos disponibles en este momento.
          </div>
        )}
      </div>
    </div>
  );
}
