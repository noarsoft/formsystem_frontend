import { createContext, useContext } from 'react'
import type { FormData } from './controlTypes'

export interface FormContextValue {
  data?: FormData
  onDataChange?: (data: FormData) => void
}

export const FormContext = createContext<FormContextValue>({})

export function useFormContext(): FormContextValue {
  return useContext(FormContext)
}
