import { useState } from 'react'
import Dropdown from '../dropdown/Dropdown'
import PickerModal from './PickerModal'
import TimePicker from '../time/TimePicker'
import {
  daysInMonth, firstWeekday, nowTimeParts, roundTimeDown, thaiMonths, todayParts, toDateNumber,
  toDateTimeNumber, weekdayLabels,
} from '../../libs/dateValue'
import type { DateParts, TimeParts } from '../../libs/dateValue'

interface CalendarModalProps {
  id: string
  value: DateParts | null
  minYear: number
  maxYear: number
  // datetime: also pick a time, then confirm with "ตกลง" (a day click no longer closes).
  withTime?: boolean
  time?: TimeParts | null
  minuteStep?: number
  // YYYYMMDD (or YYYYMMDDHHMM with withTime) in Buddhist Era, or null to clear.
  onSelect: (value: number | null) => void
  onClose: () => void
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

export default function CalendarModal({
  id, value, minYear, maxYear, withTime = false, time = null, minuteStep = 1, onSelect, onClose,
}: CalendarModalProps) {
  const today = todayParts()
  const start = value ?? today
  const [view, setView] = useState({ year: clamp(start.year, minYear, maxYear), month: start.month })
  // With time, the chosen day and time wait here until "ตกลง".
  const [pendingDate, setPendingDate] = useState<DateParts | null>(value)
  const [pendingTime, setPendingTime] = useState<TimeParts>(time ?? roundTimeDown(nowTimeParts(), minuteStep))

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
  const selectedDate = withTime ? pendingDate : value

  const pickDay = (day: number) => {
    const parts = { year: view.year, month: view.month, day }
    if (withTime) setPendingDate(parts)
    else onSelect(toDateNumber(parts))
  }
  const pickNow = () => {
    if (!withTime) {
      onSelect(toDateNumber(today))
      return
    }
    setPendingDate(today)
    setPendingTime(roundTimeDown(nowTimeParts(), minuteStep))
    setView({ year: today.year, month: today.month })
  }

  return (
    <PickerModal
      title={withTime ? 'เลือกวันและเวลา (พ.ศ.)' : 'เลือกวันที่ (พ.ศ.)'}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onSelect(null)}>
            ล้างค่า
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            disabled={!todayInRange}
            onClick={pickNow}
          >
            {withTime ? 'ตอนนี้' : 'วันนี้'}
          </button>
          {withTime && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={pendingDate === null}
              onClick={() => pendingDate && onSelect(toDateTimeNumber({ ...pendingDate, ...pendingTime }))}
            >
              ตกลง
            </button>
          )}
        </>
      )}
    >
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
          const selected = isSame(selectedDate, day)
          const style = selected ? 'btn-primary' : isSame(today, day) ? 'btn-outline-primary' : 'btn-light'
          return (
            <button
              key={day}
              type="button"
              className={`btn btn-sm ${style}`}
              aria-pressed={selected}
              aria-label={`${day} ${thaiMonths[view.month - 1]} ${view.year}`}
              onClick={() => pickDay(day)}
            >
              {day}
            </button>
          )
        })}
      </div>

      {withTime && (
        <div className="mt-3">
          <TimePicker id={`${id}-time`} value={pendingTime} minuteStep={minuteStep} onChange={setPendingTime} />
        </div>
      )}
    </PickerModal>
  )
}
