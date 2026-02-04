// Script para probar la creación de vacantes
import axios from 'axios';

const testVacancy = {
  applicantName: 'Luciano',
  department: 'Tecnología',
  costCenter: 'CC-TEC-001',
  isNewPosition: true,
  title: 'Especialista en Ciberseguridad',
  numberOfPositions: 1,
  positionScale: 'escala-tres-especialistas',
  requiredProfession: 'Ingeniería en Sistemas o Ciberseguridad',
  requiredSpecialties: 'Seguridad de la información, Ethical Hacking, Análisis de vulnerabilidades',
  experienceYears: 5,
  mainFunctions: 'Diseñar e implementar estrategias de seguridad informática, realizar auditorías de seguridad, gestionar incidentes de seguridad, capacitar al personal en buenas prácticas de ciberseguridad.',
  evaluationLevel: 'avanzado',
  evaluationAreas: [
    { area: 'Conocimientos técnicos en ciberseguridad', percentage: 40 },
    { area: 'Experiencia en gestión de incidentes', percentage: 30 },
    { area: 'Habilidades de comunicación y liderazgo', percentage: 30 }
  ],
  location: 'Ciudad de México (Híbrido)',
  salary: {
    min: 50000,
    max: 80000,
    currency: 'MXN'
  },
  employmentType: 'full-time',
  status: 'draft',
  aiAgentId: ''
};

async function testCreateVacancy() {
  try {
    console.log('🧪 Probando creación de vacante...');
    console.log('📋 Datos de la vacante:', JSON.stringify(testVacancy, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/vacancies', testVacancy);
    
    if (response.data.success) {
      console.log('✅ Vacante creada exitosamente!');
      console.log('📄 ID de la vacante:', response.data.data._id);
      console.log('📊 Datos completos:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      console.error('❌ Error:', response.data.error);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error al crear vacante:', error.response?.data || error.message);
    return null;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testCreateVacancy()
    .then((vacancy) => {
      if (vacancy) {
        console.log('\n✅ Prueba completada exitosamente!');
        console.log(`🔗 Puedes ver la vacante en: http://localhost:3000/dashboard/vacancies`);
      } else {
        console.log('\n❌ La prueba falló');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

export { testCreateVacancy, testVacancy };
