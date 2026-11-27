export interface OtherInputProps {
  // Index of the "อื่น ๆ" option among the options.
  index: number
  text: string
  placeholder?: string
  // Shows the red border (selected but left blank once errors are shown).
  invalid?: boolean
  onChange: (text: string) => void
}

// The "โปรดระบุ" text box shown while the "อื่น ๆ" option is selected.
export default function OtherInput({
  id, optionText, text, placeholder = 'โปรดระบุ', invalid, disabled, readOnly, onChange,
}: Omit<OtherInputProps, 'index'> & { id: string, optionText: string, disabled?: boolean, readOnly?: boolean }) {
  return (
    <input
      id={`${id}-other`}
      className={`form-control form-control-sm fs-choice-other${invalid ? ' is-invalid' : ''}`}
      type="text"
      value={text}
      placeholder={placeholder}
      aria-label={`${optionText} (โปรดระบุ)`}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}
