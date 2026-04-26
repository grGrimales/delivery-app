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
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 transition-colors duration-500 selection:bg-orange-100 font-sans">

      {/* Selector de Idioma Minimalista */}
      <div className="absolute top-6 right-6 flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center px-2 border-r border-slate-100 mr-1">
          <Globe className="h-3.5 w-3.5 text-slate-400" />
        </div>
        {(['es', 'pt', 'en'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all duration-300 ${language === l ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] border border-slate-100 animate-in fade-in zoom-in duration-700">

        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-slate-200 rotate-6 hover:rotate-0 transition-all duration-500 group">
            <LogIn className="h-10 w-10 text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            {authT.login_title}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-100"></span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
              {authT.login_subtitle}
            </p>
            <span className="h-px w-8 bg-slate-100"></span>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="h-8 w-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {authT.email}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-12 pr-5 py-4.5 border border-slate-100 rounded-[1.5rem] bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all sm:text-sm shadow-sm"
                  placeholder="admin@delivery.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {authT.password}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-12 pr-5 py-4.5 border border-slate-100 rounded-[1.5rem] bg-slate-50/50 text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all sm:text-sm shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 text-sm font-bold rounded-2xl text-white bg-slate-900 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="tracking-wide">{authT.submit_login}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="pt-8 text-center border-t border-slate-50">
          <p className="text-sm font-medium text-slate-400 mb-3">
            {language === 'es' ? '¿Nuevo en la plataforma?' : language === 'pt' ? 'Novo na plataforma?' : 'New here?'}
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-all group"
          >
            {authT.no_account}
            <div className="h-7 w-7 rounded-full bg-orange-50 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <span className="text-lg leading-none">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
