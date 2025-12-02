import { NextRequest, NextResponse } from 'next/server';
import { optimizeJobDescription } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { description, title } = await request.json();
    
    if (!description || !title) {
      return NextResponse.json(
        { success: false, error: 'Descripción y título son requeridos' },
        { status: 400 }
      );
    }
    
    const optimizedDescription = await optimizeJobDescription(description, title);
    
    return NextResponse.json({
      success: true,
      data: { optimizedDescription }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

