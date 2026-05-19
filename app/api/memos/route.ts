import { NextRequest, NextResponse } from 'next/server'
import { createMemo, listMemos, searchMemos } from '@/lib/db'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  const memos = q ? searchMemos(q) : listMemos()
  return NextResponse.json(memos)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const memo = createMemo(body)
    return NextResponse.json(memo, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
