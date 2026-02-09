import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, businessType } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e password sono obbligatori' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { email },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique booking slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    let bookingSlug = baseSlug;
    let counter = 1;
    
    while (await prisma.business.findUnique({ where: { bookingSlug } })) {
      bookingSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate trial end date (14 days from now)
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

    // Create business
    const business = await prisma.business.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        businessType,
        bookingSlug,
        subscriptionStatus: 'trial',
        trialEnds,
      },
    });

    // Create default business hours (Monday to Friday, 9:00-18:00)
    const defaultHours = [1, 2, 3, 4, 5].map(day => ({
      businessId: business.id,
      dayOfWeek: day,
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
    }));

    // Weekend closed
    defaultHours.push(
      { businessId: business.id, dayOfWeek: 0, openTime: '09:00', closeTime: '18:00', isClosed: true },
      { businessId: business.id, dayOfWeek: 6, openTime: '09:00', closeTime: '18:00', isClosed: true }
    );

    await prisma.businessHours.createMany({
      data: defaultHours,
    });

    return NextResponse.json({
      message: 'Registrazione completata con successo',
      businessId: business.id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Errore durante la registrazione' },
      { status: 500 }
    );
  }
}

// Force dynamic rendering to avoid build-time database connection
export const dynamic = 'force-dynamic'
