import ChoiceList from '../ChoiceList'
import type { OtherInputProps } from '../OtherInput'
import type { ComponentStyle } from '../../Component'

interface CheckboxGroupProps {
  id: string
  label?: string
  options: string[]
  value: number[]
  inline?: boolean
  other?: OtherInputProps
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  error?: string
  style?: ComponentStyle
  onToggle: (index: number) => void
}

// Multiple selection: any number of options can be checked.
export default function CheckboxGroup(props: CheckboxGroupProps) {
  return <ChoiceList kind="checkbox" {...props} />
}
