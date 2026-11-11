import PickerField from '../date/PickerField'
import TimeModal from './TimeModal'
import type { ComponentStyle } from '../../Component'
import { formatTimeNumber, parseTimeNumber } from '../../libs/dateValue'

interface TimeFieldProps {
  id: string
  label?: string
  // HHMM (1430 = 14:30), or null when empty.
  value: number | null
  placeholder?: string
  minuteStep?: number
  disabled?: boolean
  // View only: can be focused and copied, not changed.
  readOnly?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: number | null) => void
}

// Shows the time as HH:mm in a box; the box or the button opens the time picker.
export default function TimeField({
  id, label, value, placeholder = 'ชช:นน', minuteStep, disabled, readOnly, required, error, style, onChange,
}: TimeFieldProps) {
  return (
    <PickerField
      id={id}
      label={label}
      text={value === null ? null : formatTimeNumber(value)}
      placeholder={placeholder}
      icon="🕒"
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      error={error}
      style={style}
      renderPicker={(close) => (
        <TimeModal
          id={id}
          value={value === null ? null : parseTimeNumber(value)}
          minuteStep={minuteStep}
          onSelect={(next) => {
            onChange(next)
            close()
          }}
          onClose={close}
        />
      )}
    />
  )
}
