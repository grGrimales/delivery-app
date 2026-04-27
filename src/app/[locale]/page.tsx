'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from 'next-intl';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/${locale}/login`);
      } else {
        if (user.role === 'admin') router.push(`/${locale}/admin`);
        else if (user.role === 'driver') router.push(`/${locale}/driver`);
        else router.push(`/${locale}/login`);
      }
    }
  }, [user, isLoading, router, locale]);

  // Mientras carga mostramos pantalla vacía con el logo
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center animate-pulse">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <p className="text-white opacity-30 text-sm">DeliveryDash</p>
      </div>
    </div>
  );
}