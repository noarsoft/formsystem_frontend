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
import Password from '../control/password/password'
import Textarea from '../control/textarea/Textarea'
import Textbox from '../control/textbox/Textbox'
import Accordion from '../custom/accordion/Accordion'
import Badge from '../custom/badge/Badge'
import Card from '../custom/card/Card'
import type { ButtonConfig, ControlConfig } from './controlTypes'
import {
  getChoiceState, getDateValue, getTextValue, replaceAt, toggleAccordionItem, toggleChoice,
  updateData,
} from './controlValues'
import type { FieldValue } from './controlValues'
import { useFormContext } from './formContext'
import { validateControl } from './validation'

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
  const { data, onDataChange, showErrors } = useFormContext()
  // The user has changed this control, so its validation error may be shown.
  const [touched, setTouched] = useState(false)
  const id = config.id ?? generatedId
  const message = validateControl(config, data)
  const error = message !== null && (touched || showErrors) ? message : undefined

  // Bound controls write to the data; unbound ones keep their value inline.
  const commit = (value: FieldValue) => {
    setTouched(true)
    if ('databinding' in config && config.databinding !== undefined) {
      onDataChange?.(updateData(data, config.databinding, value))
    } else {
      onChange({ ...config, value } as ControlConfig)
    }
  }

  switch (config.type) {
    case 'textbox':
      return (
        <Textbox
          id={id}
          label={config.label}
          required={config.required}
          error={error}
          style={config.style}
          value={getTextValue(config, data)}
          placeholder={config.placeholder}
          inputType={config.input_type}
          disabled={config.disabled}
          onChange={commit}
        />
      )

    case 'password':
      return (
        <Password
          id={id}
          label={config.label}
          required={config.required}
          error={error}
          style={config.style}
          value={getTextValue(config, data)}
          placeholder={config.placeholder}
          disabled={config.disabled}
          onChange={commit}
        />
      )

    case 'date':
      return (
        <DateField
          id={id}
          label={config.label}
          required={config.required}
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

    case 'textarea':
      return (
        <Textarea
          id={id}
          label={config.label}
          required={config.required}
          error={error}
          style={config.style}
          value={getTextValue(config, data)}
          placeholder={config.placeholder}
          rows={config.rows}
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
          label={config.label}
          required={config.required}
          error={error}
          style={config.style}
          options={options}
          value={value}
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
          label={config.label}
          required={config.required}
          error={error}
          style={config.style}
          options={options}
          value={value}
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
          label={config.label}
          required={config.required}
          error={error}
          style={config.style}
          options={options}
          value={value}
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
