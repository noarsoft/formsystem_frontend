import { createContext, useContext } from 'react'
import type { FormData } from './controlTypes'

export interface FormContextValue {
  data?: FormData
  onDataChange?: (data: FormData) => void
  // Show every validation error, not only those of controls the user has changed.
  showErrors?: boolean
}

export const FormContext = createContext<FormContextValue>({})

export function useFormContext(): FormContextValue {
  return useContext(FormContext)
}
