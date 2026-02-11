import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVacancy extends Document {
  // Nuevos campos del formulario
  applicantName: string;
  department: string;
  costCenter: string;
  isNewPosition: boolean;
  title: string; // Nombre de Puesto
  numberOfPositions: number;
  positionScale: string;
  mainFunctions: string; // Describa Brevemente las Principales Funciones
  evaluationLevel?: string; // Opcional para solicitudes básicas
  evaluationAreas: Array<{
    area: string;
    percentage: number;
  }>;
  jobDescriptorFile?: string; // URL del archivo adjunto
  
  // Campos reorganizados
  company?: string; // Empresa: Corporativo, Mansiago, S&M, etc.
  location: string;
  contractType?: string; // Tipo de contrato: Tiempo completo, Medio tiempo, etc.
  
  // Criterios de evaluación (movidos desde información de solicitud)
  educationLevel?: string; // Nivel educativo requerido
  requiredProfessions?: string[]; // 3 campos de profesiones requeridas
  preferredProfession?: string; // Profesión preferible
  experienceYearsMin?: number; // Años de experiencia mínimos
  experienceYearsMax?: number; // Años de experiencia máximos
  
  // Campos legacy (mantener para compatibilidad)
  requiredProfession?: string; // Mantener por compatibilidad
  requiredSpecialties?: string;
  experienceYears?: number; // Mantener por compatibilidad
  
  // Campos existentes (mantener para compatibilidad)
  description?: string; // Mantener por compatibilidad
  optimizedDescription?: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requiredSkills: string[];
  desiredSkills: string[];
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'consulting' | 'practice';
  status: 'draft' | 'published' | 'closed' | 'pending';
  aiAgentId?: string;
  publishedAt?: Date;
  closedAt?: Date;
  applicationDeadline?: Date; // Fecha límite para recibir CVs
  timecv?: string; // Tiempo de recepción de CVs: '1 semana', '1 mes', '2 meses', '3 meses', '6 meses', '1 año'
  timecvExpiresAt?: Date; // Fecha de expiración calculada basada en timecv
  createdAt: Date;
  updatedAt: Date;
}

const VacancySchema = new Schema<IVacancy>({
  // Nuevos campos del formulario
  applicantName: { type: String, required: true },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  isNewPosition: { type: Boolean, required: true, default: false },
  title: { type: String, required: true }, // Nombre de Puesto
  numberOfPositions: { type: Number, required: true, default: 1 },
  positionScale: { type: String, required: true },
  mainFunctions: { type: String, required: true }, // Describa Brevemente las Principales Funciones
  evaluationLevel: { type: String }, // Opcional para solicitudes básicas
  
  // Campos reorganizados
  company: { type: String },
  contractType: { type: String },
  
  // Criterios de evaluación
  educationLevel: { type: String },
  requiredProfessions: [{ type: String }], // 3 campos
  preferredProfession: { type: String },
  experienceYearsMin: { type: Number },
  experienceYearsMax: { type: Number },
  
  // Campos legacy (mantener para compatibilidad)
  requiredProfession: { type: String },
  requiredSpecialties: { type: String },
  experienceYears: { type: Number, default: 0 },
  evaluationAreas: [{
    area: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 }
  }],
  jobDescriptorFile: { type: String }, // URL del archivo adjunto
  
  // Campos existentes (mantener para compatibilidad)
  description: { type: String }, // Mantener por compatibilidad
  optimizedDescription: { type: String },
  location: { type: String, required: true },
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'MXN' }
  },
  requiredSkills: [{ type: String }],
  desiredSkills: [{ type: String }],
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship', 'consulting', 'practice'],
    default: 'full-time'
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'closed', 'pending'],
    default: 'draft'
  },
  aiAgentId: { type: String },
  publishedAt: { type: Date },
  closedAt: { type: Date },
  applicationDeadline: { type: Date }, // Fecha límite para recibir CVs
  timecv: { type: String }, // Tiempo de recepción de CVs
  timecvExpiresAt: { type: Date } // Fecha de expiración calculada
}, {
  timestamps: true
});

// Evitar redefinición del modelo en hot reload
const Vacancy: Model<IVacancy> = mongoose.models.Vacancy || mongoose.model<IVacancy>('Vacancy', VacancySchema);

export default Vacancy;

