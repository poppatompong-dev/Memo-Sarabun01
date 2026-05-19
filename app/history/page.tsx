'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toThaiDate } from '@/lib/thai-date'
import AppNav from '@/components/AppNav'

interface Memo {
  id: number
  doc_number: string
  subject: string
  department: string
  division: string
  recipient: string
  signatory_name: string
  doc_date: string
  created_at: string
}

function HistoryContent() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const savedId = searchParams.get('saved')

  const load = async (q = '') => {
    setLoading(true)
    const res = await fetch(`/api/memos${q ? `?q=${encodeURIComponent(q)}` : ''}`)
    setMemos(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(query) }
  const downloadDocx = (id: number) => window.open(`/api/export/${id}`, '_blank')
  const deleteMemo = async (id: number) => {
    if (!confirm('ลบบันทึกข้อความนี้?')) return
    await fetch(`/api/memos/${id}`, { method: 'DELETE' })
    load(query)
  }

  const newBtn = (
    <a href="/new" className="btn-primary py-2 px-4 text-sm">
      + สร้างใหม่
    </a>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <AppNav back={{ href: '/' }} title="ประวัติบันทึกข้อความ" action={newBtn} />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: '1.875rem', color: 'var(--text-900)', lineHeight: 1.2 }}>
            บันทึกข้อความ
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-300)', fontSize: '1rem' }}>ค้นหาและดาวน์โหลดเอกสารที่ผ่านมา</p>
        </div>

        {savedId && (
          <div className="rounded-lg px-4 py-3 text-sm mb-6 flex items-center justify-between gap-4"
            style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D' }}>
            <span>บันทึกเรียบร้อยแล้ว</span>
            <button onClick={() => downloadDocx(parseInt(savedId))}
              className="underline font-semibold">ดาวน์โหลด DOCX</button>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input className="input flex-1" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหาจากเรื่อง เลขที่ ผู้รับ หรือผู้ลงนาม..." />
          <button type="submit" className="btn-secondary shrink-0">ค้นหา</button>
          {query && (
            <button type="button" onClick={() => { setQuery(''); load() }}
              className="btn-secondary shrink-0" style={{ color: 'var(--text-300)' }}>ล้าง</button>
          )}
        </form>

        {/* List */}
        {loading ? (
          <div className="py-24 text-center" style={{ color: 'var(--text-300)', fontSize: '1.125rem' }}>กำลังโหลด...</div>
        ) : memos.length === 0 ? (
          <div className="py-24 text-center">
            <p style={{ color: 'var(--text-300)', fontSize: '1.125rem' }}>ไม่พบบันทึกข้อความ</p>
            {query && <p className="mt-1 text-base" style={{ color: 'var(--text-300)' }}>ลองเปลี่ยนคำค้นหา</p>}
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {memos.map((m, i) => (
              <div key={m.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-5 py-4"
                style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {m.doc_number && (
                      <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded"
                        style={{ background: 'var(--surface)', color: 'var(--text-600)', border: '1px solid var(--border)' }}>
                        {m.doc_number}
                      </span>
                    )}
                    <span className="text-sm" style={{ color: 'var(--text-300)' }}>
                      {m.doc_date ? toThaiDate(m.doc_date) : ''}
                    </span>
                  </div>
                  <p className="font-semibold truncate" style={{ color: 'var(--text-900)', fontSize: '1rem' }}>{m.subject}</p>
                  <p className="text-sm truncate mt-0.5" style={{ color: 'var(--text-300)' }}>
                    {m.department}{m.division && ` · ${m.division}`}
                    {m.recipient && <> · เรียน {m.recipient.split('\n')[0]}{m.recipient.includes('\n') ? ' และอื่นๆ' : ''}</>}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a href={`/preview/${m.id}`}
                    className="btn-secondary py-1.5 px-3 text-sm">ดูตัวอย่าง</a>
                  <button onClick={() => downloadDocx(m.id)}
                    className="btn-secondary py-1.5 px-3 text-sm">DOCX</button>
                  <button onClick={() => deleteMemo(m.id)}
                    className="btn-secondary py-1.5 px-3 text-sm"
                    style={{ color: '#DC2626' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.borderColor = '#FECACA' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--card)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)', color: 'var(--text-300)', fontSize: '1.125rem' }}>
        กำลังโหลด...
      </div>
    }>
      <HistoryContent />
    </Suspense>
  )
}
