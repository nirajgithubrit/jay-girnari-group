# How to Test Push Notifications (any day, including 19 May)

The real cron runs **only on the 5th** at 9:00 AM. Use **test mode** below to try today.

## Prerequisites

1. **VAPID keys** in `backend/.env`:
   ```bash
   cd backend
   npm run generate:vapid
   ```
   Copy `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` into `.env`.

2. Same **public key** in `frontend/src/environments/environment.development.ts`:
   ```typescript
   vapidPublicKey: 'YOUR_PUBLIC_KEY_HERE',
   ```

3. Restart backend: `npm run dev`

## Option A — Production PWA build (recommended)

Push needs **HTTPS** or **localhost** with a **service worker**.

```bash
cd frontend
npm run build:pwa
npm run serve:pwa
```

Open `http://localhost:4200` → login → dashboard → **Enable** notifications → allow browser permission.

As **admin**, click **Send test** on the dashboard (below the enable banner).

## Option B — `ng serve` (limited)

Service worker is **off** in dev by default, so push may not work on `npm start`.

Use Option A for reliable testing.

## Option C — API test (Postman / curl)

1. Login as admin, copy JWT token.
2. Enable notifications in the app first (so your user has a subscription).
3. Run:

```bash
curl -X POST http://localhost:3000/api/notifications/test-send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Response example:
```json
{
  "success": true,
  "data": { "sent": 1, "skipped": 0, "eligible": 1, "month": 5, "year": 2026, "force": true }
}
```

## Who receives the test?

| User | Gets notification? |
|------|-------------------|
| Enabled push + **no** credit on days 1–5 this month | Yes |
| Enabled push + **already** added credit 1–5 May | No (skipped) |
| Did not click Enable | No |

## Test “already funded” skip

1. As admin, add **User Data** with credit for a date between **1–5 May 2026**.
2. Link that customer to your user in MongoDB (`linkedCustomerId`) OR use your own `createdBy` on that transaction.
3. Run **Send test** again — you should be **skipped**.

## Production (Netlify + Render)

- Both must use **HTTPS**.
- VAPID keys on Render env.
- `vapidPublicKey` in `environment.production.ts`.
- Users enable notifications on dashboard after install.
