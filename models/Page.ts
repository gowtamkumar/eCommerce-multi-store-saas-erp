import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISection {
  id: string;
  type: 'hero' | 'features' | 'product-grid' | 'rich-text' | 'collection';
  content: any;
  settings?: any;
}

export interface IPage extends Document {
  title: string;
  slug: string;
  isHomePage: boolean;
  sections: ISection[];
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published';
  tenantId: mongoose.Types.ObjectId;
}

const PageSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, default: "" },
    isHomePage: { type: Boolean, default: false },
    sections: [{ type: Schema.Types.Mixed }], // Storing flexible JSON for sections
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

// Compound index to ensure slugs are unique per tenant
PageSchema.index({ slug: 1, tenantId: 1 }, { unique: true });
// Ensure only one home page per tenant
PageSchema.index({ tenantId: 1, isHomePage: 1 }, { unique: true, partialFilterExpression: { isHomePage: true } });

// In development, we might change the schema, so we delete the model from cache to force re-registration
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Page;
}

const Page: Model<IPage> = mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default Page;
