# Configurazione Stripe per PrenotaFacile

## 1. Dashboard Stripe

1. Accedi a [Stripe Dashboard](https://dashboard.stripe.com).
2. Usa **Modalità test** (toggle in alto) per provare senza addebiti reali.

## 2. Prodotto e prezzo (€9,99/mese)

1. Vai in **Prodotti** → **Aggiungi prodotto**.
2. Nome: `PrenotaFacile Abbonamento`.
3. Aggiungi un prezzo:
   - Tipo: **Ricorrente**
   - Fatturazione: **Mensile**
   - Importo: **9,99 €**
4. Salva e copia l’**ID prezzo** (es. `price_1ABC...`): ti serve come `STRIPE_PRICE_ID`.

## 3. Chiavi API

1. Vai in **Sviluppatori** → **Chiavi API**.
2. Copia:
   - **Chiave segreta** (es. `sk_test_...` o `sk_live_...`) → `STRIPE_SECRET_KEY`
   - **Chiave pubblicabile** (es. `pk_test_...`) → `STRIPE_PUBLISHABLE_KEY` (opzionale se non usi Stripe.js in frontend)

## 4. Webhook (obbligatorio per abbonamenti)

1. Vai in **Sviluppatori** → **Webhook** → **Aggiungi endpoint**.
2. **URL endpoint** (produzione):
   ```
   https://TUO_DOMINIO_VERCEL.vercel.app/api/stripe/webhook
   ```
   In locale con ngrok:
   ```
   https://xxx.ngrok.io/api/stripe/webhook
   ```
3. Seleziona eventi da ascoltare:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Clicca **Aggiungi endpoint** e copia il **Segreto del webhook** (es. `whsec_...`) → `STRIPE_WEBHOOK_SECRET`.

## 5. Variabili d’ambiente

Aggiungi in **Vercel** (Progetto → Settings → Environment Variables) e in `.env.local` in locale:

| Variabile | Descrizione |
|-----------|-------------|
| `STRIPE_SECRET_KEY` | Chiave segreta (sk_test_... o sk_live_...) |
| `STRIPE_PRICE_ID` | ID prezzo ricorrente (price_...) |
| `STRIPE_WEBHOOK_SECRET` | Segreto webhook (whsec_...) |
| `STRIPE_PUBLISHABLE_KEY` | (Opzionale) Chiave pubblicabile |

Dopo aver salvato le variabili su Vercel, esegui un nuovo deploy.

## 6. Portale fatturazione (opzionale)

Il portale cliente Stripe (cambio carta, disdetta, fatture) è abilitato di default.  
Se vuoi personalizzarlo: **Impostazioni** → **Fatturazione** → **Portale fatturazione** nella Dashboard Stripe.

## 7. Verifica

1. Avvia l’app e accedi alla dashboard.
2. Dovresti vedere il blocco **Piano PrenotaFacile** con pulsante **Abbonati a €9,99/mese**.
3. Clicca **Abbonati**: si apre il checkout Stripe (usa carta test `4242 4242 4242 4242`).
4. Dopo il pagamento, Stripe invia i webhook e lo stato in dashboard diventa **Abbonamento attivo**.
5. **Gestisci abbonamento** apre il portale Stripe (fatture, cancellazione, metodo di pagamento).

## Carte di test (modalità test)

- Numero: `4242 4242 4242 4242`
- Scadenza: una data futura
- CVC: qualsiasi 3 cifre
- CAP: qualsiasi
