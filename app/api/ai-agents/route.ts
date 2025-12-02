import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import AIAgent from '@/models/AIAgent';
import { aiAgentTemplates } from '@/lib/ai-agent-templates';
import { usingMockData } from '@/lib/mock-data';

// Mock data para agentes cuando no hay MongoDB
let mockAgents = aiAgentTemplates.map((template, index) => ({
  ...template,
  _id: (template as any)._id || `agent-template-${index + 1}`,
  createdAt: (template as any).createdAt || `2025-01-${10 + index}T00:00:00.000Z`,
  updatedAt: (template as any).updatedAt || `2025-01-${10 + index}T00:00:00.000Z`,
}));

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const isTemplate = searchParams.get('isTemplate');
    
    // Intentar conectar a MongoDB
    await connectDB();
    
    // Si MongoDB no está disponible, usar mock data
    if (!isMongoDBAvailable()) {
      console.log('📦 Usando mock agents (MongoDB no disponible)');
      let filtered = mockAgents;
      
      if (category) {
        filtered = filtered.filter(a => a.category === category);
      }
      
      if (isTemplate !== null) {
        const templateBool = isTemplate === 'true';
        filtered = filtered.filter(a => a.isTemplate === templateBool);
      }
      
      return NextResponse.json({ 
        success: true, 
        data: filtered,
        mock: true 
      });
    }
    
    // Intentar obtener desde MongoDB
    const query: any = {};
    if (category) query.category = category;
    if (isTemplate !== null) query.isTemplate = isTemplate === 'true';
    
    const agents = await AIAgent.find(query).sort({ isTemplate: -1, usageCount: -1 });
    
    // Si MongoDB está vacío, devolver mock data
    if (agents.length === 0) {
      console.log('📦 MongoDB vacío, usando mock agents');
      let filtered = mockAgents;
      
      if (category) {
        filtered = filtered.filter(a => a.category === category);
      }
      
      if (isTemplate !== null) {
        const templateBool = isTemplate === 'true';
        filtered = filtered.filter(a => a.isTemplate === templateBool);
      }
      
      return NextResponse.json({ 
        success: true, 
        data: filtered,
        mock: true 
      });
    }
    
    return NextResponse.json({ success: true, data: agents });
  } catch (error: any) {
    console.error('❌ Error en API ai-agents:', error);
    // En caso de error, devolver mock data
    return NextResponse.json({ 
      success: true, 
      data: mockAgents,
      mock: true 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Usar datos mock si MongoDB no está disponible
    if (usingMockData() || !isMongoDBAvailable()) {
      const newAgent = {
        ...body,
        _id: `agent-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      };
      mockAgents.push(newAgent);
      
      return NextResponse.json(
        { success: true, data: newAgent, mock: true },
        { status: 201 }
      );
    }
    
    const agent = await AIAgent.create(body);
    return NextResponse.json(
      { success: true, data: agent },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

