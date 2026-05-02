'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase/client';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export const Chatbot = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: '¡Hola! Soy tu asistente de la UEES. ¿En qué te puedo ayudar sobre tus registros o clases?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      loadContext();
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const loadContext = async () => {
    if (!profile) return;
    try {
      let contextText = `Usuario: ${profile.nombre} ${profile.apellido} (Rol: ${profile.rol})\n`;

      if (profile.rol === 'docente') {
        const { data: docente } = await supabase.from('docentes').select('id').eq('profile_id', profile.id).single();
        if (docente) {
          const { data: modulos } = await supabase.from('modulos').select('id, nombre, ciclo').eq('docente_id', docente.id);
          if (modulos && modulos.length > 0) {
            contextText += '--- TUS MÓDULOS ---\n';
            for (const mod of modulos) {
              const { count } = await supabase.from('inscripciones').select('*', { count: 'exact', head: true }).eq('modulo_id', mod.id);
              contextText += `- Módulo: "${mod.nombre}" (Ciclo ${mod.ciclo}). Tienes ${count || 0} alumnos inscritos en este módulo.\n`;
              
              const { data: clases } = await supabase.from('clases').select('*').eq('modulo_id', mod.id);
              if (clases && clases.length > 0) {
                contextText += `  Clases programadas en "${mod.nombre}":\n`;
                clases.forEach(c => {
                  contextText += `    * ${c.titulo}: ${c.dia_semana} de ${c.hora_inicio} a ${c.hora_fin}\n`;
                });
              } else {
                contextText += `  Sin clases programadas en este módulo.\n`;
              }
            }
          } else {
             contextText += 'Actualmente no has creado ningún módulo.\n';
          }
        }
      } else if (profile.rol === 'alumno') {
        const { data: alumno } = await supabase.from('alumnos').select('id').eq('profile_id', profile.id).single();
        if (alumno) {
          const { data: inscripciones } = await supabase.from('inscripciones')
            .select(`modulo:modulos(nombre, ciclo, docente:docentes(profile:profiles(nombre, apellido)), clases(titulo, dia_semana, hora_inicio, hora_fin))`)
            .eq('alumno_id', alumno.id);
          
          if (inscripciones && inscripciones.length > 0) {
            contextText += '--- TUS INSCRIPCIONES Y HORARIOS ---\n';
            inscripciones.forEach((i: any) => {
              const mod = i.modulo;
              if (mod) {
                const docenteNombre = mod.docente?.profile ? `${mod.docente.profile.nombre} ${mod.docente.profile.apellido}` : 'Sin docente asignado';
                contextText += `- Estás inscrito en el Módulo: "${mod.nombre}" (Ciclo ${mod.ciclo}), impartido por ${docenteNombre}.\n`;
                if (mod.clases && mod.clases.length > 0) {
                  contextText += `  Tus clases para este módulo son:\n`;
                  mod.clases.forEach((c: any) => {
                    contextText += `    * ${c.titulo} los días ${c.dia_semana} de ${c.hora_inicio} a ${c.hora_fin}.\n`;
                  });
                } else {
                  contextText += `  Aún no hay horarios programados para este módulo.\n`;
                }
              }
            });
          } else {
            contextText += 'Actualmente no estás inscrito en ningún módulo.\n';
          }
        }
      }
      setContext(contextText);
    } catch (e) {
      console.error("Error al cargar contexto del chatbot:", e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: context
        })
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, tuve un problema procesando tu mensaje.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: 'Ocurrió un error de red.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 w-80 sm:w-96 flex flex-col h-[500px] overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--color-uees-blue)] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-[var(--color-uees-gold)]" />
              <h3 className="font-bold">Asistente UEES</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-neutral-900/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-uees-blue)]/10 text-[var(--color-uees-blue)] dark:text-[var(--color-uees-gold)] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-[var(--color-uees-blue)] text-white rounded-tr-none' 
                    : 'bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-neutral-700 shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-[var(--color-uees-blue)]/10 text-[var(--color-uees-blue)] dark:text-[var(--color-uees-gold)] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-neutral-800 text-gray-500 rounded-tl-none border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta algo..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-neutral-700 border-transparent focus:bg-white dark:focus:bg-neutral-600 focus:ring-2 focus:ring-[var(--color-uees-gold)] rounded-full outline-none text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-[var(--color-uees-blue)] text-[var(--color-uees-gold)] flex items-center justify-center hover:bg-blue-900 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[var(--color-uees-blue)] hover:bg-blue-900 text-[var(--color-uees-gold)] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
