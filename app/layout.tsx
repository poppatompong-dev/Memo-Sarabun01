import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'ระบบบันทึกข้อความ — เทศบาลนครนครสวรรค์',
  description: 'ระบบจัดการบันทึกข้อความราชการ เทศบาลนครนครสวรรค์',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body>{children}</body>
    </html>
  )
}
