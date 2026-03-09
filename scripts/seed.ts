// Cargar variables de entorno desde .env.local
import { readFileSync } from 'fs';
import { resolve } from 'path';

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
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (key && value) process.env[key.trim()] = value.trim();
        }
      });
      console.log('✅ Variables de .env.local cargadas desde:', envPath);
      return;
    } catch {}
  }
  console.log('⚠️  No se encontró .env.local');
}

loadEnvFile();

import mongoose from 'mongoose';
import Vacancy from '../models/Vacancy';
import Candidate from '../models/Candidate';

const MONGODB_URI =
  process.env.BD_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/recruitment';

// ─────────────────────────────────────────────
// VACANTES (usando el schema nuevo completo)
// ─────────────────────────────────────────────
const vacanciesData: any[] = [
  // ── SOLICITUD pendiente (no publicada aún) ──
  {
    applicantName: 'Carlos Méndez',
    department: 'Tecnología',
    costCenter: 'CC-TEC-001',
    isNewPosition: true,
    title: 'Desarrollador Full Stack – Sistemas Internos',
    numberOfPositions: 2,
    positionScale: 'Senior',
    mainFunctions:
      'Desarrollar y mantener sistemas web internos de gestión para las agencias del grupo. Integrar APIs de proveedores automotrices. Liderar definición técnica de nuevos módulos.',
    company: 'Corporativo CAP',
    location: 'Buenos Aires, Argentina',
    contractType: 'Tiempo completo',
    educationLevel: 'Ingeniería en Sistemas o afín',
    requiredProfessions: ['Desarrollador Full Stack', 'Ingeniero de Software', 'Desarrollador MERN'],
    preferredProfession: 'Desarrollador Full Stack MERN',
    experienceYearsMin: 4,
    experienceYearsMax: 8,
    evaluationLevel: 'Avanzado',
    evaluationAreas: [
      { area: 'Habilidades Técnicas', percentage: 40 },
      { area: 'Experiencia Laboral', percentage: 30 },
      { area: 'Trabajo en Equipo', percentage: 15 },
      { area: 'Comunicación', percentage: 10 },
      { area: 'Adaptabilidad', percentage: 5 },
    ],
    salary: { min: 0, max: 0, currency: 'ARS' },
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'REST APIs'],
    desiredSkills: ['NestJS', 'Docker', 'Kubernetes', 'AWS', 'Next.js'],
    employmentType: 'full-time',
    status: 'pending',
    thresholds: { ideal: 80, potential: 65, review: 50 },
  },

  // ── VACANTE publicada (solicitud ya aprobada) ──
  {
    applicantName: 'María Laura Torres',
    department: 'Tecnología',
    costCenter: 'CC-TEC-001',
    isNewPosition: false,
    title: 'Analista de Sistemas Senior – Plataforma Digital',
    numberOfPositions: 1,
    positionScale: 'Senior',
    mainFunctions:
      'Análisis, diseño e implementación de soluciones tecnológicas para la plataforma digital del grupo automotriz. Gestión de microservicios y bases de datos NoSQL. Colaboración con equipos de ventas y postventa.',
    company: 'Mansiago',
    location: 'Buenos Aires, Argentina',
    contractType: 'Tiempo completo',
    educationLevel: 'Ingeniería en Sistemas / Técnico Universitario en Programación',
    requiredProfessions: ['Desarrollador Full Stack', 'Analista de Sistemas', 'Desarrollador Backend'],
    preferredProfession: 'Desarrollador Full Stack MERN',
    experienceYearsMin: 4,
    experienceYearsMax: 10,
    evaluationLevel: 'Avanzado',
    evaluationAreas: [
      { area: 'Habilidades Técnicas', percentage: 35 },
      { area: 'Experiencia Laboral', percentage: 35 },
      { area: 'Resolución de Problemas', percentage: 15 },
      { area: 'Comunicación', percentage: 10 },
      { area: 'Adaptabilidad', percentage: 5 },
    ],
    salary: { min: 500000, max: 800000, currency: 'ARS' },
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'NestJS', 'Docker'],
    desiredSkills: ['Kubernetes', 'AWS', 'Next.js', 'TDD', 'Kibana'],
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date(),
    timecv: '1 mes',
    timecvExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    thresholds: { ideal: 80, potential: 65, review: 50 },
  },

  // ── Vacante adicional – Jefe de Taller ──
  {
    applicantName: 'Diego Fuentes',
    department: 'Postventa',
    costCenter: 'CC-PV-003',
    isNewPosition: false,
    title: 'Jefe de Taller Automotriz',
    numberOfPositions: 1,
    positionScale: 'Jefatura',
    mainFunctions:
      'Supervisar operaciones del taller de servicio, gestionar equipo técnico, garantizar calidad de reparaciones y tiempos de entrega. Atención al cliente interno y externo.',
    company: 'S&M Automotores',
    location: 'Córdoba, Argentina',
    contractType: 'Tiempo completo',
    educationLevel: 'Técnico Mecánico / Ingeniería Automotriz',
    requiredProfessions: ['Técnico Mecánico', 'Ingeniero Automotriz', 'Jefe de Taller'],
    preferredProfession: 'Técnico Mecánico Senior',
    experienceYearsMin: 5,
    experienceYearsMax: 12,
    evaluationLevel: 'Intermedio',
    evaluationAreas: [
      { area: 'Conocimiento Técnico', percentage: 40 },
      { area: 'Liderazgo', percentage: 25 },
      { area: 'Atención al Cliente', percentage: 20 },
      { area: 'Gestión del Tiempo', percentage: 15 },
    ],
    salary: { min: 350000, max: 500000, currency: 'ARS' },
    requiredSkills: ['Mecánica Automotriz', 'Diagnóstico', 'Liderazgo', 'Gestión de Taller'],
    desiredSkills: ['Software de diagnóstico', 'Toyota/VW/Ford', 'ERP'],
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date(),
    timecv: '2 meses',
    timecvExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    thresholds: { ideal: 75, potential: 60, review: 45 },
  },

  // ── Vacante adicional – Vendedor de Autos ──
  {
    applicantName: 'Sandra López',
    department: 'Ventas',
    costCenter: 'CC-VEN-002',
    isNewPosition: false,
    title: 'Asesor Comercial – Venta de Vehículos 0km',
    numberOfPositions: 3,
    positionScale: 'Operativo',
    mainFunctions:
      'Asesorar a clientes en la compra de vehículos 0km. Gestionar el proceso de venta completo: prospección, prueba de manejo, cierre y financiamiento. Cumplir metas mensuales.',
    company: 'CAP Automotores',
    location: 'Buenos Aires, Argentina',
    contractType: 'Tiempo completo',
    educationLevel: 'Secundario completo',
    requiredProfessions: ['Vendedor', 'Asesor Comercial', 'Ejecutivo de Ventas'],
    preferredProfession: 'Asesor Comercial Automotriz',
    experienceYearsMin: 1,
    experienceYearsMax: 5,
    evaluationLevel: 'Básico',
    evaluationAreas: [
      { area: 'Habilidades de Venta', percentage: 40 },
      { area: 'Comunicación', percentage: 30 },
      { area: 'Orientación al Cliente', percentage: 20 },
      { area: 'Trabajo en Equipo', percentage: 10 },
    ],
    salary: { min: 200000, max: 350000, currency: 'ARS' },
    requiredSkills: ['Ventas', 'CRM', 'Negociación', 'Atención al cliente'],
    desiredSkills: ['Financiamiento automotriz', 'Inglés', 'Redes sociales'],
    employmentType: 'full-time',
    status: 'published',
    publishedAt: new Date(),
    timecv: '1 mes',
    timecvExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    thresholds: { ideal: 75, potential: 60, review: 45 },
  },
];

