# Deploy su Vercel

## 1. Progetto
- **Nome:** prenota-facile-  
- **URL produzione:** https://prenota-facile-self.vercel.app  
- **Dashboard progetto:** https://vercel.com/lcammarota24-9213s-projects/prenota-facile-  
- **Variabili d'ambiente:** https://vercel.com/lcammarota24-9213s-projects/prenota-facile-/settings/environment-variables  
- **Build:** assicurati che il progetto sia collegato al repo GitHub `Luca901-rgb/PrenotaFacile` (branch `main`). Dopo ogni push il deploy parte da solo.

## 2. Variabili d'ambiente (obbligatorie)
In **Settings → Environment Variables** aggiungi per **Production** (e se serve **Preview**):

| Nome | Descrizione |
|------|-------------|
| `DATABASE_URL` | Connection string PostgreSQL (es. Neon): `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_URL` | URL dell'app (vedi in Vercel → Domains), es. `https://prenota-facile-xxx.vercel.app` |
| `NEXTAUTH_SECRET` | Stringa segreta (es. genera con `openssl rand -base64 32`) |
| `STRIPE_SECRET_KEY` | `sk_live_...` o `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (dopo aver creato il webhook su Stripe) |
| `STRIPE_PRICE_ID` | `price_...` |
| `NEXT_PUBLIC_APP_URL` | Come NEXTAUTH_URL (stesso dominio dell'app) |

Opzionali (email): `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`

## 3. Webhook Stripe
- Dashboard Stripe → Sviluppatori → Webhook → Aggiungi endpoint  
- URL: `https://<tuo-dominio-vercel>/api/stripe/webhook` (es. `https://prenota-facile-xxx.vercel.app/api/stripe/webhook`)  
- Eventi: `customer.subscription.*`, `invoice.payment_succeeded`, `invoice.payment_failed`  
- Copia il **Signing secret** in `STRIPE_WEBHOOK_SECRET` su Vercel.

## 4. Database
- Crea un progetto su [Neon](https://neon.tech) (o altro PostgreSQL).
- Copia la connection string in `DATABASE_URL`.
- Applica lo schema una volta: da locale con `DATABASE_URL` di produzione esegui  
  `npx prisma db push`  
  oppure  
  `npx prisma migrate deploy`  
  (se usi le migrazioni).

## 5. Dopo aver aggiunto le variabili
- **Redeploy:** Deployments → ⋮ sull’ultimo deploy → Redeploy.
- L’app sarà disponibile sul dominio del progetto (vedi Vercel → Domains).
