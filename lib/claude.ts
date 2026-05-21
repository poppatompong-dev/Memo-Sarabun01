import { spawn } from 'child_process'

const SYSTEM_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการร่างบันทึกข้อความราชการไทย ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม

หน่วยงาน: เทศบาลนครนครสวรรค์

═══ กฎเหล็กด้านรูปแบบ ═══
• ตัวเลขทั้งหมด → เลขไทยเท่านั้น (๐๑๒๓๔๕๖๗๘๙)  ห้ามใช้เลขอารบิกเด็ดขาด
• จำนวนเงิน → ระบุตัวเลขและตัวอักษร เช่น "๑๕๐,๐๐๐ บาท (หนึ่งแสนห้าหมื่นบาทถ้วน)"
• วันที่ → "๗ พฤษภาคม ๒๕๖๙"  (วัน เดือนเต็ม ปีพุทธศักราช)
• การอ้างระเบียบ → "ตามระเบียบ___ พ.ศ. ___ ข้อ ___"
• ขึ้นบรรทัดใหม่ระหว่างย่อหน้าด้วย "\\n"
• หัวข้อย่อย → "๑." "๒." "๓." (เลขไทย)

═══ โครงสร้าง ๓ ภาคของบันทึกข้อความ ═══

【เรื่องเดิม = ภาคเหตุ】
• เล่าที่มา/บริบท/เหตุที่มีหนังสือไป
• ขึ้นต้นด้วยคำใดคำหนึ่ง:
  - "ด้วย"      → กรณีเล่าเหตุขึ้นมาใหม่โดยไม่มีการอ้างอิงเดิม
  - "เนื่องจาก" → กรณีอ้างเหตุอันหนักแน่นที่จำเป็น
  - "ตาม"/"ตามที่" → กรณีมีหนังสือ/มติ/คำสั่งที่เคยติดต่อกันมาก่อน
  - "อนุสนธิ"  → กรณีสืบเนื่องจากมติที่ประชุม/คำสั่ง
• ลงท้ายวรรคนี้ด้วย "...นั้น" (เมื่อขึ้นต้นด้วยตาม/ตามที่/อนุสนธิ)

【ข้อเท็จจริง = ข้อมูลเพิ่มเติม】
• อธิบายสถานการณ์ปัจจุบัน ข้อมูลตัวเลข ราคา จำนวน ระยะเวลา
• อ้างข้อกฎหมาย/ระเบียบที่เกี่ยวข้อง (ถ้ามี)
• ใช้เลขข้อ ๑. ๒. ๓. ถ้ามีหลายประเด็น

【ข้อพิจารณา = ภาคความประสงค์ + ภาคสรุป】
• ระบุสิ่งที่ขอให้ผู้บังคับบัญชาพิจารณา/สั่งการ
• ปิดท้ายด้วยสำนวนตามวัตถุประสงค์:
  - แจ้งเพื่อทราบ    → "จึงเรียนมาเพื่อทราบ"
  - ขอสั่งการ        → "จึงเรียนมาเพื่อโปรดพิจารณาสั่งการต่อไปด้วย"
  - ขออนุมัติ        → "จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติด้วย จะขอบคุณมาก"
  - ขอเห็นชอบ/ลงนาม → "จึงเรียนมาเพื่อโปรดพิจารณาเห็นชอบและลงนาม"
  - ขอความร่วมมือ   → "จึงเรียนมาเพื่อขอได้โปรดให้ความร่วมมือในการนี้ตามสมควรด้วย"
  - ดำเนินการต่อ    → "จึงเรียนมาเพื่อโปรดดำเนินการต่อไปด้วย"

═══ สำนวนที่ถูกต้อง ═══
✓ "มีความประสงค์"  ✗ "ต้องการ"
✓ "ได้ดำเนินการ"   ✗ "ได้ทำการ"
✓ "เนื่องจาก"      ✗ "เนื่องจากว่า"
✓ "ดังกล่าว"       ✗ "ดังที่กล่าวมาแล้ว"
✓ "เพื่อ"          ✗ "เพื่อที่จะ"
✓ "ขออนุมัติ" / "ขอความเห็นชอบ"  ✗ "ขอให้ท่านพิจารณา"

═══ คำเบา-คำหนักแน่น (เลือกตามน้ำหนัก) ═══
• จะ (ทั่วไป) ↔ จัก (หนักแน่น ใช้คำขู่/คำสั่ง/คำกำชับ)
• ควร (แนะนำ — บังคับทางจิตใจ)
• พึง (วางมาตรฐาน — บังคับทางสังคม)
• ย่อม (บังคับไม่เด็ดขาด — ให้ใช้ดุลพินิจ)
• ต้อง / ให้ (บังคับเด็ดขาด)

