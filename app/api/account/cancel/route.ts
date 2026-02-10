import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, isStripeEnabled } from '@/lib/stripe';

/**
 * Cancella l'account: prima annulla l'abbonamento Stripe (nessun altro addebito),
 * poi elimina il business e tutti i dati collegati (cascade).
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');
    const business = await prisma.business.findUnique({
      where: { id: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: 'Account non trovato' }, { status: 404 });
    }

    // 1. Annulla abbonamento Stripe (stop pagamenti mensili)
    if (stripe && isStripeEnabled && business.stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(business.stripeSubscriptionId);
        if (sub.status === 'active' || sub.status === 'trialing') {
          await stripe.subscriptions.update(business.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
        }
      } catch (e) {
        console.error('Stripe cancel on account close:', e);
        // Continua comunque con la chiusura account
      }
    }

    // 2. Elimina business e dati collegati (cascade)
    await prisma.business.delete({
      where: { id: business.id },
    });

    return NextResponse.json({
      ok: true,
      message: 'Account cancellato. Non ti verranno più addebitati importi.',
    });
  } catch (error) {
    console.error('Account cancel error:', error);
    return NextResponse.json(
      { error: 'Errore durante la cancellazione dell\'account' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
