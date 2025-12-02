'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock,
  Search,
  ArrowRight,
  Zap,
  Filter,
  ChevronRight,
  Target,
  TrendingUp,
  Building2,
  Gauge
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PublicVacanciesPage() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [filteredVacancies, setFilteredVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVacancies();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = vacancies.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVacancies(filtered);
    } else {
      setFilteredVacancies(vacancies);
    }
  }, [searchTerm, vacancies]);

  const fetchVacancies = async () => {
    try {
      const response = await axios.get('/api/vacancies?status=published');
      if (response.data.success) {
        setVacancies(response.data.data);
        setFilteredVacancies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cap-gray-darkest to-cap-gray-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cap-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cap-gray-darkest via-cap-gray-dark to-cap-gray-darkest">
      {/* Navigation CAP */}
      <nav className="bg-cap-black/50 border-b border-cap-red/30 shadow-racing backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/uploads/login.jpeg" 
                alt="CAP Logo" 
                className="w-12 h-12 object-contain rounded-full shadow-racing group-hover:scale-105 transition-transform" 
              />
              <div>
                <span className="text-2xl font-black text-white">CAP <span className="text-cap-red">RECRUIT</span></span>
                <p className="text-xs text-cap-gray uppercase tracking-widest font-bold">Grupo Automotriz</p>
              </div>
            </Link>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="ghost" className="text-cap-gray-lightest hover:text-white font-bold">Inicio</Button>
              </Link>
              <Link href="/login">
                <Button className="bg-racing-gradient hover:scale-105 transition-transform shadow-racing font-bold">Panel Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section CAP Racing */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cap-black to-cap-gray-dark text-white">
        {/* Racing stripes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cap-red to-transparent transform -skew-y-6"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-racing-gradient text-white hover:bg-racing-gradient border-none backdrop-blur-sm shadow-racing font-bold">
              <Zap className="w-3 h-3 mr-1" />
              {filteredVacancies.length} Oportunidades Disponibles
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              Encuentra tu
              <span className="block mt-2 text-cap-red">
                Carrera Ideal
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-cap-gray-lightest max-w-2xl mx-auto font-semibold">
              Explora oportunidades en CAP Grupo Automotriz con análisis de IA
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto pt-6">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cap-gray" />
                <Input
                  placeholder="Buscar por puesto, departamento, ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14 pr-5 h-16 text-lg bg-cap-gray-dark border-cap-gray focus:border-cap-red shadow-racing-lg text-white placeholder:text-cap-gray font-semibold"
                />
                <Button 
                  size="lg"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-racing-gradient hover:scale-105 transition-transform shadow-racing font-bold"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section CAP */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 border-cap-red/30 bg-cap-gray-dark/80 backdrop-blur-sm shadow-racing-xl hover:scale-105 transition-transform">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-racing-gradient rounded-xl flex items-center justify-center mx-auto mb-3 shadow-racing">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-black text-cap-red mb-1">
                {filteredVacancies.length}
              </div>
              <p className="text-sm text-cap-gray-lightest font-bold">Vacantes Activas</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm shadow-racing-xl hover:scale-105 transition-transform">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-cap-gray rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-cap-gray-lightest" />
              </div>
              <div className="text-4xl font-black text-white mb-1">
                {new Set(filteredVacancies.map(v => v.department)).size}
              </div>
              <p className="text-sm text-cap-gray-lightest font-bold">Departamentos</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cap-red/30 bg-cap-gray-dark/80 backdrop-blur-sm shadow-racing-xl hover:scale-105 transition-transform">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-racing-gradient rounded-xl flex items-center justify-center mx-auto mb-3 shadow-racing">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-black text-cap-red mb-1">
                24h
              </div>
              <p className="text-sm text-cap-gray-lightest font-bold">Respuesta Promedio</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm shadow-racing-xl hover:scale-105 transition-transform">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-cap-gray rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-cap-gray-lightest" />
              </div>
              <div className="text-4xl font-black text-white mb-1">
                95%
              </div>
              <p className="text-sm text-cap-gray-lightest font-bold">Tasa de Match IA</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Vacancies Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              {searchTerm ? 'Resultados de Búsqueda' : 'Todas las Oportunidades'}
            </h2>
            <p className="text-cap-gray-lightest font-semibold">
              {filteredVacancies.length} {filteredVacancies.length === 1 ? 'vacante' : 'vacantes'} {searchTerm && `para "${searchTerm}"`}
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex border-cap-gray text-cap-gray-lightest hover:border-cap-red hover:text-cap-red font-bold">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Vacancies Grid */}
        {filteredVacancies.length === 0 ? (
          <Card className="max-w-2xl mx-auto border-2 border-cap-gray bg-cap-gray-dark/80">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-cap-gray-dark rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-cap-gray" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                No se encontraron vacantes
              </h3>
              <p className="text-cap-gray-lightest mb-6 font-semibold">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Vuelve pronto para ver nuevas oportunidades'}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} className="bg-racing-gradient hover:scale-105 transition-transform font-bold">
                  Limpiar Búsqueda
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.map((vacancy) => (
              <Card 
                key={vacancy._id} 
                className="group border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing-xl hover:border-cap-red transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-racing-gradient text-white hover:bg-racing-gradient font-bold shadow-racing">
                      <Zap className="w-3 h-3 mr-1" />
                      Activa
                    </Badge>
                    <Badge variant="outline" className="capitalize border-2 border-cap-gray text-cap-gray-lightest font-bold">
                      {vacancy.employmentType === 'full-time' && 'Tiempo Completo'}
                      {vacancy.employmentType === 'part-time' && 'Medio Tiempo'}
                      {vacancy.employmentType === 'contract' && 'Contrato'}
                      {vacancy.employmentType === 'internship' && 'Prácticas'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight group-hover:text-cap-red transition-colors font-black text-white">
                    {vacancy.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className="w-4 h-4 text-cap-gray" />
                    <CardDescription className="text-base font-bold text-cap-gray-lightest">
                      {vacancy.department}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center text-sm text-cap-gray-lightest">
                      <div className="w-8 h-8 bg-cap-black rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="w-4 h-4 text-cap-gray" />
                      </div>
                      <span className="font-bold">{vacancy.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-cap-gray-lightest">
                      <div className="w-8 h-8 bg-racing-gradient/20 rounded-lg flex items-center justify-center mr-3">
                        <DollarSign className="w-4 h-4 text-cap-red" />
                      </div>
                      <span className="font-bold">
                        {formatCurrency(vacancy.salary.min)} - {formatCurrency(vacancy.salary.max)}
                      </span>
                    </div>
                    {vacancy.experienceYears > 0 && (
                      <div className="flex items-center text-sm text-cap-gray-lightest">
                        <div className="w-8 h-8 bg-cap-black rounded-lg flex items-center justify-center mr-3">
                          <Clock className="w-4 h-4 text-cap-gray" />
                        </div>
                        <span className="font-bold">{vacancy.experienceYears} años de experiencia</span>
                      </div>
                    )}
                  </div>

                  {vacancy.requiredSkills && vacancy.requiredSkills.length > 0 && (
                    <div className="pt-3 border-t border-cap-gray">
                      <div className="flex flex-wrap gap-2 min-h-[28px]">
                        {vacancy.requiredSkills.slice(0, 3).map((skill: string, i: number) => (
                          <Badge key={i} className="text-xs font-bold bg-cap-black text-cap-gray-lightest border border-cap-gray">
                            {skill}
                          </Badge>
                        ))}
                        {vacancy.requiredSkills.length > 3 && (
                          <Badge className="text-xs font-bold bg-cap-red/20 text-cap-red border border-cap-red/30">
                            +{vacancy.requiredSkills.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-auto">
                    <Link href={`/apply/${vacancy._id}`}>
                      <Button className="w-full bg-racing-gradient hover:scale-105 transition-transform shadow-racing-lg h-12 text-base font-black">
                        Postularme Ahora
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner CAP */}
      <section className="bg-racing-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform skew-y-3"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center text-white space-y-6">
            <h2 className="text-4xl md:text-5xl font-black">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-xl text-white/90 font-semibold">
              Déjanos tu CV y te notificaremos cuando haya nuevas oportunidades que coincidan con tu perfil
            </p>
            <Button size="lg" className="bg-white text-cap-red hover:scale-110 transition-transform text-lg h-14 px-8 font-black shadow-racing-xl">
              Subir mi CV
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer CAP */}
      <footer className="bg-cap-black border-t border-cap-red/20 text-cap-gray py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/uploads/login.jpeg" alt="CAP Logo" className="w-12 h-12 object-contain rounded-full shadow-racing" />
                <div>
                  <span className="text-xl font-black text-white">CAP RECRUIT</span>
                  <p className="text-xs text-cap-gray uppercase">Grupo Automotriz</p>
                </div>
              </div>
              <p className="text-sm font-semibold">
                Encuentra tu próximo trabajo con inteligencia artificial
              </p>
            </div>

            <div>
              <h3 className="text-white font-black mb-4">Para Candidatos</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li><Link href="/vacancies" className="hover:text-cap-red transition-colors">Ver Vacantes</Link></li>
                <li><Link href="/#" className="hover:text-cap-red transition-colors">Subir CV</Link></li>
                <li><Link href="/#" className="hover:text-cap-red transition-colors">Mis Aplicaciones</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black mb-4">Para Empresas</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li><Link href="/login" className="hover:text-cap-red transition-colors">Dashboard</Link></li>
                <li><Link href="/#" className="hover:text-cap-red transition-colors">Publicar Vacante</Link></li>
                <li><Link href="/#" className="hover:text-cap-red transition-colors">Ver Candidatos</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black mb-4">Legal</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li><Link href="/#" className="hover:text-cap-red transition-colors">Privacidad</Link></li>
                <li><Link href="/#" className="hover:text-cap-red transition-colors">Términos</Link></li>
                <li><Link href="/#" className="hover:text-cap-red transition-colors">Contacto</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-cap-gray-dark pt-8 text-center text-sm">
            <p className="font-semibold">© 2025 CAP Grupo Automotriz. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
