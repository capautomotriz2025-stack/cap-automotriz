import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const result = await Notification.updateMany(
      { read: false },
      { read: true, readAt: new Date() }
    );
    
    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} notificaciones marcadas como leídas`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
