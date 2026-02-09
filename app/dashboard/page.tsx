'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, Briefcase, Clock, TrendingUp, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalStaff: 0,
    totalServices: 0,
    weekBookings: 0,
    bookingSlug: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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
