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
  const questions: InterviewQuestion[] = [];

  // ── 1. TÉCNICAS (3 preguntas distintas) ──────────────────────────────────
  const skills = vacancy.requiredSkills?.slice(0, 3) || [];
  const skillLabel = skills.length > 0 ? skills.join(', ') : vacancy.requiredProfession || 'el área técnica';
  questions.push({
    category: 'Técnicas',
    question: `¿Cuál es tu nivel de experiencia con ${skillLabel}? Describí un proyecto concreto donde hayas aplicado estas habilidades.`,
    purpose: 'Evaluar profundidad de conocimientos técnicos requeridos para el puesto',
  });
  questions.push({
    category: 'Técnicas',
    question: `¿Cuál ha sido el desafío técnico más complejo que enfrentaste relacionado con ${skillLabel}? ¿Cómo lo resolviste?`,
    purpose: 'Evaluar capacidad de resolución de problemas técnicos bajo presión',
  });
  questions.push({
    category: 'Técnicas',
    question: `¿Cómo te mantenés actualizado en ${skillLabel}? Mencioná algún curso, certificación o práctica reciente que hayas realizado.`,
    purpose: 'Evaluar proactividad y compromiso con el desarrollo técnico continuo',
  });

  // ── 2. EXPERIENCIA (3 preguntas distintas) ───────────────────────────────
  const expSummary = candidate.genericCV?.summary?.[0] || '';
  questions.push({
    category: 'Experiencia',
    question: expSummary
      ? `Según tu trayectoria: "${expSummary.substring(0, 150)}". ¿Podés ampliar ese punto y contarnos cómo impactó en los resultados de tu empleador?`
      : `Contanos sobre tu experiencia más relevante para el puesto de ${vacancy.title} y cómo aportó valor a tu organización.`,
    purpose: 'Evaluar experiencia práctica y capacidad de generar impacto',
  });
  questions.push({
    category: 'Experiencia',
    question: '¿Cuál considerás tu logro profesional más importante hasta la fecha? ¿Qué hiciste, cómo lo mediste y qué aprendiste de esa experiencia?',
    purpose: 'Evaluar orientación a resultados y autoconciencia profesional',
  });
  questions.push({
    category: 'Experiencia',
    question: 'Describí una situación en la que tuviste que aprender algo completamente nuevo en poco tiempo para cumplir con una responsabilidad. ¿Cómo lo encaraste?',
    purpose: 'Evaluar capacidad de aprendizaje ágil y gestión del tiempo',
  });

  // ── 3. EVALUACIÓN DEL PERFIL (3 preguntas distintas) ────────────────────
  questions.push({
    category: 'Evaluación del Perfil',
    question: `Tu perfil recibió un puntaje de ${candidate.aiScore}/100 en nuestra evaluación. ¿Qué aspectos de tu experiencia y habilidades considerás que te hacen el candidato ideal para este puesto?`,
    purpose: 'Validar autoconocimiento y alineación con el perfil requerido',
  });
  questions.push({
    category: 'Evaluación del Perfil',
    question: '¿En qué área o competencia creés que podés seguir creciendo para este rol? ¿Qué estás haciendo actualmente para desarrollarla?',
    purpose: 'Evaluar humildad, autocrítica y disposición para el desarrollo continuo',
  });
  const concern = candidate.aiConcerns?.[0];
  questions.push({
    category: 'Evaluación del Perfil',
    question: concern
      ? `Durante la evaluación de tu CV se identificó el siguiente punto a profundizar: "${concern}". ¿Podés darnos más contexto al respecto?`
      : `¿Hubo algún aspecto de tu experiencia que considerás no quedó suficientemente reflejado en tu CV y que sea relevante para este puesto?`,
    purpose: 'Profundizar en áreas de mejora identificadas o información faltante',
  });

  // ── 4. FUNCIONES DEL PUESTO (3 preguntas distintas) ─────────────────────
  const funcFragment = vacancy.mainFunctions?.substring(0, 180) || `las responsabilidades del puesto de ${vacancy.title}`;
  questions.push({
    category: 'Funciones del Puesto',
    question: `Este rol implica: "${funcFragment}...". ¿Cómo tu trayectoria te prepara específicamente para asumir estas funciones desde el primer día?`,
    purpose: 'Evaluar comprensión del rol y transferencia de experiencia',
  });
  questions.push({
    category: 'Funciones del Puesto',
    question: `¿Cuál de las responsabilidades de este puesto considerás que será tu mayor reto? ¿Cómo planearías afrontarlo?`,
    purpose: 'Evaluar autoconsciencia, planificación y proactividad ante desafíos',
  });
  questions.push({
    category: 'Funciones del Puesto',
    question: `Si en tu primer mes detectás que un proceso dentro de tus funciones puede mejorarse, ¿cómo lo abordarías dentro de la organización?`,
    purpose: 'Evaluar iniciativa, diplomacia y orientación a la mejora continua',
  });

  // ── 5. HABILIDADES BLANDAS (3 preguntas distintas) ──────────────────────
  const area1 = vacancy.evaluationAreas?.[0]?.area || 'comunicación';
  const area2 = vacancy.evaluationAreas?.[1]?.area || 'liderazgo';
  questions.push({
    category: 'Habilidades Blandas',
    question: `Una de las competencias clave evaluadas es ${area1}. Danos un ejemplo concreto de cómo la demostraste en un entorno laboral real.`,
    purpose: `Evaluar nivel de competencia en ${area1}`,
  });
  questions.push({
    category: 'Habilidades Blandas',
    question: `Contanos sobre ${area2} en tu experiencia. ¿Lideraste o coordinaste algún equipo o proyecto? ¿Qué resultado obtuviste?`,
    purpose: `Evaluar nivel de competencia en ${area2}`,
  });
  questions.push({
    category: 'Habilidades Blandas',
    question: '¿Cómo manejás situaciones de conflicto con compañeros o superiores? Describí un caso real y cómo lo resolviste.',
    purpose: 'Evaluar inteligencia emocional y manejo de conflictos interpersonales',
  });

  // ── 6. MOTIVACIÓN (3 preguntas distintas) ───────────────────────────────
  questions.push({
    category: 'Motivación',
    question: `¿Qué te llevó a postularte específicamente para el puesto de ${vacancy.title} en ${vacancy.department || 'nuestra organización'}?`,
    purpose: 'Evaluar motivación genuina e interés en el puesto',
  });
  questions.push({
    category: 'Motivación',
    question: '¿Dónde te ves profesionalmente en los próximos 3 a 5 años? ¿Cómo este puesto encaja en ese plan?',
    purpose: 'Evaluar proyección profesional y alineación con la organización',
  });
  questions.push({
    category: 'Motivación',
    question: '¿Qué factores son más importantes para vos en un ambiente de trabajo? ¿Cómo los priorizás al momento de elegir dónde trabajar?',
    purpose: 'Evaluar fit cultural y expectativas sobre el entorno laboral',
  });

  // ── 7. TRABAJO EN EQUIPO (3 preguntas distintas) ─────────────────────────
  questions.push({
    category: 'Trabajo en Equipo',
    question: 'Contanos sobre un proyecto en equipo donde tuviste un rol clave. ¿Qué aportaste y cuál fue el resultado colectivo?',
    purpose: 'Evaluar colaboración, sentido de equipo y contribución activa',
  });
  questions.push({
    category: 'Trabajo en Equipo',
    question: '¿Cómo actuás cuando un compañero de equipo no cumple con su parte del trabajo y eso afecta el resultado del grupo?',
    purpose: 'Evaluar manejo de responsabilidad compartida y comunicación asertiva',
  });
  questions.push({
    category: 'Trabajo en Equipo',
    question: '¿Preferís trabajar de manera autónoma o en equipo? ¿Por qué? Danos un ejemplo de cada modalidad en tu trayectoria.',
    purpose: 'Evaluar flexibilidad y autoconocimiento sobre estilos de trabajo',
  });

  // ── 8. ADAPTABILIDAD (3 preguntas distintas) ─────────────────────────────
  questions.push({
    category: 'Adaptabilidad',
    question: 'Describí una situación en la que tuviste que adaptarte a un cambio inesperado en el trabajo. ¿Qué hiciste y qué resultado obtuviste?',
    purpose: 'Evaluar resiliencia y capacidad de adaptación al cambio',
  });
  questions.push({
    category: 'Adaptabilidad',
    question: 'Contanos sobre una ocasión en que trabajaste bajo mucha presión o con plazos muy ajustados. ¿Cómo organizaste tu tiempo y qué priorizaste?',
    purpose: 'Evaluar gestión del estrés y organización bajo presión',
  });
  questions.push({
    category: 'Adaptabilidad',
    question: '¿Podés contarnos sobre un fracaso o error profesional? ¿Qué aprendiste y cómo cambió tu forma de trabajar a partir de esa experiencia?',
    purpose: 'Evaluar madurez, autocrítica y capacidad de aprendizaje desde el error',
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
    
    page.drawText(sanitize(`Nombre: ${candidate.fullName}`), {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(sanitize(`Email: ${candidate.email}`), {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(sanitize(`Teléfono: ${candidate.phone}`), {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(sanitize(`Puntaje IA: ${candidate.aiScore}/100 - ${candidate.aiClassification}`), {
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
    
    page.drawText(sanitize(`Puesto: ${vacancy.title}`), {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(sanitize(`Departamento: ${vacancy.department}`), {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    if (vacancy.requiredProfession) {
      page.drawText(sanitize(`Profesión Requerida: ${vacancy.requiredProfession}`), {
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
 * Limpia el texto eliminando caracteres de control no soportados por WinAnsi
 */
function sanitize(text: string): string {
  return (text || '')
    .replace(/[\r\n\t]/g, ' ')   // saltos de línea y tabs → espacio
    .replace(/[^\x20-\xFF]/g, '') // eliminar caracteres fuera del rango WinAnsi
    .replace(/  +/g, ' ')         // colapsar múltiples espacios
    .trim();
}

/**
 * Función auxiliar para dividir texto en líneas
 * Usa una aproximación basada en caracteres (Helvetica ~0.6 * fontSize por carácter)
 */
function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
  const words = sanitize(text).split(' ');
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
