'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, CheckCircle2, AlertTriangle, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

interface VacancyDetail {
  vacancyId: string;
  title: string;
  department: string;
  createdAt: string;
  hiredAt: string;
  days: number;
  onTime: boolean;
}

interface Stats {
  onTime: number;
  overTime: number;
  total: number;
  slaDays: number;
  detail: VacancyDetail[];
}

const COLORS = { onTime: '#22c55e', overTime: '#ef4444' };

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-cap-gray-dark border border-cap-gray rounded-lg px-3 py-2 text-sm font-bold text-white shadow-racing">
      {name}: <span className="text-cap-red">{value}</span> vacante{value !== 1 ? 's' : ''}
    </div>
  );
};

export default function VacancyTimeChart() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    axios.get('/api/dashboard/vacancy-time-stats')
      .then(res => { if (res.data.success) setStats(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cap-red" />
        </CardContent>
      </Card>
    );
  }

  const noData = !stats || stats.total === 0;

  const pieData = noData ? [] : [
    { name: `A tiempo (≤${stats.slaDays} días)`, value: stats.onTime },
    { name: `Fuera de tiempo (>${stats.slaDays} días)`, value: stats.overTime },
  ].filter(d => d.value > 0);

  const pctOnTime = noData ? 0 : Math.round((stats.onTime / stats.total) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm hover:shadow-racing transition-all">
        <div className="h-1 w-full bg-racing-gradient rounded-t-lg" />
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                <Timer className="h-5 w-5 text-cap-red" />
                Tiempo de Cobertura de Vacantes
              </CardTitle>
              <CardDescription className="text-cap-gray-lightest font-semibold mt-0.5">
                Vacantes cubiertas dentro vs fuera del plazo de {stats?.slaDays ?? 28} días
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-5">
          {noData ? (
            <div className="flex flex-col items-center justify-center py-10 text-cap-gray gap-2">
              <Clock className="h-10 w-10 opacity-40" />
              <p className="text-sm font-semibold">Sin vacantes cubiertas aún</p>
              <p className="text-xs">Aparecerán aquí cuando haya candidatos contratados</p>
            </div>
          ) : (
            <>
              {/* KPI badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mb-1" />
                  <span className="text-2xl font-black text-green-400">{stats!.onTime}</span>
                  <span className="text-xs text-green-300 font-semibold text-center leading-tight">A tiempo</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-cap-black/60 border border-cap-gray">
                  <Clock className="h-5 w-5 text-cap-red mb-1" />
                  <span className="text-2xl font-black text-white">{pctOnTime}%</span>
                  <span className="text-xs text-cap-gray-lightest font-semibold text-center leading-tight">Eficiencia</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400 mb-1" />
                  <span className="text-2xl font-black text-red-400">{stats!.overTime}</span>
                  <span className="text-xs text-red-300 font-semibold text-center leading-tight">Fuera de plazo</span>
                </div>
              </div>

              {/* Pie chart */}
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? COLORS.onTime : COLORS.overTime}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', fontWeight: 700, color: '#a0a0a0' }}
                    formatter={(value) => <span className="text-cap-gray-lightest text-xs font-bold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Detail toggle */}
              {stats!.detail.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowDetail(v => !v)}
                    className="w-full text-xs font-bold text-cap-red hover:underline flex items-center justify-center gap-1 py-1"
                  >
                    {showDetail ? 'Ocultar detalle' : `Ver detalle (${stats!.total} vacantes)`}
                  </button>

                  {showDetail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1"
                    >
                      {stats!.detail.map((d) => (
                        <div
                          key={d.vacancyId}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold ${
                            d.onTime
                              ? 'bg-green-500/10 border-green-500/20 text-green-300'
                              : 'bg-red-500/10 border-red-500/20 text-red-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-white truncate">{d.title}</p>
                            <p className="opacity-70 truncate">{d.department}</p>
                          </div>
                          <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="font-black">{d.days}d</span>
                            {d.onTime
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                              : <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                            }
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
