# 💈 PrenotaFacile - SaaS per Gestione Prenotazioni

**PrenotaFacile** è una piattaforma SaaS completa per la gestione delle prenotazioni online per barbieri, parrucchieri, centri estetici, centri massaggi e attività similari.

**⚡ NUOVE FUNZIONALITÀ 2026:**
- 📅 Flusso prenotazione ottimizzato: Data → Operatore → Servizio
- 📧 Email automatiche di conferma prenotazione
- ⚠️ Politica di cancellazione configurabile

👉 **[Vedi tutte le novità](./NUOVE_FUNZIONALITA.md)**

## 🚀 Caratteristiche Principali

✅ **Sistema Multi-Tenant** - Ogni attività ha il proprio account isolato  
✅ **Gestione Servizi Personalizzabili** - Crea servizi con durata, prezzo e categoria  
✅ **Gestione Staff/Operatori** - Assegna operatori ai servizi e gestisci calendari individuali  
✅ **Calendario Prenotazioni** - Visualizza tutte le prenotazioni in un calendario settimanale  
✅ **Pagina Pubblica** - Link pubblico per clienti che prenota online 24/7  
✅ **Dashboard Amministrativa** - Gestione completa della tua attività  
✅ **Autenticazione Sicura** - Sistema di login con NextAuth.js  
✅ **Abbonamento €9.99/mese** - Con 14 giorni di prova gratuita  
✅ **Design Moderno** - UI professionale e responsive  

## 🛠️ Tecnologie Utilizzate

- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL con Prisma ORM
- **Autenticazione**: NextAuth.js
- **Pagamenti**: Stripe (configurabile)
- **Icons**: Lucide React

## 📋 Prerequisiti

- Node.js 18+ installato
- PostgreSQL installato e in esecuzione
- Account Stripe (opzionale, per pagamenti)

## 🔧 Installazione

### 1. Clona il progetto (già fatto se stai leggendo questo)

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura il database PostgreSQL

Crea un database PostgreSQL:

```sql
CREATE DATABASE prenotafacile;
```

### 4. Configura le variabili d'ambiente

Copia il file `.env.local` e modifica con i tuoi dati:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/prenotafacile?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-una-chiave-segreta-qui"

# Stripe (opzionale)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Genera NEXTAUTH_SECRET con:**
```bash
openssl rand -base64 32
```

### 5. Esegui le migrazioni del database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Avvia il server di sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

## 📱 Funzionalità dell'Applicazione

### Per i Proprietari delle Attività

1. **Registrazione**: `/auth/signup` - Crea il tuo account gratuito (14 giorni di prova)
2. **Dashboard**: `/dashboard` - Panoramica dell'attività con statistiche
3. **Servizi**: `/dashboard/services` - Gestisci i tuoi servizi/trattamenti
4. **Staff**: `/dashboard/staff` - Gestisci il tuo team
5. **Prenotazioni**: `/dashboard/bookings` - Visualizza e gestisci le prenotazioni
6. **Calendario**: `/dashboard/calendar` - Vista calendario settimanale
7. **Impostazioni**: `/dashboard/settings` - Configura la tua attività

### Per i Clienti

**Pagina Pubblica**: `/book/[slug]` - I clienti possono:
- Scegliere un servizio
- Selezionare un operatore
- Scegliere data e ora disponibile
- Inserire i propri dati
- Confermare la prenotazione

## 🎯 Come Usare

### 1. Registrati

1. Vai su `/auth/signup`
2. Inserisci i dati della tua attività
3. Scegli il tipo di attività (barbiere, parrucchiere, etc.)
4. Crea il tuo account

### 2. Configura la tua attività

1. Vai in **Servizi** e aggiungi i tuoi trattamenti/servizi
2. Vai in **Staff** e aggiungi i tuoi operatori
3. Vai in **Impostazioni** e completa le informazioni

### 3. Condividi il link di prenotazione

1. Copia il link pubblico dalla dashboard
2. Condividilo con i tuoi clienti (social media, WhatsApp, etc.)
3. I clienti potranno prenotare direttamente online!

## 🗄️ Struttura del Database

### Business (Attività)
- Informazioni dell'attività
- Gestione abbonamento
- Orari di apertura
- Link pubblico personalizzato

### Service (Servizi)
- Nome, descrizione, categoria
- Durata e prezzo
- Staff associato

### Staff (Operatori)
- Dati personali
- Ruolo
- Colore calendario

### Client (Clienti)
- Dati di contatto
- Storico prenotazioni

### Booking (Prenotazioni)
- Data e ora
- Cliente, Staff, Servizio
- Stato (confermata, completata, cancellata)

## 🔐 Sicurezza

- Password criptate con bcrypt
- Autenticazione JWT tramite NextAuth.js
- Validazione dati su ogni endpoint API
- Isolamento multi-tenant (ogni attività vede solo i propri dati)

## 💳 Integrazione Stripe (Opzionale)

Per abilitare i pagamenti:

1. Crea un account su [Stripe](https://stripe.com)
2. Configura un prodotto con prezzo ricorrente €9.99/mese
3. Aggiungi le chiavi API in `.env.local`
4. Implementa il webhook Stripe per gestire gli eventi di pagamento

## 🚀 Deploy in Produzione

### Vercel (Consigliato)

1. Push su GitHub
2. Importa su Vercel
3. Configura le variabili d'ambiente
4. Deploy automatico!

### Altre opzioni
- AWS
- DigitalOcean
- Railway
- Render

## 📝 Personalizzazione

### Cambiare i colori del brand

Modifica `tailwind.config.ts`:

```ts
colors: {
  primary: {
    // Cambia questi valori
    500: '#0ea5e9',
    600: '#0284c7',
    // ...
  }
}
```

### Aggiungere nuovi tipi di attività

Modifica `app/auth/signup/page.tsx` nella sezione `businessTypes`.

## 🤝 Supporto

Per domande o problemi:
- Email: support@prenotafacile.com
- Documentazione: [docs.prenotafacile.com](https://docs.prenotafacile.com)

## 📄 Licenza

Questo progetto è proprietario. Tutti i diritti riservati.

## 🎉 Inizia Ora!

```bash
npm run dev
```

Poi visita [http://localhost:3000](http://localhost:3000) e registrati!

---

**Fatto con ❤️ per barbieri, parrucchieri e centri estetici**
