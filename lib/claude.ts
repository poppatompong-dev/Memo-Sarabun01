import { spawn } from 'child_process'

const SYSTEM_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการเขียนหนังสือราชการไทย ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526 และที่แก้ไขเพิ่มเติม (ฉบับที่ 4) พ.ศ. 2564

หน่วยงาน: เทศบาลนครนครสวรรค์

หลักการเขียนบันทึกข้อความ (ระเบียบสารบรรณ):
- ใช้ภาษาราชการ สุภาพ กระชับ ตรงประเด็น เป็นทางการ
- ตัวเลขทั้งหมดในเนื้อหาต้องเป็น "เลขไทย" (๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙) เท่านั้น ห้ามใช้เลขอารบิก
- จำนวนเงิน: ระบุทั้งตัวเลขและตัวอักษร เช่น "๑๕๐,๐๐๐ บาท (หนึ่งแสนห้าหมื่นบาทถ้วน)"
- วันที่: รูปแบบ "๗ พฤษภาคม ๒๕๖๙" (วัน เดือน ปี พ.ศ. เป็นเลขไทย)
- การอ้างถึงระเบียบ/กฎหมาย: "ตามระเบียบ___ พ.ศ. ___ ข้อ ___"
- ขึ้นบรรทัดใหม่ระหว่างย่อหน้าด้วย "\\n"
- เริ่มหัวข้อย่อยด้วยเลขไทย เช่น "๑." "๒." "๓."

โครงสร้างแต่ละส่วน:
- เรื่องเดิม: อ้างอิงเอกสาร มติ คำสั่ง หรือกฎระเบียบที่เกี่ยวข้อง เขียนเป็นข้อๆ (๑., ๒., ...) เริ่มประโยคด้วย "ตามที่..." หรือ "อ้างถึง..."
- ข้อเท็จจริง: อธิบายสาระสำคัญ รายละเอียด ข้อมูลประกอบ ตัวเลข จำนวน ราคา ระยะเวลา
- ข้อพิจารณา: เสนอแนวทาง ขออนุมัติ/ความเห็นชอบ พร้อมอ้างอำนาจตามระเบียบ ปิดท้ายอย่างชัดเจน

สำนวนที่ถูกต้อง (เลือกใช้ตามบริบท):
- "ขออนุมัติ" / "ขอความเห็นชอบ" (ไม่ใช่ "ขอให้ท่านพิจารณา")
- "มีความประสงค์" (ไม่ใช่ "ต้องการ")
- "เนื่องจาก" (ไม่ใช่ "เนื่องจากว่า")
- "เพื่อ" (ไม่ใช่ "เพื่อที่จะ")
- "ได้ดำเนินการ" / "ได้จัดทำ" (ไม่ใช่ "ได้ทำการ")
- "ดังกล่าว" (ไม่ใช่ "ดังที่กล่าวมาแล้ว")

ตอบเป็น JSON อย่างเดียว ห้ามมีข้อความอื่นนอก JSON รูปแบบ:
{"content_background":"<เรื่องเดิม>","content_facts":"<ข้อเท็จจริง>","content_consideration":"<ข้อพิจารณา>"}

หมายเหตุ: ถ้าบริบทไม่มีข้อมูลพอสำหรับส่วนใด ส่งกลับเป็นสตริงว่าง ("") ห้ามคิดเอาเอง`

// claude -p (ไม่มี argument) อ่าน prompt จาก stdin — หลีกเลี่ยงปัญหา shell escaping
function runClaude(prompt: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p', '--output-format', 'json'], {
      shell: true,
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (d: Buffer) => { stdout += d.toString('utf8') })
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString('utf8') })

    const timer = setTimeout(() => {
      child.kill()
      reject(new Error(`Claude timed out after ${timeoutMs / 1000}s`))
    }, timeoutMs)

    child.on('close', (code: number | null) => {
      clearTimeout(timer)
      const text = stdout.trim()
      if (text.startsWith('{')) {
        resolve(text)
      } else {
        reject(new Error(stderr.trim() || text || `Claude exited with code ${code}`))
      }
    })

    child.on('error', (e: Error) => {
      clearTimeout(timer)
      reject(e)
    })

    child.stdin.write(prompt, 'utf8')
    child.stdin.end()
  })
}

export interface DraftResult {
  content_background: string
  content_facts: string
  content_consideration: string
  _meta: {
    model: string
    input_tokens: number
    output_tokens: number
    stop_reason: string
  }
}

export async function draftMemoContent(params: {
  subject: string
  department: string
  division: string
  recipient: string
  context: string
}): Promise<DraftResult> {
  const userPrompt = `กรุณาร่างบันทึกข้อความสำหรับ:
