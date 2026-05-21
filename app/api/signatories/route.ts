import { NextRequest, NextResponse } from 'next/server'
import { listSignatories, createSignatory } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await listSignatories())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name || !body.title) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อและตำแหน่ง' }, { status: 400 })
    }
    const sig = await createSignatory({ name: String(body.name).trim(), title: String(body.title).trim() })
    return NextResponse.json(sig, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
