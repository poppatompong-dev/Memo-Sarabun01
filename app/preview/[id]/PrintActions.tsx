'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface MemoMeta {
  doc_number: string
  doc_date: string
  subject: string
  department: string
  division: string
  recipient: string
  content_background: string
  content_facts: string
  content_consideration: string
  signatory_name: string
  signatory_title: string
  closing: string
}

function formatThaiDate(iso: string) {
  if (!iso) return '—'
  const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
  const [y, m, d] = iso.split('-').map(Number)
  const thaiY = y + 543
  const toThai = (n: number) => String(n).replace(/[0-9]/g, d => '๐๑๒๓๔๕๖๗๘๙'[+d])
  return `${toThai(d)} ${months[m - 1]} ${toThai(thaiY)}`
}

function Field({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  const present = Boolean(value && value.trim())
  return (
    <div className="flex gap-3 py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ width: 120, flexShrink: 0, color: '#6B7280', fontSize: 13 }}>{label}</span>
      <span style={{ flex: 1, color: present ? '#111827' : '#D1D5DB', fontSize: 13 }}>
        {present ? value.split('\n').join(' / ') : '(ไม่ได้ระบุ)'}
      </span>
      <span style={{ fontSize: 16 }}>{present ? '✓' : warn ? '⚠️' : '○'}</span>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1" style={{ borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ width: 140, flexShrink: 0, color: '#6B7280', fontSize: 12 }}>{label}</span>
      <span style={{ flex: 1, color: '#374151', fontSize: 12, fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

function VerifyModal({ memo, onClose, onPrint }: { memo: MemoMeta; onClose: () => void; onPrint: () => void }) {
  const sections = [
    { key: 'เรื่องเดิม', value: memo.content_background },
    { key: 'ข้อเท็จจริง', value: memo.content_facts },
    { key: 'ข้อพิจารณา', value: memo.content_consideration },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: 560,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>ตรวจสอบก่อนพิมพ์</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>ตรวจสอบความถูกต้องของเอกสารก่อนสั่งพิมพ์</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9CA3AF', padding: 4 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {/* Document metadata */}
          <div style={{ fontWeight: 600, fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            ข้อมูลเอกสาร
          </div>
          <Field label="เลขที่" value={memo.doc_number} warn />
          <Field label="วันที่" value={formatThaiDate(memo.doc_date)} warn />
          <Field label="ส่วนราชการ" value={[memo.department, memo.division].filter(Boolean).join(' · ')} warn />
          <Field label="เรื่อง" value={memo.subject} warn />
          <Field label="เรียน" value={memo.recipient} warn />

          {/* Content sections */}
          <div style={{ fontWeight: 600, fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 16, marginBottom: 8 }}>
            เนื้อหา
          </div>
          {sections.map(s => (
            <div key={s.key} className="flex gap-3 py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ width: 120, flexShrink: 0, color: '#6B7280', fontSize: 13 }}>{s.key}</span>
              <span style={{ flex: 1, fontSize: 13, color: s.value?.trim() ? '#111827' : '#D1D5DB' }}>
                {s.value?.trim() ? `${s.value.slice(0, 60)}${s.value.length > 60 ? '…' : ''}` : '(ไม่ได้ระบุ)'}
              </span>
              <span style={{ fontSize: 16 }}>{s.value?.trim() ? '✓' : '○'}</span>
            </div>
          ))}

          {/* Signatory */}
          <div style={{ fontWeight: 600, fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 16, marginBottom: 8 }}>
            ผู้ลงนาม
          </div>
          <Field label="ชื่อ" value={memo.signatory_name} warn />
          <Field label="ตำแหน่ง" value={memo.signatory_title} warn />

          {/* Format specs */}
          <div style={{
            marginTop: 16, padding: '12px 14px', borderRadius: 8,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
          }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              ข้อกำหนดการจัดรูปแบบ (ระเบียบสารบรรณ)
            </div>
            <SpecRow label="กระดาษ" value="A4 portrait" />
            <SpecRow label="ฟอนต์" value="TH SarabunIT9 — 16pt (เนื้อหา)" />
            <SpecRow label="หัวข้อ" value="บันทึกข้อความ 28pt" />
            <SpecRow label="ป้ายกำกับ" value="ส่วนราชการ / ที่ / เรื่อง / เรียน 20pt bold" />
            <SpecRow label="หัวข้อย่อย" value="เรื่องเดิม / ข้อเท็จจริง / ข้อพิจารณา — กึ่งกลาง ขีดเส้นใต้" />
            <SpecRow label="ย่อหน้า" value="72pt (≈ 2.5 ซม.)" />
            <SpecRow label="ระยะขอบ" value="บน 17.5mm · ขวา 20mm · ล่าง 15mm · ซ้าย 30mm" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 14,
              border: '1px solid #D1D5DB', background: '#fff', color: '#374151',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onPrint}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: 'none', background: '#2563EB', color: '#fff',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            🖨️ สั่งพิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PrintActions({ memo }: { memo: MemoMeta }) {
  const [showModal, setShowModal] = useState(false)

  const handlePrint = () => {
    setShowModal(false)
    setTimeout(() => window.print(), 80)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
        title="บันทึกเป็น PDF — เลือก 'Save as PDF' หรือ 'Microsoft Print to PDF' ในหน้าต่างพิมพ์"
      >
        📥 PDF
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
      >
        🖨️ พิมพ์
      </button>

      {showModal && typeof document !== 'undefined' && createPortal(
        <VerifyModal memo={memo} onClose={() => setShowModal(false)} onPrint={handlePrint} />,
        document.body
      )}
    </>
  )
}
