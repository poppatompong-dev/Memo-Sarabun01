const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙']

export function toThaiDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => THAI_DIGITS[parseInt(d)])
}

export function toThaiDate(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear() + 543
  return `${toThaiDigits(day)} ${THAI_MONTHS[month]} ${toThaiDigits(year)}`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function todayThai(): string {
  return toThaiDate(todayISO())
}
