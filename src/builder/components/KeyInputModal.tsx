import { useState } from 'react'

interface KeyInputModalProps {
  controlType: string
  onSubmit: (key: string, label: string) => void
  onCancel: () => void
  existingKeys: string[]
}

export default function KeyInputModal({ controlType, onSubmit, onCancel, existingKeys }: KeyInputModalProps) {
  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate key
    if (!key.trim()) {
      setError('กรุณากรอก Key')
      return
    }

    // Check if key already exists
    if (existingKeys.includes(key)) {
      setError('Key นี้มีอยู่แล้ว กรุณาใช้ Key อื่น')
      return
    }

    // Validate key format (alphanumeric and underscore only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      setError('Key ต้องขึ้นต้นด้วยตัวอักษรหรือ _ และประกอบด้วย a-z, A-Z, 0-9, _ เท่านั้น')
      return
    }

    if (!label.trim()) {
      setError('กรุณากรอกชื่อฟิลด์')
      return
    }

    onSubmit(key, label)
  }

  const handleKeyChange = (value: string) => {
    setKey(value)
    setError('')
  }

  const handleLabelChange = (value: string) => {
    setLabel(value)
    setError('')
    
    // Auto-generate key from label if key is empty
    if (!key) {
      const autoKey = value
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/^[0-9]/, '_$&')
      
      if (autoKey) {
        setKey(autoKey)
      }
    }
  }

  return (
    <div className="key-modal-overlay" onClick={onCancel}>
      <div className="key-modal" onClick={(e) => e.stopPropagation()}>
        <div className="key-modal-header">
          <h3 className="key-modal-title">กำหนด Key และชื่อฟิลด์</h3>
          <p className="key-modal-desc">
            กำลังเพิ่ม: <strong>{controlType}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="key-modal-body">
            <div className="property-field mb-3">
              <label htmlFor="field-label">
                ชื่อฟิลด์ <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="field-label"
                className="form-control"
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="เช่น ชื่อ-นามสกุล"
                autoFocus
              />
              <small className="property-field-hint">
                ชื่อที่จะแสดงในฟอร์ม
              </small>
            </div>

            <div className="property-field">
              <label htmlFor="field-key">
                Key (ชื่อตัวแปร) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="field-key"
                className="form-control"
                value={key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="เช่น full_name"
              />
              <small className="property-field-hint">
                ชื่อที่ใช้เก็บข้อมูล (a-z, A-Z, 0-9, _ เท่านั้น)
              </small>
            </div>

            {error && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="key-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              เพิ่มลงฟอร์ม
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
