import { Router } from 'express';
import {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  testSendReminders,
} from '../controllers/notificationController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', protect, subscribePush);
router.post('/unsubscribe', protect, unsubscribePush);
router.post('/test-send', protect, restrictTo('admin'), testSendReminders);

export default router;
