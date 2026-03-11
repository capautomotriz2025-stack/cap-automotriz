/**
 * SIMULACIÓN COMPLETA: Solicitud → Vacante → Postulación → Análisis IA
 * Usa el PDF real de Luciano Mastrangelo desde Downloads
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Cargar env
function loadEnv() {
  for (const p of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '.env.local')]) {
    try {
      readFileSync(p, 'utf-8').split('\n').forEach(line => {
        const t = line.trim();
        if (t && !t.startsWith('#') && t.includes('=')) {
          const [k, ...v] = t.split('=');
          const val = v.join('=').replace(/^["']|["']$/g, '');
          if (k && val) process.env[k.trim()] = val.trim();
        }
      });
      console.log('✅ Env cargado desde:', p);
      return;
    } catch {}
  }
}
loadEnv();

import mongoose from 'mongoose';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Schemas mínimos ──────────────────────────────────────────────────────────
const vacancySchema = new mongoose.Schema({
  title: String, department: String, status: String, company: String,
  location: String, costCenter: String, applicantName: String,
  requiredProfession: String, mainFunctions: String,
  evaluationAreas: [String], requiredSkills: [String],
  salaryRange: String, createdAt: { type: Date, default: Date.now },
});

const candidateSchema = new mongoose.Schema({
  fullName: String, email: String, phone: String,
  vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy' },
  cvText: String, cvUrl: String,
  aiScore: Number, aiClassification: String, aiSummary: String,
  aiStrengths: [String], aiConcerns: [String],
  status: { type: String, default: 'applied' },
  references: [{ name: String, phone: String, company: String }],
  createdAt: { type: Date, default: Date.now },
});

const Vacancy = mongoose.models.Vacancy || mongoose.model('Vacancy', vacancySchema);
const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

// ── Helpers ──────────────────────────────────────────────────────────────────
function sep(label: string) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${label}`);
  console.log('─'.repeat(60));
}

async function extractCVWithAI(cvText: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Extraé los datos del CV y devolvé SOLO un JSON válido con esta estructura exacta:
{
  "yearsOfExperience": <número>,
  "currentRole": "<string>",
  "previousJobs": [{"role":"<string>","company":"<string>","period":"<string>"}],
  "education": [{"degree":"<string>","institution":"<string>","period":"<string>"}],
  "skills": ["<string>"],
  "languages": ["<string>"],
  "profileSummary": "<string>",
  "nationality": "<string>",
  "dateOfBirth": "<string>",
  "address": "<string>"
}`,
      },
      { role: 'user', content: cvText },
    ],
    temperature: 0.1,
    max_tokens: 1200,
  });

  const raw = completion.choices[0].message.content || '{}';
  const match = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : '{}');
}

async function analyzeCandidate(cvText: string, vacancy: any) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Eres un experto en reclutamiento. Analizá el CV y devolvé SOLO un JSON válido:
{
  "score": <1-100>,
  "classification": "<ideal|potential|no-fit>",
  "summary": "<string>",
  "strengths": ["<string>"],
  "concerns": ["<string>"]
}`,
      },
      {
        role: 'user',
        content: `CV:\n${cvText}\n\nPuesto: ${vacancy.title}\nFunciones: ${vacancy.mainFunctions}\nSkills requeridos: ${(vacancy.requiredSkills || []).join(', ')}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 600,
  });

  const raw = completion.choices[0].message.content || '{}';
  const match = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : '{}');
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 SIMULACIÓN COMPLETA CAP AUTOMOTRIZ');
  console.log('   Solicitud → Vacante → Postulación → Análisis IA\n');

  await mongoose.connect(process.env.BD_MONGODB_URI!);
  console.log('✅ MongoDB conectado –', mongoose.connection.db?.databaseName);

  // ── PASO 1: Solicitud ─────────────────────────────────────────────────────
  sep('PASO 1 — Creando Solicitud de Vacante');

  const solicitud = await Vacancy.create({
    title: 'Analista Full Stack Node.js – Simulación #12',
    department: 'Tecnología',
    status: 'pending',
    company: 'CAP Automotriz',
    location: 'Tegucigalpa, Honduras',
    costCenter: 'CC-TEC-012',
    applicantName: 'María González',
    requiredProfession: 'Ingeniería en Sistemas / Informática',
    mainFunctions: 'Desarrollar y mantener APIs REST en Node.js/Express. Integración con MongoDB. Colaboración en equipo ágil (Scrum). Soporte técnico a plataformas internas.',
    evaluationAreas: ['Habilidades técnicas', 'Trabajo en equipo', 'Resolución de problemas', 'Comunicación'],
    requiredSkills: ['Node.js', 'MongoDB', 'React', 'TypeScript', 'REST APIs'],
    salaryRange: 'L 25,000 – L 35,000',
  });

  console.log(`✅ Solicitud creada`);
  console.log(`   ID:          ${solicitud._id}`);
  console.log(`   Título:      ${solicitud.title}`);
  console.log(`   Solicitante: ${solicitud.applicantName}`);
  console.log(`   Estado:      ${solicitud.status}`);

  // ── PASO 2: Aprobar → Publicar vacante ───────────────────────────────────
  sep('PASO 2 — Aprobando y Publicando Vacante');

  await Vacancy.findByIdAndUpdate(solicitud._id, { status: 'published' });
  const vacante = await Vacancy.findById(solicitud._id);

  console.log(`✅ Vacante publicada`);
  console.log(`   Estado: ${vacante?.status}`);

  // ── PASO 3: Leer PDF real ────────────────────────────────────────────────
  sep('PASO 3 — Leyendo PDF de Luciano Mastrangelo');

  const pdfPath = 'c:/Users/fiona/Downloads/cv_2025_us-1.pdf';
  const pdfBuffer = readFileSync(pdfPath);
  const { text: cvText } = await pdfParse(pdfBuffer);

  console.log(`✅ PDF leído: ${pdfPath}`);
  console.log(`   Caracteres extraídos: ${cvText.length}`);
  console.log(`   Preview: "${cvText.slice(0, 120).replace(/\n/g, ' ')}..."`);

  // ── PASO 4: Extracción estructurada con IA ───────────────────────────────
  sep('PASO 4 — Extracción de datos del CV con OpenAI GPT-4');

  console.log('   ⏳ Llamando a OpenAI...');
  const extracted = await extractCVWithAI(cvText);

  console.log(`✅ Datos extraídos:`);
  console.log(`   Nombre actual:     ${extracted.currentRole}`);
  console.log(`   Años experiencia:  ${extracted.yearsOfExperience}`);
  console.log(`   Resumen:           ${extracted.profileSummary?.slice(0, 100)}...`);
  console.log(`   Empleos anteriores (${extracted.previousJobs?.length}):`);
  (extracted.previousJobs || []).forEach((j: any) => {
    console.log(`     • ${j.role} @ ${j.company} (${j.period})`);
  });
  console.log(`   Educación (${extracted.education?.length}):`);
  (extracted.education || []).forEach((e: any) => {
    console.log(`     • ${e.degree} – ${e.institution}`);
  });
  console.log(`   Skills:     ${(extracted.skills || []).join(', ')}`);
  console.log(`   Idiomas:    ${(extracted.languages || []).join(', ')}`);

  // ── PASO 5: Análisis de compatibilidad ───────────────────────────────────
  sep('PASO 5 — Análisis IA: compatibilidad con la vacante');

  console.log('   ⏳ Analizando candidato vs vacante...');
  const analysis = await analyzeCandidate(cvText, vacante);

  console.log(`✅ Análisis completado:`);
  console.log(`   Score:          ${analysis.score}/100`);
  console.log(`   Clasificación:  ${analysis.classification}`);
  console.log(`   Resumen:        ${analysis.summary}`);
  console.log(`   Fortalezas:`);
  (analysis.strengths || []).forEach((s: string) => console.log(`     ✓ ${s}`));
  console.log(`   Preocupaciones:`);
  (analysis.concerns || []).forEach((c: string) => console.log(`     ⚠ ${c}`));

  // ── PASO 6: Guardar candidato en DB ─────────────────────────────────────
  sep('PASO 6 — Guardando candidato en MongoDB');

  const candidate = await Candidate.create({
    fullName: 'Luciano Mastrangelo',
    email: 'lucianomastrangelo@hotmail.com.ar',
    phone: '1136936750',
    vacancyId: vacante!._id,
    cvText,
    cvUrl: pdfPath,
    aiScore: analysis.score,
    aiClassification: analysis.classification,
    aiSummary: analysis.summary,
    aiStrengths: analysis.strengths || [],
    aiConcerns: analysis.concerns || [],
    status: 'screening',
    references: [
      { name: 'Librería ABC III VENUS', phone: '4441-6481', company: 'Librería ABC' },
      { name: 'Club Parque Móron sur', phone: '4696-0263', company: 'Club Parque Móron' },
      { name: 'Libson', phone: '41044600', company: 'Libson' },
      { name: 'Solutionbox', phone: '116091-1200', company: 'Solutionbox' },
    ],
  });

  console.log(`✅ Candidato guardado en DB`);
  console.log(`   ID:       ${candidate._id}`);
  console.log(`   Nombre:   ${candidate.fullName}`);
  console.log(`   Score:    ${candidate.aiScore}/100`);
  console.log(`   Estado:   ${candidate.status}`);
  console.log(`   Vacante:  ${vacante?.title}`);

  // ── RESUMEN FINAL ────────────────────────────────────────────────────────
  sep('RESUMEN FINAL');

  console.log(`📋 Solicitud creada    → ID ${solicitud._id}`);
  console.log(`🟢 Vacante publicada   → "${vacante?.title}"`);
  console.log(`📄 CV procesado        → ${cvText.length} chars desde PDF real`);
  console.log(`🤖 Análisis IA         → Score ${analysis.score}/100 (${analysis.classification})`);
  console.log(`👤 Candidato en DB     → ID ${candidate._id}`);
  console.log(`\n🔗 Ver en dashboard:`);
  console.log(`   http://localhost:3000/dashboard/vacancies/${vacante?._id}`);
  console.log(`   http://localhost:3000/dashboard/candidates/${candidate._id}`);

  await mongoose.connection.close();
  console.log('\n👋 Simulación completada\n');
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
