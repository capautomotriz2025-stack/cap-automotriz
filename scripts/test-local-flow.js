const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const BASE = 'http://localhost:3000/api';

async function main() {
  console.log('=== FLUJO COMPLETO LOCAL con cv_2025_us-1.pdf ===\n');

  // 1. Crear solicitud
  console.log('1. Creando solicitud...');
  const solRes = await axios.post(BASE + '/vacancies', {
    title: 'Analista de Sistemas - Prueba Local',
    applicantName: 'Gerencia TI',
    department: 'Tecnología',
    costCenter: 'CC-TI-001',
    isNewPosition: true,
    positionScale: '3',
    evaluationLevel: 'avanzado',
    mainFunctions: 'Desarrollar y mantener sistemas web usando Node.js, React y MongoDB. Diseñar APIs REST. Participar en ciclos ágiles de desarrollo.',
    company: 'CAP Automotriz',
    location: 'Tegucigalpa, Honduras',
    contractType: 'Tiempo completo',
    educationLevel: 'Universitaria',
    requiredProfessions: ['Ingeniería en Sistemas', 'Informática'],
    preferredProfession: 'Ingeniería en Sistemas',
    experienceYearsMin: 3,
    experienceYearsMax: 7,
    evaluationAreas: [
      { area: 'Habilidades técnicas', percentage: 40 },
      { area: 'Experiencia', percentage: 35 },
      { area: 'Comunicación', percentage: 25 }
    ],
    salary: { min: 25000, max: 40000, currency: 'HNL' },
    requiredSkills: ['Node.js', 'React', 'MongoDB', 'TypeScript', 'REST APIs'],
    desiredSkills: ['Next.js', 'Docker', 'AWS'],
    employmentType: 'full-time',
    status: 'pending'
  });
  const vacId = solRes.data.data._id;
  console.log('   OK Solicitud creada:', vacId);

  // 2. Publicar vacante
  console.log('\n2. Publicando vacante...');
  await axios.put(BASE + '/vacancies/' + vacId, {
    ...solRes.data.data,
    status: 'published'
  });
  console.log('   OK Vacante publicada');

  // 3. Aplicar con cv_2025_us-1.pdf
  console.log('\n3. Aplicando con cv_2025_us-1.pdf (Luciano Mastrangelo)...');
  const cvBuf = fs.readFileSync('c:/Users/fiona/Downloads/cv_2025_us-1.pdf');
  const form = new FormData();
  form.append('vacancyId', vacId);
  form.append('fullName', 'Luciano Mastrangelo');
  form.append('email', 'luciano.mastran@gmail.com');
  form.append('phone', '1136936750');
  form.append('cv', cvBuf, { filename: 'cv_2025_us-1.pdf', contentType: 'application/pdf' });
  const appRes = await axios.post(BASE + '/applications', form, { headers: form.getHeaders() });
  if (!appRes.data.success) throw new Error('Error aplicando: ' + JSON.stringify(appRes.data));
  const candId = appRes.data.data._id;
  console.log('   OK Candidato creado:', candId);
  console.log('   Score inicial:', appRes.data.data.aiScore, '| Clasificación:', appRes.data.data.aiClassification);

  // 4. Generar CV genérico
  console.log('\n4. Generando CV genérico...');
  const cvRes = await axios.post(BASE + '/candidates/' + candId + '/generate-cv');
  if (cvRes.data.success && cvRes.data.data && cvRes.data.data.pdfUrl) {
    console.log('   OK CV genérico:', cvRes.data.data.pdfUrl);
  } else {
    console.log('   ERROR CV genérico:', JSON.stringify(cvRes.data));
  }

  // 5. Generar entrevista
  console.log('\n5. Generando guía de entrevista...');
  const intRes = await axios.post(BASE + '/candidates/' + candId + '/generate-interview');
  if (intRes.data.success && intRes.data.data && intRes.data.data.pdfUrl) {
    console.log('   OK Entrevista:', intRes.data.data.pdfUrl);
  } else {
    console.log('   ERROR entrevista:', JSON.stringify(intRes.data));
  }

  console.log('\n=== RESUMEN ===');
  console.log('Vacante ID: ', vacId);
  console.log('Candidato ID:', candId);
  console.log('Ver candidato: http://localhost:3000/dashboard/candidates/' + candId);
}

main().catch(function(e) {
  console.error('Error:', e.response ? e.response.data : e.message);
});
