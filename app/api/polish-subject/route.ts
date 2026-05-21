import { NextRequest, NextResponse } from 'next/server'
import { polishSubject } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const subject = String(body.subject || '').trim()
    if (!subject) return NextResponse.json({ error: 'กรุณาระบุหัวเรื่อง' }, { status: 400 })
    const result = await polishSubject(subject)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
