'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase,
  Plus,
  ArrowRight,
  Target,
  Users,
  Bot,
  BarChart3,
  AlertCircle
} from 'lucide-react';

export default function InicioPage() {
  const [loading, setLoading] = useState(true);
  const [activeVacancies, setActiveVacancies] = useState<any[]>([]);

  useEffect(() => {
    fetchActiveVacancies();
  }, []);

  const fetchActiveVacancies = async () => {
    try {
      const response = await axios.get('/api/vacancies');
      if (response.data.success) {
        // Filtrar vacantes en proceso (published o draft)
        const active = response.data.data.filter((v: any) => 
          v.status === 'published' || v.status === 'draft'
        );
        setActiveVacancies(active.slice(0, 5)); // Top 5
      }
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cap-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Inicio CAP</h1>
          <p className="text-cap-gray-lightest mt-2 text-lg font-semibold">
            Bienvenido a tu panel de reclutamiento inteligente
          </p>
        </div>
      </div>

      {/* Main Grid - Acciones Rápidas y Procesos en Curso */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Acciones Rápidas - 2 columnas */}
        <Card className="lg:col-span-2 border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-white">Acciones Rápidas</CardTitle>
                <CardDescription className="text-base mt-1 text-cap-gray-lightest font-semibold">
                  Accede a las funciones principales del sistema
                </CardDescription>
              </div>
              <BarChart3 className="h-8 w-8 text-cap-red" />
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Link href="/dashboard/vacancies/new">
              <div className="group p-6 border-2 border-cap-gray rounded-xl hover:border-cap-red hover:bg-cap-black transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-racing-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-racing">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">Crear Vacante</h3>
                    <p className="text-sm text-cap-gray-lightest font-semibold">
                      Publica una nueva posición con IA
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cap-gray group-hover:text-cap-red group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <Link href="/dashboard/kanban">
              <div className="group p-6 border-2 border-cap-gray rounded-xl hover:border-cap-red hover:bg-cap-black transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cap-gray rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-cap-gray-lightest" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">Tablero Kanban</h3>
                    <p className="text-sm text-cap-gray-lightest font-semibold">
                      Gestiona candidatos visualmente
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cap-gray group-hover:text-cap-red group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <Link href="/dashboard/candidates">
              <div className="group p-6 border-2 border-cap-gray rounded-xl hover:border-cap-red hover:bg-cap-black transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-racing-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-racing">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">Ver Candidatos</h3>
                    <p className="text-sm text-cap-gray-lightest font-semibold">
                      Revisa todos los postulantes
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cap-gray group-hover:text-cap-red group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <Link href="/dashboard/vacancies">
              <div className="group p-6 border-2 border-cap-gray rounded-xl hover:border-cap-red hover:bg-cap-black transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cap-gray rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="h-6 w-6 text-cap-gray-lightest" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">Gestionar Vacantes</h3>
                    <p className="text-sm text-cap-gray-lightest font-semibold">
                      Administra tus posiciones
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cap-gray group-hover:text-cap-red group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <Link href="/dashboard/ai-agents">
              <div className="group p-6 border-2 border-cap-gray rounded-xl hover:border-cap-red hover:bg-cap-black transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-racing-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-racing">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-white">Agentes de IA</h3>
                    <p className="text-sm text-cap-gray-lightest font-semibold">
                      Configura evaluaciones
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cap-gray group-hover:text-cap-red group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Procesos en Curso - 1 columna */}
        <Link href="/dashboard/vacancies?filter=active">
          <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing transition-all cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-xl font-black text-white">Procesos en Curso</CardTitle>
              <CardDescription className="text-cap-gray-lightest font-semibold">
                Vacantes actualmente en proceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeVacancies.length === 0 ? (
                <div className="text-center py-8 text-cap-gray">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-cap-gray" />
                  <p className="text-sm font-semibold">No hay procesos en curso</p>
                </div>
              ) : (
                activeVacancies.map((vacancy) => (
                  <div key={vacancy._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-cap-black transition-colors">
                    <div className="w-10 h-10 bg-racing-gradient rounded-full flex items-center justify-center text-white font-black shadow-racing">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-white">{vacancy.title || 'Sin título'}</p>
                      <p className="text-xs text-cap-gray truncate font-semibold">
                        {vacancy.department || 'Sin departamento'}
                      </p>
                    </div>
                    <Badge className={`font-black ${
                      vacancy.status === 'published' 
                        ? 'bg-cap-red/20 text-cap-red border border-cap-red/30' 
                        : 'bg-racing-gradient text-white shadow-racing'
                    }`}>
                      {vacancy.status === 'published' ? 'Publicada' : 'Borrador'}
                    </Badge>
                  </div>
                ))
              )}
              {activeVacancies.length > 0 && (
                <div className="pt-2 border-t border-cap-gray">
                  <div className="flex items-center justify-center text-cap-red font-bold text-sm hover:underline">
                    Ver todas las vacantes en proceso
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
