'use client'
import { useEffect, useState } from 'react'

export interface AIModalResult {
  changes?: string[]
  references?: string[]
  meta?: { model?: string; tokens?: number }
}

export interface AIModalState {
  open: boolean
  loading: boolean
  title: string
  subtitle?: string
  result?: AIModalResult
  error?: string
}

const STAGES = [
  { ms: 0,     icon: '🔌', label: 'เชื่อมต่อ Claude AI' },
  { ms: 1800,  icon: '📖', label: 'อ่านและทำความเข้าใจเนื้อหา' },
  { ms: 4500,  icon: '📋', label: 'ตรวจสอบตามระเบียบสารบรรณ' },
  { ms: 9000,  icon: '✍️', label: 'ปรับปรุงสำนวนภาษาราชการ' },
  { ms: 18000, icon: '🔍', label: 'ตรวจทานครั้งสุดท้าย' },
]

export default function AIProgressModal({
  state,
  onClose,
}: {
  state: AIModalState | null
  onClose: () => void
}) {
  const [elapsed, setElapsed] = useState(0)
  const loading = !!state?.loading

  useEffect(() => {
    if (!loading) return
    setElapsed(0)
    const start = Date.now()
    const id = setInterval(() => setElapsed(Date.now() - start), 150)
    return () => clearInterval(id)
  }, [loading])

  if (!state?.open) return null

  const currentStageIdx = (() => {
    let idx = 0
    for (let i = 0; i < STAGES.length; i++) if (elapsed >= STAGES[i].ms) idx = i
    return idx
  })()

  const isSuccess = !loading && !state.error
  const headerBg = state.error
    ? 'linear-gradient(135deg, #991B1B, #7F1D1D)'
    : loading
      ? 'linear-gradient(135deg, var(--blue), #1E40AF)'
      : 'linear-gradient(135deg, #15803D, #166534)'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(13,27,46,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={loading ? undefined : onClose}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{ background: 'var(--card)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 text-white" style={{ background: headerBg }}>
          <h3 className="text-lg font-bold flex items-center gap-2.5">
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : state.error ? (
              <span>⚠️</span>
            ) : (
              <span>✨</span>
            )}
            <span className="flex-1">{state.title}</span>
          </h3>
          {state.subtitle && <p className="text-xs opacity-80 mt-0.5 pl-7">{state.subtitle}</p>}
        </div>

        {/* Body */}
        <div className="p-6">
          {loading && (
            <div className="space-y-3">
              {STAGES.map((s, i) => {
                const passed = i < currentStageIdx
                const active = i === currentStageIdx
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 transition-all"
                    style={{ opacity: passed ? 0.55 : active ? 1 : 0.25 }}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span
                      className="flex-1 text-sm"
                      style={{
                        color: passed ? 'var(--text-600)' : 'var(--text-900)',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {s.label}
                    </span>
                    {passed && <span className="text-green-500 text-sm">✓</span>}
                    {active && (
                      <span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    )}
                  </div>
                )
              })}
              <div
                className="mt-4 pt-3 text-xs text-center"
                style={{ color: 'var(--text-300)', borderTop: '1px solid var(--border)' }}
              >
                ⏱️ ใช้เวลา {(elapsed / 1000).toFixed(1)} วินาที · ใช้เวลาประมาณ ๓๐–๖๐ วินาที
              </div>
            </div>
          )}

          {state.error && !loading && (
            <div className="space-y-2">
              <p className="text-sm" style={{ color: '#B91C1C' }}>{state.error}</p>
              <p className="text-xs" style={{ color: 'var(--text-300)' }}>
                กรุณาลองใหม่อีกครั้ง หรือตรวจสอบว่า Claude CLI ทำงานปกติ
              </p>
            </div>
          )}

          {isSuccess && state.result && (
            <div className="space-y-4">
              {state.result.changes && state.result.changes.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-900)' }}>
                    📝 รายการที่ปรับปรุง
                  </p>
                  <ul className="space-y-1.5">
                    {state.result.changes.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: 'var(--text-600)' }}
                      >
                        <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                  ✅ AI ดำเนินการเรียบร้อยแล้ว
                </p>
              )}

              {state.result.references && state.result.references.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-900)' }}>
                    📚 หลักอ้างอิง
                  </p>
                  <ul className="space-y-1">
                    {state.result.references.map((r, i) => (
                      <li
                        key={i}
                        className="text-xs pl-4 relative leading-relaxed"
                        style={{ color: 'var(--text-600)' }}
                      >
                        <span className="absolute left-0">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {state.result.meta && (
                <div
                  className="pt-3 text-xs flex items-center gap-3"
                  style={{ color: 'var(--text-300)', borderTop: '1px solid var(--border)' }}
                >
                  {state.result.meta.model && <span>🤖 {state.result.meta.model}</span>}
                  {state.result.meta.tokens != null && <span>💬 {state.result.meta.tokens} tokens</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div
            className="px-6 py-3 flex justify-end"
            style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
          >
            <button onClick={onClose} className="btn-primary text-sm py-2 px-5">
              {state.error ? 'ปิด' : 'เรียบร้อย'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
