'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot, Send, Sparkles } from 'lucide-react';

const GREETING = '¡Hola! Soy Sandy, tu agente IA de reclutamiento. Cuéntame qué tipo de candidato, vacante o profesión buscás y te ayudo a encontrar los procesos más relevantes.';

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
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-cap-red inline-block"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function SandySearch() {
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const { displayed: greetingText, done: greetingDone } = useTypewriter(GREETING, 18);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer('');
    setHasAnswered(false);
    try {
      const res = await axios.post('/api/ai/search-candidates', { query: aiQuery.trim() });
      setAiAnswer(
        res.data.success
          ? res.data.answer || 'No encontré resultados. Intentá con otros términos.'
          : 'No pude encontrar resultados. Intentá ser más específico.'
      );
    } catch {
      setAiAnswer('Ocurrió un error al procesar la búsqueda. Intentá nuevamente más tarde.');
    } finally {
      setAiLoading(false);
      setHasAnswered(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="border-2 border-cap-red/30 bg-gradient-to-br from-cap-black to-cap-gray-dark/90 backdrop-blur-sm shadow-racing overflow-hidden">
        {/* Accent stripe */}
        <div className="h-1 w-full bg-racing-gradient" />

        <CardHeader className="pb-3 pt-5">
          <div className="flex items-start gap-4">
            {/* Animated avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                className="w-14 h-14 rounded-full bg-racing-gradient flex items-center justify-center shadow-racing"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Bot className="h-7 w-7 text-white" />
              </motion.div>
              {/* Online dot */}
              <motion.span
                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-cap-black"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Name + greeting typewriter */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-black text-white">Sandy</span>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-racing-gradient text-white text-xs font-bold">
                    <Sparkles className="w-3 h-3" /> Agente IA
                  </span>
                </motion.div>
              </div>
              <p className="text-sm text-cap-gray-lightest font-semibold leading-relaxed min-h-[3.5rem]">
                {greetingText}
                {!greetingDone && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-cap-red ml-0.5 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-5">
          {/* Input form */}
          <form onSubmit={handleAiSearch}>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder='Ej: "candidatos ideales para Ingeniería Mecánica"'
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-cap-gray bg-cap-gray-dark text-sm text-white placeholder:text-cap-gray font-semibold focus:outline-none focus:border-cap-red transition-colors"
              />
              <motion.button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-lg bg-racing-gradient text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-racing"
              >
                <Send className="w-4 h-4" />
                Preguntar
              </motion.button>
            </div>
          </form>

          {/* Response area */}
          <AnimatePresence mode="wait">
            {aiLoading && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-cap-gray-dark/60 border border-cap-gray"
              >
                <div className="w-7 h-7 rounded-full bg-racing-gradient flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <ThinkingDots />
              </motion.div>
            )}

            {!aiLoading && hasAnswered && aiAnswer && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex gap-3 p-3 rounded-lg bg-cap-gray-dark/60 border border-cap-red/20"
              >
                <div className="w-7 h-7 rounded-full bg-racing-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-cap-gray-lightest whitespace-pre-line font-semibold leading-relaxed">
                  {aiAnswer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
