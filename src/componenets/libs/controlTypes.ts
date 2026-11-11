import type { ComponentStyle } from './componentStyle'

export type Variant =
  | 'primary' | 'secondary' | 'success' | 'danger'
  | 'warning' | 'info' | 'light' | 'dark'

export type Gap = 0 | 1 | 2 | 3 | 4 | 5

// Position props are read by the surrounding grid; other parents ignore them.
interface BaseControl {
  id?: string
  colno?: number
  rowno?: number
  colspan?: number
  rowspan?: number
  style?: ComponentStyle
}

// Validation for controls that take input. See libs/validation.ts.
interface RequiredRule {
  // true = the value must not be empty ('' / whitespace, null date/time, or no option selected);
  // for a switch it must be on.
  required?: boolean
  // Shown under the control instead of the default message.
  required_message?: string
}

// Ready-made formats for text: see TEXT_FORMATS in libs/validation.ts.
export type TextFormat = 'email' | 'phone_th' | 'thai_id' | 'postcode_th' | 'digits'

// Length and format checks for text controls. An empty value skips them (use `required`).
interface TextRules {
  // Characters, counted the way they are typed (each Thai vowel / tone mark is one).
  min_length?: number
  max_length?: number
  format?: TextFormat
  // A regular expression the whole value must match (no ^ / $ needed).
  pattern?: string
  min_length_message?: string
  max_length_message?: string
  // Replaces the message for `format` and `pattern`.
  pattern_message?: string
}

export type TextboxConfig = BaseControl & RequiredRule & TextRules & {
  type: 'textbox'
  label?: string
  value?: string
  databinding?: string
  placeholder?: string
  // 'password' hides the text and shows a แสดง/ซ่อน toggle button.
  input_type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  disabled?: boolean
}

export type DateConfig = BaseControl & RequiredRule & {
  type: 'date'
  label?: string
  // YYYYMMDD in Buddhist Era (25681118 = 18/11/2568); null or missing = empty.
  value?: number | null
  databinding?: string
  placeholder?: string
  disabled?: boolean
  // Year range offered in the picker (Buddhist Era).
  min_year?: number
  max_year?: number
}

// Two dates ("ตั้งแต่" / "ถึง"), each a YYYYMMDD Buddhist-era number or null.
// Bind both ends with databinding_from + databinding_to, or neither.
export type DateRangeConfig = BaseControl & RequiredRule & {
  type: 'date_range'
  label?: string
  value_from?: number | null
  value_to?: number | null
  databinding_from?: string
  databinding_to?: string
  placeholder?: string
  disabled?: boolean
  min_year?: number
  max_year?: number
}

export type TimeConfig = BaseControl & RequiredRule & {
  type: 'time'
  label?: string
  // HHMM (1430 = 14:30, 0 = 00:00); null or missing = empty.
  value?: number | null
  databinding?: string
  placeholder?: string
  disabled?: boolean
  // Minutes offered in the picker: every N minutes (1-60, default 1).
  minute_step?: number
}

export type DateTimeConfig = BaseControl & RequiredRule & {
  type: 'datetime'
  label?: string
  // YYYYMMDDHHMM in Buddhist Era (256811181430 = 18/11/2568 14:30); null or missing = empty.
  value?: number | null
  databinding?: string
  placeholder?: string
  disabled?: boolean
  min_year?: number
  max_year?: number
  minute_step?: number
}

export type TextareaConfig = BaseControl & RequiredRule & TextRules & {
  type: 'textarea'
  label?: string
  value?: string
  databinding?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}

export type SwitchConfig = BaseControl & RequiredRule & {
  type: 'switch'
  // Heading above the switch.
  label?: string
  // Text next to the switch, e.g. "ยินยอมให้เก็บข้อมูล".
  text?: string
  // 1 = on, 0 = off (default 0).
  value?: 0 | 1
  databinding?: string
  disabled?: boolean
}

export type LabelConfig = BaseControl & {
  type: 'label'
  text: string
  for?: string
}

export type DropdownConfig = BaseControl & RequiredRule & {
  type: 'dropdown'
  label?: string
  options?: string[]
  value?: number[]
  databinding?: string
  multiple?: boolean
}

export type CheckboxGroupConfig = BaseControl & RequiredRule & {
  type: 'checkbox_group'
  label?: string
  options?: string[]
  value?: number[]
  databinding?: string
  inline?: boolean
}

export type OptionConfig = BaseControl & RequiredRule & {
  type: 'option'
  label?: string
  options?: string[]
  value?: number[]
  databinding?: string
  inline?: boolean
}

export type ButtonConfig = BaseControl & {
  type: 'button'
  text: string
  variant?: Variant
  outline?: boolean
  disabled?: boolean
}

export type ContainerConfig = BaseControl & {
  type: 'container'
  gap?: Gap
  controls: ControlConfig[]
}

export type GridConfig = BaseControl & {
  type: 'grid'
  columns: number
  rows?: number
  gap?: Gap
  controls: ControlConfig[]
}

export type FlexConfig = BaseControl & {
  type: 'flex'
  is_horizontal: 0 | 1
  gap?: Gap
  wrap?: boolean
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  controls: ControlConfig[]
}

export interface AccordionItemConfig {
  title: string
  open?: boolean
  controls: ControlConfig[]
}

export type AccordionConfig = BaseControl & {
  type: 'accordion'
  always_open?: boolean
  items: AccordionItemConfig[]
}

export type CardConfig = BaseControl & {
  type: 'card'
  header?: string
  title?: string
  subtitle?: string
  text?: string
  footer?: string
  controls?: ControlConfig[]
}

export type BadgeConfig = BaseControl & {
  type: 'badge'
  text: string
  variant?: Variant
  pill?: boolean
}

export type ControlConfig =
  | TextboxConfig
  | DateConfig
  | DateRangeConfig
  | TimeConfig
  | DateTimeConfig
  | TextareaConfig
  | SwitchConfig
  | LabelConfig
  | DropdownConfig
  | CheckboxGroupConfig
  | OptionConfig
  | ButtonConfig
  | ContainerConfig
  | GridConfig
  | FlexConfig
  | AccordionConfig
  | CardConfig
  | BadgeConfig

export interface FormDocument {
  controls: ControlConfig[]
}

export interface StringField {
  type: 'string'
  value: string
}

export interface ChoiceField {
  type: 'number'
  is_array: 1
  options?: string[]
  value: number[]
}

export interface NumberField {
  type: 'number'
  is_array?: undefined
  value: number | null
}

// Values referenced by a control's `databinding` key.
export type FormData = Record<string, StringField | ChoiceField | NumberField>
