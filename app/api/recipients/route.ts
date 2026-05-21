import { NextRequest, NextResponse } from 'next/server'
import { listRecipients, createRecipient } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await listRecipients())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'กรุณาระบุชื่อผู้รับ' }, { status: 400 })
    const r = await createRecipient(name)
    return NextResponse.json(r, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
