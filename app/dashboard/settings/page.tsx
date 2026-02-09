'use client';

import { useEffect, useState } from 'react';
import { Save, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
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

  useEffect(() => {
    fetchBusiness();
  }, []);

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
      </div>
    </div>
  );
}
