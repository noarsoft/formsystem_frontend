import Control, { CharCounter } from '../Control'
import { invalidProps, textLength } from '../../libs/validation'
import type { ComponentStyle } from '../../Component'

interface TextareaProps {
  id: string
  label?: string
  value: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  // View only: can be focused and copied, not changed.
  readOnly?: boolean
  required?: boolean
  error?: string
  // Stops typing past this many characters and shows a "12/100" counter.
  maxLength?: number
  // Keyboard hint on phones, e.g. 'numeric' for digit formats.
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  style?: ComponentStyle
  onChange: (value: string) => void
}

export default function Textarea({
  id, label, value, placeholder, rows = 3, disabled, readOnly, required, error, maxLength, inputMode, style, onChange,
}: TextareaProps) {
  return (
    <Control id={id} label={label} style={style} required={required} error={error}>
      <textarea
        id={id}
        className={`form-control${error ? ' is-invalid' : ''}`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        inputMode={inputMode}
        {...invalidProps(id, required, error)}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <CharCounter id={id} length={textLength(value)} max={maxLength} />
    </Control>
  )
}
