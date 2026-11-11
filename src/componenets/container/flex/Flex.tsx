import type { ReactNode } from 'react'
import Container from '../Container'
import type { ComponentProps } from '../../Component'

interface FlexProps extends Omit<ComponentProps, 'children'> {
  isHorizontal: boolean
  gap?: number
  wrap?: boolean
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  children?: ReactNode
}

export default function Flex({
  isHorizontal, gap = 3, wrap = false, align, justify, children, ...props
}: FlexProps) {
  const classes = [
    'd-flex',
    isHorizontal ? 'flex-row' : 'flex-column',
    `gap-${gap}`,
    wrap && 'flex-wrap',
    align && `align-items-${align}`,
    justify && `justify-content-${justify}`,
  ].filter(Boolean).join(' ')

  return <Container className={classes} {...props}>{children}</Container>
}
