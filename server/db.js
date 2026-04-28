import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import { getDefaultSitePayload } from './defaultPayload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function openDb() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'site.sqlite')
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS site_data (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload TEXT NOT NULL
    );
  `)
  return db
}

export function seedIfEmpty(db) {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c
  if (userCount === 0) {
    const username = (process.env.ADMIN_USERNAME || 'admin').trim()
    const plain = process.env.ADMIN_INITIAL_PASSWORD || 'hardoil2026'
    const hash = bcrypt.hashSync(plain, 10)
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash)
    console.log(`[server] Seeded admin user "${username}" (change ADMIN_INITIAL_PASSWORD in .env)`)
  }

  const siteRow = db.prepare('SELECT payload FROM site_data WHERE id = 1').get()
  if (!siteRow) {
    const payload = JSON.stringify(getDefaultSitePayload())
    db.prepare('INSERT INTO site_data (id, payload) VALUES (1, ?)').run(payload)
    console.log('[server] Seeded default site_data')
  }
}

export function getSitePayload(db) {
  const row = db.prepare('SELECT payload FROM site_data WHERE id = 1').get()
  if (!row) return null
  return JSON.parse(row.payload)
}

export function saveSitePayload(db, payload) {
  const text = JSON.stringify(payload)
  db.prepare('INSERT OR REPLACE INTO site_data (id, payload) VALUES (1, ?)').run(text)
}

export function findUserByUsername(db, username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username)
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash)
}

export function updateUserCredentials(db, userId, username, passwordHash) {
  db.prepare('UPDATE users SET username = ?, password_hash = ? WHERE id = ?').run(
    username,
    passwordHash,
    userId,
  )
}
