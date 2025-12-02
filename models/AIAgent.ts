import mongoose from 'mongoose';

export interface IAIAgent extends mongoose.Document {
  name: string;
  category: string;
  isTemplate: boolean;
  createdBy: string;
  criteria: {
    experience: {
      weight: number;
      minYears: number;
      importance: 'low' | 'medium' | 'high';
    };
    technicalSkills: {
      weight: number;
      required: string[];
      desired: string[];
      certifications: string[];
    };
    education: {
      weight: number;
      minLevel: 'none' | 'high-school' | 'bachelor' | 'master' | 'phd';
      required: boolean;
    };
    softSkills: {
      weight: number;
      keySkills: string[];
    };
    progression: {
      weight: number;
    };
  };
  thresholds: {
    ideal: number;
    potential: number;
    review: number;
  };
  systemPrompt: string;
  active: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AIAgentSchema = new mongoose.Schema<IAIAgent>({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['desarrollo', 'gerencia', 'diseño', 'marketing', 'finanzas', 'rrhh', 'operaciones', 'soporte', 'otro'],
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    default: 'system',
  },
  criteria: {
    experience: {
      weight: { type: Number, default: 30 },
      minYears: { type: Number, default: 0 },
      importance: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    },
    technicalSkills: {
      weight: { type: Number, default: 30 },
      required: [{ type: String }],
      desired: [{ type: String }],
      certifications: [{ type: String }],
    },
    education: {
      weight: { type: Number, default: 15 },
      minLevel: { type: String, enum: ['none', 'high-school', 'bachelor', 'master', 'phd'], default: 'bachelor' },
      required: { type: Boolean, default: false },
    },
    softSkills: {
      weight: { type: Number, default: 15 },
      keySkills: [{ type: String }],
    },
    progression: {
      weight: { type: Number, default: 10 },
    },
  },
  thresholds: {
    ideal: { type: Number, default: 80 },
    potential: { type: Number, default: 65 },
    review: { type: Number, default: 50 },
  },
  systemPrompt: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.AIAgent || mongoose.model<IAIAgent>('AIAgent', AIAgentSchema);

