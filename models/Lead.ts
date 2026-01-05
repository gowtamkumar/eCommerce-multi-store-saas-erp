import { LeadStatus } from "@/lib/enums/lead-status";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILead extends Document {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    subject: string;
    message: string;
    status: LeadStatus;
    createdAt: Date;
    tenantId: mongoose.Types.ObjectId;
}

const LeadSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: [LeadStatus.NEW, LeadStatus.READ, LeadStatus.REPLIED], default: LeadStatus.NEW },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    },
    { timestamps: true }
);

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;
