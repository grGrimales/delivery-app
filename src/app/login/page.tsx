'use client';

import React, { useState } from 'react';
import { LogIn, Mail, Lock, Globe, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';
import { useAuth } from '@/hooks/useAuth';
import { Language } from '@/lib/i18n';
import Link from 'next/link';

export default function LoginPage() {
  const { t, language, setLanguage } = useConfig();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const authT = t.auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 selection:bg-orange-100 font-sans relative overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200 rounded-full blur-[120px] opacity-40" />

      <div className="absolute top-8 right-8 flex items-center gap-1 bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-white/50 z-10">
        <div className="px-2 border-r border-slate-200/50 mr-1">
          <Globe className="h-3.5 w-3.5 text-slate-400" />
        </div>
        {(['es', 'pt', 'en'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all duration-300 ${language === l
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:bg-white'
              }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white relative z-10 animate-in fade-in zoom-in duration-700">

        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 -rotate-2 hover:rotate-0 transition-all duration-500 group cursor-pointer">
            <LogIn className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {authT.login_title}
          </h2>
          <p className="text-sm font-medium text-slate-400">
            {language === 'es' ? 'Gestiona tus entregas en tiempo real' : language === 'pt' ? 'Gerencie suas entregas em tempo real' : 'Manage your deliveries in real-time'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="h-7 w-7 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-red-100">
              <AlertCircle size={14} />
            </div>
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                {authT.email}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-100 rounded-2xl bg-white text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all sm:text-sm"
                  placeholder="admin@delivery.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                {authT.password}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-11 pr-4 py-3.5 border border-slate-100 rounded-2xl bg-white text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-3 py-4 text-sm font-black rounded-2xl text-white bg-slate-900 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-[0.97] disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span className="tracking-wide uppercase text-[12px]">{authT.submit_login}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-600 transition-all group"
          >
            {authT.no_account}
            <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-all">
              <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}