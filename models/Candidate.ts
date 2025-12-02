import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICandidate extends Document {
  vacancyId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  cvText?: string;
  
  // Análisis de IA
  aiScore: number; // 1-100
  aiClassification: 'ideal' | 'potencial' | 'no perfila';
  aiJustification?: string;
  
  // Estado del proceso
  status: 'applied' | 'screening' | 'interview' | 'evaluation' | 'offer' | 'hired' | 'rejected';
  
  // Evaluación detallada (para finalistas)
  evaluation?: {
    interviewNotes?: string;
    technicalScore?: number;
    culturalFitScore?: number;
    psychometricTestUrl?: string;
    evaluatedBy?: string;
    evaluatedAt?: Date;
  };
  
  // Comunicación
  communications: Array<{
    type: 'email' | 'whatsapp' | 'call';
    message: string;
    sentBy?: string;
    sentAt: Date;
  }>;
  
  // Carta de oferta
  offerLetter?: {
    content: string;
    generatedAt: Date;
    acceptedAt?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema = new Schema<ICandidate>({
  vacancyId: { type: Schema.Types.ObjectId, ref: 'Vacancy', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  cvUrl: { type: String, required: true },
  cvText: { type: String },
  
  aiScore: { type: Number, min: 0, max: 100, default: 0 },
  aiClassification: { 
    type: String, 
    enum: ['ideal', 'potencial', 'no perfila'],
    default: 'no perfila'
  },
  aiJustification: { type: String },
  
  status: { 
    type: String, 
    enum: ['applied', 'screening', 'interview', 'evaluation', 'offer', 'hired', 'rejected'],
    default: 'applied'
  },
  
  evaluation: {
    interviewNotes: { type: String },
    technicalScore: { type: Number, min: 0, max: 100 },
    culturalFitScore: { type: Number, min: 0, max: 100 },
    psychometricTestUrl: { type: String },
    evaluatedBy: { type: String },
    evaluatedAt: { type: Date }
  },
  
  communications: [{
    type: { type: String, enum: ['email', 'whatsapp', 'call'], required: true },
    message: { type: String, required: true },
    sentBy: { type: String },
    sentAt: { type: Date, default: Date.now }
  }],
  
  offerLetter: {
    content: { type: String },
    generatedAt: { type: Date },
    acceptedAt: { type: Date }
  }
}, {
  timestamps: true
});

// Índices para búsqueda eficiente
CandidateSchema.index({ vacancyId: 1, status: 1 });
CandidateSchema.index({ email: 1 });
CandidateSchema.index({ aiScore: -1 });

const Candidate: Model<ICandidate> = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);

export default Candidate;

