import { UserRole } from '@/lib/enums/user-role';
import { UserStatus } from '@/lib/enums/user-status';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  username?: string;
  address?: string;
  image?: string;
  status: UserStatus;
  tenantId: mongoose.Schema.Types.ObjectId;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: [UserRole.SuperAdmin, UserRole.ADMIN, UserRole.USER], default: UserRole.USER },
  phone: { type: String },
  address: { type: String },
  image: { type: String },
  status: { type: String, enum: [UserStatus.ACTIVE, UserStatus.BLOCKED], default: UserStatus.ACTIVE },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: false },
}, { timestamps: true });

// Compound indices for tenant-scoped uniqueness
UserSchema.index({ username: 1, tenantId: 1 }, { unique: true });
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
