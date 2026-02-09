'use client';

import { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  endTime: string;
  status: string;
  client: { name: string; phone: string };
  staff: { name: string; color: string };
  service: { name: string };
}

export default function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [currentWeek]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return isSameDay(bookingDate, day) && booking.status !== 'cancelled';
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendario</h1>
          <p className="text-gray-600">Visualizza tutte le prenotazioni della settimana</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Oggi
          </button>
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header with days */}
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-4 bg-gray-50"></div>
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-4 text-center ${
                      isSameDay(day, new Date()) ? 'bg-primary-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-sm text-gray-600">
                      {format(day, 'EEE', { locale: it })}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        isSameDay(day, new Date())
                          ? 'text-primary-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-8 border-b border-gray-100"
                    style={{ minHeight: '80px' }}
                  >
                    <div className="p-4 bg-gray-50 text-sm text-gray-600 font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {weekDays.map((day) => {
                      const dayBookings = getBookingsForDay(day);
                      const hourBookings = dayBookings.filter(booking => {
                        const bookingHour = new Date(booking.date).getHours();
                        return bookingHour === hour;
                      });

                      return (
                        <div
                          key={day.toISOString()}
                          className="p-2 border-l border-gray-100 relative"
                        >
                          {hourBookings.map(booking => {
                            const startMinute = new Date(booking.date).getMinutes();
                            return (
                              <div
                                key={booking.id}
                                className="rounded-lg p-2 mb-1 text-xs shadow-sm hover:shadow-md transition cursor-pointer"
                                style={{
                                  backgroundColor: booking.staff.color + '20',
                                  borderLeft: `3px solid ${booking.staff.color}`,
                                }}
                              >
                                <div className="font-semibold text-gray-900">
                                  {format(new Date(booking.date), 'HH:mm')}
                                </div>
                                <div className="text-gray-700">
                                  {booking.service.name}
                                </div>
                                <div className="text-gray-600">
                                  {booking.client.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
