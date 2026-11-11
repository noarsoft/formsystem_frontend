import Control from '../Control'
import { invalidProps } from '../../libs/validation'
import type { ComponentStyle } from '../../Component'

interface TextboxProps {
  id: string
  label?: string
  value: string
  placeholder?: string
  inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  disabled?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: string) => void
}

export default function Textbox({
  id, label, value, placeholder, inputType = 'text', disabled, required, error, style, onChange,
}: TextboxProps) {
  return (
    <Control id={id} label={label} style={style} required={required} error={error}>
      <input
        id={id}
        className={`form-control${error ? ' is-invalid' : ''}`}
        type={inputType}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        {...invalidProps(id, required, error)}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Control>
  )
}