import '@/app/preview/[id]/print.css'
import { toThaiDate, toThaiDigits } from '@/lib/thai-date'
import type { Attachment } from '@/lib/db'

export interface MemoSheetData {
  doc_number?: string
  subject?: string
  department?: string
  division?: string
  recipient?: string
  content_background?: string
  content_facts?: string
  content_consideration?: string
  show_heading_background?: boolean    // default true
  show_heading_facts?: boolean         // default true
  show_heading_consideration?: boolean // default true
  signatory_name?: string
  signatory_title?: string
  closing?: string
  doc_date?: string
  attachments?: Attachment[]
}

export default function MemoSheet({
  memo,
  preview = false,
}: {
  memo: MemoSheetData
  preview?: boolean
}) {
  const dateStr = memo.doc_date ? toThaiDate(memo.doc_date) : ''
  const dept = memo.department || ''
  const division = memo.division || ''
  const docNumber = toThaiDigits(memo.doc_number || '')
  const recipients = (memo.recipient || '').split('\n').filter(Boolean)

  return (
    <article className={`memo-page${preview ? ' memo-page-preview' : ''}`}>
      <header className="memo-header">
        <div className="memo-header-row">
          <img className="memo-garuda" src="/garuda.png" alt="ครุฑ" />
          <h1 className="memo-title">บันทึกข้อความ</h1>
        </div>

        <div className="memo-meta-row">
          <span className="meta-label">ส่วนราชการ</span>
          <span className="meta-value-dotted">
            {dept}{division ? `  ${division}` : ''}
          </span>
        </div>

        <div className="memo-meta-row">
          <span className="meta-label">ที่</span>
          <span className="meta-value-dotted meta-half">{docNumber}</span>
          <span className="meta-label">วันที่</span>
          <span className="meta-value-dotted">{dateStr}</span>
        </div>

        <div className="memo-meta-row">
          <span className="meta-label">เรื่อง</span>
          <span className="meta-value-dotted">{memo.subject || ''}</span>
        </div>

        <hr className="memo-divider" />

        <div className="memo-recipient">
          <span className="meta-label">เรียน</span>
          <div className="memo-recipient-list">
            {recipients.length === 0 ? (
              <div>&nbsp;</div>
            ) : (
              recipients.map((r, i) => <div key={i}>{r}</div>)
            )}
          </div>
        </div>
      </header>

      <section className="memo-body">
        {memo.content_background && (
          <div className="memo-section">
            {memo.show_heading_background !== false && <p className="section-heading">เรื่องเดิม</p>}
            <div className="section-content">{renderLines(memo.content_background)}</div>
          </div>
        )}

        {memo.content_facts && (
          <div className="memo-section">
            {memo.show_heading_facts !== false && <p className="section-heading">ข้อเท็จจริง</p>}
            <div className="section-content">{renderLines(memo.content_facts)}</div>
          </div>
        )}

        {memo.content_consideration && (
          <div className="memo-section">
            {memo.show_heading_consideration !== false && <p className="section-heading">ข้อพิจารณา</p>}
            <div className="section-content">{renderLines(memo.content_consideration)}</div>
          </div>
        )}
      </section>

      <footer className="memo-footer">
        <p className="memo-closing">{memo.closing || 'จึงเรียนมาเพื่อโปรดพิจารณา'}</p>

        <div className="memo-signature">
          <p className="sig-line">&nbsp;</p>
          <p className="sig-name">({memo.signatory_name || ' '})</p>
          <p className="sig-title">{memo.signatory_title || ''}</p>
        </div>

        {memo.attachments && memo.attachments.length > 0 && (
          <div className="memo-attachments">
            <p className="memo-attachments-heading">สิ่งที่ส่งมาด้วย</p>
            <ol className="memo-attachment-list">
              {memo.attachments.map((att, i) => (
                <li key={i} className="memo-attachment-item">
                  <span className="memo-attachment-num">{toThaiDigits(String(i + 1))}.</span>
                  <span className="memo-attachment-label">{att.label}</span>
                  {att.url && (
                    <span className="memo-attachment-url"> ({att.url})</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </footer>
    </article>
  )
}

function renderLines(text: string) {
  return text.split('\n').map((line, i) => (
    <p key={i} className={`body-line${line === '' ? ' body-blank' : ''}`}>
      {line || ' '}
    </p>
  ))
}
