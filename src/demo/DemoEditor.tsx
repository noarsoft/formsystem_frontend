import { useState } from 'react'
import FormBuilder from '../componenets/libs/Formbuilder'
import type { ControlConfig, FormData, FormDocument } from '../componenets/libs/controlTypes'
import { validateForm } from '../componenets/libs/validation'
import {
  addControl, ADDABLE_TYPES, CHOICE_TYPES, findGrid, freeCells, listControls, removeControl,
} from './editor'
import type { Cell, ListedControl } from './editor'

interface DemoEditorProps {
  form: FormDocument
  data: FormData
  onChange: (form: FormDocument, data: FormData) => void
}

const cellKey = (cell: Cell) => `${cell.colno},${cell.rowno}`
const oneHot = (count: number, index: number) => Array.from({ length: count }, (_, i) => (i === index ? 1 : 0))

function describe(control: ControlConfig): string {
  if ('label' in control && control.label) return control.label
  if ('text' in control && control.text) return control.text
  if ('title' in control && control.title) return control.title
  return control.id ?? '(ไม่มีชื่อ)'
}

function position({ control, depth }: ListedControl): string {
  if (depth > 0) return 'อยู่ในกล่องด้านบน'
  if (control.colno === undefined || control.rowno === undefined) return 'วางอัตโนมัติ'
  return `แถว ${control.rowno + 1} · คอลัมน์ ${control.colno + 1}`
}

