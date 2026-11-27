import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import Container from '../container/Container'
import Flex from '../container/flex/Flex'
import Grid from '../container/grid/Grid'
import Button from '../control/button/Button'
import CheckboxGroup from '../control/checkbox_group/CheckboxGroup'
import Dropdown from '../control/dropdown/Dropdown'
import Label from '../control/label/Label'
import Option from '../control/option/Option'
import DateField from '../control/date/date'
import DateRangeField from '../control/date_range/DateRangeField'
import DateTimeField from '../control/datetime/DateTimeField'
import Matrix from '../control/matrix/Matrix'
import NumberField from '../control/number/NumberField'
import Rating from '../control/rating/Rating'
import TimeField from '../control/time/TimeField'
import Textarea from '../control/textarea/Textarea'
import Switch from '../control/switch/Switch'
import Textbox from '../control/textbox/Textbox'
import Accordion from '../custom/accordion/Accordion'
import Badge from '../custom/badge/Badge'
import Card from '../custom/card/Card'
import Steps from '../custom/steps/Steps'
import type { ButtonConfig, ControlConfig } from './controlTypes'
import type { OtherInputProps } from '../control/OtherInput'
import {
  dateRangeBindings, getChoiceState, getOtherState, ratingRange, getDateRangeValue, getDateTimeValue, getDateValue, getMatrixValues, getNumberFieldValue, getRatingValue, getSwitchValue, getTextValue, getTimeValue, replaceAt, toggleAccordionItem, toggleChoice,
  updateData,
} from './controlValues'
import type { ChoiceControl, FieldValue } from './controlValues'
import { useFormContext } from './formContext'
import { inputModeFor, isLocked, numberSettings, validateControl, validateForm } from './validation'
import { isVisible, visibleSteps } from './visibility'

export interface ControlRendererProps {
  config: ControlConfig
  onChange: (config: ControlConfig) => void
  onAction?: (config: ButtonConfig) => void
}

function renderChildren(
  controls: ControlConfig[],
  onChange: (controls: ControlConfig[]) => void,
  onAction?: (config: ButtonConfig) => void,
): ReactNode[] {
  return controls.map((child, index) => (
    <ControlRenderer
      key={child.id ?? index}
      config={child}
      onChange={(updated) => onChange(replaceAt(controls, index, updated))}
      onAction={onAction}
    />
  ))
}

