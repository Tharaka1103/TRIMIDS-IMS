import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingsFeatures {
  tasks: boolean;
  attendance: boolean;
  finance: boolean;
  evaluations: boolean;
}

export interface ISettings extends Document {
  companyName: string;
  companyLogo?: string;
  primaryColor: string;
  timezone: string;
  maintenanceMode: boolean;
  features: ISettingsFeatures;
}

const SettingsSchema = new Schema<ISettings>(
  {
    companyName: { type: String, required: true, default: 'TRIMIDS IMS' },
    companyLogo: { type: String },
    primaryColor: { type: String, required: true, default: 'default' },
    timezone: { type: String, required: true, default: 'UTC' },
    maintenanceMode: { type: Boolean, required: true, default: false },
    features: {
      tasks: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      finance: { type: Boolean, default: false },
      evaluations: { type: Boolean, default: true }
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
