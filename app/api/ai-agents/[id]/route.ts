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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Usar datos mock si MongoDB no está disponible
    if (usingMockData() || !isMongoDBAvailable()) {
      const agent = mockAgents.find(a => a.name === params.id || (a as any)._id === params.id);
      
      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Agente no encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: agent, mock: true });
    }
    
    const agent = await AIAgent.findById(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: agent });
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
      const index = mockAgents.findIndex(a => (a as any)._id === params.id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Agente no encontrado' },
          { status: 404 }
        );
      }
      
      mockAgents[index] = { ...mockAgents[index], ...body, updatedAt: new Date() };
      return NextResponse.json({ success: true, data: mockAgents[index], mock: true });
    }
    
    const agent = await AIAgent.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: agent });
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
      const index = mockAgents.findIndex(a => (a as any)._id === params.id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Agente no encontrado' },
          { status: 404 }
        );
      }
      
      // No permitir eliminar templates
      if (mockAgents[index].isTemplate) {
        return NextResponse.json(
          { success: false, error: 'No se pueden eliminar plantillas del sistema' },
          { status: 403 }
        );
      }
      
      mockAgents.splice(index, 1);
      return NextResponse.json({ success: true, data: {}, mock: true });
    }
    
    const agent = await AIAgent.findById(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      );
    }
    
    // No permitir eliminar templates
    if (agent.isTemplate) {
      return NextResponse.json(
        { success: false, error: 'No se pueden eliminar plantillas del sistema' },
        { status: 403 }
      );
    }
    
    await agent.deleteOne();
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

