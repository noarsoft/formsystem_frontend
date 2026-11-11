// visible_if: decides from the data whether a control is shown.
import type { ControlConfig, FormData, VisibleCondition } from './controlTypes'

type Expected = string | number

const OPERATORS = ['equals', 'not_equals', 'in', 'filled'] as const

// The answer(s) a data field currently holds: choice fields give the selected option texts,
// text gives [text] (or [] when blank), numbers give [n] (or [] when null).
function answers(name: string, condition: VisibleCondition, data: FormData | undefined): Expected[] {
  const field = data?.[condition.field]
  if (!field) {
    throw new Error(`Control "${name}" visible_if refers to "${condition.field}" but the data has no such field`)
  }
  if (field.type === 'string') return field.value.trim() === '' ? [] : [field.value]
  if (field.is_array === 1) {
    if (!field.options) {
      throw new Error(`Control "${name}" visible_if needs "options" in data field "${condition.field}" to compare by option text`)
    }
    return field.options.filter((_, i) => field.value[i] === 1)
  }
  return field.value === null ? [] : [field.value]
}

function holds(name: string, condition: VisibleCondition, data: FormData | undefined): boolean {
  const used = OPERATORS.filter((op) => condition[op] !== undefined)
  if (used.length !== 1) {
    throw new Error(`Control "${name}" visible_if on "${condition.field}" needs exactly one of ${OPERATORS.join(', ')}`)
  }
  const values = answers(name, condition, data)
  switch (used[0]) {
    case 'equals':
      return values.includes(condition.equals as Expected)
    case 'not_equals':
      // "Answered, and not this": nothing chosen yet does not count as "not ไม่มี".
      return values.length > 0 && !values.includes(condition.not_equals as Expected)
    case 'in': {
      if (!Array.isArray(condition.in)) throw new Error(`Control "${name}" visible_if "in" must be a list`)
      const list = condition.in
      return values.some((value) => list.includes(value))
    }
    case 'filled':
      return (values.length > 0) === condition.filled
  }
}

// True when the control has no visible_if, or every condition holds. A bad condition
// (unknown data key, no operator, two operators) throws.
export function isVisible(config: ControlConfig, data?: FormData): boolean {
  const rule = config.visible_if
  if (rule === undefined) return true
  const name = config.id ?? config.type
  const conditions = Array.isArray(rule) ? rule : [rule]
  return conditions.every((condition) => holds(name, condition, data))
}

// Data keys a control's visible_if reads (so the demo editor keeps them).
export function visibleIfFields(config: ControlConfig): string[] {
  const rule = config.visible_if
  if (rule === undefined) return []
  return (Array.isArray(rule) ? rule : [rule]).map((condition) => condition.field)
}
