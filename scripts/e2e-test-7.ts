/**
 * E2E Test 7 – Flujo completo: Solicitud → Agente → Vacante publicada → Aplicación (PDF) → Kanban → Mensajes
 *
 * 1. Crear solicitud "Solicitud test 7" (vacancy status: pending)
 * 2. Crear agente de IA desde esa solicitud
 * 3. Completar vacante (published + aiAgentId)
 * 4. Aplicar con PDF (candidato)
 * 5. Avanzar candidato por estados Kanban (hasta hired)
 * 6. Verificar respuestas API y documentar mensajes
 *
 * Uso:
 *   npx tsx scripts/e2e-test-7.ts
 *   BASE_URL=https://cap-automotriz.vercel.app npx tsx scripts/e2e-test-7.ts
 *   CV_PATH=/ruta/al/cv.pdf npx tsx scripts/e2e-test-7.ts
 *   npx tsx scripts/e2e-test-7.ts --cv=/ruta/al/cv.pdf
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

const CV_PATH =
  process.env.CV_PATH ||
  process.argv.find((a) => a.startsWith('--cv='))?.slice(5) ||
  '';

const educationLevelToMinLevel: Record<
  string,
  'none' | 'high-school' | 'bachelor' | 'master' | 'phd'
> = {
  Secundaria: 'high-school',
  Universitaria: 'bachelor',
  'Estudiante universitario': 'bachelor',
  Técnico: 'high-school',
  'Master (Con Maestría)': 'master',
};

function getApi(): AxiosInstance {
  return axios.create({
    baseURL: API_BASE,
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function createMinimalPdfBuffer(): Promise<Buffer> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.create();
    const page = doc.addPage([300, 400]);
    const font = await doc.embedFont('Helvetica');
    page.drawText('CV Test 7 - E2E', { x: 50, y: 350, size: 14, font });
    page.drawText('Candidato de prueba para flujo test 7.', { x: 50, y: 320, size: 10, font });
    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
  } catch (e) {
    throw new Error(
      'No se pudo generar PDF mínimo (pdf-lib). Pasa CV_PATH o añade scripts/fixtures/sample-cv.pdf'
    );
  }
}

function getCvPath(): string | null {
  if (CV_PATH && fs.existsSync(CV_PATH)) return CV_PATH;
  const fixturePath = path.join(process.cwd(), 'scripts', 'fixtures', 'sample-cv.pdf');
  if (fs.existsSync(fixturePath)) return fixturePath;
  return null;
}

async function main() {
  const api = getApi();
  let solicitudId: string;
  let agentId: string;
  let candidateId: string;

  console.log('E2E Test 7 – Flujo completo (Solicitud → Vacante → Agente → Aplicación → Kanban)\n');
  console.log('BASE_URL:', BASE_URL);
  if (CV_PATH) console.log('CV_PATH:', CV_PATH);
  console.log('');

  try {
    // —— Paso 1: Crear solicitud "Solicitud test 7" ——
    console.log('1. Creando solicitud "Solicitud test 7"...');
    const solicitudPayload = {
      applicantName: 'Solicitante Test 7',
      department: 'Tecnología',
      costCenter: 'CC-TEST-007',
      isNewPosition: true,
      title: 'Solicitud test 7',
      numberOfPositions: 1,
      positionScale: 'escala-tres-especialistas',
      mainFunctions:
        'Desarrollar y mantener sistemas, gestionar proyectos tecnológicos y coordinar equipos.',
      company: 'Corporativo',
      contractType: 'Tiempo completo',
      location: 'Ciudad de México (Híbrido)',
      educationLevel: 'Universitaria',
      requiredProfessions: ['Ingeniería en Sistemas', 'Ciencias de la Computación', 'Software'],
      preferredProfession: 'Ingeniería en Sistemas',
      experienceYearsMin: 3,
      experienceYearsMax: 6,
      evaluationAreas: [
        { area: 'Habilidades técnicas', percentage: 40 },
        { area: 'Gestión de proyectos', percentage: 30 },
        { area: 'Trabajo en equipo', percentage: 20 },
        { area: 'Comunicación', percentage: 10 },
      ],
      salary: { min: 0, max: 0, currency: 'MXN' },
      requiredSkills: ['JavaScript', 'TypeScript', 'React'],
      desiredSkills: ['Next.js', 'Node.js'],
      employmentType: 'full-time' as const,
      status: 'pending' as const,
    };

    const createRes = await api.post('/vacancies', solicitudPayload);
    if (!createRes.data.success) throw new Error('Error al crear solicitud');
    solicitudId = createRes.data.data._id;
    console.log('   Solicitud creada:', solicitudId);

    // —— Paso 2: GET vacante y crear agente ——
    console.log('\n2. Obteniendo solicitud y creando agente de IA...');
    const vacancyRes = await api.get(`/vacancies/${solicitudId}`);
    if (!vacancyRes.data.success) throw new Error('Error al obtener solicitud');
    const vacancy = vacancyRes.data.data;

    const descParts = [vacancy.mainFunctions || ''];
    if (vacancy.requiredProfessions?.length) {
      descParts.push(
        `Profesiones requeridas: ${vacancy.requiredProfessions.filter(Boolean).join(', ')}.`
      );
    }
    if (vacancy.preferredProfession) descParts.push(`Preferible: ${vacancy.preferredProfession}.`);
    if (vacancy.experienceYearsMin != null || vacancy.experienceYearsMax != null) {
      descParts.push(
        `Años de experiencia: ${vacancy.experienceYearsMin ?? 0} - ${vacancy.experienceYearsMax ?? 'N/A'}.`
      );
    }
    const description = descParts.filter(Boolean).join(' ');

    const requiredSkills = Array.isArray(vacancy.requiredSkills) ? [...vacancy.requiredSkills] : [];
    const desiredSkills = Array.isArray(vacancy.desiredSkills) ? [...vacancy.desiredSkills] : [];
    if (vacancy.evaluationAreas?.length) {
      vacancy.evaluationAreas.forEach((ea: { area?: string }) => {
        if (ea.area?.trim() && !requiredSkills.includes(ea.area.trim())) {
          requiredSkills.push(ea.area.trim());
        }
      });
    }

    const agentPayload = {
      name: `Agente - ${vacancy.title || 'Solicitud test 7'}`,
      category: 'otro',
      description,
      criteria: {
        experience: {
          weight: 25,
          minYears: typeof vacancy.experienceYearsMin === 'number' ? vacancy.experienceYearsMin : 0,
          importance: 'medium' as const,
        },
        technicalSkills: {
          weight: 30,
          required: requiredSkills,
          desired: desiredSkills,
          certifications: [],
        },
        education: {
          weight: 15,
          minLevel: educationLevelToMinLevel[vacancy.educationLevel] || 'bachelor',
          required: !!vacancy.educationLevel,
        },
        softSkills: { weight: 15, keySkills: [] },
        progression: { weight: 15 },
      },
      thresholds: { ideal: 80, potential: 65, review: 50 },
      active: true,
    };

    const agentRes = await api.post('/ai-agents', agentPayload);
    if (!agentRes.data.success) throw new Error('Error al crear agente');
    agentId = agentRes.data.data._id;
    console.log('   Agente creado:', agentId);

    // —— Paso 3: Completar vacante (published + aiAgentId) ——
    console.log('\n3. Completando vacante (publicar y asignar agente)...');
    const completePayload = {
      ...vacancy,
      aiAgentId: agentId,
      status: 'published',
      publishedAt: new Date().toISOString(),
      educationLevel: vacancy.educationLevel || 'Universitaria',
      requiredProfessions: vacancy.requiredProfessions || [],
      preferredProfession: vacancy.preferredProfession || '',
      experienceYearsMin: vacancy.experienceYearsMin ?? 3,
      experienceYearsMax: vacancy.experienceYearsMax ?? 6,
      evaluationAreas: vacancy.evaluationAreas || [],
      salary: { min: 40000, max: 60000, currency: 'MXN' },
      requiredSkills: vacancy.requiredSkills || [],
      desiredSkills: vacancy.desiredSkills || [],
      timecv: '3 meses',
    };

    const putRes = await api.put(`/vacancies/${solicitudId}`, completePayload);
    if (!putRes.data.success) throw new Error('Error al completar vacante');
    console.log('   Vacante publicada. Apply URL:', `${BASE_URL}/apply/${solicitudId}`);

    // —— Paso 4: Aplicación (candidato con PDF) ——
    console.log('\n4. Enviando aplicación (candidato + CV)...');
    let cvBuffer: Buffer;
    const cvFilepath = getCvPath();
    if (cvFilepath) {
      cvBuffer = fs.readFileSync(cvFilepath);
      console.log('   Usando PDF:', cvFilepath);
    } else {
      console.log('   Generando PDF mínimo con pdf-lib...');
      cvBuffer = await createMinimalPdfBuffer();
    }

    const FormData = require('form-data');
    const form = new FormData();
    form.append('vacancyId', solicitudId);
    form.append('fullName', 'Candidato Test 7');
    form.append('email', 'luciano.mastran@gmail.com');
    form.append('phone', '+5215512345678');
    form.append('cv', cvBuffer, { filename: 'cv-test-7.pdf', contentType: 'application/pdf' });

    const applicationRes = await api.post('/applications', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    if (!applicationRes.data.success) throw new Error('Error al enviar aplicación');
    candidateId = applicationRes.data.data._id;
    console.log('   Candidato creado:', candidateId);
    console.log('   (Se envía email de confirmación al candidato si está configurado.)');

    // —— Paso 5: Avanzar estados Kanban ——
    console.log('\n5. Avanzando estados en Kanban (disparan emails en interview, evaluation, offer)...');
    const statuses = ['screening', 'interview', 'evaluation', 'interview-boss', 'offer', 'hired'];
    for (const status of statuses) {
      const updateRes = await api.put(`/candidates/${candidateId}`, { status });
      if (!updateRes.data.success) throw new Error(`Error al actualizar estado a ${status}`);
      console.log('   ->', status);
    }
    console.log('   (Al pasar a hired se setea hiredAt para Time to Hire / Time to Fill.)');

    // —— Paso 6: Verificación y documentación ——
    console.log('\n6. Verificación');
    console.log('   Todas las llamadas API devolvieron éxito.');
    console.log('\nMensajes enviados (revisar bandeja / logs según configuración):');
    console.log('   - Aplicación: confirmación al candidato (email y opcionalmente WhatsApp).');
    console.log('   - Cambios de estado: invitación a entrevista (interview), evaluación (evaluation), oferta (offer).');
    console.log('\n--- Resumen ---');
    console.log('Solicitud/Vacante ID:', solicitudId);
    console.log('Agente ID:', agentId);
    console.log('Candidato ID:', candidateId);
    console.log('Apply URL:', `${BASE_URL}/apply/${solicitudId}`);
    console.log('\nE2E Test 7 completado correctamente.');
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Error: No se pudo conectar a', BASE_URL);
      console.error('Asegúrate de que el servidor esté corriendo (npm run dev) o usa BASE_URL para Vercel.');
    } else {
      console.error('Error:', error.message);
      if (error.response?.data) console.error('Detalles:', error.response.data);
    }
    process.exit(1);
  }
}

main();
