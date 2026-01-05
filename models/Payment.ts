import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  transactionId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  gatewayResponse: any;
  tenantId: mongoose.Types.ObjectId;
}

const PaymentSchema: Schema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  method: { type: String, required: true },
  status: { type: String, required: true },
  gatewayResponse: { type: Schema.Types.Mixed },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
}, { timestamps: true });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
