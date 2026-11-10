import Component from '../../Component'
import type { ComponentStyle } from '../../Component'

interface LabelProps {
  text: string
  htmlFor?: string
  style?: ComponentStyle
}

export default function Label({ text, htmlFor, style }: LabelProps) {
  return (
    <Component style={style}>
      <label className="form-label mb-0" htmlFor={htmlFor}>{text}</label>
    </Component>
  )
}
