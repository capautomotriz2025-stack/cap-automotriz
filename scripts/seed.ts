// Cargar variables de entorno desde .env.local
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Función para cargar .env.local
function loadEnvFile() {
  const possiblePaths = [
    resolve(process.cwd(), '.env.local'),
    resolve(__dirname, '..', '.env.local'),
    resolve(__dirname, '../..', '.env.local'),
  ];
  
  for (const envPath of possiblePaths) {
    try {
      const envContent = readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remover comillas
          if (key && value) {
            process.env[key.trim()] = value.trim();
          }
        }
      });
      console.log('✅ Variables de .env.local cargadas desde:', envPath);
      return;
    } catch (error) {
      // Continuar con el siguiente path
    }
  }
  console.log('⚠️  No se encontró .env.local en:', possiblePaths.join(', '));
  console.log('📂 Directorio actual:', process.cwd());
}

loadEnvFile();

import mongoose from 'mongoose';
import Vacancy from '../models/Vacancy';
import Candidate from '../models/Candidate';

// Usar la URI de la variable de entorno (bd_MONGODB_URI o MONGODB_URI) o la local por defecto
const MONGODB_URI = process.env.bd_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment';

const vacanciesData = [
  {
    title: 'Desarrollador Full Stack Senior',
    description: 'Buscamos un desarrollador full stack con experiencia en React y Node.js para liderar proyectos de alto impacto.',
    optimizedDescription: 'Únete a nuestro equipo como Desarrollador Full Stack Senior y lidera la innovación tecnológica. Trabajarás en proyectos desafiantes utilizando las últimas tecnologías como React, Next.js, Node.js y MongoDB. Ofrecemos un ambiente colaborativo, crecimiento profesional y excelentes beneficios.',
    department: 'Tecnología',
    location: 'Ciudad de México (Híbrido)',
    salary: {
      min: 45000,
      max: 65000,
      currency: 'MXN'
    },
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Git'],
    desiredSkills: ['Next.js', 'Docker', 'AWS', 'GraphQL'],
    experienceYears: 5,
    educationLevel: 'Licenciatura en Ingeniería o afín',
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date()
  },
  {
    title: 'Diseñador UX/UI',
    description: 'Diseñador creativo con pasión por crear experiencias de usuario excepcionales.',
    optimizedDescription: 'Buscamos un Diseñador UX/UI talentoso que transforme ideas en experiencias digitales memorables. Trabajarás con equipos multidisciplinarios diseñando interfaces intuitivas y atractivas. Requisitos: dominio de Figma, Adobe XD, conocimiento de Design Thinking y experiencia en diseño responsive.',
    department: 'Diseño',
    location: 'Guadalajara (Remoto)',
    salary: {
      min: 30000,
      max: 45000,
      currency: 'MXN'
    },
    requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototipado'],
    desiredSkills: ['Ilustración', 'Motion Design', 'HTML/CSS'],
    experienceYears: 3,
    educationLevel: 'Licenciatura en Diseño Gráfico o afín',
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date()
  },
  {
    title: 'Gerente de Recursos Humanos',
    description: 'Profesional en RH con experiencia en reclutamiento, desarrollo organizacional y gestión del talento.',
    optimizedDescription: 'Posición estratégica como Gerente de Recursos Humanos. Liderarás todos los procesos de gestión del talento: reclutamiento, onboarding, capacitación, evaluación de desempeño y clima laboral. Buscamos un líder con visión estratégica, habilidades de comunicación excepcionales y experiencia en transformación organizacional.',
    department: 'Recursos Humanos',
    location: 'Monterrey (Presencial)',
    salary: {
      min: 50000,
      max: 70000,
      currency: 'MXN'
    },
    requiredSkills: ['Reclutamiento', 'Desarrollo Organizacional', 'Legislación Laboral', 'Liderazgo', 'Coaching'],
    desiredSkills: ['Six Sigma', 'HRIS', 'People Analytics'],
    experienceYears: 7,
    educationLevel: 'Licenciatura en Psicología, Administración o afín',
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date()
  },
  {
    title: 'Analista de Datos Junior',
    description: 'Posición inicial para analista de datos con conocimientos en Python y SQL.',
    optimizedDescription: 'Excelente oportunidad para iniciar tu carrera como Analista de Datos. Trabajarás con grandes volúmenes de información, crearás dashboards y apoyarás en la toma de decisiones basada en datos. Ambiente de aprendizaje continuo con mentores experimentados. Ideal para recién egresados con pasión por los datos.',
    department: 'Análisis de Datos',
    location: 'Ciudad de México (Híbrido)',
    salary: {
      min: 18000,
      max: 25000,
      currency: 'MXN'
    },
    requiredSkills: ['Python', 'SQL', 'Excel', 'Estadística'],
    desiredSkills: ['Power BI', 'Tableau', 'R', 'Machine Learning'],
    experienceYears: 1,
    educationLevel: 'Licenciatura en Matemáticas, Actuaría, Ingeniería o afín',
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date()
  },
  {
    title: 'Marketing Digital Manager',
    description: 'Especialista en marketing digital para liderar estrategias de adquisición y engagement.',
    optimizedDescription: 'Buscamos un Marketing Digital Manager estratégico y creativo. Liderarás campañas multicanal (SEO, SEM, Social Media, Email Marketing), optimizarás el funnel de conversión y gestionarás el presupuesto de marketing. Requisitos: experiencia comprobada en crecimiento digital, manejo de Google Analytics, Facebook Ads, y habilidades analíticas.',
    department: 'Marketing',
    location: 'Remoto (México)',
    salary: {
      min: 35000,
      max: 50000,
      currency: 'MXN'
    },
    requiredSkills: ['Marketing Digital', 'SEO', 'SEM', 'Google Analytics', 'Social Media'],
    desiredSkills: ['Growth Hacking', 'A/B Testing', 'CRO', 'Marketing Automation'],
    experienceYears: 4,
    educationLevel: 'Licenciatura en Marketing, Comunicación o afín',
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date()
  },
  {
    title: 'Desarrollador Mobile (iOS/Android)',
    description: 'Desarrollador de aplicaciones móviles nativas o híbridas.',
    optimizedDescription: 'Únete como Desarrollador Mobile y crea aplicaciones que impacten a millones de usuarios. Trabajarás en el desarrollo de apps nativas (Swift/Kotlin) o híbridas (React Native/Flutter). Ofrecemos tecnología de punta, proyectos innovadores y un equipo apasionado por la excelencia móvil.',
    department: 'Tecnología',
    location: 'Puebla (Híbrido)',
    salary: {
      min: 40000,
      max: 60000,
      currency: 'MXN'
    },
    requiredSkills: ['React Native', 'Swift', 'Kotlin', 'Git', 'REST APIs'],
    desiredSkills: ['Flutter', 'Firebase', 'CI/CD', 'App Store Publishing'],
    experienceYears: 3,
    educationLevel: 'Ingeniería en Sistemas o afín',
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date()
  },
  {
    title: 'Contador Público',
    description: 'Contador con experiencia en contabilidad general, impuestos y auditorías.',
    department: 'Finanzas',
    location: 'Querétaro (Presencial)',
    salary: {
      min: 25000,
      max: 35000,
      currency: 'MXN'
    },
    requiredSkills: ['Contabilidad', 'Impuestos', 'SAT', 'IMSS', 'Nómina'],
    desiredSkills: ['CONTPAQi', 'Auditoría', 'NIF', 'CFDI'],
    experienceYears: 3,
    educationLevel: 'Licenciatura en Contaduría Pública',
    employmentType: 'full-time',
    status: 'draft'
  },
  {
    title: 'Ingeniero DevOps',
    description: 'Ingeniero DevOps para automatizar y optimizar procesos de desarrollo y despliegue.',
    optimizedDescription: 'Posición clave como Ingeniero DevOps. Diseñarás y mantendrás pipelines CI/CD, gestionarás infraestructura como código, implementarás monitoreo y asegurarás la alta disponibilidad de nuestros servicios. Stack: AWS/Azure, Docker, Kubernetes, Terraform, Jenkins. Buscamos alguien proactivo con mentalidad de automatización.',
    department: 'Tecnología',
    location: 'Ciudad de México (Remoto)',
    salary: {
      min: 50000,
      max: 75000,
      currency: 'MXN'
    },
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
    desiredSkills: ['Ansible', 'Prometheus', 'Grafana', 'Python', 'Bash'],
    experienceYears: 5,
    educationLevel: 'Ingeniería en Sistemas o afín',
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date()
  },
  {
    title: 'Practicante de Ventas',
    description: 'Oportunidad de prácticas profesionales en el área de ventas B2B.',
    department: 'Ventas',
    location: 'León (Presencial)',
    salary: {
      min: 8000,
      max: 12000,
      currency: 'MXN'
    },
    requiredSkills: ['Comunicación', 'Excel', 'CRM', 'Prospección'],
    desiredSkills: ['Inglés', 'Negociación', 'Presentaciones'],
    experienceYears: 0,
    educationLevel: 'Estudiante de Administración, Marketing o afín',
    employmentType: 'internship',
    status: 'published',
    publishedAt: new Date()
  },
  {
    title: 'Product Manager',
    description: 'Product Manager para liderar el desarrollo de productos digitales.',
    department: 'Producto',
    location: 'Ciudad de México (Híbrido)',
    salary: {
      min: 55000,
      max: 80000,
      currency: 'MXN'
    },
    requiredSkills: ['Product Management', 'Agile', 'Scrum', 'Roadmapping', 'Data Analysis'],
    desiredSkills: ['SQL', 'A/B Testing', 'User Research', 'Figma'],
    experienceYears: 5,
    educationLevel: 'Licenciatura en Ingeniería, Administración o afín',
    employmentType: 'full-time',
    status: 'draft'
  }
];

