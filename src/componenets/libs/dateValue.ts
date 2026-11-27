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
  return `${pad(parts.day)}/${pad(parts.month)}/${pad(parts.year, 4)}`
}

// Picker year range: defaults to 100 years back and 20 ahead, and always includes the
// current year and the selected year.
export function yearRange(selectedYear: number | undefined, minYear?: number, maxYear?: number) {
  const currentYear = todayParts().year
  return {
    min: Math.max(MIN_YEAR, Math.min(minYear ?? currentYear - 100, selectedYear ?? Infinity)),
    max: Math.min(MAX_YEAR, Math.max(maxYear ?? currentYear + 20, selectedYear ?? -Infinity)),
  }
}

export function todayParts(now: Date = new Date()): DateParts {
  return {
    year: now.getFullYear() + BUDDHIST_OFFSET,
    month: now.getMonth() + 1,
    day: now.getDate(),
  }
}

// Times are stored as a number HHMM, e.g. 1430 = 14:30 (0 = 00:00).
export interface TimeParts {
  hour: number
  minute: number
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0')

export function toTimeNumber({ hour, minute }: TimeParts): number {
  return hour * 100 + minute
}

export function parseTimeNumber(value: unknown): TimeParts | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return null
  const hour = Math.floor(value / 100)
  const minute = value % 100
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

export function formatTimeNumber(value: number): string {
  const parts = parseTimeNumber(value)
  if (!parts) throw new Error(`${value} is not a valid HHMM time`)
  return `${pad(parts.hour)}:${pad(parts.minute)}`
}

export function nowTimeParts(now: Date = new Date()): TimeParts {
  return { hour: now.getHours(), minute: now.getMinutes() }
}

// Date-times are YYYYMMDDHHMM in Buddhist Era, e.g. 256811181430 = 18/11/2568 14:30.
export interface DateTimeParts extends DateParts, TimeParts {}

export function toDateTimeNumber(parts: DateTimeParts): number {
  return toDateNumber(parts) * 10000 + toTimeNumber(parts)
}

export function parseDateTimeNumber(value: unknown): DateTimeParts | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return null
  const date = parseDateNumber(Math.floor(value / 10000))
  const time = parseTimeNumber(value % 10000)
  return date && time ? { ...date, ...time } : null
}

export function formatDateTimeNumber(value: number): string {
  if (!parseDateTimeNumber(value)) throw new Error(`${value} is not a valid YYYYMMDDHHMM Buddhist-era date-time`)
  return `${formatDateNumber(Math.floor(value / 10000))} ${formatTimeNumber(value % 10000)}`
}

// Minutes offered by a picker: every `step` minutes, plus the current minute if it is off-step.
export function minuteOptions(step: number, current?: number): number[] {
  if (!Number.isInteger(step) || step < 1 || step > 60) {
    throw new Error(`minute_step must be an integer from 1 to 60, got ${step}`)
  }
  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step)
  if (current !== undefined && !minutes.includes(current)) minutes.push(current)
  return minutes.sort((a, b) => a - b)
}

export function roundTimeDown({ hour, minute }: TimeParts, step: number): TimeParts {
  return { hour, minute: minute - (minute % step) }
}
