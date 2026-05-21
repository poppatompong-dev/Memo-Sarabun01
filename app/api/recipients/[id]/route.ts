import { NextRequest, NextResponse } from 'next/server'
import { updateRecipient, deleteRecipient } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'กรุณาระบุชื่อผู้รับ' }, { status: 400 })
    const r = await updateRecipient(parseInt(id), name)
    if (!r) return NextResponse.json({ error: 'ไม่พบรายการ' }, { status: 404 })
    return NextResponse.json(r)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteRecipient(parseInt(id))
  return NextResponse.json({ ok: true })
}
