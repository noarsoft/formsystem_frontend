import Component from '../Component'
import type { ComponentStyle } from '../Component'
import type { ReactNode } from 'react'

interface ControlProps {
  id: string
  label?: string
  style?: ComponentStyle
  // Adds a red * after the label.
  required?: boolean
  // Validation message shown under the control (its element id is `${id}-error`).
  error?: string
  children: ReactNode
}

export function RequiredMark() {
  return <span className="text-danger ms-1" aria-hidden="true">*</span>
}

export function FieldError({ id, error }: { id: string, error?: string }) {
  if (!error) return null
  return <div id={`${id}-error`} className="invalid-feedback d-block">{error}</div>
}

export default function Control({ id, label, style, required, error, children }: ControlProps) {
  return (
    <Component style={style}>
      {label && (
        <label id={`${id}-label`} className="form-label" htmlFor={id}>
          {label}{required && <RequiredMark />}
        </label>
      )}
      {children}
      <FieldError id={id} error={error} />
    </Component>
  )
}
