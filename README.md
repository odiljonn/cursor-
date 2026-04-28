# hard.oil sayt (Vite + React) + Express backend

## Ishga tushirish (development)

1. `cp .env.example .env` va `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SESSION_SECRET` ni to‘ldiring (server ham shu ildizdagi `.env` dan o‘qiydi).
2. Frontend uchun: `VITE_USE_BACKEND=true`
3. `npm install`
4. `npm run dev` — Vite (`5173`) va Express (`8787`) birga ishga tushadi; brauzer `/api` ni proxy orqali serverga yuboradi.

**Birinchi kirish:** login `admin`, parol `.env` dagi `ADMIN_INITIAL_PASSWORD` (default `hardoil2026`).

## Production

- Frontend: `npm run build` → `dist` ni static hostingga.
- Backend: `NODE_ENV=production npm run start:server` (yoki PM2/systemd).
- `FRONTEND_ORIGIN` da real sayt URL; `SESSION_SECRET` kuchli bo‘lsin; `secure` cookie uchun HTTPS kerak.

## API

| Yo‘l | Tavsif |
|------|--------|
| `GET /api/site-data` | Sayt ma’lumoti (ommaviy) |
| `POST /api/send-order` | Buyurtma matni → Telegram |
| `POST /api/admin/login` | Admin login (session cookie) |
| `POST /api/admin/logout` | Chiqish |
| `PUT /api/admin/site-data` | Mahsulotlar / yangiliklar / kontakt (auth) |
| `PATCH /api/admin/credentials` | Login/parol almashtirish (auth) |

Ma’lumotlar `server/data/site.sqlite` da (git ignore).

## Eski rejim

`VITE_USE_BACKEND=false` qilsangiz, mahsulotlar yana `localStorage`da, Telegram esa (devda) to‘g‘ridan-to‘g‘ri frontenddan yuborilishi mumkin.
