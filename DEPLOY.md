# Deploy Guide — Netlify + Render

## 1. Backend on Render

1. Push code to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** (or Web Service).
3. Connect repo; use `render.yaml` or set:
   - **Root directory:** `backend`
   - **Build:** `npm install`
   - **Start:** `npm start`
4. Environment variables:

| Key | Value |
|-----|--------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret |
| `FRONTEND_URL` | `https://your-app.netlify.app` |
| `VAPID_PUBLIC_KEY` | From `npm run generate:vapid` |
| `VAPID_PRIVATE_KEY` | From `npm run generate:vapid` |
| `VAPID_SUBJECT` | `mailto:sataninirajkumar0503@gmail.com` |

5. After deploy, note API URL: `https://your-service.onrender.com`

6. Run seed once (Render Shell or local with production URI):
   ```bash
   npm run seed:admin
   ```

## 2. Frontend on Netlify

1. [Netlify](https://app.netlify.com) → **Add new site** → Import from Git.
2. Settings (or use root `netlify.toml`):
   - **Base directory:** `frontend`
   - **Build command:** `npm ci && npm run build:pwa`
   - **Publish directory:** `frontend/dist/frontend/browser`
3. Update `frontend/src/environments/environment.production.ts`:
   ```typescript
   apiUrl: 'https://YOUR-SERVICE.onrender.com/api',
   vapidPublicKey: 'YOUR_VAPID_PUBLIC_KEY',
   ```
4. Deploy. Open your Netlify URL — splash screen shows logo while app loads.

## 3. Push notifications

Generate keys:
```bash
cd backend
npm run generate:vapid
```

- Put **public** key in `environment.production.ts` → `vapidPublicKey`
- Put **both** keys in Render env vars
- Users tap **Enable** on dashboard (production HTTPS + PWA build required)
- Reminders run **every month on the 5th at 9:00 AM**
- Users who already added **credit fund on days 1–5** (via linked customer or their own entry) **do not** receive the reminder

### Link user to customer (MongoDB)

For members who don't create transactions themselves, set on their User document:
```json
{ "linkedCustomerId": ObjectId("...customer _id...") }
```

## 4. Local PWA test

```bash
cd frontend
npm run build:pwa
npm run serve:pwa
```
