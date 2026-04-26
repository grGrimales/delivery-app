'use client';

import Link from 'next/link';
import { useConfig } from '@/hooks/useConfig';

export default function Home() {
  const { language, setLanguage, t } = useConfig();

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ] as const;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        {/* Language Selector Chips */}
        <div className="flex bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-2xl mb-12 shadow-sm border border-gray-200/50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                language === lang.code
                  ? 'bg-white text-blue-600 shadow-md scale-105'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span>{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
            {t.home.welcome}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t.home.subtitle}
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Admin Card */}
          <Link href="/admin" className="group relative">
            <div className="h-full p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 group-active:scale-[0.98]">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                📊
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{t.admin.title}</h2>
              <p className="text-gray-500 leading-relaxed">{t.admin.desc}</p>
              <div className="mt-8 flex items-center text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                {language === 'pt' ? 'Entrar no painel' : language === 'es' ? 'Entrar al panel' : 'Enter dashboard'} 
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          {/* Driver Card */}
          <Link href="/driver" className="group relative">
            <div className="h-full p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-100/50 hover:-translate-y-2 group-active:scale-[0.98]">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                🛵
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">{t.driver.title}</h2>
              <p className="text-gray-500 leading-relaxed">{t.driver.desc}</p>
              <div className="mt-8 flex items-center text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                {language === 'pt' ? 'Iniciar entregas' : language === 'es' ? 'Iniciar entregas' : 'Start deliveries'} 
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          {/* Tracking Card */}
          <Link href="/track/demo-123" className="group relative">
            <div className="h-full p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-amber-100/50 hover:-translate-y-2 group-active:scale-[0.98]">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-500">
                📍
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-amber-600 transition-colors">{t.track.title}</h2>
              <p className="text-gray-500 leading-relaxed">{t.track.desc}</p>
              <div className="mt-8 flex items-center text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                {language === 'pt' ? 'Rastrear pedido' : language === 'es' ? 'Rastrear pedido' : 'Track order'} 
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer info */}
        <footer className="mt-24 text-gray-400 text-sm font-medium">
          © 2026 Delivery App • Real-time Logistics Solutions
        </footer>
      </main>
    </div>
  );
}
