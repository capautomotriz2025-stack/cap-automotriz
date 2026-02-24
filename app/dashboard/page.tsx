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
  TrendingDown
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
        <div className="text-2xl font-black text-white mb-1">{value}</div>
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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm lg:text-base font-black text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex items-center justify-center min-h-[180px] lg:min-h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.percentage}%`}
                  outerRadius={55}
                  innerRadius={10}
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
          <div className="flex-1 space-y-1 lg:space-y-1.5">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 bg-cap-black rounded-lg">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div 
                    className="w-3 h-3 rounded flex-shrink-0" 
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="text-xs font-semibold text-white truncate">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-cap-gray-lightest ml-1.5 flex-shrink-0">{item.value}</span>
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

        // Calcular Time to Hire (días desde creación del candidato hasta estado Contratado; usar hiredAt si existe)
        const hiredWithDates = hiredCandidates.filter((c: any) => c.createdAt && (c.hiredAt || c.updatedAt));
        const timeToHireDays = hiredWithDates.length > 0
          ? hiredWithDates.reduce((sum: number, c: any) => {
              const appliedDate = new Date(c.createdAt);
              const hiredDate = new Date(c.hiredAt || c.updatedAt);
              const days = Math.floor((hiredDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / hiredWithDates.length
          : 0;

        // Calcular Time to Fill (desde creación de vacante hasta que algún candidato pasa a Contratado)
        const vacancyIdsWithHired = [...new Set(hiredCandidates.map((c: any) => c.vacancyId?._id || c.vacancyId).filter(Boolean))];
        const vacanciesById = Object.fromEntries((vacancies as any[]).map((v: any) => [v._id.toString(), v]));
        const timeToFillPerVacancy: number[] = [];
        vacancyIdsWithHired.forEach((vid: any) => {
          const vacancy = vacanciesById[vid?.toString?.() || vid];
          if (!vacancy?.createdAt) return;
          const hiredForVacancy = hiredCandidates.filter((c: any) => (c.vacancyId?._id || c.vacancyId)?.toString() === (vid?.toString?.() || vid));
          if (hiredForVacancy.length === 0) return;
          const firstHiredDate = new Date(
            Math.min(...hiredForVacancy.map((c: any) => new Date(c.hiredAt || c.updatedAt).getTime()))
          );
          const days = Math.floor((firstHiredDate.getTime() - new Date(vacancy.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          timeToFillPerVacancy.push(days);
        });
        const timeToFillDays = timeToFillPerVacancy.length > 0
          ? timeToFillPerVacancy.reduce((a, b) => a + b, 0) / timeToFillPerVacancy.length
          : 0;

        // Calcular Tasa de Abandono (candidatos que declinaron)
        const declinedCandidates = candidates.filter((c: any) => c.status === 'declined');
        const abandonmentRate = candidates.length > 0
          ? (declinedCandidates.length / candidates.length) * 100
          : 0;

        // Tasa de rechazo / Oferta no aceptada: candidatos en estado Rechazado
        const rejectedCandidates = candidates.filter((c: any) => c.status === 'rejected');
        const rejectedOfferRate = candidates.length > 0
          ? (rejectedCandidates.length / candidates.length) * 100
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
        // Vacantes por Departamento - Filtrar valores vacíos y ordenar
        const departmentCounts: Record<string, number> = {};
        vacancies.forEach((v: any) => {
          const dept = v.department?.trim() || 'Sin departamento';
          if (dept && dept !== 'Sin departamento') {
            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
          } else {
            departmentCounts['Sin departamento'] = (departmentCounts['Sin departamento'] || 0) + 1;
          }
        });
        const byDepartment = Object.entries(departmentCounts)
          .map(([name, value]) => ({
            name,
            value,
            percentage: totalProcessesRequested > 0 ? (((value as number) / totalProcessesRequested) * 100).toFixed(1) : '0'
          }))
          .sort((a, b) => b.value - a.value);

        // Vacantes por Empresa - Filtrar valores vacíos y ordenar
        const companyCounts: Record<string, number> = {};
        vacancies.forEach((v: any) => {
          const company = v.company?.trim() || 'Sin empresa';
          if (company && company !== 'Sin empresa') {
            companyCounts[company] = (companyCounts[company] || 0) + 1;
          } else {
            companyCounts['Sin empresa'] = (companyCounts['Sin empresa'] || 0) + 1;
          }
        });
        const byCompany = Object.entries(companyCounts)
          .map(([name, value]) => ({
            name,
            value,
            percentage: totalProcessesRequested > 0 ? (((value as number) / totalProcessesRequested) * 100).toFixed(1) : '0'
          }))
          .sort((a, b) => b.value - a.value);

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
          <h1 className="text-4xl font-black text-white">Dashboard de Reclutamiento</h1>
          <p className="text-cap-gray-lightest mt-2 text-lg font-semibold">
            Seguimiento de KPIs del proceso de contratación
          </p>
        </div>
      </div>

        {/* KPI Cards - 8 cards en 2 filas */}
        <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          title="Tasa de rechazo"
          value={`${kpis.rejectedOfferRate.toFixed(1)}%`}
          subtitle="Oferta no aceptada"
          change={kpis.changeRejectedOfferRate}
          icon={XCircle}
          isPositive={false} // Menos rechazos es mejor
        />
      </div>

      {/* Gráficos de Pastel - 2 arriba, 1 abajo */}
      <div className="space-y-4 md:space-y-6">
        {/* Primera fila: 2 gráficos */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
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
        </div>
        {/* Segunda fila: 1 gráfico centrado */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <PieChartCard
              title="Recursos por Estado del Proceso"
              data={chartData.byStatus}
              colors={[COLORS.gray, COLORS.lightBlue, COLORS.yellow, COLORS.purple, COLORS.lightGreen, COLORS.darkGreen]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
