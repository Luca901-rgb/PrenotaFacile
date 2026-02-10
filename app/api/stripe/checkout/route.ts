import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, isStripeEnabled, STRIPE_PRICE_ID } from '@/lib/stripe';

export async function POST() {
  try {
    if (!stripe || !isStripeEnabled) {
      return NextResponse.json(
        { error: 'Stripe non configurato. Aggiungi STRIPE_SECRET_KEY e STRIPE_PRICE_ID.' },
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

    if (!business) {
      return NextResponse.json({ error: 'Attività non trovata' }, { status: 404 });
    }

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let customerId = business.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: business.email,
        name: business.name,
        metadata: { businessId: business.id },
      });
      customerId = customer.id;
      await prisma.business.update({
        where: { id: business.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?subscription=success`,
      cancel_url: `${appUrl}/dashboard?subscription=cancelled`,
      subscription_data: {
        metadata: { businessId: business.id },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const raw = error && typeof error === 'object' && 'raw' in error ? (error as { raw?: { message?: string; code?: string } }).raw : undefined;
    const detail = raw?.message ?? message;
    const code = raw?.code;
    console.error('Stripe checkout error:', error);
    const hint =
      code === 'resource_missing' || /no such price|invalid.*price/i.test(String(detail))
        ? 'Verifica che STRIPE_PRICE_ID in .env.local sia un Price ID valido (Dashboard Stripe → Prodotti → Prezzo) e che sia della stessa modalità della chiave (test con sk_test_..., live con sk_live_...).'
        : null;
    return NextResponse.json(
      {
        error: 'Errore nella creazione del checkout',
        ...(detail ? { detail } : {}),
        ...(hint ? { hint } : {}),
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
