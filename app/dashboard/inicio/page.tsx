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
  AlertCircle,
  FileText,
  Download,
  Eye
} from 'lucide-react';

export default function InicioPage() {
  const [loading, setLoading] = useState(true);
  const [activeVacancies, setActiveVacancies] = useState<any[]>([]);
  const [candidatesByProcess, setCandidatesByProcess] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchActiveVacancies();
    fetchCandidatesByProcess();
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

  const fetchCandidatesByProcess = async () => {
    try {
      const [candidatesRes, vacanciesRes] = await Promise.all([
        axios.get('/api/candidates'),
        axios.get('/api/vacancies')
      ]);

      if (candidatesRes.data.success && vacanciesRes.data.success) {
        const candidates = candidatesRes.data.data;
        const vacancies = vacanciesRes.data.data;
        
        // Crear un mapa de vacantes por ID
        const vacancyMap = new Map();
        vacancies.forEach((v: any) => {
          vacancyMap.set(v._id, v);
        });

        // Agrupar candidatos por proceso (vacante)
        const grouped: Record<string, any[]> = {};
        
        candidates.forEach((candidate: any) => {
          const vacancyId = candidate.vacancyId?._id || candidate.vacancyId;
          const vacancy = vacancyMap.get(vacancyId?.toString());
          
          if (vacancy) {
            const processKey = vacancy.title || 'Proceso sin título';
            if (!grouped[processKey]) {
              grouped[processKey] = [];
            }
            grouped[processKey].push({
              ...candidate,
              vacancyTitle: vacancy.title,
              vacancyDepartment: vacancy.department
            });
          }
        });

        setCandidatesByProcess(grouped);
      }
    } catch (error) {
      console.error('Error fetching candidates by process:', error);
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

      {/* Card de CVs por Proceso */}
      <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-white">CVs por Proceso de Reclutamiento</CardTitle>
              <CardDescription className="text-base mt-1 text-cap-gray-lightest font-semibold">
                Todos los CVs de candidatos clasificados por proceso
              </CardDescription>
            </div>
            <FileText className="h-8 w-8 text-cap-red" />
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(candidatesByProcess).length === 0 ? (
            <div className="text-center py-12 text-cap-gray">
              <FileText className="h-12 w-12 mx-auto mb-4 text-cap-gray" />
              <p className="text-sm font-semibold">No hay CVs registrados aún</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(candidatesByProcess).map(([processName, candidates]) => (
                <div key={processName} className="border-2 border-cap-gray rounded-lg p-4 bg-cap-black/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{processName}</h3>
                      <p className="text-sm text-cap-gray-lightest font-semibold">
                        {candidates[0]?.vacancyDepartment || 'Sin departamento'} • {candidates.length} candidato{candidates.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge className="bg-racing-gradient text-white shadow-racing font-bold">
                      {candidates.length}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {candidates.map((candidate) => (
                      <div 
                        key={candidate._id} 
                        className="p-3 border border-cap-gray rounded-lg bg-cap-gray-dark/50 hover:bg-cap-gray-dark hover:border-cap-red transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{candidate.fullName}</p>
                            <p className="text-xs text-cap-gray-lightest font-semibold truncate">{candidate.email}</p>
                          </div>
                          <Badge className={`ml-2 flex-shrink-0 ${
                            candidate.aiClassification === 'ideal' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : candidate.aiClassification === 'potencial'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {candidate.aiScore || 0}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          {candidate.cvUrl && (
                            <>
                              <a
                                href={candidate.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-cap-red hover:text-cap-red-dark font-bold transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Ver CV
                              </a>
                              <a
                                href={candidate.cvUrl}
                                download
                                className="flex items-center gap-1.5 text-xs text-cap-gray-lightest hover:text-white font-semibold transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Descargar
                              </a>
                            </>
                          )}
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-cap-gray text-cap-gray-lightest font-semibold">
                            {candidate.status === 'applied' ? 'Aplicado' :
                             candidate.status === 'screening' ? 'En revisión' :
                             candidate.status === 'interview' ? 'Entrevista' :
                             candidate.status === 'evaluation' ? 'Evaluación' :
                             candidate.status === 'interview-boss' ? 'Entrevista jefe' :
                             candidate.status === 'offer' ? 'Ofertado' :
                             candidate.status === 'hired' ? 'Contratado' :
                             candidate.status === 'rejected' ? 'Rechazado' :
                             candidate.status === 'declined' ? 'Declinó' :
                             candidate.status}
                          </Badge>
                          <Badge className={`text-xs ${
                            candidate.aiClassification === 'ideal' 
                              ? 'bg-green-500/20 text-green-400' 
                              : candidate.aiClassification === 'potencial'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {candidate.aiClassification === 'ideal' ? 'Ideal' :
                             candidate.aiClassification === 'potencial' ? 'Potencial' :
                             'No perfila'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {Object.keys(candidatesByProcess).length > 0 && (
            <div className="mt-6 pt-4 border-t border-cap-gray">
              <Link href="/dashboard/candidates">
                <div className="flex items-center justify-center text-cap-red font-bold text-sm hover:underline">
                  Ver todos los candidatos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
