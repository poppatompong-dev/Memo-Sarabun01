import { NextRequest, NextResponse } from 'next/server'
import { polishMemoContent } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await polishMemoContent(body)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
