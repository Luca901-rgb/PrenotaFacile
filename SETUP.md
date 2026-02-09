# 🚀 Setup Rapido - PrenotaFacile

Questa guida ti aiuterà a configurare PrenotaFacile in pochi minuti.

## ✅ Prerequisiti

Prima di iniziare, assicurati di avere:

- [x] Node.js 18 o superiore → [Scarica qui](https://nodejs.org/)
- [x] PostgreSQL installato → [Scarica qui](https://www.postgresql.org/download/)
- [x] Editor di codice (VS Code consigliato)

## 📦 Step 1: Verifica Installazioni

Apri il terminale e verifica le versioni:

```bash
node --version   # Deve essere >= 18
npm --version    # Deve essere >= 9
psql --version   # Deve essere installato
```

## 🗄️ Step 2: Configura PostgreSQL

### Windows

1. Apri pgAdmin o SQL Shell (psql)
2. Crea un nuovo database:

```sql
CREATE DATABASE prenotafacile;
```

3. Crea un utente (opzionale):

```sql
CREATE USER prenotauser WITH PASSWORD 'tuapassword';
GRANT ALL PRIVILEGES ON DATABASE prenotafacile TO prenotauser;
```

### Mac/Linux

```bash
psql -U postgres
CREATE DATABASE prenotafacile;
\q
```

## 🔑 Step 3: Configura Variabili d'Ambiente

1. Apri il file `.env.local` nella root del progetto
2. Modifica queste righe:

```env
# Sostituisci con i tuoi dati PostgreSQL
DATABASE_URL="postgresql://postgres:tuapassword@localhost:5432/prenotafacile?schema=public"

# Genera una chiave segreta
NEXTAUTH_SECRET="copia-qui-il-risultato-del-comando-sotto"
```

3. Per generare `NEXTAUTH_SECRET`, esegui nel terminale:

**Windows (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

## 📥 Step 4: Installa Dipendenze

```bash
npm install
```

Attendi qualche minuto per il download di tutte le dipendenze.

## 🗃️ Step 5: Inizializza Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Questi comandi creano le tabelle nel database.

## 🎨 Step 6: Avvia l'Applicazione

```bash
npm run dev
```

Aspetta che compaia:

```
✓ Ready in 3.5s
○ Local:   http://localhost:3000
```

## 🌐 Step 7: Apri nel Browser

Apri [http://localhost:3000](http://localhost:3000)

Dovresti vedere la landing page di PrenotaFacile! 🎉

## 👤 Step 8: Crea il Tuo Primo Account

1. Clicca su **"Inizia Gratis"** o vai su `/auth/signup`
2. Compila il form con:
   - Nome attività (es. "Barber Shop Mario")
   - Tipo attività (seleziona dalla lista)
   - Email e password
3. Clicca su **"Inizia la Prova Gratuita"**
4. Verrai reindirizzato alla pagina di login
5. Accedi con le tue credenziali

## 🎯 Step 9: Configura la Tua Attività

### 9.1 Aggiungi Servizi

1. Vai in **Dashboard → Servizi**
2. Clicca **"Nuovo Servizio"**
3. Aggiungi i tuoi servizi:
   - Nome: "Taglio Uomo"
   - Durata: 30 minuti
   - Prezzo: 20.00 €
   - Categoria: "Taglio"

### 9.2 Aggiungi Staff

1. Vai in **Dashboard → Staff**
2. Clicca **"Nuovo Membro"**
3. Aggiungi operatori:
   - Nome: "Mario Rossi"
   - Ruolo: "Barbiere"
   - Email/Telefono (opzionale)
   - Scegli un colore

### 9.3 Configura Impostazioni

1. Vai in **Dashboard → Impostazioni**
2. Completa:
   - Descrizione attività
   - Telefono
   - Indirizzo

## 🔗 Step 10: Condividi il Link di Prenotazione

Nella dashboard vedrai il tuo link pubblico:

```
http://localhost:3000/book/tuo-slug
```

I clienti possono usare questo link per prenotare online!

## 🎊 Complimenti!

Hai configurato PrenotaFacile con successo! 

## 🆘 Problemi Comuni

### Errore: "Cannot find module"

```bash
npm install
```

### Errore: Database connection

Verifica che:
- PostgreSQL sia in esecuzione
- Le credenziali in `.env.local` siano corrette
- Il database `prenotafacile` esista

### Errore: Port 3000 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### La pagina non si carica

1. Controlla il terminale per errori
2. Prova a riavviare:
   ```bash
   # CTRL+C per fermare
   npm run dev
   ```

## 📚 Prossimi Passi

- Esplora tutte le funzionalità della dashboard
- Personalizza i colori del tema
- Invita i tuoi clienti a prenotare
- Controlla il README.md per funzionalità avanzate

## 💡 Tips

1. **Backup del database**: Usa `pg_dump` per backup periodici
2. **Test**: Crea prenotazioni di prova per testare il sistema
3. **Mobile**: Il sito è completamente responsive, testalo su mobile!

## 📞 Serve Aiuto?

Leggi il `README.md` per la documentazione completa.

---

**Buon lavoro con PrenotaFacile! 💈✨**
