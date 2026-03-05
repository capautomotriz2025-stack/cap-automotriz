// Generador de CV genérico para candidatos

import { ICandidate } from '@/models/Candidate';
import { IVacancy } from '@/models/Vacancy';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface GenericCVData {
  summary: string[]; // 5 puntos de resumen
  technicalTestScore?: number;
  generatedAt: Date;
  pdfUrl?: string;
}

/**
 * Genera un CV genérico basado en el CV original y datos del candidato
 */
export async function generateGenericCV(
  candidate: ICandidate,
  vacancy: IVacancy
): Promise<GenericCVData> {
  // Extraer información del CV original
  const cvText = candidate.cvText || '';
  
  // Generar los 5 puntos de resumen
  const summary: string[] = [];
  
  // 1. Experiencia profesional
  const experienceSummary = extractExperience(cvText, candidate, vacancy);
  summary.push(experienceSummary);
  
  // 2. Profesión y años de experiencia
  const professionSummary = extractProfession(cvText, candidate, vacancy);
  summary.push(professionSummary);
  
  // 3. Trabajos anteriores (resumen)
  const previousJobsSummary = extractPreviousJobs(cvText, candidate);
  summary.push(previousJobsSummary);
  
  // 4. Puntaje del CV original
  const cvScoreSummary = `Puntaje de evaluación del CV: ${candidate.aiScore}/100 - Clasificación: ${candidate.aiClassification}`;
  summary.push(cvScoreSummary);
  
  // 5. Puntaje de pruebas técnicas (se agregará manualmente por admin)
  const technicalTestSummary = candidate.genericCV?.technicalTestScore 
    ? `Puntaje de pruebas técnicas: ${candidate.genericCV.technicalTestScore}/100`
    : 'Puntaje de pruebas técnicas: Pendiente de evaluación';
  summary.push(technicalTestSummary);
  
  // Generar PDF
  const pdfUrl = await generateGenericCVPDF(candidate, vacancy, summary, candidate.genericCV?.technicalTestScore);
  
  return {
    summary,
    technicalTestScore: candidate.genericCV?.technicalTestScore,
    generatedAt: new Date(),
    pdfUrl
  };
}

/**
 * Extrae información de experiencia del CV
 */
