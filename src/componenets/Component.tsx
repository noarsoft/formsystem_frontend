import type { ReactNode } from 'react'
import { componentStyle } from './libs/componentStyle'
import type { ComponentStyle } from './libs/componentStyle'

export type { ComponentStyle } from './libs/componentStyle'

export interface ComponentProps {
  id?: string
  className?: string
  style?: ComponentStyle
  children?: ReactNode
}

export default function Component({ id, className, style, children }: ComponentProps) {
  return <div id={id} className={className} style={componentStyle(style)}>{children}</div>
}