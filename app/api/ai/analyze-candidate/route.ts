import { NextRequest, NextResponse } from 'next/server';
import { analyzeCandidateCV } from '@/lib/openai';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Vacancy from '@/models/Vacancy';

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
    
    // Re-analizar candidato
    const analysis = await analyzeCandidateCV(
      candidate.cvText || `CV de ${candidate.fullName}`,
      vacancy.optimizedDescription || vacancy.description,
      vacancy.requiredSkills
    );
    
    // Actualizar candidato
    candidate.aiScore = analysis.score;
    candidate.aiClassification = analysis.classification;
    candidate.aiJustification = analysis.justification;
    await candidate.save();
    
    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

