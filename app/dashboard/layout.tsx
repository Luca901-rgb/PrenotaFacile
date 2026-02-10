'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, Users, Briefcase, Clock, Settings, LogOut, LayoutDashboard, CreditCard, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [subscriptionState, setSubscriptionState] = useState<{
    stripeEnabled: boolean;
    subscriptionStatus: string;
    trialEnds: string | null;
    showSubscribeScreen: boolean;
  } | null>(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        const trialEnds = data.trialEnds ?? null;
        const subscriptionStatus = data.subscriptionStatus ?? 'trial';
        const stripeEnabled = data.stripeEnabled ?? false;
        const trialExpired = subscriptionStatus === 'trial' && trialEnds && new Date(trialEnds) < new Date();
        const notActive = subscriptionStatus === 'expired' || subscriptionStatus === 'cancelled';
        const showSubscribeScreen = stripeEnabled && (trialExpired || notActive);
        setSubscriptionState({
          stripeEnabled,
          subscriptionStatus,
          trialEnds,
          showSubscribeScreen,
        });
      })
      .catch(() => setSubscriptionState(null));
  }, [status]);

  const handleSubscribe = async () => {
    setSubscribeError(null);
    setSubscribeLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      const errMsg = [data.detail, data.error, data.hint].filter(Boolean).join(' — ') || 'Errore durante il checkout';
      setSubscribeError(errMsg);
    } catch {
      setSubscribeError('Errore di connessione');
    } finally {
      setSubscribeLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const menuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/calendar', icon: Calendar, label: 'Calendario' },
    { href: '/dashboard/services', icon: Briefcase, label: 'Servizi' },
    { href: '/dashboard/staff', icon: Users, label: 'Staff' },
    { href: '/dashboard/bookings', icon: Clock, label: 'Prenotazioni' },
    { href: '/dashboard/settings', icon: Settings, label: 'Impostazioni' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PrenotaFacile</span>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Esci</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Schermata "Abbonati" quando prova scaduta o abbonamento non attivo */}
        {subscriptionState?.showSubscribeScreen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
            <div className="mx-4 max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Abbonati per continuare
              </h1>
              <p className="text-gray-600 mb-6">
                Il tuo periodo di prova è terminato. Abbonati a €9,99/mese per continuare a usare PrenotaFacile e gestire le tue prenotazioni.
              </p>
              {subscribeError && (
                <p className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {subscribeError}
                </p>
              )}
              <button
                onClick={handleSubscribe}
                disabled={subscribeLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-lg transition disabled:opacity-50"
              >
                {subscribeLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Abbonati a €9,99/mese'
                )}
              </button>
              <p className="mt-4 text-sm text-gray-500">
                Pagamento sicuro con Stripe · Cancella quando vuoi
              </p>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
