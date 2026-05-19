import { NextRequest, NextResponse } from 'next/server'
import { updateSignatory, deleteSignatory } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    if (!body.name || !body.title) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อและตำแหน่ง' }, { status: 400 })
    }
    const sig = updateSignatory(parseInt(id), {
      name: String(body.name).trim(),
      title: String(body.title).trim(),
    })
    if (!sig) return NextResponse.json({ error: 'ไม่พบผู้ลงนาม' }, { status: 404 })
    return NextResponse.json(sig)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  deleteSignatory(parseInt(id))
  return NextResponse.json({ ok: true })
}
