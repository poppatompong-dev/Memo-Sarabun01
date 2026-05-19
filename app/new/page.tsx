import AppNav from '@/components/AppNav'
import NewMemoEditor from '@/components/NewMemoEditor'

export default function NewMemoPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <AppNav back={{ href: '/' }} title="สร้างบันทึกข้อความใหม่" />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: '1.875rem', color: 'var(--text-900)', lineHeight: 1.2 }}>
            บันทึกข้อความใหม่
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-300)', fontSize: '1rem' }}>เทศบาลนครนครสวรรค์</p>
        </div>
        <NewMemoEditor />
      </main>
    </div>
  )
}
