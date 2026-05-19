'use client'
import { useEffect, useState } from 'react'

/**
 * SpacingPanel — ปรับ CSS variables ของ MemoSheet สดๆ
 *
 * วิธีทำงาน:
 *  - แต่ละ control อ่าน/เขียน CSS custom property บน `document.documentElement`
 *  - ค่าจะถูก persist ใน localStorage เพื่อให้คงค่าเมื่อ refresh
 *  - ปุ่ม "คืนค่าเริ่มต้น" ลบ key ทั้งหมดและ inline styles
 */

interface VarDef {
  key: string             // CSS var name (without --)
  label: string           // ฉลากภาษาไทย
  defaultValue: string    // ค่าตามระเบียบสารบรรณ
  unit: 'mm' | 'pt' | 'em' | '-' // unit shown to user; '-' = unitless
  group: 'page' | 'header' | 'body' | 'footer'
  min?: number
  max?: number
  step?: number
}

const VARS: VarDef[] = [
  // PAGE
  { key: 'memo-pad-top',    label: 'ขอบบน',    defaultValue: '25mm', unit: 'mm', group: 'page', min: 0, max: 50 },
  { key: 'memo-pad-right',  label: 'ขอบขวา',   defaultValue: '25mm', unit: 'mm', group: 'page', min: 0, max: 50 },
  { key: 'memo-pad-bottom', label: 'ขอบล่าง',  defaultValue: '20mm', unit: 'mm', group: 'page', min: 0, max: 50 },
  { key: 'memo-pad-left',   label: 'ขอบซ้าย',  defaultValue: '30mm', unit: 'mm', group: 'page', min: 0, max: 50 },

  // HEADER
  { key: 'memo-garuda-size',    label: 'ขนาดตราครุฑ',         defaultValue: '24mm', unit: 'mm', group: 'header', min: 12, max: 40 },
  { key: 'memo-title-size',     label: 'ขนาดหัวข้อ',          defaultValue: '29pt', unit: 'pt', group: 'header', min: 18, max: 36 },
  { key: 'memo-header-gap',     label: 'ระยะใต้หัว',          defaultValue: '6pt',  unit: 'pt', group: 'header', min: 0, max: 24 },
  { key: 'memo-row-gap',        label: 'ระยะระหว่างบรรทัด',   defaultValue: '6pt',  unit: 'pt', group: 'header', min: 0, max: 24 },
  { key: 'memo-dotted-pad-bot', label: 'ช่องระหว่างข้อความ-เส้นประ', defaultValue: '0pt', unit: 'pt', group: 'header', min: 0, max: 12, step: 0.5 },
  { key: 'memo-row-line-height', label: 'line-height แถวหัว', defaultValue: '1.15', unit: '-', group: 'header', min: 1, max: 2, step: 0.05 },
  { key: 'memo-divider-top',    label: 'ระยะเหนือเส้นแบ่ง',   defaultValue: '6pt',  unit: 'pt', group: 'header', min: 0, max: 24 },
  { key: 'memo-divider-bottom', label: 'ระยะใต้เส้นแบ่ง',     defaultValue: '10pt', unit: 'pt', group: 'header', min: 0, max: 24 },

  // BODY
  { key: 'memo-body-size',   label: 'ขนาดตัวอักษร',          defaultValue: '16pt', unit: 'pt', group: 'body', min: 12, max: 22 },
  { key: 'memo-line-height', label: 'line-height เนื้อหา',   defaultValue: '1.5',  unit: '-', group: 'body', min: 1, max: 2.5, step: 0.05 },
  { key: 'memo-body-top',    label: 'ระยะเหนือเนื้อหา',      defaultValue: '6pt',  unit: 'pt', group: 'body', min: 0, max: 36 },
  { key: 'memo-section-gap', label: 'ระยะระหว่างย่อหน้า',    defaultValue: '8pt',  unit: 'pt', group: 'body', min: 0, max: 36 },
  { key: 'memo-line-indent', label: 'เยื้องบรรทัดแรก',       defaultValue: '36pt', unit: 'pt', group: 'body', min: 0, max: 72 },

  // FOOTER
  { key: 'memo-footer-top',  label: 'ระยะเหนือลายเซ็น',      defaultValue: '12pt', unit: 'pt', group: 'footer', min: 0, max: 48 },
  { key: 'memo-closing-gap', label: 'ระยะใต้คำลงท้าย',       defaultValue: '24pt', unit: 'pt', group: 'footer', min: 0, max: 60 },
  { key: 'memo-sig-gap',     label: 'ระยะเหนือชื่อในวงเล็บ', defaultValue: '0pt',  unit: 'pt', group: 'footer', min: 0, max: 60 },
]

