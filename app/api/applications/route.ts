import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import Vacancy from '@/models/Vacancy';
import AIAgent from '@/models/AIAgent';
import { analyzeCandidateCV } from '@/lib/openai';
import { sendApplicationConfirmation } from '@/lib/email';
import { sendApplicationConfirmationWhatsApp } from '@/lib/whatsapp';
import { put } from '@vercel/blob';
import { mockVacancies, mockCandidates, usingMockData } from '@/lib/mock-data';
import { aiAgentTemplates } from '@/lib/ai-agent-templates';
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const vacancyId = formData.get('vacancyId') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const cvFile = formData.get('cv') as File;
    
    if (!vacancyId || !fullName || !email || !phone || !cvFile) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }
    
    // Obtener información de la vacante
    let vacancy;
    if (usingMockData() || !isMongoDBAvailable()) {
      vacancy = mockVacancies.find(v => v._id === vacancyId);
    } else {
      vacancy = await Vacancy.findById(vacancyId);
    }
    
    if (!vacancy) {
      return NextResponse.json(
        { success: false, error: 'Vacante no encontrada' },
        { status: 404 }
      );
    }
    
    if (vacancy.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Esta vacante no está disponible' },
        { status: 400 }
      );
    }
    
    // Guardar CV en Vercel Blob (almacenamiento en la nube)
    const bytes = await cvFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    let cvUrl: string;
    
    // Si está en producción (Vercel), usar Blob Storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('☁️  Subiendo CV a Vercel Blob:', fileName);
      const blob = await put(`cvs/${fileName}`, buffer, {
        access: 'public',
        contentType: cvFile.type || 'application/pdf',
      });
      cvUrl = blob.url;
      console.log('✅ CV subido a Blob:', cvUrl);
    } else {
      // En desarrollo local, guardar en /public/uploads (fallback)
      console.log('💾 Guardando CV localmente:', fileName);
      const { writeFile, mkdir } = await import('fs/promises');
      const path = await import('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Directory already exists
      }
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      cvUrl = `/uploads/cvs/${fileName}`;
      console.log('✅ CV guardado localmente');
    }
    
    // Extraer texto real del PDF usando pdf-parse
    let cvText = `CV de ${fullName}`; // Fallback si falla la extracción
    try {
      console.log('📄 Extrayendo texto del PDF:', fileName);
      const pdfData = await pdfParse(buffer);
      
      if (pdfData.text && pdfData.text.trim().length > 0) {
        cvText = pdfData.text;
        console.log('✅ Texto extraído exitosamente:', cvText.length, 'caracteres');
        console.log('📝 Primeros 200 caracteres:', cvText.substring(0, 200));
      } else {
        console.log('⚠️ PDF vacío o sin texto extraíble, usando fallback');
      }
    } catch (error) {
      console.error('⚠️ Error extrayendo texto del PDF:', error);
      console.log('📝 Usando fallback: texto básico con nombre del candidato');
    }
    
      // Obtener el agente de IA asociado a la vacante
      let aiAgent = null;
      const vacancyWithAgent = vacancy as any;
      if (vacancyWithAgent.aiAgentId) {
        if (usingMockData() || !isMongoDBAvailable()) {
          // Buscar en plantillas mock
          aiAgent = aiAgentTemplates.find(a => a.name === vacancyWithAgent.aiAgentId);
        } else {
          try {
            aiAgent = await AIAgent.findById(vacancyWithAgent.aiAgentId);
          } catch (error) {
            console.log('⚠️  No se pudo cargar el agente de IA');
          }
        }
      }
    
    // Analizar CV con IA usando el agente específico
    let aiAnalysis = {
      score: 50,
      classification: 'potential' as 'ideal' | 'potential' | 'no-fit',
      summary: 'Análisis pendiente',
      strengths: [] as string[],
      concerns: [] as string[]
    };
    
    // Variable para la clasificación mapeada (en español para MongoDB)
    let mappedClassification: 'ideal' | 'potencial' | 'no perfila' = 'potencial';
    
    try {
      aiAnalysis = await analyzeCandidateCV(
        cvText,
        vacancy.optimizedDescription || vacancy.description,
        vacancy.requiredSkills || [],
        aiAgent
      );
      
      // 🔧 MAPEAR clasificaciones de inglés a español para MongoDB
      const classificationMap: Record<string, 'ideal' | 'potencial' | 'no perfila'> = {
        'ideal': 'ideal',
        'potential': 'potencial',
        'no-fit': 'no perfila',
        'no fit': 'no perfila'  // por si viene con espacio
      };
      
      // Convertir clasificación si es necesario
      const originalClassification = aiAnalysis.classification;
      if (originalClassification in classificationMap) {
        mappedClassification = classificationMap[originalClassification];
      } else {
        // Fallback si viene algo inesperado
        console.log('⚠️ Clasificación inesperada:', originalClassification, '- usando fallback');
        mappedClassification = 'potencial';
      }
      
      console.log('🤖 Análisis IA completado - Score:', aiAnalysis.score, 'Clasificación:', mappedClassification);
      
    } catch (error) {
      console.error('⚠️  Error analizando CV (requiere OPENAI_API_KEY):', error);
    }
    
      // Crear candidato con análisis completo
      let candidate;
      if (usingMockData() || !isMongoDBAvailable()) {
        // En modo mock, simular creación
        candidate = {
          _id: `candidate-${Date.now()}`,
          vacancyId,
          fullName,
          email,
          phone,
          cvPath: cvUrl,
          status: 'applied',
          aiScore: aiAnalysis.score,
          aiClassification: mappedClassification,
          aiAnalysis: {
            score: aiAnalysis.score,
            classification: mappedClassification,
            summary: aiAnalysis.summary,
            strengths: aiAnalysis.strengths,
            concerns: aiAnalysis.concerns
          },
          appliedAt: new Date().toISOString()
        } as any; // TypeScript cast para compatibilidad con mock
        mockCandidates.push(candidate);
        console.log('✅ Candidato creado en modo mock con score:', aiAnalysis.score, 'clasificación:', mappedClassification);
    } else {
      candidate = await Candidate.create({
        vacancyId,
        fullName,
        email,
        phone,
        cvUrl,
        cvText, // Guardar todo el texto extraído del PDF
        aiScore: aiAnalysis.score,
        aiClassification: mappedClassification,
        aiJustification: aiAnalysis.summary,
        status: 'applied'
      });
      console.log('✅ Candidato creado en DB con score:', aiAnalysis.score, 'clasificación:', mappedClassification);
    }
    
    // Enviar confirmación por email
    try {
      await sendApplicationConfirmation(fullName, email, vacancy.title);
    } catch (error) {
      console.error('Error enviando email:', error);
    }
    
    // Enviar confirmación por WhatsApp (opcional)
    try {
      await sendApplicationConfirmationWhatsApp(fullName, phone, vacancy.title);
    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: candidate,
        message: '¡Aplicación enviada con éxito! Te contactaremos pronto.'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en aplicación:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

