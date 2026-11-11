import Component from '../Component'
import type { ComponentStyle } from '../Component'
import type { ReactNode } from 'react'

interface ControlProps {
  id: string
  label?: string
  style?: ComponentStyle
  children: ReactNode
}

export default function Control({ id, label, style, children }: ControlProps) {
  return (
    <Component style={style}>
      {label && <label id={`${id}-label`} className="form-label" htmlFor={id}>{label}</label>}
      {children}
    </Component>
  )
}