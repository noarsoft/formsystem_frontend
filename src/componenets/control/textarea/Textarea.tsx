import Control from '../Control'
import { invalidProps } from '../../libs/validation'
import type { ComponentStyle } from '../../Component'

interface TextareaProps {
  id: string
  label?: string
  value: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: string) => void
}

export default function Textarea({
  id, label, value, placeholder, rows = 3, disabled, required, error, style, onChange,
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
        {...invalidProps(id, required, error)}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Control>
  )
}
