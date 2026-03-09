import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Vacancy from '@/models/Vacancy';
import openai from '@/lib/openai';

// Quita tildes y pasa a minúsculas para comparar
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Extrae palabras clave útiles de la query (> 2 chars, sin stop words)
const STOP_WORDS = new Set(['de', 'la', 'el', 'los', 'las', 'un', 'una', 'que', 'con', 'del', 'para', 'por', 'en', 'me', 'mis', 'sus', 'hay', 'ver', 'los', 'son', 'mas', 'mas', 'como']);
function extractKeywords(query: string): string[] {
  return normalize(query)
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function matches(text: string, keywords: string[]): boolean {
  const norm = normalize(text);
  return keywords.some(kw => norm.includes(kw));
}

// Detecta si el usuario quiere vacantes, candidatos, o ambos
function detectIntent(query: string): 'vacancies' | 'candidates' | 'both' {
  const norm = normalize(query);
  const vacancyWords = ['vacante', 'vacantes', 'puesto', 'puestos', 'posicion', 'trabajo', 'oferta', 'ofertas', 'plaza'];
  const candidateWords = ['candidato', 'candidatos', 'postulante', 'postulantes', 'evaluado', 'evaluados', 'persona', 'personas'];
  const wantsVacancy = vacancyWords.some(w => norm.includes(w));
  const wantsCandidate = candidateWords.some(w => norm.includes(w));
  if (wantsVacancy && !wantsCandidate) return 'vacancies';
  if (wantsCandidate && !wantsVacancy) return 'candidates';
  return 'both';
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'query es requerido' }, { status: 400 });
    }

    const [candidates, vacancies] = await Promise.all([
      Candidate.find({}).populate('vacancyId').sort({ aiScore: -1 }).limit(200),
      Vacancy.find({}).sort({ createdAt: -1 }),
    ]);

    const vacancyMap = new Map<string, any>();
    vacancies.forEach((v: any) => vacancyMap.set(v._id.toString(), v));

    const keywords = extractKeywords(query);
    const intent = detectIntent(query);

    // --- Filtrar vacantes ---
    const matchedVacancies = vacancies
      .filter((v: any) =>
        keywords.length === 0 ||
        matches(v.title || '', keywords) ||
        matches(v.department || '', keywords) ||
        matches(v.requiredProfession || '', keywords) ||
        (v.requiredProfessions || []).some((p: string) => matches(p, keywords)) ||
        matches(v.mainFunctions || '', keywords) ||
        matches(v.company || '', keywords)
      )
      .slice(0, 5)
      .map((v: any) => ({
        type: 'vacancy' as const,
        _id: v._id.toString(),
        title: v.title,
        department: v.department || '',
        status: v.status,
        location: v.location || '',
        company: v.company || '',
      }));

    // --- Filtrar candidatos ---
    const matchedCandidates = candidates
      .filter((c: any) => {
        const vacancy = vacancyMap.get((c.vacancyId?._id || c.vacancyId)?.toString());
        return (
          keywords.length === 0 ||
          matches(c.fullName || '', keywords) ||
          matches(c.aiClassification || '', keywords) ||
          matches(vacancy?.title || '', keywords) ||
          matches(vacancy?.department || '', keywords) ||
          matches(vacancy?.requiredProfession || '', keywords) ||
          (vacancy?.requiredProfessions || []).some((p: string) => matches(p, keywords))
        );
      })
      .slice(0, 5)
      .map((c: any) => {
        const vacancy = vacancyMap.get((c.vacancyId?._id || c.vacancyId)?.toString());
        return {
          type: 'candidate' as const,
          _id: c._id.toString(),
          fullName: c.fullName,
          aiScore: c.aiScore ?? 0,
          aiClassification: c.aiClassification || '',
          status: c.status || '',
          vacancyTitle: vacancy?.title || 'N/A',
        };
      });

    // Según intent, priorizar qué mostrar
    let results: any[] = [];
    if (intent === 'vacancies') results = matchedVacancies;
    else if (intent === 'candidates') results = matchedCandidates;
    else results = [...matchedVacancies, ...matchedCandidates];

    // --- Texto de respuesta con OpenAI ---
    let answer = '';
    try {
      const contextLines: string[] = [];
      candidates.slice(0, 100).forEach((c: any) => {
        const vId = (c.vacancyId?._id || c.vacancyId)?.toString();
        const v = vId ? vacancyMap.get(vId) : null;
        contextLines.push(
          `- ${c.fullName} | ${v?.title || 'N/A'} | ${v?.department || 'N/A'} | ${c.aiClassification || 'N/A'} | Score: ${c.aiScore ?? 0}`
        );
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Eres Sandy, agente IA de reclutamiento de CAP Automotriz. Responde en español de forma breve y útil (2-4 líneas). No inventes datos.`,
          },
          {
            role: 'user',
            content: `Candidatos disponibles:\n${contextLines.join('\n')}\n\nConsulta: "${query}"\n\nResponde brevemente qué encontraste.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 300,
      });
      answer = completion.choices[0].message.content || '';
    } catch {
      // Fallback sin OpenAI
      if (results.length > 0) {
        answer = `Encontré ${results.filter(r => r.type === 'vacancy').length} vacante(s) y ${results.filter(r => r.type === 'candidate').length} candidato(s) relacionados con tu búsqueda.`;
      } else {
        answer = 'No encontré resultados para tu consulta. Intentá con otros términos.';
      }
    }

    return NextResponse.json({ success: true, answer, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
