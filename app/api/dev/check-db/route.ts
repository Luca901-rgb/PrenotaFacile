/**
 * Solo sviluppo: verifica a quale DB si connette l'app e quali email esistono.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Solo in sviluppo' }, { status: 404 });
  }
  try {
    const url = process.env.DATABASE_URL || '';
    const host = url.includes('@') ? url.split('@')[1]?.split('/')[0] : 'nascosto';
    const businesses = await prisma.business.findMany({
      select: { id: true, email: true, name: true },
      take: 20,
    });
    return NextResponse.json({
      databaseHost: host,
      businessCount: businesses.length,
      emails: businesses.map((b) => b.email),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
