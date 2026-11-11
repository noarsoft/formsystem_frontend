import ChoiceList from '../ChoiceList'
import type { OtherInputProps } from '../OtherInput'
import type { ComponentStyle } from '../../Component'

interface OptionProps {
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

// Single selection: choosing an option clears the others.
export default function Option(props: OptionProps) {
  return <ChoiceList kind="radio" {...props} />
}
