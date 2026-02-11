import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';
import { mockVacancies, usingMockData } from '@/lib/mock-data';

// Función para calcular la fecha de expiración basada en timecv
function calculateTimecvExpiresAt(timecv: string, startDate: Date = new Date()): Date {
  const expiresAt = new Date(startDate);
  
  switch (timecv) {
    case '1 semana':
      expiresAt.setDate(expiresAt.getDate() + 7);
      break;
    case '1 mes':
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      break;
    case '2 meses':
      expiresAt.setMonth(expiresAt.getMonth() + 2);
      break;
    case '3 meses':
      expiresAt.setMonth(expiresAt.getMonth() + 3);
      break;
    case '6 meses':
      expiresAt.setMonth(expiresAt.getMonth() + 6);
      break;
    case '1 año':
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      break;
    default:
      return expiresAt;
  }
  
  return expiresAt;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const { timecv } = body;
    
    if (!timecv) {
      return NextResponse.json(
        { success: false, error: 'timecv es requerido' },
        { status: 400 }
      );
    }
    
    const validTimecvOptions = ['1 semana', '1 mes', '2 meses', '3 meses', '6 meses', '1 año'];
    if (!validTimecvOptions.includes(timecv)) {
      return NextResponse.json(
        { success: false, error: 'timecv inválido. Opciones válidas: ' + validTimecvOptions.join(', ') },
        { status: 400 }
      );
    }
    
    // En modo mock, simular actualización
    if (usingMockData() || !isMongoDBAvailable()) {
      const index = mockVacancies.findIndex(v => v._id === params.id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Vacante no encontrada' },
          { status: 404 }
        );
      }
      
      const startDate = (mockVacancies[index] as any).publishedAt 
        ? new Date((mockVacancies[index] as any).publishedAt) 
        : new Date();
      const timecvExpiresAt = calculateTimecvExpiresAt(timecv, startDate);
      
      (mockVacancies[index] as any).timecv = timecv;
      (mockVacancies[index] as any).timecvExpiresAt = timecvExpiresAt.toISOString();
      (mockVacancies[index] as any).updatedAt = new Date().toISOString();
      
      return NextResponse.json({ success: true, data: mockVacancies[index], mock: true });
    }
    
    // Obtener la vacante para usar publishedAt como fecha base
    const vacancy = await Vacancy.findById(params.id);
    
    if (!vacancy) {
      return NextResponse.json(
        { success: false, error: 'Vacante no encontrada' },
        { status: 404 }
      );
    }
    
    // Calcular fecha de expiración basada en publishedAt o createdAt
    const startDate = vacancy.publishedAt 
      ? new Date(vacancy.publishedAt) 
      : vacancy.createdAt 
        ? new Date(vacancy.createdAt) 
        : new Date();
    const timecvExpiresAt = calculateTimecvExpiresAt(timecv, startDate);
    
    const updatedVacancy = await Vacancy.findByIdAndUpdate(
      params.id,
      { timecv, timecvExpiresAt },
      { new: true, runValidators: true }
    );
    
    if (!updatedVacancy) {
      return NextResponse.json(
        { success: false, error: 'Vacante no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedVacancy });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
