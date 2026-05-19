import AppNav from '@/components/AppNav'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
      <AppNav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-8 py-14 sm:py-20">
        <div className="mb-12">
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-900)', lineHeight: 1.2 }}>
            สวัสดีครับ
          </h1>
          <p className="mt-2 text-xl" style={{ color: 'var(--text-300)' }}>เลือกสิ่งที่ต้องการทำ</p>
        </div>

        <div className="space-y-3">
          <a href="/new" className="action-card group">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--blue)' }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--blue)', letterSpacing: '0.1em' }}>ใหม่</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-900)' }}>สร้างบันทึกข้อความ</p>
                <p className="mt-1" style={{ color: 'var(--text-300)', fontSize: '1rem' }}>ร่างด้วย AI หรือกรอกเอง พร้อม export DOCX</p>
              </div>
              <svg className="action-card-arrow w-5 h-5 mt-1 shrink-0" style={{ color: 'var(--text-300)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <a href="/history" className="action-card group">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--text-300)' }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-300)', letterSpacing: '0.1em' }}>ค้นหา</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-900)' }}>ประวัติบันทึกข้อความ</p>
                <p className="mt-1" style={{ color: 'var(--text-300)', fontSize: '1rem' }}>ค้นหาและดาวน์โหลดหนังสือที่ผ่านมา</p>
              </div>
              <svg className="action-card-arrow w-5 h-5 mt-1 shrink-0" style={{ color: 'var(--text-300)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      </main>

      <footer className="px-4 sm:px-8 pb-8 text-center">
        <p className="text-xs" style={{ color: 'var(--text-300)' }}>
          ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526 และที่แก้ไขเพิ่มเติม
        </p>
      </footer>
    </div>
  )
}