// ─────────────────────────────────────────────
// CV TEXT COMPLETO DE LUCIANO (extraído del PDF cv_2025_us-1.pdf)
// ─────────────────────────────────────────────
const LUCIANO_CV_TEXT = `LUCIANO MASTRANGELO
Senior Technician in Programming
Email: lucianomastrangelo@hotmail.com.ar
Phone: 1136936750
LinkedIn: luciano-mastrangelo
GitHub: github.com/luciannomas

PROFESSIONAL PROFILE
IT professional with experience in agile methodologies (Scrum, Kanban) and leadership roles. Skilled in using AI tools like Copilot and ChatGPT to optimize workflows and support decision-making. Strong teamwork and autonomy, with excellent time availability and professional presence.

EXPERIENCE

Developer Full Stack
@SolutionBox
December 2018 - January 2022 | Barracas, Buenos Aires
- Development and web service for retail and wholesale stores of the company.
- Technologies used: Symphony (PHP), JavaScript, jQuery, Bootstrap, MySQL.
- API Rest market integration services. Technologies: Node.js, MongoDB, Express, TypeScript, React.

Developer Full Stack MERN
@Carrefour (Contractor)
June 2021 - December 2021 | Capital Federal, Buenos Aires
- Performed tasks in node-mongo and react-native on virtual card wallets and user sessions.

Developer Full Stack MERN
@Fichap (Contractor)
January 2022 - September 2022 | Palermo, Buenos Aires
- Fichap is a startup dedicated to HR area management and metrics.
- Worked with Nest.js (Node) and Next.js (React), Bootstrap, AWS and Docker.

Developer Full Stack MERN
@SooftTechnology
April 2022 - April 2024 | Cordoba Capital, Cordoba
- SooftTechnology: consulting firm specialized in outsourcing IT professionals and Agile Software developments.
- Part of the work cell servicing and updating the Clarin and Ole pages.
- Technologies: Docker, Node.js, React, MongoDB.

Developer Full Stack MERN
@Accenture
April 2024 - Present | Parque Patricios, Buenos Aires
- Accenture: leading multinational consulting firm specializing in technology, outsourcing, and innovation.
- Building microservices using Nest.js and MongoDB to manage registration of agreements on the Banco Santander platform.
- Technologies: TDD, Docker, Kibana, Kubernetes.

EDUCATION

Bachelor's Degree in Economics and Management of Organizations
Maria Mazzarello School
March 1998 - March 2011

University Technician in Programming
National Technological University UTN
March 2012 - Present

LANGUAGES
English (intermediate)
Spanish (native)

PROJECTS
- Portfolio Legal study (Freelance) - React and Node.js: https://estudiojuridicov1.netlify.app
- Ecommerce in React: https://eccomercetest.netlify.app/
- Blog users (React/Material-UI): https://github.com/luciannomas/cultura-blog
- CRUD users (Node/Mongo): https://github.com/luciannomas/zafirus
- Tailwind example: https://tailwind-dash.vercel.app/
- Contact page: https://shupptime.vercel.app/
- Ecommerce production: https://pedidosv1.vercel.app/

REFERENCES
- Librería ABC III VENUS. Tel: 4441-6481
- Club Parque Móron sur. Tel: 4696-0263
- Libson. Tel: 4104 4600
- Solution box. Tel: 11 6091-1200`;

