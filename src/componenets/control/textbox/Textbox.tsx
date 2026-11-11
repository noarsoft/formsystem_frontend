import { useState } from 'react'
import Control from '../Control'
import Button from '../button/Button'
import type { ComponentStyle } from '../../Component'
import { invalidProps } from '../../libs/validation'

interface TextboxProps {
  id: string
  label?: string
  value: string
  placeholder?: string
  // 'password' hides the text and adds a "แสดง/ซ่อน" toggle button.
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
  // Whether a password is currently shown; screen state only, never saved to JSON or data.
  const [visible, setVisible] = useState(false)
  const isPassword = inputType === 'password'

  const input = (
    <input
      id={id}
      className={`form-control${error ? ' is-invalid' : ''}`}
      type={isPassword && visible ? 'text' : inputType}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      {...invalidProps(id, required, error)}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )

  return (
    <Control id={id} label={label} style={style} required={required} error={error}>
      {isPassword ? (
        <div className="d-flex gap-2 align-items-start">
          <div className="flex-grow-1">{input}</div>
          <Button
            text={visible ? 'ซ่อน' : 'แสดง'}
            variant="secondary"
            outline
            onClick={() => setVisible((current) => !current)}
          />
        </div>
      ) : input}
    </Control>
  )
}
