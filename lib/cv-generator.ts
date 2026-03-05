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
  const pdfUrl = await generateGenericCVPDF(
    candidate,
    vacancy,
    summary,
    candidate.genericCV?.technicalTestScore,
    cvText
  );
  
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
  technicalTestScore?: number,
  cvText?: string
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

    // Encabezado: Nombre completo (azul, centrado)
    const fullName = sanitizeForPdf(candidate.fullName || 'NOMBRE COMPLETO APELLIDOS');
    const nameSize = 20;
    const nameWidth = helveticaBoldFont.widthOfTextAtSize(fullName.toUpperCase(), nameSize);
    page.drawText(fullName.toUpperCase(), {
      x: (width - nameWidth) / 2,
      y: yPosition,
      size: nameSize,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    yPosition -= 40;

    // PERFIL PROFESIONAL
    page.drawText('PERFIL PROFESIONAL', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    yPosition -= 18;

    const resumenEvaluacion = sanitizeForPdf(
      summary[0] || 'Resumen de evaluación del candidato no disponible.'
    );
    const notaPerfil = sanitizeForPdf(summary[3] || '');
    const notaPruebas = sanitizeForPdf(summary[4] || '');

    // Resumen de evaluación del candidato (con salto de línea limpio)
    const resumenLabel = 'Resumen de evaluación del candidato: ';
    const resumenLabelWidth = helveticaBoldFont.widthOfTextAtSize(resumenLabel, 10);
    const resumenValueX = margin + resumenLabelWidth;

    page.drawText(resumenLabel, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });

    const resumenLines = wrapText(
      resumenEvaluacion,
      width - resumenValueX - margin,
      10,
      helveticaFont
    );
    let resumenY = yPosition;
    resumenLines.forEach((line, idx) => {
      page.drawText(line, {
        x: resumenValueX,
        y: resumenY,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      resumenY -= 14;
    });
    yPosition = resumenY;

    // Nota evaluación de perfil (también con wrapping)
    if (notaPerfil) {
      const notaLabel = 'Nota evaluación de perfil: ';
      const notaLabelWidth = helveticaBoldFont.widthOfTextAtSize(notaLabel, 10);
      const notaValueX = margin + notaLabelWidth;

      page.drawText(notaLabel, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });

      const notaLines = wrapText(
        notaPerfil,
        width - notaValueX - margin,
        10,
        helveticaFont
      );
      let notaY = yPosition;
      notaLines.forEach((line) => {
        page.drawText(line, {
          x: notaValueX,
          y: notaY,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        notaY -= 14;
      });
      yPosition = notaY;
    }

    // Nota de pruebas
    const notaPruebasTexto =
      technicalTestScore != null
        ? `${technicalTestScore}/100`
        : 'Pendiente de evaluación';
    page.drawText('Nota de pruebas: ', {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(notaPruebasTexto, {
      x: margin + 110,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 24;

    // DATOS PERSONALES
    page.drawText('DATOS PERSONALES', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    yPosition -= 18;

    const salarioTexto = sanitizeForPdf(
      vacancy.salary && vacancy.salary.min && vacancy.salary.max
        ? `${vacancy.salary.min} - ${vacancy.salary.max} ${vacancy.salary.currency || ''}`
        : 'No especificado'
    );

    // Etiquetas en negrita + valor
    const labelValuePairs: Array<[string, string]> = [
      ['Fecha de nacimiento:', 'No disponible'],
      ['Nacionalidad:', 'No disponible'],
      ['Dirección:', 'No disponible'],
      ['Teléfono:', sanitizeForPdf(candidate.phone || 'No disponible')],
      ['Correo electrónico:', sanitizeForPdf(candidate.email || 'No disponible')],
      ['Aspiración salarial:', salarioTexto],
    ];

    labelValuePairs.forEach(([label, value]) => {
      page.drawText(label, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(value, {
        x: margin + 130,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 14;
    });
    yPosition -= 10;

    // EXPERIENCIA LABORAL
    page.drawText('EXPERIENCIA LABORAL', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    yPosition -= 18;

    const experienciaTexto = sanitizeForPdf(summary[2] || summary[0] || '');
    page.drawText('Trabajos anteriores: ', {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    const expLines = wrapText(
      experienciaTexto.replace(/^Trabajos anteriores:\s*/i, ''),
      width - 2 * margin - 130,
      10,
      helveticaFont
    );
    let expY = yPosition;
    expLines.forEach((line) => {
      if (expY < margin + 80) {
        page = pdfDoc.addPage([595, 842]);
        expY = page.getSize().height - margin;
        page.drawText('Trabajos anteriores: ', {
          x: margin,
          y: expY,
          size: 10,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        expY -= 14;
      }
      page.drawText(line, {
        x: margin + 130,
        y: expY,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      expY -= 14;
    });
    yPosition = expY - 2;
    yPosition -= 16;

    // FORMACIÓN PROFESIONAL
    if (yPosition < margin + 100) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = page.getSize().height - margin;
    }

    page.drawText('FORMACIÓN PROFESIONAL', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    yPosition -= 18;

    const profesiones: string[] = [];
    // Intentar extraer formación directamente del CV original
    if (cvText) {
      const fromCv = extractEducationFromCV(cvText);
      profesiones.push(...fromCv.map((p) => sanitizeForPdf(p)));
    }
    if (vacancy.requiredProfession) profesiones.push(sanitizeForPdf(vacancy.requiredProfession));
    if (Array.isArray(vacancy.requiredProfessions)) {
      vacancy.requiredProfessions.forEach((p) => {
        if (p && !profesiones.includes(p)) profesiones.push(p);
      });
    }

    if (profesiones.length === 0) {
      profesiones.push('Profesión no especificada');
    }

    profesiones.slice(0, 3).forEach((prof) => {
      page.drawText('Profesión: ', {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(prof, {
        x: margin + 75,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 14;
      page.drawText('Año: ', {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText('No disponible', {
        x: margin + 50,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 16;
    });

    // REFERENCIAS PERSONALES
    if (yPosition < margin + 120) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = page.getSize().height - margin;
    }

    page.drawText('REFERENCIAS PERSONALES', {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0.3, 0.7),
    });
    yPosition -= 18;

    const refs = (candidate as any).references || [];
    const maxRefs = refs.length > 0 ? refs.slice(0, 2) : [{}, {}];

    maxRefs.forEach((ref: any, index: number) => {
      const nombre = sanitizeForPdf(ref.name || 'No disponible');
      const empresa = sanitizeForPdf(ref.company || 'No disponible');
      const telefono = sanitizeForPdf(ref.phone || 'No disponible');
      const correo = sanitizeForPdf(ref.email || 'No disponible');

      page.drawText('Nombre: ', {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(nombre, {
        x: margin + 60,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 14;
      page.drawText('Empresa: ', {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(empresa, {
        x: margin + 65,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 14;
      page.drawText('Teléfono: ', {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(telefono, {
        x: margin + 70,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 14;
      page.drawText('Correo: ', {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(correo, {
        x: margin + 55,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;
    });
    
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
  const sanitized = sanitizeForPdf(text);
  const words = sanitized.split(' ');
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

/**
 * Intenta extraer líneas de formación académica del CV original
 */
function extractEducationFromCV(cvText: string): string[] {
  const lines = cvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const educationKeywords = [
    /licenciatura/i,
    /ingenier[íi]a/i,
    /ingeniero/i,
    /maestr[ií]a/i,
    /master/i,
    /doctorado/i,
    /bachiller/i,
    /t[eé]cnico/i,
    /universidad/i,
  ];

  const found: string[] = [];
  for (const line of lines) {
    if (educationKeywords.some((re) => re.test(line))) {
      if (!found.includes(line)) {
        found.push(line);
      }
    }
    if (found.length >= 3) break;
  }

  return found.slice(0, 3);
}

/**
 * Elimina caracteres que no puede representar la fuente estándar (WinAnsi)
 * para evitar errores como "WinAnsi cannot encode ..."
 */
function sanitizeForPdf(text: string): string {
  if (!text) return '';
  const allowedExtra = 'áéíóúÁÉÍÓÚñÑüÜ¿¡´`ªºçÇ';
  const result: string[] = [];
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 32;
    const isBasicLatin = code >= 32 && code <= 126;
    const isLatin1 = code >= 160 && code <= 255;
    if (isBasicLatin || isLatin1 || allowedExtra.includes(ch)) {
      result.push(ch);
    }
    // Si no es representable, se omite silenciosamente
  }
  return result.join('');
}
