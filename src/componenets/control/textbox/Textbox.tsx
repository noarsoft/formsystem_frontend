import Control from '../Control'
import type { ComponentStyle } from '../../Component'

interface TextboxProps {
  id: string
  label?: string
  value: string
  placeholder?: string
  inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  disabled?: boolean
  style?: ComponentStyle
  onChange: (value: string) => void
}

export default function Textbox({
  id, label, value, placeholder, inputType = 'text', disabled, style, onChange,
}: TextboxProps) {
  return (
    <Control id={id} label={label} style={style}>
      <input
        id={id}
        className="form-control"
        type={inputType}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Control>
  )
}