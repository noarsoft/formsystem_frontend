import { useEffect, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PickerModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}

// Bootstrap modal markup without Bootstrap's JavaScript: used by the date and time pickers.
export default function PickerModal({ title, onClose, children, footer }: PickerModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  // Dropdown calls preventDefault on Escape when it closes its own list.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !event.defaultPrevented) onClose()
  }

  return createPortal(
    <>
      <div className="modal-backdrop show" />
      <div
        ref={dialogRef}
        className="modal d-block"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 360 }}>
          <div className="modal-content">
            <div className="modal-header py-2">
              <h2 className="modal-title fs-6">{title}</h2>
              <button type="button" className="btn-close" aria-label="ปิด" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer py-2">{footer}</div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
