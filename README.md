# Sahal

E-commerce platform with a credit/wallet system. Three apps live in this repo and are installed and run independently.

| App | Stack | What it is | Local URL |
|---|---|---|---|
| `backend/` | Node, Express, MongoDB | REST API | http://localhost:4000 |
| `admin-panel/` | React 18 + Vite | Admin **web** dashboard | http://localhost:3000 |
| `frontend/` | React Native 0.82 | Customer / vendor **mobile** app | Metro on http://localhost:8081 |

There is no customer storefront in the browser. Web = the admin panel. Mobile = the React Native app.

## Prerequisites (Windows)

- Node.js 20.19.4 or newer
- JDK 17
- Android Studio with SDK Platform-Tools, Emulator, and a phone AVD (`Pixel_8_Pro` works)
- MongoDB on port 27017 (or Atlas). Copy `backend/.env.example` → `backend/.env`.

## Quick start (demo)

```powershell
# Terminal 1 — API
cd backend
npm install
npm run seed-demo              # buyer / vendor / admin accounts + buyer wallet
npm run create-sample-products # sample catalogue (safe to re-run)
npm run dev

# Terminal 2 — Admin web
cd admin-panel
npm install
npm run dev

# Terminal 3 — Mobile
cd frontend
npm install
npm start
# Terminal 4
npm run android:windows
```

## Demo accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@sahal.com` | `admin123` | Admin panel |
| Buyer | `buyer@sahal.com` | `buyer123` | 500 wallet credits |
| Vendor | `vendor@sahal.com` | `vendor123` | Approved — can upload products |

Signup in the app supports **Customer** or **Vendor**. New vendors stay `pending` until an admin approves them under **Vendors**.

## Client demo checklist

1. Login as buyer → browse live products → heart (wishlist) → add to cart
2. Checkout → pay with **Sahal Credits** → see order under **My Orders**
3. Open admin → **Orders** shows the purchase; **Credit Balances** updated
4. Login as vendor → drawer **Add Product** (images + category) → product appears on buyer Home and admin **Products**
5. Profile tab loads/saves name, email, phone, address and shows wallet balance

Payment for this demo is **wallet credits** (not live Stripe). Card UI is visual only.

## Environment

- Backend: `MONGODB_URI`, `JWT_SECRET`, `TOPUP_WEBHOOK_SECRET` (see `backend/.env.example`)
- Admin: `VITE_API_URL=http://localhost:4000/api`
- Mobile API host: [frontend/src/config/api.ts](frontend/src/config/api.ts) — Android emulator uses `10.0.2.2:4000`

## Design

Figma: [Sahal Ecommerce App](https://www.figma.com/design/wHv1gs7Mfa9r8yryetnSY8/Sahal---Ecommerce-App?node-id=2-16800)
