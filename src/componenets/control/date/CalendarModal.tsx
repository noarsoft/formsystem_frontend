import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import Dropdown from '../dropdown/Dropdown'
import {
  daysInMonth, firstWeekday, thaiMonths, todayParts, toDateNumber, weekdayLabels,
} from '../../libs/dateValue'
import type { DateParts } from '../../libs/dateValue'

interface CalendarModalProps {
  id: string
  value: DateParts | null
  minYear: number
  maxYear: number
  // A YYYYMMDD Buddhist-era number, or null to clear the date.
  onSelect: (value: number | null) => void
  onClose: () => void
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

export default function CalendarModal({
  id, value, minYear, maxYear, onSelect, onClose,
}: CalendarModalProps) {
  const today = todayParts()
  const start = value ?? today
  const [view, setView] = useState({ year: clamp(start.year, minYear, maxYear), month: start.month })
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
  const canGo = (step: number) => {
    const index = view.year * 12 + (view.month - 1) + step
    return Math.floor(index / 12) >= minYear && Math.floor(index / 12) <= maxYear
  }
  const go = (step: number) => {
    const index = view.year * 12 + (view.month - 1) + step
    setView({ year: Math.floor(index / 12), month: (index % 12) + 1 })
  }

  const blanks = firstWeekday(view.year, view.month)
  const days = Array.from({ length: daysInMonth(view.year, view.month) }, (_, i) => i + 1)
  const isSame = (parts: DateParts | null, day: number) =>
    parts !== null && parts.year === view.year && parts.month === view.month && parts.day === day
  const todayInRange = today.year >= minYear && today.year <= maxYear

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
        aria-label="เลือกวันที่"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 360 }}>
          <div className="modal-content">
            <div className="modal-header py-2">
              <h2 className="modal-title fs-6">เลือกวันที่ (พ.ศ.)</h2>
              <button type="button" className="btn-close" aria-label="ปิด" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="d-flex align-items-start gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  aria-label="เดือนก่อนหน้า"
                  disabled={!canGo(-1)}
                  onClick={() => go(-1)}
                >
                  ‹
                </button>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <Dropdown
                    id={`${id}-month`}
                    options={thaiMonths}
                    value={thaiMonths.map((_, index) => (index + 1 === view.month ? 1 : 0))}
                    clearable={false}
                    onChange={(next) => {
                      const index = next.indexOf(1)
                      if (index >= 0) setView((current) => ({ ...current, month: index + 1 }))
                    }}
                  />
                </div>
                <div style={{ width: 110 }}>
                  <Dropdown
                    id={`${id}-year`}
                    options={years.map(String)}
                    value={years.map((year) => (year === view.year ? 1 : 0))}
                    clearable={false}
                    onChange={(next) => {
                      const index = next.indexOf(1)
                      if (index >= 0) setView((current) => ({ ...current, year: years[index] }))
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  aria-label="เดือนถัดไป"
                  disabled={!canGo(1)}
                  onClick={() => go(1)}
                >
                  ›
                </button>
              </div>

              <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {weekdayLabels.map((label) => (
                  <div key={label} className="text-center small fw-semibold text-body-secondary">{label}</div>
                ))}
                {Array.from({ length: blanks }, (_, i) => <div key={`blank-${i}`} />)}
                {days.map((day) => {
                  const selected = isSame(value, day)
                  const style = selected ? 'btn-primary' : isSame(today, day) ? 'btn-outline-primary' : 'btn-light'
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`btn btn-sm ${style}`}
                      aria-pressed={selected}
                      aria-label={`${day} ${thaiMonths[view.month - 1]} ${view.year}`}
                      onClick={() => onSelect(toDateNumber({ year: view.year, month: view.month, day }))}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="modal-footer py-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onSelect(null)}>
                ล้างค่า
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                disabled={!todayInRange}
                onClick={() => onSelect(toDateNumber(today))}
              >
                วันนี้
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
