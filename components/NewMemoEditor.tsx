'use client'
import { useEffect, useRef, useState } from 'react'
import MemoForm, { EMPTY_FORM, type FormState } from './MemoForm'
import MemoSheet, { type MemoSheetData } from './MemoSheet'
import SpacingPanel from './SpacingPanel'

const A4_W_PX = 210 * (96 / 25.4)  // ≈ 793.7
const A4_H_PX = 297 * (96 / 25.4)  // ≈ 1122.5

const MIN_SCALE = 0.3
const MAX_SCALE = 1.5

export default function NewMemoEditor() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [recipients, setRecipients] = useState<string[]>(['นายกเทศมนตรีนครนครสวรรค์'])
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [showSpacing, setShowSpacing] = useState(false)
  const [showRulers, setShowRulers] = useState(false)

  // Auto-fit + manual zoom state
  const containerRef = useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = useState(0.66)
  const [manualScale, setManualScale] = useState<number | null>(null) // null = auto-fit
  const scale = manualScale ?? fitScale

  // ResizeObserver: compute optimal fit-to-container scale
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const compute = () => {
      const pad = 24 // container padding
      const w = el.clientWidth - pad
      const h = el.clientHeight - pad
      if (w <= 0 || h <= 0) return
      const sW = w / A4_W_PX
      const sH = h / A4_H_PX
      const s = Math.min(sW, sH, MAX_SCALE)
      setFitScale(Math.max(MIN_SCALE, +s.toFixed(3)))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const memo: MemoSheetData = {
    doc_number: form.doc_number,
    subject: form.subject,
    department: form.department,
    division: form.division,
    recipient: recipients.filter(Boolean).join('\n'),
    content_background: form.content_background,
    content_facts: form.content_facts,
    content_consideration: form.content_consideration,
    signatory_name: form.signatory_name,
    signatory_title: form.signatory_title,
    closing: form.closing,
    doc_date: form.doc_date,
  }

  const zoomOut = () => setManualScale(s => Math.max(MIN_SCALE, +(((s ?? fitScale) - 0.1)).toFixed(2)))
  const zoomIn = () => setManualScale(s => Math.min(MAX_SCALE, +(((s ?? fitScale) + 0.1)).toFixed(2)))
  const fitToContainer = () => setManualScale(null)

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,640px)] gap-6">
        {/* LEFT — form */}
        <div className="min-w-0">
          <MemoForm form={form} setForm={setForm} recipients={recipients} setRecipients={setRecipients} />
        </div>

        {/* RIGHT — realtime preview (desktop only, full-height fit) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#E0F2FE', color: '#0369A1' }}>
                LIVE
              </span>
              <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-600)' }}>
                ตัวอย่างเอกสาร
              </span>
              <button onClick={() => setShowRulers(v => !v)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  background: showRulers ? '#DBEAFE' : 'var(--card)',
                  color: showRulers ? '#1D4ED8' : 'var(--text-600)',
                }}
                title="แสดง/ซ่อนเส้นวัดระยะขอบและจุดสำคัญ">
                📏 {showRulers ? 'ซ่อน' : 'แสดง'}เส้นวัด
              </button>
              <button onClick={() => setShowSpacing(true)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:bg-black/5"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-600)' }}
                title="ปรับระยะห่างเอกสาร">
                📐 ระยะ
              </button>
              <ZoomControls
                scale={scale}
                fitMode={manualScale === null}
                onIn={zoomIn} onOut={zoomOut} onFit={fitToContainer}
              />
            </div>

            {/* Scrollable preview container — fills remaining height */}
            <div
              ref={containerRef}
              className="rounded-lg flex items-start justify-center overflow-hidden flex-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '12px' }}
            >
              <ScaledSheet memo={memo} scale={scale} showRulers={showRulers} />
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE — floating preview button */}
      <button
        type="button"
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 font-semibold shadow-lg transition-transform active:scale-95"
        style={{ background: 'var(--blue)', color: '#fff' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        ดูตัวอย่าง
      </button>

      <SpacingPanel open={showSpacing} onClose={() => setShowSpacing(false)} />

      {/* MOBILE — full-screen preview modal */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'var(--navy-800)', color: '#fff' }}>
            <span className="font-semibold">ตัวอย่างเอกสาร</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowRulers(v => !v)}
                className="rounded-lg px-2.5 py-1 text-xs"
                style={{ background: showRulers ? '#3B82F6' : 'rgba(255,255,255,0.1)' }}>
                📏
              </button>
              <ZoomControls scale={scale} fitMode={manualScale === null} onIn={zoomIn} onOut={zoomOut} onFit={fitToContainer} dark />
              <button onClick={() => setShowMobilePreview(false)}
                className="rounded-lg px-3 py-1.5 text-sm"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                ปิด ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-start justify-center p-4">
            <ScaledSheet memo={memo} scale={scale} showRulers={showRulers} />
          </div>
        </div>
      )}
    </>
  )
}

function ScaledSheet({ memo, scale, showRulers }: { memo: MemoSheetData; scale: number; showRulers: boolean }) {
  return (
    <div style={{
      width: `calc(210mm * ${scale})`,
      height: `calc(297mm * ${scale})`,
      position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        inset: 0,
      }}>
        <div className={showRulers ? 'memo-page-with-rulers' : undefined}>
          <MemoSheet memo={memo} preview />
        </div>
      </div>
    </div>
  )
}

function ZoomControls({
  scale, fitMode, onIn, onOut, onFit, dark = false,
}: {
  scale: number
  fitMode: boolean
  onIn: () => void
  onOut: () => void
  onFit: () => void
  dark?: boolean
}) {
  const bg = dark ? 'rgba(255,255,255,0.1)' : 'var(--card)'
  const border = dark ? 'rgba(255,255,255,0.2)' : 'var(--border)'
  const text = dark ? '#fff' : 'var(--text-600)'
  return (
    <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${border}`, background: bg }}>
      <button type="button" onClick={onOut} disabled={scale <= MIN_SCALE}
        className="px-2.5 py-1 text-base font-semibold transition-colors disabled:opacity-40 hover:bg-black/5"
        style={{ color: text }}
        title="ย่อ">−</button>
      <button type="button" onClick={onFit}
        className="px-2 py-1 text-xs font-mono min-w-[58px] transition-colors hover:bg-black/5"
        style={{
          color: fitMode ? (dark ? '#7DD3FC' : 'var(--blue)') : text,
          borderLeft: `1px solid ${border}`,
          borderRight: `1px solid ${border}`,
          fontWeight: fitMode ? 700 : 400,
        }}
        title="พอดีหน้าจอ">
        {fitMode ? '⤢ ' : ''}{Math.round(scale * 100)}%
      </button>
      <button type="button" onClick={onIn} disabled={scale >= MAX_SCALE}
        className="px-2.5 py-1 text-base font-semibold transition-colors disabled:opacity-40 hover:bg-black/5"
        style={{ color: text }}
        title="ขยาย">+</button>
    </div>
  )
}
