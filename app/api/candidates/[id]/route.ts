import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Vacancy from '@/models/Vacancy'; // needed for populate('vacancyId')
import Notification from '@/models/Notification';
import { mockCandidates, usingMockData } from '@/lib/mock-data';
import { 
  sendInterviewInvitation, 
  sendEvaluationNotification, 
  sendOfferLetter, 
  sendRejectionNotification 
} from '@/lib/email';

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
    
    // Obtener el candidato actual para comparar el estado
    let oldCandidate: any = null;
    
    // Usar datos mock si MongoDB no está disponible
    if (usingMockData() || !isMongoDBAvailable()) {
      const index = mockCandidates.findIndex(c => c._id === params.id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Candidato no encontrado' },
          { status: 404 }
        );
      }
      
      oldCandidate = { ...mockCandidates[index] };
      mockCandidates[index] = { ...mockCandidates[index], ...body };
      const updatedCandidate = mockCandidates[index];
      
      // Enviar email si cambió el estado a uno que requiere notificación
      if (body.status && body.status !== oldCandidate.status) {
        await sendStatusChangeEmail(updatedCandidate, oldCandidate.status, body.status);
      }
      
      return NextResponse.json({ success: true, data: updatedCandidate, mock: true });
    }
    
    // Obtener el candidato antes de actualizar
    oldCandidate = await Candidate.findById(params.id).populate('vacancyId');
    const updateData: Record<string, unknown> = { ...body };
    if (body.status === 'hired' && !oldCandidate?.hiredAt) {
      updateData.hiredAt = new Date();
    }
    const candidate = await Candidate.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('vacancyId');
    
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidato no encontrado' },
        { status: 404 }
      );
    }
    
    // Enviar email si cambió el estado a uno que requiere notificación
    if (body.status && oldCandidate && body.status !== oldCandidate.status) {
      await sendStatusChangeEmail(candidate, oldCandidate.status, body.status);
    }

    // Crear notificaciones adicionales:
    // 1) Fin de análisis IA (cuando se recibe aiScore por primera vez)
    if (
      typeof body.aiScore === 'number' &&
      (typeof oldCandidate.aiScore !== 'number' || oldCandidate.aiScore === 0)
    ) {
      try {
        const vacancyTitle =
          (candidate as any).vacancyId?.title || (candidate as any).vacancyTitle || 'N/A';
        await Notification.create({
          type: 'candidate_ai_finished',
          title: 'Análisis IA completado',
          message: `La IA terminó de analizar al candidato "${candidate.fullName}" para la vacante "${vacancyTitle}". Puntaje: ${candidate.aiScore}/100.`,
          relatedCandidateId: candidate._id,
          relatedVacancyId: (candidate as any).vacancyId?._id,
          read: false,
        });
      } catch (notifError) {
        console.error('Error creando notificación de análisis IA:', notifError);
      }
    }

    // 2) Cambios de estado clave
    const watchedStatuses: Record<string, string> = {
      evaluation: 'A pruebas',
      'interview-boss': 'A entrevista jefe',
      offer: 'Acepto oferta',
    };
    if (body.status && oldCandidate && body.status !== oldCandidate.status) {
      const label = watchedStatuses[body.status];
      if (label) {
        try {
          const vacancyTitle =
            (candidate as any).vacancyId?.title || (candidate as any).vacancyTitle || 'N/A';
          await Notification.create({
            type: 'candidate_status_changed',
            title: `Candidato ${label}`,
            message: `El candidato "${candidate.fullName}" ha pasado al estado "${label}" en el proceso de "${vacancyTitle}".`,
            relatedCandidateId: candidate._id,
            relatedVacancyId: (candidate as any).vacancyId?._id,
            read: false,
          });
        } catch (notifError) {
          console.error('Error creando notificación de cambio de estado:', notifError);
        }
      }
    }
    
    return NextResponse.json({ success: true, data: candidate });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Función para enviar email según el cambio de estado
async function sendStatusChangeEmail(
  candidate: any,
  oldStatus: string,
  newStatus: string
) {
  const candidateName = candidate.fullName || candidate.name || 'Estimado candidato';
  const candidateEmail = candidate.email;
  const vacancyTitle = candidate.vacancyId?.title || candidate.vacancyTitle || 'la vacante';
  
  console.log(`\n📧 ===== ENVIANDO EMAIL POR CAMBIO DE ESTADO =====`);
  console.log(`👤 Candidato: ${candidateName}`);
  console.log(`📧 Email: ${candidateEmail}`);
  console.log(`📊 Estado anterior: ${oldStatus}`);
  console.log(`📊 Estado nuevo: ${newStatus}`);
  
  try {
    let emailResult;
    
    switch (newStatus) {
      case 'interview':
        console.log('📧 Enviando invitación a entrevista...');
        emailResult = await sendInterviewInvitation(
          candidateName,
          candidateEmail,
          vacancyTitle,
          'Próximamente te contactaremos para coordinar la fecha y hora'
        );
        break;
        
      case 'evaluation':
        console.log('📧 Enviando notificación de evaluación...');
        emailResult = await sendEvaluationNotification(
          candidateName,
          candidateEmail,
          vacancyTitle
        );
        break;
        
      case 'offer':
        console.log('📧 Enviando notificación de oferta...');
        emailResult = await sendOfferLetter(
          candidateName,
          candidateEmail,
          vacancyTitle,
          'Nos complace extenderte una oferta de trabajo. Próximamente te contactaremos con los detalles.'
        );
        break;
        
      case 'rejected':
        console.log('📧 Enviando notificación de rechazo...');
        emailResult = await sendRejectionNotification(
          candidateName,
          candidateEmail,
          vacancyTitle
        );
        break;
        
      default:
        console.log(`⚠️  Estado ${newStatus} no requiere email automático`);
        return;
    }
    
    if (emailResult?.success) {
      console.log('✅ Email enviado exitosamente');
    } else {
      console.log('⚠️  Error al enviar email:', emailResult?.error);
    }
    
    console.log('📧 ===== FIN ENVÍO DE EMAIL =====\n');
  } catch (error) {
    console.error('❌ Error al enviar email por cambio de estado:', error);
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
