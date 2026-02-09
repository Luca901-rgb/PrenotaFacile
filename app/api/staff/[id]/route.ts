import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Lazy load prisma only at runtime
    const { prisma } = await import('@/lib/prisma');
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { name, email, phone, role, color } = await request.json();

    const staff = await prisma.staff.update({
      where: {
        id: params.id,
        businessId: session.user.id,
      },
      data: {
        name,
        email,
        phone,
        role,
        color,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del membro staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Lazy load prisma only at runtime
    const { prisma } = await import('@/lib/prisma');
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    await prisma.staff.delete({
      where: {
        id: params.id,
        businessId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Membro staff eliminato' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del membro staff' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'
