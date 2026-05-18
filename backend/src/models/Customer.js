import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', phoneNumber: 'text' });

export default mongoose.model('Customer', customerSchema);
