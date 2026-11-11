import type { ControlConfig, FormData, FormDocument, TextareaConfig, TextboxConfig, TextFormat } from './controlTypes'
import {
  getChoiceState, getDateRangeValue, getDateTimeValue, getDateValue, getSwitchValue, getTextValue, getTimeValue,
} from './controlValues'
import type { FieldValue } from './controlValues'

export const REQUIRED_TEXT_MESSAGE = 'กรุณากรอกข้อมูล'
export const REQUIRED_DATE_MESSAGE = 'กรุณาเลือกวันที่'
export const REQUIRED_TIME_MESSAGE = 'กรุณาเลือกเวลา'
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

// The error message for one control (reading bound values from data), or null when it is
// valid or takes no input. Containers are not walked; use validateForm for that.
export function validateControl(config: ControlConfig, data?: FormData): string | null {
  switch (config.type) {
    case 'textbox':
    case 'textarea': {
      // Order: required, then length, then format / pattern; the first failure is shown.
      const value = getTextValue(config, data)
      return checkRequired(config, value, REQUIRED_TEXT_MESSAGE) ?? textRuleError(config, value)
    }
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
      return checkRequired(
        config, getChoiceState(config, config.multiple ?? false, data).value, REQUIRED_CHOICE_MESSAGE,
      )
    case 'checkbox_group':
      return checkRequired(config, getChoiceState(config, true, data).value, REQUIRED_CHOICE_MESSAGE)
    case 'option':
      return checkRequired(config, getChoiceState(config, false, data).value, REQUIRED_CHOICE_MESSAGE)
    case 'switch':
      // A required switch must be on (e.g. a consent); off counts as empty.
      if (!config.required || getSwitchValue(config, data) === 1) return null
      return config.required_message ?? REQUIRED_SWITCH_MESSAGE
    default:
      return null
  }
}

function childGroups(config: ControlConfig): { path: string, controls: ControlConfig[] }[] {
  switch (config.type) {
    case 'container':
    case 'grid':
    case 'flex':
      return [{ path: 'controls', controls: config.controls }]
    case 'card':
      return [{ path: 'controls', controls: config.controls ?? [] }]
    case 'accordion':
      return config.items.map((item, index) => ({ path: `items[${index}].controls`, controls: item.controls }))
    default:
      return []
  }
}

// Every validation error in the form, in document order (including controls inside
// containers, cards and closed accordion items). An empty array means the form is valid.
export function validateForm(form: FormDocument, data?: FormData): ValidationError[] {
  const errors: ValidationError[] = []
  const walk = (controls: ControlConfig[], path: string) => {
    controls.forEach((config, index) => {
      const position = `${path}[${index}]`
      const message = validateControl(config, data)
      if (message !== null) errors.push({ id: config.id ?? position, message })
      for (const group of childGroups(config)) walk(group.controls, `${position}.${group.path}`)
    })
  }
  walk(form.controls, 'controls')
  return errors
}
