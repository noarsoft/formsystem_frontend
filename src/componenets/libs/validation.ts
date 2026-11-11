import type { ControlConfig, FormData, FormDocument } from './controlTypes'
import { getChoiceState, getDateValue, getTextValue } from './controlValues'
import type { FieldValue } from './controlValues'

export const REQUIRED_TEXT_MESSAGE = 'กรุณากรอกข้อมูล'
export const REQUIRED_DATE_MESSAGE = 'กรุณาเลือกวันที่'
export const REQUIRED_CHOICE_MESSAGE = 'กรุณาเลือกอย่างน้อย 1 รายการ'

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
    case 'textarea':
      return checkRequired(config, getTextValue(config, data), REQUIRED_TEXT_MESSAGE)
    case 'date':
      return checkRequired(config, getDateValue(config, data), REQUIRED_DATE_MESSAGE)
    case 'dropdown':
      return checkRequired(
        config, getChoiceState(config, config.multiple ?? false, data).value, REQUIRED_CHOICE_MESSAGE,
      )
    case 'checkbox_group':
      return checkRequired(config, getChoiceState(config, true, data).value, REQUIRED_CHOICE_MESSAGE)
    case 'option':
      return checkRequired(config, getChoiceState(config, false, data).value, REQUIRED_CHOICE_MESSAGE)
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
