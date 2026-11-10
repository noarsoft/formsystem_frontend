import type { ReactNode } from 'react'
import Component from '../../Component'
import type { ComponentStyle } from '../../Component'
import Container from '../../container/Container'

interface CardProps {
  id?: string
  header?: string
  title?: string
  subtitle?: string
  text?: string
  footer?: string
  style?: ComponentStyle
  children?: ReactNode
}

export default function Card({
  id, header, title, subtitle, text, footer, style, children,
}: CardProps) {
  return (
    <Component id={id} className="card" style={style}>
      {header && <div className="card-header">{header}</div>}
      <Container className="card-body d-flex flex-column gap-3">
        {(title || subtitle || text) && (
          <div>
            {title && <h5 className="card-title">{title}</h5>}
            {subtitle && <h6 className="card-subtitle text-body-secondary">{subtitle}</h6>}
            {text && <p className="card-text mt-2 mb-0">{text}</p>}
          </div>
        )}
        {children}
      </Container>
      {footer && <div className="card-footer text-body-secondary">{footer}</div>}
    </Component>
  )
}
