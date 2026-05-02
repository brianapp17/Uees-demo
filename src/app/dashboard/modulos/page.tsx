'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { BookOpen, Plus, Settings } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Modulo = Database['public']['Tables']['modulos']['Row'];

export default function ModulosDocentePage() {
  const { profile } = useAuth();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ciclo, setCiclo] = useState('2026-1');

  useEffect(() => {
    if (profile?.rol === 'docente' || profile?.rol === 'admin') {
      fetchModulos();
    }
  }, [profile]);

  const fetchModulos = async () => {
    try {
      let query = supabase.from('modulos').select('*').order('fecha_creacion', { ascending: false });
      
      // If not admin, filter by my docente_id
      if (profile?.rol === 'docente') {
        const { data: docente } = await supabase.from('docentes').select('id').eq('profile_id', profile.id).single();
        if (docente) {
          query = query.eq('docente_id', docente.id);
        }
      }

      const { data } = await query;
      if (data) setModulos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    let docenteId = null;
    
    if (profile.rol === 'docente') {
      const { data: docente } = await supabase.from('docentes').select('id').eq('profile_id', profile.id).single();
      if (docente) docenteId = docente.id;
    }

    const { error } = await supabase
      .from('modulos')
      .insert({
        nombre,
        descripcion,
        ciclo,
        docente_id: docenteId
      });

    if (error) {
      alert('Error creando módulo: ' + error.message);
    } else {
      setShowModal(false);
      setNombre('');
      setDescripcion('');
      fetchModulos();
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Módulos</h1>
          <p className="text-gray-500 dark:text-gray-400">Administra tus módulos y clases.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[var(--color-uees-blue)] hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Módulo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulos.map(modulo => (
          <div key={modulo.id} className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex items-end">
              <h3 className="text-xl font-bold text-white">{modulo.nombre}</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
                {modulo.descripcion || 'Sin descripción'}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-neutral-700 rounded text-gray-600 dark:text-gray-300">
                  Ciclo: {modulo.ciclo}
                </span>
                <Link 
                  href={`/dashboard/modulos/${modulo.id}`}
                  className="text-[var(--color-uees-blue)] dark:text-[var(--color-uees-gold)] hover:underline flex items-center gap-1 text-sm font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Gestionar materias
                </Link>
              </div>
            </div>
          </div>
        ))}

        {modulos.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-neutral-800 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p>No has creado ningún módulo aún.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Módulo</h2>
            <form onSubmit={handleCrearModulo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input 
                  type="text" required
                  value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea 
                  value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent"
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ciclo</label>
                <input 
                  type="text" required
                  value={ciclo} onChange={e => setCiclo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[var(--color-uees-blue)] text-white rounded-lg hover:bg-blue-900">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
