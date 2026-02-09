import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');
    const serviceId = searchParams.get('serviceId');

    if (!date || !staffId || !serviceId) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { bookingSlug: params.slug },
      include: {
        businessHours: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business non trovato' }, { status: 404 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404 });
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get business hours for this day
    const hours = business.businessHours.find(h => h.dayOfWeek === dayOfWeek);

    if (!hours || hours.isClosed) {
      return NextResponse.json({ slots: [] });
    }

    // Generate time slots
    const [openHour, openMinute] = hours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = hours.closeTime.split(':').map(Number);

    const slots = [];
    let currentTime = openHour * 60 + openMinute; // Convert to minutes
    const endTime = closeHour * 60 + closeMinute;

    // Get existing bookings for this staff and date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        staffId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'cancelled',
        },
      },
    });

    // Generate slots every 30 minutes
    while (currentTime + service.duration <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Check if this slot is available
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hours, minutes, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + service.duration * 60000);

      const isBooked = existingBookings.some(booking => {
        const bookingStart = new Date(booking.date);
        const bookingEnd = new Date(booking.endTime);
        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      slots.push({
        time: timeString,
        available: !isBooked,
      });

      currentTime += 30; // 30 minute intervals
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli orari' },
      { status: 500 }
    );
  }
}
