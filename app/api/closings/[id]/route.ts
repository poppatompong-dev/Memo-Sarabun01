import { NextRequest, NextResponse } from 'next/server'
import { updateClosing, deleteClosing } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const text = String(body.text || '').trim()
    if (!text) return NextResponse.json({ error: 'กรุณาระบุข้อความ' }, { status: 400 })
    const c = updateClosing(parseInt(id), text)
    if (!c) return NextResponse.json({ error: 'ไม่พบคำลงท้าย' }, { status: 404 })
    return NextResponse.json(c)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  deleteClosing(parseInt(id))
  return NextResponse.json({ ok: true })
}
