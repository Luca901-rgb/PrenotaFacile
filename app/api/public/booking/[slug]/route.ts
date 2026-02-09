import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: { bookingSlug: params.slug },
    });

    if (!business || !business.bookingEnabled) {
      return NextResponse.json(
        { error: 'Business non trovato o prenotazioni non abilitate' },
        { status: 404 }
      );
    }

    const services = await prisma.service.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    const staff = await prisma.staff.findMany({
      where: {
        businessId: business.id,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        phone: business.phone,
        address: business.address,
        cancellationPolicy: business.cancellationPolicy,
        cancellationHours: business.cancellationHours,
      },
      services,
      staff,
    });
  } catch (error) {
    console.error('Error fetching business data:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { serviceId, staffId, date, client } = await request.json();

    const business = await prisma.business.findUnique({
      where: { bookingSlug: params.slug },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business non trovato' }, { status: 404 });
    }

    // Find or create client
    let clientRecord = await prisma.client.findFirst({
      where: {
        businessId: business.id,
        phone: client.phone,
      },
    });

    if (!clientRecord) {
      clientRecord = await prisma.client.create({
        data: {
          businessId: business.id,
          name: client.name,
          phone: client.phone,
          email: client.email || null,
          notes: client.notes || null,
        },
      });
    }

    // Get service to calculate end time
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }

    const startTime = new Date(date);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId: business.id,
        clientId: clientRecord.id,
        staffId,
        serviceId,
        date: startTime,
        endTime,
        notes: client.notes || null,
      },
      include: {
        service: true,
        staff: true,
      },
    });

    // Send confirmation email if client provided email and business has email enabled
    if (client.email && business.sendEmailConfirmation) {
      try {
        await sendBookingConfirmation({
          to: client.email,
          businessName: business.name,
          clientName: client.name,
          serviceName: booking.service.name,
          staffName: booking.staff.name,
          date: format(startTime, 'dd MMMM yyyy', { locale: it }),
          time: format(startTime, 'HH:mm'),
          duration: booking.service.duration,
          price: booking.service.price,
          businessPhone: business.phone || undefined,
          cancellationPolicy: business.cancellationPolicy || undefined,
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Non bloccare la prenotazione se l'email fallisce
      }
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione' },
      { status: 500 }
    );
  }
}
