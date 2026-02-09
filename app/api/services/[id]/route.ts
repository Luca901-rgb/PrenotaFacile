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

    const { name, description, duration, price, category } = await request.json();

    const service = await prisma.service.update({
      where: {
        id: params.id,
        businessId: session.user.id,
      },
      data: {
        name,
        description,
        duration,
        price,
        category,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del servizio' },
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

    await prisma.service.delete({
      where: {
        id: params.id,
        businessId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Servizio eliminato' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del servizio' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'
