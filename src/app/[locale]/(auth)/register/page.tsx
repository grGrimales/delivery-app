'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Role = 'admin' | 'driver' | 'customer';

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'admin', label: 'Admin', desc: 'Gestión de pedidos y repartidores' },
  { value: 'driver', label: 'Repartidor', desc: 'Realizar entregas' },
  { value: 'customer', label: 'Cliente', desc: 'Hacer y seguir pedidos' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' as Role });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900">

      {/* Acentos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500 opacity-10 rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-500 opacity-5 rounded-full" />
      </div>

      <div className="relative w-full max-w-sm mx-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">DeliveryDash</h1>
          <p className="text-surface-100 opacity-50 text-sm mt-1">Crear cuenta</p>
        </div>

        {/* Card */}
        <div className="bg-surface-800 rounded-2xl p-8 border border-white border-opacity-5">
          <h2 className="text-white font-medium text-lg mb-6">Registrarse</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-surface-100 opacity-60 font-medium uppercase tracking-wide">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={form.name}
                onChange={set('name')}
                required
                className="bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-3 text-sm text-white placeholder-white placeholder-opacity-20 outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-surface-100 opacity-60 font-medium uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={set('email')}
                required
                className="bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-3 text-sm text-white placeholder-white placeholder-opacity-20 outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-surface-100 opacity-60 font-medium uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                className="bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-3 text-sm text-white placeholder-white placeholder-opacity-20 outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Selector de rol */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-surface-100 opacity-60 font-medium uppercase tracking-wide">
                Rol
              </label>
              <div className="flex flex-col gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${form.role === r.value
                        ? 'border-brand-500 bg-brand-500 bg-opacity-10'
                        : 'border-white border-opacity-10 hover:border-opacity-20'
                      }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${form.role === r.value ? 'text-brand-400' : 'text-white opacity-80'}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-white opacity-30 mt-0.5">{r.desc}</p>
                    </div>
                    {form.role === r.value && (
                      <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
            </button>

          </form>
        </div>

        {/* Link a login */}
        <p className="text-center text-sm text-white opacity-30 mt-4">
          ¿Ya tenés cuenta?{' '}
          <a href="/login" className="text-brand-400 opacity-100 hover:text-brand-500 transition-colors">
            Ingresar
          </a>
        </p>

      </div>
    </div>
  );
}