import type { ComponentStyle } from '../Component'
import Container from '../container/Container'
import ControlRenderer from './ControlRenderer'
import type { ButtonConfig, FormData, FormDocument } from './controlTypes'
import { replaceAt } from './controlValues'
import { FormContext } from './formContext'

export type { ControlConfig, FormData, FormDocument } from './controlTypes'

export interface FormBuilderProps {
  form: FormDocument
  onChange: (form: FormDocument) => void
  // Values for controls that set `databinding`; the data always wins over inline `value`.
  data?: FormData
  onDataChange?: (data: FormData) => void
  onAction?: (config: ButtonConfig) => void
  // true = show every validation error (e.g. after a submit attempt); otherwise a control
  // shows its error only after the user changes it. Check the whole form with validateForm().
  showErrors?: boolean
  // true = every input control is view-only (readonly) and shows no validation errors.
  readonly?: boolean
  style?: ComponentStyle
}

export default function FormBuilder({
  form, onChange, data, onDataChange, onAction, showErrors = false, readonly = false, style,
}: FormBuilderProps) {
  return (
    <FormContext value={{ data, onDataChange, showErrors, readonly }}>
      <Container style={style}>
        {form.controls.map((config, index) => (
          <ControlRenderer
            key={config.id ?? index}
            config={config}
            onAction={onAction}
            onChange={(updated) => onChange({ ...form, controls: replaceAt(form.controls, index, updated) })}
          />
        ))}
      </Container>
    </FormContext>
  )
}
