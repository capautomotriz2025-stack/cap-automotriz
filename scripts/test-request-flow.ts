/**
 * Script de prueba del flujo de solicitudes
 * 
 * Este script prueba el flujo completo:
 * 1. Crear una solicitud (status: pending)
 * 2. Verificar que aparece en el selector de vacantes
 * 3. Completar la solicitud como vacante
 * 
 * Para ejecutar: npx tsx scripts/test-request-flow.ts
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testRequestFlow() {
  console.log('🧪 Iniciando prueba del flujo de solicitudes...\n');

  try {
    // Paso 1: Crear una solicitud de prueba
    console.log('1️⃣ Creando solicitud de prueba...');
    const requestData = {
      applicantName: 'Luciano Pérez',
      department: 'Tecnología',
      costCenter: 'CC-TEC-001',
      isNewPosition: true,
      title: 'Especialista en Ciberseguridad',
      numberOfPositions: 1,
      positionScale: 'escala-tres-especialistas',
      mainFunctions: 'Gestionar la seguridad informática de la empresa, implementar políticas de seguridad, realizar auditorías de seguridad y responder a incidentes de seguridad.',
      company: 'Corporativo',
      contractType: 'Tiempo completo',
      location: 'Ciudad de México (Híbrido)',
      evaluationAreas: [],
      salary: {
        min: 0,
        max: 0,
        currency: 'MXN'
      },
      requiredSkills: [],
      desiredSkills: [],
      employmentType: 'full-time',
      status: 'pending'
    };

    const createResponse = await axios.post(`${API_BASE}/vacancies`, requestData);
    
    if (!createResponse.data.success) {
      throw new Error('Error al crear solicitud');
    }

    const requestId = createResponse.data.data._id;
    console.log(`✅ Solicitud creada con ID: ${requestId}`);
    console.log(`   Título: ${requestData.title}`);
    console.log(`   Solicitante: ${requestData.applicantName}`);
    console.log(`   Estado: ${createResponse.data.data.status}\n`);

    // Paso 2: Verificar que la solicitud aparece en el listado de pendientes
    console.log('2️⃣ Verificando que la solicitud aparece en pendientes...');
    const pendingResponse = await axios.get(`${API_BASE}/vacancies?status=pending`);
    
    if (!pendingResponse.data.success) {
      throw new Error('Error al obtener solicitudes pendientes');
    }

    const pendingRequests = pendingResponse.data.data;
    const foundRequest = pendingRequests.find((r: any) => r._id === requestId);
    
    if (foundRequest) {
      console.log(`✅ Solicitud encontrada en el listado de pendientes`);
      console.log(`   Total de solicitudes pendientes: ${pendingRequests.length}\n`);
    } else {
      throw new Error('La solicitud no aparece en el listado de pendientes');
    }

    // Paso 3: Obtener la solicitud completa
    console.log('3️⃣ Obteniendo detalles de la solicitud...');
    const detailResponse = await axios.get(`${API_BASE}/vacancies/${requestId}`);
    
    if (!detailResponse.data.success) {
      throw new Error('Error al obtener detalles de la solicitud');
    }

    const request = detailResponse.data.data;
    console.log(`✅ Detalles obtenidos:`);
    console.log(`   - Departamento: ${request.department}`);
    console.log(`   - Empresa: ${request.company || 'No especificada'}`);
    console.log(`   - Tipo de contrato: ${request.contractType || 'No especificado'}`);
    console.log(`   - Ubicación: ${request.location}\n`);

    // Paso 4: Simular completar la solicitud como vacante
    console.log('4️⃣ Simulando completar la solicitud como vacante...');
    const completeData = {
      ...request,
      educationLevel: 'Universitaria',
      requiredProfessions: ['Ingeniería en Sistemas', 'Ciberseguridad', 'Seguridad de la Información'],
      preferredProfession: 'Ciberseguridad',
      experienceYearsMin: 3,
      experienceYearsMax: 5,
      evaluationLevel: 'avanzado',
      evaluationAreas: [
        { area: 'Conocimientos técnicos', percentage: 40 },
        { area: 'Experiencia en seguridad', percentage: 30 },
        { area: 'Certificaciones', percentage: 20 },
        { area: 'Habilidades blandas', percentage: 10 }
      ],
      salary: {
        min: 35000,
        max: 50000,
        currency: 'MXN'
      },
      status: 'draft'
    };

    const updateResponse = await axios.put(`${API_BASE}/vacancies/${requestId}`, completeData);
    
    if (!updateResponse.data.success) {
      throw new Error('Error al completar la solicitud');
    }

    console.log(`✅ Solicitud completada exitosamente`);
    console.log(`   Nuevo estado: ${updateResponse.data.data.status}`);
    console.log(`   Salario: ${completeData.salary.min} - ${completeData.salary.max} ${completeData.salary.currency}\n`);

    console.log('✅ ✅ ✅ Flujo completo probado exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Ve a http://localhost:3000/dashboard/requests');
    console.log('   2. Crea una nueva solicitud');
    console.log('   3. Ve a http://localhost:3000/dashboard/vacancies/new');
    console.log('   4. Selecciona la solicitud del dropdown');
    console.log('   5. Completa los campos faltantes');
    console.log('   6. Guarda o publica la vacante');

  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error: No se pudo conectar al servidor.');
      console.error('   Asegúrate de que el servidor esté corriendo: npm run dev');
    } else {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('   Detalles:', error.response.data);
      }
    }
    process.exit(1);
  }
}

// Ejecutar solo si el servidor está disponible
testRequestFlow();
