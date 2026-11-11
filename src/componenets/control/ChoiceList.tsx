import type { KeyboardEvent } from 'react'
import Component from '../Component'
import { FieldError, RequiredMark } from './Control'
import { invalidProps } from '../libs/validation'
import type { ComponentStyle } from '../Component'
import './controls.css'

interface ChoiceListProps {
  id: string
  label?: string
  options: string[]
  value: number[]
  kind: 'checkbox' | 'radio'
  inline?: boolean
  // Greyed out, not focusable, cannot be changed.
  disabled?: boolean
  // Focusable, cannot be changed (view only).
  readOnly?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onToggle: (index: number) => void
}

// Shared by checkbox_group (kind 'checkbox') and option (kind 'radio').
export default function ChoiceList({
  id, label, options, value, kind, inline = false, disabled, readOnly, required, error, style, onToggle,
}: ChoiceListProps) {
  const checkedIndex = value.indexOf(1)
  const locked = disabled || readOnly
  const toggle = (index: number) => {
    if (!locked) onToggle(index)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      toggle(index)
      return
    }
    if (kind !== 'radio' || locked) return
    const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    onToggle(next)
    event.currentTarget.ownerDocument.getElementById(`${id}-${next}`)?.focus()
  }

  return (
    <Component style={style}>
      {label && <div id={`${id}-label`} className="form-label">{label}{required && <RequiredMark />}</div>}
      <div
        role={kind === 'radio' ? 'radiogroup' : 'group'}
        aria-labelledby={label ? `${id}-label` : undefined}
        className={`fs-choice-list${inline ? ' is-inline' : ''}${disabled ? ' is-disabled' : ''}${readOnly ? ' is-readonly' : ''}${error ? ' is-invalid' : ''}`}
        {...invalidProps(id, kind === 'radio' ? required : undefined, error)}
      >
        {options.map((option, index) => {
          const checked = value[index] === 1
          const tabbable = !disabled && (kind === 'checkbox' || (checkedIndex === -1 ? index === 0 : checked))
          return (
            <div
              key={index}
              id={`${id}-${index}`}
              role={kind}
              aria-checked={checked}
              aria-disabled={disabled || undefined}
              aria-readonly={readOnly || undefined}
              aria-labelledby={`${id}-${index}-text`}
              tabIndex={tabbable ? 0 : -1}
              className={`fs-choice-item fs-${kind}${checked ? ' is-checked' : ''}`}
              onClick={() => toggle(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <span className="fs-mark" aria-hidden="true" />
              <span id={`${id}-${index}-text`}>{option}</span>
            </div>
          )
        })}
      </div>
      <FieldError id={id} error={error} />
    </Component>
  )
}
