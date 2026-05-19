import { NextRequest, NextResponse } from 'next/server'
import { listClosings, createClosing } from '@/lib/db'

export async function GET() {
  return NextResponse.json(listClosings())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const text = String(body.text || '').trim()
    if (!text) return NextResponse.json({ error: 'กรุณาระบุข้อความ' }, { status: 400 })
    const c = createClosing(text)
    return NextResponse.json(c, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
