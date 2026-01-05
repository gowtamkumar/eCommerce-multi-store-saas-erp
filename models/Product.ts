import { ProductStatus } from "@/lib/enums/product-status";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountAmount?: number;
  images: string[];
  features: string[];
  stock: number;
  status: string;
  tagline?: string;
  socialProof?: {
    noun: string;
    count: number;
    rating: number;
    avatars: string[];
  };
  heroHighlights?: Array<{
    icon: string;
    label: string;
    value: string;
    color: string;
  }>;
  specifications?: Array<{
    label: string;
    value: string;
  }>;
  keyBenefits?: Array<{
    icon: string;
    title: string;
    description: string;
    color?: string;
  }>;
  videoUrl?: string;
  releaseBadgeText?: string;
  sections?: {
    techSpecs?: {
      heading: string;
      subheading: string;
      description: string;
    };
    features?: {
      heading: string;
      subheading: string;
      description: string;
    };
  };
  reviewSectionType?: "testimonials" | "reviews";
  tenantId: mongoose.Types.ObjectId;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    images: { type: [String], required: true },
    features: { type: [String], required: true }, //need  to check this field
    stock: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [ProductStatus.ACTIVE, ProductStatus.INACTIVE],
      default: ProductStatus.INACTIVE,
    },
    tagline: { type: String },
    socialProof: {
      noun: { type: String, default: "customers" },
      count: { type: Number, default: 2000 },
      rating: { type: Number, default: 5 },
      avatars: { type: [String], default: [] },
    },
    heroHighlights: [
      {
        icon: { type: String },
        label: { type: String },
        value: { type: String },
        color: { type: String, default: "blue" },
      },
    ],
    specifications: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    keyBenefits: [
      {
        icon: { type: String },
        title: { type: String },
        description: { type: String },
        color: { type: String },
      },
    ],
    videoUrl: { type: String },
    releaseBadgeText: { type: String, default: "" },
    sections: {
      techSpecs: {
        heading: { type: String, default: "" },
        subheading: { type: String, default: "" },
        description: {
          type: String,
          default: "",
        },
      },
      features: {
        heading: { type: String, default: "" },
        subheading: { type: String, default: "" },
        description: {
          type: String,
          default: "",
        },
      },
    },
    reviewSectionType: {
      type: String,
      enum: ["testimonials", "reviews"],
      default: "testimonials",
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
