import { NextRequest, NextResponse } from 'next/server';

const apiHits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;

function clientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimit(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/api')) return null;

  const ip = clientIp(request);
  const isLogin = pathname === '/api/auth/login';
  const limit = isLogin ? 12 : 180;
  const key = `${ip}:${isLogin ? pathname : 'api'}`;
  const now = Date.now();
  const current = apiHits.get(key);

  if (!current || current.resetAt < now) {
    apiHits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  current.count += 1;
  if (current.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((current.resetAt - now) / 1000)) } }
    );
  }

  return null;
}

function sameOriginGuard(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method.toUpperCase();
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (!pathname.startsWith('/api') || !mutating) return null;

  // External providers need server-to-server webhooks. Their routes should verify signatures separately.
  const webhookAllowList = ['/api/subscriptions/webhook'];
  if (webhookAllowList.some((route) => pathname.startsWith(route))) return null;

  const origin = request.headers.get('origin');
  if (!origin) return null; // Allows server-to-server tools and local curl during development.

  const originHost = new URL(origin).host;
  const requestHost = request.headers.get('host');

  if (originHost !== requestHost) {
    return NextResponse.json({ error: 'Cross-origin write blocked.' }, { status: 403 });
  }

  return null;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self), usb=(), bluetooth=(), browsing-topics=()'
  );

  // CSP is intentionally compatible with Next.js dev/prod and Firebase realtime.
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com https://identitytoolkit.googleapis.com",
      "form-action 'self'",
      'upgrade-insecure-requests'
    ].join('; ')
  );

  return response;
}

export function middleware(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return applySecurityHeaders(limited);

  const originBlocked = sameOriginGuard(request);
  if (originBlocked) return applySecurityHeaders(originBlocked);

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
