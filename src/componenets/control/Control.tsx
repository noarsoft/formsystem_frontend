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

// "12/100" under a text field that has max_length.
export function CharCounter({ id, length, max }: { id: string, length: number, max?: number }) {
  if (max === undefined) return null
  return (
    <div id={`${id}-count`} className={`form-text text-end mt-1${length > max ? ' text-danger' : ''}`}>
      {length}/{max}
    </div>
  )
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
