'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('alumno');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido,
          rol
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      if (data.session) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 2000);
      } else {
        setNeedsEmailConfirm(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-800 p-10 rounded-2xl shadow-xl">
        <div className="text-center flex flex-col items-center">
          <div className="mb-4">
            <img src="/LOGO.jpg" alt="UEES Logo" className="w-24 h-24 object-contain rounded-xl shadow-sm" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Regístrate para acceder a tus clases
          </p>
        </div>
        
        {needsEmailConfirm ? (
          <div className="bg-blue-50 text-blue-700 p-6 rounded-lg text-center font-medium border border-blue-200">
            <h3 className="text-lg font-bold mb-2">¡Casi listo!</h3>
            <p className="text-sm font-normal mb-4">
              Hemos enviado un correo de confirmación a <strong>{email}</strong>. 
              Por favor revisa tu bandeja de entrada y confirma tu correo electrónico para poder acceder.
            </p>
            <Link href="/login" className="inline-block mt-2 bg-[var(--color-uees-blue)] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition-colors">
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : success ? (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg text-center font-medium">
            ¡Registro exitoso! Redirigiendo...
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="sr-only">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-uees-gold)] focus:border-[var(--color-uees-gold)] sm:text-sm"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label htmlFor="apellido" className="sr-only">Apellido</label>
                  <input
                    id="apellido"
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-uees-gold)] focus:border-[var(--color-uees-gold)] sm:text-sm"
                    placeholder="Apellido"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-uees-gold)] focus:border-[var(--color-uees-gold)] sm:text-sm"
                  placeholder="Correo electrónico"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-uees-gold)] focus:border-[var(--color-uees-gold)] sm:text-sm"
                  placeholder="Contraseña"
                />
              </div>
              <div>
                <label htmlFor="rol" className="sr-only">Tipo de cuenta</label>
                <select
                  id="rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-uees-gold)] focus:border-[var(--color-uees-gold)] sm:text-sm"
                >
                  <option value="alumno">Soy Alumno</option>
                  <option value="docente">Soy Docente</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[var(--color-uees-blue)] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-uees-blue)] transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </button>
            </div>
            
            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">¿Ya tienes cuenta? </span>
              <Link href="/login" className="font-medium text-[var(--color-uees-gold)] hover:text-yellow-600 transition-colors">
                Inicia sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
