/**
 * Route di test: verifica email/password senza NextAuth.
 * POST con body JSON { email, password } o form-urlencoded.
 * Ritorna 200 { ok: true } se valide, 401 altrimenti.
 */
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: { email?: string; password?: string };
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(await request.text());
      body = Object.fromEntries(params);
    } else {
      return NextResponse.json({ error: 'Content-Type non supportato' }, { status: 400 });
    }
    const email = (body.email ?? '').trim().toLowerCase();
    const password = body.password ?? '';
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password richiesti' }, { status: 400 });
    }
    const business = await prisma.business.findUnique({ where: { email } });
    if (!business) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, business.password);
    if (!valid) {
      return NextResponse.json({ error: 'Password non valida' }, { status: 401 });
    }
    return NextResponse.json({ ok: true, name: business.name });
  } catch (e) {
    console.error('[verify-credentials]', e);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
