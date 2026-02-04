'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowRight,
  Sparkles,
  Target,
  Mail,
  FileText,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Activity,
  Bot
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalVacancies: 0,
    activeVacancies: 0,
    totalCandidates: 0,
    idealCandidates: 0,
    potentialCandidates: 0,
    inInterview: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentVacancies, setRecentVacancies] = useState<any[]>([]);
  const [topCandidates, setTopCandidates] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vacanciesRes, candidatesRes] = await Promise.all([
        axios.get('/api/vacancies'),
        axios.get('/api/candidates'),
      ]);

      if (vacanciesRes.data.success && candidatesRes.data.success) {
        const vacancies = vacanciesRes.data.data;
        const candidates = candidatesRes.data.data;

        // Calcular stats considerando ambos formatos (MongoDB y Mock)
        const idealCount = candidates.filter((c: any) => 
          c.aiClassification === 'ideal' || 
          c.aiAnalysis?.classification === 'ideal' ||
          (c.aiAnalysis?.score || c.aiScore || 0) >= 80
        ).length;
        
        const potentialCount = candidates.filter((c: any) => 
          c.aiClassification === 'potential' || 
          c.aiClassification === 'potencial' ||
          c.aiAnalysis?.classification === 'potential' ||
          ((c.aiAnalysis?.score || c.aiScore || 0) >= 50 && (c.aiAnalysis?.score || c.aiScore || 0) < 80)
        ).length;

        setStats({
          totalVacancies: vacancies.length,
          activeVacancies: vacancies.filter((v: any) => v.status === 'published').length,
          totalCandidates: candidates.length,
          idealCandidates: idealCount,
          potentialCandidates: potentialCount,
          inInterview: candidates.filter((c: any) => c.status === 'interview' || c.status === 'evaluation').length,
        });

        // Últimas 3 vacantes
        setRecentVacancies(vacancies.slice(0, 3));
        
        // Top 5 candidatos por score (compatible con ambos formatos)
        setTopCandidates(
          candidates
            .map((c: any) => ({
              ...c,
              displayScore: c.aiAnalysis?.score || c.aiScore || 0
            }))
            .sort((a: any, b: any) => b.displayScore - a.displayScore)
            .slice(0, 5)
        );
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Dashboard CAP</h1>
          <p className="text-cap-gray-lightest mt-2 text-lg font-semibold">
            Bienvenido a tu panel de reclutamiento inteligente
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <Card className="border-2 border-cap-red/30 bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing hover:scale-105 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-cap-gray-lightest">
              Total Vacantes
            </CardTitle>
            <div className="w-12 h-12 bg-racing-gradient rounded-xl flex items-center justify-center shadow-racing">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{stats.totalVacancies}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-cap-red/20 text-cap-red hover:bg-cap-red/20 font-bold border border-cap-red/30">
                <Activity className="w-3 h-3 mr-1" />
                {stats.activeVacancies} activas
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing hover:scale-105 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-cap-gray-lightest">
              Total Candidatos
            </CardTitle>
            <div className="w-12 h-12 bg-cap-gray rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-cap-gray-lightest" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{stats.totalCandidates}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-cap-gray text-cap-gray-lightest hover:bg-cap-gray font-bold">
                <Calendar className="w-3 h-3 mr-1" />
                {stats.inInterview} en proceso
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-2 border-cap-red/30 bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing hover:scale-105 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-cap-gray-lightest">
              Candidatos Ideales
            </CardTitle>
            <div className="w-12 h-12 bg-racing-gradient rounded-xl flex items-center justify-center shadow-racing">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-cap-red">{stats.idealCandidates}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-cap-red/20 text-cap-red hover:bg-cap-red/20 font-bold border border-cap-red/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Por IA
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing hover:scale-105 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-cap-gray-lightest">
              Potenciales
            </CardTitle>
            <div className="w-12 h-12 bg-cap-gray rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-cap-gray-lightest" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{stats.potentialCandidates}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-cap-gray text-cap-gray-lightest hover:bg-cap-gray font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                En evaluación
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
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

        {/* Top Candidatos - 1 columna */}
        <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-black text-white">Top Candidatos</CardTitle>
            <CardDescription className="text-cap-gray-lightest font-semibold">
              Mejor calificados por IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCandidates.length === 0 ? (
              <div className="text-center py-8 text-cap-gray">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-cap-gray" />
                <p className="text-sm font-semibold">No hay candidatos aún</p>
              </div>
            ) : (
              topCandidates.map((candidate, index) => (
                <div key={candidate._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-cap-black transition-colors">
                  <div className="w-10 h-10 bg-racing-gradient rounded-full flex items-center justify-center text-white font-black shadow-racing">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-white">{candidate.fullName}</p>
                    <p className="text-xs text-cap-gray truncate font-semibold">
                      {typeof candidate.vacancyId === 'object' && candidate.vacancyId?.title 
                        ? candidate.vacancyId.title 
                        : `Vacante ID: ${candidate.vacancyId}`}
                    </p>
                  </div>
                  <Badge className={`font-black ${
                    candidate.displayScore >= 90 ? 'bg-cap-red/20 text-cap-red border border-cap-red/30' :
                    candidate.displayScore >= 80 ? 'bg-racing-gradient text-white shadow-racing' :
                    'bg-cap-gray text-cap-gray-lightest'
                  }`}>
                    {candidate.displayScore}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Banner */}
      <Card className="border-2 border-cap-red/30 bg-gradient-to-br from-cap-gray-dark to-cap-black">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-racing-gradient rounded-xl flex items-center justify-center shadow-racing">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-white">Potenciado por IA</CardTitle>
              <CardDescription className="text-base text-cap-gray-lightest font-semibold">
                Características inteligentes para reclutar mejor
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-4 bg-cap-black rounded-lg border border-cap-gray">
              <div className="w-10 h-10 bg-racing-gradient rounded-lg flex items-center justify-center flex-shrink-0 shadow-racing">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1 text-white">Análisis de CVs</h4>
                <p className="text-xs text-cap-gray-lightest font-semibold">Evaluación automática con GPT-4</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-cap-black rounded-lg border border-cap-gray">
              <div className="w-10 h-10 bg-cap-gray rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-cap-gray-lightest" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1 text-white">Optimización</h4>
                <p className="text-xs text-cap-gray-lightest font-semibold">Descripciones mejoradas por IA</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-cap-black rounded-lg border border-cap-gray">
              <div className="w-10 h-10 bg-racing-gradient rounded-lg flex items-center justify-center flex-shrink-0 shadow-racing">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1 text-white">Notificaciones</h4>
                <p className="text-xs text-cap-gray-lightest font-semibold">Email y WhatsApp automáticos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-cap-black rounded-lg border border-cap-gray">
              <div className="w-10 h-10 bg-cap-gray rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-cap-gray-lightest" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1 text-white">Gestión Visual</h4>
                <p className="text-xs text-cap-gray-lightest font-semibold">Tablero Kanban drag & drop</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

