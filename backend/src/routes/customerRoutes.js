import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', getCustomers);
router.get('/:id', getCustomer);

router.use(restrictTo('admin'));

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  ],
  validate,
  createCustomer
);

router.put(
  '/:id',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  ],
  validate,
  updateCustomer
);

router.delete('/:id', deleteCustomer);

export default router;
