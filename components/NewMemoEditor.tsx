'use client'
import { useState } from 'react'
import MemoForm, { EMPTY_FORM, type FormState } from './MemoForm'
import MemoSheet, { type MemoSheetData } from './MemoSheet'
import SpacingPanel from './SpacingPanel'

const MIN_SCALE = 0.3
const MAX_SCALE = 1.5
const DEFAULT_SCALE = 0.66

export default function NewMemoEditor() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [recipients, setRecipients] = useState<string[]>(['นายกเทศมนตรีนครนครสวรรค์'])
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [showSpacing, setShowSpacing] = useState(false)
  const [scale, setScale] = useState(DEFAULT_SCALE)

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

  const zoomOut = () => setScale(s => Math.max(MIN_SCALE, +(s - 0.1).toFixed(2)))
  const zoomIn  = () => setScale(s => Math.min(MAX_SCALE, +(s + 0.1).toFixed(2)))
  const resetZoom = () => setScale(DEFAULT_SCALE)

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_560px] gap-6">
        {/* LEFT — form */}
        <div className="min-w-0">
          <MemoForm form={form} setForm={setForm} recipients={recipients} setRecipients={setRecipients} />
        </div>

        {/* RIGHT — realtime preview (desktop only) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#E0F2FE', color: '#0369A1' }}>
                LIVE
              </span>
              <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-600)' }}>
                ตัวอย่างเอกสาร
              </span>
              <button onClick={() => setShowSpacing(true)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:bg-black/5"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text-600)' }}
                title="ปรับระยะห่างเอกสาร">
                📐 ระยะ
              </button>
              <ZoomControls scale={scale} onIn={zoomIn} onOut={zoomOut} onReset={resetZoom} />
            </div>

            {/* Scrollable preview container */}
            <div className="rounded-lg overflow-auto"
              style={{ height: '760px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="p-4 inline-block">
                <ScaledSheet memo={memo} scale={scale} />
              </div>
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

      {/* Spacing panel (slide-in from right) */}
      <SpacingPanel open={showSpacing} onClose={() => setShowSpacing(false)} />

      {/* MOBILE — full-screen preview modal */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'var(--navy-800)', color: '#fff' }}>
            <span className="font-semibold">ตัวอย่างเอกสาร</span>
            <div className="flex items-center gap-2">
              <ZoomControls scale={scale} onIn={zoomIn} onOut={zoomOut} onReset={resetZoom} dark />
              <button onClick={() => setShowMobilePreview(false)}
                className="rounded-lg px-3 py-1.5 text-sm"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                ปิด ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="p-4 inline-block">
              <ScaledSheet memo={memo} scale={scale} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ScaledSheet({ memo, scale }: { memo: MemoSheetData; scale: number }) {
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
        <MemoSheet memo={memo} preview />
      </div>
    </div>
  )
}

function ZoomControls({
  scale, onIn, onOut, onReset, dark = false,
}: {
  scale: number
  onIn: () => void
  onOut: () => void
  onReset: () => void
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
      <button type="button" onClick={onReset}
        className="px-2 py-1 text-xs font-mono min-w-[44px] transition-colors hover:bg-black/5"
        style={{ color: text, borderLeft: `1px solid ${border}`, borderRight: `1px solid ${border}` }}
        title="รีเซ็ตเป็น 66%">{Math.round(scale * 100)}%</button>
      <button type="button" onClick={onIn} disabled={scale >= MAX_SCALE}
        className="px-2.5 py-1 text-base font-semibold transition-colors disabled:opacity-40 hover:bg-black/5"
        style={{ color: text }}
        title="ขยาย">+</button>
    </div>
  )
}
