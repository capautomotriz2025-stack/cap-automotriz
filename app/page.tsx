import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  Target,
  Zap,
  Award,
  ArrowRight,
  CheckCircle2,
  Gauge,
  TrendingUp,
  Bot,
  Shield
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cap-gray-darkest via-cap-gray-dark to-cap-gray-darkest">
      {/* Navigation */}
      <nav className="border-b border-cap-red/30 bg-cap-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo CAP */}
            <div className="flex items-center gap-3">
              <img 
                src="/uploads/login.jpeg" 
                alt="CAP Logo" 
                className="w-12 h-12 object-contain rounded-full shadow-racing" 
              />
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  CAP <span className="text-cap-red">RECRUITMENT</span>
                </h1>
                <p className="text-xs text-cap-gray uppercase tracking-widest font-bold">
                  Grupo Automotriz
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-4">
              <a href="#features" className="text-cap-gray-lightest hover:text-cap-red transition-colors font-semibold">
                Características
              </a>
              <a href="#stats" className="text-cap-gray-lightest hover:text-cap-red transition-colors font-semibold">
                Estadísticas
              </a>
              <Link href="/vacancies">
                <Button variant="outline" className="border-cap-red text-cap-red hover:bg-cap-red hover:text-white">
                  Ver Vacantes
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-racing-gradient hover:scale-105 transition-transform shadow-racing">
                  Acceso Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Racing stripes background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cap-red to-transparent transform -skew-y-6"></div>
        </div>

        <div className="container mx-auto px-4 py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block mb-4">
                <span className="bg-racing-gradient text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-racing">
                  <Zap className="inline w-4 h-4 mr-2" />
                  Potenciado por IA
                </span>
              </div>
              
              <h1 className="text-6xl font-black text-white mb-6 leading-tight">
                Acelera tu
                <span className="block text-cap-red">Reclutamiento</span>
              </h1>
              
              <p className="text-xl text-cap-gray-lightest mb-8 leading-relaxed">
                Sistema de reclutamiento automatizado con inteligencia artificial. 
                <span className="text-cap-red font-bold"> Velocidad. Precisión. Resultados.</span>
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/vacancies">
                  <Button size="lg" className="bg-racing-gradient hover:scale-105 transition-transform shadow-racing-lg text-lg px-8">
                    Ver Vacantes
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-2 border-cap-red text-cap-red hover:bg-cap-red hover:text-white text-lg px-8 font-bold">
                    Dashboard
                  </Button>
                </Link>
              </div>

              {/* Features list */}
              <div className="grid grid-cols-2 gap-4">
                {['Análisis con IA', 'Filtrado Inteligente', 'Dashboard Kanban', 'Reportes Automáticos'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cap-red flex-shrink-0" />
                    <span className="text-cap-gray-lightest font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, value: '10K+', label: 'Candidatos Analizados', color: 'red' },
                { icon: Briefcase, value: '500+', label: 'Vacantes Activas', color: 'gray' },
                { icon: Target, value: '95%', label: 'Precisión IA', color: 'red' },
                { icon: TrendingUp, value: '3x', label: 'Más Rápido', color: 'gray' },
              ].map((stat, idx) => (
                <Card key={idx} className="bg-cap-gray-dark/80 border-cap-gray backdrop-blur-sm hover:border-cap-red transition-all hover:scale-105">
                  <CardContent className="p-6">
                    <stat.icon className={`w-10 h-10 mb-4 ${stat.color === 'red' ? 'text-cap-red' : 'text-cap-gray-light'}`} />
                    <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-sm text-cap-gray-light font-semibold">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-cap-black/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Sistema de <span className="text-cap-red">Alta Performance</span>
            </h2>
            <div className="w-24 h-1 bg-racing-gradient mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Análisis Instantáneo',
                description: 'IA analiza CVs en segundos y asigna puntuación automática',
              },
              {
                icon: Target,
                title: 'Precisión Máxima',
                description: 'Algoritmos especializados por rol y sector automotriz',
              },
              {
                icon: Award,
                title: 'Mejor Talento',
                description: 'Identifica candidatos ideales con scoring inteligente',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="bg-dark-gradient border-cap-gray hover:border-cap-red transition-all group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-racing-gradient rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-racing">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-cap-gray-light">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 bg-cap-gray-dark/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Gauge, value: '85%', label: 'Tiempo Ahorrado', color: 'text-cap-red' },
              { icon: Shield, value: '95%', label: 'Precisión IA', color: 'text-cap-red' },
              { icon: TrendingUp, value: '3x', label: 'Más Candidatos', color: 'text-cap-red' },
              { icon: Bot, value: '24/7', label: 'Disponibilidad', color: 'text-cap-red' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="w-20 h-20 bg-racing-gradient rounded-xl flex items-center justify-center mx-auto shadow-racing-lg">
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className={`text-5xl font-black ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-cap-gray-lightest font-semibold text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-racing-gradient opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-5xl font-black text-white mb-6">
            ¿Listo para <span className="text-cap-red">Acelerar?</span>
          </h2>
          <p className="text-xl text-cap-gray-lightest mb-8">
            Únete a CAP Grupo Automotriz y lleva tu carrera al siguiente nivel
          </p>
          <Link href="/vacancies">
            <Button size="lg" className="bg-racing-gradient hover:scale-110 transition-transform shadow-racing-lg text-xl px-12 py-6">
              Ver Oportunidades
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cap-black border-t border-cap-gray-dark py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src="/uploads/login.jpeg" alt="CAP Logo" className="w-12 h-12 object-contain rounded-full shadow-racing" />
              <div>
                <div className="text-white font-black">CAP RECRUITMENT</div>
                <div className="text-xs text-cap-gray uppercase">Grupo Automotriz</div>
              </div>
            </div>
            <div className="text-cap-gray text-sm font-semibold">
              © 2025 CAP Grupo Automotriz. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
