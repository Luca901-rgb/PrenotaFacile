import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
      where: { id: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business non trovato' }, { status: 404 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get week range
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Count stats
    const [todayBookings, weekBookings, totalStaff, totalServices] = await Promise.all([
      prisma.booking.count({
        where: {
          businessId: business.id,
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            not: 'cancelled',
          },
        },
      }),
      prisma.booking.count({
        where: {
          businessId: business.id,
          date: {
            gte: weekAgo,
          },
          status: {
            not: 'cancelled',
          },
        },
      }),
      prisma.staff.count({
        where: {
          businessId: business.id,
          isActive: true,
        },
      }),
      prisma.service.count({
        where: {
          businessId: business.id,
          isActive: true,
        },
      }),
    ]);

    const stripeEnabled = Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID
    );

    return NextResponse.json({
      todayBookings,
      weekBookings,
      totalStaff,
      totalServices,
      bookingSlug: business.bookingSlug,
      subscriptionStatus: business.subscriptionStatus,
      trialEnds: business.trialEnds?.toISOString() ?? null,
      subscriptionEnds: business.subscriptionEnds?.toISOString() ?? null,
      hasStripeCustomer: Boolean(business.stripeCustomerId),
      stripeEnabled,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle statistiche' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'
