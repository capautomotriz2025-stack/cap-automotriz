'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, ArrowRight } from 'lucide-react';

export default function CVsByProcessPage() {
  const [loading, setLoading] = useState(true);
  const [candidatesByProcess, setCandidatesByProcess] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchCandidatesByProcess();
  }, []);

  const fetchCandidatesByProcess = async () => {
    try {
      const [candidatesRes, vacanciesRes] = await Promise.all([
        axios.get('/api/candidates'),
        axios.get('/api/vacancies')
      ]);

      if (candidatesRes.data.success && vacanciesRes.data.success) {
        const candidates = candidatesRes.data.data;
        const vacancies = vacanciesRes.data.data;
        const vacancyMap = new Map();
        vacancies.forEach((v: any) => vacancyMap.set(v._id, v));
        const grouped: Record<string, any[]> = {};
        candidates.forEach((candidate: any) => {
          const vacancyId = candidate.vacancyId?._id || candidate.vacancyId;
          const vacancy = vacancyMap.get(vacancyId?.toString());
          if (vacancy) {
            const processKey = vacancy.title || 'Proceso sin título';
            if (!grouped[processKey]) grouped[processKey] = [];
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
      <div>
        <h1 className="text-4xl font-black text-white">CVs por Proceso de Reclutamiento</h1>
        <p className="text-cap-gray-lightest mt-2 text-lg font-semibold">
          Todos los CVs de candidatos clasificados por proceso
        </p>
      </div>

      <Card className="border-2 border-cap-gray bg-cap-gray-dark/80 backdrop-blur-sm">
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