function extractExperience(cvText: string, candidate: ICandidate, vacancy: IVacancy): string {
  // Buscar años de experiencia en el CV
  const yearsMatch = cvText.match(/(\d+)\s*(años?|years?|yr)/i);
  const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
  
  // Buscar palabras clave de experiencia
  const experienceKeywords = ['experiencia', 'experience', 'trabajo', 'work', 'empleo', 'empleado'];
  const hasExperience = experienceKeywords.some(keyword => 
    cvText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (years > 0) {
    return `Experiencia profesional de ${years} años en el área, con conocimientos sólidos en ${vacancy.requiredProfession || 'el sector'}`;
  } else if (hasExperience) {
    return `Experiencia profesional en el área, con conocimientos en ${vacancy.requiredProfession || 'el sector'}`;
  } else {
    return `Candidato con potencial en ${vacancy.requiredProfession || 'el área'}, buscando oportunidad de desarrollo profesional`;
  }
}

/**
 * Extrae información de profesión
 */
function extractProfession(cvText: string, candidate: ICandidate, vacancy: IVacancy): string {
  const profession = vacancy.requiredProfession || 'Profesional';
  
  // Intentar extraer años de experiencia del CV
  const yearsMatch = cvText.match(/(\d+)\s*(años?|years?|yr)/i);
  const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
  
  if (years > 0) {
    return `Profesión: ${profession} con ${years} años de experiencia en el campo`;
  } else {
    return `Profesión: ${profession}, en proceso de desarrollo profesional`;
  }
}

/**
 * Extrae información de trabajos anteriores
 */
function extractPreviousJobs(cvText: string, candidate: ICandidate): string {
  // Buscar patrones comunes de trabajos en el CV
  const jobPatterns = [
    /(desarrollador|developer|ingeniero|engineer|analista|analyst|diseñador|designer|gerente|manager)/gi,
    /(empresa|company|corporación|corporation)/gi
  ];
  
  const foundJobs: string[] = [];
  jobPatterns.forEach(pattern => {
    const matches = cvText.match(pattern);
    if (matches) {
      foundJobs.push(...matches.slice(0, 3));
    }
  });
  
  if (foundJobs.length > 0) {
    const uniqueJobs = [...new Set(foundJobs)].slice(0, 3);
    return `Trabajos anteriores: Experiencia en ${uniqueJobs.join(', ')} y roles relacionados`;
  } else {
    return 'Trabajos anteriores: Experiencia profesional en el sector';
  }
}

/**
 * Genera el PDF del CV genérico usando pdf-lib (compatible con Next.js)
 * Usa la misma lógica de guardado que los CVs originales
 */
async function generateGenericCVPDF(
  candidate: ICandidate,
  vacancy: IVacancy,
  summary: string[],
  technicalTestScore?: number
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
    page.drawText('CV GENÉRICO', {
      x: margin,
      y: yPosition,
      size: 20,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 35;

    // Sección: Datos personales
    page.drawText('DATOS PERSONALES', {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;

    page.drawText(candidate.fullName, {
      x: margin + 20,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;
    
    page.drawText(candidate.email, {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    
    page.drawText(candidate.phone, {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 35;

    // Sección: Experiencia laboral
    page.drawText('EXPERIENCIA LABORAL', {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;
    
    // Puntos de resumen (usados como bullets de experiencia y logros)
    summary.forEach((point, index) => {
      if (yPosition < margin + 50) {
        // Nueva página si es necesario
        page = pdfDoc.addPage([595, 842]);
        yPosition = page.getSize().height - margin;
      }
      
      const text = `${index + 1}. ${point}`;
      const lines = wrapText(text, width - 2 * margin - 40, 11, helveticaFont);
      
      lines.forEach(line => {
        page.drawText(line, {
          x: margin + 20,
          y: yPosition,
          size: 11,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
      });
      yPosition -= 5;
    });
    
    yPosition -= 25;

    // Sección: Educación
    if (yPosition < margin + 100) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = page.getSize().height - margin;
    }

    page.drawText('EDUCACIÓN', {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;

    const educationText = vacancy.educationLevel
      ? `Nivel educativo requerido para la posición: ${vacancy.educationLevel}.`
      : 'Nivel educativo: Información no especificada en la vacante.';
    const educationLines = wrapText(educationText, width - 2 * margin - 20, 11, helveticaFont);
    educationLines.forEach((line) => {
      page.drawText(line, {
        x: margin + 20,
        y: yPosition,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    });

    yPosition -= 25;

    // INFORMACIÓN DE LA POSICIÓN
    if (yPosition < margin + 100) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = page.getSize().height - margin;
    }
    
    page.drawText('INFORMACIÓN DE LA POSICIÓN', {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;
    
    page.drawText(`Puesto: ${vacancy.title}`, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    
    page.drawText(`Departamento: ${vacancy.department}`, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    
    if (vacancy.requiredProfession) {
      page.drawText(`Profesión Requerida: ${vacancy.requiredProfession}`, {
        x: margin + 20,
        y: yPosition,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    }
    
    // Footer
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
    const fileName = `generic-cv-${candidate._id}-${Date.now()}.pdf`;
    let pdfUrl: string;
    
    // Si está en producción (Vercel), usar Blob Storage (igual que los CVs originales)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('☁️  Subiendo CV genérico a Vercel Blob:', fileName);
      const blob = await put(`cvs/${fileName}`, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      });
      pdfUrl = blob.url;
      console.log('✅ CV genérico subido a Blob:', pdfUrl);
    } else {
      // En desarrollo local, guardar en /public/uploads (fallback)
      console.log('💾 Guardando CV genérico localmente:', fileName);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Directory already exists
      }
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, pdfBuffer);
      pdfUrl = `/uploads/cvs/${fileName}`;
      console.log('✅ CV genérico guardado localmente');
    }
    
    return pdfUrl;
  } catch (error) {
    console.error('Error generando PDF:', error);
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
  
  // Aproximación: Helvetica tiene ~0.6 * fontSize de ancho por carácter
  const charWidth = fontSize * 0.6;
  const maxChars = Math.floor(maxWidth / charWidth);
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    
    // Si la línea excede el ancho máximo, empezar una nueva línea
    if (testLine.length > maxChars && currentLine) {
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
