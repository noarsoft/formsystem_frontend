import { useState } from 'react'
import type { FormDocument, FormData, ControlConfig, GridConfig } from '../../componenets/libs/controlTypes'
import KeyInputModal from './KeyInputModal'

interface GridCanvasProps {
  form: FormDocument
  data: FormData
  draggedControlType: string | null
  selectedControl: ControlConfig | null
  onFormChange: (form: FormDocument) => void
  onDataChange: (data: FormData) => void
  onSelectControl: (control: ControlConfig | null) => void
}

export default function GridCanvas({
  form,
  data,
  selectedControl,
  onFormChange,
  onDataChange,
  onSelectControl,
}: GridCanvasProps) {
  const [dragOverCell, setDragOverCell] = useState<{ row: number; col: number } | null>(null)
  const [pendingControl, setPendingControl] = useState<{
    type: string
    row: number
    col: number
  } | null>(null)

  // Get the main grid
  const mainGrid = form.controls[0] as GridConfig
  if (!mainGrid || mainGrid.type !== 'grid') {
    return <div className="alert alert-danger">ไม่พบ Grid หลัก</div>
  }

  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverCell({ row, col })
  }

  const handleDragLeave = () => {
    setDragOverCell(null)
  }

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault()
    const controlType = e.dataTransfer.getData('controlType')

    if (controlType) {
      // Check if cell is already occupied
      const isOccupied = mainGrid.controls.some(
        (ctrl) => 'colno' in ctrl && 'rowno' in ctrl && ctrl.colno === col && ctrl.rowno === row
      )

      if (isOccupied) {
        alert('ช่องนี้มีองค์ประกอบอยู่แล้ว')
        setDragOverCell(null)
        return
      }

      // Show key input modal
      setPendingControl({ type: controlType, row, col })
    }

    setDragOverCell(null)
  }

  const handleKeySubmit = (key: string, label: string) => {
    if (!pendingControl) return

    const { type, row, col } = pendingControl
    const controlId = `${type}_${Date.now()}`
    const defaultOptions = ['ตัวเลือก 1', 'ตัวเลือก 2', 'ตัวเลือก 3']

    // Create new control
    const newControl: ControlConfig = {
      id: controlId,
      type: type as any,
      colno: col,
      rowno: row,
      label: label || `${type} ${controlId}`,
      databinding: key,
    }

    // Add default properties based on control type
    if (type === 'textbox' || type === 'textarea') {
      Object.assign(newControl, { value: '' })
    } else if (type === 'number') {
      Object.assign(newControl, { value: null })
    } else if (type === 'date' || type === 'time' || type === 'datetime') {
      Object.assign(newControl, { value: null })
    } else if (type === 'date_range') {
      Object.assign(newControl, {
        value_from: null,
        value_to: null,
        databinding_from: `${key}_from`,
        databinding_to: `${key}_to`,
      })
      delete (newControl as any).databinding
    } else if (type === 'dropdown' || type === 'checkbox_group' || type === 'option') {
      Object.assign(newControl, {
        options: [...defaultOptions],
        value: defaultOptions.map(() => 0),
      })
    } else if (type === 'switch') {
      Object.assign(newControl, { value: 0 })
    } else if (type === 'rating') {
      Object.assign(newControl, { value: null, display: 'star', min: 1, max: 5 })
    } else if (type === 'matrix') {
      Object.assign(newControl, {
        rows: [
          { label: 'คำถาม 1', databinding: `${key}_q1` },
          { label: 'คำถาม 2', databinding: `${key}_q2` },
        ],
        columns: [...defaultOptions],
      })
      delete (newControl as any).databinding
    } else if (type === 'label') {
      Object.assign(newControl, { text: 'ข้อความ' })
      delete (newControl as any).databinding
    } else if (type === 'button') {
      Object.assign(newControl, { text: 'คลิก' })
      delete (newControl as any).databinding
    }

    // Update form
    const updatedGrid = {
      ...mainGrid,
      controls: [...mainGrid.controls, newControl],
    }

    onFormChange({
      ...form,
      controls: [updatedGrid],
    })

    // Update data
    const newData = { ...data }
    let hasDataChange = false

    if (type === 'textbox' || type === 'textarea') {
      newData[key] = { type: 'string', value: '' }
      hasDataChange = true
    } else if (
      type === 'number' ||
      type === 'date' ||
      type === 'time' ||
      type === 'datetime' ||
      type === 'rating'
    ) {
      newData[key] = { type: 'number', value: null }
      hasDataChange = true
    } else if (type === 'switch') {
      newData[key] = { type: 'number', value: 0 }
      hasDataChange = true
    } else if (type === 'date_range') {
      newData[`${key}_from`] = { type: 'number', value: null }
      newData[`${key}_to`] = { type: 'number', value: null }
      hasDataChange = true
    } else if (type === 'dropdown' || type === 'checkbox_group' || type === 'option') {
      newData[key] = {
        type: 'number',
        is_array: 1,
        options: [...defaultOptions],
        value: defaultOptions.map(() => 0),
      }
      hasDataChange = true
    } else if (type === 'matrix' && 'rows' in newControl) {
      const rows = (newControl as any).rows as Array<{ databinding: string }>
      const columns = (newControl as any).columns as string[]

      rows.forEach((r) => {
        if (r.databinding) {
          newData[r.databinding] = {
            type: 'number',
            is_array: 1,
            options: [...columns],
            value: columns.map(() => 0),
          }
        }
      })
      hasDataChange = true
    }

    if (hasDataChange) {
      onDataChange(newData)
    }

    setPendingControl(null)
  }

  const handleDeleteControl = (controlId: string) => {
    if (!confirm('ต้องการลบองค์ประกอบนี้หรือไม่?')) return

    const controlToDelete = mainGrid.controls.find((c) => c.id === controlId)

    // Update form
    const updatedGrid = {
      ...mainGrid,
      controls: mainGrid.controls.filter((c) => c.id !== controlId),
    }

    onFormChange({
      ...form,
      controls: [updatedGrid],
    })

    // Update data - remove unused keys
    if (controlToDelete) {
      const newData = { ...data }

      // Handle date_range
      if (controlToDelete.type === 'date_range' && 'databinding_from' in controlToDelete) {
        const fromKey = (controlToDelete as any).databinding_from
        const toKey = (controlToDelete as any).databinding_to
        if (fromKey) delete newData[fromKey]
        if (toKey) delete newData[toKey]
      }
      // Handle matrix
      else if (controlToDelete.type === 'matrix' && 'rows' in controlToDelete) {
        const rows = (controlToDelete as any).rows as Array<{ databinding?: string }>
        rows.forEach((r) => {
          if (r.databinding) {
            delete newData[r.databinding]
          }
        })
      }
      // Handle regular databinding
      else if ('databinding' in controlToDelete && controlToDelete.databinding) {
        delete newData[controlToDelete.databinding]
      }

      onDataChange(newData)
    }

    if (selectedControl?.id === controlId) {
      onSelectControl(null)
    }
  }

  const handleAddRow = () => {
    const updatedGrid = {
      ...mainGrid,
      rows: (mainGrid.rows || 0) + 1,
    }

    onFormChange({
      ...form,
      controls: [updatedGrid],
    })
  }

  const handleAddColumn = () => {
    const updatedGrid = {
      ...mainGrid,
      columns: (mainGrid.columns || 0) + 1,
    }

    onFormChange({
      ...form,
      controls: [updatedGrid],
    })
  }

  // Create grid cells
  const cells: React.ReactElement[] = []
  const rows = mainGrid.rows || 0
  const columns = mainGrid.columns || 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const control = mainGrid.controls.find(
        (c) => 'colno' in c && 'rowno' in c && c.colno === col && c.rowno === row
      )

      const isDragOver = dragOverCell?.row === row && dragOverCell?.col === col
      const isSelected = Boolean(control?.id && selectedControl?.id === control.id)

      cells.push(
        <div
          key={`${row}-${col}`}
          className={`grid-cell ${control ? 'has-control' : ''} ${isDragOver ? 'drag-over' : ''} ${
            isSelected ? 'selected' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, row, col)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, row, col)}
          onClick={() => control && onSelectControl(control)}
        >
          <span className="grid-cell-label">
            R{row + 1}C{col + 1}
          </span>

          {control && (
            <>
              <div className="grid-cell-actions">
                <button
                  type="button"
                  className="grid-cell-action delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteControl(control.id || '')
                  }}
                >
                  🗑️
                </button>
              </div>
              <div className="grid-cell-content">
                <strong>{control.type}</strong>
                {'label' in control && control.label && (
                  <div title={String(control.label)}>{control.label}</div>
                )}
                {'databinding' in control && control.databinding && (
                  <div
                    className="text-muted"
                    style={{ fontSize: '0.75rem' }}
                    title={`Key: ${String(control.databinding)}`}
                  >
                    Key: {control.databinding}
                  </div>
                )}
                {control.type === 'matrix' && 'rows' in control && (
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {(control as any).rows?.length || 0} คำถาม × {(control as any).columns?.length || 0} คำตอบ
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )
    }
  }

  return (
    <>
      <div className="grid-canvas">
        <div className="grid-canvas-header">
          <h2 className="grid-canvas-title">พื้นที่ออกแบบฟอร์ม</h2>
          <div className="grid-canvas-controls">
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddRow}>
              + เพิ่มแถว
            </button>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddColumn}>
              + เพิ่มคอลัมน์
            </button>
          </div>
        </div>

        <div
          className="grid-layout"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, auto)`,
          }}
        >
          {cells}
        </div>
      </div>

      {pendingControl && (
        <KeyInputModal
          controlType={pendingControl.type}
          onSubmit={handleKeySubmit}
          onCancel={() => setPendingControl(null)}
          existingKeys={Object.keys(data)}
        />
      )}
    </>
  )
}