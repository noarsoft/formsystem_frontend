import type {
  AccordionConfig, CheckboxGroupConfig, ControlConfig, DateConfig, DropdownConfig, FormData,
  OptionConfig, PasswordConfig, TextareaConfig, TextboxConfig,
} from './controlTypes'
import { parseDateNumber } from './dateValue'

export type ChoiceControl = DropdownConfig | CheckboxGroupConfig | OptionConfig

function controlName(config: ControlConfig): string {
  return config.id ?? config.type
}

export function replaceAt<T>(list: T[], index: number, item: T): T[] {
  return list.map((current, i) => (i === index ? item : current))
}

function getField(config: ControlConfig, key: string, data?: FormData) {
  const field = data?.[key]
  if (!field) {
    throw new Error(`Control "${controlName(config)}" is bound to "${key}" but the data has no such field`)
  }
  return field
}

// A bound control always reads its value from the data; inline `value` is ignored.
export function getTextValue(
  config: TextboxConfig | PasswordConfig | TextareaConfig,
  data?: FormData,
): string {
  if (config.databinding !== undefined) {
    const field = getField(config, config.databinding, data)
    if (field.type !== 'string' || typeof field.value !== 'string') {
      throw new Error(`Data binding "${config.databinding}" must be a string field`)
    }
    return field.value
  }
  const value = config.value ?? ''
  if (typeof value !== 'string') {
    throw new Error(`Control "${controlName(config)}" value must be a string`)
  }
  return value
}

function validateChoice(name: string, options: unknown, value: unknown, multiple: boolean) {
  if (
    !Array.isArray(options) || !options.every((option) => typeof option === 'string') ||
    !Array.isArray(value) || value.length !== options.length ||
    !value.every((item) => item === 0 || item === 1) ||
    (!multiple && value.filter((item) => item === 1).length > 1)
  ) {
    throw new Error(
      `${name} must contain matching options and 0/1 values` +
      (multiple ? '' : ' with at most one selection'),
    )
  }
}

export interface ChoiceState {
  options: string[]
  value: number[]
}

// Bound options come from the data field when present, else from the control.
export function getChoiceState(config: ChoiceControl, multiple: boolean, data?: FormData): ChoiceState {
  if (config.databinding !== undefined) {
    const field = getField(config, config.databinding, data)
    if (field.type !== 'number' || field.is_array !== 1) {
      throw new Error(`Data binding "${config.databinding}" must be a number array field`)
    }
    const options = field.options ?? config.options
    validateChoice(`Data binding "${config.databinding}"`, options, field.value, multiple)
    return { options: options as string[], value: field.value }
  }
  const options = config.options
  const value = config.value ?? options?.map(() => 0)
  validateChoice(`Control "${controlName(config)}"`, options, value, multiple)
  return { options: options as string[], value: value as number[] }
}

export type FieldValue = string | number | number[] | null

export function updateData(data: FormData | undefined, key: string, value: FieldValue): FormData {
  const field = data?.[key]
  if (!data || !field) {
    throw new Error(`Data binding "${key}" does not exist`)
  }
  if (field.type === 'string' && typeof value === 'string') {
    return { ...data, [key]: { ...field, value } }
  }
  if (field.type === 'number' && field.is_array === 1 && Array.isArray(value)) {
    validateChoice(`Data binding "${key}"`, field.options ?? value.map(String), value, true)
    return { ...data, [key]: { ...field, value } }
  }
  if (field.type === 'number' && field.is_array !== 1 && (value === null || typeof value === 'number')) {
    return { ...data, [key]: { ...field, value } }
  }
  throw new Error(`Value does not match data binding "${key}"`)
}

// Returns the Buddhist-era YYYYMMDD number, or null when the date is empty.
export function getDateValue(config: DateConfig, data?: FormData): number | null {
  let name = `Control "${controlName(config)}"`
  let value: unknown = config.value ?? null
  if (config.databinding !== undefined) {
    const field = getField(config, config.databinding, data)
    if (field.type !== 'number' || field.is_array === 1) {
      throw new Error(`Data binding "${config.databinding}" must be a number field`)
    }
    name = `Data binding "${config.databinding}"`
    value = field.value ?? null
  }
  if (value !== null && !parseDateNumber(value)) {
    throw new Error(`${name} must be null or a valid YYYYMMDD Buddhist-era date`)
  }
  return value as number | null
}

export function toggleChoice(value: number[], index: number, multiple: boolean): number[] {
  if (multiple) {
    return value.map((item, i) => (i === index ? (item === 1 ? 0 : 1) : item))
  }
  return value.map((_, i) => (i === index ? 1 : 0))
}

export function toggleAccordionItem(config: AccordionConfig, index: number): AccordionConfig {
  const opening = !config.items[index]?.open
  return {
    ...config,
    items: config.items.map((item, i) => {
      if (i === index) return { ...item, open: opening }
      return opening && !config.always_open ? { ...item, open: false } : item
    }),
  }
}
