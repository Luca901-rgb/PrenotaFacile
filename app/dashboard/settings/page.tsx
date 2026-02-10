'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Save, ExternalLink, CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<{
    subscriptionStatus: string;
    trialEnds: string | null;
    subscriptionEnds: string | null;
    hasStripeCustomer: boolean;
    stripeEnabled: boolean;
  } | null>(null);
  const [stripeLoading, setStripeLoading] = useState<'checkout' | 'portal' | 'cancel' | null>(null);
  const [stripeError, setStripeError] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');
  const [business, setBusiness] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    bookingSlug: '',
    cancellationPolicy: '',
    cancellationHours: 24,
    sendEmailConfirmation: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [accountCancelLoading, setAccountCancelLoading] = useState(false);
  const [accountCancelError, setAccountCancelError] = useState('');

  useEffect(() => {
    fetchBusiness();
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setSubscription({
        subscriptionStatus: data.subscriptionStatus ?? 'trial',
        trialEnds: data.trialEnds ?? null,
        subscriptionEnds: data.subscriptionEnds ?? null,
        hasStripeCustomer: data.hasStripeCustomer ?? false,
        stripeEnabled: data.stripeEnabled ?? false,
      });
    } catch {
      setSubscription(null);
    }
  };

  const handleSubscribe = async () => {
    setStripeError('');
    setStripeLoading('checkout');
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setStripeError(e instanceof Error ? e.message : 'Errore durante il checkout');
    } finally {
      setStripeLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setStripeError('');
    setStripeLoading('portal');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setStripeError(e instanceof Error ? e.message : 'Errore nell\'apertura del portale');
    } finally {
      setStripeLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Vuoi annullare l\'abbonamento? Avrai accesso fino alla scadenza del periodo già pagato e non ti verranno addebitati altri importi.')) return;
    setStripeError('');
    setCancelMessage('');
    setStripeLoading('cancel');
    try {
      const res = await fetch('/api/stripe/cancel-subscription', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore');
      setCancelMessage(data.message || 'Abbonamento annullato.');
      if (data.subscriptionEnds) {
        setSubscription((prev) =>
          prev
            ? {
                ...prev,
                subscriptionStatus: 'cancelled',
                subscriptionEnds: data.subscriptionEnds,
              }
            : null
        );
      }
    } catch (e) {
      setStripeError(e instanceof Error ? e.message : 'Errore durante la cancellazione');
    } finally {
      setStripeLoading(null);
    }
  };

  const handleCancelAccount = async () => {
    const msg =
      'Cancellando l\'account verranno annullati l\'abbonamento (nessun altro addebito) e eliminati tutti i tuoi dati. Questa azione è irreversibile. Continuare?';
    if (!confirm(msg)) return;
    setAccountCancelError('');
    setAccountCancelLoading(true);
    try {
      const res = await fetch('/api/account/cancel', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore');
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (e) {
      setAccountCancelError(e instanceof Error ? e.message : 'Errore durante la cancellazione');
    } finally {
      setAccountCancelLoading(false);
    }
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const fetchBusiness = async () => {
    try {
      const response = await fetch('/api/settings/business');
      const data = await response.json();
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await fetch('/api/settings/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business),
      });
      setMessage('Impostazioni salvate con successo!');
    } catch (error) {
      setMessage('Errore nel salvataggio delle impostazioni');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Impostazioni</h1>
        <p className="text-gray-600">Gestisci le impostazioni della tua attività</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Informazioni Attività
          </h2>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successo')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Attività
              </label>
              <input
                type="text"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <textarea
                value={business.description}
                onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={business.phone}
                onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo
              </label>
              <input
                type="text"
                value={business.address}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Pagina Prenotazioni
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={`${window.location.origin}/book/${business.bookingSlug}`}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
                <a
                  href={`/book/${business.bookingSlug}`}
                  target="_blank"
                  className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </form>
        </div>

        {/* Politica di Cancellazione */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Politica di Cancellazione
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ore minime per cancellazione
              </label>
              <input
                type="number"
                min="0"
                value={business.cancellationHours}
                onChange={(e) => setBusiness({ ...business, cancellationHours: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Numero di ore prima dell'appuntamento entro cui il cliente può cancellare
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Messaggio politica di cancellazione
              </label>
              <textarea
                value={business.cancellationPolicy}
                onChange={(e) => setBusiness({ ...business, cancellationPolicy: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Le cancellazioni devono essere effettuate almeno 24 ore prima dell'appuntamento."
              />
              <p className="text-sm text-gray-500 mt-1">
                Questo messaggio verrà mostrato ai clienti durante la prenotazione
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
            </button>
          </form>
        </div>

        {/* Abbonamento */}
        {subscription?.stripeEnabled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              Piano e fatturazione
            </h2>
            <p className="text-gray-600 mb-4">€9,99/mese · Gestisci il tuo abbonamento Stripe.</p>
            {stripeError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{stripeError}</div>
            )}
            {cancelMessage && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm">{cancelMessage}</div>
            )}
            {subscription.subscriptionStatus === 'active' && subscription.subscriptionEnds && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-gray-700">
                    <span className="font-medium text-emerald-600">Abbonamento attivo</span>
                    {' · Rinnovo il '}
                    {formatDate(subscription.subscriptionEnds)}
                  </p>
                  <button
                    type="button"
                    onClick={handleManageSubscription}
                    disabled={!!stripeLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {stripeLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Gestisci abbonamento
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={!!stripeLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {stripeLoading === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Cancella abbonamento
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Cancellando, non ti verranno addebitati altri importi; avrai accesso fino alla scadenza del periodo già pagato.
                </p>
              </div>
            )}
            {subscription.subscriptionStatus === 'cancelled' && subscription.subscriptionEnds && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-medium text-amber-800">Abbonamento in cancellazione</p>
                <p className="text-sm text-amber-700 mt-1">
                  Hai accesso fino al <strong>{formatDate(subscription.subscriptionEnds)}</strong>. Dopo quella data non ti verranno addebitati altri importi.
                </p>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={!!stripeLoading}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {stripeLoading === 'checkout' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Riabbonati
                </button>
              </div>
            )}
            {(subscription.subscriptionStatus === 'trial' || subscription.subscriptionStatus === 'expired') && (
              <div className="flex flex-wrap items-center gap-4">
                {subscription.subscriptionStatus === 'trial' && subscription.trialEnds && (
                  <p className="text-gray-700">
                    Periodo di prova fino al <strong>{formatDate(subscription.trialEnds)}</strong>
                  </p>
                )}
                {subscription.subscriptionStatus === 'expired' && (
                  <p className="text-gray-700 font-medium text-amber-600">Abbonamento scaduto</p>
                )}
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={!!stripeLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {stripeLoading === 'checkout' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {subscription.subscriptionStatus === 'trial' ? 'Abbonati a €9,99/mese' : 'Riabbonati'}
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              <Link href="/dashboard" className="text-primary-600 hover:underline">Torna alla Dashboard</Link>
              {' per una panoramica completa.'}
            </p>
          </div>
        )}

        {/* Impostazioni Email */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Conferme via Email
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invia conferma email ai clienti
                </label>
                <p className="text-sm text-gray-500">
                  I clienti riceveranno un'email di conferma quando prenotano
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBusiness({ ...business, sendEmailConfirmation: !business.sendEmailConfirmation })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  business.sendEmailConfirmation ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    business.sendEmailConfirmation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
            </button>
          </form>
        </div>

        {/* Cancella account */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Cancella account
          </h2>
          <p className="text-gray-600 mb-4">
            Chiudendo l&apos;account verrà annullato automaticamente l&apos;abbonamento (nessun altro addebito) e verranno eliminati tutti i dati (attività, prenotazioni, servizi, staff). Questa azione è irreversibile.
          </p>
          {accountCancelError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{accountCancelError}</div>
          )}
          <button
            type="button"
            onClick={handleCancelAccount}
            disabled={accountCancelLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {accountCancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Cancella il mio account
          </button>
        </div>
      </div>
    </div>
  );
}
