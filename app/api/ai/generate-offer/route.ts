import { NextRequest, NextResponse } from 'next/server';
import { generateOfferLetter } from '@/lib/openai';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { sendOfferLetter } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const {
      candidateId,
      candidateName,
      position,
      salary,
      startDate,
      companyName,
      additionalBenefits,
      sendEmail
    } = await request.json();
    
    if (!candidateName || !position || !salary || !startDate || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }
    
    const offerLetterContent = await generateOfferLetter(
      candidateName,
      position,
      salary,
      startDate,
      companyName,
      additionalBenefits
    );
    
    // Si se proporciona candidateId, guardar en la base de datos
    if (candidateId) {
      const candidate = await Candidate.findByIdAndUpdate(
        candidateId,
        {
          offerLetter: {
            content: offerLetterContent,
            generatedAt: new Date()
          }
        },
        { new: true }
      );
      
      // Enviar por email si se solicita
      if (sendEmail && candidate) {
        await sendOfferLetter(
          candidate.fullName,
          candidate.email,
          position,
          offerLetterContent
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      data: { offerLetter: offerLetterContent }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

