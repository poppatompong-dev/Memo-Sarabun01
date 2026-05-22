import { getMemoById } from '@/lib/db'
import { notFound } from 'next/navigation'
import AppNav from '@/components/AppNav'
import NewMemoEditor from '@/components/NewMemoEditor'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const memo = await getMemoById(parseInt(id))
  if (!memo) notFound()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <AppNav back={{ href: `/preview/${id}` }} title="แก้ไขบันทึกข้อความ" />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: '1.875rem', color: 'var(--text-900)', lineHeight: 1.2 }}>
            แก้ไขบันทึกข้อความ
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-300)', fontSize: '1rem' }}>
            {memo.subject}
          </p>
        </div>
        <NewMemoEditor initialMemo={memo} />
      </main>
    </div>
  )
}
