import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, isStripeEnabled } from '@/lib/stripe';

/**
 * Cancella l'abbonamento alla fine del periodo già pagato.
 * Nessun ulteriore addebito; l'utente mantiene l'accesso fino a subscriptionEnds.
 */
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

    if (!business?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Nessun abbonamento attivo da cancellare' },
        { status: 400 }
      );
    }

    const sub = await stripe.subscriptions.retrieve(business.stripeSubscriptionId);
    if (sub.status !== 'active' && sub.status !== 'trialing') {
      return NextResponse.json(
        { error: 'L\'abbonamento non è attivo' },
        { status: 400 }
      );
    }

    if (sub.cancel_at_period_end) {
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;
      return NextResponse.json({
        ok: true,
        alreadyCancelled: true,
        message: 'L\'abbonamento risulta già in cancellazione.',
        subscriptionEnds: periodEnd?.toISOString() ?? null,
      });
    }

    await stripe.subscriptions.update(business.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const updated = await stripe.subscriptions.retrieve(business.stripeSubscriptionId);
    const periodEnd = new Date((updated.current_period_end ?? 0) * 1000);

    await prisma.business.update({
      where: { id: business.id },
      data: {
        subscriptionStatus: 'cancelled',
        subscriptionEnds: periodEnd,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Abbonamento annullato. Non ti verranno addebitati altri importi.',
      subscriptionEnds: periodEnd.toISOString(),
    });
  } catch (error) {
    console.error('Stripe cancel-subscription error:', error);
    return NextResponse.json(
      { error: 'Errore durante la cancellazione dell\'abbonamento' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
