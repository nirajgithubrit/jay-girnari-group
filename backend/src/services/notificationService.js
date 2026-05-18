import webpush from 'web-push';
import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const REMINDER_TITLE = 'Jay Girnari Group';
const REMINDER_BODY =
  'Reminder: Please add your amount to Girnari Group fund before the 5th.';

export const initWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:sataninirajkumar0503@gmail.com';

  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not set — push notifications disabled');
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
};

export async function userAddedFundInFirstFiveDays(userId, month, year) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month - 1, 5, 23, 59, 59, 999);

  const user = await User.findById(userId).lean();
  if (!user) return false;

  const orConditions = [{ createdBy: userId }];

  if (user.linkedCustomerId) {
    orConditions.push({ customerId: user.linkedCustomerId });
  }

  const exists = await Transaction.exists({
    month,
    year,
    creditAmount: { $gt: 0 },
    date: { $gte: start, $lte: end },
    $or: orConditions,
  });

  return !!exists;
}

export async function sendPushToUser(user, payload) {
  if (!user.pushSubscriptions?.length) return;

  const deadEndpoints = [];

  for (const sub of user.pushSubscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload)
      );
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        deadEndpoints.push(sub.endpoint);
      }
    }
  }

  if (deadEndpoints.length) {
    await User.findByIdAndUpdate(user._id, {
      $pull: { pushSubscriptions: { endpoint: { $in: deadEndpoints } } },
    });
  }
}

export async function sendMonthlyFundReminders(options = {}) {
  const { force = false } = options;

  if (!initWebPush()) {
    return { sent: 0, skipped: 0, reason: 'VAPID keys not configured' };
  }

  const now = new Date();
  if (!force && now.getDate() !== 5) {
    return {
      sent: 0,
      skipped: 0,
      reason: 'Reminders only run on the 5th of each month (use force=true to test)',
    };
  }

  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const users = await User.find({
    pushSubscriptions: { $exists: true, $not: { $size: 0 } },
  });

  const payload = {
    title: REMINDER_TITLE,
    body: REMINDER_BODY,
    url: '/dashboard',
  };

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    const alreadyFunded = await userAddedFundInFirstFiveDays(user._id, month, year);
    if (alreadyFunded) {
      skipped++;
      continue;
    }

    await sendPushToUser(user, payload);
    sent++;
  }

  const summary = { sent, skipped, eligible: users.length, month, year, force };
  console.log('Monthly fund reminders:', summary);
  return summary;
}

export function startNotificationCron() {
  if (!process.env.VAPID_PUBLIC_KEY) return;

  initWebPush();

  // Every day at 9:00 AM — sends only on the 5th of each month
  cron.schedule('0 9 * * *', () => {
    sendMonthlyFundReminders().catch((err) =>
      console.error('Reminder cron error:', err)
    );
  });

  console.log('Push notification cron scheduled (daily 9:00 AM, sends on 5th)');
}
