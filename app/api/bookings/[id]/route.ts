import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { status, notes } = await request.json();

    const updateData: any = { status };
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    const booking = await prisma.booking.update({
      where: {
        id: params.id,
        businessId: session.user.id,
      },
      data: updateData,
      include: {
        client: true,
        staff: true,
        service: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della prenotazione' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    await prisma.booking.delete({
      where: {
        id: params.id,
        businessId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Prenotazione eliminata' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della prenotazione' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'
