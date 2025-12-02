import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';
import { optimizeJobDescription } from '@/lib/openai';
import { mockVacancies, usingMockData } from '@/lib/mock-data';

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
    
    // Actualizar fechas según estado
    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date();
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
      
      mockVacancies[index] = { ...mockVacancies[index], ...body, updatedAt: new Date() };
      return NextResponse.json({ success: true, data: mockVacancies[index], mock: true });
    }
    
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

