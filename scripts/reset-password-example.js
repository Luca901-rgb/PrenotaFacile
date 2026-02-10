/**
 * Reimposta la password per luca.cammarota@live.it a Prova123!
 * Esegui: node scripts/reset-password-example.js
 */
const path = require('path');
const fs = require('fs');
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
const NEW_PASSWORD = 'Prova123!';

async function main() {
  const business = await prisma.business.findUnique({ where: { email: EMAIL } });
  if (!business) {
    console.log('Account non trovato. Esegui prima: node scripts/create-example-account.js');
    process.exit(1);
  }
  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  await prisma.business.update({
    where: { email: EMAIL },
    data: { password: hash },
  });
  console.log('Password reimpostata.');
  console.log('Email:', EMAIL);
  console.log('Nuova password:', NEW_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
