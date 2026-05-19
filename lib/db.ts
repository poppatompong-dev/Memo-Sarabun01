import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import signatoriesSeed from '@/data/signatories.json'
import closingsSeed from '@/data/closings.json'

const DB_DIR = path.join(process.cwd(), 'database')
const DB_PATH = path.join(DB_DIR, 'memos.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
  _db = new Database(DB_PATH)
  _db.exec(`
    CREATE TABLE IF NOT EXISTS memos (
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
      doc_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_memos_subject ON memos(subject);
    CREATE INDEX IF NOT EXISTS idx_memos_doc_date ON memos(doc_date);
    CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos(created_at);

    CREATE TABLE IF NOT EXISTS signatories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS closings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Migration: add 'closing' column to memos if missing
  const memoCols = _db.prepare("PRAGMA table_info(memos)").all() as Array<{ name: string }>
  if (!memoCols.some(c => c.name === 'closing')) {
    _db.exec("ALTER TABLE memos ADD COLUMN closing TEXT")
  }

  // Seed signatories from JSON if table is empty (first run)
  const sigCount = (_db.prepare('SELECT COUNT(*) as c FROM signatories').get() as { c: number }).c
  if (sigCount === 0) {
    const insert = _db.prepare('INSERT INTO signatories (name, title) VALUES (?, ?)')
    const seedTx = _db.transaction((rows: { name: string; title: string }[]) => {
      for (const r of rows) insert.run(r.name, r.title)
    })
    seedTx(signatoriesSeed as { name: string; title: string }[])
  }

  // Seed closings from JSON if table is empty
  const closingCount = (_db.prepare('SELECT COUNT(*) as c FROM closings').get() as { c: number }).c
  if (closingCount === 0) {
    const insertClosing = _db.prepare('INSERT INTO closings (text) VALUES (?)')
    const seedCloseTx = _db.transaction((rows: string[]) => {
      for (const r of rows) insertClosing.run(r)
    })
    seedCloseTx(closingsSeed as string[])
  }

  return _db
}

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

export function createMemo(memo: Omit<Memo, 'id' | 'created_at'>): Memo {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO memos (doc_number, subject, department, division, recipient,
      content_background, content_facts, content_consideration,
      signatory_name, signatory_title, closing, doc_date)
    VALUES (@doc_number, @subject, @department, @division, @recipient,
      @content_background, @content_facts, @content_consideration,
      @signatory_name, @signatory_title, @closing, @doc_date)
  `)
  const result = stmt.run(memo)
  return getMemoById(result.lastInsertRowid as number)!
}

export function getMemoById(id: number): Memo | null {
  const db = getDb()
  return db.prepare('SELECT * FROM memos WHERE id = ?').get(id) as Memo | null
}

export function listMemos(limit = 50, offset = 0): Memo[] {
  const db = getDb()
  return db.prepare('SELECT * FROM memos ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as Memo[]
}

export function searchMemos(query: string): Memo[] {
  const db = getDb()
  const q = `%${query}%`
  return db.prepare(`
    SELECT * FROM memos
    WHERE subject LIKE ? OR doc_number LIKE ? OR recipient LIKE ?
       OR department LIKE ? OR signatory_name LIKE ?
    ORDER BY created_at DESC LIMIT 100
  `).all(q, q, q, q, q) as Memo[]
}

export function deleteMemo(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM memos WHERE id = ?').run(id)
}

export interface Signatory {
  id: number
  name: string
  title: string
  created_at?: string
}

export function listSignatories(): Signatory[] {
  const db = getDb()
  return db.prepare('SELECT * FROM signatories ORDER BY id ASC').all() as Signatory[]
}

export function createSignatory(input: { name: string; title: string }): Signatory {
  const db = getDb()
  const result = db.prepare('INSERT INTO signatories (name, title) VALUES (?, ?)')
    .run(input.name, input.title)
  return db.prepare('SELECT * FROM signatories WHERE id = ?')
    .get(result.lastInsertRowid as number) as Signatory
}

export function updateSignatory(id: number, input: { name: string; title: string }): Signatory | null {
  const db = getDb()
  db.prepare('UPDATE signatories SET name = ?, title = ? WHERE id = ?')
    .run(input.name, input.title, id)
  return db.prepare('SELECT * FROM signatories WHERE id = ?').get(id) as Signatory | null
}

export function deleteSignatory(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM signatories WHERE id = ?').run(id)
}

export interface Closing {
  id: number
  text: string
  created_at?: string
}

export function listClosings(): Closing[] {
  const db = getDb()
  return db.prepare('SELECT * FROM closings ORDER BY id ASC').all() as Closing[]
}

export function createClosing(text: string): Closing {
  const db = getDb()
  const result = db.prepare('INSERT INTO closings (text) VALUES (?)').run(text)
  return db.prepare('SELECT * FROM closings WHERE id = ?')
    .get(result.lastInsertRowid as number) as Closing
}

export function updateClosing(id: number, text: string): Closing | null {
  const db = getDb()
  db.prepare('UPDATE closings SET text = ? WHERE id = ?').run(text, id)
  return db.prepare('SELECT * FROM closings WHERE id = ?').get(id) as Closing | null
}

export function deleteClosing(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM closings WHERE id = ?').run(id)
}
