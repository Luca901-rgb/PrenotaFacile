'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, Users, Briefcase, Clock, TrendingUp, ExternalLink, CreditCard, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalStaff: 0,
    totalServices: 0,
    weekBookings: 0,
    bookingSlug: '',
    subscriptionStatus: 'trial' as string,
    trialEnds: null as string | null,
    subscriptionEnds: null as string | null,
    hasStripeCustomer: false,
    stripeEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState<'checkout' | 'portal' | null>(null);
  const [stripeError, setStripeError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const subscriptionSuccess = searchParams.get('subscription') === 'success';
  const subscriptionCancelled = searchParams.get('subscription') === 'cancelled';

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const statCards = [
    {
      title: 'Prenotazioni Oggi',
      value: stats.todayBookings,
      icon: Calendar,
      color: 'bg-blue-500',
      href: '/dashboard/bookings',
    },
    {
      title: 'Prenotazioni Settimana',
      value: stats.weekBookings,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/dashboard/calendar',
    },
    {
      title: 'Staff Attivo',
      value: stats.totalStaff,
      icon: Users,
      color: 'bg-purple-500',
      href: '/dashboard/staff',
    },
    {
      title: 'Servizi Disponibili',
      value: stats.totalServices,
      icon: Briefcase,
      color: 'bg-orange-500',
      href: '/dashboard/services',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Benvenuto, {session?.user?.name}!
        </h1>
        <p className="text-gray-600">
          Ecco una panoramica della tua attività
        </p>
        {subscriptionSuccess && (
          <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
            Abbonamento attivato con successo. Grazie!
          </div>
        )}
        {subscriptionCancelled && (
          <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            Checkout annullato. Puoi abbonarti quando vuoi dalla sezione Piano qui sotto.
          </div>
        )}
      </div>

      {/* Public Booking Link */}
      {stats.bookingSlug && (
        <div className="mb-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-2">La tua pagina di prenotazioni pubblica</h2>
          <p className="text-sm text-white/90 mb-4">
            Condividi questo link con i tuoi clienti per ricevere prenotazioni online
          </p>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 backdrop-blur-sm">
              <code className="text-white font-mono text-sm">
                {window.location.origin}/book/{stats.bookingSlug}
              </code>
            </div>
            <Link
              href={`/book/${stats.bookingSlug}`}
              target="_blank"
              className="flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Apri</span>
            </Link>
          </div>
        </div>
      )}

      {/* Abbonamento Stripe */}
      {stats.stripeEnabled && (
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Piano PrenotaFacile</h2>
              <p className="text-sm text-gray-600">€9,99/mese · 14 giorni di prova gratuita</p>
            </div>
          </div>
          {stripeError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{stripeError}</div>
          )}
          {stats.subscriptionStatus === 'active' && stats.subscriptionEnds && (
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-gray-700">
                <span className="font-medium text-emerald-600">Abbonamento attivo</span>
                {' · Rinnovo il '}
                {formatDate(stats.subscriptionEnds)}
              </p>
              <button
                onClick={handleManageSubscription}
                disabled={!!stripeLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition disabled:opacity-50"
              >
                {stripeLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Gestisci abbonamento
              </button>
            </div>
          )}
          {(stats.subscriptionStatus === 'trial' || stats.subscriptionStatus === 'expired' || stats.subscriptionStatus === 'cancelled') && (
            <div className="flex flex-wrap items-center gap-4">
              {stats.subscriptionStatus === 'trial' && stats.trialEnds && (
                <p className="text-gray-700">
                  Periodo di prova fino al <strong>{formatDate(stats.trialEnds)}</strong>
                </p>
              )}
              {(stats.subscriptionStatus === 'expired' || stats.subscriptionStatus === 'cancelled') && (
                <p className="text-gray-700">
                  <span className="font-medium text-amber-600">Abbonamento non attivo</span>
                  {' · '}
                  Riabbonati per continuare a usare tutte le funzioni.
                </p>
              )}
              <button
                onClick={handleSubscribe}
                disabled={!!stripeLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {stripeLoading === 'checkout' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {stats.subscriptionStatus === 'trial' ? 'Abbonati a €9,99/mese' : 'Riabbonati'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/bookings"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition group"
          >
            <Clock className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
            <div>
              <p className="font-semibold text-gray-900">Nuova Prenotazione</p>
              <p className="text-sm text-gray-600">Crea un nuovo appuntamento</p>
            </div>
          </Link>
          <Link
            href="/dashboard/services"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition group"
          >
            <Briefcase className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
            <div>
              <p className="font-semibold text-gray-900">Aggiungi Servizio</p>
              <p className="text-sm text-gray-600">Crea un nuovo servizio</p>
            </div>
          </Link>
          <Link
            href="/dashboard/staff"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition group"
          >
            <Users className="w-6 h-6 text-gray-600 group-hover:text-primary-600" />
            <div>
              <p className="font-semibold text-gray-900">Aggiungi Staff</p>
              <p className="text-sm text-gray-600">Aggiungi un operatore</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
