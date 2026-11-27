import { useState } from 'react'
import type { FormDocument, FormData, ControlConfig } from '../componenets/libs/controlTypes'
import FormBuilder from '../componenets/libs/Formbuilder'
import ControlPalette from './components/ControlPalette'
import GridCanvas from './components/GridCanvas'
import PropertyPanel from './components/PropertyPanel'
import './builder.css'

interface FormBuilderEditorProps {
  initialForm?: FormDocument
  initialData?: FormData
  onSave?: (form: FormDocument, data: FormData) => void
}

export default function FormBuilderEditor({ 
  initialForm, 
  initialData,
  onSave 
}: FormBuilderEditorProps) {
  const [form, setForm] = useState<FormDocument>(initialForm || {
    controls: [{
      id: 'main_grid',
      type: 'grid',
      columns: 2,
      rows: 3,
      controls: []
    }]
  })
  
  const [data, setData] = useState<FormData>(initialData || {})
  const [selectedControl, setSelectedControl] = useState<ControlConfig | null>(null)
  const [mode, setMode] = useState<'design' | 'preview'>('design')
  const [draggedControlType, setDraggedControlType] = useState<string | null>(null)

  const handleSave = () => {
    if (onSave) {
      onSave(form, data)
    }
    alert('บันทึกฟอร์มสำเร็จ!')
  }

  const handleExportJSON = () => {
    const json = JSON.stringify({ form, data }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'form-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="form-builder-editor">
      {/* Header */}
      <div className="builder-header">
        <h1 className="h4 mb-0">Form Builder</h1>
        <div className="builder-actions">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${mode === 'design' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMode('design')}
            >
              <span className="me-1">✏️</span> ออกแบบ
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'preview' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMode('preview')}
            >
              <span className="me-1">👁️</span> ดูตัวอย่าง
            </button>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={handleSave}
          >
            <span className="me-1">💾</span> บันทึก
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleExportJSON}
          >
            <span className="me-1">📥</span> Export JSON
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="builder-content">
        {mode === 'design' ? (
          <>
            {/* Left Sidebar - Control Palette */}
            <aside className="builder-sidebar">
              <ControlPalette
                onDragStart={(controlType) => setDraggedControlType(controlType)}
                onDragEnd={() => setDraggedControlType(null)}
              />
            </aside>

            {/* Center - Canvas */}
            <main className="builder-canvas">
              <GridCanvas
                form={form}
                data={data}
                draggedControlType={draggedControlType}
                selectedControl={selectedControl}
                onFormChange={setForm}
                onDataChange={setData}
                onSelectControl={setSelectedControl}
              />
            </main>

            {/* Right Sidebar - Properties */}
            <aside className="builder-properties">
              <PropertyPanel
                control={selectedControl}
                form={form}
                data={data}
                onControlChange={(updatedControl) => {
                  const updateControlInTree = (controls: ControlConfig[]): ControlConfig[] => {
                    return controls.map(ctrl => {
                      if (ctrl.id === updatedControl.id) {
                        return updatedControl
                      }
                      if ('controls' in ctrl && ctrl.controls) {
                        return { ...ctrl, controls: updateControlInTree(ctrl.controls) }
                      }
                      return ctrl
                    })
                  }
                  
                  setForm({
                    ...form,
                    controls: updateControlInTree(form.controls)
                  })

                  // Update data for matrix when rows/columns change
                  if (updatedControl.type === 'matrix' && 'rows' in updatedControl && 'columns' in updatedControl) {
                    const newData = { ...data }
                    const rows = updatedControl.rows as Array<{ databinding?: string }>
                    const columns = updatedControl.columns as string[]
                    
                    rows.forEach((row) => {
                      if (row.databinding) {
                        const existingValue = newData[row.databinding]?.value
                        newData[row.databinding] = {
                          type: 'number',
                          is_array: 1,
                          options: columns,
                          value: Array.isArray(existingValue) ? existingValue : [],
                        }
                      }
                    })
                    
                    setData(newData)
                  }

                  // Update data for choice controls when options change
                  if ('options' in updatedControl && 'databinding' in updatedControl && updatedControl.databinding) {
                    const newData = { ...data }
                    const key = updatedControl.databinding as string
                    
                    if (newData[key] && 'options' in newData[key]) {
                      newData[key] = {
                        ...newData[key],
                        options: updatedControl.options as string[],
                      }
                      setData(newData)
                    }
                  }

                  // Update selected control to reflect changes
                  setSelectedControl(updatedControl)
                }}
                onClose={() => setSelectedControl(null)}
              />
            </aside>
          </>
        ) : (
          /* Preview Mode */
          <div className="builder-preview">
            <div className="preview-container">
              <FormBuilder
                form={form}
                onChange={setForm}
                data={data}
                onDataChange={setData}
              />
            </div>
            <div className="preview-data">
              <h3 className="h5">ข้อมูลที่กรอก (Data)</h3>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
