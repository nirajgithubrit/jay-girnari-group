import { Router } from 'express';
import {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', protect, subscribePush);
router.post('/unsubscribe', protect, unsubscribePush);

export default router;
