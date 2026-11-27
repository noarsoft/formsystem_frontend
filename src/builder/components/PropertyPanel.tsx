import type { ControlConfig, FormDocument, FormData } from '../../componenets/libs/controlTypes'

interface PropertyPanelProps {
  control: ControlConfig | null
  form: FormDocument
  data: FormData
  onControlChange: (control: ControlConfig) => void
  onClose: () => void
}

export default function PropertyPanel({ control, onControlChange, onClose }: PropertyPanelProps) {
  if (!control) {
    return (
      <div className="property-panel">
        <div className="property-empty">
          <div className="property-empty-icon">📝</div>
          <p className="property-empty-text">
            เลือกองค์ประกอบในฟอร์ม
            <br />
            เพื่อแก้ไขคุณสมบัติ
          </p>
        </div>
      </div>
    )
  }

  const handleChange = (field: string, value: any) => {
    onControlChange({
      ...control,
      [field]: value,
    })
  }

  const handleOptionsChange = (index: number, value: string) => {
    if ('options' in control && Array.isArray(control.options)) {
      const newOptions = [...control.options]
      newOptions[index] = value
      handleChange('options', newOptions)
    }
  }

  const handleAddOption = () => {
    if ('options' in control && Array.isArray(control.options)) {
      const currentLength = control.options?.length || 0
      handleChange('options', [...(control.options || []), `ตัวเลือก ${currentLength + 1}`])
    }
  }

  const handleRemoveOption = (index: number) => {
    if ('options' in control && Array.isArray(control.options)) {
      const newOptions = control.options.filter((_, i) => i !== index)
      handleChange('options', newOptions)
    }
  }

  // Matrix specific handlers
  const handleMatrixRowChange = (index: number, field: 'label' | 'databinding', value: string) => {
    if (control.type === 'matrix' && 'rows' in control && Array.isArray(control.rows)) {
      const newRows = [...control.rows]
      newRows[index] = { ...newRows[index], [field]: value }
      handleChange('rows', newRows)
    }
  }

  const handleMatrixColumnChange = (index: number, value: string) => {
    if (control.type === 'matrix' && 'columns' in control && Array.isArray(control.columns)) {
      const newColumns = [...control.columns]
      newColumns[index] = value
      handleChange('columns', newColumns)
    }
  }

  const handleAddMatrixRow = () => {
    if (control.type === 'matrix' && 'rows' in control && Array.isArray(control.rows)) {
      const newRowIndex = control.rows.length + 1
      const baseKey = (control as any).databinding || control.id
      handleChange('rows', [
        ...control.rows,
        { label: `คำถาม ${newRowIndex}`, databinding: `${baseKey}_q${newRowIndex}` }
      ])
    }
  }

  const handleRemoveMatrixRow = (index: number) => {
    if (control.type === 'matrix' && 'rows' in control && Array.isArray(control.rows)) {
      const newRows = control.rows.filter((_, i) => i !== index)
      handleChange('rows', newRows)
    }
  }

  const handleAddMatrixColumn = () => {
    if (control.type === 'matrix' && 'columns' in control && Array.isArray(control.columns)) {
      handleChange('columns', [...control.columns, `ตัวเลือก ${control.columns.length + 1}`])
    }
  }

  const handleRemoveMatrixColumn = (index: number) => {
    if (control.type === 'matrix' && 'columns' in control && Array.isArray(control.columns)) {
      const newColumns = control.columns.filter((_, i) => i !== index)
      handleChange('columns', newColumns)
    }
  }

  return (
    <div className="property-panel">
      <div className="property-panel-header">
        <h3 className="property-panel-title">คุณสมบัติ</h3>
        <button type="button" className="property-panel-close" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Basic Properties */}
      <div className="property-section">
        <h4 className="property-section-title">ทั่วไป</h4>

        <div className="property-field">
          <label>ประเภท</label>
          <input type="text" className="form-control" value={control.type} disabled />
        </div>

        <div className="property-field">
          <label>ID</label>
          <input type="text" className="form-control" value={control.id} disabled />
        </div>

        {'label' in control && (
          <div className="property-field">
            <label htmlFor="prop-label">ชื่อฟิลด์</label>
            <input
              type="text"
              id="prop-label"
              className="form-control"
              value={control.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
            />
          </div>
        )}

        {'databinding' in control && control.databinding && (
          <div className="property-field">
            <label>Key (databinding)</label>
            <input type="text" className="form-control" value={control.databinding} disabled />
          </div>
        )}

        {'placeholder' in control && (
          <div className="property-field">
            <label htmlFor="prop-placeholder">Placeholder</label>
            <input
              type="text"
              id="prop-placeholder"
              className="form-control"
              value={(control as any).placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
            />
          </div>
        )}

        {'text' in control && (
          <div className="property-field">
            <label htmlFor="prop-text">ข้อความ</label>
            <input
              type="text"
              id="prop-text"
              className="form-control"
              value={(control as any).text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Validation */}
      {'required' in control && (
        <div className="property-section">
          <h4 className="property-section-title">การตรวจสอบ</h4>

          <div className="property-checkbox">
            <input
              type="checkbox"
              id="prop-required"
              checked={(control as any).required || false}
              onChange={(e) => handleChange('required', e.target.checked)}
            />
            <label htmlFor="prop-required">จำเป็นต้องกรอก (Required)</label>
          </div>

          {(control as any).required && (
            <div className="property-field">
              <label htmlFor="prop-required-message">ข้อความแจ้งเตือน</label>
              <input
                type="text"
                id="prop-required-message"
                className="form-control"
                value={(control as any).required_message || ''}
                onChange={(e) => handleChange('required_message', e.target.value)}
                placeholder="กรุณากรอกข้อมูล"
              />
            </div>
          )}

          {(control.type === 'textbox' || control.type === 'textarea') && (
            <>
              <div className="property-field">
                <label htmlFor="prop-min-length">ความยาวขั้นต่ำ</label>
                <input
                  type="number"
                  id="prop-min-length"
                  className="form-control"
                  value={(control as any).min_length || ''}
                  onChange={(e) => handleChange('min_length', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                />
              </div>

              <div className="property-field">
                <label htmlFor="prop-max-length">ความยาวสูงสุด</label>
                <input
                  type="number"
                  id="prop-max-length"
                  className="form-control"
                  value={(control as any).max_length || ''}
                  onChange={(e) => handleChange('max_length', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                />
              </div>

              {control.type === 'textbox' && (
                <div className="property-field">
                  <label htmlFor="prop-format">รูปแบบ</label>
                  <select
                    id="prop-format"
                    className="form-control"
                    value={(control as any).format || ''}
                    onChange={(e) => handleChange('format', e.target.value || undefined)}
                  >
                    <option value="">ไม่กำหนด</option>
                    <option value="email">อีเมล</option>
                    <option value="phone_th">เบอร์โทรศัพท์ไทย</option>
                    <option value="thai_id">เลขบัตรประชาชน</option>
                    <option value="postcode_th">รหัสไปรษณีย์</option>
                    <option value="digits">ตัวเลขเท่านั้น</option>
                  </select>
                </div>
              )}
            </>
          )}

          {control.type === 'number' && (
            <>
              <div className="property-field">
                <label htmlFor="prop-min">ค่าต่ำสุด</label>
                <input
                  type="number"
                  id="prop-min"
                  className="form-control"
                  value={(control as any).min ?? ''}
                  onChange={(e) => handleChange('min', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>

              <div className="property-field">
                <label htmlFor="prop-max">ค่าสูงสุด</label>
                <input
                  type="number"
                  id="prop-max"
                  className="form-control"
                  value={(control as any).max ?? ''}
                  onChange={(e) => handleChange('max', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>

              <div className="property-field">
                <label htmlFor="prop-decimals">ทศนิยม</label>
                <input
                  type="number"
                  id="prop-decimals"
                  className="form-control"
                  value={(control as any).decimals ?? 0}
                  onChange={(e) => handleChange('decimals', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="property-field">
                <label htmlFor="prop-unit">หน่วย</label>
                <input
                  type="text"
                  id="prop-unit"
                  className="form-control"
                  value={(control as any).unit || ''}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  placeholder="เช่น บาท, กก."
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Options for choice controls */}
      {'options' in control && Array.isArray(control.options) && (
        <div className="property-section">
          <h4 className="property-section-title">ตัวเลือก</h4>

          {control.options.map((option, index) => (
            <div key={index} className="property-field">
              <label>ตัวเลือก {index + 1}</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={option}
                  onChange={(e) => handleOptionsChange(index, e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => handleRemoveOption(index)}
                  disabled={!control.options || control.options.length <= 1}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={handleAddOption}>
            + เพิ่มตัวเลือก
          </button>

          {(control.type === 'dropdown' || control.type === 'checkbox_group') && (
            <div className="property-checkbox mt-3">
              <input
                type="checkbox"
                id="prop-multiple"
                checked={(control as any).multiple || false}
                onChange={(e) => handleChange('multiple', e.target.checked)}
              />
              <label htmlFor="prop-multiple">เลือกได้หลายตัวเลือก</label>
            </div>
          )}
        </div>
      )}

      {/* Matrix specific */}
      {control.type === 'matrix' && 'rows' in control && 'columns' in control && (
        <>
          <div className="property-section">
            <h4 className="property-section-title">คำถาม (Rows)</h4>

            {Array.isArray(control.rows) && control.rows.map((row: any, index: number) => (
              <div key={index} className="mb-3" style={{ border: '1px solid #dee2e6', borderRadius: '4px', padding: '0.75rem' }}>
                <div className="property-field mb-2">
                  <label>คำถาม {index + 1}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={row.label || ''}
                    onChange={(e) => handleMatrixRowChange(index, 'label', e.target.value)}
                    placeholder="ข้อความคำถาม"
                  />
                </div>
                <div className="property-field mb-2">
                  <label>Key</label>
                  <input
                    type="text"
                    className="form-control"
                    value={row.databinding || ''}
                    onChange={(e) => handleMatrixRowChange(index, 'databinding', e.target.value)}
                    placeholder="key_name"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger w-100"
                  onClick={() => handleRemoveMatrixRow(index)}
                  disabled={control.rows.length <= 1}
                >
                  🗑️ ลบคำถาม
                </button>
              </div>
            ))}

            <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={handleAddMatrixRow}>
              + เพิ่มคำถาม
            </button>
          </div>

          <div className="property-section">
            <h4 className="property-section-title">คำตอบ (Columns)</h4>

            {Array.isArray(control.columns) && control.columns.map((column: string, index: number) => (
              <div key={index} className="property-field">
                <label>คำตอบ {index + 1}</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={column}
                    onChange={(e) => handleMatrixColumnChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveMatrixColumn(index)}
                    disabled={control.columns.length <= 1}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={handleAddMatrixColumn}>
              + เพิ่มคำตอบ
            </button>

            <div className="property-checkbox mt-3">
              <input
                type="checkbox"
                id="prop-matrix-multiple"
                checked={(control as any).multiple || false}
                onChange={(e) => handleChange('multiple', e.target.checked)}
              />
              <label htmlFor="prop-matrix-multiple">เลือกได้หลายคำตอบต่อคำถาม</label>
            </div>
          </div>
        </>
      )}

      {/* Rating specific */}
      {control.type === 'rating' && (
        <div className="property-section">
          <h4 className="property-section-title">การแสดงผล</h4>

          <div className="property-field">
            <label htmlFor="prop-display">รูปแบบ</label>
            <select
              id="prop-display"
              className="form-control"
              value={(control as any).display || 'star'}
              onChange={(e) => handleChange('display', e.target.value)}
            >
              <option value="star">ดาว</option>
              <option value="number">ตัวเลข</option>
            </select>
          </div>

          <div className="property-field">
            <label htmlFor="prop-rating-min">คะแนนต่ำสุด</label>
            <input
              type="number"
              id="prop-rating-min"
              className="form-control"
              value={(control as any).min || 1}
              onChange={(e) => handleChange('min', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="property-field">
            <label htmlFor="prop-rating-max">คะแนนสูงสุด</label>
            <input
              type="number"
              id="prop-rating-max"
              className="form-control"
              value={(control as any).max || 5}
              onChange={(e) => handleChange('max', parseInt(e.target.value) || 5)}
            />
          </div>
        </div>
      )}

      {/* State */}
      <div className="property-section">
        <h4 className="property-section-title">สถานะ</h4>

        {'disabled' in control && (
          <div className="property-checkbox">
            <input
              type="checkbox"
              id="prop-disabled"
              checked={(control as any).disabled || false}
              onChange={(e) => handleChange('disabled', e.target.checked)}
            />
            <label htmlFor="prop-disabled">ปิดการใช้งาน (Disabled)</label>
          </div>
        )}

        {'readonly' in control && (
          <div className="property-checkbox">
            <input
              type="checkbox"
              id="prop-readonly"
              checked={(control as any).readonly || false}
              onChange={(e) => handleChange('readonly', e.target.checked)}
            />
            <label htmlFor="prop-readonly">อ่านอย่างเดียว (Readonly)</label>
          </div>
        )}
      </div>
    </div>
  )
}