// Candidatos de ejemplo para algunas vacantes
const candidatesData = [
  {
    fullName: 'María González Pérez',
    email: 'maria.gonzalez@email.com',
    phone: '+52 55 1234 5678',
    cvUrl: '/uploads/cvs/sample-maria-cv.pdf',
    cvText: 'Desarrolladora Full Stack con 6 años de experiencia en React, Node.js, TypeScript y MongoDB. He liderado equipos de 5 personas y completado más de 20 proyectos exitosos.',
    aiScore: 92,
    aiClassification: 'ideal',
    aiJustification: 'Candidata excepcional con experiencia directa en todas las tecnologías requeridas. Perfil de liderazgo comprobado y portafolio sólido.',
    status: 'interview'
  },
  {
    fullName: 'Carlos Rodríguez López',
    email: 'carlos.rodriguez@email.com',
    phone: '+52 33 9876 5432',
    cvUrl: '/uploads/cvs/sample-carlos-cv.pdf',
    cvText: 'Desarrollador con 3 años de experiencia en React y Node.js. He trabajado en startups y empresas medianas desarrollando aplicaciones web.',
    aiScore: 75,
    aiClassification: 'potencial',
    aiJustification: 'Buen candidato con experiencia relevante pero ligeramente por debajo del nivel senior requerido. Con mentoría podría ser excelente.',
    status: 'screening'
  },
  {
    fullName: 'Ana Martínez Sánchez',
    email: 'ana.martinez@email.com',
    phone: '+52 55 2468 1357',
    cvUrl: '/uploads/cvs/sample-ana-cv.pdf',
    cvText: 'Diseñadora UX/UI con 4 años de experiencia. Experta en Figma, Adobe XD y metodologías de Design Thinking. Portfolio con +30 proyectos.',
    aiScore: 88,
    aiClassification: 'ideal',
    aiJustification: 'Excelente candidata con experiencia sólida en diseño de experiencias. Portfolio impresionante y dominio de herramientas requeridas.',
    status: 'evaluation'
  },
  {
    fullName: 'Luis Hernández Torres',
    email: 'luis.hernandez@email.com',
    phone: '+52 81 5555 7777',
    cvUrl: '/uploads/cvs/sample-luis-cv.pdf',
    cvText: 'Profesional de RH con 8 años de experiencia en reclutamiento, capacitación y desarrollo organizacional. Certificado en Six Sigma.',
    aiScore: 95,
    aiClassification: 'ideal',
    aiJustification: 'Candidato ideal con amplia experiencia en todas las áreas requeridas. Certificaciones relevantes y historial comprobado de éxito.',
    status: 'offer'
  },
  {
    fullName: 'Patricia Ramírez Cruz',
    email: 'patricia.ramirez@email.com',
    phone: '+52 55 3333 4444',
    cvUrl: '/uploads/cvs/sample-patricia-cv.pdf',
    cvText: 'Recién graduada de Actuaría con conocimientos en Python, SQL y Excel. Proyecto final sobre análisis predictivo.',
    aiScore: 68,
    aiClassification: 'potencial',
    aiJustification: 'Candidata junior con buena base académica. Le falta experiencia práctica pero muestra potencial y entusiasmo.',
    status: 'applied'
  },
  {
    fullName: 'Roberto Silva Mendoza',
    email: 'roberto.silva@email.com',
    phone: '+52 33 7777 8888',
    cvUrl: '/uploads/cvs/sample-roberto-cv.pdf',
    cvText: 'Especialista en Marketing Digital con 5 años de experiencia. Manejo avanzado de Google Ads, Facebook Ads y Analytics. ROI promedio de 300%.',
    aiScore: 91,
    aiClassification: 'ideal',
    aiJustification: 'Candidato sobresaliente con resultados medibles y experiencia en growth marketing. Perfil estratégico y analítico.',
    status: 'interview'
  },
  {
    fullName: 'Sofía Jiménez Flores',
    email: 'sofia.jimenez@email.com',
    phone: '+52 55 9999 0000',
    cvUrl: '/uploads/cvs/sample-sofia-cv.pdf',
    cvText: 'Desarrolladora Mobile con 4 años de experiencia en React Native y Flutter. Apps publicadas en App Store y Google Play.',
    aiScore: 85,
    aiClassification: 'ideal',
    aiJustification: 'Excelente candidata con experiencia cross-platform. Apps publicadas demuestran capacidad de llevar proyectos a producción.',
    status: 'screening'
  },
  {
    fullName: 'Miguel Ángel Torres',
    email: 'miguel.torres@email.com',
    phone: '+52 81 1111 2222',
    cvUrl: '/uploads/cvs/sample-miguel-cv.pdf',
    cvText: 'Ingeniero DevOps con 6 años de experiencia. Experto en AWS, Docker, Kubernetes y Terraform. Implementación de CI/CD en +15 proyectos.',
    aiScore: 94,
    aiClassification: 'ideal',
    aiJustification: 'Candidato excepcional con dominio completo del stack DevOps. Experiencia comprobada en automatización y escalabilidad.',
    status: 'evaluation'
  },
  {
    fullName: 'Daniela Morales Ruiz',
    email: 'daniela.morales@email.com',
    phone: '+52 55 6666 5555',
    cvUrl: '/uploads/cvs/sample-daniela-cv.pdf',
    cvText: 'Estudiante de 8vo semestre de Administración. Experiencia en ventas retail por 1 año. Manejo de Excel y CRM básico.',
    aiScore: 72,
    aiClassification: 'potencial',
    aiJustification: 'Candidata junior con actitud positiva y experiencia básica en ventas. Buena opción para prácticas profesionales.',
    status: 'applied'
  },
  {
    fullName: 'Jorge Fernández Castro',
    email: 'jorge.fernandez@email.com',
    phone: '+52 33 4444 3333',
    cvUrl: '/uploads/cvs/sample-jorge-cv.pdf',
    cvText: 'Product Manager con 2 años de experiencia en startups. Conocimientos de Agile, Scrum y análisis de datos.',
    aiScore: 65,
    aiClassification: 'potencial',
    aiJustification: 'Candidato con experiencia pero por debajo del nivel senior requerido. Muestra potencial de crecimiento.',
    status: 'rejected'
  }
];

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...\n');
    console.log('📡 URI de conexión:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Ocultar credenciales
    console.log('🔍 Verificando conexión...\n');

    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.db?.databaseName || 'No especificada');
    console.log('🔗 Host:', mongoose.connection.host || 'N/A');
    console.log('📦 Colecciones existentes:', (await mongoose.connection.db?.listCollections().toArray())?.map(c => c.name).join(', ') || 'Ninguna');
    console.log('');

    // Limpiar colecciones existentes
    console.log('🗑️  Limpiando colecciones existentes...');
    await Vacancy.deleteMany({});
    await Candidate.deleteMany({});
    console.log('✅ Colecciones limpiadas\n');

    // Insertar vacantes
    console.log('📝 Insertando vacantes...');
    const insertedVacancies = await Vacancy.insertMany(vacanciesData);
    console.log(`✅ ${insertedVacancies.length} vacantes insertadas\n`);

    // Asignar candidatos a las primeras vacantes publicadas
    const publishedVacancies = insertedVacancies.filter(v => v.status === 'published');
    
    // Asignar candidatos específicos a vacantes específicas
    const candidatesWithVacancies = candidatesData.map((candidate, index) => {
      let vacancyIndex = 0;
      
      // Asignar por especialidad
      if (index === 0 || index === 1) {
        // María y Carlos -> Desarrollador Full Stack
        vacancyIndex = publishedVacancies.findIndex(v => v.title.includes('Full Stack'));
      } else if (index === 2) {
        // Ana -> Diseñador UX/UI
        vacancyIndex = publishedVacancies.findIndex(v => v.title.includes('UX/UI'));
      } else if (index === 3) {
        // Luis -> Gerente de RH
        vacancyIndex = publishedVacancies.findIndex(v => v.title.includes('Recursos Humanos'));
      } else if (index === 4) {
        // Patricia -> Analista de Datos
        vacancyIndex = publishedVacancies.findIndex(v => v.title.includes('Analista de Datos'));
      } else if (index === 5) {
        // Roberto -> Marketing Digital
        vacancyIndex = publishedVacancies.findIndex(v => v.title.includes('Marketing'));
      } else if (index === 6) {
        // Sofía -> Desarrollador Mobile
        vacancyIndex = publishedVacancies.findIndex(v => v.title.includes('Mobile'));
      } else if (index === 7) {
        // Miguel -> DevOps
        vacancyIndex = publishedVacancies.findIndex(v => v.title.includes('DevOps'));
      } else if (index === 8) {
        // Daniela -> Practicante Ventas
        vacancyIndex = publishedVacancies.findIndex(v => v.title.includes('Practicante'));
      } else {
        // Jorge -> cualquier otra vacante disponible
        vacancyIndex = 0;
      }

      return {
        ...candidate,
        vacancyId: publishedVacancies[vacancyIndex]?._id || publishedVacancies[0]._id
      };
    });

    console.log('👥 Insertando candidatos...');
    const insertedCandidates = await Candidate.insertMany(candidatesWithVacancies);
    console.log(`✅ ${insertedCandidates.length} candidatos insertados\n`);

    // Resumen
    console.log('📊 RESUMEN DE SEED:');
    console.log('==================');
    console.log(`✅ Vacantes creadas: ${insertedVacancies.length}`);
    console.log(`   - Publicadas: ${insertedVacancies.filter(v => v.status === 'published').length}`);
    console.log(`   - Borradores: ${insertedVacancies.filter(v => v.status === 'draft').length}`);
    console.log(`\n✅ Candidatos creados: ${insertedCandidates.length}`);
    console.log(`   - Ideales: ${insertedCandidates.filter(c => c.aiClassification === 'ideal').length}`);
    console.log(`   - Potenciales: ${insertedCandidates.filter(c => c.aiClassification === 'potencial').length}`);
    console.log(`   - No perfiles: ${insertedCandidates.filter(c => c.aiClassification === 'no perfila').length}`);
    console.log('\n🎯 Estados de candidatos:');
    console.log(`   - Aplicados: ${insertedCandidates.filter(c => c.status === 'applied').length}`);
    console.log(`   - Screening: ${insertedCandidates.filter(c => c.status === 'screening').length}`);
    console.log(`   - Entrevista: ${insertedCandidates.filter(c => c.status === 'interview').length}`);
    console.log(`   - Evaluación: ${insertedCandidates.filter(c => c.status === 'evaluation').length}`);
    console.log(`   - Oferta: ${insertedCandidates.filter(c => c.status === 'offer').length}`);
    console.log(`   - Rechazados: ${insertedCandidates.filter(c => c.status === 'rejected').length}`);

    console.log('\n✨ ¡Seed completado exitosamente!\n');
    console.log('🚀 Puedes acceder a:');
    console.log('   - Dashboard: http://localhost:3000/dashboard');
    console.log('   - Vacantes: http://localhost:3000/dashboard/vacancies');
    console.log('   - Candidatos: http://localhost:3000/dashboard/candidates');
    console.log('   - Kanban: http://localhost:3000/dashboard/kanban\n');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar seed
seed();

