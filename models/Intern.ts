import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluation {
  id: string;
  week: number;
  score: number;
  feedback: string;
  evaluatedBy?: mongoose.Types.ObjectId;
}

export interface IIntern extends Document {
  user: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  university: string;
  mentor?: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'terminated';
  evaluations: IEvaluation[];
  badges: string[];
  totalWeeks: number;
}

const EvaluationSchema = new Schema<IEvaluation>({
  id: { type: String, required: true },
  week: { type: Number, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  feedback: { type: String, required: true, trim: true },
  evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

const InternSchema = new Schema<IIntern>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    university: { type: String, required: true, trim: true },
    mentor: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'terminated'],
      default: 'active',
    },
    evaluations: [EvaluationSchema],
    badges: [{ type: String, trim: true }],
    totalWeeks: { type: Number, required: true, min: 1, default: 12 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Intern || mongoose.model<IIntern>('Intern', InternSchema);
