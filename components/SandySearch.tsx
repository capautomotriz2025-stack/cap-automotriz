'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Sparkles, Briefcase, User, ArrowRight, Star } from 'lucide-react';

const GREETING = '¡Hola! Soy Sandy, tu agente IA de reclutamiento. Preguntame por vacantes, candidatos o un puesto específico y te muestro los resultados directamente.';

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="w-2 h-2 rounded-full bg-cap-red inline-block"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

const classificationColors: Record<string, string> = {
  ideal: 'bg-green-500/20 text-green-400 border-green-500/30',
  potencial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'no perfila': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusColors: Record<string, string> = {
  published: 'bg-green-500/20 text-green-400',
  draft: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-blue-500/20 text-blue-400',
};
const statusLabels: Record<string, string> = {
  published: 'Publicada', draft: 'Borrador', closed: 'Cerrada', pending: 'Pendiente',
};

type VacancyResult = { type: 'vacancy'; _id: string; title: string; department: string; status: string; location: string; company: string };
type CandidateResult = { type: 'candidate'; _id: string; fullName: string; aiScore: number; aiClassification: string; status: string; vacancyTitle: string };
type Result = VacancyResult | CandidateResult;

export default function SandySearch() {
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const { displayed: greetingText, done: greetingDone } = useTypewriter(GREETING, 18);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer('');
    setResults([]);
    setHasAnswered(false);
    try {
      const res = await axios.post('/api/ai/search-candidates', { query: aiQuery.trim() });
      if (res.data.success) {
        setAiAnswer(res.data.answer || '');
        setResults(res.data.results || []);
      } else {
        setAiAnswer('No pude encontrar resultados. Intentá con otros términos.');
      }
    } catch {
      setAiAnswer('Ocurrió un error al procesar la búsqueda. Intentá nuevamente.');
    } finally {
      setAiLoading(false);
      setHasAnswered(true);
    }
  };

  const vacancies = results.filter((r): r is VacancyResult => r.type === 'vacancy');
  const candidates = results.filter((r): r is CandidateResult => r.type === 'candidate');

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
      <Card className="border-2 border-cap-red/30 bg-gradient-to-br from-cap-black to-cap-gray-dark/90 backdrop-blur-sm shadow-racing overflow-hidden">
        <div className="h-1 w-full bg-racing-gradient" />

        <CardHeader className="pb-3 pt-5">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <motion.div className="w-14 h-14 rounded-full bg-racing-gradient flex items-center justify-center shadow-racing"
                animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                <Bot className="h-7 w-7 text-white" />
              </motion.div>
              <motion.span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-cap-black"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-black text-white">Sandy</span>
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-racing-gradient text-white text-xs font-bold">
                  <Sparkles className="w-3 h-3" /> Agente IA
                </motion.span>
              </div>
              <p className="text-sm text-cap-gray-lightest font-semibold leading-relaxed min-h-[3.5rem]">
                {greetingText}
                {!greetingDone && (
                  <motion.span className="inline-block w-0.5 h-4 bg-cap-red ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
                )}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-5">
          {/* Input */}
          <form onSubmit={handleAiSearch}>
            <div className="flex gap-2">
              <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)}
                placeholder='Ej: "vacantes de Ingeniería" o "candidatos ideales" o "desarrollador"'
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-cap-gray bg-cap-gray-dark text-sm text-white placeholder:text-cap-gray font-semibold focus:outline-none focus:border-cap-red transition-colors" />
              <motion.button type="submit" disabled={aiLoading || !aiQuery.trim()}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-lg bg-racing-gradient text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-racing">
                <Send className="w-4 h-4" />
                Buscar
              </motion.button>
            </div>
          </form>

          <AnimatePresence mode="wait">
            {/* Thinking */}
            {aiLoading && (
              <motion.div key="thinking" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-cap-gray-dark/60 border border-cap-gray">
                <div className="w-7 h-7 rounded-full bg-racing-gradient flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <ThinkingDots />
              </motion.div>
            )}

            {/* Answer + Results */}
            {!aiLoading && hasAnswered && (
              <motion.div key="answer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                className="space-y-4">

                {/* Text answer */}
                {aiAnswer && (
                  <div className="flex gap-3 p-3 rounded-lg bg-cap-gray-dark/60 border border-cap-red/20">
                    <div className="w-7 h-7 rounded-full bg-racing-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-cap-gray-lightest whitespace-pre-line font-semibold leading-relaxed">{aiAnswer}</p>
                  </div>
                )}

                {/* Vacancy results */}
                {vacancies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-cap-gray uppercase tracking-wider flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Vacantes encontradas ({vacancies.length})
                    </p>
                    {vacancies.map((v, i) => (
                      <motion.div key={v._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-cap-gray-dark/50 border border-cap-gray hover:border-cap-red/50 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-white truncate">{v.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-cap-gray-lightest font-semibold">{v.department}</span>
                              {v.location && <span className="text-xs text-cap-gray">· {v.location}</span>}
                              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${statusColors[v.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                {statusLabels[v.status] || v.status}
                              </span>
                            </div>
                          </div>
                          <Link href={`/dashboard/vacancies/${v._id}`}>
                            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="ml-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-racing-gradient text-white text-xs font-bold shadow-racing flex-shrink-0 cursor-pointer">
                              Ver <ArrowRight className="w-3 h-3" />
                            </motion.span>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Candidate results */}
                {candidates.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-cap-gray uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" /> Candidatos encontrados ({candidates.length})
                    </p>
                    {candidates.map((c, i) => (
                      <motion.div key={c._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-cap-gray-dark/50 border border-cap-gray hover:border-cap-red/50 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-white truncate">{c.fullName}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-cap-gray-lightest font-semibold truncate">{c.vacancyTitle}</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-cap-red" />
                                <span className="text-xs font-bold text-white">{c.aiScore}</span>
                              </div>
                              {c.aiClassification && (
                                <span className={`text-xs px-1.5 py-0.5 rounded border font-bold ${classificationColors[c.aiClassification] || 'bg-gray-500/20 text-gray-400'}`}>
                                  {c.aiClassification}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link href={`/dashboard/candidates/${c._id}`}>
                            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="ml-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-racing-gradient text-white text-xs font-bold shadow-racing flex-shrink-0 cursor-pointer">
                              Ver <ArrowRight className="w-3 h-3" />
                            </motion.span>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* No results */}
                {results.length === 0 && !aiAnswer && (
                  <p className="text-sm text-cap-gray font-semibold text-center py-2">
                    No encontré resultados. Intentá con otro término.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
