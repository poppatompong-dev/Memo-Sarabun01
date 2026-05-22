import ClaudeStatus from '@/components/ClaudeStatus'

const FEATURES = [
  {
    icon: '#',
    iconBg: '#EFF6FF', iconColor: '#1D4ED8',
    title: 'เลขที่เอกสารอัตโนมัติ',
    desc: 'สร้างรหัสเลขที่เอกสารตามรูปแบบระเบียบสารบรรณโดยอัตโนมัติ',
  },
  {
    icon: '👥',
    iconBg: '#F0FDF4', iconColor: '#16A34A',
    title: 'ผู้รับหลายคน',
    desc: 'ระบุผู้รับได้หลายตำแหน่ง ครบถ้วนตามสายงาน บันทึกไว้ใช้ซ้ำได้',
  },
  {
    icon: '✨',
    iconBg: '#FFF7ED', iconColor: '#EA580C',
    title: 'AI ร่างเนื้อหา / ตรวจแก้ภาษา',
    desc: 'ช่วยร่างและตรวจแก้ภาษาราชการให้ถูกต้อง เป็นทางการ และเป็นระเบียบ',
  },
  {
    icon: '👁',
    iconBg: '#EFF6FF', iconColor: '#0369A1',
    title: 'Realtime Preview',
    desc: 'พรีวิวเอกสารแบบเรียลไทม์ ตรงตามรูปแบบ A4 ระเบียบสารบรรณ',
  },
  {
    icon: '📐',
    iconBg: '#FDF4FF', iconColor: '#9333EA',
    title: 'Spacing Panel',
    desc: 'ปรับระยะห่างและรูปแบบเอกสารตามระเบียบงานสารบรรณได้ทันที',
  },
  {
    icon: 'W',
    iconBg: '#EFF6FF', iconColor: '#1D4ED8',
    title: 'พิมพ์และส่งออก DOCX',
    desc: 'พิมพ์เอกสารหรือส่งออกไฟล์ DOCX ได้ด้วยคลิกเดียว',
  },
]

