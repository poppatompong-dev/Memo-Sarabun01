import ClaudeStatus from './ClaudeStatus'

interface Props {
  back?: { href: string }
  title?: string
  action?: React.ReactNode
}

export default function AppNav({ back, title, action }: Props) {
  return (
    <header className="app-nav sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <a href={back.href} className="app-nav-back shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </a>
          )}

          {title ? (
            <span className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{title}</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">ระบบบันทึกข้อความ</span>
              <span className="hidden sm:block" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span className="text-sm hidden sm:block" style={{ color: 'rgba(255,255,255,0.4)' }}>เทศบาลนครนครสวรรค์</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <ClaudeStatus />
          {action}
        </div>
      </div>
    </header>
  )
}
