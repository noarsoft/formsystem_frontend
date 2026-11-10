import Control from '../Control'
import type { ComponentStyle } from '../../Component'

interface TextareaProps {
  id: string
  label?: string
  value: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  style?: ComponentStyle
  onChange: (value: string) => void
}

export default function Textarea({
  id, label, value, placeholder, rows = 3, disabled, style, onChange,
}: TextareaProps) {
  return (
    <Control id={id} label={label} style={style}>
      <textarea
        id={id}
        className="form-control"
        rows={rows}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Control>
  )
}