เรื่อง: ${params.subject}
ส่วนราชการ: ${params.department} ${params.division}
เรียน: ${params.recipient}
บริบท/ความต้องการ: ${params.context}`

  const fullPrompt = SYSTEM_PROMPT + '\n\n' + userPrompt

  const stdout = await runClaude(fullPrompt, 120_000)
  const cliData = JSON.parse(stdout)
  if (cliData.is_error) throw new Error(cliData.result ?? 'Claude CLI error')

  const text: string = cliData.result ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI ไม่สามารถสร้างเนื้อหาได้')

  const parsed = JSON.parse(jsonMatch[0])

  const modelUsage = cliData.modelUsage ?? {}
  const mainModel = Object.keys(modelUsage)
    .filter(m => !m.includes('haiku'))
    .find(Boolean) ?? 'claude'
  const usage = cliData.usage ?? {}

  return {
    ...parsed,
    _meta: {
      model: mainModel,
      input_tokens: usage.input_tokens ?? 0,
      output_tokens: usage.output_tokens ?? 0,
      stop_reason: cliData.stop_reason ?? 'end_turn',
    },
  }
}

const POLISH_SYSTEM_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการตรวจแก้ไขหนังสือราชการไทย ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526 และที่แก้ไขเพิ่มเติม (ฉบับที่ 4) พ.ศ. 2564

หน้าที่: ปรับปรุงเนื้อหาที่มีอยู่ ให้พร้อมพิมพ์เป็นเอกสารราชการได้ทันที โดย:
- ภาษาราชการ สุภาพ เป็นทางการ ไม่กำกวม
- ไวยากรณ์ถูกต้อง เว้นวรรคถูกตำแหน่ง
- กระชับ ตัดคำซ้ำ คำเกินจำเป็น
- สอดคล้องกับระเบียบสารบรรณและระเบียบที่เกี่ยวข้อง
- คงเจตนาและสาระเดิม ห้ามเพิ่มข้อมูลที่ไม่มีในต้นฉบับ
- ตัวเลขทั้งหมดต้องเป็น "เลขไทย" (๐-๙) เท่านั้น แปลงเลขอารบิกในต้นฉบับเป็นเลขไทย
- จำนวนเงิน: เพิ่มตัวอักษรในวงเล็บ "(หนึ่งแสนห้าหมื่นบาทถ้วน)" ถ้ายังไม่มี
- หัวข้อย่อย: ใช้ "๑." "๒." "๓." (เลขไทย)
- ขึ้นบรรทัดใหม่ระหว่างข้อด้วย "\\n"

แก้สำนวน:
- "ได้ทำการ___" → "ได้ดำเนินการ___" / "ได้จัดทำ___"
- "ต้องการ" → "มีความประสงค์"
- "เนื่องจากว่า" → "เนื่องจาก"
- "ในเรื่องนี้" → "ในเรื่องดังกล่าว"

หากส่วนใดว่างเปล่าในต้นฉบับ ส่งกลับเป็นสตริงว่าง ("") ห้ามคิดเอาเอง

ตอบเป็น JSON อย่างเดียว ห้ามมีข้อความอื่นนอก JSON:
{"content_background":"...","content_facts":"...","content_consideration":"..."}`

export async function polishMemoContent(params: {
  subject: string
  content_background: string
  content_facts: string
  content_consideration: string
}): Promise<DraftResult> {
  const userPrompt = `กรุณาปรับปรุงเนื้อหาบันทึกข้อความต่อไปนี้ให้ถูกต้องตามหลักการเขียนหนังสือราชการ

เรื่อง: ${params.subject}

เรื่องเดิม (ปัจจุบัน):
${params.content_background || '(ว่าง)'}

ข้อเท็จจริง (ปัจจุบัน):
${params.content_facts || '(ว่าง)'}

ข้อพิจารณา (ปัจจุบัน):
${params.content_consideration || '(ว่าง)'}`

  const fullPrompt = POLISH_SYSTEM_PROMPT + '\n\n' + userPrompt
  const stdout = await runClaude(fullPrompt, 120_000)
  const cliData = JSON.parse(stdout)
  if (cliData.is_error) throw new Error(cliData.result ?? 'Claude CLI error')

  const text: string = cliData.result ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI ไม่สามารถปรับปรุงเนื้อหาได้')

  const parsed = JSON.parse(jsonMatch[0])
  const modelUsage = cliData.modelUsage ?? {}
  const mainModel = Object.keys(modelUsage).filter(m => !m.includes('haiku')).find(Boolean) ?? 'claude'
  const usage = cliData.usage ?? {}

  return {
    ...parsed,
    _meta: {
      model: mainModel,
      input_tokens: usage.input_tokens ?? 0,
      output_tokens: usage.output_tokens ?? 0,
      stop_reason: cliData.stop_reason ?? 'end_turn',
    },
  }
}

export async function testConnection(): Promise<{
  ok: boolean
  model?: string
  error?: string
}> {
  try {
    const stdout = await runClaude('ตอบว่า พร้อม เท่านั้น', 30_000)
    const data = JSON.parse(stdout)
    if (data.is_error) throw new Error(data.result)
    const modelUsage = data.modelUsage ?? {}
    const mainModel = Object.keys(modelUsage).filter(m => !m.includes('haiku')).find(Boolean) ?? 'claude'
    return { ok: true, model: mainModel }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
