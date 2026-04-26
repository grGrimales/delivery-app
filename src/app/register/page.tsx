'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, ArrowRight, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';
import { useAuth } from '@/hooks/useAuth';
import { Language } from '@/lib/i18n';
import Link from 'next/link';

export default function RegisterPage() {
  const { t, language, setLanguage } = useConfig();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'driver'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const authT = t.auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12 selection:bg-orange-100 font-sans relative overflow-hidden">

      <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-orange-50 rounded-full blur-[100px] opacity-70" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-slate-200 rounded-full blur-[100px] opacity-50" />

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

        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-100 rotate-3 hover:rotate-0 transition-all duration-500 group">
            <UserPlus className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {authT.register_title}
          </h2>
          <p className="text-sm font-medium text-slate-400 italic">
            {language === 'es' ? 'Crea tu cuenta de profesional' : language === 'pt' ? 'Crie sua conta profissional' : 'Create your professional account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[13px] font-bold border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="h-7 w-7 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-red-100">
              <AlertCircle size={14} />
            </div>
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                {authT.name}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl bg-white text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  className="block w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl bg-white text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

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
                  className="block w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl bg-white text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all sm:text-sm"
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
                <span className="tracking-wide uppercase text-[12px]">{authT.submit_register}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 text-center">
          <p className="text-xs font-medium text-slate-400 mb-4">
            {authT.have_account}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-all border border-slate-100"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            {language === 'pt' ? 'Voltar ao Login' : language === 'es' ? 'Volver al Login' : 'Back to Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}