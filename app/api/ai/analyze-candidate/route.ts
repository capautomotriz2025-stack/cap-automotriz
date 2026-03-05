import { NextRequest, NextResponse } from 'next/server';
import { analyzeCandidateCV } from '@/lib/openai';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Vacancy from '@/models/Vacancy';
import AIAgent from '@/models/AIAgent';
import Notification from '@/models/Notification';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { candidateId } = await request.json();
    
    if (!candidateId) {
      return NextResponse.json(
        { success: false, error: 'ID de candidato es requerido' },
        { status: 400 }
      );
    }
    
    const candidate = await Candidate.findById(candidateId).populate('vacancyId');
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidato no encontrado' },
        { status: 404 }
      );
    }
    
    const vacancy = candidate.vacancyId as any;
    
    if (!vacancy) {
      return NextResponse.json(
        { success: false, error: 'Vacante no encontrada' },
        { status: 404 }
      );
    }

    let aiAgent: any = null;
    if (vacancy.aiAgentId) {
      try {
        aiAgent = await AIAgent.findById(vacancy.aiAgentId);
      } catch (_) {}
    }

    // Re-analizar candidato
    const analysis = await analyzeCandidateCV(
      candidate.cvText || `CV de ${candidate.fullName}`,
      vacancy.optimizedDescription || vacancy.description,
      vacancy.requiredSkills || [],
      aiAgent
    );

    // Clasificación por umbrales: vacante tiene prioridad sobre agente
    const effectiveThresholds = (vacancy.thresholds ?? aiAgent?.thresholds) || { ideal: 80, potential: 65, review: 50 };
    const score = analysis.score ?? 50;
    let mappedClassification: 'ideal' | 'potencial' | 'no perfila' = 'potencial';
    if (score >= effectiveThresholds.ideal) mappedClassification = 'ideal';
    else if (score >= effectiveThresholds.potential) mappedClassification = 'potencial';
    else if (score >= effectiveThresholds.review) mappedClassification = 'potencial';
    else mappedClassification = 'no perfila';
    
    // Actualizar candidato
    const previousScore = candidate.aiScore;
    candidate.aiScore = score;
    candidate.aiClassification = mappedClassification;
    candidate.aiJustification = analysis.summary || analysis.justification;
    await candidate.save();

    // Crear notificación de fin de análisis IA (solo la primera vez que se obtiene score)
    if (!previousScore || previousScore === 0) {
      try {
        await Notification.create({
          type: 'candidate_ai_finished',
          title: 'Análisis IA completado',
          message: `La IA terminó de analizar al candidato "${candidate.fullName}" para la vacante "${vacancy.title}". Puntaje: ${score}/100.`,
          relatedCandidateId: candidate._id,
          relatedVacancyId: vacancy._id,
          read: false,
        });
      } catch (notifError) {
        console.error('Error creando notificación de análisis IA desde /ai/analyze-candidate:', notifError);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: { ...analysis, classification: mappedClassification, score }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

