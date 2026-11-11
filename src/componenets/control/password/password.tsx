import { useState } from 'react'
import Control from '../Control'
import Textbox from '../textbox/Textbox'
import Button from '../button/Button'
import type { ComponentStyle } from '../../Component'

interface PasswordProps {
  id: string
  label?: string
  value: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: string) => void
}

// A Textbox whose text is hidden until the toggle Button is pressed.
export default function Password({
  id, label, value, placeholder, disabled, required, error, style, onChange,
}: PasswordProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Control id={id} label={label} style={style} required={required}>
      <div className="d-flex gap-2 align-items-start">
        <div className="flex-grow-1">
          <Textbox
            id={id}
            value={value}
            placeholder={placeholder}
            inputType={visible ? 'text' : 'password'}
            disabled={disabled}
            required={required}
            error={error}
            onChange={onChange}
          />
        </div>
        <Button
          text={visible ? 'ซ่อน' : 'แสดง'}
          variant="secondary"
          outline
          onClick={() => setVisible((current) => !current)}
        />
      </div>
    </Control>
  )
}
