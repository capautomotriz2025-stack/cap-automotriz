import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVacancy extends Document {
  title: string;
  description: string;
  optimizedDescription?: string;
  department: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requiredSkills: string[];
  desiredSkills: string[];
  experienceYears: number;
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
  title: { type: String, required: true },
  description: { type: String, required: true },
  optimizedDescription: { type: String },
  department: { type: String, required: true },
  location: { type: String, required: true },
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'MXN' }
  },
  requiredSkills: [{ type: String }],
  desiredSkills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
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

