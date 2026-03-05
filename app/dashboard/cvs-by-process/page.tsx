'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, ArrowRight, Search, Bot, Loader2 } from 'lucide-react';

export default function CVsByProcessPage() {
  const [loading, setLoading] = useState(true);
  const [candidatesByProcess, setCandidatesByProcess] = useState<Record<string, any[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

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
        <h1 className="text-4xl font-black text-white">BD Candidatos</h1>
        <p className="text-cap-gray-lightest mt-2 text-lg font-semibold">
          Todos los CVs de candidatos clasificados por proceso. Busca por nombre de vacante, candidatos ideales o profesiones.
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
          {/* Buscador simple + Agente Sandy */}
          <div className="mb-6 grid gap-4 md:grid-cols-[2fr,3fr]">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cap-gray" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por nombre de vacante o candidato..."
                  className="w-full pl-9 pr-3 py-2 rounded-md border-2 border-cap-gray bg-cap-black text-sm text-white placeholder:text-cap-gray font-semibold"
                />
              </div>
              <p className="text-xs text-cap-gray-lightest font-semibold">
                El filtro aplica sobre el nombre del proceso y el nombre del candidato.
              </p>
            </div>
            <Card className="border border-cap-gray bg-cap-black/60">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-racing-gradient flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black text-white">Sandy – Agente IA de BD Candidatos</CardTitle>
                  <CardDescription className="text-xs text-cap-gray-lightest font-semibold">
                    Pregúntame por nombre de vacante, candidatos ideales o profesiones y te ayudaré a encontrar procesos relevantes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!aiQuery.trim()) return;
                    setAiLoading(true);
                    setAiAnswer('');
                    try {
                      const res = await axios.post('/api/ai/search-candidates', { query: aiQuery.trim() });
                      if (res.data.success) {
                        setAiAnswer(res.data.answer || '');
                      } else {
                        setAiAnswer('No pude encontrar resultados para tu consulta. Intenta ser más específico.');
                      }
                    } catch (error) {
                      console.error('Error en búsqueda IA de BD candidatos:', error);
                      setAiAnswer('Ocurrió un error al procesar la búsqueda. Intenta nuevamente más tarde.');
                    } finally {
                      setAiLoading(false);
                    }
                  }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder='Ej: "vacantes de Ingeniería con candidatos ideales"'
                      className="flex-1 px-3 py-2 rounded-md border border-cap-gray bg-cap-gray-dark text-xs text-white placeholder:text-cap-gray font-semibold"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="px-3 py-2 rounded-md bg-racing-gradient text-xs font-bold text-white hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Preguntar'}
                    </button>
                  </div>
                </form>
                {aiAnswer && (
                  <div className="mt-1 p-2 rounded-md bg-cap-gray-dark/70 border border-cap-gray">
                    <p className="text-xs text-cap-gray-lightest whitespace-pre-line font-semibold">
                      {aiAnswer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {Object.keys(candidatesByProcess).length === 0 ? (
            <div className="text-center py-12 text-cap-gray">
              <FileText className="h-12 w-12 mx-auto mb-4 text-cap-gray" />
              <p className="text-sm font-semibold">No hay CVs registrados aún</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(candidatesByProcess)
                .filter(([processName, candidates]) => {
                  if (!searchTerm.trim()) return true;
                  const term = searchTerm.toLowerCase();
                  const matchesProcess = processName.toLowerCase().includes(term);
                  const matchesCandidate = (candidates as any[]).some((c) =>
                    String(c.fullName || '')
                      .toLowerCase()
                      .includes(term)
                  );
                  return matchesProcess || matchesCandidate;
                })
                .map(([processName, candidates]) => (
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
