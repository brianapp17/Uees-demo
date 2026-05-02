'use client';

import { useAuth } from './AuthProvider';
import { Sidebar } from './Sidebar';
import { Chatbot } from './Chatbot';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
        <div className="w-10 h-10 border-4 border-[var(--color-uees-blue)] border-t-[var(--color-uees-gold)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Return children directly if not authenticated (e.g. for login/register pages)
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Chatbot />
    </div>
  );
};
