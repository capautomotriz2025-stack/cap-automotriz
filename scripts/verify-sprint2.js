const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const BASE = 'https://cap-automotriz.vercel.app/api';

const BASE_VACANCY = {
  applicantName: 'Test Verificacion', department: 'Test',
  costCenter: 'CC-VER', company: 'CAP', location: 'Tegucigalpa',
  employmentType: 'full-time', positionScale: '1',
  mainFunctions: 'Funciones de prueba para verificacion del sistema.',
  educationLevel: 'Universitaria', requiredProfessions: ['Administración'],
  experienceYearsMin: 1, experienceYearsMax: 3,
  evaluationAreas: [{ area: 'Organización', percentage: 100 }],
  requiredSkills: ['Organización'],
  salary: { min: 0, max: 0, currency: 'HNL' }
};

async function check(label, fn) {
  try {
    const result = await fn();
    console.log('✅', label, result ? '— ' + result : '');
  } catch (e) {
    console.log('❌', label, '—', e.response?.data?.error || e.message);
  }
}

async function createTestVacancy(overrides = {}) {
  const res = await axios.post(BASE + '/vacancies', { ...BASE_VACANCY, ...overrides });
  return res.data.data._id;
}

async function main() {
  console.log('=== VERIFICACIÓN SPRINT 2 EN PRODUCCIÓN ===\n');

  // C4: HNL currency
  await check('C4: HNL currency guardado', async () => {
    const id = await createTestVacancy({ title: 'Verify HNL', status: 'pending', salary: { min: 15000, max: 25000, currency: 'HNL' } });
    const res = await axios.get(BASE + '/vacancies/' + id);
    const currency = res.data.data?.salary?.currency;
    return currency === 'HNL' ? 'currency=HNL ✓' : 'currency=' + currency + ' (inesperado)';
  });

  // C6a: PDF sin texto rechazado
  await check('C6: PDF vacío rechazado con 422', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save();
    const vacId = await createTestVacancy({ title: 'Vacante C6 test', status: 'published' });

    const form = new FormData();
    form.append('vacancyId', vacId);
    form.append('fullName', 'Test PDF Vacio');
    form.append('email', 'test.vacio@test.com');
    form.append('phone', '00000000');
    form.append('cv', Buffer.from(bytes), { filename: 'empty.pdf', contentType: 'application/pdf' });

    try {
      await axios.post(BASE + '/applications', form, { headers: form.getHeaders() });
      return 'ERROR: no fue rechazado';
    } catch (e) {
      if (e.response?.status === 422) return 'Rechazado 422 ✓: ' + e.response.data.error.slice(0, 60) + '...';
      throw e;
    }
  });

  // C6b: PDF con texto aceptado
  await check('C6: PDF real (Luciano) aceptado', async () => {
    const vacId = await createTestVacancy({ title: 'Vacante C6b test', status: 'published' });
    const lucianoBuf = fs.readFileSync('c:/Users/fiona/Downloads/cv_2025_us-1.pdf');
    const form = new FormData();
    form.append('vacancyId', vacId);
    form.append('fullName', 'Test PDF OK');
    form.append('email', 'test.ok@test.com');
    form.append('phone', '00000001');
    form.append('cv', lucianoBuf, { filename: 'luciano.pdf', contentType: 'application/pdf' });
    const res = await axios.post(BASE + '/applications', form, { headers: form.getHeaders() });
    if (res.data.success) return 'Candidato creado ID=' + res.data.data._id;
    return 'Error: ' + JSON.stringify(res.data);
  });

  // C7: evaluate-cv con agente template
  await check('C7: evaluate-cv con agente template', async () => {
    const agentsRes = await axios.get(BASE + '/ai-agents');
    const agents = agentsRes.data.data || [];
    if (agents.length === 0) return 'Sin agentes disponibles';
    const agent = agents[0];
    const lucianoBuf = fs.readFileSync('c:/Users/fiona/Downloads/cv_2025_us-1.pdf');
    const form = new FormData();
    form.append('cv', lucianoBuf, { filename: 'luciano.pdf', contentType: 'application/pdf' });
    const res = await axios.post(BASE + '/ai-agents/' + agent._id + '/evaluate-cv', form, { headers: form.getHeaders() });
    if (res.data.success) {
      const d = res.data.data;
      return 'Agente: ' + d.agentName + ' | Score: ' + d.score + '/100 | ' + d.classification;
    }
    return 'Error: ' + JSON.stringify(res.data);
  });

  // C7b: evaluate-cv con PDF inválido
  await check('C7: evaluate-cv rechaza PDF vacío', async () => {
    const agentsRes = await axios.get(BASE + '/ai-agents');
    const agents = agentsRes.data.data || [];
    if (agents.length === 0) return 'Sin agentes disponibles';
    const agentId = agents[0]._id;
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save();
    const form = new FormData();
    form.append('cv', Buffer.from(bytes), { filename: 'empty.pdf', contentType: 'application/pdf' });
    try {
      await axios.post(BASE + '/ai-agents/' + agentId + '/evaluate-cv', form, { headers: form.getHeaders() });
      return 'ERROR: no fue rechazado';
    } catch (e) {
      if (e.response?.status === 422) return 'Rechazado 422 ✓';
      throw e;
    }
  });

  console.log('\n=== FIN VERIFICACIÓN ===');
}

main().catch(e => console.error('Error general:', e.message));
