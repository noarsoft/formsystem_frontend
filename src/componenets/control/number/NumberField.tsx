import { useState } from 'react'
import Control from '../Control'
import type { ComponentStyle } from '../../Component'
import { formatNumber, parseNumberText, sanitizeNumberText } from '../../libs/numberValue'
import { invalidProps, NOT_A_NUMBER_MESSAGE } from '../../libs/validation'

interface NumberFieldProps {
  id: string
  label?: string
  value: number | null
  placeholder?: string
  decimals: number
  // "-" can be typed only when the minimum allows negatives.
  allowNegative: boolean
  unit?: string
  disabled?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: number | null) => void
}

// A text box (not <input type="number">: no scroll-wheel changes, no "e") that accepts only what
// can form a number. Shows "1,234.5" when not focused and plain "1234.5" while editing.
export default function NumberField({
  id, label, value, placeholder, decimals, allowNegative, unit, disabled, required, error, style, onChange,
}: NumberFieldProps) {
  // What is typed while the box has focus; null when not editing.
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? (value === null ? '' : formatNumber(value, decimals))
  // "-" or "." alone is not a number yet: say so, unless validation already has a message.
  const unfinished = draft !== null && draft.trim() !== '' && parseNumberText(draft) === null
  const shown = error ?? (unfinished ? NOT_A_NUMBER_MESSAGE : undefined)

  const input = (
    <input
      id={id}
      className={`form-control${shown ? ' is-invalid' : ''}`}
      type="text"
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      value={text}
      placeholder={placeholder}
      disabled={disabled}
      {...invalidProps(id, required, shown)}
      onFocus={() => setDraft(value === null ? '' : String(value))}
      onBlur={() => setDraft(null)}
      onChange={(event) => {
        const next = sanitizeNumberText(event.currentTarget.value, decimals, allowNegative)
        setDraft(next)
        onChange(parseNumberText(next))
      }}
    />
  )

  return (
    <Control id={id} label={label} style={style} required={required} error={shown}>
      {unit ? (
        <div className={`input-group${shown ? ' has-validation' : ''}`}>
          {input}
          <span className="input-group-text">{unit}</span>
        </div>
      ) : input}
    </Control>
  )
}
