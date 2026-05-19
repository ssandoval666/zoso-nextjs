import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user, pwd } = await req.json();

    // Limpiamos las variables de entorno para evitar problemas con comillas o espacios invisibles en el .env
    const validUser = (process.env.ADMIN_USER || '').replace(/['"]/g, '').trim();
    const validPass = (process.env.ADMIN_PASSWORD || '').replace(/['"]/g, '').trim();

    if (validUser && validPass && user === validUser && pwd === validPass) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('auth_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 semana de sesión
      });
      return response;
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
