import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { mockCandidates, usingMockData } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const vacancyId = searchParams.get('vacancyId');
    const status = searchParams.get('status');
    
    // Usar datos mock si MongoDB no está disponible
    if (usingMockData() || !isMongoDBAvailable()) {
      let filteredCandidates = mockCandidates;
      
      if (vacancyId) {
        filteredCandidates = mockCandidates.filter(c => c.vacancyId === vacancyId);
      }
      
      if (status) {
        filteredCandidates = filteredCandidates.filter(c => c.status === status);
      }
      
      return NextResponse.json({ 
        success: true, 
        data: filteredCandidates,
        mock: true 
      });
    }
    
    // Usar MongoDB si está disponible
    const query: any = {};
    if (vacancyId) query.vacancyId = vacancyId;
    if (status) query.status = status;
    
    const candidates = await Candidate.find(query)
      .populate('vacancyId')
      .sort({ appliedAt: -1 });
    
    return NextResponse.json({ success: true, data: candidates });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
