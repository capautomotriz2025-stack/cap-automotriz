/**
 * Script de prueba de formularios
 * 
 * Este script prueba el flujo completo de formularios:
 * 1. Crear una solicitud "Solicitud test 5" con todos los nuevos campos
 * 2. Crear una vacante "test 5" basada en esa solicitud
 * 
 * Para ejecutar: npx tsx scripts/test-formularios.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vacancy from '../models/Vacancy';

// Intentar cargar .env.local primero, luego .env
dotenv.config({ path: '.env.local' });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: '.env' });
}

async function testFormularios() {
  try {
    // Intentar obtener la URI de MongoDB de diferentes variables de entorno
    const mongoUri = process.env.MONGODB_URI || process.env.BD_MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ ERROR: MONGODB_URI no configurada.');
      console.error('   Por favor, configura MONGODB_URI o BD_MONGODB_URI en .env.local');
      console.error('   Ejemplo: MONGODB_URI=mongodb://localhost:27017/recruitment');
      process.exit(1);
    }

    console.log('🔌 Conectando a MongoDB...');
    console.log(`   URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Ocultar credenciales
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB (BASE DE DATOS REAL)\n');

    // Limpiar datos de prueba anteriores
    console.log('🧹 Limpiando datos de prueba anteriores...');
    await Vacancy.deleteMany({ 
      $or: [
        { title: 'test 5' },
        { applicantName: 'Solicitante Test 5' }
      ]
    });
    console.log('✅ Datos anteriores eliminados\n');

    // Paso 1: Crear solicitud "Solicitud test 5"
    console.log('1️⃣ Creando solicitud "Solicitud test 5"...');
    const solicitudData = {
      applicantName: 'Solicitante Test 5',
      department: 'Tecnología',
      costCenter: 'CC-TEST-005',
      isNewPosition: true,
      title: 'test 5',
      numberOfPositions: 1,
      positionScale: '5', // Coordinación (Escala 5) según nueva tabla
      mainFunctions: 'Desarrollar y mantener sistemas de información, gestionar proyectos tecnológicos y coordinar equipos de desarrollo.',
      company: 'Corporativo',
      contractType: 'Tiempo completo',
      location: 'Ciudad de México (Híbrido)',
      // Nuevos campos agregados al formulario de solicitudes
      evaluationAreas: [
        { area: 'Habilidades técnicas en programación', percentage: 40 },
        { area: 'Experiencia en gestión de proyectos', percentage: 30 },
        { area: 'Liderazgo y trabajo en equipo', percentage: 20 },
        { area: 'Comunicación efectiva', percentage: 10 }
      ],
      // Campos mínimos requeridos
      salary: {
        min: 0,
        max: 0,
        currency: 'MXN'
      },
      requiredSkills: [],
      desiredSkills: [],
      employmentType: 'full-time' as const,
      status: 'pending' as const // Estado de solicitud pendiente
    };

    const solicitud = await Vacancy.create(solicitudData);
    console.log(`✅ Solicitud creada exitosamente:`);
    console.log(`   ID: ${solicitud._id}`);
    console.log(`   Título: ${solicitud.title}`);
    console.log(`   Solicitante: ${solicitud.applicantName}`);
    console.log(`   Departamento: ${solicitud.department}`);
    console.log(`   Escala de Puesto: ${solicitud.positionScale}`);
    console.log(`   Estado: ${solicitud.status}`);
    console.log(`   Criterios de evaluación: ${solicitud.evaluationAreas.length} áreas definidas\n`);

    // Paso 2: Completar la solicitud como vacante "test 5"
    console.log('2️⃣ Completando solicitud como vacante "test 5"...');
    const vacanteData = {
      ...solicitud.toObject(),
      // Criterios de evaluación completos
      educationLevel: 'Universitaria',
      requiredProfessions: ['Ingeniería en Sistemas', 'Ingeniería en Software', 'Ciencias de la Computación'],
      preferredProfession: 'Ingeniería en Sistemas',
      experienceYearsMin: 5,
      experienceYearsMax: 8,
      evaluationLevel: 'avanzado',
      // Actualizar áreas de evaluación (ya vienen de la solicitud)
      evaluationAreas: solicitud.evaluationAreas,
      // Información de salario
      salary: {
        min: 45000,
        max: 65000,
        currency: 'MXN'
      },
      // Habilidades requeridas
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB'],
      desiredSkills: ['Next.js', 'AWS', 'Docker', 'Kubernetes'],
      // Fechas y tiempos
      timecv: '3 meses',
      applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días desde ahora
      // Cambiar estado a draft (completada pero no publicada)
      status: 'draft' as const
    };

    // Actualizar la solicitud existente
    const vacante = await Vacancy.findByIdAndUpdate(
      solicitud._id,
      vacanteData,
      { new: true }
    );

    if (!vacante) {
      throw new Error('Error al actualizar la solicitud a vacante');
    }

    console.log(`✅ Vacante "test 5" creada exitosamente:`);
    console.log(`   ID: ${vacante._id}`);
    console.log(`   Título: ${vacante.title}`);
    console.log(`   Estado: ${vacante.status}`);
    console.log(`   Salario: ${vacante.salary.min} - ${vacante.salary.max} ${vacante.salary.currency}`);
    console.log(`   Nivel educativo: ${vacante.educationLevel}`);
    console.log(`   Experiencia: ${vacante.experienceYearsMin} - ${vacante.experienceYearsMax} años`);
    console.log(`   Profesiones requeridas: ${vacante.requiredProfessions?.join(', ')}`);
    console.log(`   Habilidades técnicas: ${vacante.requiredSkills?.join(', ')}`);
    console.log(`   Tiempo CV: ${vacante.timecv}`);
    console.log(`   Áreas de evaluación: ${vacante.evaluationAreas.length} áreas\n`);

    // Verificar que los datos se guardaron correctamente
    console.log('🔍 Verificando datos guardados en la base de datos...');
    const verificacion = await Vacancy.findById(vacante._id);
    if (verificacion) {
      console.log('✅ Datos verificados en MongoDB:');
      console.log(`   - Título: ${verificacion.title}`);
      console.log(`   - Estado: ${verificacion.status}`);
      console.log(`   - Solicitante: ${verificacion.applicantName}`);
      console.log(`   - Criterios de evaluación: ${verificacion.evaluationAreas?.length || 0} áreas`);
      console.log(`   - Fecha de creación: ${verificacion.createdAt}`);
    } else {
      console.log('⚠️  No se pudo verificar el documento en la base de datos');
    }

    console.log('\n✅ ✅ ✅ Prueba de formularios completada exitosamente!\n');
    console.log('📝 DATOS REALES CARGADOS EN MONGODB:');
    console.log(`   - Solicitud/Vacante ID: ${vacante._id}`);
    console.log(`   - Título: "test 5"`);
    console.log(`   - Solicitante: "Solicitante Test 5"`);
    console.log(`   - Estado: ${vacante.status}`);
    console.log('\n📝 Verificación en la aplicación:');
    console.log(`   1. Ve a http://localhost:3000/dashboard/requests`);
    console.log(`      - Deberías ver la solicitud "test 5" si aún está en estado 'pending'`);
    console.log(`   2. Ve a http://localhost:3000/dashboard/vacancies`);
    console.log(`      - Deberías ver la vacante "test 5" en estado 'draft'`);
    console.log(`   3. Ve a http://localhost:3000/dashboard/vacancies/${vacante._id}`);
    console.log(`      - Deberías poder editar la vacante y ver todos los campos completados`);

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testFormularios();
