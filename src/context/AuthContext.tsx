'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { connectSockets, disconnectSockets } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'driver' | 'customer';
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Al montar, restaurar sesión desde localStorage y escuchar cambios entre pestañas
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                if (!e.newValue) {
                    // Logout detectado en otra pestaña
                    setToken(null);
                    setUser(null);
                    disconnectSockets();
                    if (!window.location.pathname.includes('/track/')) {
                        router.push('/login');
                    }
                } else {
                    // Login detectado en otra pestaña (opcional: podrías recargar para sincronizar)
                    setToken(e.newValue);
                    const newUser = localStorage.getItem('user');
                    if (newUser) setUser(JSON.parse(newUser));
                    connectSockets();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [router]);

    const login = async (email: string, password: string) => {
        const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        // Guardar en cookie (para el middleware de Next.js)
        document.cookie = `token=${res.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        setToken(res.token);
        setUser(res.user);
        connectSockets();
        // Redirigir según rol
        if (res.user.role === 'admin') router.push('/admin');
        else if (res.user.role === 'driver') router.push('/driver');
        else router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        document.cookie = 'token=; path=/; max-age=0';
        setToken(null);
        setUser(null);

        disconnectSockets();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
}