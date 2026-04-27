'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function LoginPage() {
  const t = useTranslations('auth');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500 opacity-10 rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-500 opacity-5 rounded-full" />
      </div>

      <div className="relative w-full max-w-sm mx-4">

        {/* Selector de idioma */}
        <LocaleSwitcher />

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">DeliveryDash</h1>
          <p className="text-white opacity-40 text-sm mt-1">{t('login_subtitle')}</p>
        </div>

        <div className="bg-surface-800 rounded-2xl p-8 border border-white border-opacity-5">
          <h2 className="text-white font-medium text-lg mb-6">{t('login_title')}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white opacity-40 font-medium uppercase tracking-wide">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white opacity-40 font-medium uppercase tracking-wide">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-surface-900 border border-white border-opacity-10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors"
            >
              {loading ? '...' : `${t('submit_login')} →`}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white opacity-30 mt-4">
          {t('no_account')}{' '}
          <a href="register" className="text-brand-400 opacity-100 hover:text-brand-500 transition-colors">
            {t('register_link')}
          </a>
        </p>

      </div>
    </div>
  );
}