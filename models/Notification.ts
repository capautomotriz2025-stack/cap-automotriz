import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  type: 'vacancy_deadline' | 'vacancy_closed' | 'candidate_applied' | 'system';
  title: string;
  message: string;
  relatedVacancyId?: mongoose.Types.ObjectId;
  relatedCandidateId?: mongoose.Types.ObjectId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  type: {
    type: String,
    enum: ['vacancy_deadline', 'vacancy_closed', 'candidate_applied', 'system'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedVacancyId: { type: Schema.Types.ObjectId, ref: 'Vacancy' },
  relatedCandidateId: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  read: { type: Boolean, default: false },
  readAt: { type: Date }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas de notificaciones no leídas
NotificationSchema.index({ read: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
