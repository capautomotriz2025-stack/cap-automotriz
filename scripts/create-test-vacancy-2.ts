import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const API_BASE_URL = 'http://localhost:3000/api';

async function createTestVacancy2() {
  console.log('🧪 Creando vacante de prueba "test 2"...');

  try {
    const vacancyData = {
      applicantName: 'Sistema de Prueba',
      department: 'QA',
      costCenter: 'CC-QA-002',
      isNewPosition: true,
      title: 'test 2',
      numberOfPositions: 1,
      positionScale: 'escala-tres-especialistas',
      mainFunctions: 'Realizar pruebas de software y asegurar la calidad del sistema.',
      company: 'Corporativo',
      contractType: 'Tiempo completo',
      location: 'Remoto',
      educationLevel: 'Universitaria',
      requiredProfessions: ['Ingeniería de Software', 'QA Testing'],
      preferredProfession: 'Automatización de Pruebas',
      experienceYearsMin: 2,
      experienceYearsMax: 5,
      evaluationLevel: 'intermedio',
      evaluationAreas: [
        { area: 'Testing Funcional', percentage: 50 },
        { area: 'Testing Automatizado', percentage: 30 },
        { area: 'Comunicación', percentage: 20 },
      ],
      salary: { min: 20000, max: 30000, currency: 'MXN' },
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días desde ahora
      timecv: '2 meses', // Set timecv to 2 meses
      status: 'published',
      aiAgentId: '',
      publishedAt: new Date().toISOString(),
    };

    const response = await axios.post(`${API_BASE_URL}/vacancies`, vacancyData);

    if (response.data.success) {
      console.log('✅ Vacante creada exitosamente:');
      console.log(`   ID: ${response.data.data._id}`);
      console.log(`   Título: ${response.data.data.title}`);
      console.log(`   Tiempo de CV: ${response.data.data.timecv}`);
      console.log(`   Estado: ${response.data.data.status}`);
      console.log(`   Fecha de publicación: ${new Date(response.data.data.publishedAt).toLocaleString('es-MX')}`);
      if (response.data.data.timecvExpiresAt) {
        console.log(`   Fecha de expiración CV: ${new Date(response.data.data.timecvExpiresAt).toLocaleString('es-MX')}`);
      }
      console.log(`\n📝 Puedes ver la vacante en: http://localhost:3000/dashboard/vacancies`);
    } else {
      console.error('❌ Error al crear la vacante:', response.data.error);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Detalles del error:', error.response.data);
    }
    console.error('   Asegúrate de que el servidor esté corriendo: npm run dev');
  }
}

createTestVacancy2();
