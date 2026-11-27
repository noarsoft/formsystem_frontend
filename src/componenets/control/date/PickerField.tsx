import { useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import Control from '../Control'
import Button from '../button/Button'
import type { ComponentStyle } from '../../Component'
import { invalidProps } from '../../libs/validation'

interface PickerFieldProps {
  id: string
  label?: string
  // The formatted value, or null when empty (the placeholder is shown instead).
  text: string | null
  placeholder: string
  // Button text, e.g. 📅 or 🕒.
  icon: string
  disabled?: boolean
  // View only: the box can be focused but does not open, and the button is hidden.
  readOnly?: boolean
  required?: boolean
  error?: string
  // For a box inside a group (date_range): no label of its own, red border without a message,
  // and aria-describedby pointing at the group's message.
  ariaLabel?: string
  invalid?: boolean
  describedBy?: string
  style?: ComponentStyle
  // Renders the picker dialog; call close() when it is done.
  renderPicker: (close: () => void) => ReactNode
}

// Shared by date, time and datetime: a read-only box plus a button; either opens the picker.
export default function PickerField({
  id, label, text, placeholder, icon, disabled, readOnly, required, error, ariaLabel, invalid, describedBy, style, renderPicker,
}: PickerFieldProps) {
  const [open, setOpen] = useState(false)

  const openPicker = () => {
    if (!disabled && !readOnly) setOpen(true)
  }
  const closePicker = () => {
    setOpen(false)
    // Return focus to the box (looked up by id: refs may not be read while rendering the picker).
    document.getElementById(id)?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      openPicker()
    }
  }

  return (
    <Control id={id} label={label} style={style} required={required} error={error}>
      <div className="d-flex gap-2 align-items-start">
        <div
          id={id}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          className={`form-control flex-grow-1${disabled ? ' bg-body-secondary' : ''}${error || invalid ? ' is-invalid' : ''}`}
          style={{ cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'pointer', minHeight: 'calc(1.5em + 0.75rem + 2px)' }}
          aria-haspopup={readOnly ? undefined : 'dialog'}
          aria-expanded={readOnly ? undefined : open}
          aria-readonly="true"
          aria-disabled={disabled}
          {...invalidProps(id, required, error)}
          aria-invalid={error || invalid ? true : undefined}
          aria-describedby={error ? `${id}-error` : describedBy}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-label={ariaLabel}
          onClick={openPicker}
          onKeyDown={onKeyDown}
        >
          {text === null ? <span className="text-body-secondary">{placeholder}</span> : text}
        </div>
        {!readOnly && <Button text={icon} variant="secondary" outline disabled={disabled} onClick={openPicker} />}
      </div>
      {open && renderPicker(closePicker)}
    </Control>
  )
}
