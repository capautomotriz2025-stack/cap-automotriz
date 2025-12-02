import OpenAI from 'openai';

// Verificar si OpenAI está disponible
const OPENAI_AVAILABLE = !!process.env.OPENAI_API_KEY;

// Inicializar OpenAI con una key dummy si no está disponible (para evitar errores en build)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

// Helper para verificar disponibilidad
function checkOpenAIAvailable(functionName: string): boolean {
  if (!OPENAI_AVAILABLE) {
    console.log(`⚠️  ${functionName}: OpenAI no disponible (requiere OPENAI_API_KEY)`);
    return false;
  }
  return true;
}

export async function optimizeJobDescription(description: string, role: string) {
  if (!checkOpenAIAvailable('optimizeJobDescription')) {
    return description; // Devolver descripción original si OpenAI no está disponible
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en recursos humanos. Tu tarea es mejorar y optimizar descripciones de puestos de trabajo para atraer al mejor talento. Enfócate en claridad, beneficios y requisitos específicos."
        },
        {
          role: "user",
          content: `Optimiza esta descripción de puesto para el rol de ${role}:\n\n${description}\n\nProporciona una descripción profesional, clara y atractiva que destaque responsabilidades clave, requisitos y beneficios.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return completion.choices[0].message.content || description;
  } catch (error) {
    console.error('Error optimizando descripción:', error);
    return description;
  }
}

export async function analyzeCandidateCV(
  cvText: string,
  jobDescription: string,
  requiredSkills: string[],
  aiAgent?: any
) {
  if (!checkOpenAIAvailable('analyzeCandidateCV')) {
    return {
      score: 50,
      classification: 'potential',
      summary: 'Análisis automático no disponible. Requiere revisión manual.',
      strengths: ['Requiere evaluación manual'],
      concerns: ['OpenAI API no configurada']
    };
  }

  try {
    // Usar el system prompt del agente si está disponible, sino usar el genérico
    const systemPrompt = aiAgent?.systemPrompt || `Eres un experto en reclutamiento. Analiza el CV del candidato comparándolo con la descripción del puesto y proporciona:
          1. Un puntaje del 1-100 basado en qué tan bien coincide el candidato con los requisitos
          2. Clasificación: "ideal" (80-100), "potential" (50-79), o "no-fit" (0-49)
          3. Resumen breve
          4. Fortalezas (array)
          5. Preocupaciones (array)
          
          Responde SOLO con un JSON válido en este formato:
          {
            "score": 85,
            "classification": "ideal",
            "summary": "El candidato tiene...",
            "strengths": ["Fortaleza 1", "Fortaleza 2"],
            "concerns": ["Preocupación 1"]
          }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `CV del Candidato:\n${cvText}\n\nDescripción del Puesto:\n${jobDescription}\n\nHabilidades Requeridas:\n${requiredSkills.join(', ')}`
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = completion.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analizando candidato:', error);
    return {
      score: 50,
      classification: 'potential',
      summary: 'No se pudo analizar el CV automáticamente.',
      strengths: [],
      concerns: ['Error en análisis automático']
    };
  }
}

export async function generateOfferLetter(
  candidateName: string,
  position: string,
  salary: string,
  startDate: string,
  companyName: string,
  additionalBenefits?: string
) {
  if (!checkOpenAIAvailable('generateOfferLetter')) {
    return `Esta funcionalidad requiere OpenAI API key para generar cartas de oferta automáticamente.
    
Por favor, configura OPENAI_API_KEY en tus variables de entorno para habilitar esta función.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en recursos humanos. Genera cartas de oferta profesionales, formales y completas en español para México/Latinoamérica."
        },
        {
          role: "user",
          content: `Genera una carta de oferta profesional y formal para:
          - Candidato: ${candidateName}
          - Posición: ${position}
          - Salario: ${salary}
          - Fecha de inicio: ${startDate}
          - Empresa: ${companyName}
          ${additionalBenefits ? `- Beneficios adicionales: ${additionalBenefits}` : ''}
          
          Incluye: fecha, saludo, detalles del puesto, salario, beneficios, fecha de inicio, y cierre profesional.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return completion.choices[0].message.content || 'No se pudo generar la carta de oferta.';
  } catch (error) {
    console.error('Error generando carta de oferta:', error);
    return 'Error al generar la carta de oferta.';
  }
}

export async function suggestCandidateProfile(jobTitle: string, industry: string) {
  if (!checkOpenAIAvailable('suggestCandidateProfile')) {
    return 'Esta funcionalidad requiere OpenAI API key. Por favor configura OPENAI_API_KEY en tus variables de entorno.';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en recursos humanos. Define perfiles de candidatos ideales basados en el puesto y la industria."
        },
        {
          role: "user",
          content: `Define el perfil ideal del candidato para:
          - Puesto: ${jobTitle}
          - Industria: ${industry}
          
          Proporciona: habilidades técnicas, habilidades blandas, años de experiencia, nivel educativo y características deseables.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error sugiriendo perfil:', error);
    return '';
  }
}

export default openai;

