// Pure helpers for the Demo page's form editor: add a control to the grid, remove one.
import type { ControlConfig, FormData, FormDocument, GridConfig, TextFormat } from '../componenets/libs/controlTypes'

export const ADDABLE_TYPES = [
  { type: 'textbox', name: 'ช่องข้อความ (textbox)' },
  { type: 'textarea', name: 'ข้อความหลายบรรทัด (textarea)' },
  { type: 'date', name: 'วันที่ (date)' },
  { type: 'date_range', name: 'ช่วงวันที่ (date_range)' },
  { type: 'time', name: 'เวลา (time)' },
  { type: 'datetime', name: 'วันและเวลา (datetime)' },
  { type: 'dropdown', name: 'ดรอปดาวน์ (dropdown)' },
  { type: 'checkbox_group', name: 'ติ๊กได้หลายข้อ (checkbox_group)' },
  { type: 'option', name: 'เลือกข้อเดียว (option)' },
  { type: 'switch', name: 'สวิตช์ (switch)' },
  { type: 'label', name: 'ข้อความกำกับ (label)' },
] as const

export type AddableType = (typeof ADDABLE_TYPES)[number]['type']

export const CHOICE_TYPES: readonly AddableType[] = ['dropdown', 'checkbox_group', 'option']

export interface Cell {
  colno: number
  rowno: number
}

export interface NewControl {
  type: AddableType
  label: string
  required: boolean
  // Choice controls only.
  options: string[]
  cell: Cell
  // textbox only: a ready-made format such as phone_th.
  format?: TextFormat
}

// The editor works on the first grid at the top of the form.
export function findGrid(form: FormDocument): { index: number, grid: GridConfig } {
  const index = form.controls.findIndex((control) => control.type === 'grid')
  if (index < 0) throw new Error('The demo editor needs a grid at the top level of the form')
  return { index, grid: form.controls[index] as GridConfig }
}

// Cells of the grid not covered by any positioned child (spans included).
export function freeCells(grid: GridConfig): Cell[] {
  const rows = grid.rows ?? 1
  const used = new Set<string>()
  for (const child of grid.controls) {
    if (child.colno === undefined || child.rowno === undefined) continue
    for (let c = child.colno; c < child.colno + (child.colspan ?? 1); c++) {
      for (let r = child.rowno; r < child.rowno + (child.rowspan ?? 1); r++) used.add(`${c},${r}`)
    }
  }
  const cells: Cell[] = []
  for (let rowno = 0; rowno < rows; rowno++) {
    for (let colno = 0; colno < grid.columns; colno++) {
      if (!used.has(`${colno},${rowno}`)) cells.push({ colno, rowno })
    }
  }
  return cells
}

function children(control: ControlConfig): ControlConfig[] {
  switch (control.type) {
    case 'container':
    case 'grid':
    case 'flex':
      return control.controls
    case 'card':
      return control.controls ?? []
    case 'accordion':
      return control.items.flatMap((item) => item.controls)
    default:
      return []
  }
}

function walk(controls: ControlConfig[], visit: (control: ControlConfig) => void) {
  for (const control of controls) {
    visit(control)
    walk(children(control), visit)
  }
}

// Data keys a control (and everything inside it) reads or writes.
export function bindingsOf(controls: ControlConfig[]): string[] {
  const keys: string[] = []
  walk(controls, (control) => {
    for (const key of ['databinding', 'databinding_from', 'databinding_to'] as const) {
      const value = (control as Partial<Record<typeof key, string>>)[key]
      if (value !== undefined) keys.push(value)
    }
  })
  return keys
}

// type_1, type_2, … : the first id not used by a control or a data key.
export function uniqueId(form: FormDocument, data: FormData, type: string): string {
  const taken = new Set(Object.keys(data))
  walk(form.controls, (control) => {
    if (control.id !== undefined) taken.add(control.id)
  })
  for (let n = 1; ; n++) {
    const id = `${type}_${n}`
    if (![id, `${id}_from`, `${id}_to`].some((key) => taken.has(key))) return id
  }
}

