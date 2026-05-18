# Jay Girnari Group — Credit & Debit Management

**Jay Girnari Group** · *Girnari Group Surendranagar*

Full-stack web app to manage monthly credit/debit entries, fund balance, and user records. Built with **Angular 19** (standalone + PWA) and **Node.js / Express / MongoDB**.

## Project structure

```
Jay Girnari Group/
├── frontend/     # Angular + Tailwind + PWA
└── backend/      # Express REST API + MongoDB
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run seed:admin
npm run dev
```

API runs at `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:4200`

## Default admin (after seed)

| Field    | Default                 |
|----------|-------------------------|
| Email    | admin@jaygirnari.com    |
| Password | Admin@1234            |

Override via `.env`:

```
ADMIN_USERNAME=admin
ADMIN_EMAIL=sataninirajkumar0503@gmail.com
ADMIN_PASSWORD=YourSecurePassword
```

> Admin role is assigned only via `npm run seed:admin` or directly in MongoDB. Registered users always get role `user`.

## API endpoints

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Auth |
| GET/POST/PUT/DELETE | `/api/customers` | GET: all · CUD: admin |
| GET | `/api/transactions` | Auth |
| GET | `/api/transactions/totals` | Auth |
| POST/PUT/DELETE | `/api/transactions` | Admin |

## Features

- JWT authentication with persistent login
- Role-based UI (admin vs user)
- Monthly transaction dashboard with prev/next month navigation
- Fund totals footer: **Total Fund = Credit − Debit**
- Admin: manage customers, add credit/debit data, edit/delete
- Users: view-only access
- PWA installable on Android & iOS
- Responsive mobile-first Girnar-inspired UI

## PWA — Install on Android & iOS

The app is a Progressive Web App. **Service worker runs in production builds only** (not `ng serve`).

### Build & test locally

```bash
cd frontend
npm run build:pwa
npm run serve:pwa
```

Open `http://localhost:4200` in Chrome (Android) or Safari (iOS).

### Android

1. Deploy over **HTTPS** (required for install).
2. Open the site in Chrome.
3. Tap **Install** on the dashboard banner, or use browser menu → **Install app** / **Add to Home screen**.

### iPhone / iPad (Safari)

1. Open the site in **Safari** (not Chrome).
2. Tap **Share** (square with arrow).
3. Tap **Add to Home Screen** → **Add**.

### Production

- Host `dist/frontend/browser` on HTTPS.
- Update `frontend/src/environments/environment.ts` with your production API URL.
- Add your API host to `frontend/ngsw-config.json` → `dataGroups.urls` for offline caching.

## Production build

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build:pwa
# Serve dist/frontend/browser with your web server (HTTPS recommended)
```

Update `frontend/src/environments/environment.ts` with your production API URL.

## Security notes

- Change `JWT_SECRET` and admin password in production
- Use HTTPS in production
- Never commit `.env` files
