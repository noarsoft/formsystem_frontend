import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import Control from '../Control'
import Button from '../button/Button'
import CalendarModal from './CalendarModal'
import type { ComponentStyle } from '../../Component'
import {
  formatDateNumber, MAX_YEAR, MIN_YEAR, parseDateNumber, todayParts,
} from '../../libs/dateValue'

interface DateProps {
  id: string
  label?: string
  // YYYYMMDD in Buddhist Era, or null when empty.
  value: number | null
  placeholder?: string
  disabled?: boolean
  minYear?: number
  maxYear?: number
  style?: ComponentStyle
  onChange: (value: number | null) => void
}

// Shows the date as dd/mm/yyyy (พ.ศ.) in a box; the box or the button opens the calendar modal.
export default function DateField({
  id, label, value, placeholder = 'วว/ดด/ปปปป', disabled, minYear, maxYear, style, onChange,
}: DateProps) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const parts = value === null ? null : parseDateNumber(value)

  // The range always includes the current year and the selected year.
  const currentYear = todayParts().year
  const rangeMin = Math.max(MIN_YEAR, Math.min(minYear ?? currentYear - 100, parts?.year ?? Infinity))
  const rangeMax = Math.min(MAX_YEAR, Math.max(maxYear ?? currentYear + 20, parts?.year ?? -Infinity))

  const openPicker = () => {
    if (!disabled) setOpen(true)
  }
  const closePicker = () => {
    setOpen(false)
    boxRef.current?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      openPicker()
    }
  }

  return (
    <Control id={id} label={label} style={style}>
      <div className="d-flex gap-2 align-items-start">
        <div
          id={id}
          ref={boxRef}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          className={`form-control flex-grow-1${disabled ? ' bg-body-secondary' : ''}`}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 'calc(1.5em + 0.75rem + 2px)' }}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-readonly="true"
          aria-disabled={disabled}
          aria-labelledby={label ? `${id}-label` : undefined}
          onClick={openPicker}
          onKeyDown={onKeyDown}
        >
          {value === null ? <span className="text-body-secondary">{placeholder}</span> : formatDateNumber(value)}
        </div>
        <Button text="📅" variant="secondary" outline disabled={disabled} onClick={openPicker} />
      </div>
      {open && (
        <CalendarModal
          id={id}
          value={parts}
          minYear={rangeMin}
          maxYear={rangeMax}
          onSelect={(next) => {
            onChange(next)
            closePicker()
          }}
          onClose={closePicker}
        />
      )}
    </Control>
  )
}
