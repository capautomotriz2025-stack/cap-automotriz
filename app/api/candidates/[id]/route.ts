import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { mockCandidates, usingMockData } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Usar datos mock si MongoDB no está disponible
    if (usingMockData() || !isMongoDBAvailable()) {
      const candidate = mockCandidates.find(c => c._id === params.id);
      
      if (!candidate) {
        return NextResponse.json(
          { success: false, error: 'Candidato no encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: candidate, mock: true });
    }
    
    const candidate = await Candidate.findById(params.id).populate('vacancyId');
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidato no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: candidate });
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
    
    // Usar datos mock si MongoDB no está disponible
    if (usingMockData() || !isMongoDBAvailable()) {
      const index = mockCandidates.findIndex(c => c._id === params.id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Candidato no encontrado' },
          { status: 404 }
        );
      }
      
      mockCandidates[index] = { ...mockCandidates[index], ...body };
      return NextResponse.json({ success: true, data: mockCandidates[index], mock: true });
    }
    
    const candidate = await Candidate.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('vacancyId');
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidato no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: candidate });
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
    
    // Usar datos mock si MongoDB no está disponible
    if (usingMockData() || !isMongoDBAvailable()) {
      const index = mockCandidates.findIndex(c => c._id === params.id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Candidato no encontrado' },
          { status: 404 }
        );
      }
      
      mockCandidates.splice(index, 1);
      return NextResponse.json({ success: true, data: {}, mock: true });
    }
    
    const candidate = await Candidate.findByIdAndDelete(params.id);
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidato no encontrado' },
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
