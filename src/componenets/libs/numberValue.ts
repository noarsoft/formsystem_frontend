// Helpers for the `number` control: what may be typed, how it parses, how it is shown.

// Keeps only what can be part of a number while typing: digits, one ".", and a leading "-".
// Commas (thousand separators) are dropped, and "-" only when negatives are allowed. With
// decimals > 0, extra digits after the "." are not taken. With decimals 0 the "." is kept, so
// "2.5" stays 2.5 and validation says "ต้องเป็นจำนวนเต็ม" (dropping the "." would turn it into 25).
export function sanitizeNumberText(text: string, decimals: number, allowNegative: boolean): string {
  const negative = allowNegative && text.trim().startsWith('-')
  let digits = text.replace(/[^\d.]/g, '')
  const dot = digits.indexOf('.')
  if (dot >= 0) {
    const whole = digits.slice(0, dot)
    const fraction = digits.slice(dot + 1).replace(/\./g, '')
    digits = `${whole}.${decimals === 0 ? fraction : fraction.slice(0, decimals)}`
  }
  return `${negative ? '-' : ''}${digits}`
}

// The number in typed text, or null when it is empty or not a number yet ("-", ".").
export function parseNumberText(text: string): number | null {
  const clean = text.replace(/,/g, '').trim()
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(clean)) return null
  return Number(clean)
}

// 1234.5 -> "1,234.5" (no trailing zeros added).
export function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: Math.min(decimals, 20), useGrouping: true })
}

// Number of digits after the decimal point (1.25 -> 2), tolerant of float noise.
export function decimalPlaces(value: number): number {
  for (let places = 0; places <= 20; places++) {
    const scaled = value * 10 ** places
    if (Math.abs(scaled - Math.round(scaled)) < 1e-9 * Math.max(1, Math.abs(scaled))) return places
  }
  return 21
}
