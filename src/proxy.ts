import createMiddleware from 'next-intl/middleware';
import { routing } from './intl/routing';

export default createMiddleware(routing);

export const config = {
    matcher: ['/', '/(es|pt|en)/:path*'],
};