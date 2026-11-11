// Dates are stored as a number in Buddhist Era: YYYYMMDD, e.g. 25681118 = 18/11/2568.

export const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

export const weekdayLabels = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export const MIN_YEAR = 1000
export const MAX_YEAR = 9999

export interface DateParts {
  year: number
  month: number
  day: number
}

const BUDDHIST_OFFSET = 543

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year - BUDDHIST_OFFSET) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

// 0 = Sunday
export function firstWeekday(year: number, month: number): number {
  return new Date(Date.UTC(year - BUDDHIST_OFFSET, month - 1, 1)).getUTCDay()
}

export function toDateNumber({ year, month, day }: DateParts): number {
  return year * 10000 + month * 100 + day
}

export function parseDateNumber(value: unknown): DateParts | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  const year = Math.floor(value / 10000)
  const month = Math.floor(value / 100) % 100
  const day = value % 100
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12) return null
  if (day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

export function formatDateNumber(value: number): string {
  const parts = parseDateNumber(value)
  if (!parts) throw new Error(`${value} is not a valid YYYYMMDD Buddhist-era date`)
  const pad = (n: number, width: number) => String(n).padStart(width, '0')
  return `${pad(parts.day, 2)}/${pad(parts.month, 2)}/${pad(parts.year, 4)}`
}

export function todayParts(now: Date = new Date()): DateParts {
  return {
    year: now.getFullYear() + BUDDHIST_OFFSET,
    month: now.getMonth() + 1,
    day: now.getDate(),
  }
}
