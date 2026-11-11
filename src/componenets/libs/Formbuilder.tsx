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
  style?: ComponentStyle
}

export default function FormBuilder({
  form, onChange, data, onDataChange, onAction, style,
}: FormBuilderProps) {
  return (
    <FormContext value={{ data, onDataChange }}>
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
