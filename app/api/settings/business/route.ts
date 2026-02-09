import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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

    return NextResponse.json({
      name: business.name,
      description: business.description,
      phone: business.phone,
      address: business.address,
      bookingSlug: business.bookingSlug,
      cancellationPolicy: business.cancellationPolicy,
      cancellationHours: business.cancellationHours,
      sendEmailConfirmation: business.sendEmailConfirmation,
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { name, description, phone, address, cancellationPolicy, cancellationHours, sendEmailConfirmation } = await request.json();

    const business = await prisma.business.update({
      where: { id: session.user.id },
      data: {
        name,
        description,
        phone,
        address,
        cancellationPolicy,
        cancellationHours,
        sendEmailConfirmation,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dei dati' },
      { status: 500 }
    );
  }
}
