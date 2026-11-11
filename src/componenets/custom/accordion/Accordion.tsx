import type { ReactNode } from 'react'
import Container from '../../container/Container'
import type { ComponentStyle } from '../../Component'

export interface AccordionItem {
  title: string
  open: boolean
  content: ReactNode
}

interface AccordionProps {
  id: string
  items: AccordionItem[]
  style?: ComponentStyle
  onToggle: (index: number) => void
}

// Open state is owned by the caller, so Bootstrap's JavaScript is not needed.
export default function Accordion({ id, items, style, onToggle }: AccordionProps) {
  return (
    <Container id={id} className="accordion" style={style}>
      {items.map((item, index) => {
        const panelId = `${id}-panel-${index}`
        return (
          <div key={index} className="accordion-item">
            <h2 className="accordion-header">
              <button
                type="button"
                className={item.open ? 'accordion-button' : 'accordion-button collapsed'}
                aria-expanded={item.open}
                aria-controls={panelId}
                onClick={() => onToggle(index)}
              >
                {item.title}
              </button>
            </h2>
            <div id={panelId} className={item.open ? 'accordion-collapse collapse show' : 'accordion-collapse collapse'}>
              <Container className="accordion-body d-flex flex-column gap-3">{item.content}</Container>
            </div>
          </div>
        )
      })}
    </Container>
  )
}
