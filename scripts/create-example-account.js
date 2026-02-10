/**
 * Crea account di esempio luca.cammarota@live.it con prova scaduta.
 * Esegui: node scripts/create-example-account.js
 * (carica .env.local se hai dotenv: npx dotenv -e .env.local -- node scripts/create-example-account.js)
 */
const path = require('path');
const fs = require('fs');
// Carica .env.local se esiste
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const EMAIL = 'luca.cammarota@live.it';
const PASSWORD = 'Prova123!';
const NAME = 'Esempio Luca';

async function main() {
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() - 1); // ieri = prova scaduta

  const existing = await prisma.business.findUnique({ where: { email: EMAIL } });

  if (existing) {
    await prisma.business.update({
      where: { email: EMAIL },
      data: { trialEnds, subscriptionStatus: 'trial' },
    });
    console.log('Account esistente aggiornato: prova impostata come scaduta.');
    console.log('Accedi con:', EMAIL, '/', PASSWORD);
    return;
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  let bookingSlug = 'esempio-luca';
  let counter = 1;
  while (await prisma.business.findUnique({ where: { bookingSlug } })) {
    bookingSlug = `esempio-luca-${counter++}`;
  }

  const business = await prisma.business.create({
    data: {
      name: NAME,
      email: EMAIL,
      password: hashedPassword,
      phone: null,
      businessType: 'barbershop',
      bookingSlug,
      subscriptionStatus: 'trial',
      trialEnds,
    },
  });

  const defaultHours = [1, 2, 3, 4, 5].map((day) => ({
    businessId: business.id,
    dayOfWeek: day,
    openTime: '09:00',
    closeTime: '18:00',
    isClosed: false,
  }));
  defaultHours.push(
    { businessId: business.id, dayOfWeek: 0, openTime: '09:00', closeTime: '18:00', isClosed: true },
    { businessId: business.id, dayOfWeek: 6, openTime: '09:00', closeTime: '18:00', isClosed: true }
  );
  await prisma.businessHours.createMany({ data: defaultHours });

  console.log('Account creato con prova scaduta.');
  console.log('Email:', EMAIL);
  console.log('Password:', PASSWORD);
  console.log('Dopo il login vedrai la schermata "Abbonati per continuare".');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
