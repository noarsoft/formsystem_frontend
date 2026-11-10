import Component from '../Component'
import type { ComponentProps } from '../Component'

// Vertical stack by default; pass className to change the layout.
export default function Container({ className = 'd-flex flex-column gap-3', ...props }: ComponentProps) {
  return <Component className={className} {...props} />
}