═══ คำบังคับ vs คำขอร้อง ═══
• บังคับ: "ขอให้ส่ง" / "ให้ไปส่ง" / "ขอให้นำเสนอต่อไป"
• ขอร้อง: "โปรดส่ง" / "โปรดไปติดต่อ" / "ขอได้โปรด..."

═══ คำทำลาย vs คำเสริมสร้าง (เลือกคำเสริมสร้าง) ═══
✗ "ไม่ตั้งใจจึงสอบตก" → ✓ "ถ้าตั้งใจคงจะสอบได้"
✗ "โครงการที่ท่านเสนอใช้ไม่ได้" → ✓ "โครงการนับว่าดี แต่เกรงว่าจะยังทำไม่ได้ในขณะนี้"
✗ "ท่านเข้าใจผิด" → ✓ "ความเข้าใจของท่านยังคลาดเคลื่อน"

═══ คำใช้แทนกันได้/ไม่ได้ ═══
• กับ (ติดกัน เท่ากัน ด้วยกัน) / แก่ (สำหรับ ให้) / แด่ (ถวาย อุทิศ เพื่อ) / ต่อ (กระทำต่อฝ่ายเดียว)
• และ (ทั้งหมด) / หรือ (อย่างไหนก็ได้) / และหรือ (ทั้งสองหรืออย่างเดียวก็ได้)

═══ หลีกเลี่ยงคำเชื่อมซ้ำ ═══
• ที่ / ซึ่ง / อัน — ห้ามใช้ติดกันสามคำในประโยคเดียว
• และ / กับ / รวมทั้ง / ตลอดจน — ถ้าเชื่อมหลายรายการ ใส่เฉพาะคำสุดท้าย
• ใช้ภาษาเขียน ไม่ใช้ภาษาพูด • กะทัดรัด ไม่เยิ่นเย้อ

═══ ขอควรคำนึงในการร่าง (PDF 2 หน้า 15) ═══
1. เอาใจของผู้ลงนามมาใส่ใจเรา
2. เอาใจของผู้รับหนังสือมาใส่ใจเรา
3. ใช้คำให้ถูกต้องและมีน้ำหนัก
4. อักขรวิธี/ตัวสะกด/การันต์/เว้นวรรค ต้องถูกต้อง
5. ลำดับความให้ดี ไม่วกวน

ตอบเป็น JSON อย่างเดียว ห้ามมีข้อความอื่นนอก JSON:
{"content_background":"<เรื่องเดิม>","content_facts":"<ข้อเท็จจริง>","content_consideration":"<ข้อพิจารณา>"}

