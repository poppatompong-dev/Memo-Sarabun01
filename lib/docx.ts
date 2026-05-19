import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import fs from 'fs'
import path from 'path'
import { toThaiDate } from './thai-date'

const TEMPLATE_PATH = path.join(process.cwd(), 'templates', 'บันทึกข้อความ_template.docx')

export interface MemoDocxData {
  สวนราชการ_กอง: string
  สวนราชการ_กลุมงาน: string
  เลขที: string
  วันที: string
  เรื่อง: string
  เรียน: string
  เรื่องเดิม: string
  ขอเท็จจริง: string
  ขอพิจารณา: string
  ชื่อผูลงนาม: string
  ตำแหนง: string
}

export function generateDocx(data: MemoDocxData & { doc_date: string }): Buffer {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error('ไม่พบไฟล์ template กรุณาแปลง แบบบันทึกข้อความ.doc เป็น .docx และวางที่ templates/บันทึกข้อความ_template.docx')
  }

  const content = fs.readFileSync(TEMPLATE_PATH, 'binary')
  const zip = new PizZip(content)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.render({
    สวนราชการ_กอง: data.สวนราชการ_กอง,
    สวนราชการ_กลุมงาน: data.สวนราชการ_กลุมงาน,
    เลขที: data.เลขที,
    วันที: toThaiDate(data.doc_date),
    เรื่อง: data.เรื่อง,
    เรียน: data.เรียน,
    เรื่องเดิม: data.เรื่องเดิม,
    ขอเท็จจริง: data.ขอเท็จจริง,
    ขอพิจารณา: data.ขอพิจารณา,
    ชื่อผูลงนาม: data.ชื่อผูลงนาม,
    ตำแหนง: data.ตำแหนง,
  })

  return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer
}

export function isTemplateReady(): boolean {
  return fs.existsSync(TEMPLATE_PATH)
}
