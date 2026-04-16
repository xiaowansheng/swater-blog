import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 匹配所有路径，除了静态文件和API路由
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

