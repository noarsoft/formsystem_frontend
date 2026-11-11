import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import Control from '../Control'
import { invalidProps } from '../../libs/validation'
import type { ComponentStyle } from '../../Component'
import '../controls.css'

interface DropdownProps {
  id: string
  label?: string
  options: string[]
  value: number[]
  multiple?: boolean
  // Single mode only: show the "-- เลือก --" entry that clears the selection.
  clearable?: boolean
  // Greyed out, not focusable, does not open.
  disabled?: boolean
  // Focusable, does not open (view only).
  readOnly?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onChange: (value: number[]) => void
}

interface Entry {
  text: string
  // null is the "clear selection" entry shown in single mode.
  index: number | null
}

const placeholder = '-- เลือก --'

// A div-based combobox/listbox so the whole design can be styled freely.
export default function Dropdown({
  id, label, options, value, multiple = false, clearable = true, disabled, readOnly, required, error, style, onChange,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollToActive = useRef(false)

  const entries: Entry[] = [
    ...(multiple || !clearable ? [] : [{ text: placeholder, index: null }]),
    ...options.map((text, index) => ({ text, index })),
  ]
  const isSelected = (entry: Entry) => entry.index !== null && value[entry.index] === 1
  const selectedText = options.filter((_, index) => value[index] === 1).join(', ')

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOutside)
    return () => document.removeEventListener('mousedown', closeOutside)
  }, [open])

  // Keep the active entry visible after opening or keyboard navigation (not on hover).
  useEffect(() => {
    if (open && scrollToActive.current) {
      scrollToActive.current = false
      document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, active, id])

  const locked = disabled || readOnly
  const openMenu = () => {
    if (locked) return
    scrollToActive.current = true
    setActive(Math.max(entries.findIndex(isSelected), 0))
    setOpen(true)
  }

  const choose = (entry: Entry) => {
    if (multiple) {
      onChange(value.map((item, index) => (index === entry.index ? 1 - item : item)))
      return
    }
    onChange(options.map((_, index) => (index === entry.index ? 1 : 0)))
    setOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault()
        scrollToActive.current = true
        if (!open) openMenu()
        else setActive((current) => Math.min(Math.max(current + (event.key === 'ArrowDown' ? 1 : -1), 0), entries.length - 1))
        break
      }
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!open) openMenu()
        else choose(entries[active])
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <Control id={id} label={label} style={style} required={required} error={error}>
      <div className="fs-dropdown" ref={rootRef}>
        <div
          id={id}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          className={`form-select fs-dropdown-toggle${disabled ? ' is-disabled' : ''}${readOnly ? ' is-readonly' : ''}${error ? ' is-invalid' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled || undefined}
          aria-readonly={readOnly || undefined}
          aria-controls={`${id}-list`}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
          {...invalidProps(id, required, error)}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onKeyDown}
        >
          {selectedText || <span className="fs-dropdown-placeholder">{placeholder}</span>}
        </div>
        {open && (
          <div id={`${id}-list`} role="listbox" aria-multiselectable={multiple} className="fs-dropdown-menu">
            {entries.map((entry, position) => {
              const selected = isSelected(entry)
              const classes = [
                'fs-dropdown-item',
                multiple && 'fs-checkbox',
                selected && 'is-checked is-selected',
                position === active && 'is-active',
              ].filter(Boolean).join(' ')
              return (
                <div
                  key={position}
                  id={`${id}-opt-${position}`}
                  role="option"
                  aria-selected={selected}
                  className={classes}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(position)}
                  onClick={() => choose(entry)}
                >
                  {multiple && <span className="fs-mark" aria-hidden="true" />}
                  {entry.text}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Control>
  )
}
