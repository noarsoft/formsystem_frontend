import { createContext, useContext } from 'react'
import type { FormData } from './controlTypes'

export interface FormContextValue {
  data?: FormData
  onDataChange?: (data: FormData) => void
  // Show every validation error, not only those of controls the user has changed.
  showErrors?: boolean
  // Every input control is view-only (e.g. staff reviewing a submitted form).
  readonly?: boolean
}

export const FormContext = createContext<FormContextValue>({})

export function useFormContext(): FormContextValue {
  return useContext(FormContext)
}
