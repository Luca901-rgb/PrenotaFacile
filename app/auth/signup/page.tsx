'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Mail, Lock, ArrowLeft, Store, Phone } from 'lucide-react';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessType: 'barbershop',
    medicalSpecialization: '', // Nuovo campo per la specializzazione
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const businessTypes = [
    // Bellezza & Cura della Persona
    { value: 'barbershop', label: '💈 Barbiere' },
    { value: 'hair_salon', label: '💇 Parrucchiere' },
    { value: 'beauty_center', label: '💅 Centro Estetico' },
    { value: 'nail_salon', label: '💅 Nail Salon / Onicotecnica' },
    { value: 'tattoo_studio', label: '🎨 Studio Tatuaggi' },
    
    // Salute & Medicina
    { value: 'medical_studio', label: '🏥 Studio Medico / Sanitario', hasSubcategories: true },
    { value: 'veterinary', label: '🐾 Veterinario' },
    
    // Wellness & Fitness
    { value: 'massage_center', label: '💆 Centro Massaggi' },
    { value: 'wellness_center', label: '🧘 Centro Benessere / SPA' },
    { value: 'personal_trainer', label: '💪 Personal Trainer' },
    { value: 'yoga_studio', label: '🧘 Studio Yoga / Pilates' },
    
    // Servizi Creativi
    { value: 'makeup_artist', label: '💄 Makeup Artist' },
    
    { value: 'other', label: '📋 Altro' },
  ];

  const medicalSpecializations = [
    // Specializzazioni Mediche Generali
    { value: 'general_practitioner', label: 'Medico di Base / Medicina Generale' },
    { value: 'cardiologist', label: 'Cardiologo' },
    { value: 'dermatologist', label: 'Dermatologo' },
    { value: 'endocrinologist', label: 'Endocrinologo' },
    { value: 'gastroenterologist', label: 'Gastroenterologo' },
    { value: 'gynecologist', label: 'Ginecologo' },
    { value: 'neurologist', label: 'Neurologo' },
    { value: 'ophthalmologist', label: 'Oculista' },
    { value: 'orthopedist', label: 'Ortopedico' },
    { value: 'otolaryngologist', label: 'Otorinolaringoiatra' },
    { value: 'pediatrician', label: 'Pediatra' },
    { value: 'psychiatrist', label: 'Psichiatra' },
    { value: 'urologist', label: 'Urologo' },
    
    // Professionisti Sanitari (ora sotto Studio Medico)
    { value: 'dentist', label: '🦷 Dentista / Odontoiatra' },
    { value: 'physiotherapist', label: '🏃 Fisioterapista' },
    { value: 'osteopath', label: '💆 Osteopata' },
    { value: 'psychologist', label: '🧠 Psicologo / Psicoterapeuta' },
    { value: 'nutritionist', label: '🥗 Nutrizionista / Dietologo' },
    
    { value: 'other_medical', label: 'Altra Specializzazione Medica' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la registrazione');
      }

      router.push('/auth/signin?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla home
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inizia gratis</h1>
            <p className="text-gray-600">14 giorni di prova, poi solo €9.99/mese</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Attività
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="La mia attività"
                />
              </div>
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di Attività
              </label>
              <select
                id="businessType"
                value={formData.businessType}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  businessType: e.target.value,
                  medicalSpecialization: '' // Reset specialization when changing type
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Attività che lavorano su appuntamento fisso
              </p>
            </div>

            {/* Medical Specialization - Show only if Studio Medico is selected */}
            {formData.businessType === 'medical_studio' && (
              <div className="animate-fadeIn">
                <label htmlFor="medicalSpecialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Specializzazione Sanitaria *
                </label>
                <select
                  id="medicalSpecialization"
                  value={formData.medicalSpecialization}
                  onChange={(e) => setFormData({ ...formData, medicalSpecialization: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleziona la tua specializzazione...</option>
                  {medicalSpecializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Medici, dentisti, fisioterapisti, psicologi e altri professionisti sanitari
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="tua@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimo 6 caratteri</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrazione in corso...' : 'Inizia la Prova Gratuita'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Hai già un account?{' '}
              <Link href="/auth/signin" className="text-primary-600 font-semibold hover:text-primary-700">
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