async function seed() {
  try {
    console.log('🌱 Iniciando seed CAP Automotriz...\n');
    console.log('📡 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado –', mongoose.connection.db?.databaseName);
    console.log('');

    // Limpiar
    console.log('🗑️  Limpiando colecciones...');
    await Vacancy.deleteMany({});
    await Candidate.deleteMany({});
    console.log('✅ Limpiado\n');

    // Insertar vacantes
    console.log('📝 Insertando vacantes...');
    const insertedVacancies = await Vacancy.insertMany(vacanciesData);
    console.log(`✅ ${insertedVacancies.length} vacantes insertadas`);
    insertedVacancies.forEach(v => console.log(`   ${v.status === 'pending' ? '📋 SOLICITUD' : '🟢 PUBLICADA'} → ${v.title}`));
    console.log('');

    // Vacante publicada de tecnología (para Luciano y otros)
    const techVacancy = insertedVacancies.find(v => v.title.includes('Analista de Sistemas'));
    const tallerVacancy = insertedVacancies.find(v => v.title.includes('Jefe de Taller'));
    const ventasVacancy = insertedVacancies.find(v => v.title.includes('Asesor Comercial'));

    if (!techVacancy) throw new Error('No se encontró la vacante de tecnología');

    // ─────────────────────────────────────────
    // CANDIDATOS
    // ─────────────────────────────────────────
    const candidatesData: any[] = [
      // ── LUCIANO MASTRANGELO – candidato real con CV completo ──
      {
        vacancyId: techVacancy._id,
        fullName: 'Luciano Mastrangelo',
        email: 'lucianomastrangelo@hotmail.com.ar',
        phone: '1136936750',
        cvUrl: '/uploads/cvs/cv_2025_us-1.pdf',
        cvText: LUCIANO_CV_TEXT,
        aiScore: 94,
        aiClassification: 'ideal',
        aiJustification:
          'Candidato excepcional con más de 6 años de experiencia en desarrollo Full Stack MERN. Experiencia comprobada en empresas de alto nivel (Accenture, SooftTechnology). Dominio del stack tecnológico requerido: React, Node.js, MongoDB, TypeScript, NestJS, Docker, Kubernetes. Actualmente en Accenture desarrollando microservicios con las tecnologías exactas del puesto.',
        status: 'screening',
        references: [
          { name: 'Librería ABC III VENUS', company: 'Librería ABC', phone: '4441-6481', email: '' },
          { name: 'Club Parque Móron sur', company: 'Club Parque Móron', phone: '4696-0263', email: '' },
          { name: 'Libson', company: 'Libson', phone: '4104 4600', email: '' },
          { name: 'Solution box', company: 'SolutionBox', phone: '11 6091-1200', email: '' },
        ],
        communications: [
          {
            type: 'email',
            message: '¡Felicitaciones! Tu perfil ha pasado la etapa de screening. Te contactaremos para coordinar una entrevista.',
            sentBy: 'RRHH CAP',
            sentAt: new Date(),
          },
        ],
      },

      // ── Candidato 2 – potencial para tecnología ──
      {
        vacancyId: techVacancy._id,
        fullName: 'Valentina Romero',
        email: 'valentina.romero@email.com',
        phone: '+54 11 4567 8901',
        cvUrl: '/uploads/cvs/sample-valentina-cv.pdf',
        cvText:
          'Desarrolladora Full Stack con 3 años de experiencia en React y Node.js. Trabajé en Mercado Libre como contractor y en una startup de fintech. Conocimientos en TypeScript, MongoDB y Git. Actualmente cursando certificación AWS.',
        aiScore: 72,
        aiClassification: 'potencial',
        aiJustification:
          'Buena candidata con experiencia relevante en el stack requerido. Le falta profundidad en NestJS y Docker pero muestra capacidad de aprendizaje.',
        status: 'applied',
        references: [],
        communications: [],
      },

      // ── Candidato 3 – no perfila tecnología ──
      {
        vacancyId: techVacancy._id,
        fullName: 'Marcos Gutiérrez',
        email: 'marcos.gutierrez@email.com',
        phone: '+54 11 3344 5566',
        cvUrl: '/uploads/cvs/sample-marcos-cv.pdf',
        cvText:
          'Desarrollador frontend con 1 año de experiencia principalmente en HTML, CSS y JavaScript vanilla. Conocimientos básicos de React. No tengo experiencia en backend ni bases de datos.',
        aiScore: 38,
        aiClassification: 'no perfila',
        aiJustification:
          'Perfil muy junior para los requisitos del puesto. No tiene experiencia en backend, bases de datos ni Docker.',
        status: 'rejected',
        references: [],
        communications: [],
      },

      // ── Candidato 4 – taller ──
      ...(tallerVacancy
        ? [
            {
              vacancyId: tallerVacancy._id,
              fullName: 'Roberto Sánchez',
              email: 'roberto.sanchez@email.com',
              phone: '+54 351 678 9012',
              cvUrl: '/uploads/cvs/sample-roberto-cv.pdf',
              cvText:
                'Técnico mecánico con 8 años de experiencia en talleres oficiales Toyota y Ford. Jefe de taller durante 3 años en concesionaria regional. Manejo de software de diagnóstico Techstream y FDRS. Equipo a cargo: 6 técnicos.',
              aiScore: 88,
              aiClassification: 'ideal',
              aiJustification:
                'Candidato ideal con experiencia sólida como jefe de taller en marcas oficiales. Manejo de software de diagnóstico y liderazgo de equipos comprobado.',
              status: 'interview',
              references: [],
              communications: [],
            },
            {
              vacancyId: tallerVacancy._id,
              fullName: 'Alejandro Peralta',
              email: 'alejandro.peralta@email.com',
              phone: '+54 351 234 5678',
              cvUrl: '/uploads/cvs/sample-alejandro-cv.pdf',
              cvText:
                'Técnico mecánico con 5 años de experiencia en taller independiente. Especialización en motores nafteros y diesel. Sin experiencia formal en jefatura pero con liderazgo informal de equipo.',
              aiScore: 65,
              aiClassification: 'potencial',
              aiJustification:
                'Buen técnico con años de experiencia pero sin experiencia formal de jefatura. Potencial para el rol con acompañamiento.',
              status: 'evaluation',
              references: [],
              communications: [],
            },
          ]
        : []),

      // ── Candidatos ventas ──
      ...(ventasVacancy
        ? [
            {
              vacancyId: ventasVacancy._id,
              fullName: 'Camila Ibáñez',
              email: 'camila.ibanez@email.com',
              phone: '+54 11 7788 9900',
              cvUrl: '/uploads/cvs/sample-camila-cv.pdf',
              cvText:
                'Asesora comercial con 3 años de experiencia en venta de autos 0km en concesionaria Peugeot. Supero metas en 120% promedio. Manejo de CRM Salesforce y financiamiento automotriz con banco BICE.',
              aiScore: 91,
              aiClassification: 'ideal',
              aiJustification:
                'Candidata sobresaliente con experiencia directa en venta automotriz y resultados comprobados por encima de meta.',
              status: 'offer',
              references: [],
              communications: [],
            },
            {
              vacancyId: ventasVacancy._id,
              fullName: 'Nicolás Fernández',
              email: 'nicolas.fernandez@email.com',
              phone: '+54 11 5544 3322',
              cvUrl: '/uploads/cvs/sample-nicolas-cv.pdf',
              cvText:
                'Vendedor con 2 años en retail y 6 meses en agencia de autos usados. Buenas habilidades de comunicación. Nunca vendí 0km pero tengo muchas ganas de aprender el rubro automotriz.',
              aiScore: 58,
              aiClassification: 'potencial',
              aiJustification:
                'Candidato con base en ventas pero sin experiencia en automotriz 0km. Actitud positiva y disposición para aprender.',
              status: 'applied',
              references: [],
              communications: [],
            },
          ]
        : []),
    ];

    console.log('👥 Insertando candidatos...');
    const insertedCandidates = await Candidate.insertMany(candidatesData);
    console.log(`✅ ${insertedCandidates.length} candidatos insertados\n`);

    // ─────────────────────────────────────────
    // RESUMEN
    // ─────────────────────────────────────────
    console.log('📊 RESUMEN SEED CAP AUTOMOTRIZ');
    console.log('================================');
    console.log(`\n📋 Vacantes: ${insertedVacancies.length}`);
    insertedVacancies.forEach(v => {
      const icon = v.status === 'pending' ? '🕐' : v.status === 'published' ? '🟢' : '⚪';
      console.log(`   ${icon} [${v.status.toUpperCase()}] ${v.title} (${v.company})`);
    });

    console.log(`\n👤 Candidatos: ${insertedCandidates.length}`);
    insertedCandidates.forEach(c => {
      const icon = c.aiClassification === 'ideal' ? '🌟' : c.aiClassification === 'potencial' ? '⚡' : '❌';
      console.log(`   ${icon} ${c.fullName} | Score: ${c.aiScore}/100 | ${c.aiClassification} | Estado: ${c.status}`);
    });

    const luciano = insertedCandidates.find(c => c.fullName === 'Luciano Mastrangelo');
    if (luciano) {
      console.log('\n🎯 LUCIANO MASTRANGELO cargado correctamente:');
      console.log(`   - CV text: ${luciano.cvText?.length || 0} caracteres`);
      console.log(`   - Score IA: ${luciano.aiScore}/100 (${luciano.aiClassification})`);
      console.log(`   - Referencias: ${(luciano as any).references?.length || 0} cargadas`);
      console.log(`   - Estado: ${luciano.status}`);
      console.log(`   - Vacante: ${techVacancy.title}`);
      console.log('\n   ✅ El CV genérico se generará con todos los datos cuando hagas click en "Generar CV Genérico"');
    }

    console.log('\n🚀 Accedé a:');
    console.log('   Dashboard:  http://localhost:3000/dashboard');
    console.log('   Vacantes:   http://localhost:3000/dashboard/vacancies');
    console.log('   Candidatos: http://localhost:3000/dashboard/candidates');
    console.log('   Kanban:     http://localhost:3000/dashboard/kanban\n');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit(0);
  }
}

seed();
