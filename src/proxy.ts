import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const isApiProductUpdate = req.nextUrl.pathname.startsWith('/api/products') && req.method !== 'GET';
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin/login';

  if (isAdminRoute || isApiProductUpdate) {
    const authToken = req.cookies.get('auth_token')?.value;

    if (authToken === 'authenticated') {
      return NextResponse.next();
    }

    if (isApiProductUpdate) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/products'],
};