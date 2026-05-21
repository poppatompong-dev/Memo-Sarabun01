import { createClient, type Client } from '@libsql/client'
import signatoriesSeed from '@/data/signatories.json'
import closingsSeed from '@/data/closings.json'

function makeClient(): Client {
  const url = process.env.TURSO_DATABASE_URL ?? 'file:database/memos.db'
  const authToken = process.env.TURSO_AUTH_TOKEN
  return createClient({ url, ...(authToken ? { authToken } : {}) })
}

let _client: Client | null = null
let _ready = false

async function db(): Promise<Client> {
  if (!_client) _client = makeClient()
  if (_ready) return _client

  const c = _client

  await c.execute(`CREATE TABLE IF NOT EXISTS memos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_number TEXT,
    subject TEXT NOT NULL,
    department TEXT,
    division TEXT,
    recipient TEXT,
    content_background TEXT,
    content_facts TEXT,
    content_consideration TEXT,
    signatory_name TEXT,
    signatory_title TEXT,
    closing TEXT,
    doc_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_memos_subject ON memos(subject)`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_memos_doc_date ON memos(doc_date)`)
  await c.execute(`CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos(created_at)`)
  await c.execute(`CREATE TABLE IF NOT EXISTS signatories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  await c.execute(`CREATE TABLE IF NOT EXISTS closings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  await c.execute(`CREATE TABLE IF NOT EXISTS recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Migration: add closing column for DBs created before it was in the schema
  try { await c.execute('ALTER TABLE memos ADD COLUMN closing TEXT') } catch { /* exists */ }

  // Seed signatories on first run
  const { rows: sr } = await c.execute('SELECT COUNT(*) as cnt FROM signatories')
  if (Number(sr[0].cnt) === 0) {
    await c.batch(
      (signatoriesSeed as { name: string; title: string }[]).map(r => ({
        sql: 'INSERT INTO signatories (name, title) VALUES (?, ?)',
        args: [r.name, r.title],
      })),
      'write'
    )
  }

  // Seed closings on first run
  const { rows: cr } = await c.execute('SELECT COUNT(*) as cnt FROM closings')
  if (Number(cr[0].cnt) === 0) {
    await c.batch(
      (closingsSeed as string[]).map(text => ({
        sql: 'INSERT INTO closings (text) VALUES (?)',
        args: [text],
      })),
      'write'
    )
  }

  _ready = true
  return c
}

// ─── Type helpers ────────────────────────────────────────────────────────────

function s(v: unknown): string { return v == null ? '' : String(v) }
function n(v: unknown): number { return v == null ? 0 : Number(v) }

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Memo {
  id?: number
  doc_number: string
  subject: string
  department: string
  division: string
  recipient: string
  content_background: string
  content_facts: string
  content_consideration: string
  signatory_name: string
  signatory_title: string
  closing: string
  doc_date: string
  created_at?: string
}

export interface Signatory {
  id: number
  name: string
  title: string
  created_at?: string
}

export interface Closing {
  id: number
  text: string
  created_at?: string
}

export interface Recipient {
  id: number
  name: string
  created_at?: string
}

// ─── Memo functions ──────────────────────────────────────────────────────────

export async function createMemo(memo: Omit<Memo, 'id' | 'created_at'>): Promise<Memo> {
  const c = await db()
  const rs = await c.execute({
    sql: `INSERT INTO memos (doc_number, subject, department, division, recipient,
            content_background, content_facts, content_consideration,
            signatory_name, signatory_title, closing, doc_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      memo.doc_number, memo.subject, memo.department, memo.division, memo.recipient,
      memo.content_background, memo.content_facts, memo.content_consideration,
      memo.signatory_name, memo.signatory_title, memo.closing, memo.doc_date,
    ],
  })
  return getMemoById(Number(rs.lastInsertRowid)) as Promise<Memo>
}

export async function getMemoById(id: number): Promise<Memo | null> {
  const c = await db()
  const { rows } = await c.execute({ sql: 'SELECT * FROM memos WHERE id = ?', args: [id] })
  if (!rows[0]) return null
  const r = rows[0]
  return {
    id: n(r.id), doc_number: s(r.doc_number), subject: s(r.subject),
    department: s(r.department), division: s(r.division), recipient: s(r.recipient),
    content_background: s(r.content_background), content_facts: s(r.content_facts),
    content_consideration: s(r.content_consideration),
    signatory_name: s(r.signatory_name), signatory_title: s(r.signatory_title),
    closing: s(r.closing), doc_date: s(r.doc_date), created_at: s(r.created_at),
  }
}

export async function listMemos(limit = 50, offset = 0): Promise<Memo[]> {
  const c = await db()
  const { rows } = await c.execute({
    sql: 'SELECT * FROM memos ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [limit, offset],
  })
  return rows.map(r => ({
    id: n(r.id), doc_number: s(r.doc_number), subject: s(r.subject),
    department: s(r.department), division: s(r.division), recipient: s(r.recipient),
    content_background: s(r.content_background), content_facts: s(r.content_facts),
    content_consideration: s(r.content_consideration),
    signatory_name: s(r.signatory_name), signatory_title: s(r.signatory_title),
    closing: s(r.closing), doc_date: s(r.doc_date), created_at: s(r.created_at),
  }))
}

export async function searchMemos(query: string): Promise<Memo[]> {
  const c = await db()
  const q = `%${query}%`
  const { rows } = await c.execute({
    sql: `SELECT * FROM memos
          WHERE subject LIKE ? OR doc_number LIKE ? OR recipient LIKE ?
             OR department LIKE ? OR signatory_name LIKE ?
          ORDER BY created_at DESC LIMIT 100`,
    args: [q, q, q, q, q],
  })
  return rows.map(r => ({
    id: n(r.id), doc_number: s(r.doc_number), subject: s(r.subject),
    department: s(r.department), division: s(r.division), recipient: s(r.recipient),
    content_background: s(r.content_background), content_facts: s(r.content_facts),
    content_consideration: s(r.content_consideration),
    signatory_name: s(r.signatory_name), signatory_title: s(r.signatory_title),
    closing: s(r.closing), doc_date: s(r.doc_date), created_at: s(r.created_at),
  }))
}

export async function deleteMemo(id: number): Promise<void> {
  const c = await db()
  await c.execute({ sql: 'DELETE FROM memos WHERE id = ?', args: [id] })
}

// ─── Signatory functions ─────────────────────────────────────────────────────

export async function listSignatories(): Promise<Signatory[]> {
  const c = await db()
  const { rows } = await c.execute('SELECT * FROM signatories ORDER BY id ASC')
  return rows.map(r => ({ id: n(r.id), name: s(r.name), title: s(r.title), created_at: s(r.created_at) }))
}

export async function createSignatory(input: { name: string; title: string }): Promise<Signatory> {
  const c = await db()
  const rs = await c.execute({
    sql: 'INSERT INTO signatories (name, title) VALUES (?, ?)',
    args: [input.name, input.title],
  })
  const { rows } = await c.execute({ sql: 'SELECT * FROM signatories WHERE id = ?', args: [Number(rs.lastInsertRowid)] })
  return { id: n(rows[0].id), name: s(rows[0].name), title: s(rows[0].title), created_at: s(rows[0].created_at) }
}

export async function updateSignatory(id: number, input: { name: string; title: string }): Promise<Signatory | null> {
  const c = await db()
  await c.execute({ sql: 'UPDATE signatories SET name = ?, title = ? WHERE id = ?', args: [input.name, input.title, id] })
  const { rows } = await c.execute({ sql: 'SELECT * FROM signatories WHERE id = ?', args: [id] })
  if (!rows[0]) return null
  return { id: n(rows[0].id), name: s(rows[0].name), title: s(rows[0].title), created_at: s(rows[0].created_at) }
}

export async function deleteSignatory(id: number): Promise<void> {
  const c = await db()
  await c.execute({ sql: 'DELETE FROM signatories WHERE id = ?', args: [id] })
}

// ─── Closing functions ───────────────────────────────────────────────────────

export async function listClosings(): Promise<Closing[]> {
  const c = await db()
  const { rows } = await c.execute('SELECT * FROM closings ORDER BY id ASC')
  return rows.map(r => ({ id: n(r.id), text: s(r.text), created_at: s(r.created_at) }))
}

export async function createClosing(text: string): Promise<Closing> {
  const c = await db()
  const rs = await c.execute({ sql: 'INSERT INTO closings (text) VALUES (?)', args: [text] })
  const { rows } = await c.execute({ sql: 'SELECT * FROM closings WHERE id = ?', args: [Number(rs.lastInsertRowid)] })
  return { id: n(rows[0].id), text: s(rows[0].text), created_at: s(rows[0].created_at) }
}

export async function updateClosing(id: number, text: string): Promise<Closing | null> {
  const c = await db()
  await c.execute({ sql: 'UPDATE closings SET text = ? WHERE id = ?', args: [text, id] })
  const { rows } = await c.execute({ sql: 'SELECT * FROM closings WHERE id = ?', args: [id] })
  if (!rows[0]) return null
  return { id: n(rows[0].id), text: s(rows[0].text), created_at: s(rows[0].created_at) }
}

export async function deleteClosing(id: number): Promise<void> {
  const c = await db()
  await c.execute({ sql: 'DELETE FROM closings WHERE id = ?', args: [id] })
}

// ─── Recipient functions ─────────────────────────────────────────────────────

export async function listRecipients(): Promise<Recipient[]> {
  const c = await db()
  const { rows } = await c.execute('SELECT * FROM recipients ORDER BY id ASC')
  return rows.map(r => ({ id: n(r.id), name: s(r.name), created_at: s(r.created_at) }))
}

export async function createRecipient(name: string): Promise<Recipient> {
  const c = await db()
  const rs = await c.execute({ sql: 'INSERT INTO recipients (name) VALUES (?)', args: [name] })
  const { rows } = await c.execute({ sql: 'SELECT * FROM recipients WHERE id = ?', args: [Number(rs.lastInsertRowid)] })
  return { id: n(rows[0].id), name: s(rows[0].name), created_at: s(rows[0].created_at) }
}

export async function updateRecipient(id: number, name: string): Promise<Recipient | null> {
  const c = await db()
  await c.execute({ sql: 'UPDATE recipients SET name = ? WHERE id = ?', args: [name, id] })
  const { rows } = await c.execute({ sql: 'SELECT * FROM recipients WHERE id = ?', args: [id] })
  if (!rows[0]) return null
  return { id: n(rows[0].id), name: s(rows[0].name), created_at: s(rows[0].created_at) }
}

export async function deleteRecipient(id: number): Promise<void> {
  const c = await db()
  await c.execute({ sql: 'DELETE FROM recipients WHERE id = ?', args: [id] })
}
