import Component from '../../Component'
import type { ComponentStyle } from '../../Component'
import type { Variant } from '../../libs/controlTypes'

interface BadgeProps {
  text: string
  variant?: Variant
  pill?: boolean
  style?: ComponentStyle
}

export default function Badge({ text, variant = 'primary', pill = false, style }: BadgeProps) {
  return (
    <Component style={style}>
      <span className={`badge text-bg-${variant}${pill ? ' rounded-pill' : ''}`}>{text}</span>
    </Component>
  )
}
