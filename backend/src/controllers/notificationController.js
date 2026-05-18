import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMonthlyFundReminders } from '../services/notificationService.js';

export const getVapidPublicKey = asyncHandler(async (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    throw new AppError('Push notifications are not configured', 503);
  }
  res.json({ success: true, publicKey: key });
});

export const subscribePush = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new AppError('Invalid push subscription', 400);
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { pushSubscriptions: { endpoint } },
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      pushSubscriptions: { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
    },
  });

  res.json({ success: true, message: 'Subscribed to notifications' });
});

export const unsubscribePush = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  if (endpoint) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { pushSubscriptions: { endpoint } },
    });
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { pushSubscriptions: [] },
    });
  }
  res.json({ success: true, message: 'Unsubscribed' });
});

/** Admin only — bypasses "5th of month" rule for testing */
export const testSendReminders = asyncHandler(async (req, res) => {
  const result = await sendMonthlyFundReminders({ force: true });
  res.json({
    success: true,
    message: 'Test reminders processed',
    data: result,
  });
});
