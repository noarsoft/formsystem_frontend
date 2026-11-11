import Component from '../../Component'
import type { ComponentStyle } from '../../Component'
import { FieldError, RequiredMark } from '../Control'
import CalendarModal from '../date/CalendarModal'
import PickerField from '../date/PickerField'
import { formatDateNumber, parseDateNumber, yearRange } from '../../libs/dateValue'
import type { DateRange } from '../../libs/controlValues'

interface DateRangeFieldProps {
  id: string
  label?: string
  value: DateRange
  placeholder?: string
  disabled?: boolean
  // View only: can be focused and copied, not changed.
  readOnly?: boolean
  required?: boolean
  error?: string
  minYear?: number
  maxYear?: number
  style?: ComponentStyle
  onChange: (end: 'from' | 'to', value: number | null) => void
}

// Two date boxes, "ตั้งแต่ … ถึง …", under one label with one validation message.
export default function DateRangeField({
  id, label, value, placeholder = 'วว/ดด/ปปปป', disabled, readOnly, required, error, minYear, maxYear, style, onChange,
}: DateRangeFieldProps) {
  // With an error, mark the empty end(s); if both are filled (end before start), mark both.
  const bothFilled = value.from !== null && value.to !== null
  const invalid = (end: number | null) => error !== undefined && (bothFilled || end === null)

  const box = (end: 'from' | 'to', text: string) => {
    const current = value[end]
    const parts = current === null ? null : parseDateNumber(current)
    const range = yearRange(parts?.year, minYear, maxYear)
    return (
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <PickerField
          id={`${id}-${end}`}
          text={current === null ? null : formatDateNumber(current)}
          placeholder={placeholder}
          icon="📅"
          disabled={disabled}
          readOnly={readOnly}
          ariaLabel={`${label ? `${label} ` : ''}${text}`}
          invalid={invalid(current)}
          describedBy={error ? `${id}-error` : undefined}
          renderPicker={(close) => (
            <CalendarModal
              id={`${id}-${end}`}
              value={parts}
              minYear={range.min}
              maxYear={range.max}
              minDate={end === 'to' ? value.from : null}
              maxDate={end === 'from' ? value.to : null}
              onSelect={(next) => {
                onChange(end, next)
                close()
              }}
              onClose={close}
            />
          )}
        />
      </div>
    )
  }

  return (
    <Component style={style}>
      {label && <div id={`${id}-label`} className="form-label">{label}{required && <RequiredMark />}</div>}
      <div id={id} role="group" aria-labelledby={label ? `${id}-label` : undefined} className="d-flex gap-2 align-items-start">
        {box('from', 'ตั้งแต่')}
        <span className="text-body-secondary" style={{ lineHeight: 'calc(1.5em + 0.75rem + 2px)' }}>ถึง</span>
        {box('to', 'ถึง')}
      </div>
      <FieldError id={id} error={error} />
    </Component>
  )
}
