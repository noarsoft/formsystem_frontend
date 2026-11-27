import CalendarModal from './CalendarModal'
import PickerField from './PickerField'
import type { ComponentStyle } from '../../Component'
import { formatDateNumber, parseDateNumber, yearRange } from '../../libs/dateValue'

interface DateProps {
  id: string
  label?: string
  // YYYYMMDD in Buddhist Era, or null when empty.
  value: number | null
  placeholder?: string
  disabled?: boolean
  // View only: can be focused and copied, not changed.
  readOnly?: boolean
  required?: boolean
  error?: string
  minYear?: number
  maxYear?: number
  style?: ComponentStyle
  onChange: (value: number | null) => void
}

// Shows the date as dd/mm/yyyy (พ.ศ.) in a box; the box or the button opens the calendar modal.
export default function DateField({
  id, label, value, placeholder = 'วว/ดด/ปปปป', disabled, readOnly, required, error, minYear, maxYear, style, onChange,
}: DateProps) {
  const parts = value === null ? null : parseDateNumber(value)
  const range = yearRange(parts?.year, minYear, maxYear)

  return (
    <PickerField
      id={id}
      label={label}
      text={value === null ? null : formatDateNumber(value)}
      placeholder={placeholder}
      icon="📅"
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      error={error}
      style={style}
      renderPicker={(close) => (
        <CalendarModal
          id={id}
          value={parts}
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
