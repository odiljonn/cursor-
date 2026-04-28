# hard.oil frontend (Vite + React)

Frontend-only variant for easy Vercel deployment.

## Local run

1. `cp .env.example .env`
2. Fill `.env` (`VITE_TELEGRAM_BOT_TOKEN`, `VITE_TELEGRAM_CHAT_ID`)
3. `npm install`
4. `npm run dev`

## Build

- `npm run build`
- `npm run preview`

## Vercel

Set Environment Variables in Vercel project:

- `VITE_TELEGRAM_BOT_TOKEN`
- `VITE_TELEGRAM_CHAT_ID`
- `VITE_TELEGRAM_GROUP_LINK` (optional)
- `VITE_ORDER_API_URL` (optional)

No backend service is required in this mode.
