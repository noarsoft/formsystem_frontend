import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Component from '../../Component'
import type { ComponentStyle } from '../../Component'
import { FormContext, useFormContext } from '../../libs/formContext'
import '../../control/controls.css'

export interface StepPage {
  title: string
  // Hidden by the page's visible_if: skipped by navigation and not shown in the bar.
  visible: boolean
  // Validation errors on this page (0 = can move on).
  errors: number
  content: ReactNode
}

interface StepsProps {
  id: string
  pages: StepPage[]
  submitText?: string
  style?: ComponentStyle
  onSubmit: () => void
}

// One page at a time with a step bar, ย้อนกลับ / ถัดไป and an optional submit button.
// "ถัดไป" stays on the page (showing its errors) until the page is valid.
export default function Steps({ id, pages, submitText, style, onSubmit }: StepsProps) {
  const context = useFormContext()
  const [current, setCurrent] = useState(0)
  // Furthest page reached: the bar can jump back to any page up to it.
  const [reached, setReached] = useState(0)
  // Pages where "ถัดไป" / submit was pressed: their errors are shown.
  const [tried, setTried] = useState<number[]>([])
  const [blocked, setBlocked] = useState(false)
  // FormBuilder showErrors (a submit outside this control) jumps to the first page with errors.
  const [seenShowErrors, setSeenShowErrors] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)
  // Set by navigation (not on first load) so the new page gets focus once it is on screen.
  const focusPage = useRef(false)

  const visible = pages.flatMap((page, index) => (page.visible ? [index] : []))
  // If the current page got hidden, show the next visible one (or the last).
  const active = visible.includes(current) ? current : (visible.find((i) => i > current) ?? visible.at(-1) ?? 0)
  const position = visible.indexOf(active)
  const isLast = position === visible.length - 1
  const firstWithErrors = visible.find((index) => pages[index].errors > 0)

  if (context.showErrors && !seenShowErrors) {
    setSeenShowErrors(true)
    if (firstWithErrors !== undefined) setCurrent(firstWithErrors)
  } else if (!context.showErrors && seenShowErrors) {
    setSeenShowErrors(false)
  }

  const go = (index: number) => {
    setCurrent(index)
    setReached((r) => Math.max(r, index))
    setBlocked(false)
    focusPage.current = true
  }
  const markTried = (index: number) => setTried((list) => (list.includes(index) ? list : [...list, index]))

  const next = () => {
    if (pages[active].errors > 0) {
      markTried(active)
      setBlocked(true)
      return
    }
    go(visible[position + 1])
  }
  const submit = () => {
    if (firstWithErrors !== undefined) {
      // Show the first page that still has errors, with its errors.
      markTried(firstWithErrors)
      if (firstWithErrors !== active) go(firstWithErrors)
      setBlocked(true)
      return
    }
    onSubmit()
  }

  // Move focus to the new page so keyboard and screen-reader users start there.
  useEffect(() => {
    if (!focusPage.current) return
    focusPage.current = false
    pageRef.current?.focus()
  }, [active])

  const page = pages[active]
  return (
    <Component id={id} className="fs-steps" style={style}>
      <ol className="fs-steps-bar">
        {visible.map((index, n) => {
          const done = n < position
          const state = index === active ? 'is-current' : done ? 'is-done' : ''
          return (
            <li key={index} className={`fs-steps-item ${state}`}>
              <button
                type="button"
                className="fs-steps-button"
                aria-current={index === active ? 'step' : undefined}
                disabled={index > reached && index !== active}
                onClick={() => go(index)}
              >
                <span className="fs-steps-number" aria-hidden="true">{done ? '✓' : n + 1}</span>
                <span className="fs-steps-title">{pages[index].title}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="fs-steps-compact" aria-hidden="true">
        ขั้นที่ {position + 1} จาก {visible.length} · {page.title}
      </div>

      <div
        ref={pageRef}
        id={`${id}-page`}
        role="group"
        aria-label={`ขั้นที่ ${position + 1} จาก ${visible.length}: ${page.title}`}
        tabIndex={-1}
        className="fs-steps-page"
      >
        <FormContext value={{ ...context, showErrors: context.showErrors || tried.includes(active) }}>
          {page.content}
        </FormContext>
      </div>

      {blocked && page.errors > 0 && (
        <div role="status" className="small text-danger mt-2">กรุณากรอกข้อมูลในขั้นนี้ให้ครบก่อน</div>
      )}
      <div className="fs-steps-nav">
        {position > 0 ? (
          <button type="button" className="btn btn-outline-secondary" onClick={() => go(visible[position - 1])}>
            ‹ ย้อนกลับ
          </button>
        ) : <span />}
        {!isLast && <button type="button" className="btn btn-primary" onClick={next}>ถัดไป ›</button>}
        {isLast && submitText && !context.readonly && (
          <button type="button" className="btn btn-primary" onClick={submit}>{submitText}</button>
        )}
      </div>
    </Component>
  )
}
