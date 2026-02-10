/**
 * Verifica che l'account esista e che la password sia corretta.
 * Esegui: node scripts/verify-login.js
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
const PASSWORD = 'Prova123!';

async function main() {
  console.log('DB:', process.env.DATABASE_URL ? 'DATABASE_URL presente' : 'DATABASE_URL mancante');
  const business = await prisma.business.findUnique({ where: { email: EMAIL } });
  if (!business) {
    console.log('ERRORE: Account non trovato per email:', EMAIL);
    const any = await prisma.business.findFirst({ select: { email: true } });
    console.log('Prima email nel DB:', any?.email ?? 'nessuna');
    return;
  }
  console.log('OK: Account trovato, id:', business.id);
  const valid = await bcrypt.compare(PASSWORD, business.password);
  console.log('Password "Prova123!" valida:', valid);
  if (!valid) {
    const rehash = await bcrypt.hash(PASSWORD, 10);
    await prisma.business.update({ where: { email: EMAIL }, data: { password: rehash } });
    console.log('Password reimpostata. Riprova il login.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
