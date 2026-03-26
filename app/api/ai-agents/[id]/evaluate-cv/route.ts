import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AIAgent from '@/models/AIAgent';
import Candidate from '@/models/Candidate';
import { aiAgentTemplates } from '@/lib/ai-agent-templates';
import { analyzeCandidateCV } from '@/lib/openai';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv') as File;
    const name = formData.get('name') as string | null;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const vacancyId = formData.get('vacancyId') as string | null;

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

    // Mapear clasificación al español
    const classMap: Record<string, 'ideal' | 'potencial' | 'no perfila'> = {
      ideal: 'ideal', potential: 'potencial', 'no-fit': 'no perfila',
    };
    const mappedClassification = classMap[result.classification] || 'potencial';

    // Si llegan datos del candidato, crear registro y redirigir
    if (name && email && phone && vacancyId) {
      // Guardar CV
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      let cvUrl: string;
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(`cvs/${fileName}`, buffer, { access: 'public', contentType: 'application/pdf' });
        cvUrl = blob.url;
      } else {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
        try { await mkdir(uploadDir, { recursive: true }); } catch {}
        await writeFile(path.join(uploadDir, fileName), buffer);
        cvUrl = `/uploads/cvs/${fileName}`;
      }

      const candidate = await Candidate.create({
        vacancyId,
        fullName: name,
        email,
        phone,
        cvUrl,
        cvText,
        aiScore: result.score,
        aiClassification: mappedClassification,
        aiJustification: result.summary,
        aiStrengths: result.strengths || [],
        aiConcerns: result.concerns || [],
        status: 'applied',
      });

      return NextResponse.json({
        success: true,
        data: {
          candidateId: candidate._id.toString(),
          score: result.score,
          classification: mappedClassification,
          summary: result.summary,
          strengths: result.strengths || [],
          concerns: result.concerns || [],
          agentName: agent.name,
        },
      });
    }

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
