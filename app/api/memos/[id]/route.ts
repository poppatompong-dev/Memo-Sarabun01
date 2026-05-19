import { NextRequest, NextResponse } from 'next/server'
import { getMemoById, deleteMemo } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const memo = getMemoById(parseInt(id))
  if (!memo) return NextResponse.json({ error: 'ไม่พบบันทึกข้อความ' }, { status: 404 })
  return NextResponse.json(memo)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  deleteMemo(parseInt(id))
  return NextResponse.json({ ok: true })
}
