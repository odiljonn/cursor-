import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import session from 'express-session'
import rateLimit from 'express-rate-limit'
import { openDb, seedIfEmpty, getSitePayload, saveSitePayload, findUserByUsername, verifyPassword, updateUserCredentials } from './db.js'
import bcrypt from 'bcrypt'

const PORT = Number(process.env.PORT || 8787)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '').trim()

const db = openDb()
seedIfEmpty(db)

const app = express()
app.set('trust proxy', 1)

const corsOrigins = FRONTEND_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  }),
)

app.use(
  express.json({
    limit: process.env.JSON_BODY_LIMIT || '50mb',
  }),
)

app.use(
  session({
    name: 'hardoil_sid',
    secret: process.env.SESSION_SECRET || 'dev-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.ORDER_RATE_LIMIT || 40),
  standardHeaders: true,
  legacyHeaders: false,
})

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/site-data', (_req, res) => {
  const payload = getSitePayload(db)
  if (!payload) return res.status(404).json({ error: 'No site data' })
  res.json(payload)
})

app.post('/api/send-order', orderLimiter, async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text : ''
  if (!text.trim()) {
    return res.status(400).json({ error: 'text required' })
  }
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ error: 'Server missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' })
  }
  const chatId = /^-?\d+$/.test(TELEGRAM_CHAT_ID) ? Number(TELEGRAM_CHAT_ID) : TELEGRAM_CHAT_ID
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const tgRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    const data = await tgRes.json().catch(() => ({}))
    if (!tgRes.ok || data.ok === false) {
      return res.status(400).json({
        ok: false,
        description: data.description || `Telegram HTTP ${tgRes.status}`,
      })
    }
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'send failed' })
  }
})

app.post('/api/admin/login', (req, res) => {
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' })
  }
  const user = findUserByUsername(db, username)
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  req.session.userId = user.id
  req.session.username = user.username
  res.json({ ok: true, username: user.username })
})

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('hardoil_sid')
    res.json({ ok: true })
  })
})

app.get('/api/admin/site-data', requireAuth, (_req, res) => {
  const payload = getSitePayload(db)
  if (!payload) return res.status(404).json({ error: 'No site data' })
  res.json(payload)
})

app.put('/api/admin/site-data', requireAuth, (req, res) => {
  const body = req.body
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'invalid body' })
  }
  const { products, news, aboutContent, contactData } = body
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'products array required' })
  }
  saveSitePayload(db, { products, news, aboutContent, contactData })
  res.json({ ok: true })
})

app.patch('/api/admin/credentials', requireAuth, (req, res) => {
  const currentPassword = String(req.body?.currentPassword || '')
  const nextUsername = String(req.body?.nextUsername || '').trim()
  const nextPassword = String(req.body?.nextPassword || '')
  if (!currentPassword || !nextUsername || !nextPassword) {
    return res.status(400).json({ error: 'currentPassword, nextUsername, nextPassword required' })
  }
  if (nextUsername.length < 3) {
    return res.status(400).json({ error: 'username too short' })
  }
  if (nextPassword.length < 8 || !/[A-Za-z]/.test(nextPassword) || !/\d/.test(nextPassword)) {
    return res.status(400).json({ error: 'weak password' })
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId)
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'current password wrong' })
  }
  const hash = bcrypt.hashSync(nextPassword, 10)
  updateUserCredentials(db, user.id, nextUsername, hash)
  req.session.username = nextUsername
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`)
})
