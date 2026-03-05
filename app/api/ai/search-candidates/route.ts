import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Vacancy from '@/models/Vacancy';
import { analyzeCandidateCV } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'query es requerido' },
        { status: 400 }
      );
    }

    const candidates = await Candidate.find({})
      .populate('vacancyId')
      .sort({ createdAt: -1 })
      .limit(200);

    const vacancies = await Vacancy.find({});
    const vacancyMap = new Map<string, any>();
    vacancies.forEach((v: any) => vacancyMap.set(v._id.toString(), v));

    const contextLines: string[] = [];
    candidates.forEach((c: any) => {
      const vacancyId = c.vacancyId?._id || c.vacancyId;
      const vacancy = vacancyId ? vacancyMap.get(vacancyId.toString()) : null;
      contextLines.push(
        `- Candidato: ${c.fullName} | Vacante: ${vacancy?.title || 'N/A'} | Departamento: ${
          vacancy?.department || 'N/A'
        } | Profesión requerida: ${vacancy?.requiredProfession || ''} | Clasificación IA: ${
          c.aiClassification || 'N/A'
        } | Score: ${c.aiScore ?? 0}`
      );
    });

    const prompt = `Eres "Sandy", agente IA de la Base de Datos de Candidatos de CAP Automotriz.

Tienes la siguiente lista resumida de candidatos y sus vacantes (una por línea):
${contextLines.join('\n')}

Usuario pregunta: "${query}".

Responde en español, de forma breve (3-6 líneas), explicando:
- Qué vacantes o procesos parecen más relevantes.
- Qué tipo de candidatos/ perfiles aparecen (menciona nombres o profesiones clave).
- Si hay candidatos "ideales" o "potenciales" relacionados con lo que pide.

No inventes información que no esté sugerida por el contexto.`;

    // Reutilizamos analyzeCandidateCV solo como wrapper de llamada a OpenAI (usa mismo cliente)
    const analysis = await analyzeCandidateCV(prompt, '', [], null);
    const answer =
      analysis.summary ||
      analysis.justification ||
      'No pude encontrar resultados claros con la información actual. Intenta ser más específico.';

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