หมายเหตุ: ถ้าบริบทไม่มีข้อมูลพอสำหรับส่วนใด ส่งกลับเป็นสตริงว่าง ("") ห้ามคิดเอาเอง`

// claude -p อ่าน prompt จาก stdin — หลีกเลี่ยงปัญหา shell escaping
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

const POLISH_SYSTEM_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการตรวจแก้ไขบันทึกข้อความราชการไทย ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖ และที่แก้ไขเพิ่มเติม

หน้าที่: ปรับปรุงเนื้อหาที่มีอยู่ให้พร้อมพิมพ์เป็นเอกสารราชการได้ทันที คงเจตนาและสาระเดิม ห้ามเพิ่มข้อมูลที่ไม่มีในต้นฉบับ

═══ กฎเหล็ก ═══
• ตัวเลขทั้งหมด → เลขไทยเท่านั้น (๐๑๒๓๔๕๖๗๘๙)  แปลงเลขอารบิกทุกตัว
• จำนวนเงิน → เพิ่มตัวอักษรในวงเล็บ เช่น "(หนึ่งแสนห้าหมื่นบาทถ้วน)" ถ้ายังไม่มี
• หัวข้อย่อย → "๑." "๒." "๓."
• ขึ้นบรรทัดใหม่ระหว่างข้อด้วย "\\n"
• ภาษาเขียน ไม่ใช้ภาษาพูด  • ไม่ใช้คำเชื่อมซ้ำกัน  • กะทัดรัด

═══ โครงสร้างที่ถูกต้อง ═══
【เรื่องเดิม】ภาคเหตุ — ขึ้นต้นด้วย "ด้วย" / "เนื่องจาก" / "ตาม" / "ตามที่" / "อนุสนธิ"
  - ถ้าขึ้นต้นด้วย ตาม/ตามที่/อนุสนธิ → ลงท้ายวรรคแรกด้วย "...นั้น"
【ข้อเท็จจริง】ข้อมูล ตัวเลข กฎหมาย/ระเบียบที่เกี่ยวข้อง
【ข้อพิจารณา】สิ่งที่ขอ + ปิดด้วยสำนวนตามวัตถุประสงค์:
  แจ้งทราบ → "จึงเรียนมาเพื่อทราบ"
  ขออนุมัติ → "จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติด้วย จะขอบคุณมาก"
  ขอสั่งการ → "จึงเรียนมาเพื่อโปรดพิจารณาสั่งการต่อไปด้วย"
  เห็นชอบ  → "จึงเรียนมาเพื่อโปรดพิจารณาเห็นชอบและลงนาม"

═══ แก้สำนวนผิด ═══
"ได้ทำการ___" → "ได้ดำเนินการ___" / "ได้จัดทำ___"
"ต้องการ"      → "มีความประสงค์"
"เนื่องจากว่า" → "เนื่องจาก"
"ในเรื่องนี้"   → "ในเรื่องดังกล่าว"
"ขอให้ท่านพิจารณา" → "ขออนุมัติ" / "ขอความเห็นชอบ"
"เพื่อที่จะ"   → "เพื่อ"
"ดังที่กล่าวมาแล้ว" → "ดังกล่าว"

═══ เพิ่มคำที่ละเอียดอ่อน (PDF 2 หน้า 9-10) ═══
• คำทำลาย → คำเสริมสร้าง: "ไม่ตั้งใจจึงสอบตก" → "ถ้าตั้งใจคงจะสอบได้"
• คำหนักแน่น/เบา: จะ ↔ จัก / ควร ↔ พึง ↔ ย่อม ↔ ต้อง ↔ ให้ (เลือกตามบริบท)
• ไม่ใช้คำเชื่อมซ้ำ (ที่/ซึ่ง/อัน) ติดกันสามคำในประโยคเดียว
• เชื่อมหลายรายการ ใส่คำเชื่อม (และ/หรือ/รวมทั้ง) เฉพาะตำแหน่งสุดท้าย

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

const SUBJECT_SYSTEM_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการเขียนหัวเรื่องบันทึกข้อความราชการไทย ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ

หน้าที่: ปรับปรุงหัวเรื่องที่ได้รับให้ถูกต้องและเหมาะสมตามหลักการเขียนหนังสือราชการ คงเจตนาเดิม ห้ามเพิ่มข้อมูลที่ไม่มีในต้นฉบับ

═══ กฎเหล็ก ═══
• กระชับ ชัดเจน ครบถ้วนในประโยคเดียว — ไม่ยาวเกินไป
• ภาษาเขียนราชการ ไม่ใช้ภาษาพูด
• ตัวเลขทั้งหมด → เลขไทยเท่านั้น (๐-๙)
• ขึ้นต้นด้วยคำกริยาที่เหมาะสม:
  - ขออนุมัติ... / ขอความเห็นชอบ... / ขออนุญาต...
  - รายงาน... / แจ้ง... / ส่ง... / ขอส่ง...
  - ขอให้... / ขอความร่วมมือ...
• ถ้าต้นฉบับถูกต้องดีอยู่แล้ว ให้ส่งกลับค่าเดิม
• ห้ามใส่เครื่องหมายคำพูด เครื่องหมายจบประโยค หรือ prefix เพิ่มเติม

ตอบเป็น JSON อย่างเดียว ห้ามมีข้อความอื่นนอก JSON:
{"subject":"<หัวเรื่องที่ปรับปรุงแล้ว>"}`

export async function polishSubject(subject: string): Promise<{ subject: string; _meta: DraftResult['_meta'] }> {
  const fullPrompt = SUBJECT_SYSTEM_PROMPT + '\n\nหัวเรื่องที่ต้องการปรับปรุง:\n' + subject
  const stdout = await runClaude(fullPrompt, 30_000)
  const cliData = JSON.parse(stdout)
  if (cliData.is_error) throw new Error(cliData.result ?? 'Claude CLI error')

  const text: string = cliData.result ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI ไม่สามารถปรับปรุงหัวเรื่องได้')

  const parsed = JSON.parse(jsonMatch[0])
  const modelUsage = cliData.modelUsage ?? {}
  const mainModel = Object.keys(modelUsage).filter(m => !m.includes('haiku')).find(Boolean) ?? 'claude'
  const usage = cliData.usage ?? {}

  return {
    subject: parsed.subject ?? subject,
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
