// Generador de preguntas de entrevista para candidatos

import { ICandidate } from '@/models/Candidate';
import { IVacancy } from '@/models/Vacancy';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface InterviewQuestion {
  category: string;
  question: string;
  purpose: string;
}

export interface InterviewData {
  questions: InterviewQuestion[];
  generatedAt: Date;
  pdfUrl?: string;
}

/**
 * Genera preguntas de entrevista basadas en el análisis del candidato y la vacante
 */
export async function generateInterview(
  candidate: ICandidate,
  vacancy: IVacancy
): Promise<InterviewData> {
  const baseQuestions: InterviewQuestion[] = [];
  
  // 1. Preguntas técnicas basadas en habilidades requeridas
  if (vacancy.requiredSkills && vacancy.requiredSkills.length > 0) {
    vacancy.requiredSkills.slice(0, 3).forEach(skill => {
      baseQuestions.push({
        category: 'Técnicas',
        question: `¿Cuál es tu experiencia con ${skill}? ¿Puedes darnos un ejemplo de un proyecto donde lo hayas utilizado?`,
        purpose: `Evaluar conocimientos técnicos específicos en ${skill}`
      });
    });
  }
  
  // 2. Preguntas de experiencia basadas en el CV genérico
  if (candidate.genericCV?.summary && candidate.genericCV.summary.length > 0) {
    const experienceSummary = candidate.genericCV.summary[0];
    baseQuestions.push({
      category: 'Experiencia',
      question: `Según tu experiencia: ${experienceSummary}. ¿Puedes contarnos sobre un desafío específico que hayas enfrentado en tu carrera profesional?`,
      purpose: 'Evaluar experiencia práctica y capacidad de resolución de problemas'
    });
  }
  
  // 3. Preguntas basadas en el análisis de IA
  if (candidate.aiJustification) {
    baseQuestions.push({
      category: 'Evaluación',
      question: `Tu perfil ha sido evaluado con un puntaje de ${candidate.aiScore}/100. ¿Qué aspectos de tu experiencia crees que te hacen un buen candidato para este puesto?`,
      purpose: 'Validar autoconocimiento y alineación con el perfil requerido'
    });
  }
  
  // 4. Preguntas específicas del puesto
  if (vacancy.mainFunctions) {
    baseQuestions.push({
      category: 'Funciones del Puesto',
      question: `Este puesto requiere: ${vacancy.mainFunctions.substring(0, 200)}... ¿Cómo tu experiencia se alinea con estas responsabilidades?`,
      purpose: 'Evaluar comprensión del rol y capacidad de desempeño'
    });
  }
  
  // 5. Preguntas de soft skills basadas en áreas de evaluación
  if (vacancy.evaluationAreas && vacancy.evaluationAreas.length > 0) {
    vacancy.evaluationAreas.slice(0, 2).forEach(area => {
      baseQuestions.push({
        category: 'Habilidades Blandas',
        question: `Una de las áreas clave de evaluación es ${area.area} (${area.percentage}%). ¿Puedes darnos un ejemplo de cómo has demostrado estas habilidades en tu trabajo anterior?`,
        purpose: `Evaluar ${area.area}`
      });
    });
  }
  
  // 6. Preguntas sobre motivación
  baseQuestions.push({
    category: 'Motivación',
    question: `¿Qué te motiva a aplicar para el puesto de ${vacancy.title} en ${vacancy.department}?`,
    purpose: 'Evaluar motivación e interés genuino en el puesto'
  });
  
  // 7. Preguntas sobre trabajo en equipo
  baseQuestions.push({
    category: 'Trabajo en Equipo',
    question: 'Cuéntanos sobre una situación donde tuviste que trabajar en equipo para resolver un problema complejo. ¿Cuál fue tu rol y cómo contribuiste?',
    purpose: 'Evaluar habilidades de colaboración y trabajo en equipo'
  });
  
  // 8. Preguntas sobre adaptabilidad
  baseQuestions.push({
    category: 'Adaptabilidad',
    question: 'Describe una situación donde tuviste que adaptarte rápidamente a un cambio inesperado. ¿Cómo manejaste la situación?',
    purpose: 'Evaluar capacidad de adaptación y resiliencia'
  });

  // Asegurar 3 preguntas por categoría (ítem)
  const questionsByCategory: Record<string, InterviewQuestion[]> = {};
  baseQuestions.forEach((q) => {
    if (!questionsByCategory[q.category]) {
      questionsByCategory[q.category] = [];
    }
    questionsByCategory[q.category].push(q);
  });

  const questions: InterviewQuestion[] = [];
  Object.entries(questionsByCategory).forEach(([category, qs]) => {
    if (qs.length >= 3) {
      questions.push(...qs.slice(0, 3));
    } else {
      // Duplicar en ciclo hasta llegar a 3 preguntas por categoría
      let i = 0;
      while (questionsByCategory[category].length < 3) {
        const clone = { ...qs[i % qs.length] };
        questionsByCategory[category].push(clone);
        i += 1;
      }
      questions.push(...questionsByCategory[category]);
    }
  });
  
  // Generar PDF
  const pdfUrl = await generateInterviewPDF(candidate, vacancy, questions);
  
  return {
    questions,
    generatedAt: new Date(),
    pdfUrl
  };
}

