import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTransaction,
  getMonthlyTransactions,
  updateTransaction,
  deleteTransaction,
  getTotals,
} from '../controllers/transactionController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', getMonthlyTransactions);
router.get('/totals', getTotals);

router.use(restrictTo('admin'));

router.post(
  '/',
  [
    body('customerId').notEmpty().withMessage('Customer is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('creditAmount').optional().isFloat({ min: 0 }).withMessage('Credit must be a positive number'),
    body('debitAmount').optional().isFloat({ min: 0 }).withMessage('Debit must be a positive number'),
  ],
  validate,
  createTransaction
);

router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
