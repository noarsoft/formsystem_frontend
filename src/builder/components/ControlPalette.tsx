interface ControlPaletteProps {
  onDragStart: (controlType: string) => void
  onDragEnd: () => void
}

interface PaletteControl {
  type: string
  icon: string
  name: string
  description: string
}

const CONTROL_GROUPS: { title: string; controls: PaletteControl[] }[] = [
  {
    title: 'ช่องกรอกข้อมูล',
    controls: [
      { type: 'textbox', icon: '📝', name: 'ช่องข้อความ', description: 'กรอกข้อความสั้นๆ' },
      { type: 'textarea', icon: '📄', name: 'ช่องข้อความยาว', description: 'กรอกข้อความหลายบรรทัด' },
      { type: 'number', icon: '🔢', name: 'ตัวเลข', description: 'กรอกตัวเลข' },
      { type: 'date', icon: '📅', name: 'วันที่', description: 'เลือกวันที่' },
      { type: 'time', icon: '🕐', name: 'เวลา', description: 'เลือกเวลา' },
      { type: 'datetime', icon: '📆', name: 'วันที่และเวลา', description: 'เลือกวันที่และเวลา' },
      { type: 'date_range', icon: '📊', name: 'ช่วงวันที่', description: 'เลือกช่วงวันที่' },
    ],
  },
  {
    title: 'ตัวเลือก',
    controls: [
      { type: 'dropdown', icon: '📋', name: 'เมนูแบบเลื่อน', description: 'เลือกจากรายการ' },
      { type: 'option', icon: '🔘', name: 'ตัวเลือกเดียว', description: 'เลือกได้ 1 ตัวเลือก' },
      { type: 'checkbox_group', icon: '☑️', name: 'ตัวเลือกหลายตัว', description: 'เลือกได้หลายตัวเลือก' },
      { type: 'switch', icon: '🔄', name: 'สวิตช์', description: 'เปิด/ปิด' },
      { type: 'rating', icon: '⭐', name: 'คะแนน', description: 'ให้คะแนนดาว' },
      { type: 'matrix', icon: '📊', name: 'ตารางคำถาม', description: 'คำถามหลายข้อ คำตอบเดียวกัน' },
    ],
  },
  {
    title: 'อื่นๆ',
    controls: [
      { type: 'label', icon: '🏷️', name: 'ข้อความ', description: 'แสดงข้อความ' },
      { type: 'button', icon: '🔘', name: 'ปุ่ม', description: 'ปุ่มกด' },
    ],
  },
]

export default function ControlPalette({ onDragStart, onDragEnd }: ControlPaletteProps) {
  const handleDragStart = (e: React.DragEvent, controlType: string) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('controlType', controlType)
    onDragStart(controlType)
  }

  const handleDragEnd = () => {
    onDragEnd()
  }

  return (
    <div className="control-palette">
      <h2 className="h5 mb-3">องค์กรฟอร์ม</h2>
      
      {CONTROL_GROUPS.map((group) => (
        <div key={group.title} className="palette-section">
          <h3>{group.title}</h3>
          {group.controls.map((control) => (
            <div
              key={control.type}
              className="palette-item"
              draggable
              onDragStart={(e) => handleDragStart(e, control.type)}
              onDragEnd={handleDragEnd}
            >
              <div className="palette-item-icon">{control.icon}</div>
              <div className="palette-item-info">
                <p className="palette-item-name">{control.name}</p>
                <p className="palette-item-desc">{control.description}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