/**
 * Genera el PDF de la entrevista usando pdf-lib (compatible con Next.js)
 * Usa la misma lógica de guardado que los CVs originales
 */
async function generateInterviewPDF(
  candidate: ICandidate,
  vacancy: IVacancy,
  questions: InterviewQuestion[]
): Promise<string> {
  try {
    // Crear nuevo documento PDF
    const pdfDoc = await PDFDocument.create();
    
    // Obtener fuentes estándar (incluidas en pdf-lib, no requieren archivos del sistema)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    // Crear página
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;
    
    // Título
    page.drawText('GUÍA DE ENTREVISTA', {
      x: margin,
      y: yPosition,
      size: 20,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;
    
    // Información del Candidato
    page.drawText('Información del Candidato', {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;
    
    page.drawText(`Nombre: ${candidate.fullName}`, {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    
    page.drawText(`Email: ${candidate.email}`, {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    
    page.drawText(`Teléfono: ${candidate.phone}`, {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    
    page.drawText(`Puntaje IA: ${candidate.aiScore}/100 - ${candidate.aiClassification}`, {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;
    
    // Información del Puesto
    page.drawText('Información del Puesto', {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;
    
    page.drawText(`Puesto: ${vacancy.title}`, {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    
    page.drawText(`Departamento: ${vacancy.department}`, {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    
    if (vacancy.requiredProfession) {
      page.drawText(`Profesión Requerida: ${vacancy.requiredProfession}`, {
        x: margin + 20,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    }
    
    yPosition -= 20;
    
    // Agrupar preguntas por categoría
    const questionsByCategory: Record<string, InterviewQuestion[]> = {};
    questions.forEach(q => {
      if (!questionsByCategory[q.category]) {
        questionsByCategory[q.category] = [];
      }
      questionsByCategory[q.category].push(q);
    });
    
    // Agregar preguntas por categoría
    Object.keys(questionsByCategory).forEach(category => {
      if (yPosition < margin + 100) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = page.getSize().height - margin;
      }
      
      page.drawText(category, {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;
      
      questionsByCategory[category].forEach((q, index) => {
        if (yPosition < margin + 50) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = page.getSize().height - margin;
        }
        
        const questionText = `${index + 1}. ${q.question}`;
        const questionLines = wrapText(questionText, width - 2 * margin - 40, 11, helveticaBoldFont);
        
        questionLines.forEach(line => {
          page.drawText(line, {
            x: margin + 20,
            y: yPosition,
            size: 11,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= 15;
        });
        
        const purposeText = `Propósito: ${q.purpose}`;
        const purposeLines = wrapText(purposeText, width - 2 * margin - 60, 9, helveticaObliqueFont);
        
        purposeLines.forEach(line => {
          page.drawText(line, {
            x: margin + 30,
            y: yPosition,
            size: 9,
            font: helveticaObliqueFont,
            color: rgb(0.5, 0.5, 0.5),
          });
          yPosition -= 12;
        });
        
        yPosition -= 10;
      });
      
      yPosition -= 10;
    });
    
    // Footer en la última página
    const footerText = `Generado el ${new Date().toLocaleDateString('es-MX')}`;
    const footerWidth = helveticaObliqueFont.widthOfTextAtSize(footerText, 10);
    page.drawText(footerText, {
      x: (width - footerWidth) / 2,
      y: margin,
      size: 10,
      font: helveticaObliqueFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Generar PDF como buffer
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    
    // Usar la misma lógica de guardado que los CVs originales
    const fileName = `interview-${candidate._id}-${Date.now()}.pdf`;
    let pdfUrl: string;
    
    // Si está en producción (Vercel), usar Blob Storage (igual que los CVs originales)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('☁️  Subiendo entrevista a Vercel Blob:', fileName);
      const blob = await put(`cvs/${fileName}`, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      });
      pdfUrl = blob.url;
      console.log('✅ Entrevista subida a Blob:', pdfUrl);
    } else {
      // En desarrollo local, guardar en /public/uploads (fallback)
      console.log('💾 Guardando entrevista localmente:', fileName);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Directory already exists
      }
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, pdfBuffer);
      pdfUrl = `/uploads/cvs/${fileName}`;
      console.log('✅ Entrevista guardada localmente');
    }
    
    return pdfUrl;
  } catch (error) {
    console.error('Error generando PDF de entrevista:', error);
    throw error;
  }
}

/**
 * Función auxiliar para dividir texto en líneas
 * Usa una aproximación basada en caracteres (Helvetica ~0.6 * fontSize por carácter)
 */
function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;

    if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