// Add a control to a free grid cell, or remove any control in the grid. Uses FormBuilder itself
// for the "add" fields, so they get the same controls, theme and required checks.
export default function DemoEditor({ form, data, onChange }: DemoEditorProps) {
  const [typeIndex, setTypeIndex] = useState(0)
  const [label, setLabel] = useState('')
  const [optionsText, setOptionsText] = useState('')
  const [cell, setCell] = useState<string | null>(null)
  const [required, setRequired] = useState<0 | 1>(0)
  const [showErrors, setShowErrors] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  // Bumped after a successful add to remount the fields, so cleared fields don't show errors.
  const [round, setRound] = useState(0)

  const { grid } = findGrid(form)
  const rows = grid.rows ?? 1
  const cells = [
    ...freeCells(grid).map((c) => ({ cell: c, name: `แถว ${c.rowno + 1} · คอลัมน์ ${c.colno + 1}` })),
    ...Array.from({ length: grid.columns }, (_, colno) => ({
      cell: { colno, rowno: rows },
      name: `แถว ${rows + 1} (แถวใหม่) · คอลัมน์ ${colno + 1}`,
    })),
  ]
  const cellIndex = cells.findIndex((c) => cellKey(c.cell) === cell)
  const type = ADDABLE_TYPES[typeIndex].type
  const isChoice = CHOICE_TYPES.includes(type)
  const isLabel = type === 'label'

  const editorForm: FormDocument = {
    controls: [{
      type: 'grid', id: 'editor_grid', columns: 2, rows: 3, gap: 3,
      controls: [
        { type: 'dropdown', id: 'new_type', label: 'ชนิด', databinding: 'new_type', required: true, colno: 0, rowno: 0 },
        {
          type: 'dropdown', id: 'new_cell', label: 'ตำแหน่งในตาราง', databinding: 'new_cell', required: true,
          required_message: 'กรุณาเลือกตำแหน่ง', colno: 1, rowno: 0,
        },
        {
          type: 'textbox', id: 'new_label', label: isLabel ? 'ข้อความ' : 'ชื่อช่อง (label)', databinding: 'new_label',
          required: true, colno: 0, rowno: 1,
        },
        ...(isChoice ? [{
          type: 'textbox' as const, id: 'new_options', label: 'ตัวเลือก (คั่นด้วย ,)', placeholder: 'เช่น ชาย, หญิง',
          databinding: 'new_options', required: true, colno: 1, rowno: 1,
        }] : []),
        ...(isLabel ? [] : [{
          type: 'switch' as const, id: 'new_required', text: 'บังคับกรอก (required)', databinding: 'new_required',
          colno: 0, rowno: 2,
        }]),
      ],
    }],
  }
  const editorData: FormData = {
    new_type: { type: 'number', is_array: 1, options: ADDABLE_TYPES.map((t) => t.name), value: oneHot(ADDABLE_TYPES.length, typeIndex) },
    new_cell: { type: 'number', is_array: 1, options: cells.map((c) => c.name), value: oneHot(cells.length, cellIndex) },
    new_label: { type: 'string', value: label },
    new_options: { type: 'string', value: optionsText },
    new_required: { type: 'number', value: required },
  }

  const onEditorData = (next: FormData) => {
    const pick = (key: string) => {
      const field = next[key]
      return field.type === 'number' && field.is_array === 1 ? field.value.indexOf(1) : -1
    }
    const text = (key: string) => (next[key].type === 'string' ? String(next[key].value) : '')
    setTypeIndex(Math.max(pick('new_type'), 0))
    setCell(pick('new_cell') >= 0 ? cellKey(cells[pick('new_cell')].cell) : null)
    setLabel(text('new_label'))
    setOptionsText(text('new_options'))
    setRequired(next.new_required.value === 1 ? 1 : 0)
    setMessage(null)
  }

  const add = () => {
    if (validateForm(editorForm, editorData).length > 0 || cellIndex < 0) {
      setShowErrors(true)
      return
    }
    const options = optionsText.split(',').map((option) => option.trim()).filter(Boolean)
    if (isChoice && options.length === 0) {
      setMessage('กรุณาใส่ตัวเลือกอย่างน้อย 1 รายการ')
      return
    }
    const result = addControl(form, data, {
      type, label: label.trim(), required: required === 1, options, cell: cells[cellIndex].cell,
    })
    onChange(result.form, result.data)
    setLabel('')
    setOptionsText('')
    setCell(null)
    setShowErrors(false)
    setRound((n) => n + 1)
    setMessage(`เพิ่ม ${result.id} แล้ว`)
  }

  const listed = listControls(form)

  return (
    <section className="mt-5" aria-labelledby="editor-title">
      <h2 id="editor-title" className="h4">แก้ไขฟอร์ม</h2>

      <h3 className="h6 mt-3">เพิ่ม control</h3>
      <div className="border rounded p-3">
        <FormBuilder key={round} form={editorForm} onChange={() => {}} data={editorData} onDataChange={onEditorData} showErrors={showErrors} />
        <button type="button" className="btn btn-primary mt-3" onClick={add}>เพิ่ม control</button>
        {message && <div role="status" className="small text-body-secondary mt-2">{message}</div>}
      </div>

      <h3 className="h6 mt-4">control ในตาราง ({listed.length})</h3>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr><th>ตำแหน่ง</th><th>ชนิด</th><th>ชื่อ</th><th aria-label="ลบ" /></tr>
          </thead>
          <tbody>
            {listed.map((item) => {
              const inner = listControls({ controls: [{ ...grid, controls: [item.control] }] }).length - 1
              return (
                <tr key={item.path.join('.')}>
                  <td className="text-body-secondary">{position(item)}</td>
                  <td style={{ paddingLeft: `${0.25 + item.depth * 1.25}rem` }}>
                    {item.depth > 0 && '↳ '}<code>{item.control.type}</code>
                  </td>
                  <td>{describe(item.control)}</td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      aria-label={`ลบ ${item.control.type} ${describe(item.control)}`}
                      onClick={() => {
                        const result = removeControl(form, data, item.path)
                        onChange(result.form, result.data)
                        setCell(null)
                        setMessage(`ลบ ${describe(item.control)} แล้ว`)
                      }}
                    >
                      {inner > 0 ? `ลบ (รวม ${inner} ช่องข้างใน)` : 'ลบ'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
