import type {
  ControlConfig, FormData, FormDocument, NumberConfig, TextareaConfig, TextboxConfig, TextFormat,
} from './controlTypes'
import { decimalPlaces, formatNumber } from './numberValue'
import { isVisible, visibleSteps } from './visibility'
import {
  getChoiceState, getDateRangeValue, getOtherState, getDateTimeValue, getDateValue, getMatrixValues, getNumberFieldValue, getRatingValue, getSwitchValue, getTextValue,
  getTimeValue,
} from './controlValues'
import type { FieldValue } from './controlValues'

export const REQUIRED_TEXT_MESSAGE = 'กรุณากรอกข้อมูล'
export const REQUIRED_DATE_MESSAGE = 'กรุณาเลือกวันที่'
export const REQUIRED_TIME_MESSAGE = 'กรุณาเลือกเวลา'
export const REQUIRED_RATING_MESSAGE = 'กรุณาให้คะแนน'
export const REQUIRED_OTHER_MESSAGE = 'กรุณาระบุ'
export const requiredMatrixMessage = (missing: number) => `กรุณาตอบให้ครบทุกข้อ (ขาด ${missing} ข้อ)`
export const REQUIRED_DATETIME_MESSAGE = 'กรุณาเลือกวันและเวลา'
export const REQUIRED_DATE_RANGE_MESSAGE = 'กรุณาเลือกช่วงวันที่ให้ครบ'
export const DATE_RANGE_ORDER_MESSAGE = 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น'
export const REQUIRED_CHOICE_MESSAGE = 'กรุณาเลือกอย่างน้อย 1 รายการ'
export const REQUIRED_SWITCH_MESSAGE = 'กรุณาเปิดตัวเลือกนี้'

export interface ValidationError {
  // The control's id, or its position (e.g. "controls[0].controls[1]") when it has none.
  id: string
  message: string
}