function newControl(input: NewControl, id: string): { control: ControlConfig, fields: FormData } {
  const { type, label, required, cell } = input
  const base = { id, label, ...(required ? { required: true } : {}), ...cell }
  switch (type) {
    case 'textbox':
      return {
        control: { ...base, type, databinding: id, ...(input.format ? { format: input.format } : {}) },
        fields: { [id]: { type: 'string', value: '' } },
      }
    case 'textarea':
      return { control: { ...base, type, databinding: id }, fields: { [id]: { type: 'string', value: '' } } }
    case 'date':
    case 'time':
    case 'datetime':
      return { control: { ...base, type, databinding: id }, fields: { [id]: { type: 'number', value: null } } }
    case 'switch':
      return { control: { ...base, type, databinding: id }, fields: { [id]: { type: 'number', value: 0 } } }
    case 'date_range':
      return {
        control: { ...base, type, databinding_from: `${id}_from`, databinding_to: `${id}_to` },
        fields: {
          [`${id}_from`]: { type: 'number', value: null },
          [`${id}_to`]: { type: 'number', value: null },
        },
      }
    case 'dropdown':
    case 'checkbox_group':
    case 'option':
      if (input.options.length === 0) throw new Error('A choice control needs at least one option')
      return {
        control: { ...base, type, databinding: id },
        fields: { [id]: { type: 'number', is_array: 1, options: input.options, value: input.options.map(() => 0) } },
      }
    case 'label':
      return { control: { type: 'label', id, text: label, ...cell }, fields: {} }
  }
}

// Adds the control to the grid cell (a row past the last one grows the grid) and creates its
// data keys. Returns new objects; the inputs are not changed.
export function addControl(form: FormDocument, data: FormData, input: NewControl) {
  const { index, grid } = findGrid(form)
  const { colno, rowno } = input.cell
  if (!Number.isInteger(colno) || colno < 0 || colno >= grid.columns || !Number.isInteger(rowno) || rowno < 0) {
    throw new Error(`Cell (colno ${colno}, rowno ${rowno}) is outside the grid`)
  }
  const rows = grid.rows ?? 1
  if (rowno < rows && !freeCells(grid).some((cell) => cell.colno === colno && cell.rowno === rowno)) {
    throw new Error(`Cell (colno ${colno}, rowno ${rowno}) is already used`)
  }
  const id = uniqueId(form, data, input.type)
  const { control, fields } = newControl(input, id)
  const nextGrid: GridConfig = {
    ...grid,
    rows: Math.max(rows, rowno + 1),
    controls: [...grid.controls, control],
  }
  return {
    id,
    form: { ...form, controls: form.controls.map((c, i) => (i === index ? nextGrid : c)) },
    data: { ...data, ...fields },
  }
}

export interface ListedControl {
  // Indexes from the grid's controls down through nested `controls`.
  path: number[]
  depth: number
  control: ControlConfig
}

// Every control inside the grid, parents before their children.
export function listControls(form: FormDocument): ListedControl[] {
  const list: ListedControl[] = []
  const visit = (controls: ControlConfig[], path: number[]) => {
    controls.forEach((control, i) => {
      list.push({ path: [...path, i], depth: path.length, control })
      if (control.type === 'container' || control.type === 'grid' || control.type === 'flex' || control.type === 'card') {
        visit(control.controls ?? [], [...path, i])
      }
    })
  }
  visit(findGrid(form).grid.controls, [])
  return list
}

function removeAt(controls: ControlConfig[], path: number[]): { controls: ControlConfig[], removed: ControlConfig } {
  const [i, ...rest] = path
  const target = controls[i]
  if (target === undefined) throw new Error(`No control at path ${path.join('.')}`)
  if (rest.length === 0) return { controls: controls.filter((_, j) => j !== i), removed: target }
  if (!('controls' in target) || target.controls === undefined) {
    throw new Error(`Control at path ${path.join('.')} has no children`)
  }
  const inner = removeAt(target.controls, rest)
  return { controls: controls.map((c, j) => (j === i ? { ...target, controls: inner.controls } as ControlConfig : c)), removed: inner.removed }
}

// Removes the control at `path` (with everything inside it) and the data keys that no
// remaining control uses.
export function removeControl(form: FormDocument, data: FormData, path: number[]) {
  const { index, grid } = findGrid(form)
  const { controls, removed } = removeAt(grid.controls, path)
  const nextForm = { ...form, controls: form.controls.map((c, i) => (i === index ? { ...grid, controls } : c)) }
  const stillUsed = new Set(bindingsOf(nextForm.controls))
  const nextData = Object.fromEntries(
    Object.entries(data).filter(([key]) => stillUsed.has(key) || !bindingsOf([removed]).includes(key)),
  ) as FormData
  return { form: nextForm, data: nextData }
}
