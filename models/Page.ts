import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;
  contentType: 'html' | 'markdown';
  metaDescription?: string;
  status: 'draft' | 'published';
  sections?: Array<{
    id: string;
    type: string;
    content: any;
    order: number;
  }>;
  updatedAt: string;
  createdAt: string;
  tenantId: mongoose.Types.ObjectId;
}

const PageSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String },
  contentType: { type: String, enum: ['html', 'markdown'], default: 'markdown' },
  metaDescription: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  sections: [{
    id: { type: String },
    type: { type: String, enum: ['hero', 'content', 'features', 'faq', 'cta', 'testimonials', 'products'] },
    content: { type: Schema.Types.Mixed },
    order: { type: Number, default: 0 }
  }],
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
}, { timestamps: true });

const Page: Model<IPage> = mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);

export default Page;
