import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import Vacancy from '@/models/Vacancy';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('relatedVacancyId', 'title')
      .populate('relatedCandidateId', 'fullName');
    
    const unreadCount = await Notification.countDocuments({ read: false });
    
    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint para verificar y crear notificaciones de vacantes que terminaron su tiempo
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const now = new Date();
    
    // Buscar vacantes publicadas que tienen fecha límite y ya pasó
    const expiredVacancies = await Vacancy.find({
      status: 'published',
      applicationDeadline: { $exists: true, $lte: now }
    });
    
    const createdNotifications = [];
    
    for (const vacancy of expiredVacancies) {
      // Verificar si ya existe una notificación para esta vacante
      const existingNotification = await Notification.findOne({
        type: 'vacancy_deadline',
        relatedVacancyId: vacancy._id
      });
      
      if (!existingNotification) {
        const notification = await Notification.create({
          type: 'vacancy_deadline',
          title: `Tiempo de recepción de CVs finalizado`,
          message: `La vacante "${vacancy.title}" ha terminado su período de recepción de CVs. Fecha límite: ${new Date(vacancy.applicationDeadline!).toLocaleDateString('es-MX')}`,
          relatedVacancyId: vacancy._id,
          read: false
        });
        
        createdNotifications.push(notification);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Se crearon ${createdNotifications.length} notificaciones`,
      data: createdNotifications
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
