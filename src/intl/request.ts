import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    const messages = (
        locale === 'pt' ? await import('../../messages/pt.json') :
            locale === 'en' ? await import('../../messages/en.json') :
                await import('../../messages/es.json')
    ).default;

    return { locale, messages };
});