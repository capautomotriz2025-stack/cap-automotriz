import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AIAgent from '@/models/AIAgent';
import { aiAgentTemplates } from '@/lib/ai-agent-templates';
import { analyzeCandidateCV } from '@/lib/openai';
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    // Validar formato
    const isAllowed = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: 'Solo se permiten archivos PDF' }, { status: 400 });
    }

    // Extraer texto del PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    let cvText = '';
    try {
      const pdfData = await pdfParse(buffer);
      cvText = pdfData.text?.trim() || '';
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'No se pudo leer el PDF. Asegurate de que sea un PDF con texto seleccionable.' },
        { status: 422 }
      );
    }

    if (cvText.length < 100) {
      return NextResponse.json(
        { success: false, error: 'El PDF no tiene suficiente texto para ser analizado. Usá un PDF generado desde Word, Google Docs o LibreOffice.' },
        { status: 422 }
      );
    }

    // Obtener el agente — puede ser template (string ID) o custom (ObjectId)
    await connectDB();
    let agent: any = null;

    // Intentar buscar en templates primero (IDs como "agent-template-1")
    if (params.id.startsWith('agent-template')) {
      const templateIndex = parseInt(params.id.split('-').pop() || '1') - 1;
      agent = aiAgentTemplates[templateIndex] || aiAgentTemplates.find((t: any) => t._id === params.id);
    }

    // Si no es template, buscar en DB
    if (!agent) {
      try {
        agent = await AIAgent.findById(params.id);
      } catch {
        // ID inválido para ObjectId
      }
    }

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agente no encontrado' }, { status: 404 });
    }

    // Construir descripción del puesto desde el agente
    const jobDescription = agent.description || agent.name || 'Evaluación de candidato';
    const requiredSkills: string[] = agent.criteria?.technicalSkills?.required || [];

    // Analizar el CV
    const result = await analyzeCandidateCV(cvText, jobDescription, requiredSkills, agent);

    return NextResponse.json({
      success: true,
      data: {
        score: result.score,
        classification: result.classification,
        summary: result.summary,
        strengths: result.strengths || [],
        concerns: result.concerns || [],
        agentName: agent.name,
        cvChars: cvText.length,
      },
    });
  } catch (error: any) {
    console.error('Error evaluando CV con agente:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error interno' }, { status: 500 });
  }
}
