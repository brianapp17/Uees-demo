'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { BookOpen, Home, Users, LogOut, FileText, Settings, Shield } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const getLinks = () => {
    if (!profile) return [];
    
    if (profile.rol === 'admin') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Docentes', href: '/dashboard/docentes', icon: Users },
        { name: 'Módulos', href: '/dashboard/modulos', icon: BookOpen },
        { name: 'Alumnos', href: '/dashboard/alumnos', icon: Users },
      ];
    }
    
    if (profile.rol === 'docente') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Mis Módulos', href: '/dashboard/modulos', icon: BookOpen },
      ];
    }
    
    // Alumno
    return [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Mis Clases', href: '/dashboard/inscripciones', icon: FileText },
      { name: 'Explorar Módulos', href: '/dashboard/explorar', icon: BookOpen },
    ];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-[var(--color-uees-blue)] text-white flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[var(--color-uees-gold)] flex items-center gap-2">
          <img src="/LOGO.jpg" alt="UEES Logo" className="w-10 h-10 object-contain rounded-md" />
          UEES Virtual
        </h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white/10 text-[var(--color-uees-gold)] font-medium' 
                  : 'hover:bg-white/5 text-gray-300 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-[var(--color-uees-gold)] flex items-center justify-center text-black font-bold uppercase">
            {profile?.nombre?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{profile?.nombre} {profile?.apellido}</p>
            <p className="text-xs text-gray-400 capitalize">{profile?.rol}</p>
          </div>
        </div>
        <button 
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
