import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Vacancy from '@/models/Vacancy';
import { generateGenericCV } from '@/lib/cv-generator';
import { mockCandidates, mockVacancies, usingMockData } from '@/lib/mock-data';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    let candidate: any;
    let vacancy: any;
    
    // Obtener candidato
    if (usingMockData() || !isMongoDBAvailable()) {
      candidate = mockCandidates.find(c => c._id === params.id);
      if (candidate) {
        vacancy = mockVacancies.find(v => v._id === candidate.vacancyId);
      }
    } else {
      candidate = await Candidate.findById(params.id);
      if (candidate) {
        vacancy = await Vacancy.findById(candidate.vacancyId);
      }
    }
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidato no encontrado' },
        { status: 404 }
      );
    }
    
    if (!vacancy) {
      return NextResponse.json(
        { success: false, error: 'Vacante no encontrada' },
        { status: 404 }
      );
    }
    
    // Generar CV genérico
    const genericCVData = await generateGenericCV(candidate, vacancy);
    
    // Actualizar candidato con CV genérico
    if (usingMockData() || !isMongoDBAvailable()) {
      candidate.genericCV = genericCVData;
    } else {
      await Candidate.findByIdAndUpdate(params.id, {
        genericCV: genericCVData
      });
    }
    
    return NextResponse.json({
      success: true,
      data: genericCVData
    });
  } catch (error: any) {
    console.error('Error generando CV genérico:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
