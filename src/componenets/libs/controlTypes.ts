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
  // true = the value must not be empty ('' / whitespace, null date, or no option selected).
  required?: boolean
  // Shown under the control instead of the default message.
  required_message?: string
}

export type TextboxConfig = BaseControl & RequiredRule & {
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

export type TextareaConfig = BaseControl & RequiredRule & {
  type: 'textarea'
  label?: string
  value?: string
  databinding?: string
  placeholder?: string
  rows?: number
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
  | TextareaConfig
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
