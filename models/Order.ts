import { OrderStatus } from "@/lib/enums/order-status";
import { PaymentMethod } from "@/lib/enums/payment-method";
import { PaymentStatus } from "@/lib/enums/payment-status";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  currencyRate: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  orderNotes?: string;
  userId?: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
}

const OrderSchema: Schema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    address: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "BDT" },
    currencyRate: { type: Number, default: 1 },
    status: {
      type: String,
      enum: [OrderStatus.PENDING, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      default: OrderStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: [PaymentMethod.COD, PaymentMethod.SSLCOMMERZ],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: [PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.FAILED],
      default: PaymentStatus.PENDING,
    },
    transactionId: { type: String },
    orderNotes: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
