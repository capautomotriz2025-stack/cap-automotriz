import { NextResponse } from 'next/server';
import { aiAgentTemplates } from '@/lib/ai-agent-templates';

export async function GET() {
  try {
    const mockAgents = aiAgentTemplates.map((template, index) => ({
      ...template,
      _id: (template as any)._id || `agent-template-${index + 1}`,
      createdAt: (template as any).createdAt || `2024-01-${10 + index}T00:00:00.000Z`,
      updatedAt: (template as any).updatedAt || `2024-01-${10 + index}T00:00:00.000Z`,
    }));

    return NextResponse.json({ 
      success: true, 
      total: mockAgents.length,
      templates: mockAgents.filter(a => a.isTemplate).length,
      custom: mockAgents.filter(a => !a.isTemplate).length,
      data: mockAgents,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

