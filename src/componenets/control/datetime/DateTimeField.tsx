import CalendarModal from '../date/CalendarModal'
import PickerField from '../date/PickerField'
import type { ComponentStyle } from '../../Component'
import { formatDateTimeNumber, parseDateTimeNumber, yearRange } from '../../libs/dateValue'

interface DateTimeFieldProps {
  id: string
  label?: string
  // YYYYMMDDHHMM in Buddhist Era (256811181430 = 18/11/2568 14:30), or null when empty.
  value: number | null
  placeholder?: string
  minYear?: number
  maxYear?: number
  minuteStep?: number
  disabled?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: number | null) => void
}

// Shows dd/mm/yyyy HH:mm in a box; the picker is the calendar plus hour/minute and "ตกลง".
export default function DateTimeField({
  id, label, value, placeholder = 'วว/ดด/ปปปป ชช:นน', minYear, maxYear, minuteStep, disabled, required, error,
  style, onChange,
}: DateTimeFieldProps) {
  const parts = value === null ? null : parseDateTimeNumber(value)
  const range = yearRange(parts?.year, minYear, maxYear)

  return (
    <PickerField
      id={id}
      label={label}
      text={value === null ? null : formatDateTimeNumber(value)}
      placeholder={placeholder}
      icon="📅"
      disabled={disabled}
      required={required}
      error={error}
      style={style}
      renderPicker={(close) => (
        <CalendarModal
          id={id}
          value={parts && { year: parts.year, month: parts.month, day: parts.day }}
          time={parts && { hour: parts.hour, minute: parts.minute }}
          withTime
          minuteStep={minuteStep}
          minYear={range.min}
          maxYear={range.max}
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
