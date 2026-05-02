'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { ArrowLeft, Clock, Calendar, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

type Modulo = Database['public']['Tables']['modulos']['Row'];
type Clase = Database['public']['Tables']['clases']['Row'];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function GestionMateriasPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const router = useRouter();
  
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [diaSemana, setDiaSemana] = useState('Lunes');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [enlace, setEnlace] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch modulo
      const { data: modData, error: modError } = await supabase
        .from('modulos')
        .select('*')
        .eq('id', id)
        .single();
        
      if (modError) throw modError;
      setModulo(modData);

      // Fetch clases
      const { data: clsData, error: clsError } = await supabase
        .from('clases')
        .select('*')
        .eq('modulo_id', id)
        .order('dia_semana', { ascending: true }) // Very basic ordering, could be improved with custom order
        .order('hora_inicio', { ascending: true });
        
      if (clsError) throw clsError;
      if (clsData) setClases(clsData);

    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Error cargando los datos del módulo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearClase = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    
    if (horaInicio >= horaFin) {
      setFormError('La hora de fin debe ser posterior a la hora de inicio.');
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('clases').insert({
        modulo_id: id as string,
        titulo,
        descripcion,
        dia_semana: diaSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        enlace_clase: enlace
      });

      if (error) {
        // Here we handle the custom trigger error
        setFormError(error.message);
      } else {
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.message || 'Error desconocido al crear la materia.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEliminarClase = async (claseId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta materia?')) return;
    
    const { error } = await supabase.from('clases').delete().eq('id', claseId);
    if (error) {
      alert('Error eliminando materia: ' + error.message);
    } else {
      fetchData();
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setDiaSemana('Lunes');
    setHoraInicio('');
    setHoraFin('');
    setEnlace('');
  };

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-4 bg-gray-200 rounded col-span-2"></div><div className="h-4 bg-gray-200 rounded col-span-1"></div></div><div className="h-4 bg-gray-200 rounded"></div></div></div></div>;
  if (!modulo) return <div>Módulo no encontrado.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/modulos" className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{modulo.nombre}</h1>
          <p className="text-gray-500 dark:text-gray-400">Ciclo {modulo.ciclo} • Gestión de materias/clases</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-lg font-bold">Materias Programadas</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[var(--color-uees-blue)] hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Programar Materia
          </button>
        </div>
        
        {clases.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p>No hay materias programadas en este módulo.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-neutral-700">
            {clases.map(clase => (
              <div key={clase.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {clase.titulo}
                  </h3>
                  {clase.descripcion && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{clase.descripcion}</p>}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      {clase.dia_semana}
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-neutral-700 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {clase.hora_inicio} - {clase.hora_fin}
                    </div>
                    {clase.enlace_clase && (
                      <a 
                        href={clase.enlace_clase} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[var(--color-uees-gold)] hover:underline"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Enlace de clase
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleEliminarClase(clase.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar materia"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Programar Nueva Materia</h2>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleCrearClase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la materia/tema</label>
                <input 
                  type="text" required
                  value={titulo} onChange={e => setTitulo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-[var(--color-uees-gold)] outline-none"
                  placeholder="Ej. Matemáticas I"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea 
                  value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-[var(--color-uees-gold)] outline-none"
                  rows={2}
                  placeholder="Descripción breve..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Día</label>
                  <select 
                    value={diaSemana} onChange={e => setDiaSemana(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-[var(--color-uees-gold)] outline-none"
                  >
                    {DIAS_SEMANA.map(dia => <option key={dia} value={dia}>{dia}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora Inicio</label>
                  <input 
                    type="time" required
                    value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-[var(--color-uees-gold)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora Fin</label>
                  <input 
                    type="time" required
                    value={horaFin} onChange={e => setHoraFin(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-[var(--color-uees-gold)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Enlace de la Clase (Zoom, Teams, Meet)</label>
                <input 
                  type="url" required
                  value={enlace} onChange={e => setEnlace(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-[var(--color-uees-gold)] outline-none"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-neutral-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[var(--color-uees-blue)] text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting ? 'Guardando...' : 'Guardar Materia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
