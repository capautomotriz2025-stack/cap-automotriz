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
  requiredProfession: string;
  requiredSpecialties?: string;
  experienceYears: number;
  mainFunctions: string; // Describa Brevemente las Principales Funciones
  evaluationLevel: string;
  evaluationAreas: Array<{
    area: string;
    percentage: number;
  }>;
  jobDescriptorFile?: string; // URL del archivo adjunto
  
  // Campos existentes (mantener para compatibilidad)
  description?: string; // Mantener por compatibilidad
  optimizedDescription?: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requiredSkills: string[];
  desiredSkills: string[];
  educationLevel: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'draft' | 'published' | 'closed';
  aiAgentId?: string;
  publishedAt?: Date;
  closedAt?: Date;
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
  requiredProfession: { type: String, required: true },
  requiredSpecialties: { type: String },
  experienceYears: { type: Number, required: true, default: 0 },
  mainFunctions: { type: String, required: true }, // Describa Brevemente las Principales Funciones
  evaluationLevel: { type: String, required: true },
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
  educationLevel: { type: String },
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  aiAgentId: { type: String },
  publishedAt: { type: Date },
  closedAt: { type: Date }
}, {
  timestamps: true
});

// Evitar redefinición del modelo en hot reload
const Vacancy: Model<IVacancy> = mongoose.models.Vacancy || mongoose.model<IVacancy>('Vacancy', VacancySchema);

export default Vacancy;

