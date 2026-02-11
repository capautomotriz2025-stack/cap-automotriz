import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vacancy from '../models/Vacancy';

// Intentar cargar .env.local primero, luego .env
dotenv.config({ path: '.env.local' });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: '.env' });
}

async function seedRequest() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('⚠️  MONGODB_URI no configurada. Usando modo mock.');
      console.log('✅ Para crear solicitudes reales, configura MONGODB_URI en .env.local');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Limpiar solicitudes de prueba anteriores
    await Vacancy.deleteMany({ 
      applicantName: 'Luciano Pérez',
      title: 'Especialista en Ciberseguridad'
    });

    // Crear solicitud de prueba
    const request = await Vacancy.create({
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
      // Campos que se completarán en Vacantes
      evaluationAreas: [],
      location: 'Por definir',
      salary: {
        min: 0,
        max: 0,
        currency: 'MXN'
      },
      requiredSkills: [],
      desiredSkills: [],
      employmentType: 'full-time',
      status: 'pending' // Estado de solicitud pendiente
    });

    console.log('✅ Solicitud de prueba creada:');
    console.log(`   ID: ${request._id}`);
    console.log(`   Solicitante: ${request.applicantName}`);
    console.log(`   Puesto: ${request.title}`);
    console.log(`   Departamento: ${request.department}`);
    console.log(`   Estado: ${request.status}`);
    console.log('\n📝 Esta solicitud aparecerá en el formulario de creación de vacantes');

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedRequest();
