import type { CSSProperties, KeyboardEvent } from 'react'
import Component from '../../Component'
import type { ComponentStyle } from '../../Component'
import { FieldError, RequiredMark } from '../Control'
import { invalidProps } from '../../libs/validation'
import '../controls.css'

interface MatrixProps {
  id: string
  label?: string
  columns: string[]
  rows: string[]
  // 0/1 per column, one array per row.
  values: number[][]
  multiple?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (row: number, value: number[]) => void
}

// A grid of questions sharing the same answer columns. Wide: a table-like grid with the
// column names on top. Narrow (the control's own width, via a container query): one question
// at a time with the answers listed under it (sooner when there are more than 4 columns).
export default function Matrix({
  id, label, columns, rows, values, multiple = false, disabled, readOnly, required, error, style, onChange,
}: MatrixProps) {
  const locked = disabled || readOnly
  const kind = multiple ? 'checkbox' : 'radio'

  const pick = (row: number, column: number) => {
    if (locked) return
    const current = values[row]
    onChange(row, multiple
      ? current.map((v, i) => (i === column ? 1 - v : v))
      : current.map((_, i) => (i === column ? 1 : 0)))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, row: number, column: number) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      pick(row, column)
      return
    }
    if (multiple || locked) return
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const next = (column + step + columns.length) % columns.length
    pick(row, next)
    document.getElementById(`${id}-${row}-${next}`)?.focus()
  }

  const classes = ['fs-matrix', columns.length > 4 && 'is-many', disabled && 'is-disabled', readOnly && 'is-readonly', error && 'is-invalid']
    .filter(Boolean).join(' ')

  return (
    <Component style={style}>
      {label && <div id={`${id}-label`} className="form-label">{label}{required && <RequiredMark />}</div>}
      <div
        id={id}
        role="group"
        aria-labelledby={label ? `${id}-label` : undefined}
        className={classes}
        style={{ '--fs-matrix-columns': columns.length } as CSSProperties}
        {...invalidProps(id, undefined, error)}
      >
        <div className="fs-matrix-head" aria-hidden="true">
          <span />
          {columns.map((column, c) => <span key={c}>{column}</span>)}
        </div>
        {rows.map((rowLabel, r) => {
          const value = values[r]
          const checkedIndex = value.indexOf(1)
          const missing = error !== undefined && checkedIndex === -1
          return (
            <div
              key={r}
              role={multiple ? 'group' : 'radiogroup'}
              aria-labelledby={`${id}-${r}-label`}
              aria-required={!multiple && required ? true : undefined}
              aria-invalid={missing || undefined}
              className={`fs-matrix-row${missing ? ' is-missing' : ''}`}
            >
              <div id={`${id}-${r}-label`} className="fs-matrix-question">{rowLabel}</div>
              {columns.map((column, c) => {
                const checked = value[c] === 1
                const tabbable = !disabled && (multiple || (checkedIndex === -1 ? c === 0 : checked))
                return (
                  <div
                    key={c}
                    id={`${id}-${r}-${c}`}
                    role={kind}
                    aria-checked={checked}
                    aria-label={column}
                    aria-disabled={disabled || undefined}
                    aria-readonly={readOnly || undefined}
                    tabIndex={tabbable ? 0 : -1}
                    className={`fs-choice-item fs-matrix-cell fs-${kind}${checked ? ' is-checked' : ''}`}
                    onClick={() => pick(r, c)}
                    onKeyDown={(event) => onKeyDown(event, r, c)}
                  >
                    <span className="fs-mark" aria-hidden="true" />
                    <span className="fs-matrix-cell-text" aria-hidden="true">{column}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <FieldError id={id} error={error} />
    </Component>
  )
}
