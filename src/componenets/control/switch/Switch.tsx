import type { KeyboardEvent } from 'react'
import Component from '../../Component'
import type { ComponentStyle } from '../../Component'
import { FieldError, RequiredMark } from '../Control'
import { invalidProps } from '../../libs/validation'
import '../controls.css'

interface SwitchProps {
  id: string
  // Heading above the switch (like other controls' label).
  label?: string
  // Text next to the switch, e.g. "ยินยอมให้เก็บข้อมูล".
  text?: string
  // 1 = on, 0 = off.
  value: 0 | 1
  disabled?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: 0 | 1) => void
}

// A div-based on/off switch (role="switch") so it can be styled freely, like the other choices.
export default function Switch({
  id, label, text, value, disabled, required, error, style, onChange,
}: SwitchProps) {
  const checked = value === 1
  const toggle = () => {
    if (!disabled) onChange(checked ? 0 : 1)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      toggle()
    }
  }
  const labelledBy = [label && `${id}-label`, text && `${id}-text`].filter(Boolean).join(' ')
  const classes = [
    'fs-switch',
    checked && 'is-checked',
    disabled && 'is-disabled',
    error && 'is-invalid',
  ].filter(Boolean).join(' ')

  return (
    <Component style={style}>
      {label && <div id={`${id}-label`} className="form-label">{label}{required && <RequiredMark />}</div>}
      <div
        id={id}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        aria-labelledby={labelledBy || undefined}
        tabIndex={disabled ? -1 : 0}
        className={classes}
        {...invalidProps(id, required, error)}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <span className="fs-switch-track" aria-hidden="true"><span className="fs-switch-knob" /></span>
        {text && <span id={`${id}-text`}>{text}</span>}
      </div>
      <FieldError id={id} error={error} />
    </Component>
  )
}