const NAV_LINKS = [
  { label: 'หน้าแรก', href: '/', active: true },
  { label: 'สร้างใหม่', href: '/new' },
  { label: 'ประวัติ', href: '/history' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>

      {/* ═══ NAV ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-20" style={{ background: 'var(--navy-800)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm leading-tight">ระบบบันทึกข้อความ</div>
              <div className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.4)' }}>เทศบาลนครนครสวรรค์</div>
            </div>
          </a>

          {/* Nav Tabs */}
          <nav className="hidden sm:flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={link.active
                  ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.55)' }}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            <ClaudeStatus />
            {/* Mobile menu link */}
            <a href="/new" className="sm:hidden btn-primary text-sm py-1.5 px-3">สร้างใหม่</a>
          </div>
        </div>
      </header>

      {/* ═══ HERO ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 items-center">

          {/* Left — text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
              style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              เทศบาลนครนครสวรรค์ · ระบบสารบรรณดิจิทัล
            </div>

            <h1 className="font-extrabold tracking-tight mb-2" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.75rem)', color: 'var(--text-900)', lineHeight: 1.15 }}>
              จัดทำบันทึกข้อความราชการ
            </h1>
            <p className="font-bold mb-5" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--blue)', lineHeight: 1.2 }}>
              ได้เร็ว ถูกต้อง และเป็นระเบียบ
            </p>
            <p className="text-lg mb-8 max-w-lg" style={{ color: 'var(--text-600)', lineHeight: 1.7 }}>
              ระบบช่วยร่าง จัดเก็บ พรีวิว พิมพ์ และส่งออกบันทึกข้อความราชการ
              เป็นไปตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <a href="/new" className="btn-primary flex items-center gap-2 text-base">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                สร้างบันทึกใหม่
              </a>
              <a href="/history" className="btn-secondary flex items-center gap-2 text-base">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                ค้นหาประวัติบันทึก
              </a>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: '✨', label: 'AI ร่างเนื้อหา' },
                { icon: '👁', label: 'Preview A4 แบบเรียลไทม์' },
                { icon: '📄', label: 'Export DOCX' },
              ].map(p => (
                <span key={p.label} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-600)' }}>
                  {p.icon} {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — document mockup */}
          <div className="hidden lg:flex items-center justify-center relative" style={{ height: '420px' }}>
            {/* AI panel — floating left */}
            <div className="absolute left-0 top-16 z-10 rounded-xl p-4 animate-fade-in"
              style={{ background: '#fff', border: '1px solid #BFDBFE', boxShadow: '0 8px 32px rgba(29,78,216,0.12)', width: '180px' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#1D4ED8' }}>✨ AI ร่างเนื้อหา</p>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: '#6B7280' }}>
                ช่วยร่างบันทึก เรื่อง ขออนุมัติโครงการฯ เพิ่มประสิทธิภาพ...
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: '#1D4ED8', color: '#fff' }}>
                ใช้ความนี้ ✓
              </span>
            </div>

            {/* Main document card */}
            <div className="relative z-0 rounded-xl overflow-hidden"
              style={{ background: '#fff', boxShadow: '0 12px 48px rgba(13,31,53,0.14)', width: '260px', border: '1px solid var(--border)' }}>
              <div className="px-5 pt-5 pb-4" style={{ fontFamily: "'Sarabun', sans-serif" }}>
                {/* Doc header */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <img src="/garuda.png" alt="" style={{ width: '18px', filter: 'grayscale(100%)' }} />
                  <span className="font-bold text-sm tracking-wide" style={{ color: '#000', letterSpacing: '1.5px' }}>บันทึกข้อความ</span>
                </div>
                {/* Meta rows (decorative) */}
                {['ส่วนราชการ', 'ที่ / วันที่', 'เรื่อง'].map(label => (
                  <div key={label} className="flex items-end gap-1.5 mb-1.5">
                    <span className="text-[9px] font-bold shrink-0 leading-none pb-0.5" style={{ color: '#000' }}>{label}</span>
                    <div className="flex-1 mb-0.5" style={{ borderBottom: '1px dotted #aaa', height: '11px' }} />
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #000', margin: '6px 0' }} />
                {/* เรียน */}
                <div className="flex gap-1.5 mb-3">
                  <span className="text-[9px] font-bold shrink-0 pt-0.5" style={{ color: '#000' }}>เรียน</span>
                  <div className="text-[9px] leading-relaxed" style={{ color: '#333' }}>
                    <div>กองยุทธศาสตร์และงบประมาณ</div>
                    <div style={{ color: '#888' }}>หัวหน้าหน่วยตรวจสอบภายใน</div>
                  </div>
                </div>
                {/* Body lines */}
                {[100, 95, 88, 70].map((w, i) => (
                  <div key={i} className="rounded-sm mb-1.5" style={{ height: '5px', background: '#EEF2F7', width: `${w}%` }} />
                ))}
                {/* Signature */}
                <div className="text-center mt-4">
                  <div className="text-lg mb-1" style={{ color: '#CBD5E1', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>~ ~ ~</div>
                  <div className="rounded-sm mx-auto mb-1" style={{ height: '5px', background: '#EEF2F7', width: '55%' }} />
                  <div className="rounded-sm mx-auto" style={{ height: '5px', background: '#EEF2F7', width: '40%' }} />
                </div>
              </div>
              {/* Bottom bar */}
              <div className="px-4 py-2.5 flex gap-3" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                {['ดูตัวอย่าง', 'DOCX', 'พิมพ์'].map(item => (
                  <span key={item} className="text-[10px] font-medium" style={{ color: 'var(--blue)' }}>{item}</span>
                ))}
              </div>
            </div>

            {/* Spacing badge — floating right */}
            <div className="absolute right-4 bottom-12 rounded-xl px-3 py-2 text-xs font-semibold"
              style={{ background: 'var(--navy-800)', color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              📐 Spacing Panel
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ACTION CARDS ══════════════════════════════ */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-8 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: '/new',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              ),
              iconBg: '#DBEAFE', iconColor: '#1D4ED8',
              badge: 'เริ่มต้น', badgeColor: '#1D4ED8', badgeBg: '#EFF6FF',
              title: 'สร้างบันทึกใหม่',
              desc: 'เริ่มร่างเอกสารด้วย AI หรือกรอกข้อมูลเอง',
            },
            {
              href: '/history',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              iconBg: '#D1FAE5', iconColor: '#059669',
              badge: 'ค้นหา', badgeColor: '#059669', badgeBg: '#ECFDF5',
              title: 'ประวัติบันทึกข้อความ',
              desc: 'ค้นหาและดูเอกสารงานที่เคยจัดทำผ่านมา',
            },
            {
              href: '/new',
              icon: <span className="text-2xl leading-none">✨</span>,
              iconBg: '#FFF7ED', iconColor: '#EA580C',
              badge: 'AI', badgeColor: '#C2410C', badgeBg: '#FFF7ED',
              title: 'AI ช่วยร่างเนื้อหา',
              desc: 'บอกบริบท AI ร่างเนื้อหา ๓ ภาคให้ทันที',
            },
            {
              href: '/new',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
              iconBg: '#F5F3FF', iconColor: '#7C3AED',
              badge: 'คู่มือ', badgeColor: '#6D28D9', badgeBg: '#F5F3FF',
              title: 'คู่มือ / ช่วยเหลือ',
              desc: 'ดูขั้นตอนและคำแนะนำการใช้งาน',
            },
          ].map(card => (
            <a key={card.title} href={card.href} className="action-card group flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: card.iconBg, color: card.iconColor }}>
                  {card.icon}
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: card.badgeBg, color: card.badgeColor }}>
                  {card.badge}
                </span>
              </div>
              <div>
                <p className="font-bold mb-1" style={{ color: 'var(--text-900)' }}>{card.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-600)' }}>{card.desc}</p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--blue)' }}>
                เริ่มใช้งาน
                <svg className="action-card-arrow w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════ */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-8 pb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-900)' }}>ฟีเจอร์หลักของระบบ</h2>
          <p style={{ color: 'var(--text-600)' }}>ครบเครื่องสำหรับงานสารบรรณราชการ</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-xl p-5 flex gap-4 items-start"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base font-bold"
                style={{ background: f.iconBg, color: f.iconColor }}>
                {f.icon}
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: 'var(--text-900)' }}>{f.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-600)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA BANNER ════════════════════════════════ */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-8 pb-16">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-700) 100%)', padding: '2.5rem 2rem' }}>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="text-5xl shrink-0">📋</div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white mb-2">พร้อมเริ่มใช้งานแล้ว</h2>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                สร้างบันทึกข้อความฉบับแรกได้เลย — ใช้เวลาไม่ถึง ๕ นาที
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href="/new"
                className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: '#fff', color: 'var(--navy-900)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                สร้างบันทึกใหม่
              </a>
              <a href="/history"
                className="inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                ดูประวัติ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════ */}
      <footer className="mt-auto" style={{ background: 'var(--navy-900)', color: 'rgba(255,255,255,0.6)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-bold text-white text-sm">ระบบบันทึกข้อความ</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                เทศบาลนครนครสวรรค์<br />
                ระบบสนับสนุนการจัดทำบันทึกข้อความราชการ
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="font-semibold text-white text-sm mb-3">เมนูหลัก</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'สร้างบันทึกใหม่', href: '/new' },
                  { label: 'ประวัติบันทึก', href: '/history' },
                ].map(link => (
                  <a key={link.label} href={link.href}
                    className="block transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Credits */}
            <div>
              <p className="font-semibold text-white text-sm mb-3">เกี่ยวกับระบบ</p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                พัฒนาโดย <span className="text-white font-medium">นักวิชาการคอมพิวเตอร์</span><br />
                เทศบาลนครนครสวรรค์
              </p>
              <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                &ldquo;เอกสารที่ดี เริ่มต้นจากระบบที่เชื่อถือได้&rdquo;
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} เทศบาลนครนครสวรรค์ · ระบบบันทึกข้อความราชการ
            </p>
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
              ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
