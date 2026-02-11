import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';
import Notification from '@/models/Notification';
import { optimizeJobDescription } from '@/lib/openai';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Usar datos mock si MongoDB no está disponible
    if (usingMockData() || !isMongoDBAvailable()) {
      const vacancy = mockVacancies.find(v => v._id === params.id);
      
      if (!vacancy) {
        return NextResponse.json(
          { success: false, error: 'Vacante no encontrada' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: vacancy, mock: true });
    }
    
    const vacancy = await Vacancy.findById(params.id);
    
    if (!vacancy) {
      return NextResponse.json(
        { success: false, error: 'Vacante no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: vacancy });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Obtener la vacante actual para comparar estados
    let oldVacancy: any = null;
    
    // Optimizar descripción si se solicita
    if (body.optimizeWithAI && body.description) {
      try {
        const optimizedDescription = await optimizeJobDescription(
          body.description,
          body.title
        );
        body.optimizedDescription = optimizedDescription;
      } catch (error) {
        console.log('⚠️  No se pudo optimizar con IA (requiere OPENAI_API_KEY)');
      }
    }
    
    // Calcular timecvExpiresAt si se actualiza timecv
    if (body.timecv) {
      const startDate = body.publishedAt ? new Date(body.publishedAt) : new Date();
      body.timecvExpiresAt = calculateTimecvExpiresAt(body.timecv, startDate);
    }
    
    // Actualizar fechas según estado
    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date();
      // Si hay timecv y no hay timecvExpiresAt, calcularlo
      if (body.timecv && !body.timecvExpiresAt) {
        body.timecvExpiresAt = calculateTimecvExpiresAt(body.timecv, body.publishedAt);
      }
    }
    if (body.status === 'closed' && !body.closedAt) {
      body.closedAt = new Date();
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
      
      oldVacancy = { ...mockVacancies[index] };
      mockVacancies[index] = { ...mockVacancies[index], ...body, updatedAt: new Date() };
      const updatedVacancy = mockVacancies[index];
      
      // Crear notificación si se cerró la vacante
      if (body.status === 'closed' && oldVacancy.status !== 'closed') {
        // En modo mock, solo loguear
        console.log(`📢 Notificación: Vacante "${updatedVacancy.title}" ha sido cerrada`);
      }
      
      return NextResponse.json({ success: true, data: updatedVacancy, mock: true });
    }
    
    // Obtener la vacante antes de actualizar
    oldVacancy = await Vacancy.findById(params.id);
    
    const vacancy = await Vacancy.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!vacancy) {
      return NextResponse.json(
        { success: false, error: 'Vacante no encontrada' },
        { status: 404 }
      );
    }
    
    // Crear notificación si se cerró la vacante
    if (body.status === 'closed' && oldVacancy && oldVacancy.status !== 'closed') {
      try {
        await Notification.create({
          type: 'vacancy_closed',
          title: 'Vacante Cerrada',
          message: `La vacante "${vacancy.title}" ha sido cerrada. ${body.closedAt ? `Fecha de cierre: ${new Date(body.closedAt).toLocaleDateString('es-MX')}` : ''}`,
          relatedVacancyId: vacancy._id,
          read: false
        });
      } catch (notifError) {
        console.error('Error creando notificación:', notifError);
      }
    }
    
    return NextResponse.json({ success: true, data: vacancy });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // En modo mock, simular eliminación
    if (usingMockData() || !isMongoDBAvailable()) {
      const index = mockVacancies.findIndex(v => v._id === params.id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Vacante no encontrada' },
          { status: 404 }
        );
      }
      
      mockVacancies.splice(index, 1);
      return NextResponse.json({ success: true, data: {}, mock: true });
    }
    
    const vacancy = await Vacancy.findByIdAndDelete(params.id);
    
    if (!vacancy) {
      return NextResponse.json(
        { success: false, error: 'Vacante no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

