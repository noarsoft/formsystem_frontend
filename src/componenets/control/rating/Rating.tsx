import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import Component from '../../Component'
import type { ComponentStyle } from '../../Component'
import { FieldError, RequiredMark } from '../Control'
import { invalidProps } from '../../libs/validation'
import '../controls.css'

interface RatingProps {
  id: string
  label?: string
  value: number | null
  min: number
  max: number
  display: 'star' | 'number'
  minLabel?: string
  maxLabel?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: number | null) => void
}

// A radio group of stars or numbers. Hovering previews a score; clicking the current score
// again clears it; arrow keys / Home / End move the score.
export default function Rating({
  id, label, value, min, max, display, minLabel, maxLabel, disabled, readOnly, required, error, style, onChange,
}: RatingProps) {
  const [hover, setHover] = useState<number | null>(null)
  const locked = disabled || readOnly
  const scores = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const shown = locked ? value : hover ?? value

  const choose = (score: number) => {
    if (locked) return
    if (score === value) {
      // Clearing: drop the hover preview too, or the stars would still look filled.
      setHover(null)
      onChange(null)
    } else {
      onChange(score)
    }
  }
  const focusScore = (score: number) => document.getElementById(`${id}-${score}`)?.focus()

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, score: number) => {
    if (locked) return
    let next: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(score + 1, max)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(score - 1, min)
    else if (event.key === 'Home') next = min
    else if (event.key === 'End') next = max
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      choose(score)
      return
    }
    if (next === null) return
    event.preventDefault()
    onChange(next)
    focusScore(next)
  }

  const classes = ['fs-rating', `is-${display}`, disabled && 'is-disabled', readOnly && 'is-readonly', error && 'is-invalid']
    .filter(Boolean).join(' ')

  return (
    <Component style={style}>
      {label && <div id={`${id}-label`} className="form-label">{label}{required && <RequiredMark />}</div>}
      <div className="fs-rating-wrap">
        <div
          id={id}
          role="radiogroup"
          aria-labelledby={label ? `${id}-label` : undefined}
          className={classes}
          {...invalidProps(id, required, error)}
          onMouseLeave={() => setHover(null)}
        >
          {scores.map((score) => {
            const checked = score === value
            const on = display === 'star' ? shown !== null && score <= shown : score === shown
            const tabbable = !disabled && (value === null ? score === min : checked)
            return (
              <div
                key={score}
                id={`${id}-${score}`}
                role="radio"
                aria-checked={checked}
                aria-label={display === 'star' ? `${score} ดาว` : `${score} คะแนน`}
                aria-disabled={disabled || undefined}
                aria-readonly={readOnly || undefined}
                tabIndex={tabbable ? 0 : -1}
                className={`fs-rating-item${on ? ' is-on' : ''}${checked ? ' is-checked' : ''}`}
                onMouseEnter={() => !locked && setHover(score)}
                onClick={() => choose(score)}
                onKeyDown={(event) => onKeyDown(event, score)}
              >
                {display === 'star' ? <span aria-hidden="true">{on ? '★' : '☆'}</span> : score}
              </div>
            )
          })}
        </div>
        {(minLabel || maxLabel) && (
          <div className="fs-rating-labels form-text">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        )}
      </div>
      <FieldError id={id} error={error} />
    </Component>
  )
}
