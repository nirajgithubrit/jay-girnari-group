import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    creditAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    debitAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ month: 1, year: 1 });
transactionSchema.index({ customerId: 1, month: 1, year: 1 });

export default mongoose.model('Transaction', transactionSchema);