// aria-* props for the element that holds a control's value; the message is `${id}-error`.
export function invalidProps(id: string, required?: boolean, error?: string) {
  return {
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}

// Thai national ID: 13 digits; the last is (11 - Σ digit[i] × (13 - i) for i = 0..11 mod 11) mod 10.
export function isValidThaiId(digits: string): boolean {
  if (!/^\d{13}$/.test(digits)) return false
  const sum = [...digits.slice(0, 12)].reduce((total, digit, i) => total + Number(digit) * (13 - i), 0)
  return (11 - (sum % 11)) % 10 === Number(digits[12])
}

// Dashes and spaces people type in phone numbers and IDs ("081-234-5678") are ignored when checking.
const withoutSeparators = (value: string) => value.replace(/[\s-]/g, '')

export const TEXT_FORMATS: Record<TextFormat, { name: string, message: string, test: (value: string) => boolean }> = {
  email: {
    name: 'อีเมล',
    message: 'อีเมลไม่ถูกต้อง',
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
  phone_th: {
    name: 'เบอร์มือถือ (10 หลัก)',
    message: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09',
    test: (value) => /^0[689]\d{8}$/.test(withoutSeparators(value)),
  },
  thai_id: {
    name: 'เลขบัตรประชาชน (13 หลัก)',
    message: 'เลขบัตรประชาชนไม่ถูกต้อง',
    test: (value) => isValidThaiId(withoutSeparators(value)),
  },
  postcode_th: {
    name: 'รหัสไปรษณีย์ (5 หลัก)',
    message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก',
    test: (value) => /^\d{5}$/.test(value.trim()),
  },
  digits: {
    name: 'ตัวเลขล้วน',
    message: 'กรอกได้เฉพาะตัวเลข',
    test: (value) => /^\d+$/.test(value),
  },
}

// Phone keyboards: digits for number formats, the @ keyboard for email.
export function inputModeFor(format: TextFormat | undefined): 'numeric' | 'tel' | 'email' | undefined {
  if (format === 'phone_th') return 'tel'
  if (format === 'email') return 'email'
  if (format === 'thai_id' || format === 'postcode_th' || format === 'digits') return 'numeric'
  return undefined
}

export const DEFAULT_PATTERN_MESSAGE = 'รูปแบบไม่ถูกต้อง'
export const minLengthMessage = (n: number) => `ต้องมีอย่างน้อย ${n} ตัวอักษร`
export const maxLengthMessage = (n: number) => `ต้องไม่เกิน ${n} ตัวอักษร`

// Characters as typed: code points, so each Thai vowel / tone mark counts as one.
export const textLength = (value: string) => [...value].length

function checkLengthSetting(name: string, key: string, n: number | undefined) {
  if (n !== undefined && (!Number.isInteger(n) || n < 0)) {
    throw new Error(`Control "${name}" ${key} must be an integer >= 0`)
  }
}

// Length, format and pattern checks for a non-empty text value (empty is left to `required`).
// A bad setting (unknown format, broken pattern, min > max) throws instead of being ignored.
export function textRuleError(config: TextboxConfig | TextareaConfig, value: string): string | null {
  const name = config.id ?? config.type
  const { min_length: min, max_length: max, format, pattern } = config
  checkLengthSetting(name, 'min_length', min)
  checkLengthSetting(name, 'max_length', max)
  if (min !== undefined && max !== undefined && min > max) {
    throw new Error(`Control "${name}" min_length (${min}) is greater than max_length (${max})`)
  }
  if (format !== undefined && !(format in TEXT_FORMATS)) {
    throw new Error(`Control "${name}" has an unknown format "${String(format)}"`)
  }
  let regex: RegExp | null = null
  if (pattern !== undefined) {
    try {
      regex = new RegExp(`^(?:${pattern})$`, 'u')
    } catch (error) {
      throw new Error(`Control "${name}" has an invalid pattern: ${(error as Error).message}`, { cause: error })
    }
  }

  if (value.trim() === '') return null
  const length = textLength(value)
  if (min !== undefined && length < min) return config.min_length_message ?? minLengthMessage(min)
  if (max !== undefined && length > max) return config.max_length_message ?? maxLengthMessage(max)
  if (format !== undefined && !TEXT_FORMATS[format].test(value)) {
    return config.pattern_message ?? TEXT_FORMATS[format].message
  }
  if (regex && !regex.test(value)) return config.pattern_message ?? DEFAULT_PATTERN_MESSAGE
  return null
}

export const INTEGER_MESSAGE = 'ต้องเป็นจำนวนเต็ม'
export const NOT_A_NUMBER_MESSAGE = 'กรุณากรอกตัวเลข'
export const decimalsMessage = (n: number) => `ทศนิยมได้ไม่เกิน ${n} ตำแหน่ง`
// Limits are shown exactly as set: 1500 -> "1,500", 1.5 -> "1.5".
const showLimit = (n: number) => formatNumber(n, decimalPlaces(n))
export const minValueMessage = (n: number) => `ต้องไม่น้อยกว่า ${showLimit(n)}`
export const maxValueMessage = (n: number) => `ต้องไม่เกิน ${showLimit(n)}`

// Checks the settings of a number control (throws when they are wrong) and returns its decimals.
export function numberSettings(config: NumberConfig): { decimals: number } {
  const name = config.id ?? config.type
  const decimals = config.decimals ?? 0
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 20) {
    throw new Error(`Control "${name}" decimals must be an integer from 0 to 20`)
  }
  for (const key of ['min', 'max'] as const) {
    const n = config[key]
    if (n !== undefined && (typeof n !== 'number' || !Number.isFinite(n))) {
      throw new Error(`Control "${name}" ${key} must be a number`)
    }
  }
  if (config.min !== undefined && config.max !== undefined && config.min > config.max) {
    throw new Error(`Control "${name}" min (${config.min}) is greater than max (${config.max})`)
  }
  return { decimals }
}

// Decimals, then min, then max, for a non-null value (empty is left to `required`).
export function numberRuleError(config: NumberConfig, value: number | null): string | null {
  const { decimals } = numberSettings(config)
  if (value === null) return null
  if (decimalPlaces(value) > decimals) return decimals === 0 ? INTEGER_MESSAGE : decimalsMessage(decimals)
  if (config.min !== undefined && value < config.min) return config.min_message ?? minValueMessage(config.min)
  if (config.max !== undefined && value > config.max) return config.max_message ?? maxValueMessage(config.max)
  return null
}

// '' / whitespace-only text, a null date and a choice with no 1 all count as empty.
export function isEmptyValue(value: FieldValue): boolean {
  if (value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return !value.includes(1)
  return false
}

function checkRequired(
  config: { required?: boolean, required_message?: string },
  value: FieldValue,
  defaultMessage: string,
): string | null {
  if (!config.required || !isEmptyValue(value)) return null
  return config.required_message ?? defaultMessage
}

// Disabled or readonly: the user cannot change it, so it is not validated.
export function isLocked(config: ControlConfig): boolean {
  return ('disabled' in config && config.disabled === true) || ('readonly' in config && config.readonly === true)
}

// The error message for one control (reading bound values from data), or null when it is
// valid or takes no input. Containers are not walked; use validateForm for that.
export function validateControl(config: ControlConfig, data?: FormData): string | null {
  if (isLocked(config)) return null
  switch (config.type) {
    case 'textbox':
    case 'textarea': {
      // Order: required, then length, then format / pattern; the first failure is shown.
      const value = getTextValue(config, data)
      return checkRequired(config, value, REQUIRED_TEXT_MESSAGE) ?? textRuleError(config, value)
    }
    case 'number': {
      const value = getNumberFieldValue(config, data)
      return checkRequired(config, value, REQUIRED_TEXT_MESSAGE) ?? numberRuleError(config, value)
    }
    case 'matrix': {
      // Every row must be answered.
      const missing = getMatrixValues(config, data).filter((value) => !value.includes(1)).length
      if (!config.required || missing === 0) return null
      return config.required_message ?? requiredMatrixMessage(missing)
    }
    case 'rating':
      return checkRequired(config, getRatingValue(config, data), REQUIRED_RATING_MESSAGE)
    case 'date':
      return checkRequired(config, getDateValue(config, data), REQUIRED_DATE_MESSAGE)
    case 'date_range': {
      const { from, to } = getDateRangeValue(config, data)
      // An end before the start is always an error, required or not.
      if (from !== null && to !== null && to < from) return DATE_RANGE_ORDER_MESSAGE
      if (config.required && (from === null || to === null)) {
        return config.required_message ?? REQUIRED_DATE_RANGE_MESSAGE
      }
      return null
    }
    case 'time':
      return checkRequired(config, getTimeValue(config, data), REQUIRED_TIME_MESSAGE)
    case 'datetime':
      return checkRequired(config, getDateTimeValue(config, data), REQUIRED_DATETIME_MESSAGE)
    case 'dropdown':
    case 'checkbox_group':
    case 'option': {
      const multiple = config.type === 'checkbox_group' || (config.type === 'dropdown' && (config.multiple ?? false))
      const { options, value } = getChoiceState(config, multiple, data)
      // "อื่น ๆ" selected with nothing typed is incomplete, required or not.
      const other = getOtherState(config, options, value, data)
      return checkRequired(config, value, REQUIRED_CHOICE_MESSAGE)
        ?? (other?.selected && other.text.trim() === '' ? config.other?.required_message ?? REQUIRED_OTHER_MESSAGE : null)
    }
    case 'switch':
      // A required switch must be on (e.g. a consent); off counts as empty.
      if (!config.required || getSwitchValue(config, data) === 1) return null
      return config.required_message ?? REQUIRED_SWITCH_MESSAGE
    default:
      return null
  }
}

function childGroups(config: ControlConfig, data?: FormData): { path: string, controls: ControlConfig[] }[] {
  switch (config.type) {
    case 'container':
    case 'grid':
    case 'flex':
      return [{ path: 'controls', controls: config.controls }]
    case 'card':
      return [{ path: 'controls', controls: config.controls ?? [] }]
    case 'accordion':
      return config.items.map((item, index) => ({ path: `items[${index}].controls`, controls: item.controls }))
    case 'steps':
      // Every page that is not skipped by its visible_if.
      return visibleSteps(config, data).map((index) => ({ path: `steps[${index}].controls`, controls: config.steps[index].controls }))
    default:
      return []
  }
}

// Every validation error in the form, in document order (including controls inside
// containers, cards and closed accordion items). Controls hidden by visible_if, and
// everything inside them, are skipped. An empty array means the form is valid.
export function validateForm(form: FormDocument, data?: FormData): ValidationError[] {
  const errors: ValidationError[] = []
  const walk = (controls: ControlConfig[], path: string) => {
    controls.forEach((config, index) => {
      const position = `${path}[${index}]`
      if (!isVisible(config, data)) return
      const message = validateControl(config, data)
      if (message !== null) errors.push({ id: config.id ?? position, message })
      for (const group of childGroups(config, data)) walk(group.controls, `${position}.${group.path}`)
    })
  }
  walk(form.controls, 'controls')
  return errors
}