const GROUPS: { id: VarDef['group']; label: string; icon: string }[] = [
  { id: 'page', label: 'หน้ากระดาษ', icon: '📄' },
  { id: 'header', label: 'หัวเอกสาร', icon: '🔝' },
  { id: 'body', label: 'เนื้อหา', icon: '📝' },
  { id: 'footer', label: 'ลายเซ็น', icon: '✍️' },
]

const STORAGE_KEY = 'memo-spacing-overrides'

function parseValue(v: string): number {
  return parseFloat(v.replace(/[a-z%-]+$/, '')) || 0
}

export default function SpacingPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, number>>({})
  const [activeGroup, setActiveGroup] = useState<VarDef['group']>('page')

  // Load saved overrides on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const overrides: Record<string, number> = saved ? JSON.parse(saved) : {}
      const initial: Record<string, number> = {}
      for (const v of VARS) {
        initial[v.key] = overrides[v.key] ?? parseValue(v.defaultValue)
      }
      setValues(initial)
      // Apply overrides
      for (const [k, val] of Object.entries(overrides)) {
        const def = VARS.find(d => d.key === k)
        if (def) document.documentElement.style.setProperty(`--${k}`, formatVal(val, def.unit))
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const formatVal = (n: number, unit: VarDef['unit']) => unit === '-' ? String(n) : `${n}${unit}`

  const updateOne = (def: VarDef, n: number) => {
    setValues(v => {
      const next = { ...v, [def.key]: n }
      document.documentElement.style.setProperty(`--${def.key}`, formatVal(n, def.unit))
      // persist only differences from default
      const overrides: Record<string, number> = {}
      for (const d of VARS) {
        if (next[d.key] !== parseValue(d.defaultValue)) overrides[d.key] = next[d.key]
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)) } catch {}
      return next
    })
  }

  const resetAll = () => {
    const initial: Record<string, number> = {}
    for (const v of VARS) {
      initial[v.key] = parseValue(v.defaultValue)
      document.documentElement.style.removeProperty(`--${v.key}`)
    }
    setValues(initial)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  if (!open) return null

  const filteredVars = VARS.filter(v => v.group === activeGroup)

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl flex flex-col animate-fade-in"
      style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: 'var(--navy-800)', color: '#fff' }}>
        <div>
          <h3 className="font-bold text-base">📐 ปรับระยะห่างเอกสาร</h3>
          <p className="text-xs opacity-70">เปลี่ยนค่าแล้วเห็นผลทันที · บันทึกอัตโนมัติ</p>
        </div>
        <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm"
          style={{ background: 'rgba(255,255,255,0.1)' }}>ปิด ✕</button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {GROUPS.map(g => (
          <button key={g.id} onClick={() => setActiveGroup(g.id)}
            className="flex-1 px-3 py-2.5 text-sm font-medium transition-colors"
            style={{
              background: activeGroup === g.id ? 'var(--surface)' : 'transparent',
              color: activeGroup === g.id ? 'var(--blue)' : 'var(--text-600)',
              borderBottom: activeGroup === g.id ? '2px solid var(--blue)' : '2px solid transparent',
            }}>
            <span className="mr-1">{g.icon}</span>{g.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredVars.map(def => {
          const current = values[def.key] ?? parseValue(def.defaultValue)
          const defaultNum = parseValue(def.defaultValue)
          const isModified = current !== defaultNum
          return (
            <div key={def.key} className="rounded-lg p-3"
              style={{ background: isModified ? '#EFF6FF' : 'var(--surface)', border: `1px solid ${isModified ? '#BFDBFE' : 'var(--border)'}` }}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-900)' }}>
                  {def.label}
                </label>
                {isModified && (
                  <button onClick={() => updateOne(def, defaultNum)}
                    className="text-xs text-blue-600 hover:underline">
                    คืนค่า ({def.defaultValue})
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={def.min ?? 0}
                  max={def.max ?? 100}
                  step={def.step ?? 1}
                  value={current}
                  onChange={e => updateOne(def, +e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min={def.min}
                    max={def.max}
                    step={def.step ?? 1}
                    value={current}
                    onChange={e => updateOne(def, +e.target.value)}
                    className="w-16 px-2 py-1 text-sm text-right rounded"
                    style={{ border: '1px solid var(--border)', background: '#fff' }}
                  />
                  {def.unit !== '-' && (
                    <span className="text-xs font-mono w-5" style={{ color: 'var(--text-300)' }}>{def.unit}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-3 shrink-0 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button onClick={resetAll}
          className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-600)', border: '1px solid var(--border)', background: 'var(--card)' }}>
          ↺ คืนค่ามาตรฐานทั้งหมด
        </button>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-300)' }}>
          ค่าตามระเบียบสารบรรณ
        </span>
      </div>
    </div>
  )
}
