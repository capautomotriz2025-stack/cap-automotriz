'use client';

import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2 } from 'lucide-react';

export default function SandySearch() {
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState(
    'Hola, soy Sandy, tu agente IA de BD Candidatos. Cuéntame qué tipo de vacante, candidato ideal o profesión buscas y te ayudo a encontrar los procesos más relevantes.'
  );
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiSearch = async (e: React.FormEvent) => {
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
  };

  return (
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
        <form onSubmit={handleAiSearch} className="space-y-2">
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
  );
}
