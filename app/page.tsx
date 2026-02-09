import Link from 'next/link';
import { Calendar, Users, Clock, CheckCircle, Sparkles, Scissors, Heart, Dumbbell } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PrenotaFacile</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin" 
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Accedi
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                Inizia Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-primary-600 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">La soluzione per la tua attività</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Gestisci le tue <span className="text-gradient">prenotazioni</span> con un click
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                PrenotaFacile è la piattaforma SaaS che automatizza le prenotazioni per qualsiasi attività. 
                Risparmia tempo e fai crescere il tuo business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link 
                  href="/auth/signup" 
                  className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition transform hover:-translate-y-1 flex items-center space-x-2"
                >
                  <span>Prova Gratis per 14 Giorni</span>
                  <CheckCircle className="w-5 h-5" />
                </Link>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">€9.99</span>
                  <span className="text-sm text-gray-500">
                    /mese <span className="font-medium">dopo la prova</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-blue-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-900">Il Tuo Salone</p>
                        <p className="text-sm text-gray-500">Calendario prenotazioni</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-gray-700">10:00 - Taglio + Barba</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-700">11:30 - Colorazione</span>
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-gray-700">14:00 - Massaggio</span>
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Prenotazioni oggi</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 font-medium mb-6">Perfetto per</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: '💈', label: 'Barbieri', desc: 'Taglio e cura barba' },
              { icon: '💇', label: 'Parrucchieri', desc: 'Tagli e acconciature' },
              { icon: '💅', label: 'Centri Estetici', desc: 'Trattamenti viso/corpo' },
              { icon: '🏥', label: 'Studi Medici', desc: 'Medici e sanitari' },
              { icon: '🦷', label: 'Dentisti', desc: 'Cure odontoiatriche' },
              { icon: '🏃', label: 'Fisioterapisti', desc: 'Riabilitazione' },
              { icon: '🧠', label: 'Psicologi', desc: 'Consulenze psicologiche' },
              { icon: '💆', label: 'Centri Massaggi', desc: 'Benessere e relax' },
              { icon: '💪', label: 'Personal Trainer', desc: 'Allenamento personale' },
              { icon: '🧘', label: 'Yoga & Pilates', desc: 'Lezioni benessere' },
              { icon: '🐾', label: 'Veterinari', desc: 'Cure animali' },
              { icon: '🎨', label: 'Tatuatori', desc: 'Tatuaggi e piercing' },
            ].map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-300 transition group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition">{item.icon}</div>
                <div className="font-semibold text-gray-900 mb-1">{item.label}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8">
            <span className="font-medium">13 categorie</span> principali + <span className="font-medium">19 specializzazioni mediche</span>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tutto quello che ti serve</h2>
            <p className="text-xl text-gray-600">Una piattaforma completa per gestire prenotazioni, staff e clienti</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Calendario Intelligente',
                description: 'Gestisci tutte le prenotazioni in un unico calendario intuitivo e sincronizzato.'
              },
              {
                icon: Users,
                title: 'Gestione Team',
                description: 'Assegna appuntamenti al tuo team con calendari individuali per ogni operatore.'
              },
              {
                icon: Clock,
                title: 'Prenotazioni 24/7',
                description: 'I tuoi clienti possono prenotare online in qualsiasi momento, anche fuori orario.'
              },
              {
                icon: CheckCircle,
                title: 'Gestione Automatica',
                description: 'Gestisci le cancellazioni con un click e libera gli slot automaticamente.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Un prezzo semplice</h2>
            <p className="text-xl text-gray-600">Nessun costo nascosto. Tutto incluso.</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-primary-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">€9.99</span>
                <span className="text-xl text-gray-600 ml-2">/mese</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                'Prenotazioni illimitate',
                'Gestione staff completa',
                'Calendario avanzato',
                'Pagina pubblica prenotazioni',
                'Gestione servizi personalizzati',
                'Supporto via email'
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link 
              href="/auth/signup" 
              className="block w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white text-center px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition transform hover:-translate-y-1"
            >
              Inizia la Prova Gratuita
            </Link>
            <p className="text-center text-sm text-gray-500 mt-4">
              14 giorni gratuiti, poi €9.99/mese. Cancella quando vuoi.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PrenotaFacile</span>
            </div>
            <p className="text-gray-400">© 2024 PrenotaFacile. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
