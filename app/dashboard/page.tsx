'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  CheckCircle2,
  Users,
  Percent,
  Clock,
  Calendar,
  XCircle,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Plus,
  ArrowRight,
  Target,
  Bot,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f97316',
  purple: '#a855f7',
  red: '#ef4444',
  pink: '#ec4899',
  lightBlue: '#60a5fa',
  lightGreen: '#34d399',
  darkGreen: '#059669',
  yellow: '#eab308',
  gray: '#6b7280',
};

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  isPositive = true 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  change: number; 
  icon: any;
  isPositive?: boolean;
}) => {
  const isChangePositive = change < 0 ? !isPositive : isPositive;
  const changeColor = isChangePositive ? 'text-green-500' : 'text-red-500';
  
  return (
    <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing hover:scale-105 transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold text-cap-gray-lightest">
          {title}
        </CardTitle>
        <div className="w-10 h-10 bg-cap-gray rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-cap-gray-lightest" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        {subtitle && (
          <div className="text-xs text-cap-gray-lightest font-semibold mb-2">{subtitle}</div>
        )}
        <div className={`flex items-center gap-1 text-sm font-bold ${changeColor}`}>
          {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </CardContent>
    </Card>
  );
};

const PieChartCard = ({ 
  title, 
  data, 
  colors 
}: { 
  title: string; 
  data: Array<{ name: string; value: number; percentage: string }>; 
  colors: string[];
}) => {
  const chartColors = colors.slice(0, data.length);
  
  return (
    <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-black text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-cap-black rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="text-sm font-semibold text-white">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-cap-gray-lightest">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalProcessesRequested: 0,
    totalProcessesClosed: 0,
    totalHires: 0,
    percentageClosed: 0,
    timeToHire: 0,
    timeToFill: 0,
    abandonmentRate: 0,
    rejectedOfferRate: 0,
    // Cambios porcentuales (simulados por ahora)
    changeProcessesRequested: 8.5,
    changeProcessesClosed: 12.3,
    changeHires: 5.7,
    changePercentageClosed: 3.2,
    changeTimeToHire: -2.1,
    changeTimeToFill: -1.5,
    changeAbandonmentRate: 4.3,
    changeRejectedOfferRate: 1.8,
  });
  const [chartData, setChartData] = useState<{
    byDepartment: Array<{ name: string; value: number; percentage: string }>;
    byCompany: Array<{ name: string; value: number; percentage: string }>;
    byStatus: Array<{ name: string; value: number; percentage: string }>;
  }>({
    byDepartment: [],
    byCompany: [],
    byStatus: []
  });
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [recentVacancies, setRecentVacancies] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [vacanciesRes, candidatesRes] = await Promise.all([
        axios.get('/api/vacancies'),
        axios.get('/api/candidates'),
      ]);

      if (vacanciesRes.data.success && candidatesRes.data.success) {
        const vacancies = vacanciesRes.data.data;
        const candidates = candidatesRes.data.data;

        // Calcular KPIs
        const totalProcessesRequested = vacancies.length;
        const closedVacancies = vacancies.filter((v: any) => v.status === 'closed');
        const totalProcessesClosed = closedVacancies.length;
        const hiredCandidates = candidates.filter((c: any) => c.status === 'hired');
        const totalHires = hiredCandidates.length;
        const percentageClosed = totalProcessesRequested > 0 
          ? (totalProcessesClosed / totalProcessesRequested) * 100 
          : 0;

        // Calcular Time to Hire (promedio de días desde aplicación hasta contratación)
        const hiredWithDates = hiredCandidates.filter((c: any) => c.createdAt && c.updatedAt);
        const timeToHireDays = hiredWithDates.length > 0
          ? hiredWithDates.reduce((sum: number, c: any) => {
              const appliedDate = new Date(c.createdAt);
              const hiredDate = new Date(c.updatedAt);
              const days = Math.floor((hiredDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / hiredWithDates.length
          : 0;

        // Calcular Time to Fill (promedio de días desde creación de vacante hasta cierre)
        const filledVacancies = closedVacancies.filter((v: any) => v.createdAt && v.closedAt);
        const timeToFillDays = filledVacancies.length > 0
          ? filledVacancies.reduce((sum: number, v: any) => {
              const createdDate = new Date(v.createdAt);
              const closedDate = new Date(v.closedAt || v.updatedAt);
              const days = Math.floor((closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / filledVacancies.length
          : 0;

        // Calcular Tasa de Abandono (candidatos que declinaron)
        const declinedCandidates = candidates.filter((c: any) => c.status === 'declined');
        const abandonmentRate = candidates.length > 0
          ? (declinedCandidates.length / candidates.length) * 100
          : 0;

        // Calcular Tasa de Propuestas Rechazadas (candidatos en oferta que fueron rechazados o declinaron)
        const offeredCandidates = candidates.filter((c: any) => c.status === 'offer');
        const rejectedAfterOffer = offeredCandidates.filter((c: any) => 
          c.status === 'rejected' || c.status === 'declined'
        );
        const rejectedOfferRate = offeredCandidates.length > 0
          ? (rejectedAfterOffer.length / offeredCandidates.length) * 100
          : 0;

        setKpis({
          totalProcessesRequested,
          totalProcessesClosed,
          totalHires,
          percentageClosed,
          timeToHire: Math.round(timeToHireDays),
          timeToFill: Math.round(timeToFillDays),
          abandonmentRate,
          rejectedOfferRate,
          // Cambios porcentuales (simulados - en producción se calcularían comparando con período anterior)
          changeProcessesRequested: 8.5,
          changeProcessesClosed: 12.3,
          changeHires: 5.7,
          changePercentageClosed: 3.2,
          changeTimeToHire: -2.1,
          changeTimeToFill: -1.5,
          changeAbandonmentRate: 4.3,
          changeRejectedOfferRate: 1.8,
        });

        // Calcular datos para gráficos
        // Vacantes por Departamento
        const departmentCounts: Record<string, number> = {};
        vacancies.forEach((v: any) => {
          const dept = v.department || 'Sin departamento';
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });
        const byDepartment = Object.entries(departmentCounts).map(([name, value]) => ({
          name,
          value,
          percentage: totalProcessesRequested > 0 ? (((value as number) / totalProcessesRequested) * 100).toFixed(1) : '0'
        }));

        // Vacantes por Empresa
        const companyCounts: Record<string, number> = {};
        vacancies.forEach((v: any) => {
          const company = v.company || 'Sin empresa';
          companyCounts[company] = (companyCounts[company] || 0) + 1;
        });
        const byCompany = Object.entries(companyCounts).map(([name, value]) => ({
          name,
          value,
          percentage: totalProcessesRequested > 0 ? (((value as number) / totalProcessesRequested) * 100).toFixed(1) : '0'
        }));

        // Recursos por Estado del Proceso
        const statusCounts: Record<string, number> = {};
        candidates.forEach((c: any) => {
          const status = c.status || 'applied';
          // Mapear estados del modelo a etiquetas del dashboard
          const statusLabels: Record<string, string> = {
            'applied': 'Aplicaciones',
            'screening': 'En revisión',
            'in-review': 'En revisión',
            'interview': 'Entrevista RH',
            'interview-rh': 'Entrevista RH',
            'evaluation': 'En evaluación',
            'interview-manager': 'Entrevista jefe',
            'interview-boss': 'Entrevista jefe',
            'offer': 'Ofertados',
            'hired': 'Contratados',
            'rejected': 'Rechazados',
            'declined': 'Declinaron'
          };
          const label = statusLabels[status] || status;
          statusCounts[label] = (statusCounts[label] || 0) + 1;
        });
        // Consolidar estados duplicados (ej: 'screening' y 'in-review' ambos son 'En revisión')
        const consolidatedStatusCounts: Record<string, number> = {};
        Object.entries(statusCounts).forEach(([name, value]) => {
          consolidatedStatusCounts[name] = (consolidatedStatusCounts[name] || 0) + value;
        });
        const byStatus = Object.entries(consolidatedStatusCounts).map(([name, value]) => ({
          name,
          value,
          percentage: candidates.length > 0 ? (((value as number) / candidates.length) * 100).toFixed(1) : '0'
        }));

        setChartData({
          byDepartment: byDepartment.slice(0, 6), // Top 6
          byCompany: byCompany.slice(0, 5), // Top 5
          byStatus: byStatus
        });

        // Top 5 candidatos por score
        setTopCandidates(
          candidates
            .map((c: any) => ({
              ...c,
              displayScore: c.aiAnalysis?.score || c.aiScore || 0
            }))
            .sort((a: any, b: any) => b.displayScore - a.displayScore)
            .slice(0, 5)
        );

        // Últimas 3 vacantes
        setRecentVacancies(vacancies.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

      {/* Main Grid - Acciones Rápidas y Top Candidatos */}
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

      {/* Sección de KPIs */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-black text-white">Dashboard de Reclutamiento</h2>
          <p className="text-cap-gray-lightest mt-2 text-lg font-semibold">
            Seguimiento de KPIs del proceso de contratación
          </p>
        </div>

        {/* KPI Cards - 8 cards en 2 filas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Procesos Solicitados"
          value={kpis.totalProcessesRequested}
          change={kpis.changeProcessesRequested}
          icon={FileText}
          isPositive={true}
        />
        <KPICard
          title="Total Procesos Cerrados"
          value={kpis.totalProcessesClosed}
          change={kpis.changeProcessesClosed}
          icon={CheckCircle2}
          isPositive={true}
        />
        <KPICard
          title="Total de Contrataciones"
          value={kpis.totalHires}
          change={kpis.changeHires}
          icon={Users}
          isPositive={true}
        />
        <KPICard
          title="Porcentaje Procesos Cerrados"
          value={`${kpis.percentageClosed.toFixed(1)}%`}
          subtitle="Contrataciones / Solicitudes"
          change={kpis.changePercentageClosed}
          icon={Percent}
          isPositive={true}
        />
        <KPICard
          title="Time to Hire"
          value={`${kpis.timeToHire} días`}
          subtitle="Promedio días contratación"
          change={kpis.changeTimeToHire}
          icon={Clock}
          isPositive={false} // Menos días es mejor
        />
        <KPICard
          title="Time to Fill"
          value={`${kpis.timeToFill} días`}
          subtitle="Promedio días cubrir vacante"
          change={kpis.changeTimeToFill}
          icon={Calendar}
          isPositive={false} // Menos días es mejor
        />
        <KPICard
          title="Tasa de Abandono"
          value={`${kpis.abandonmentRate.toFixed(1)}%`}
          subtitle="Candidatos que abandonan"
          change={kpis.changeAbandonmentRate}
          icon={XCircle}
          isPositive={false} // Menos abandono es mejor
        />
        <KPICard
          title="Tasa Propuestas Rechazadas"
          value={`${kpis.rejectedOfferRate.toFixed(1)}%`}
          subtitle="Ofertas no aceptadas"
          change={kpis.changeRejectedOfferRate}
          icon={XCircle}
          isPositive={false} // Menos rechazos es mejor
        />
      </div>

      {/* Gráficos de Pastel - 3 gráficos */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <PieChartCard
          title="Vacantes por Departamento"
          data={chartData.byDepartment}
          colors={[COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple, COLORS.red, COLORS.pink]}
        />
        <PieChartCard
          title="Vacantes por Empresa"
          data={chartData.byCompany}
          colors={[COLORS.lightBlue, COLORS.lightGreen, COLORS.orange, COLORS.purple, COLORS.darkGreen]}
        />
        <PieChartCard
          title="Recursos por Estado del Proceso"
          data={chartData.byStatus}
          colors={[COLORS.gray, COLORS.lightBlue, COLORS.yellow, COLORS.purple, COLORS.lightGreen, COLORS.darkGreen]}
        />
      </div>
      </div>
    </div>
  );
}
