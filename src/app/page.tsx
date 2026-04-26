'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';

export default function Home() {
  const { user, isLoading } = useAuth();
  const { setLanguage, language, t } = useConfig();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else {
        if (user.role === 'ADMIN') router.push('/admin');
        else if (user.role === 'DRIVER') router.push('/driver');
      }
    }
  }, [user, isLoading, router]);

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ] as const;

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-pulse space-y-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto"></div>
        <div className="h-4 w-32 bg-gray-100 rounded mx-auto"></div>
      </div>

      {/* Selector de idioma persistente por si acaso */}
      <div className="absolute bottom-10 flex bg-gray-100 p-1.5 rounded-2xl shadow-sm border">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${language === lang.code ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'
              }`}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
