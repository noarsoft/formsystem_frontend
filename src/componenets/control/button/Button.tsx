import Component from '../../Component'
import type { ComponentStyle } from '../../Component'
import type { Variant } from '../../libs/controlTypes'

interface ButtonProps {
  text: string
  variant?: Variant
  outline?: boolean
  disabled?: boolean
  style?: ComponentStyle
  onClick?: () => void
}

export default function Button({
  text, variant = 'primary', outline = false, disabled, style, onClick,
}: ButtonProps) {
  return (
    <Component style={style}>
      <button
        type="button"
        className={`btn btn-${outline ? 'outline-' : ''}${variant}`}
        disabled={disabled}
        onClick={onClick}
      >
        {text}
      </button>
    </Component>
  )
}
