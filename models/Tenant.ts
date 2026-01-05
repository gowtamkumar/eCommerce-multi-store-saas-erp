import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITenant extends Document {
  storeName: string;
  subdomain: string;
  customDomain?: string;
  planTier: "basic" | "pro" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: [255, "Store name cannot exceed 255 characters"],
    },
    subdomain: {
      type: String,
      required: [true, "Subdomain is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [100, "Subdomain cannot exceed 100 characters"],
      match: [/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"], 
    },
    customDomain: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      trim: true,
      maxlength: [255, "Custom domain cannot exceed 255 characters"],
    },
    planTier: {
      type: String,
      enum: ["basic", "pro", "enterprise"],
      default: "basic",
    },
  },
  {
    timestamps: true,
  }
);

const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema);

export default Tenant;
