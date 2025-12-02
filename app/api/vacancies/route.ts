import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';
import { optimizeJobDescription } from '@/lib/openai';
import { mockVacancies, usingMockData } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
      // Usar datos mock si MongoDB no está disponible
      if (usingMockData() || !isMongoDBAvailable()) {
      let filteredVacancies = mockVacancies;
      if (status) {
        filteredVacancies = mockVacancies.filter(v => v.status === status);
      }
      return NextResponse.json({ success: true, data: filteredVacancies, mock: true });
    }
    
    const query = status ? { status } : {};
    const vacancies = await Vacancy.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: vacancies });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Optimizar descripción con IA si se solicita
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
    
    // Si se publica, agregar fecha de publicación
    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date();
    }
    
    // En modo mock, simular creación exitosa
    if (usingMockData() || !isMongoDBAvailable()) {
      const newVacancy = {
        _id: `mock-${Date.now()}`,
        ...body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockVacancies.push(newVacancy);
      return NextResponse.json(
        { success: true, data: newVacancy, mock: true },
        { status: 201 }
      );
    }
    
    const vacancy = await Vacancy.create(body);
    return NextResponse.json(
      { success: true, data: vacancy },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

