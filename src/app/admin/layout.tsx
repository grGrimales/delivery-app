'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Globe, Loader2 } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';
import { useAuth } from '@/hooks/useAuth'; // Importar el hook
import { Language } from '@/lib/i18n';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { t, language, setLanguage } = useConfig();
    const { isLoading, token, logout } = useAuth(); // Extraemos isLoading y token
    const router = useRouter();
    const adminT = t.admin;

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [isLoading, token, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                        Autenticando...
                    </p>
                </div>
            </div>
        );
    }

    if (!token) return null;

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">

            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl shadow-slate-900/20 z-20">
                <div className="p-6 border-b border-slate-800">
                    <div className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-orange-500/20">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-black text-white tracking-tight">{adminT.title}</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin" className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 text-orange-500 rounded-2xl font-bold transition-colors border border-orange-500/20">
                        <LayoutDashboard size={18} />
                        {adminT.title}
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-800 flex justify-center gap-2">
                    {(['es', 'pt', 'en'] as Language[]).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLanguage(l)}
                            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all duration-300 ${language === l
                                ? 'bg-orange-500 text-white'
                                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                }`}
                        >
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-2xl font-bold transition-colors text-sm">
                        <LogOut size={18} />
                        {language === 'es' ? 'Cerrar Sesión' : language === 'pt' ? 'Sair' : 'Logout'}
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto relative">
                <div className="p-8 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

        </div>
    );
}