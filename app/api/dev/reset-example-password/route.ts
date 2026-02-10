/**
 * Solo sviluppo: crea o reimposta l'account luca.cammarota@live.it / Prova123!
 * Usa lo stesso Prisma dell'app (stesso DB).
 * GET o POST: /api/dev/reset-example-password
 */
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const EMAIL = 'luca.cammarota@live.it';
const NEW_PASSWORD = 'Prova123!';
const NAME = 'Esempio Luca';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Solo in sviluppo' }, { status: 404 });
  }
  return run();
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Solo in sviluppo' }, { status: 404 });
  }
  return run();
}

async function run() {
  try {
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() - 1);

    const existing = await prisma.business.findFirst({
      where: { email: { equals: EMAIL, mode: 'insensitive' } },
    });

    if (existing) {
      const hash = await bcrypt.hash(NEW_PASSWORD, 10);
      await prisma.business.update({
        where: { id: existing.id },
        data: { password: hash, trialEnds, subscriptionStatus: 'trial' },
      });
      return NextResponse.json({
        ok: true,
        message: 'Password reimpostata',
        email: EMAIL,
        password: NEW_PASSWORD,
      });
    }

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    let bookingSlug = 'esempio-luca';
    let n = 1;
    while (await prisma.business.findUnique({ where: { bookingSlug } })) {
      bookingSlug = `esempio-luca-${n++}`;
    }

    const business = await prisma.business.create({
      data: {
        name: NAME,
        email: EMAIL,
        password: hashedPassword,
        businessType: 'barbershop',
        bookingSlug,
        subscriptionStatus: 'trial',
        trialEnds,
      },
    });

    const hours = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      businessId: business.id,
      dayOfWeek,
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
    }));
    hours.push(
      { businessId: business.id, dayOfWeek: 0, openTime: '09:00', closeTime: '18:00', isClosed: true },
      { businessId: business.id, dayOfWeek: 6, openTime: '09:00', closeTime: '18:00', isClosed: true }
    );
    await prisma.businessHours.createMany({ data: hours });

    return NextResponse.json({
      ok: true,
      message: 'Account creato',
      email: EMAIL,
      password: NEW_PASSWORD,
    });
  } catch (e) {
    console.error('[reset-example-password]', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
