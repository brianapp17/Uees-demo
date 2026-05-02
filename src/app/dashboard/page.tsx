'use client';

import { useAuth } from '@/components/AuthProvider';
import { BookOpen, Users, GraduationCap, Award } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bienvenido, {profile.nombre}
        </h1>
        <div className="px-4 py-1.5 rounded-full bg-[var(--color-uees-blue)] text-white text-sm font-medium capitalize">
          {profile.rol}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Render stats based on role */}
        {profile.rol === 'admin' && (
          <>
            <StatCard title="Total Alumnos" value="120" icon={Users} color="bg-blue-500" />
            <StatCard title="Docentes Activos" value="15" icon={GraduationCap} color="bg-[var(--color-uees-gold)]" />
            <StatCard title="Módulos" value="34" icon={BookOpen} color="bg-emerald-500" />
          </>
        )}
        
        {profile.rol === 'docente' && (
          <>
            <StatCard title="Mis Módulos" value="4" icon={BookOpen} color="bg-[var(--color-uees-blue)]" />
            <StatCard title="Alumnos Inscritos" value="89" icon={Users} color="bg-[var(--color-uees-gold)]" />
            <StatCard title="Clases Impartidas" value="12" icon={Award} color="bg-indigo-500" />
          </>
        )}
        
        {profile.rol === 'alumno' && (
          <>
            <StatCard title="Módulos Inscritos" value="3" icon={BookOpen} color="bg-[var(--color-uees-blue)]" />
            <StatCard title="Clases Pendientes" value="5" icon={Award} color="bg-[var(--color-uees-gold)]" />
          </>
        )}
      </div>

      {profile.rol === 'alumno' && (
        <div className="mt-8">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
            <h2 className="text-lg font-semibold mb-4">¿Qué quieres hacer hoy?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/inscripciones" className="flex items-center p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-[var(--color-uees-gold)] hover:bg-yellow-50 dark:hover:bg-neutral-700 transition-all">
                <div className="bg-[var(--color-uees-blue)] p-3 rounded-lg text-white mr-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Ir a mis clases</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Continúa aprendiendo donde te quedaste</p>
                </div>
              </Link>
              <Link href="/dashboard/explorar" className="flex items-center p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:border-[var(--color-uees-gold)] hover:bg-yellow-50 dark:hover:bg-neutral-700 transition-all">
                <div className="bg-[var(--color-uees-gold)] p-3 rounded-lg text-white mr-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Explorar módulos</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inscríbete en nuevos cursos este ciclo</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700 flex items-center">
      <div className={`${color} p-4 rounded-lg text-white mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
