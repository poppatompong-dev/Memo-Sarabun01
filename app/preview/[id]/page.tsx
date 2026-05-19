import { getMemoById } from '@/lib/db'
import { notFound } from 'next/navigation'
import PrintActions from './PrintActions'
import MemoSheet from '@/components/MemoSheet'

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const memo = getMemoById(parseInt(id))
  if (!memo) notFound()

  return (
    <>
      {/* แถบควบคุม — ซ่อนตอนพิมพ์ */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white px-6 py-3 flex items-center gap-4 shadow-lg">
        <a href="/history" className="text-gray-400 hover:text-white text-sm">← ย้อนกลับ</a>
        <span className="text-gray-500">|</span>
        <span className="text-sm truncate max-w-xs">{memo.subject}</span>
        <div className="ml-auto flex gap-3">
          <a
            href={`/api/export/${memo.id}`}
            className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
          >
            📄 ดาวน์โหลด DOCX
          </a>
          <PrintActions />
        </div>
      </div>

      {/* พื้นที่แสดงตัวอย่าง */}
      <div className="no-print bg-gray-200 min-h-screen pt-16 pb-12 flex justify-center">
        <MemoSheet memo={memo} />
      </div>

      {/* สำหรับพิมพ์จริง — ไม่มีพื้นหลังสีเทา */}
      <div className="print-only">
        <MemoSheet memo={memo} />
      </div>
    </>
  )
}
