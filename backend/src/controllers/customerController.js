import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCustomer = asyncHandler(async (req, res) => {
  const { name, phoneNumber } = req.body;
  const customer = await Customer.create({ name, phoneNumber });
  res.status(201).json({ success: true, data: customer });
});

export const getCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { phoneNumber: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
    Customer.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: customers,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new AppError('Customer not found', 404);
  res.status(200).json({ success: true, data: customer });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phoneNumber: req.body.phoneNumber },
    { new: true, runValidators: true }
  );
  if (!customer) throw new AppError('Customer not found', 404);
  res.status(200).json({ success: true, data: customer });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) throw new AppError('Customer not found', 404);
  await Transaction.deleteMany({ customerId: req.params.id });
  res.status(200).json({ success: true, message: 'Customer deleted' });
});
