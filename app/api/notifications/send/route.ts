import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { sendEmail } from '@/lib/email';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const {
      candidateId,
      type, // 'email' | 'whatsapp' | 'both'
      subject,
      message
    } = await request.json();
    
    if (!candidateId || !type || !message) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }
    
    const candidate = await Candidate.findById(candidateId);
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidato no encontrado' },
        { status: 404 }
      );
    }
    
    const results: any = {};
    
    // Enviar email
    if (type === 'email' || type === 'both') {
      const emailResult = await sendEmail(
        candidate.email,
        subject || 'Actualización de tu aplicación',
        message
      );
      results.email = emailResult;
      
      // Registrar comunicación
      candidate.communications.push({
        type: 'email',
        message: message,
        sentAt: new Date()
      });
    }
    
    // Enviar WhatsApp
    if (type === 'whatsapp' || type === 'both') {
      const whatsappResult = await sendWhatsAppMessage(
        candidate.phone,
        message
      );
      results.whatsapp = whatsappResult;
      
      // Registrar comunicación
      candidate.communications.push({
        type: 'whatsapp',
        message: message,
        sentAt: new Date()
      });
    }
    
    await candidate.save();
    
    return NextResponse.json({
      success: true,
      data: results,
      message: 'Notificación enviada exitosamente'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

