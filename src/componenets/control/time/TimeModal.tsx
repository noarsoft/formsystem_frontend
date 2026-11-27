import { useState } from 'react'
import PickerModal from '../date/PickerModal'
import TimePicker from './TimePicker'
import { nowTimeParts, roundTimeDown, toTimeNumber } from '../../libs/dateValue'
import type { TimeParts } from '../../libs/dateValue'

interface TimeModalProps {
  id: string
  value: TimeParts | null
  minuteStep?: number
  // An HHMM number, or null to clear the time.
  onSelect: (value: number | null) => void
  onClose: () => void
}

export default function TimeModal({ id, value, minuteStep = 1, onSelect, onClose }: TimeModalProps) {
  const [time, setTime] = useState<TimeParts>(value ?? roundTimeDown(nowTimeParts(), minuteStep))

  return (
    <PickerModal
      title="เลือกเวลา"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onSelect(null)}>
            ล้างค่า
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setTime(roundTimeDown(nowTimeParts(), minuteStep))}
          >
            ตอนนี้
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onSelect(toTimeNumber(time))}>
            ตกลง
          </button>
        </>
      )}
    >
      <TimePicker id={id} value={time} minuteStep={minuteStep} onChange={setTime} />
    </PickerModal>
  )
}
