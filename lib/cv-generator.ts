// Generador de CV genérico para candidatos

import { ICandidate } from '@/models/Candidate';
import { IVacancy } from '@/models/Vacancy';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import openai from '@/lib/openai';

export interface GenericCVData {
  summary: string[];
  technicalTestScore?: number;
  generatedAt: Date;
  pdfUrl?: string;
}

interface ExtractedCVData {
  yearsOfExperience: number;
  currentRole: string;
  previousJobs: Array<{ role: string; company: string; period: string }>;
  education: Array<{ degree: string; institution: string; period: string }>;
  skills: string[];
  languages: string[];
  profileSummary: string;
  nationality: string;
  dateOfBirth: string;
  address: string;
}

/**
 * Extrae datos estructurados del CV usando OpenAI.
 * Si OpenAI no está disponible, usa fallback con regex mejorado.
 */
async function extractCVDataWithAI(cvText: string): Promise<ExtractedCVData> {
  const fallback: ExtractedCVData = {
    yearsOfExperience: 0,
    currentRole: 'Profesional',
    previousJobs: [],
    education: [],
    skills: [],
    languages: [],
    profileSummary: 'Perfil profesional no disponible.',
    nationality: '',
    dateOfBirth: '',
    address: '',
  };

  if (!process.env.OPENAI_API_KEY) return fallbackExtract(cvText);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Eres un extractor de datos de CVs. Devuelve SOLO un JSON válido sin texto adicional.',
        },
        {
          role: 'user',
          content: `Extrae todos los datos del siguiente CV y devuelve este JSON exacto:
{
  "yearsOfExperience": <número total de años de experiencia laboral>,
  "currentRole": "<cargo actual y empresa>",
  "previousJobs": [
    { "role": "<cargo>", "company": "<empresa>", "period": "<fechas>" }
  ],
  "education": [
    { "degree": "<título>", "institution": "<institución>", "period": "<fechas>" }
  ],
  "skills": ["<habilidad1>", "<habilidad2>", ...],
  "languages": ["<idioma nivel>", ...],
  "profileSummary": "<resumen profesional de 2-3 líneas>",
  "nationality": "<nacionalidad o vacío>",
  "dateOfBirth": "<fecha de nacimiento o vacío>",
  "address": "<dirección o vacío>"
}

CV:
${cvText}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1200,
    });

    const raw = completion.choices[0].message.content || '{}';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallbackExtract(cvText);
    const parsed = JSON.parse(match[0]);
    // Fusionar con fallback y normalizar arrays (OpenAI puede devolver null en campos de array)
    return {
      ...fallback,
      ...parsed,
      previousJobs: Array.isArray(parsed.previousJobs) ? parsed.previousJobs : fallback.previousJobs,
      education: Array.isArray(parsed.education) ? parsed.education : fallback.education,
      skills: Array.isArray(parsed.skills) ? parsed.skills : fallback.skills,
      languages: Array.isArray(parsed.languages) ? parsed.languages : fallback.languages,
    };
  } catch (err) {
    console.error('⚠️ extractCVDataWithAI error, usando fallback:', err);
    return fallbackExtract(cvText);
  }
}

/** Extracción de emergencia sin IA (mejorada sobre la versión anterior) */
function fallbackExtract(cvText: string): ExtractedCVData {
  const lines = cvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Años de experiencia: sumar rangos de fechas
  const years = (() => {
    const m = cvText.match(/(\d{4})\s*[-–]\s*(\d{4}|present|actualidad)/gi) || [];
    let total = 0;
    m.forEach(r => {
      const parts = r.match(/(\d{4})\s*[-–]\s*(\d{4}|present|actualidad)/i);
      if (parts) {
        const start = parseInt(parts[1]);
        const end = /present|actual/i.test(parts[2]) ? new Date().getFullYear() : parseInt(parts[2]);
        total += Math.max(0, end - start);
      }
    });
    return total || 0;
  })();

  // Trabajos: buscar líneas con @ o patrones de empresa
  const jobs: Array<{ role: string; company: string; period: string }> = [];
  lines.forEach(line => {
    const m = line.match(/^@?([A-Z][A-Za-z\s]+(?:S\.A\.|SRL|Corp|Inc|Ltd)?)\s*$/);
    if (m) jobs.push({ role: '', company: m[1].trim(), period: '' });
  });

  // Educación
  const eduKeywords = [/licenciatura/i, /ingenier[íi]/i, /t[eé]cnico/i, /universidad/i, /bachelor/i, /university/i, /technician/i];
  const education = lines
    .filter(l => eduKeywords.some(re => re.test(l)))
    .slice(0, 3)
    .map(l => ({ degree: l, institution: '', period: '' }));

  const skills = (cvText.match(/\b(React|Node\.js|TypeScript|MongoDB|Docker|NestJS|NextJS|Kubernetes|AWS|Python|SQL|PHP|Laravel|Angular|Vue|GraphQL|Redis|MySQL|PostgreSQL|Git|CI\/CD|TDD|Scrum|Agile)\b/gi) || [])
    .map(s => s.toLowerCase())
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 10);

  return {
    yearsOfExperience: years,
    currentRole: jobs[0] ? `Profesional en ${jobs[0].company}` : 'Profesional',
    previousJobs: jobs.slice(0, 5),
    education,
    skills,
    languages: [],
    profileSummary: '',
    nationality: '',
    dateOfBirth: '',
    address: '',
  };
}

/**
 * Genera un CV genérico basado en el CV original y datos del candidato
 */
export async function generateGenericCV(
  candidate: ICandidate,
  vacancy: IVacancy
): Promise<GenericCVData> {
  const cvText = candidate.cvText || '';

  // Extraer datos estructurados con IA
  const extracted = await extractCVDataWithAI(cvText);

  const summary: string[] = [];

  // 1. Experiencia profesional
  const expYears = extracted.yearsOfExperience;
  summary.push(
    expYears > 0
      ? `Profesional con ${expYears} años de experiencia. ${extracted.currentRole ? 'Actualmente: ' + extracted.currentRole + '.' : ''} ${extracted.profileSummary || ''}`.trim()
      : `${extracted.currentRole || 'Profesional en el área'}. ${extracted.profileSummary || ''}`.trim()
  );

  // 2. Habilidades técnicas
  summary.push(
    extracted.skills.length > 0
      ? `Habilidades técnicas: ${extracted.skills.slice(0, 8).join(', ')}.`
      : `Habilidades en ${vacancy.requiredProfession || 'el área'}.`
  );

  // 3. Trabajos anteriores
  const jobsList = extracted.previousJobs
    .map(j => `${j.role ? j.role + ' en ' : ''}${j.company}${j.period ? ' (' + j.period + ')' : ''}`)
    .join('; ');
  summary.push(
    jobsList
      ? `Experiencia laboral: ${jobsList}.`
      : 'Experiencia laboral en el sector.'
  );

  // 4. Puntaje del CV original
  summary.push(
    `Puntaje de evaluación del CV: ${candidate.aiScore}/100 - Clasificación: ${candidate.aiClassification}`
  );

  // 5. Puntaje de pruebas técnicas
  summary.push(
    candidate.genericCV?.technicalTestScore
      ? `Puntaje de pruebas técnicas: ${candidate.genericCV.technicalTestScore}/100`
      : 'Puntaje de pruebas técnicas: Pendiente de evaluación'
  );

  const pdfUrl = await generateGenericCVPDF(
    candidate,
    vacancy,
    summary,
    extracted,
    candidate.genericCV?.technicalTestScore
  );

  return {
    summary,
    technicalTestScore: candidate.genericCV?.technicalTestScore,
    generatedAt: new Date(),
    pdfUrl,
  };
}

/**
 * Genera el PDF del CV genérico usando pdf-lib
 */
async function generateGenericCVPDF(
  candidate: ICandidate,
  vacancy: IVacancy,
  summary: string[],
  extracted: ExtractedCVData,
  technicalTestScore?: number
): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const margin = 50;
  let page = pdfDoc.addPage([595, 842]);
  const { width } = page.getSize();
  let y = page.getSize().height - margin;

  const blue = rgb(0, 0.3, 0.7);
  const black = rgb(0, 0, 0);
  const gray = rgb(0.5, 0.5, 0.5);

  function checkPage(needed = 40) {
    if (y < margin + needed) {
      page = pdfDoc.addPage([595, 842]);
      y = page.getSize().height - margin;
    }
  }

  function drawSection(title: string) {
    checkPage(50);
    y -= 6;
    page.drawText(sanitizeForPdf(title), { x: margin, y, size: 12, font: helveticaBoldFont, color: blue });
    y -= 4;
    // Línea separadora
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: blue });
    y -= 14;
  }

  function drawLabelValue(label: string, value: string, labelWidth = 140) {
    checkPage(16);
    page.drawText(sanitizeForPdf(label), { x: margin, y, size: 10, font: helveticaBoldFont, color: black });
    const wrapped = wrapText(value, width - margin - margin - labelWidth, 10, helveticaFont);
    let lineY = y;
    wrapped.forEach((line, i) => {
      if (i > 0) { checkPage(14); lineY = y; }
      page.drawText(sanitizeForPdf(line), { x: margin + labelWidth, y: lineY, size: 10, font: helveticaFont, color: black });
      y -= 14;
    });
  }

  function drawText(text: string, size = 10, font = helveticaFont, color = black, indent = 0) {
    const wrapped = wrapText(text, width - margin * 2 - indent, size, font);
    wrapped.forEach(line => {
      checkPage(size + 4);
      page.drawText(sanitizeForPdf(line), { x: margin + indent, y, size, font, color });
      y -= size + 4;
    });
  }

  // ── ENCABEZADO ──
  const fullName = sanitizeForPdf(candidate.fullName.toUpperCase());
  const nameW = helveticaBoldFont.widthOfTextAtSize(fullName, 22);
  page.drawText(fullName, { x: (width - nameW) / 2, y, size: 22, font: helveticaBoldFont, color: blue });
  y -= 28;

  if (extracted.currentRole) {
    const role = sanitizeForPdf(extracted.currentRole);
    const roleW = helveticaFont.widthOfTextAtSize(role, 11);
    page.drawText(role, { x: (width - roleW) / 2, y, size: 11, font: helveticaFont, color: gray });
    y -= 20;
  }

  // Línea de contacto
  const contactParts = [candidate.email, candidate.phone].filter(Boolean).map(sanitizeForPdf);
  if (contactParts.length > 0) {
    const contact = contactParts.join('  |  ');
    const cW = helveticaFont.widthOfTextAtSize(contact, 9);
    page.drawText(contact, { x: (width - cW) / 2, y, size: 9, font: helveticaFont, color: gray });
    y -= 24;
  }

  // ── PERFIL PROFESIONAL ──
  drawSection('PERFIL PROFESIONAL');
  if (extracted.profileSummary) {
    drawText(extracted.profileSummary, 10, helveticaFont, black);
    y -= 4;
  }
  drawLabelValue('Nota evaluación perfil:', summary[3] || '');
  drawLabelValue('Nota de pruebas:', technicalTestScore != null ? `${technicalTestScore}/100` : 'Pendiente de evaluación');
  y -= 4;

  // ── DATOS PERSONALES ──
  drawSection('DATOS PERSONALES');
  drawLabelValue('Fecha de nacimiento:', extracted.dateOfBirth || 'No disponible');
  drawLabelValue('Nacionalidad:', extracted.nationality || 'No disponible');
  drawLabelValue('Dirección:', extracted.address || vacancy.location || 'No disponible');
  drawLabelValue('Teléfono:', candidate.phone || 'No disponible');
  drawLabelValue('Correo electrónico:', candidate.email || 'No disponible');
  if (vacancy.salary?.min) {
    drawLabelValue('Aspiración salarial:', `${vacancy.salary.min} - ${vacancy.salary.max} ${vacancy.salary.currency || 'MXN'}`);
  }
  if (extracted.languages.length > 0) {
    drawLabelValue('Idiomas:', extracted.languages.join(', '));
  }
  y -= 4;

  // ── EXPERIENCIA LABORAL ──
  drawSection('EXPERIENCIA LABORAL');
  if (extracted.previousJobs.length > 0) {
    extracted.previousJobs.forEach(job => {
      checkPage(30);
      const jobTitle = sanitizeForPdf(`${job.role ? job.role + ' – ' : ''}${job.company}${job.period ? '  ('+job.period+')' : ''}`);
      page.drawText(jobTitle, { x: margin, y, size: 10, font: helveticaBoldFont, color: black });
      y -= 14;
    });
  } else {
    drawText(summary[2] || 'Experiencia en el sector.', 10, helveticaFont, black);
  }
  if (extracted.skills.length > 0) {
    y -= 4;
    drawLabelValue('Habilidades técnicas:', extracted.skills.slice(0, 10).join(', '));
  }
  y -= 4;

  // ── FORMACIÓN PROFESIONAL ──
  drawSection('FORMACIÓN PROFESIONAL');
  if (extracted.education.length > 0) {
    extracted.education.forEach(edu => {
      checkPage(28);
      drawText(`${edu.degree}${edu.institution ? ' – ' + edu.institution : ''}${edu.period ? ' (' + edu.period + ')' : ''}`, 10, helveticaBoldFont, black);
    });
  } else {
    const profs = [vacancy.requiredProfession, ...(vacancy.requiredProfessions || [])].filter(Boolean);
    profs.slice(0, 3).forEach(p => drawText(p!, 10, helveticaFont, black));
  }
  y -= 4;

  // ── REFERENCIAS PERSONALES ──
  drawSection('REFERENCIAS PERSONALES');
  const refs = (candidate as any).references || [];
  if (refs.length > 0) {
    refs.slice(0, 4).forEach((ref: any) => {
      checkPage(40);
      drawText(`${ref.name || ''}${ref.company ? ' – ' + ref.company : ''}`, 10, helveticaBoldFont, black);
      if (ref.phone) drawLabelValue('Teléfono:', ref.phone, 70);
      if (ref.email) drawLabelValue('Email:', ref.email, 70);
      y -= 4;
    });
  } else {
    drawText('Referencias disponibles a solicitud.', 10, helveticaObliqueFont, gray);
  }

  // ── FOOTER ──
  const footer = `Generado el ${new Date().toLocaleDateString('es-MX')}`;
  const fW = helveticaObliqueFont.widthOfTextAtSize(footer, 9);
  page.drawText(footer, { x: (width - fW) / 2, y: margin, size: 9, font: helveticaObliqueFont, color: gray });

  // Guardar PDF
  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  const fileName = `generic-cv-${candidate._id}-${Date.now()}.pdf`;
  let pdfUrl: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`cvs/${fileName}`, pdfBuffer, { access: 'public', contentType: 'application/pdf' });
    pdfUrl = blob.url;
  } else {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
    try { await mkdir(uploadDir, { recursive: true }); } catch {}
    await writeFile(path.join(uploadDir, fileName), pdfBuffer);
    pdfUrl = `/uploads/cvs/${fileName}`;
  }

  return pdfUrl;
}

/** Mide el ancho real con la fuente para un salto de línea preciso */
function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
  const words = sanitizeForPdf(text).split(' ');
  const lines: string[] = [];
  let current = '';

  words.forEach(word => {
    const test = current + (current ? ' ' : '') + word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

/** Elimina caracteres fuera de WinAnsi */
function sanitizeForPdf(text: string): string {
  if (!text) return '';
  const result: string[] = [];
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 32;
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) result.push(ch);
  }
  return result.join('');
}
