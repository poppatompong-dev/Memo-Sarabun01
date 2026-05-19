import { NextRequest, NextResponse } from 'next/server'
import { getMemoById } from '@/lib/db'
import { generateDocx, isTemplateReady } from '@/lib/docx'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const memo = getMemoById(parseInt(id))
  if (!memo) return NextResponse.json({ error: 'ไม่พบบันทึกข้อความ' }, { status: 404 })

  if (!isTemplateReady()) {
    return NextResponse.json({
      error: 'ไม่พบ template กรุณาวางไฟล์ บันทึกข้อความ_template.docx ที่ templates/'
    }, { status: 503 })
  }

  const buf = generateDocx({
    สวนราชการ_กอง: memo.department,
    สวนราชการ_กลุมงาน: memo.division,
    เลขที: memo.doc_number,
    วันที: memo.doc_date,
    doc_date: memo.doc_date,
    เรื่อง: memo.subject,
    เรียน: memo.recipient,
    เรื่องเดิม: memo.content_background,
    ขอเท็จจริง: memo.content_facts,
    ขอพิจารณา: memo.content_consideration,
    ชื่อผูลงนาม: memo.signatory_name,
    ตำแหนง: memo.signatory_title,
  })

  const filename = encodeURIComponent(`บันทึกข้อความ_${memo.subject}_${memo.doc_date}.docx`)
  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  })
}
