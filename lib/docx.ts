import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  TabStopType,
  TabStopPosition,
  LineRuleType,
  UnderlineType,
} from 'docx'
import { toThaiDate } from './thai-date'

// Font name matching the actual Thai government template (TH SarabunIT๙)
const FONT = 'TH SarabunIT9'

// Sizes in half-points (matching w:sz in OOXML) — body=32hp=16pt, label=40hp=20pt, title=56hp=28pt
const SZ_BODY = 32
const SZ_LABEL = 40
const SZ_TITLE = 56

// Single line spacing (240 = 1.0 × single in Word's 240-units scale)
const SINGLE_SPACING = { spacing: { line: 240, lineRule: LineRuleType.AUTO } }

// Thai text run defaults
function run(text: string, opts: { bold?: boolean; size?: number; underline?: boolean } = {}): TextRun {
  return new TextRun({
    text,
    font: FONT,
    size: opts.size ?? SZ_BODY,
    bold: opts.bold ?? false,
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
  })
}

function labelRun(text: string): TextRun {
  return run(text, { bold: true, size: SZ_LABEL })
}

// ── Paragraph builders ──────────────────────────────────────────────────────

function paragraphTitle(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 0, line: 240, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text: 'บันทึกข้อความ',
        font: FONT,
        size: SZ_TITLE,
        bold: true,
      }),
    ],
  })
}

// Meta row: "Label  value____________________" with dotted underline on value
function metaRow(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 0, line: 240, lineRule: LineRuleType.AUTO },
    children: [
      labelRun(label),
      run('  '),
      run(value),
      run('\t', { underline: true }),
    ],
  })
}

// "ที่" and "วันที่" on the same line with a tab stop in the middle
function metaRowThatDate(thi: string, date: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.LEFT, position: 4860 }],
    spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
    children: [
      labelRun('ที่'),
      run('  '),
      run(thi),
      run('\t'),
      labelRun('วันที่'),
      run('  '),
      run(date),
    ],
  })
}

// "เรียน" row — hanging indent left=851 hanging=851 so label at col 0, wrap at 851 twips
function metaRowRian(recipient: string): Paragraph {
  const lines = recipient.split('\n').filter(Boolean)
  const children: TextRun[] = [
    labelRun('เรียน'),
    run('  '),
  ]
  lines.forEach((line, i) => {
    if (i > 0) children.push(new TextRun({ text: '\n', font: FONT, size: SZ_BODY, break: 1 }))
    children.push(run(line))
  })
  return new Paragraph({
    spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
    indent: { left: 851, hanging: 851 },
    children,
  })
}

// Horizontal divider line — implemented as top border on an empty paragraph
function dividerParagraph(): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 0 },
    },
    children: [],
  })
}

// Body section: bold heading + content lines with 1440-twip first-line indent
function bodySection(heading: string, content: string): Paragraph[] {
  const lines = content.split('\n')
  const paras: Paragraph[] = [
    // Section heading — centered + underlined (matching CSS .section-heading)
    new Paragraph({
      spacing: { before: 120, after: 0, line: 240, lineRule: LineRuleType.AUTO },
      alignment: AlignmentType.CENTER,
      children: [run(heading, { underline: true })],
    }),
  ]
  // Content lines
  for (const line of lines) {
    paras.push(new Paragraph({
      spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
      indent: { firstLine: 1440 },
      alignment: AlignmentType.BOTH,
      children: [run(line || ' ')],
    }))
  }
  return paras
}

// Closing paragraph — 2 tabs then closing text
function closingParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 0, line: 240, lineRule: LineRuleType.AUTO },
    alignment: AlignmentType.THAI_DISTRIBUTE,
    children: [
      new TextRun({ text: '\t', font: FONT, size: SZ_BODY }),
      new TextRun({ text: '\t', font: FONT, size: SZ_BODY }),
      run(text),
    ],
  })
}

// Signature block — blank lines then (name) then title, centered
function signatureBlock(name: string, title: string): Paragraph[] {
  return [
    // ~3 blank lines gap before signature (closing-gap equivalent)
    new Paragraph({ spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO }, children: [] }),
    new Paragraph({ spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO }, children: [] }),
    new Paragraph({ spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
      children: [run(`(${name})`)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
      children: [run(title)],
    }),
  ]
}

// ── Public interface ─────────────────────────────────────────────────────────

export interface MemoDocxData {
  สวนราชการ_กอง: string
  สวนราชการ_กลุมงาน: string
  เลขที: string
  วันที: string
  เรื่อง: string
  เรียน: string
  เรื่องเดิม: string
  ขอเท็จจริง: string
  ขอพิจารณา: string
  ชื่อผูลงนาม: string
  ตำแหนง: string
  closing?: string
}

export async function generateDocx(data: MemoDocxData & { doc_date: string }): Promise<Buffer> {
  const dept = [data.สวนราชการ_กอง, data.สวนราชการ_กลุมงาน].filter(Boolean).join('  ')

  const children: Paragraph[] = [
    paragraphTitle(),
    metaRow('ส่วนราชการ', dept),
    metaRowThatDate(data.เลขที, toThaiDate(data.doc_date)),
    metaRow('เรื่อง', data.เรื่อง),
    dividerParagraph(),
    metaRowRian(data.เรียน),
    ...(data.เรื่องเดิม ? bodySection('เรื่องเดิม', data.เรื่องเดิม) : []),
    ...(data.ขอเท็จจริง ? bodySection('ข้อเท็จจริง', data.ขอเท็จจริง) : []),
    ...(data.ขอพิจารณา ? bodySection('ข้อพิจารณา', data.ขอพิจารณา) : []),
    closingParagraph(data.closing ?? 'จึงเรียนมาเพื่อโปรดพิจารณา'),
    ...signatureBlock(data.ชื่อผูลงนาม, data.ตำแหนง),
  ]

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 993, right: 1134, bottom: 851, left: 1701, header: 709, footer: 709 },
        },
      },
      children,
    }],
  })

  return Packer.toBuffer(doc)
}

// Always ready — no template file dependency
export function isTemplateReady(): boolean { return true }
