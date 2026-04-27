'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const LOCALES = [
    { code: 'es', flag: '🇪🇸' },
    { code: 'pt', flag: '🇧🇷' },
    { code: 'en', flag: '🇺🇸' },
];

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: string) => {
        // Reemplaza el locale actual en la URL
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath);
    };

    return (
        <div className="flex justify-end gap-1 mb-4">
            {LOCALES.map(l => (
                <button
                    key={l.code}
                    onClick={() => switchLocale(l.code)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${locale === l.code
                            ? 'bg-brand-500 text-white'
                            : 'text-white opacity-30 hover:opacity-60'
                        }`}
                >
                    {l.flag} {l.code.toUpperCase()}
                </button>
            ))}
        </div>
    );
}