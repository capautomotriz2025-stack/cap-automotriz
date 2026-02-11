import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function createTestVacancy() {
  console.log('🧪 Creando vacante de prueba...\n');

  try {
    const vacancyData = {
      applicantName: 'Usuario de Prueba',
      department: 'Tecnología',
      costCenter: 'CC-TEST-001',
      isNewPosition: true,
      title: 'vacante test!',
      numberOfPositions: 1,
      positionScale: 'escala-tres-especialistas',
      mainFunctions: 'Esta es una vacante de prueba para verificar el funcionamiento del sistema de tiempo de recepción de CVs.',
      company: 'Corporativo',
      contractType: 'Tiempo completo',
      location: 'Ciudad de México',
      educationLevel: 'Universitaria',
      requiredProfessions: ['Ingeniería en Sistemas'],
      preferredProfession: 'Desarrollo de Software',
      experienceYearsMin: 2,
      experienceYearsMax: 5,
      evaluationLevel: 'intermedio',
      evaluationAreas: [
        { area: 'Conocimientos técnicos', percentage: 50 },
        { area: 'Experiencia', percentage: 30 },
        { area: 'Habilidades blandas', percentage: 20 }
      ],
      salary: {
        min: 25000,
        max: 40000,
        currency: 'MXN'
      },
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      desiredSkills: ['TypeScript', 'MongoDB'],
      employmentType: 'full-time',
      timecv: '1 semana', // Duración de una semana
      status: 'published' // Publicada para que tenga fecha de publicación
    };

    const response = await axios.post(`${API_BASE}/vacancies`, vacancyData);

    if (response.data.success) {
      const vacancy = response.data.data;
      console.log('✅ Vacante creada exitosamente:');
      console.log(`   ID: ${vacancy._id}`);
      console.log(`   Título: ${vacancy.title}`);
      console.log(`   Tiempo de CV: ${vacancy.timecv}`);
      console.log(`   Estado: ${vacancy.status}`);
      if (vacancy.timecvExpiresAt) {
        console.log(`   Fecha de expiración: ${new Date(vacancy.timecvExpiresAt).toLocaleString('es-MX')}`);
      }
      if (vacancy.publishedAt) {
        console.log(`   Fecha de publicación: ${new Date(vacancy.publishedAt).toLocaleString('es-MX')}`);
      }
      console.log('\n📝 Puedes ver la vacante en: http://localhost:3000/dashboard/vacancies');
    } else {
      throw new Error('Error al crear la vacante');
    }
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

createTestVacancy();