export default function ControlRenderer({ config, onChange, onAction }: ControlRendererProps) {
  const generatedId = useId()
  const { data, onDataChange, showErrors, readonly: formReadonly } = useFormContext()
  // The user has changed this control, so its validation error may be shown.
  const [touched, setTouched] = useState(false)
  const id = config.id ?? generatedId
  // Hidden by visible_if: render nothing (a grid keeps the empty cell). Hooks above stay unconditional.
  if (!isVisible(config, data)) return null
  // View only, set on the control or on the whole form (<FormBuilder readonly>).
  const readOnly = formReadonly === true || ('readonly' in config && config.readonly === true)
  // Locked controls are not validated (validateControl skips them; the form-wide flag is checked here).
  const message = readOnly ? null : validateControl(config, data)
  // The red * means "you must fill this in": not shown when the user cannot change it.
  const required = 'required' in config && config.required === true && !readOnly && !isLocked(config)
  const error = message !== null && (touched || showErrors) ? message : undefined

  // Bound controls write to the data; unbound ones keep their value inline.
  const commit = (value: FieldValue) => {
    if (readOnly) return
    setTouched(true)
    if ('databinding' in config && config.databinding !== undefined) {
      onDataChange?.(updateData(data, config.databinding, value))
    } else {
      onChange({ ...config, value } as ControlConfig)
    }
  }

  // "อื่น ๆ (โปรดระบุ)" text box of a choice control; its text is saved like any text field.
  const otherProps = (choice: ChoiceControl, options: string[], value: number[]): OtherInputProps | undefined => {
    const state = getOtherState(choice, options, value, data)
    const other = choice.other
    if (!state || !other) return undefined
    return {
      index: state.index,
      text: state.text,
      placeholder: other.placeholder,
      invalid: error !== undefined && state.selected && state.text.trim() === '',
      onChange: (text) => {
        if (readOnly) return
        setTouched(true)
        if (other.databinding !== undefined) onDataChange?.(updateData(data, other.databinding, text))
        else onChange({ ...choice, other: { ...other, value: text } })
      },
    }
  }

  switch (config.type) {
    case 'textbox':
      return (
        <Textbox
          id={id}
          readOnly={readOnly}
          maxLength={config.max_length}
          inputMode={inputModeFor(config.format)}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          value={getTextValue(config, data)}
          placeholder={config.placeholder}
          inputType={config.input_type}
          disabled={config.disabled}
          onChange={commit}
        />
      )

    case 'date':
      return (
        <DateField
          id={id}
          readOnly={readOnly}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          value={getDateValue(config, data)}
          placeholder={config.placeholder}
          disabled={config.disabled}
          minYear={config.min_year}
          maxYear={config.max_year}
          onChange={commit}
        />
      )

    case 'number':
      return (
        <NumberField
          id={id}
          readOnly={readOnly}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          value={getNumberFieldValue(config, data)}
          placeholder={config.placeholder}
          decimals={numberSettings(config).decimals}
          allowNegative={config.min === undefined || config.min < 0}
          unit={config.unit}
          disabled={config.disabled}
          onChange={commit}
        />
      )

    case 'matrix':
      return (
        <Matrix
          id={id}
          readOnly={readOnly}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          columns={config.columns}
          rows={config.rows.map((row) => row.label)}
          values={getMatrixValues(config, data)}
          multiple={config.multiple}
          disabled={config.disabled}
          onChange={(index, value) => {
            // Each row is written on its own: to its data key, or to its inline value.
            if (readOnly) return
            setTouched(true)
            const row = config.rows[index]
            if (row.databinding !== undefined) onDataChange?.(updateData(data, row.databinding, value))
            else onChange({ ...config, rows: replaceAt(config.rows, index, { ...row, value }) })
          }}
        />
      )

    case 'rating': {
      const { min, max } = ratingRange(config)
      return (
        <Rating
          id={id}
          readOnly={readOnly}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          value={getRatingValue(config, data)}
          min={min}
          max={max}
          display={config.display ?? 'star'}
          minLabel={config.min_label}
          maxLabel={config.max_label}
          disabled={config.disabled}
          onChange={commit}
        />
      )
    }

    case 'date_range': {
      const bindings = dateRangeBindings(config)
      return (
        <DateRangeField
          id={id}
          readOnly={readOnly}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          value={getDateRangeValue(config, data)}
          placeholder={config.placeholder}
          disabled={config.disabled}
          minYear={config.min_year}
          maxYear={config.max_year}
          onChange={(end, value) => {
            // Each end is written on its own: to its data key, or to value_from / value_to.
            if (readOnly) return
            setTouched(true)
            if (bindings) onDataChange?.(updateData(data, bindings[end], value))
            else onChange({ ...config, [end === 'from' ? 'value_from' : 'value_to']: value })
          }}
        />
      )
    }

    case 'time':
      return (
        <TimeField
          id={id}
          readOnly={readOnly}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          value={getTimeValue(config, data)}
          placeholder={config.placeholder}
          disabled={config.disabled}
          minuteStep={config.minute_step}
          onChange={commit}
        />
      )

    case 'datetime':
      return (
        <DateTimeField
          id={id}
          readOnly={readOnly}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          value={getDateTimeValue(config, data)}
          placeholder={config.placeholder}
          disabled={config.disabled}
          minYear={config.min_year}
          maxYear={config.max_year}
          minuteStep={config.minute_step}
          onChange={commit}
        />
      )

    case 'textarea':
      return (
        <Textarea
          id={id}
          readOnly={readOnly}
          maxLength={config.max_length}
          inputMode={inputModeFor(config.format)}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          value={getTextValue(config, data)}
          placeholder={config.placeholder}
          rows={config.rows}
          disabled={config.disabled}
          onChange={commit}
        />
      )

    case 'switch':
      return (
        <Switch
          id={id}
          readOnly={readOnly}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          text={config.text}
          value={getSwitchValue(config, data)}
          disabled={config.disabled}
          onChange={commit}
        />
      )

    case 'label':
      return <Label text={config.text} htmlFor={config.for} style={config.style} />

    case 'dropdown': {
      const { options, value } = getChoiceState(config, config.multiple ?? false, data)
      return (
        <Dropdown
          id={id}
          readOnly={readOnly}
          disabled={config.disabled}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          options={options}
          value={value}
          other={otherProps(config, options, value)}
          multiple={config.multiple}
          onChange={commit}
        />
      )
    }

    case 'checkbox_group': {
      const { options, value } = getChoiceState(config, true, data)
      return (
        <CheckboxGroup
          id={id}
          readOnly={readOnly}
          disabled={config.disabled}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          options={options}
          value={value}
          other={otherProps(config, options, value)}
          inline={config.inline}
          onToggle={(index) => commit(toggleChoice(value, index, true))}
        />
      )
    }

    case 'option': {
      const { options, value } = getChoiceState(config, false, data)
      return (
        <Option
          id={id}
          readOnly={readOnly}
          disabled={config.disabled}
          label={config.label}
          required={required}
          error={error}
          style={config.style}
          options={options}
          value={value}
          other={otherProps(config, options, value)}
          inline={config.inline}
          onToggle={(index) => commit(toggleChoice(value, index, false))}
        />
      )
    }

    case 'button':
      return (
        <Button
          text={config.text}
          variant={config.variant}
          outline={config.outline}
          disabled={config.disabled}
          style={config.style}
          onClick={() => onAction?.(config)}
        />
      )

    case 'container':
      return (
        <Container id={config.id} className={`d-flex flex-column gap-${config.gap ?? 3}`} style={config.style}>
          {renderChildren(config.controls, (controls) => onChange({ ...config, controls }), onAction)}
        </Container>
      )

    case 'grid': {
      const nodes = renderChildren(config.controls, (controls) => onChange({ ...config, controls }), onAction)
      return (
        <Grid
          id={config.id}
          style={config.style}
          columns={config.columns}
          rows={config.rows}
          gap={config.gap}
          cells={config.controls.map((child, index) => ({
            key: String(child.id ?? index),
            colno: child.colno,
            rowno: child.rowno,
            colspan: child.colspan,
            rowspan: child.rowspan,
            node: nodes[index],
          }))}
        />
      )
    }

    case 'flex':
      return (
        <Flex
          id={config.id}
          style={config.style}
          isHorizontal={config.is_horizontal === 1}
          gap={config.gap}
          wrap={config.wrap}
          align={config.align}
          justify={config.justify}
        >
          {renderChildren(config.controls, (controls) => onChange({ ...config, controls }), onAction)}
        </Flex>
      )

    case 'accordion':
      return (
        <Accordion
          id={id}
          style={config.style}
          onToggle={(index) => onChange(toggleAccordionItem(config, index))}
          items={config.items.map((item, itemIndex) => ({
            title: item.title,
            open: item.open ?? false,
            content: renderChildren(
              item.controls,
              (controls) => onChange({
                ...config,
                items: replaceAt(config.items, itemIndex, { ...item, controls }),
              }),
              onAction,
            ),
          }))}
        />
      )

    case 'steps': {
      const shown = visibleSteps(config, data)
      return (
        <Steps
          id={id}
          style={config.style}
          submitText={config.submit_text}
          onSubmit={() => onAction?.({ type: 'button', id: `${id}_submit`, text: config.submit_text ?? '' })}
          pages={config.steps.map((step, index) => ({
            title: step.title,
            visible: shown.includes(index),
            // Read-only forms can be paged through freely.
            errors: formReadonly ? 0 : validateForm({ controls: step.controls }, data).length,
            content: renderChildren(
              step.controls,
              (controls) => onChange({ ...config, steps: replaceAt(config.steps, index, { ...step, controls }) }),
              onAction,
            ),
          }))}
        />
      )
    }

    case 'card':
      return (
        <Card
          id={config.id}
          style={config.style}
          header={config.header}
          title={config.title}
          subtitle={config.subtitle}
          text={config.text}
          footer={config.footer}
        >
          {renderChildren(config.controls ?? [], (controls) => onChange({ ...config, controls }), onAction)}
        </Card>
      )

    case 'badge':
      return <Badge text={config.text} variant={config.variant} pill={config.pill} style={config.style} />

    default:
      throw new Error(`Unsupported control type: ${String((config as { type: unknown }).type)}`)
  }
}
