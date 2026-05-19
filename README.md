# ระบบบันทึกข้อความ — เทศบาลนครนครสวรรค์

ระบบสร้าง จัดเก็บ และพิมพ์บันทึกข้อความราชการ ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526 และที่แก้ไขเพิ่มเติม (ฉบับที่ 4) พ.ศ. 2564

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS v4 |
| Database | SQLite (better-sqlite3) |
| AI | Claude CLI via `child_process.spawn` (stdin/stdout JSON) |
| Font | Sarabun (Thai) — self-hosted via `next/font/google` |
| Export | docxtemplater + PizZip (Word .docx) |

---

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

ครั้งแรกที่รัน ระบบจะสร้าง `database/memos.db` และ seed ข้อมูล `signatories` จาก `data/signatories.json` อัตโนมัติ

> **ต้องการ Claude CLI:** ฟีเจอร์ AI ร่างเนื้อหา/ตรวจแก้ภาษาต้องใช้ `claude` CLI (`claude -p --output-format json`) ติดตั้งและ login ไว้ในระบบ

---

## Directory Structure

```
thai-memo-app/
├── app/
│   ├── page.tsx                   # หน้าแรก
│   ├── new/page.tsx               # สร้าง memo ใหม่ (ใช้ NewMemoEditor)
│   ├── history/page.tsx           # รายการ memo
│   ├── preview/[id]/
│   │   ├── page.tsx               # แสดง memo + พิมพ์
│   │   ├── PrintActions.tsx       # ปุ่มพิมพ์ (client)
│   │   ├── layout.tsx             # layout ว่าง (print.css อยู่ใน MemoSheet)
│   │   └── print.css              # สไตล์ A4 + dotted underlines + @media print
│   ├── api/
│   │   ├── memos/                 # GET (list/search), POST (create)
│   │   ├── memos/[id]/            # DELETE
│   │   ├── signatories/           # GET (list), POST (create)
│   │   ├── signatories/[id]/      # PUT (update), DELETE
│   │   ├── generate/              # POST — AI ร่างเนื้อหา
│   │   ├── polish/                # POST — AI ตรวจแก้ภาษา
│   │   ├── export/[id]/           # GET — ดาวน์โหลด DOCX
│   │   └── status/                # GET — ตรวจสอบ Claude CLI
│   ├── globals.css                # Design system (CSS vars, .input, .btn-*, .section-card ฯลฯ)
│   └── layout.tsx                 # Root layout — โหลด Sarabun font
│
├── components/
│   ├── AppNav.tsx                 # Navbar กลาง (navy-800)
│   ├── ClaudeStatus.tsx           # Indicator สถานะ Claude CLI
│   ├── MemoForm.tsx               # ฟอร์มกรอก memo (controlled — รับ props จาก NewMemoEditor)
│   ├── MemoSheet.tsx              # A4 sheet component — ใช้ใน preview และ realtime preview
│   └── NewMemoEditor.tsx          # Split-screen: form ซ้าย + MemoSheet ขวา
│
├── lib/
│   ├── claude.ts                  # runClaude(), draftMemoContent(), polishMemoContent()
│   ├── db.ts                      # SQLite: memos CRUD + signatories CRUD + seed
│   ├── docx.ts                    # generateDocx() ผ่าน docxtemplater
│   └── thai-date.ts               # toThaiDate(isoString) → ไทย
│
├── data/
│   ├── departments.json           # กอง/สำนัก + กลุ่มงาน พร้อม subCode ไทย
│   ├── recipients.json            # รายชื่อผู้รับ (เลือกได้สูงสุด 5 คน)
│   └── signatories.json           # Seed ผู้ลงนามเริ่มต้น (ใช้เพียงครั้งแรก)
│
├── templates/
│   └── แบบบันทึกข้อความ.doc     # เทมเพลตต้นฉบับ (.doc ไม่ใช้โดยตรง)
│       # ⚠️ ต้องแปลงเป็น .docx พร้อม placeholders → templates/บันทึกข้อความ_template.docx
│
├── public/
│   └── garuda.png                 # ตราครุฑ (ดึงจาก .doc template)
│
└── database/
    └── memos.db                   # SQLite auto-created (gitignored)
```

---

## ฟีเจอร์หลัก

### 1. ส่วนหัวบันทึกข้อความ
- เลือกกอง → กลุ่มงาน → รหัสเอกสาร auto-fill (เช่น `นว ๕๒๐๐๗.๔/(๑)/`)
- ฟิลด์เลขที่แยก prefix (ล็อค) + suffix (กรอกเอง)
- วันที่แปลงเป็นวันภาษาไทยอัตโนมัติ
- "เรียน" เพิ่มได้สูงสุด 5 คน แสดงตรงแนวในเอกสาร

### 2. AI ร่างเนื้อหา (Claude CLI)
- กรอกบริบท/ความต้องการ → AI สร้าง เรื่องเดิม + ข้อเท็จจริง + ข้อพิจารณา
- ปุ่ม "ตรวจแก้ภาษา" — polish ข้อความที่กรอกแล้วให้เป็นทางการตามระเบียบสารบรรณ

