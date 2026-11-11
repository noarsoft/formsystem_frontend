import type { ComponentStyle } from './componentStyle'

export type Variant =
  | 'primary' | 'secondary' | 'success' | 'danger'
  | 'warning' | 'info' | 'light' | 'dark'

export type Gap = 0 | 1 | 2 | 3 | 4 | 5

// One condition on a data key; use exactly one of equals / not_equals / in / filled.
// Choice fields compare by option text (true when that option is selected).
export interface VisibleCondition {
  field: string
  equals?: string | number
  // The field has an answer and it is not this one.
  not_equals?: string | number
  in?: (string | number)[]
  // true = has an answer, false = still empty.
  filled?: boolean
}

// Position props are read by the surrounding grid; other parents ignore them.
interface BaseControl {
  id?: string
  // Show the control (and everything inside it) only when the condition holds; a list
  // means all must hold. Hidden controls are not validated; their data is kept.
  visible_if?: VisibleCondition | VisibleCondition[]
  colno?: number
  rowno?: number
  colspan?: number
  rowspan?: number
  style?: ComponentStyle
}

// Shared by every control that takes input.
interface InputRules {
  // true = the value must not be empty ('' / whitespace, null date/time, or no option selected);
  // for a switch it must be on.
  required?: boolean
  // Shown under the control instead of the default message.
  required_message?: string
  // Greyed out and cannot be changed or focused ("not usable now").
  disabled?: boolean
  // Looks normal and can be focused / copied, but cannot be changed ("view only").
  // Disabled and readonly controls are not validated: the user could not fix them.
  readonly?: boolean
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

export type TextboxConfig = BaseControl & InputRules & TextRules & {
  type: 'textbox'
  label?: string
  value?: string
  databinding?: string
  placeholder?: string
  // 'password' hides the text and shows a แสดง/ซ่อน toggle button.
  input_type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  disabled?: boolean
}

export type DateConfig = BaseControl & InputRules & {
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
export type DateRangeConfig = BaseControl & InputRules & {
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

export type NumberConfig = BaseControl & InputRules & {
  type: 'number'
  label?: string
  // A real number; null or missing = empty (0 is a value).
  value?: number | null
  databinding?: string
  placeholder?: string
  disabled?: boolean
  min?: number
  max?: number
  // Digits allowed after the decimal point; 0 = whole numbers only (default 0).
  decimals?: number
  // Shown after the box, e.g. "บาท", "กก." (display only).
  unit?: string
  min_message?: string
  max_message?: string
}

export type RatingConfig = BaseControl & InputRules & {
  type: 'rating'
  label?: string
  // A whole number from min to max; null or missing = not rated yet.
  value?: number | null
  databinding?: string
  // 'star' = ★★★★☆ (default), 'number' = a row of number buttons (e.g. 0-10 for NPS).
  display?: 'star' | 'number'
  // Score range (default 1-5). At most 21 steps.
  min?: number
  max?: number
  // Small text under the two ends, e.g. "ไม่พอใจ" … "พอใจมาก".
  min_label?: string
  max_label?: string
}

// One question (row) of a matrix: its answer is kept in its own data key, or inline in `value`.
export interface MatrixRowConfig {
  label: string
  databinding?: string
  // 0/1 per column (inline rows only).
  value?: number[]
}

// A grid of questions that share the same answer columns. Each row is stored like an
// `option` (one data key per row: { type: 'number', is_array: 1, options: columns, value }).
export type MatrixConfig = BaseControl & InputRules & {
  type: 'matrix'
  label?: string
  columns: string[]
  rows: MatrixRowConfig[]
  // true = any number of columns per row (checkboxes); default one per row.
  multiple?: boolean
}

export type TimeConfig = BaseControl & InputRules & {
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

export type DateTimeConfig = BaseControl & InputRules & {
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

export type TextareaConfig = BaseControl & InputRules & TextRules & {
  type: 'textarea'
  label?: string
  value?: string
  databinding?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}

export type SwitchConfig = BaseControl & InputRules & {
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

// "อื่น ๆ (โปรดระบุ)": when `option` (default: the last option) is selected, a text box
// appears for the details. Its text goes to `databinding` (a string field) or `value`.
// Selected with the text left blank fails validation ("กรุณาระบุ").
export interface OtherConfig {
  option?: string
  databinding?: string
  value?: string
  placeholder?: string
  required_message?: string
}

interface ChoiceOther {
  other?: OtherConfig
}

export type DropdownConfig = BaseControl & InputRules & ChoiceOther & {
  type: 'dropdown'
  label?: string
  options?: string[]
  value?: number[]
  databinding?: string
  multiple?: boolean
}

export type CheckboxGroupConfig = BaseControl & InputRules & ChoiceOther & {
  type: 'checkbox_group'
  label?: string
  options?: string[]
  value?: number[]
  databinding?: string
  inline?: boolean
}

export type OptionConfig = BaseControl & InputRules & ChoiceOther & {
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
  | NumberConfig
  | RatingConfig
  | MatrixConfig
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
