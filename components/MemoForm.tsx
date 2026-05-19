'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import departments from '@/data/departments.json'
import recipientOptions from '@/data/recipients.json'
import { toThaiDate, toThaiDigits } from '@/lib/thai-date'

export interface FormState {
  department: string
  division: string
  doc_number: string
  doc_date: string
  subject: string
  recipient: string
  content_background: string
  content_facts: string
  content_consideration: string
  signatory_name: string
  signatory_title: string
  closing: string
  ai_context: string
}

export const EMPTY_FORM: FormState = {
  department: '', division: '', doc_number: '', doc_date: new Date().toISOString().split('T')[0],
  subject: '', recipient: 'นายกเทศมนตรีนครนครสวรรค์',
  content_background: '', content_facts: '', content_consideration: '',
  signatory_name: '', signatory_title: '',
  closing: 'จึงเรียนมาเพื่อโปรดพิจารณา',
  ai_context: '',
}

interface Signatory {
  id: number
  name: string
  title: string
}

interface Closing {
  id: number
  text: string
}

interface Props {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  recipients: string[]
  setRecipients: React.Dispatch<React.SetStateAction<string[]>>
}

export default function MemoForm({ form, setForm, recipients, setRecipients }: Props) {
  const router = useRouter()
  const [divisions, setDivisions] = useState<{ name: string; subCode: string }[]>([])
  const [sigList, setSigList] = useState<Signatory[]>([])
  const [sigEditor, setSigEditor] = useState<{ mode: 'add' | 'edit'; id?: number; name: string; title: string } | null>(null)
  const [closingList, setClosingList] = useState<Closing[]>([])
  const [closingEditor, setClosingEditor] = useState<{ mode: 'add' | 'edit'; id?: number; text: string } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [polishLoading, setPolishLoading] = useState(false)
  const [polishDone, setPolishDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [aiMeta, setAiMeta] = useState<{model: string; input_tokens: number; output_tokens: number} | null>(null)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const dept = departments.find(d => d.name === form.department)
    setDivisions(dept?.divisions ?? [])
    setForm(f => ({ ...f, division: '', doc_number: '' }))
  }, [form.department, setForm])

  useEffect(() => {
    setForm(f => ({ ...f, doc_number: '' }))
  }, [form.division, setForm])

  useEffect(() => {
    setForm(f => ({ ...f, recipient: recipients.filter(Boolean).join('\n') }))
  }, [recipients, setForm])

  const loadSignatories = async () => {
    const res = await fetch('/api/signatories')
    setSigList(await res.json())
  }
  const loadClosings = async () => {
    const res = await fetch('/api/closings')
    setClosingList(await res.json())
  }
  useEffect(() => { loadSignatories(); loadClosings() }, [])

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const selectSignatory = (name: string) => {
    const s = sigList.find(x => x.name === name)
    setForm(f => ({ ...f, signatory_name: name, signatory_title: s?.title ?? '' }))
  }

  const openAddSig = () => setSigEditor({ mode: 'add', name: '', title: '' })
  const openEditSig = () => {
    const s = sigList.find(x => x.name === form.signatory_name)
    if (!s) return
    setSigEditor({ mode: 'edit', id: s.id, name: s.name, title: s.title })
  }
  const saveSig = async () => {
    if (!sigEditor || !sigEditor.name.trim() || !sigEditor.title.trim()) {
      setError('กรุณาระบุชื่อและตำแหน่งผู้ลงนาม')
      return
    }
    setError('')
    const isEdit = sigEditor.mode === 'edit'
    const res = await fetch(isEdit ? `/api/signatories/${sigEditor.id}` : '/api/signatories', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sigEditor.name.trim(), title: sigEditor.title.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'บันทึกไม่สำเร็จ'); return }
    await loadSignatories()
    // ถ้าเป็นการแก้ไขผู้ที่กำลังเลือกอยู่ ให้ sync ค่าใน form ด้วย
    if (isEdit && form.signatory_name === sigList.find(s => s.id === sigEditor.id)?.name) {
      setForm(f => ({ ...f, signatory_name: data.name, signatory_title: data.title }))
    }
    setSigEditor(null)
  }
  const deleteSig = async () => {
    const s = sigList.find(x => x.name === form.signatory_name)
    if (!s) return
    if (!confirm(`ลบ "${s.name}" ออกจากรายชื่อผู้ลงนาม?`)) return
    await fetch(`/api/signatories/${s.id}`, { method: 'DELETE' })
    await loadSignatories()
    setForm(f => ({ ...f, signatory_name: '', signatory_title: '' }))
  }

  const openAddClosing = () => setClosingEditor({ mode: 'add', text: '' })
  const openEditClosing = () => {
    const c = closingList.find(x => x.text === form.closing)
    if (!c) return
    setClosingEditor({ mode: 'edit', id: c.id, text: c.text })
  }
  const saveClosing = async () => {
    if (!closingEditor || !closingEditor.text.trim()) {
      setError('กรุณาระบุข้อความคำลงท้าย')
      return
    }
    setError('')
    const isEdit = closingEditor.mode === 'edit'
    const oldText = isEdit ? closingList.find(c => c.id === closingEditor.id)?.text : null
    const res = await fetch(isEdit ? `/api/closings/${closingEditor.id}` : '/api/closings', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: closingEditor.text.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'บันทึกไม่สำเร็จ'); return }
    await loadClosings()
    if (isEdit && form.closing === oldText) {
      setForm(f => ({ ...f, closing: data.text }))
    }
    setClosingEditor(null)
  }
  const deleteClosing = async () => {
    const c = closingList.find(x => x.text === form.closing)
    if (!c) return
    if (!confirm(`ลบคำลงท้ายนี้?\n\n"${c.text}"`)) return
    await fetch(`/api/closings/${c.id}`, { method: 'DELETE' })
    await loadClosings()
    setForm(f => ({ ...f, closing: 'จึงเรียนมาเพื่อโปรดพิจารณา' }))
  }

  const aiDraft = async () => {
    if (!form.subject || !form.ai_context) {
      setError('กรุณาใส่ เรื่อง และ บริบท/ความต้องการ ก่อนให้ AI ร่าง')
      return
    }
    setAiLoading(true); setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject,
          department: form.department,
          division: form.division,
          recipient: form.recipient,
          context: form.ai_context,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({
        ...f,
        content_background: data.content_background,
        content_facts: data.content_facts,
        content_consideration: data.content_consideration,
      }))
      if (data._meta) setAiMeta(data._meta)
    } catch (e) {
      setError(String(e))
    } finally {
      setAiLoading(false)
    }
  }

  const polishMemo = async () => {
    const hasContent = form.content_background || form.content_facts || form.content_consideration
    if (!hasContent) { setError('กรุณากรอกเนื้อหาในส่วนที่ 3 ก่อนให้ AI ตรวจแก้'); return }
    setPolishLoading(true); setPolishDone(false); setError('')
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject,
          content_background: form.content_background,
          content_facts: form.content_facts,
          content_consideration: form.content_consideration,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({
        ...f,
        content_background: data.content_background || f.content_background,
        content_facts: data.content_facts || f.content_facts,
        content_consideration: data.content_consideration || f.content_consideration,
      }))
      setPolishDone(true)
      setTimeout(() => setPolishDone(false), 4000)
    } catch (e) {
      setError(String(e))
    } finally {
      setPolishLoading(false)
    }
  }

  const save = async () => {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_number: form.doc_number,
          subject: form.subject,
          department: form.department,
          division: form.division,
          recipient: form.recipient,
          content_background: form.content_background,
          content_facts: form.content_facts,
          content_consideration: form.content_consideration,
          signatory_name: form.signatory_name,
          signatory_title: form.signatory_title,
          closing: form.closing,
          doc_date: form.doc_date,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/preview/${data.id}`)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const dept = departments.find(d => d.name === form.department)
  const divObj = divisions.find(d => d.name === form.division)
  const divisionCode = divObj ? `.${divObj.subCode}` : ''
  const fullCode = dept ? `${dept.code}${divisionCode}` : ''
  const docPrefix = fullCode && form.division ? `${fullCode}/(๑)/` : ''
  const docSuffix = docPrefix && form.doc_number.startsWith(docPrefix)
    ? form.doc_number.slice(docPrefix.length)
    : (docPrefix ? form.doc_number.replace(/^.*\//, '') : form.doc_number)
  const setDocSuffix = (v: string) => {
    // อนุญาตเฉพาะตัวเลข/Thai numerals/-, แล้วแปลงเป็นเลขไทย
    const cleaned = v.replace(/[^0-9๐-๙\s/.-]/g, '')
    const thai = toThaiDigits(cleaned)
    setForm(f => ({ ...f, doc_number: docPrefix ? docPrefix + thai : thai }))
  }

  const hasSelectedSig = !!form.signatory_name && sigList.some(s => s.name === form.signatory_name)
  const hasSelectedClosing = !!form.closing && closingList.some(c => c.text === form.closing)

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* ส่วนหัว */}
      <section className="section-card">
        <div className="flex items-center gap-3 mb-2">
          <span className="step-badge">01</span>
          <h2 className="section-title">ส่วนหัวบันทึกข้อความ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">ส่วนราชการ (กอง / สำนัก)</label>
            <select className="input" value={form.department} onChange={set('department')}>
              <option value="">-- เลือกกอง --</option>
              {departments.map(d => <option key={d.name}>{d.name}</option>)}
            </select>
            {dept && (
              <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-300)' }}>
                {fullCode || dept.code}
              </p>
            )}
          </div>
          <div>
            <label className="label">กลุ่มงาน / ฝ่าย</label>
            <select className="input" value={form.division} onChange={set('division')} disabled={!divisions.length}>
              <option value="">-- เลือกกลุ่มงาน --</option>
              {divisions.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">เลขที่หนังสือ</label>
            {docPrefix ? (
              <div className="flex rounded-lg overflow-hidden"
                style={{ border: '1.5px solid var(--border)', background: 'var(--card)' }}>
                <span className="flex items-center px-3 py-2.5 text-base font-mono shrink-0 select-none"
                  style={{ background: 'var(--surface)', color: 'var(--text-600)', borderRight: '1.5px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {docPrefix}
                </span>
                <input
                  className="flex-1 px-3 py-2.5 text-base bg-white outline-none"
                  style={{ minWidth: 0 }}
                  value={docSuffix}
                  onChange={e => setDocSuffix(e.target.value)}
                  placeholder="เลขที่"
                />
              </div>
            ) : (
              <input className="input" value={form.doc_number} onChange={set('doc_number')}
                placeholder={dept?.code ? `${dept.code}/` : 'นว ๕๒๐๐X/'} />
            )}
          </div>
          <div>
            <label className="label">วันที่</label>
            <input type="date" className="input" value={form.doc_date} onChange={set('doc_date')} />
            {form.doc_date && (
              <p className="text-base text-blue-500 mt-1">{toThaiDate(form.doc_date)}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="label">เรื่อง</label>
            <input className="input" value={form.subject} onChange={set('subject')} placeholder="หัวเรื่องบันทึกข้อความ" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="label">เรียน</label>
            {recipients.map((rec, idx) => (
              <div key={idx} className="flex gap-2">
                <select
                  className="input flex-1"
                  value={rec}
                  onChange={e => {
                    const next = [...recipients]
                    next[idx] = e.target.value
                    setRecipients(next)
                  }}
                >
                  <option value="">-- เลือกผู้รับ --</option>
                  {recipientOptions.map(r => <option key={r}>{r}</option>)}
                </select>
                {recipients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRecipients(r => r.filter((_, i) => i !== idx))}
                    className="shrink-0 w-10 flex items-center justify-center rounded-lg transition-colors"
                    style={{ border: '1.5px solid var(--border)', color: 'var(--text-300)', background: 'var(--card)' }}
                    title="ลบผู้รับ"
                  >✕</button>
                )}
              </div>
            ))}
            {recipients.length < 5 && (
              <button
                type="button"
                onClick={() => setRecipients(r => [...r, ''])}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--blue)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มผู้รับ
              </button>
            )}
          </div>
        </div>
      </section>

      {/* AI Draft */}
      <section className="rounded-xl overflow-hidden" style={{ background: 'var(--blue-50)', border: '1px solid #BFDBFE' }}>
        <div className="p-5 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <span className="step-badge">02</span>
            <h2 className="section-title flex-1" style={{ color: '#1E3A8A' }}>ให้ AI ช่วยร่างเนื้อหา</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>ไม่บังคับ</span>
            <button onClick={() => setShowGuide(v => !v)}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: showGuide ? '#1D4ED8' : '#60A5FA' }}
              title="ดูวิธีการใช้งาน">
              <svg className={`w-4 h-4 transition-transform duration-200 ${showGuide ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span className="hidden sm:inline">{showGuide ? 'ซ่อนคู่มือ' : 'วิธีใช้'}</span>
            </button>
          </div>

          {showGuide && (
            <div className="rounded-xl p-4 text-sm space-y-3 animate-fade-in"
              style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E3A8A' }}>
              <p className="font-semibold flex items-center gap-2">
                📋 วิธีการใช้ส่วนที่ 2 — ให้ AI ช่วยร่างเนื้อหา
              </p>
              <ol className="space-y-2 pl-1" style={{ listStyleType: 'none' }}>
                <li className="flex gap-2"><span className="font-bold shrink-0">1️⃣</span><span>กรอก <strong>เรื่อง</strong> และ <strong>เรียน</strong> ในส่วนที่ 1 ก่อน เพื่อให้ AI เข้าใจบริบท</span></li>
                <li className="flex gap-2"><span className="font-bold shrink-0">2️⃣</span><span>อธิบาย <strong>บริบท/ความต้องการ</strong> โดยระบุสาระสำคัญที่ต้องการให้ AI ร่าง เช่น วัตถุประสงค์ งบประมาณ จำนวน ระเบียบที่อ้างอิง</span></li>
                <li className="flex gap-2"><span className="font-bold shrink-0">3️⃣</span><span>กด <strong>&ldquo;ให้ AI ร่างเนื้อหา&rdquo;</strong> AI จะสร้างทั้ง 3 ส่วน ได้แก่ เรื่องเดิม ข้อเท็จจริง และข้อพิจารณา</span></li>
                <li className="flex gap-2"><span className="font-bold shrink-0">4️⃣</span><span>แก้ไขเนื้อหาที่ได้ในส่วนที่ 3 ตามความเหมาะสม แล้วใช้ <strong>&ldquo;ให้ AI ตรวจแก้ภาษา&rdquo;</strong> เพื่อปรับปรุงความเป็นทางการ</span></li>
              </ol>
              <div className="rounded-lg p-3 mt-1" style={{ background: 'white', border: '1px solid #BFDBFE' }}>
                <p className="font-semibold mb-1">💡 ตัวอย่างบริบทที่ดี:</p>
                <p className="italic" style={{ color: '#3B82F6' }}>
                  &ldquo;ขออนุมัติจัดซื้อครุภัณฑ์คอมพิวเตอร์ จำนวน 5 เครื่อง งบประมาณรวม 150,000 บาท เพื่อทดแทนเครื่องเดิมที่ชำรุดและหมดอายุการใช้งาน ตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างฯ พ.ศ. 2560&rdquo;
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="label" style={{ color: '#1E40AF' }}>บริบท / ความต้องการ</label>
            <textarea className="input h-24" value={form.ai_context} onChange={set('ai_context')}
              placeholder="อธิบายสิ่งที่ต้องการให้บันทึกข้อความระบุ เช่น วัตถุประสงค์ งบประมาณ จำนวน ระเบียบที่เกี่ยวข้อง..." />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={aiDraft} disabled={aiLoading}
              className="btn-primary flex items-center gap-2">
              {aiLoading
                ? <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />กำลังร่าง...</>
                : <>✨ ให้ AI ร่างเนื้อหา</>}
            </button>
            {aiMeta && (
              <span className="text-sm flex items-center gap-1.5 animate-fade-in" style={{ color: '#60A5FA' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                ร่างแล้ว · {aiMeta.input_tokens + aiMeta.output_tokens} tokens
              </span>
            )}
          </div>
        </div>
      </section>

      {/* เนื้อหา */}
      <section className="section-card">
        <div className="flex items-center gap-3 mb-2">
          <span className="step-badge">03</span>
          <h2 className="section-title flex-1">เนื้อหาบันทึกข้อความ</h2>
          <div className="relative group">
            <button
              onClick={polishMemo}
              disabled={polishLoading || !(form.content_background || form.content_facts || form.content_consideration)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: polishDone ? '#F0FDF4' : 'var(--surface)', border: `1px solid ${polishDone ? '#86EFAC' : 'var(--border)'}`, color: polishDone ? '#16A34A' : 'var(--text-600)' }}>
              {polishLoading
                ? <><span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />กำลังตรวจแก้...</>
                : polishDone
                  ? <>✅ ปรับปรุงแล้ว</>
                  : <>🔍 ให้ AI ตรวจแก้ภาษา</>}
            </button>
            <div className="tooltip-box">
              วิเคราะห์และปรับปรุงภาษาราชการ ไวยากรณ์<br />และความถูกต้องตามระเบียบสารบรรณ
            </div>
          </div>
        </div>

        {polishDone && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm animate-fade-in"
            style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D' }}>
            <span>✅</span>
            <span>AI ปรับปรุงภาษาเรียบร้อยแล้ว — ตรวจสอบและแก้ไขเพิ่มเติมได้ตามต้องการ</span>
          </div>
        )}

        {[
          { key: 'content_background' as const, label: 'เรื่องเดิม', hint: 'อ้างอิงเอกสาร มติ คำสั่ง หรือกฎระเบียบที่เกี่ยวข้อง', icon: '📌' },
          { key: 'content_facts' as const, label: 'ข้อเท็จจริง', hint: 'อธิบายสาระสำคัญ รายละเอียด และข้อมูลประกอบที่จำเป็น', icon: '📊' },
          { key: 'content_consideration' as const, label: 'ข้อพิจารณา', hint: 'เสนอแนวทาง ขออนุมัติ หรือขอความเห็นชอบ พร้อมอ้างอำนาจตามระเบียบ', icon: '✍️' },
        ].map(({ key, label, hint, icon }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">{icon}</span>
              <label className="label mb-0">{label}</label>
              <div className="relative group ml-auto">
                <button type="button" className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-colors"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-300)' }}>?</button>
                <div className="tooltip-box tooltip-box-left">{hint}</div>
              </div>
            </div>
            <textarea
              className={`input h-40 transition-all ${polishLoading ? 'opacity-50' : ''}`}
              style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif" }}
              value={form[key]} onChange={set(key)}
              placeholder={`กรอก${label}...`}
              disabled={polishLoading}
            />
          </div>
        ))}
      </section>

      {/* ลงนาม */}
      <section className="section-card">
        <div className="flex items-center gap-3 mb-2">
          <span className="step-badge">04</span>
          <h2 className="section-title">ลงนาม</h2>
        </div>

        {/* คำลงท้าย */}
        <div className="mb-4">
          <label className="label">คำลงท้าย</label>
          <div className="flex gap-2">
            <select className="input flex-1" value={form.closing} onChange={set('closing')}>
              <option value="">-- เลือกคำลงท้าย --</option>
              {closingList.map(c => <option key={c.id} value={c.text}>{c.text}</option>)}
            </select>
            <button type="button" onClick={openAddClosing}
              className="shrink-0 px-3 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--blue)' }}
              title="เพิ่มคำลงท้ายใหม่">✚ เพิ่ม</button>
            <button type="button" onClick={openEditClosing} disabled={!hasSelectedClosing}
              className="shrink-0 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              style={{ border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--text-600)' }}
              title="แก้ไขคำลงท้ายที่เลือก">✎</button>
            <button type="button" onClick={deleteClosing} disabled={!hasSelectedClosing}
              className="shrink-0 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              style={{ border: '1.5px solid var(--border)', background: 'var(--card)', color: '#DC2626' }}
              title="ลบคำลงท้ายที่เลือก">🗑</button>
          </div>
        </div>

        {closingEditor && (
          <div className="mb-4 rounded-lg p-4 space-y-3 animate-fade-in"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--blue)' }}>
            <p className="font-semibold text-base" style={{ color: 'var(--text-900)' }}>
              {closingEditor.mode === 'add' ? '✚ เพิ่มคำลงท้ายใหม่' : '✎ แก้ไขคำลงท้าย'}
            </p>
            <div>
              <label className="label">ข้อความ</label>
              <input className="input" value={closingEditor.text}
                onChange={e => setClosingEditor(c => c && ({ ...c, text: e.target.value }))}
                placeholder="เช่น จึงเรียนมาเพื่อโปรดพิจารณา" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={saveClosing} className="btn-primary text-sm py-2 px-4">บันทึก</button>
              <button type="button" onClick={() => setClosingEditor(null)} className="btn-secondary text-sm py-2 px-4">ยกเลิก</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">ชื่อผู้ลงนาม</label>
            <div className="flex gap-2">
              <select className="input flex-1" value={form.signatory_name} onChange={e => selectSignatory(e.target.value)}>
                <option value="">-- เลือกผู้ลงนาม --</option>
                {sigList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <button type="button" onClick={openAddSig}
                className="shrink-0 px-3 rounded-lg text-sm font-medium transition-colors"
                style={{ border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--blue)' }}
                title="เพิ่มผู้ลงนามใหม่">✚ เพิ่ม</button>
              <button type="button" onClick={openEditSig} disabled={!hasSelectedSig}
                className="shrink-0 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                style={{ border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--text-600)' }}
                title="แก้ไขผู้ลงนามที่เลือก">✎</button>
              <button type="button" onClick={deleteSig} disabled={!hasSelectedSig}
                className="shrink-0 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                style={{ border: '1.5px solid var(--border)', background: 'var(--card)', color: '#DC2626' }}
                title="ลบผู้ลงนามที่เลือก">🗑</button>
            </div>
          </div>
          <div>
            <label className="label">ตำแหน่ง</label>
            <input className="input" value={form.signatory_title} onChange={set('signatory_title')} placeholder="ตำแหน่ง" />
          </div>
        </div>

        {sigEditor && (
          <div className="mt-4 rounded-lg p-4 space-y-3 animate-fade-in"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--blue)' }}>
            <p className="font-semibold text-base" style={{ color: 'var(--text-900)' }}>
              {sigEditor.mode === 'add' ? '✚ เพิ่มผู้ลงนามใหม่' : '✎ แก้ไขผู้ลงนาม'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">ชื่อ</label>
                <input className="input" value={sigEditor.name}
                  onChange={e => setSigEditor(s => s && ({ ...s, name: e.target.value }))}
                  placeholder="เช่น นายสมชาย ใจดี" />
              </div>
              <div>
                <label className="label">ตำแหน่ง</label>
                <input className="input" value={sigEditor.title}
                  onChange={e => setSigEditor(s => s && ({ ...s, title: e.target.value }))}
                  placeholder="เช่น หัวหน้าฝ่ายแผนงานและงบประมาณ" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={saveSig} className="btn-primary text-sm py-2 px-4">บันทึก</button>
              <button type="button" onClick={() => setSigEditor(null)} className="btn-secondary text-sm py-2 px-4">ยกเลิก</button>
            </div>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pb-12">
        <button onClick={save} disabled={saving || !form.subject}
          className="btn-primary sm:flex-1 w-full sm:w-auto justify-center">
          {saving ? 'กำลังบันทึก...' : 'บันทึกและดูตัวอย่าง →'}
        </button>
        <button onClick={() => router.push('/')} className="btn-secondary w-full sm:w-auto justify-center">ยกเลิก</button>
      </div>
    </div>
  )
}