### 3. เนื้อหา 3 ส่วน
- เรื่องเดิม / ข้อเท็จจริง / ข้อพิจารณา
- แต่ละฟิลด์มี tooltip อธิบายวิธีกรอก

### 4. จัดการผู้ลงนาม + คำลงท้าย
- เพิ่ม/แก้ไข/ลบผู้ลงนามและคำลงท้ายได้ inline — บันทึก SQLite (ถาวร)
- คำลงท้ายมีให้เลือก 7 ตัวเลือกพื้นฐาน (จึงเรียนมาเพื่อโปรดพิจารณา/ทราบ/อนุมัติ ฯลฯ)

### 5. Realtime Preview (Split-screen) + Zoom + Spacing Panel
- Desktop: ฟอร์มซ้าย + ตัวอย่าง A4 ขวา อัปเดตทุก keystroke
- Zoom controls: ปุ่ม +/− ปรับขนาด 30–150%
- 📐 Spacing Panel: ปรับ margin, indent, line-height, font-size ทุกค่าแบบ realtime
  - 4 หมวด: หน้ากระดาษ / หัวเอกสาร / เนื้อหา / ลายเซ็น
  - บันทึก override ใน localStorage อัตโนมัติ ปรับครั้งเดียวใช้ตลอด
- Mobile: ปุ่ม floating "ดูตัวอย่าง" → full-screen modal

### 6. Export
- พิมพ์หน้าตัวอย่าง (A4 CSS print) — ตรงกับ preview 100%
- ดาวน์โหลด DOCX ผ่าน docxtemplater *(ต้องมี template .docx)*

---

## Database Schema

```sql
-- memos
CREATE TABLE memos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_number TEXT,
  subject TEXT NOT NULL,
  department TEXT,
  division TEXT,
  recipient TEXT,          -- newline-separated (รองรับหลายคน)
  content_background TEXT,
  content_facts TEXT,
  content_consideration TEXT,
  signatory_name TEXT,
  signatory_title TEXT,
  doc_date TEXT,           -- ISO format YYYY-MM-DD
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- signatories
CREATE TABLE signatories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- closings (คำลงท้าย)
CREATE TABLE closings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- memos.closing added via ALTER TABLE migration on first run
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/memos` | list (optional `?q=search`) |
| POST | `/api/memos` | create |
| DELETE | `/api/memos/[id]` | delete |
| GET | `/api/signatories` | list |
| POST | `/api/signatories` | create |
| PUT | `/api/signatories/[id]` | update |
| DELETE | `/api/signatories/[id]` | delete |
| GET | `/api/closings` | list |
| POST | `/api/closings` | create |
| PUT | `/api/closings/[id]` | update |
| DELETE | `/api/closings/[id]` | delete |
| POST | `/api/generate` | AI draft content |
| POST | `/api/polish` | AI polish language |
| GET | `/api/export/[id]` | download DOCX |
| GET | `/api/status` | Claude CLI health check |

---

## CSS Architecture

- **`app/globals.css`** — Design system: CSS variables (`--navy-800`, `--blue`, `--surface` ฯลฯ), utility classes (`.input`, `.btn-primary`, `.section-card`, `.tooltip-box`, `.step-badge`)
- **`app/preview/[id]/print.css`** — A4 template CSS: `.memo-page`, `.memo-garuda`, `.memo-meta-row`, `.meta-value-dotted`, `.body-line`, `.memo-page-preview` + `@media print` lock
- **CSS Variables for live editing** (ใน `:root` ของ print.css): `--memo-pad-{top|right|bottom|left}`, `--memo-line-indent`, `--memo-section-gap`, `--memo-row-gap`, `--memo-divider-{top|bottom}`, `--memo-title-size`, `--memo-body-size`, `--memo-line-height`, `--memo-dotted-pad-bot` ฯลฯ — `SpacingPanel` แก้ค่าผ่าน `document.documentElement.style.setProperty`
- Tailwind CSS v4: ใช้ `@import "tailwindcss"` — font weight ต้องใช้ชื่อ (`font-bold`, `font-semibold`) ไม่ใช่ตัวเลข (`font-700`)

---

## การตั้งค่า DOCX Export

1. เปิด `templates/แบบบันทึกข้อความ.doc` ด้วย Microsoft Word
2. Save As → `.docx` → `templates/บันทึกข้อความ_template.docx`
3. แทรก docxtemplater placeholders ตามนี้:

```
{สวนราชการ_กอง}      {สวนราชการ_กลุมงาน}
ที่ {เลขที}           วันที่ {วันที}
เรื่อง {เรื่อง}
เรียน {เรียน}

เรื่องเดิม
{เรื่องเดิม}

ข้อเท็จจริง
{ขอเท็จจริง}

ข้อพิจารณา
{ขอพิจารณา}

({ชื่อผูลงนาม})
{ตำแหนง}
```
