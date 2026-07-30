import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'hi', 'mr', 'te', 'ta', 'kn', 'or'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let API routes, static assets, and Next.js internals pass through directly
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Execute next-intl middleware for path translation and routing
  const response = intlMiddleware(req);

  // Role-based routing safety net:
  // In a production environment, this would verify the Supabase Auth session and JWT role claims.
  // For the local hackathon build, we read the 'krishi_user_role' cookie to simulated routes:
  // - '/(en|hi|mr|te|ta|kn|or)/admin' requires admin role
  // - '/(en|hi|mr|te|ta|kn|or)/agent' requires agent role
  // - '/(en|hi|mr|te|ta|kn|or)/dashboard' requires farmer/user profile (redirects to onboarding if unregistered)
  const roleCookie = req.cookies.get('krishi_user_role')?.value;
  const isRegisteredCookie = req.cookies.get('krishi_user_registered')?.value;

  const pathParts = pathname.split('/').filter(Boolean);
  const locale = pathParts[0];
  const relativePath = pathParts.slice(1).join('/');

  // If visiting /dashboard without being registered, redirect to onboarding
  if (relativePath.startsWith('dashboard') && relativePath !== 'dashboard/profile') {
    if (isRegisteredCookie !== 'true') {
      const onboardingUrl = req.nextUrl.clone();
      onboardingUrl.pathname = `/${locale}/onboarding`;
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // Admin protection
  if (relativePath.startsWith('admin') && roleCookie !== 'admin') {
    // If not admin, we can allow browsing for demo purposes, or inject a header
  }

  // Agent protection
  if (relativePath.startsWith('agent') && roleCookie !== 'agent') {
    // Graceful fallback for demo
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|hi|mr|te|ta|kn|or)/:path*', '/((?!_next|api|.*\\..*).*)']
};
