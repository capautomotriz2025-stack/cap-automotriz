import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import AIAgent from '@/models/AIAgent';
import { aiAgentTemplates } from '@/lib/ai-agent-templates';
import { usingMockData } from '@/lib/mock-data';
import { generateSystemPrompt } from '@/lib/prompt-generator';

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
    
    // Obtener todos los agentes de MongoDB
    const dbQuery: any = {};
    if (category) dbQuery.category = category;
    if (isTemplate !== null) dbQuery.isTemplate = isTemplate === 'true';
    
    const dbAgents = await AIAgent.find(dbQuery).sort({ isTemplate: -1, usageCount: -1 });
    
    // Combinar templates del sistema con agentes de MongoDB
    const allAgents: any[] = [];
    
    // 1. Agregar templates del sistema (mockAgents) - siempre incluirlos si no hay filtro o si se piden templates
    if (isTemplate === null || isTemplate === 'true') {
      let systemTemplates = [...mockAgents];
      if (category) {
        systemTemplates = systemTemplates.filter(t => t.category === category);
      }
      allAgents.push(...systemTemplates);
    }
    
    // 2. Agregar todos los agentes de MongoDB (templates y personalizados)
    // Los agentes de MongoDB tienen prioridad sobre los templates del sistema
    allAgents.push(...dbAgents);
    
    // 3. Eliminar duplicados: si un template del sistema tiene el mismo nombre que uno en DB, mantener el de DB
    const uniqueAgents = new Map<string, any>();
    
    // Primero agregar todos los agentes usando _id como clave
    allAgents.forEach(agent => {
      const key = agent._id?.toString() || `template-${agent.name}-${agent.category}`;
      uniqueAgents.set(key, agent);
    });
    
    // Si hay templates del sistema y templates en DB con el mismo nombre, mantener solo los de DB
    const dbTemplateNames = new Set(
      dbAgents.filter(a => a.isTemplate).map((a: any) => a.name)
    );
    
    const finalAgents = Array.from(uniqueAgents.values()).filter(agent => {
      // Si es un template del sistema y hay uno en DB con el mismo nombre, excluirlo
      if (agent.isTemplate && !agent._id && dbTemplateNames.has(agent.name)) {
        return false;
      }
      return true;
    });
    
    // Ordenar: templates primero, luego por usageCount
    finalAgents.sort((a, b) => {
      if (a.isTemplate !== b.isTemplate) {
        return a.isTemplate ? -1 : 1;
      }
      return (b.usageCount || 0) - (a.usageCount || 0);
    });
    
    return NextResponse.json({ success: true, data: finalAgents });
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
    
    // Validar que el prompt esté presente o generarlo automáticamente
    if (!body.systemPrompt || body.systemPrompt.trim() === '') {
      // Si no hay prompt, generarlo automáticamente desde los criterios
      try {
        if (body.name && body.criteria && body.thresholds) {
          body.systemPrompt = generateSystemPrompt({
            name: body.name,
            category: body.category || 'otro',
            description: body.description || '',
            criteria: body.criteria,
            thresholds: body.thresholds,
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Faltan datos requeridos para generar el prompt automáticamente' },
            { status: 400 }
          );
        }
      } catch (error: any) {
        return NextResponse.json(
          { success: false, error: `Error generando prompt: ${error.message}` },
          { status: 400 }
        );
      }
    }
    
    // Validar que el prompt tenga el formato mínimo requerido
    if (!body.systemPrompt.includes('JSON') || !body.systemPrompt.includes('score')) {
      return NextResponse.json(
        { success: false, error: 'El prompt debe incluir instrucciones para responder en formato JSON con score' },
        { status: 400 }
      );
    }
    
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

