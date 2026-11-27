import Dropdown from '../dropdown/Dropdown'
import { minuteOptions } from '../../libs/dateValue'
import type { TimeParts } from '../../libs/dateValue'

interface TimePickerProps {
  id: string
  value: TimeParts
  minuteStep?: number
  onChange: (value: TimeParts) => void
}

const hours = Array.from({ length: 24 }, (_, hour) => hour)
const two = (n: number) => String(n).padStart(2, '0')

// Hour and minute dropdowns (the project's div-based Dropdown).
export default function TimePicker({ id, value, minuteStep = 1, onChange }: TimePickerProps) {
  const minutes = minuteOptions(minuteStep, value.minute)
  return (
    <div className="d-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <Dropdown
        id={`${id}-hour`}
        label="ชั่วโมง"
        options={hours.map(two)}
        value={hours.map((hour) => (hour === value.hour ? 1 : 0))}
        clearable={false}
        onChange={(next) => {
          const index = next.indexOf(1)
          if (index >= 0) onChange({ ...value, hour: hours[index] })
        }}
      />
      <Dropdown
        id={`${id}-minute`}
        label="นาที"
        options={minutes.map(two)}
        value={minutes.map((minute) => (minute === value.minute ? 1 : 0))}
        clearable={false}
        onChange={(next) => {
          const index = next.indexOf(1)
          if (index >= 0) onChange({ ...value, minute: minutes[index] })
        }}
      />
    </div>
  )
}
