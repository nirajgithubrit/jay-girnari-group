import Transaction from '../models/Transaction.js';
import Customer from '../models/Customer.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getMonthYear = (date) => {
  const d = new Date(date);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

export const createTransaction = asyncHandler(async (req, res) => {
  const { customerId, date, creditAmount = 0, debitAmount = 0 } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) throw new AppError('Customer not found', 404);

  const { month, year } = getMonthYear(date);

  const transaction = await Transaction.create({
    customerId,
    date: new Date(date),
    creditAmount: Number(creditAmount) || 0,
    debitAmount: Number(debitAmount) || 0,
    month,
    year,
    createdBy: req.user._id,
  });

  const populated = await Transaction.findById(transaction._id).populate(
    'customerId',
    'name phoneNumber'
  );

  res.status(201).json({ success: true, data: populated });
});

export const getMonthlyTransactions = asyncHandler(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();
  const { search, page = 1, limit = 100 } = req.query;

  const filter = { month, year };

  let transactions = await Transaction.find(filter)
    .populate('customerId', 'name phoneNumber')
    .sort({ date: -1 })
    .lean();

  if (search) {
    const regex = new RegExp(search, 'i');
    transactions = transactions.filter(
      (t) =>
        regex.test(t.customerId?.name || '') ||
        regex.test(t.customerId?.phoneNumber || '')
    );
  }

  const total = transactions.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = transactions.slice(skip, skip + Number(limit));

  res.status(200).json({
    success: true,
    data: paginated,
    month,
    year,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const { date, creditAmount, debitAmount } = req.body;
  const update = {};

  if (date) {
    update.date = new Date(date);
    const { month, year } = getMonthYear(date);
    update.month = month;
    update.year = year;
  }
  if (creditAmount !== undefined) update.creditAmount = Number(creditAmount);
  if (debitAmount !== undefined) update.debitAmount = Number(debitAmount);

  const transaction = await Transaction.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  }).populate('customerId', 'name phoneNumber');

  if (!transaction) throw new AppError('Transaction not found', 404);
  res.status(200).json({ success: true, data: transaction });
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);
  if (!transaction) throw new AppError('Transaction not found', 404);
  res.status(200).json({ success: true, message: 'Transaction deleted' });
});

export const getTotals = asyncHandler(async (req, res) => {
  // Cumulative totals across all months (not filtered by selected month)
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalCredit: { $sum: '$creditAmount' },
        totalDebit: { $sum: '$debitAmount' },
      },
    },
  ]);

  const totals = result[0] || { totalCredit: 0, totalDebit: 0 };
  const totalCredit = totals.totalCredit || 0;
  const totalDebit = totals.totalDebit || 0;

  res.status(200).json({
    success: true,
    data: {
      totalCredit,
      totalDebit,
      totalFund: totalCredit - totalDebit,
    },
  });
});
