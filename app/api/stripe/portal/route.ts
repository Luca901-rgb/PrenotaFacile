import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, isStripeEnabled } from '@/lib/stripe';

export async function POST() {
  try {
    if (!stripe || !isStripeEnabled) {
      return NextResponse.json(
        { error: 'Stripe non configurato' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');
    const business = await prisma.business.findUnique({
      where: { id: session.user.id },
    });

    if (!business?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Nessun abbonamento trovato. Effettua prima un abbonamento.' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: business.stripeCustomerId,
      return_url: `${appUrl}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'apertura del portale fatturazione' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
