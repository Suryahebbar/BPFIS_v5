import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminAuditLog extends Document {
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceDetails?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'success' | 'failed';
  errorMessage?: string;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>({
  adminId: { type: String, required: true, index: true },
  adminEmail: { type: String, required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'approve_document', 'update_user_status', 'delete_user'
  resourceType: { type: String, required: true }, // e.g., 'user', 'document', 'order'
  resourceId: { type: String, required: true },
  resourceDetails: { type: Schema.Types.Mixed }, // Details of what was changed
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  errorMessage: { type: String }
}, {
  timestamps: true
});

// Indexes for better query performance
AdminAuditLogSchema.index({ adminId: 1, timestamp: -1 });
AdminAuditLogSchema.index({ action: 1, timestamp: -1 });
AdminAuditLogSchema.index({ resourceType: 1, resourceId: 1 });

export const AdminAuditLog = mongoose.models.AdminAuditLog || mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);
