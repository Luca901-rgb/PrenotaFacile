import { NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: Request) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook: STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET mancanti');
    return NextResponse.json({ error: 'Webhook non configurato' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Firma mancante' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    const { prisma } = await import('@/lib/prisma');

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const businessId = subscription.metadata?.businessId;
        if (!businessId) break;

        const status = subscription.status;
        const isActive = status === 'active' || status === 'trialing';
        const cancelAtPeriodEnd = subscription.cancel_at_period_end === true;
        const periodEnd = new Date((subscription.current_period_end || 0) * 1000);
        const subscriptionStatus =
          status === 'canceled' || status === 'unpaid'
            ? 'cancelled'
            : cancelAtPeriodEnd
              ? 'cancelled'
              : isActive
                ? 'active'
                : 'expired';

        await prisma.business.update({
          where: { id: businessId },
          data: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus,
            subscriptionEnds: periodEnd,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const businessId = subscription.metadata?.businessId;
        if (!businessId) break;

        await prisma.business.update({
          where: { id: businessId },
          data: {
            subscriptionStatus: 'expired',
            subscriptionEnds: new Date(),
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const businessId = subscription.metadata?.businessId;
        if (!businessId) break;

        const periodEnd = new Date((subscription.current_period_end || 0) * 1000);
        await prisma.business.update({
          where: { id: businessId },
          data: {
            subscriptionStatus: 'active',
            subscriptionEnds: periodEnd,
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const businessId = subscription.metadata?.businessId;
        if (!businessId) break;

        await prisma.business.update({
          where: { id: businessId },
          data: { subscriptionStatus: 'expired' },
        });
        break;
      }

      default:
        // Ignora altri eventi
        break;
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const dynamic = 'force-dynamic';
