'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addDays, setHours, setMinutes, isToday, isTomorrow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Business {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  cancellationPolicy: string | null;
  cancellationHours: number;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string | null;
}

interface Staff {
  id: string;
  name: string;
  role: string | null;
  color: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Form data - NUOVO ORDINE
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    fetchBusinessData();
  }, [slug]);

  // Quando cambia la data, carica staff disponibili
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableStaff();
    }
  }, [selectedDate]);

  // Quando cambia staff, carica servizi disponibili
  useEffect(() => {
    if (selectedStaff) {
      fetchAvailableServices();
    }
  }, [selectedStaff]);

  // Quando cambia servizio, carica time slots
  useEffect(() => {
    if (selectedStaff && selectedDate && selectedService) {
      fetchTimeSlots();
    }
  }, [selectedStaff, selectedDate, selectedService]);

  const fetchBusinessData = async () => {
    try {
      const response = await fetch(`/api/public/booking/${slug}`);
      const data = await response.json();
      setBusiness(data.business);
      setAllServices(data.services);
      setAllStaff(data.staff);
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStaff = async () => {
    // In questa versione semplificata, mostriamo tutto lo staff
    // In futuro si può filtrare per disponibilità reale
    setAvailableStaff(allStaff);
  };

  const fetchAvailableServices = async () => {
    // Mostra tutti i servizi (in futuro si può filtrare per staff)
    setAvailableServices(allServices);
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(
        `/api/public/booking/${slug}/timeslots?` +
        `date=${selectedDate.toISOString()}&` +
        `staffId=${selectedStaff}&` +
        `serviceId=${selectedService}`
      );
      const data = await response.json();
      setTimeSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const handleBooking = async () => {
    try {
      const response = await fetch(`/api/public/booking/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          staffId: selectedStaff,
          date: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`,
          client: clientData,
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);
      } else {
        alert('Errore nella prenotazione. Riprova.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Errore nella prenotazione. Riprova.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attività non trovata</h1>
          <p className="text-gray-600">Il link di prenotazione non è valido.</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Prenotazione Confermata!</h1>
          <p className="text-gray-600 mb-6">
            La tua prenotazione è stata confermata. Riceverai una conferma via email a {clientData.email || 'al tuo indirizzo'}.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">Riepilogo:</p>
            <p className="font-semibold text-gray-900">
              {allServices.find(s => s.id === selectedService)?.name}
            </p>
            <p className="text-gray-600">
              {format(selectedDate, 'dd MMMM yyyy', { locale: it })} alle {selectedTime}
            </p>
            <p className="text-gray-600">
              con {allStaff.find(s => s.id === selectedStaff)?.name}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 mb-1">Politica di Cancellazione</p>
                <p className="text-amber-700">{business.cancellationPolicy}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            Nuova Prenotazione
          </button>
        </div>
      </div>
    );
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Oggi';
    if (isTomorrow(date)) return 'Domani';
    return format(date, 'EEEE d MMM', { locale: it });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {business.name}
          </h1>
          {business.description && (
            <p className="text-gray-600 mb-4">{business.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {business.phone && (
              <span className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{business.phone}</span>
              </span>
            )}
            {business.address && (
              <span className="flex items-center space-x-2">
                <span>📍</span>
                <span>{business.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* Booking Steps */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: 'Data' },
              { num: 2, label: 'Operatore' },
              { num: 3, label: 'Servizio' },
              { num: 4, label: 'Conferma' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                      step >= s.num
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className="text-xs text-gray-600 mt-1 hidden md:block">{s.label}</span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Date */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quando vorresti venire?
              </h2>
              <p className="text-gray-600 mb-6">Seleziona la data che preferisci</p>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)).map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date);
                      setStep(2);
                    }}
                    className={`p-4 border-2 rounded-xl transition hover:shadow-md ${
                      format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-xs text-gray-600 mb-1">{getDateLabel(date)}</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {format(date, 'd')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(date, 'MMM', { locale: it })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Staff */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chi preferisci?
              </h2>
              <p className="text-gray-600 mb-6">
                Scegli l'operatore disponibile per {format(selectedDate, 'dd MMMM yyyy', { locale: it })}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {availableStaff.length === 0 ? (
                  <p className="col-span-2 text-center text-gray-600 py-8">
                    Nessun operatore disponibile per questa data
                  </p>
                ) : (
                  availableStaff.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedStaff(member.id);
                        setStep(3);
                      }}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition hover:shadow-lg ${
                        selectedStaff === member.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: member.color + '20' }}
                        >
                          <User className="w-6 h-6" style={{ color: member.color }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {member.name}
                          </h3>
                          {member.role && (
                            <p className="text-sm text-gray-600">{member.role}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedStaff('');
                }}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Cambia data
              </button>
            </div>
          )}

          {/* Step 3: Select Service */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cosa desideri?
              </h2>
              <p className="text-gray-600 mb-6">
                Scegli il servizio con {allStaff.find(s => s.id === selectedStaff)?.name}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {availableServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.id);
                      setStep(4);
                    }}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition hover:shadow-lg ${
                      selectedService === service.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {service.duration} min
                      </span>
                      <span className="text-xl font-bold text-primary-600">
                        €{service.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setStep(2);
                  setSelectedService('');
                }}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Cambia operatore
              </button>
            </div>
          )}

          {/* Step 4: Select Time & Client Info */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                A che ora?
              </h2>
              <p className="text-gray-600 mb-6">
                Seleziona l'orario disponibile per il {format(selectedDate, 'dd MMMM', { locale: it })}
              </p>

              {/* Time Selection */}
              <div className="mb-8">
                {timeSlots.length === 0 ? (
                  <p className="text-gray-600 text-center py-8 bg-gray-50 rounded-lg">
                    Nessun orario disponibile per questa data. Prova un altro giorno.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => {
                          if (slot.available) {
                            setSelectedTime(slot.time);
                          }
                        }}
                        disabled={!slot.available}
                        className={`p-3 border-2 rounded-lg transition font-medium ${
                          selectedTime === slot.time
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : slot.available
                            ? 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTime && (
                <>
                  <hr className="my-8" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    I tuoi dati
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Inserisci i tuoi dati per confermare la prenotazione
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleBooking();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome e Cognome *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientData.name}
                        onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Mario Rossi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientData.phone}
                        onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+39 333 1234567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email * <span className="text-xs text-gray-500">(per conferma prenotazione)</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={clientData.email}
                        onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="tua@email.com"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Riceverai la conferma di prenotazione via email
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (opzionale)
                      </label>
                      <textarea
                        value={clientData.notes}
                        onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                        placeholder="Eventuali richieste speciali..."
                      />
                    </div>

                    {/* Cancellation Policy Display */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-amber-900 mb-1">Politica di Cancellazione</p>
                          <p className="text-amber-700">{business.cancellationPolicy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(3);
                          setSelectedTime('');
                        }}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                      >
                        Indietro
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                      >
                        Conferma Prenotazione
                      </button>
                    </div>
                  </form>
                </>
              )}

              {!selectedTime && (
                <button
                  onClick={() => {
                    setStep(3);
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  ← Cambia servizio
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
