import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let values
let layout
let FormBuilder
let componentStyle
let docs
let dates
let validation
let editor

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  dates = await server.ssrLoadModule('/src/componenets/libs/dateValue.ts')
  values = await server.ssrLoadModule('/src/componenets/libs/controlValues.ts')
  validation = await server.ssrLoadModule('/src/componenets/libs/validation.ts')
  editor = await server.ssrLoadModule('/src/demo/editor.ts')
  layout = await server.ssrLoadModule('/src/componenets/libs/gridLayout.ts')
  FormBuilder = (await server.ssrLoadModule('/src/componenets/libs/Formbuilder.tsx')).default
  componentStyle = (await server.ssrLoadModule('/src/componenets/libs/componentStyle.ts')).componentStyle
  docs = await server.ssrLoadModule('/src/form/document/docs.ts')
})

after(async () => {
  if (server) await server.close()
})

const render = (controls, data, props = {}) => renderToStaticMarkup(
  React.createElement(FormBuilder, { form: { controls }, data, onChange: () => {}, onDataChange: () => {}, ...props }),
)

const data = {
  fname: { type: 'string', value: 'piyavach' },
  hobby: { type: 'number', is_array: 1, options: ['guitar', 'piano', 'violin'], value: [0, 1, 1] },
}

test('style accepts requested JSON names and conventional aliases', () => {
  assert.deepEqual(componentStyle({
    padding: 4, margin: '1em', front_size: 18, color: 'red', boarder: '1px solid',
  }), { padding: 4, margin: '1em', fontSize: 18, color: 'red', border: '1px solid' })
  assert.equal(componentStyle({ font_size: 20, front_size: 18 }).fontSize, 20)
})

test('unbound choice values are validated against options', () => {
  const config = { type: 'dropdown', id: 'skill', options: ['a', 'b', 'c'], value: [1, 1, 0] }
  assert.deepEqual(values.getChoiceState(config, true).value, [1, 1, 0])
  assert.throws(() => values.getChoiceState(config, false), /at most one/)
  assert.throws(() => values.getChoiceState({ ...config, value: [1] }, true), /matching options/)
  assert.throws(() => values.getChoiceState({ ...config, value: [1, 2, 0] }, true), /0\/1/)
  assert.deepEqual(values.getChoiceState({ ...config, value: undefined }, false).value, [0, 0, 0])
})

test('data wins over inline value and options', () => {
  assert.equal(values.getTextValue({ type: 'textbox', databinding: 'fname', value: '' }, data), 'piyavach')
  const state = values.getChoiceState({ type: 'checkbox_group', databinding: 'hobby', options: ['x'], value: [1] }, true, data)
  assert.deepEqual(state, { options: ['guitar', 'piano', 'violin'], value: [0, 1, 1] })
  const noOptions = { ...data, hobby: { ...data.hobby, options: undefined } }
  assert.deepEqual(
    values.getChoiceState({ type: 'checkbox_group', databinding: 'hobby', options: ['a', 'b', 'c'] }, true, noOptions).options,
    ['a', 'b', 'c'],
  )
})

test('invalid bindings fail explicitly', () => {
  const textbox = { type: 'textbox', id: 't', databinding: 'missing' }
  assert.throws(() => values.getTextValue(textbox, data), /bound to "missing"/)
  assert.throws(() => values.getTextValue(textbox), /bound to "missing"/)
  assert.throws(() => values.getTextValue({ ...textbox, databinding: 'hobby' }, data), /string field/)
  assert.throws(
    () => values.getChoiceState({ type: 'option', databinding: 'fname' }, false, data),
    /number array field/,
  )
  assert.throws(
    () => values.getChoiceState({ type: 'option', databinding: 'hobby' }, false, data),
    /at most one/,
  )
  assert.throws(() => values.updateData(data, 'nope', 'x'), /does not exist/)
  assert.throws(() => values.updateData(data, 'fname', [1]), /does not match/)
  assert.throws(() => values.updateData(data, 'hobby', [1, 0]), /matching options/)
})

test('updateData keeps metadata and unrelated fields without mutating', () => {
  const updated = values.updateData(data, 'fname', 'Alice')
  assert.equal(updated.fname.value, 'Alice')
  assert.equal(data.fname.value, 'piyavach')
  assert.strictEqual(updated.hobby, data.hobby)
  const choices = values.updateData(updated, 'hobby', [1, 0, 0])
  assert.deepEqual(choices.hobby, { ...data.hobby, value: [1, 0, 0] })
  assert.deepEqual(data.hobby.value, [0, 1, 1])
})

test('toggling choices supports multiple and single selection without mutation', () => {
  const value = [1, 0, 1]
  assert.deepEqual(values.toggleChoice(value, 0, true), [0, 0, 1])
  assert.deepEqual(values.toggleChoice(value, 1, false), [0, 1, 0])
  assert.deepEqual(value, [1, 0, 1])
})

test('accordion toggling closes siblings unless always_open', () => {
  const items = [{ title: 'a', open: true, controls: [] }, { title: 'b', controls: [] }]
  const single = values.toggleAccordionItem({ type: 'accordion', items }, 1)
  assert.deepEqual(single.items.map((item) => item.open), [false, true])
  const multi = values.toggleAccordionItem({ type: 'accordion', always_open: true, items }, 1)
  assert.deepEqual(multi.items.map((item) => item.open), [true, true])
  assert.equal(items[0].open, true)
})

test('grid places cells by colno/rowno and rejects invalid layouts', () => {
  assert.deepEqual(layout.gridCellStyles([{ colno: 2, rowno: 1 }, {}, { colno: 0, colspan: 2 }], 3, 2), [
    { gridColumn: '3 / span 1', gridRow: '2 / span 1' },
    { gridColumn: undefined, gridRow: undefined },
    { gridColumn: '1 / span 2', gridRow: undefined },
  ])
  assert.throws(() => layout.gridCellStyles([{ colno: 3, rowno: 0 }], 3, 2), /exceeds 3/)
  assert.throws(() => layout.gridCellStyles([{ colno: 0, rowno: 2 }], 3, 2), /exceeds 2/)
  assert.throws(() => layout.gridCellStyles([{ colno: -1 }], 3), /integer >= 0/)
  assert.throws(
    () => layout.gridCellStyles([{ colno: 0, rowno: 0, colspan: 2 }, { colno: 1, rowno: 0 }], 3, 1),
    /more than one/,
  )
})

test('assets/controls.json renders with assets/data.json bound', () => {
  const read = (name) => JSON.parse(readFileSync(new URL(`../src/assets/${name}`, import.meta.url), 'utf8'))
  const html = render(read('controls.json').controls, read('data.json'))
  assert.match(html, /grid-template-columns:repeat\(3, minmax\(0, 1fr\)\)/)
  assert.match(html, /grid-column:1 \/ span 1;grid-row:2 \/ span 1/)
  assert.match(html, /class="d-flex flex-row gap-3"/)
  assert.match(html, /for="textbox1">Textbox 1<span class="text-danger ms-1" aria-hidden="true">\*<\/span><\/label>/)
  assert.match(html, /value="piyavach"/)
  assert.match(html, /id="hobby-0"[^>]*aria-checked="false"/)
  assert.match(html, /id="hobby-1"[^>]*aria-checked="true"/)
  assert.match(html, /id="hobby-2"[^>]*aria-checked="true"/)
})

test('choice controls render as divs, never native checkbox/radio/select', () => {
  const html = render([
    { type: 'dropdown', id: 'd', label: 'D', options: ['x', 'y'], value: [0, 1] },
    { type: 'checkbox_group', id: 'c', label: 'C', options: ['a', 'b'], value: [1, 1] },
    { type: 'option', id: 's', options: ['a', 'b'], value: [0, 1] },
  ])
  assert.doesNotMatch(html, /<select|<option|type="checkbox"|type="radio"/)
  assert.match(html, /role="combobox"[^>]*>y</)
  assert.equal(html.match(/role="checkbox"/g).length, 2)
  assert.equal(html.match(/role="radio"/g).length, 2)
  assert.match(html, /role="radiogroup"/)
  assert.match(html, /id="c-0"[^>]*aria-checked="true"/)
  assert.match(html, /id="s-0"[^>]*aria-checked="false"/)
  assert.match(html, /id="s-1"[^>]*aria-checked="true"/)
})

test('option rejects more than one selected value', () => {
  assert.throws(
    () => render([{ type: 'option', id: 's', options: ['a', 'b'], value: [1, 1] }]),
    /at most one/,
  )
})

test('custom controls render accordion, card and badge', () => {
  const html = render([
    {
      type: 'accordion', id: 'acc',
      items: [
        { title: 'One', open: true, controls: [{ type: 'badge', text: 'in-one' }] },
        { title: 'Two', controls: [] },
      ],
    },
    { type: 'card', header: 'H', title: 'T', footer: 'F', controls: [{ type: 'label', text: 'inside' }] },
    { type: 'badge', text: 'B', variant: 'danger', pill: true },
  ])
  assert.match(html, /class="accordion-button" aria-expanded="true"/)
  assert.match(html, /class="accordion-button collapsed" aria-expanded="false"/)
  assert.match(html, /class="accordion-collapse collapse show"/)
  assert.match(html, /class="card-header">H</)
  assert.match(html, /class="card-footer[^"]*">F</)
  assert.match(html, /inside/)
  assert.match(html, /class="badge text-bg-danger rounded-pill">B</)
})

test('every documented control type renders its examples', () => {
  const types = new Set(docs.controlDocs.map((doc) => doc.type))
  assert.equal(types.size, 18)
  for (const doc of docs.controlDocs) {
    assert.doesNotThrow(() => render(doc.examples, doc.data), doc.type)
  }
})

test('date helpers use Buddhist-era YYYYMMDD', () => {
  assert.equal(dates.formatDateNumber(25681118), '18/11/2568')
  assert.equal(dates.formatDateNumber(25680105), '05/01/2568')
  assert.equal(dates.toDateNumber({ year: 2568, month: 11, day: 18 }), 25681118)
  assert.deepEqual(dates.parseDateNumber(25681118), { year: 2568, month: 11, day: 18 })
  // 2543 BE = 2000 CE (leap); 2568 BE = 2025 CE (not leap)
  assert.equal(dates.daysInMonth(2543, 2), 29)
  assert.equal(dates.daysInMonth(2568, 2), 28)
  assert.equal(dates.daysInMonth(2643, 2), 28) // 2100 CE is not a leap year
  assert.equal(dates.daysInMonth(2568, 4), 30)
  // 1 Nov 2568 (BE) = 1 Nov 2025, a Saturday
  assert.equal(dates.firstWeekday(2568, 11), 6)
  for (const bad of [25680229, 25681301, 25680100, 123, 25681118.5, '25681118', null]) {
    assert.equal(dates.parseDateNumber(bad), null, String(bad))
  }
  assert.throws(() => dates.formatDateNumber(25680229), /valid/)
  assert.deepEqual(dates.todayParts(new Date(2025, 10, 18)), { year: 2568, month: 11, day: 18 })
})

test('date control shows dd/mm/yyyy in a box with a button, and binds to data', () => {
  const html = render([{ type: 'date', id: 'd1', label: 'วันที่', value: 25681118 }])
  assert.match(html, /id="d1"[^>]*role="combobox"[^>]*>18\/11\/2568</)
  assert.match(html, /<button type="button" class="btn btn-outline-secondary">📅<\/button>/)
  assert.doesNotMatch(html, /modal/)

  assert.match(render([{ type: 'date', id: 'd2' }]), /วว\/ดด\/ปปปป/)
  const bound = render([{ type: 'date', id: 'd3', databinding: 'birthday', value: 25681118 }], {
    birthday: { type: 'number', value: 25430229 },
  })
  assert.match(bound, />29\/02\/2543</)
})

test('date values are validated and bound number fields update', () => {
  assert.equal(values.getDateValue({ type: 'date', value: 25681118 }), 25681118)
  assert.equal(values.getDateValue({ type: 'date' }), null)
  assert.throws(() => values.getDateValue({ type: 'date', id: 'd', value: 25680231 }), /valid YYYYMMDD/)
  const birthday = { type: 'number', value: null }
  assert.equal(values.getDateValue({ type: 'date', databinding: 'b' }, { b: birthday }), null)
  assert.throws(() => values.getDateValue({ type: 'date', databinding: 'hobby' }, data), /number field/)
  assert.throws(() => values.getDateValue({ type: 'date', databinding: 'fname' }, data), /number field/)
  assert.throws(
    () => values.getDateValue({ type: 'date', databinding: 'b' }, { b: { type: 'number', value: 1 } }),
    /valid YYYYMMDD/,
  )

  const updated = values.updateData({ b: birthday }, 'b', 25681118)
  assert.deepEqual(updated, { b: { type: 'number', value: 25681118 } })
  assert.deepEqual(values.updateData(updated, 'b', null).b.value, null)
  assert.throws(() => values.updateData({ b: birthday }, 'b', 'x'), /does not match/)
  assert.throws(() => values.updateData(data, 'hobby', 25681118), /does not match/)
})

test('textbox with input_type password hides text and has a toggle button', () => {
  const html = render([
    { type: 'textbox', input_type: 'password', id: 'p1', label: 'Pwd', value: 'secret' },
    { type: 'textbox', id: 't', value: 'plain' },
  ])
  assert.match(html, /id="p1"[^>]*type="password"/)
  assert.match(html, /<button type="button" class="btn btn-outline-secondary">แสดง<\/button>/)
  assert.match(html, /id="t"[^>]*type="text"/)
  assert.equal(html.match(/type="password"/g).length, 1)
  // Only the password textbox gets the toggle, and its label is rendered once.
  assert.equal(html.match(/<button/g).length, 1)
  assert.equal(html.match(/for="p1"/g).length, 1)
})

test('password textbox binds to a string data field', () => {
  const html = render([{ type: 'textbox', input_type: 'password', id: 'p', databinding: 'fname', value: 'ignored' }], data)
  assert.match(html, /value="piyavach"/)
  assert.doesNotMatch(html, /ignored/)
})

test('unsupported control types fail explicitly', () => {
  assert.throws(() => render([{ type: 'nope' }]), /Unsupported control type: nope/)
  // password is now textbox + input_type: 'password', not a control of its own.
  assert.throws(() => render([{ type: 'password', id: 'p' }]), /Unsupported control type: password/)
})

// ---- validation: required ----

test('isEmptyValue treats blank text, null and no selection as empty', () => {
  for (const empty of ['', '   ', '\n\t', null, [], [0, 0, 0]]) {
    assert.equal(validation.isEmptyValue(empty), true, JSON.stringify(empty))
  }
  for (const filled of ['a', ' a ', '0', 0, 25681118, [0, 1], [1]]) {
    assert.equal(validation.isEmptyValue(filled), false, JSON.stringify(filled))
  }
})

test('validateControl checks required text controls', () => {
  const { REQUIRED_TEXT_MESSAGE } = validation
  for (const [type, input_type] of [['textbox'], ['textbox', 'password'], ['textarea']]) {
    const config = { type, input_type, id: 't', required: true }
    assert.equal(validation.validateControl({ ...config, value: '' }), REQUIRED_TEXT_MESSAGE, type)
    assert.equal(validation.validateControl(config), REQUIRED_TEXT_MESSAGE, `${type} without value`)
    assert.equal(validation.validateControl({ ...config, value: '  ' }), REQUIRED_TEXT_MESSAGE, `${type} spaces`)
    assert.equal(validation.validateControl({ ...config, value: 'x' }), null, `${type} filled`)
    assert.equal(validation.validateControl({ ...config, required: false, value: '' }), null, `${type} optional`)
    assert.equal(validation.validateControl({ type, value: '' }), null, `${type} no rule`)
  }
  assert.equal(
    validation.validateControl({ type: 'textbox', required: true, required_message: 'กรอกชื่อด้วย', value: '' }),
    'กรอกชื่อด้วย',
  )
})

test('validateControl reads bound values from data, not the inline value', () => {
  const config = { type: 'textbox', id: 't', databinding: 'fname', required: true, value: '' }
  assert.equal(validation.validateControl(config, data), null)
  const blank = { ...data, fname: { type: 'string', value: '' } }
  assert.equal(validation.validateControl({ ...config, value: 'inline' }, blank), validation.REQUIRED_TEXT_MESSAGE)
  const hobby = { type: 'checkbox_group', id: 'h', databinding: 'hobby', required: true }
  assert.equal(validation.validateControl(hobby, data), null)
  const none = { ...data, hobby: { ...data.hobby, value: [0, 0, 0] } }
  assert.equal(validation.validateControl(hobby, none), validation.REQUIRED_CHOICE_MESSAGE)
  // A broken binding still fails loudly instead of passing validation.
  assert.throws(() => validation.validateControl({ ...config, databinding: 'missing' }, data), /bound to "missing"/)
})

test('validateControl checks required date and choice controls', () => {
  const { REQUIRED_DATE_MESSAGE, REQUIRED_CHOICE_MESSAGE } = validation
  assert.equal(validation.validateControl({ type: 'date', required: true }), REQUIRED_DATE_MESSAGE)
  assert.equal(validation.validateControl({ type: 'date', required: true, value: null }), REQUIRED_DATE_MESSAGE)
  assert.equal(validation.validateControl({ type: 'date', required: true, value: 25681118 }), null)
  const options = ['a', 'b', 'c']
  for (const [type, multiple] of [['checkbox_group'], ['option'], ['dropdown', false], ['dropdown', true]]) {
    const config = { type, required: true, options, multiple }
    assert.equal(validation.validateControl(config), REQUIRED_CHOICE_MESSAGE, `${type} default value`)
    assert.equal(validation.validateControl({ ...config, value: [0, 0, 0] }), REQUIRED_CHOICE_MESSAGE, type)
    assert.equal(validation.validateControl({ ...config, value: [0, 1, 0] }), null, `${type} selected`)
  }
})

test('controls without input never report errors', () => {
  for (const config of [
    { type: 'label', text: 'x', required: true },
    { type: 'button', text: 'x', required: true },
    { type: 'badge', text: 'x' },
    { type: 'container', required: true, controls: [] },
  ]) {
    assert.equal(validation.validateControl(config), null, config.type)
  }
})

test('validateForm walks nested controls in document order', () => {
  const form = {
    controls: [
      { type: 'textbox', id: 'name', required: true, value: '' },
      {
        type: 'grid', columns: 2,
        controls: [
          { type: 'flex', is_horizontal: 1, controls: [{ type: 'textarea', required: true }] },
          { type: 'card', controls: [{ type: 'date', id: 'when', required: true, required_message: 'เลือกวัน' }] },
        ],
      },
      {
        type: 'accordion',
        items: [
          { title: 'a', controls: [{ type: 'textbox', id: 'ok', required: true, value: 'filled' }] },
          { title: 'b', controls: [{ type: 'option', id: 'level', required: true, options: ['x', 'y'] }] },
        ],
      },
      { type: 'container', controls: [{ type: 'checkbox_group', id: 'bound', databinding: 'hobby', required: true }] },
    ],
  }
  assert.deepEqual(validation.validateForm(form, data), [
    { id: 'name', message: validation.REQUIRED_TEXT_MESSAGE },
    { id: 'controls[1].controls[0].controls[0]', message: validation.REQUIRED_TEXT_MESSAGE },
    { id: 'when', message: 'เลือกวัน' },
    { id: 'level', message: validation.REQUIRED_CHOICE_MESSAGE },
  ])
  assert.deepEqual(validation.validateForm({ controls: [] }), [])
})

test('demo form is valid with its data and invalid once the data is cleared', () => {
  const read = (name) => JSON.parse(readFileSync(new URL(`../src/assets/${name}`, import.meta.url), 'utf8'))
  const form = read('controls.json')
  const demo = read('data.json')
  assert.deepEqual(validation.validateForm(form, demo), [])
  const cleared = {
    fname: { ...demo.fname, value: '' },
    hobby: { ...demo.hobby, value: [0, 0, 0] },
  }
  assert.deepEqual(validation.validateForm(form, cleared), [
    { id: 'textbox1', message: validation.REQUIRED_TEXT_MESSAGE },
    { id: 'hobby', message: 'กรุณาเลือกงานอดิเรกอย่างน้อย 1 อย่าง' },
  ])
})

const requiredControls = [
  { type: 'textbox', id: 'tb', label: 'TB', required: true, value: '' },
  { type: 'textbox', input_type: 'password', id: 'pw', label: 'PW', required: true, value: '' },
  { type: 'textarea', id: 'ta', label: 'TA', required: true, value: '' },
  { type: 'date', id: 'dt', label: 'DT', required: true },
  { type: 'dropdown', id: 'dd', label: 'DD', required: true, options: ['a', 'b'] },
  { type: 'checkbox_group', id: 'cb', label: 'CB', required: true, options: ['a', 'b'] },
  { type: 'option', id: 'op', label: 'OP', required: true, options: ['a', 'b'], required_message: 'เลือกหนึ่งข้อ' },
]

test('required controls show * but hide errors until showErrors (or a change)', () => {
  const html = render(requiredControls)
  assert.equal(html.match(/<span class="text-danger ms-1" aria-hidden="true">\*<\/span>/g).length, 7)
  assert.doesNotMatch(html, /invalid-feedback|is-invalid|aria-invalid/)
  assert.match(html, /id="tb"[^>]*aria-required="true"/)
})

test('showErrors renders a red message under every empty required control', () => {
  const html = render(requiredControls, undefined, { showErrors: true })
  for (const id of ['tb', 'pw', 'ta']) {
    assert.match(html, new RegExp(`id="${id}" class="form-control is-invalid"[^>]*aria-invalid="true" aria-describedby="${id}-error"`), id)
    assert.match(html, new RegExp(`<div id="${id}-error" class="invalid-feedback d-block">กรุณากรอกข้อมูล</div>`), id)
  }
  assert.match(html, /id="dt"[^>]*class="form-control flex-grow-1 is-invalid"/)
  assert.match(html, /<div id="dt-error" class="invalid-feedback d-block">กรุณาเลือกวันที่<\/div>/)
  assert.match(html, /id="dd"[^>]*class="form-select fs-dropdown-toggle is-invalid"[^>]*aria-invalid="true"/)
  assert.match(html, /<div id="dd-error" class="invalid-feedback d-block">กรุณาเลือกอย่างน้อย 1 รายการ<\/div>/)
  assert.match(html, /role="group"[^>]*class="fs-choice-list is-invalid" aria-invalid="true" aria-describedby="cb-error"/)
  assert.match(html, /role="radiogroup"[^>]*class="fs-choice-list is-invalid" aria-required="true" aria-invalid="true"/)
  assert.match(html, /<div id="op-error" class="invalid-feedback d-block">เลือกหนึ่งข้อ<\/div>/)
  assert.equal(html.match(/invalid-feedback/g).length, 7)
})

test('showErrors leaves filled and optional controls alone', () => {
  const html = render([
    { type: 'textbox', id: 'filled', required: true, value: 'x' },
    { type: 'textbox', id: 'optional', value: '' },
    { type: 'checkbox_group', id: 'picked', required: true, options: ['a'], value: [1] },
    { type: 'textbox', id: 'bound', databinding: 'fname', required: true, value: '' },
  ], data, { showErrors: true })
  assert.doesNotMatch(html, /invalid-feedback|is-invalid|aria-invalid/)
})

// ---- switch ----

test('switch renders a div role="switch" with on/off state, never a native checkbox', () => {
  const html = render([
    { type: 'switch', id: 'on', label: 'การยินยอม', text: 'ยินยอม', value: 1 },
    { type: 'switch', id: 'off', text: 'ข่าวสาร' },
    { type: 'switch', id: 'dis', text: 'ปิด', value: 0, disabled: true },
  ])
  assert.doesNotMatch(html, /<input/)
  assert.match(html, /id="on" role="switch" aria-checked="true" aria-labelledby="on-label on-text" tabindex="0" class="fs-switch is-checked"/)
  assert.match(html, /<div id="on-label" class="form-label">การยินยอม<\/div>/)
  assert.match(html, /<span id="on-text">ยินยอม<\/span>/)
  assert.match(html, /id="off" role="switch" aria-checked="false" aria-labelledby="off-text" tabindex="0" class="fs-switch"/)
  assert.match(html, /id="dis" role="switch" aria-checked="false" aria-disabled="true" aria-labelledby="dis-text" tabindex="-1" class="fs-switch is-disabled"/)
})

test('switch values are 0/1 and bound switches read a number field', () => {
  assert.equal(values.getSwitchValue({ type: 'switch' }), 0)
  assert.equal(values.getSwitchValue({ type: 'switch', value: 1 }), 1)
  assert.equal(values.getSwitchValue({ type: 'switch', value: null }), 0)
  for (const bad of [2, -1, true, '1']) {
    assert.throws(() => values.getSwitchValue({ type: 'switch', id: 's', value: bad }), /0 \(off\) or 1 \(on\)/, String(bad))
  }
  const consent = { type: 'number', value: 1 }
  assert.equal(values.getSwitchValue({ type: 'switch', databinding: 'c', value: 0 }, { c: consent }), 1)
  assert.equal(values.getSwitchValue({ type: 'switch', databinding: 'c' }, { c: { type: 'number', value: null } }), 0)
  assert.throws(() => values.getSwitchValue({ type: 'switch', databinding: 'c' }, { c: { type: 'number', value: 5 } }), /Data binding "c" must be 0/)
  assert.throws(() => values.getSwitchValue({ type: 'switch', databinding: 'fname' }, data), /number field/)
  assert.throws(() => values.getSwitchValue({ type: 'switch', databinding: 'hobby' }, data), /number field/)
  assert.throws(() => values.getSwitchValue({ type: 'switch', id: 's', databinding: 'missing' }, data), /bound to "missing"/)
  assert.deepEqual(values.updateData({ c: consent }, 'c', 0), { c: { type: 'number', value: 0 } })
  assert.equal(consent.value, 1)
  assert.equal(render([{ type: 'switch', id: 'b', databinding: 'c', value: 0 }], { c: consent }).includes('aria-checked="true"'), true)
})

test('a required switch must be on', () => {
  const config = { type: 'switch', id: 's', required: true }
  assert.equal(validation.validateControl(config), validation.REQUIRED_SWITCH_MESSAGE)
  assert.equal(validation.validateControl({ ...config, value: 0 }), validation.REQUIRED_SWITCH_MESSAGE)
  assert.equal(validation.validateControl({ ...config, value: 1 }), null)
  assert.equal(validation.validateControl({ ...config, required: false }), null)
  assert.equal(validation.validateControl({ ...config, required_message: 'ต้องยินยอม' }), 'ต้องยินยอม')
  assert.equal(validation.validateControl({ ...config, databinding: 'c' }, { c: { type: 'number', value: 1 } }), null)
  assert.deepEqual(validation.validateForm({ controls: [{ type: 'card', controls: [config] }] }), [
    { id: 's', message: validation.REQUIRED_SWITCH_MESSAGE },
  ])
})

test('showErrors marks an off required switch and shows its message', () => {
  const controls = [{ type: 'switch', id: 'c', label: 'ยินยอม', text: 'ยินยอมให้เก็บข้อมูล', required: true }]
  const quiet = render(controls)
  assert.match(quiet, /ยินยอม<span class="text-danger ms-1" aria-hidden="true">\*<\/span>/)
  assert.doesNotMatch(quiet, /invalid/)
  const html = render(controls, undefined, { showErrors: true })
  assert.match(html, /class="fs-switch is-invalid" aria-required="true" aria-invalid="true" aria-describedby="c-error"/)
  assert.match(html, /<div id="c-error" class="invalid-feedback d-block">กรุณาเปิดตัวเลือกนี้<\/div>/)
  assert.doesNotMatch(render([{ ...controls[0], value: 1 }], undefined, { showErrors: true }), /invalid/)
})

// ---- time / datetime ----

test('time helpers use HHMM numbers', () => {
  assert.deepEqual(dates.parseTimeNumber(1430), { hour: 14, minute: 30 })
  assert.deepEqual(dates.parseTimeNumber(0), { hour: 0, minute: 0 })
  assert.deepEqual(dates.parseTimeNumber(2359), { hour: 23, minute: 59 })
  for (const bad of [2400, 1460, -1, 14.5, '1430', null, 99999]) {
    assert.equal(dates.parseTimeNumber(bad), null, String(bad))
  }
  assert.equal(dates.formatTimeNumber(830), '08:30')
  assert.equal(dates.formatTimeNumber(0), '00:00')
  assert.equal(dates.toTimeNumber({ hour: 9, minute: 5 }), 905)
  assert.throws(() => dates.formatTimeNumber(2460), /valid HHMM/)
  assert.deepEqual(dates.nowTimeParts(new Date(2025, 10, 18, 7, 42)), { hour: 7, minute: 42 })
})

test('datetime helpers use Buddhist-era YYYYMMDDHHMM numbers', () => {
  assert.deepEqual(dates.parseDateTimeNumber(256811181430), { year: 2568, month: 11, day: 18, hour: 14, minute: 30 })
  assert.equal(dates.formatDateTimeNumber(256801050905), '05/01/2568 09:05')
  assert.equal(dates.toDateTimeNumber({ year: 2568, month: 11, day: 18, hour: 0, minute: 0 }), 256811180000)
  // Leap day 2543 BE (2000 CE) exists; 29/02/2568 does not; 25:00 is not a time; 8 digits is a date.
  assert.ok(dates.parseDateTimeNumber(254302291200))
  for (const bad of [256802291200, 256811182500, 256811181260, 25681118, 1430, 256811181430.5, '256811181430']) {
    assert.equal(dates.parseDateTimeNumber(bad), null, String(bad))
  }
  assert.throws(() => dates.formatDateTimeNumber(256802291200), /valid YYYYMMDDHHMM/)
})

test('minute options follow minute_step and keep an off-step current minute', () => {
  assert.equal(dates.minuteOptions(1).length, 60)
  assert.deepEqual(dates.minuteOptions(15), [0, 15, 30, 45])
  assert.deepEqual(dates.minuteOptions(15, 37), [0, 15, 30, 37, 45])
  assert.deepEqual(dates.minuteOptions(25), [0, 25, 50])
  for (const bad of [0, 61, 1.5]) assert.throws(() => dates.minuteOptions(bad), /minute_step/, String(bad))
  assert.deepEqual(dates.roundTimeDown({ hour: 7, minute: 42 }, 15), { hour: 7, minute: 30 })
})

test('time and datetime values are validated and bound number fields update', () => {
  assert.equal(values.getTimeValue({ type: 'time', value: 1430 }), 1430)
  assert.equal(values.getTimeValue({ type: 'time', value: 0 }), 0)
  assert.equal(values.getTimeValue({ type: 'time' }), null)
  assert.throws(() => values.getTimeValue({ type: 'time', id: 't', value: 2400 }), /valid HHMM time/)
  assert.equal(values.getTimeValue({ type: 'time', databinding: 't', value: 900 }, { t: { type: 'number', value: 1015 } }), 1015)
  assert.throws(() => values.getTimeValue({ type: 'time', databinding: 'fname' }, data), /number field/)

  assert.equal(values.getDateTimeValue({ type: 'datetime', value: 256811181430 }), 256811181430)
  assert.equal(values.getDateTimeValue({ type: 'datetime' }), null)
  assert.throws(() => values.getDateTimeValue({ type: 'datetime', id: 'x', value: 25681118 }), /valid YYYYMMDDHHMM/)
  const at = { type: 'number', value: null }
  assert.equal(values.getDateTimeValue({ type: 'datetime', databinding: 'at' }, { at }), null)
  assert.throws(() => values.getDateTimeValue({ type: 'datetime', databinding: 'hobby' }, data), /number field/)
  assert.deepEqual(values.updateData({ at }, 'at', 256811181430), { at: { type: 'number', value: 256811181430 } })
  assert.equal(at.value, null)
})

test('time and datetime render formatted values in a box with a button', () => {
  const html = render([
    { type: 'time', id: 't1', label: 'เวลา', value: 830 },
    { type: 'time', id: 't2' },
    { type: 'datetime', id: 'dt1', label: 'นัด', value: 256811181430 },
    { type: 'datetime', id: 'dt2' },
  ])
  assert.match(html, /id="t1"[^>]*role="combobox"[^>]*>08:30</)
  assert.match(html, /id="t2"[^>]*role="combobox"[^>]*><span class="text-body-secondary">ชช:นน<\/span>/)
  assert.match(html, /id="dt1"[^>]*role="combobox"[^>]*>18\/11\/2568 14:30</)
  assert.match(html, /วว\/ดด\/ปปปป ชช:นน/)
  assert.equal(html.match(/<button type="button" class="btn btn-outline-secondary">🕒<\/button>/g).length, 2)
  assert.equal(html.match(/<button type="button" class="btn btn-outline-secondary">📅<\/button>/g).length, 2)
  assert.doesNotMatch(html, /modal|type="time"|type="datetime/)
  const bound = render([{ type: 'time', id: 'b', databinding: 's', value: 900 }], { s: { type: 'number', value: 1745 } })
  assert.match(bound, />17:45</)
})

test('required time and datetime must have a value', () => {
  const { REQUIRED_TIME_MESSAGE, REQUIRED_DATETIME_MESSAGE } = validation
  assert.equal(validation.validateControl({ type: 'time', required: true }), REQUIRED_TIME_MESSAGE)
  // 00:00 is a real time, not an empty value.
  assert.equal(validation.validateControl({ type: 'time', required: true, value: 0 }), null)
  assert.equal(validation.validateControl({ type: 'datetime', required: true, value: null }), REQUIRED_DATETIME_MESSAGE)
  assert.equal(validation.validateControl({ type: 'datetime', required: true, value: 256811181430 }), null)
  assert.equal(validation.validateControl({ type: 'datetime', required: true, required_message: 'ระบุเวลานัด' }), 'ระบุเวลานัด')
  const html = render([
    { type: 'time', id: 'tt', label: 'T', required: true },
    { type: 'datetime', id: 'dd', label: 'D', required: true },
  ], undefined, { showErrors: true })
  assert.match(html, /id="tt"[^>]*class="form-control flex-grow-1 is-invalid"/)
  assert.match(html, /<div id="tt-error" class="invalid-feedback d-block">กรุณาเลือกเวลา<\/div>/)
  assert.match(html, /<div id="dd-error" class="invalid-feedback d-block">กรุณาเลือกวันและเวลา<\/div>/)
})

// ---- date_range ----

const leave = {
  leave_from: { type: 'number', value: 25681118 },
  leave_to: { type: 'number', value: 25681120 },
}

test('date_range reads both ends inline or from two data keys', () => {
  assert.deepEqual(values.getDateRangeValue({ type: 'date_range' }), { from: null, to: null })
  assert.deepEqual(
    values.getDateRangeValue({ type: 'date_range', value_from: 25690101, value_to: 25690105 }),
    { from: 25690101, to: 25690105 },
  )
  const bound = { type: 'date_range', id: 'r', databinding_from: 'leave_from', databinding_to: 'leave_to', value_from: 25000101 }
  assert.deepEqual(values.getDateRangeValue(bound, leave), { from: 25681118, to: 25681120 })
  assert.throws(() => values.getDateRangeValue({ type: 'date_range', id: 'r', databinding_from: 'leave_from' }, leave), /both databinding_from and databinding_to/)
  assert.throws(() => values.getDateRangeValue({ type: 'date_range', id: 'r', databinding_to: 'leave_to' }, leave), /or neither/)
  assert.throws(() => values.getDateRangeValue({ ...bound, databinding_to: 'missing' }, leave), /bound to "missing"/)
  assert.throws(() => values.getDateRangeValue({ ...bound, databinding_to: 'fname' }, { ...leave, ...data }), /number field/)
  assert.throws(() => values.getDateRangeValue({ type: 'date_range', id: 'r', value_to: 25680230 }), /valid YYYYMMDD/)
  // Writing one end keeps the other untouched.
  const next = values.updateData(leave, 'leave_to', 25681125)
  assert.deepEqual(next, { leave_from: leave.leave_from, leave_to: { type: 'number', value: 25681125 } })
  assert.equal(leave.leave_to.value, 25681120)
})

test('date_range validation: required needs both ends, and the end may not be before the start', () => {
  const { REQUIRED_DATE_RANGE_MESSAGE, DATE_RANGE_ORDER_MESSAGE } = validation
  const config = { type: 'date_range', id: 'r', required: true }
  assert.equal(validation.validateControl(config), REQUIRED_DATE_RANGE_MESSAGE)
  assert.equal(validation.validateControl({ ...config, value_from: 25681118 }), REQUIRED_DATE_RANGE_MESSAGE)
  assert.equal(validation.validateControl({ ...config, value_to: 25681118 }), REQUIRED_DATE_RANGE_MESSAGE)
  assert.equal(validation.validateControl({ ...config, value_from: 25681118, value_to: 25681118 }), null)
  assert.equal(validation.validateControl({ ...config, required_message: 'ระบุวันลา' }), 'ระบุวันลา')
  assert.equal(validation.validateControl({ type: 'date_range' }), null)
  // Order is checked even when not required.
  assert.equal(validation.validateControl({ type: 'date_range', value_from: 25681120, value_to: 25681118 }), DATE_RANGE_ORDER_MESSAGE)
  const swapped = { leave_from: leave.leave_to, leave_to: leave.leave_from }
  assert.deepEqual(validation.validateForm({ controls: [{ type: 'date_range', id: 'r', databinding_from: 'leave_from', databinding_to: 'leave_to' }] }, swapped), [
    { id: 'r', message: DATE_RANGE_ORDER_MESSAGE },
  ])
})

test('date_range renders two labelled date boxes under one label', () => {
  const html = render([
    { type: 'date_range', id: 'r', label: 'วันลา', databinding_from: 'leave_from', databinding_to: 'leave_to', required: true },
  ], leave)
  assert.match(html, /<div id="r-label" class="form-label">วันลา<span class="text-danger ms-1" aria-hidden="true">\*<\/span><\/div>/)
  assert.match(html, /<div id="r" role="group" aria-labelledby="r-label"/)
  assert.match(html, /id="r-from"[^>]*role="combobox"[^>]*aria-label="วันลา ตั้งแต่"[^>]*>18\/11\/2568</)
  assert.match(html, /id="r-to"[^>]*role="combobox"[^>]*aria-label="วันลา ถึง"[^>]*>20\/11\/2568</)
  assert.match(html, />ถึง<\/span>/)
  assert.equal(html.match(/>📅<\/button>/g).length, 2)
  assert.doesNotMatch(html, /invalid/)
})

test('date_range shows one message and marks the right boxes', () => {
  const missingTo = render([{ type: 'date_range', id: 'a', required: true, value_from: 25681118 }], undefined, { showErrors: true })
  assert.match(missingTo, /id="a-from"[^>]*class="form-control flex-grow-1"/)
  assert.match(missingTo, /id="a-to"[^>]*class="form-control flex-grow-1 is-invalid"[^>]*aria-invalid="true" aria-describedby="a-error"/)
  assert.equal(missingTo.match(/invalid-feedback/g).length, 1)
  assert.match(missingTo, /<div id="a-error" class="invalid-feedback d-block">กรุณาเลือกช่วงวันที่ให้ครบ<\/div>/)
  const reversed = render([{ type: 'date_range', id: 'b', value_from: 25681120, value_to: 25681118 }], undefined, { showErrors: true })
  assert.equal(reversed.match(/is-invalid/g).length, 2)
  assert.match(reversed, /วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น/)
})

// ---- demo editor (add / remove controls) ----

const demoForm = () => JSON.parse(readFileSync(new URL('../src/assets/controls.json', import.meta.url), 'utf8'))
const demoData = () => JSON.parse(readFileSync(new URL('../src/assets/data.json', import.meta.url), 'utf8'))

test('freeCells lists grid cells not used by any child, spans included', () => {
  const { grid } = editor.findGrid(demoForm())
  // The demo grid is 3×2 with flex boxes at (0,0) and (0,1).
  assert.deepEqual(editor.freeCells(grid), [
    { colno: 1, rowno: 0 }, { colno: 2, rowno: 0 }, { colno: 1, rowno: 1 }, { colno: 2, rowno: 1 },
  ])
  const spanned = { type: 'grid', columns: 2, rows: 2, controls: [{ type: 'label', text: 'x', colno: 0, rowno: 0, colspan: 2 }] }
  assert.deepEqual(editor.freeCells(spanned), [{ colno: 0, rowno: 1 }, { colno: 1, rowno: 1 }])
  assert.throws(() => editor.findGrid({ controls: [] }), /needs a grid/)
})

test('addControl puts the control in the cell, creates its data keys and never mutates', () => {
  const form = demoForm()
  const data = demoData()
  const before = JSON.stringify([form, data])
  const added = editor.addControl(form, data, {
    type: 'textbox', label: 'อีเมล', required: true, options: [], cell: { colno: 2, rowno: 0 },
  })
  assert.equal(JSON.stringify([form, data]), before)
  assert.equal(added.id, 'textbox_1')
  const { grid } = editor.findGrid(added.form)
  assert.deepEqual(grid.controls.at(-1), {
    id: 'textbox_1', label: 'อีเมล', required: true, colno: 2, rowno: 0, type: 'textbox', databinding: 'textbox_1',
  })
  assert.deepEqual(added.data.textbox_1, { type: 'string', value: '' })
  assert.equal(grid.rows, 2)
  // The new form renders, and its empty required field is reported.
  assert.match(render(added.form.controls, added.data), /id="textbox_1"/)
  assert.deepEqual(validation.validateForm(added.form, added.data).map((e) => e.id), ['textbox_1'])
})

test('addControl builds the right config and data for every addable type', () => {
  let form = { controls: [{ type: 'grid', id: 'g', columns: 1, rows: 1, controls: [] }] }
  let data = {}
  for (const [rowno, { type }] of editor.ADDABLE_TYPES.entries()) {
    const options = editor.CHOICE_TYPES.includes(type) ? ['a', 'b'] : []
    ;({ form, data } = editor.addControl(form, data, { type, label: `L${rowno}`, required: false, options, cell: { colno: 0, rowno } }))
  }
  const { grid } = editor.findGrid(form)
  assert.equal(grid.rows, editor.ADDABLE_TYPES.length)
  assert.deepEqual(Object.keys(data), [
    'textbox_1', 'textarea_1', 'date_1', 'date_range_1_from', 'date_range_1_to', 'time_1', 'datetime_1',
    'dropdown_1', 'checkbox_group_1', 'option_1', 'switch_1',
  ])
  assert.deepEqual(data.option_1, { type: 'number', is_array: 1, options: ['a', 'b'], value: [0, 0] })
  assert.deepEqual(data.switch_1, { type: 'number', value: 0 })
  assert.deepEqual(grid.controls.at(-1), { type: 'label', id: 'label_1', text: 'L10', colno: 0, rowno: 10 })
  assert.equal(grid.controls.some((c) => 'required' in c), false)
  assert.doesNotThrow(() => render(form.controls, data))
  assert.deepEqual(validation.validateForm(form, data), [])
})

test('addControl rejects used or outside cells, empty choices, and picks unique ids', () => {
  const form = demoForm()
  const data = demoData()
  const input = { type: 'textbox', label: 'x', required: false, options: [] }
  assert.throws(() => editor.addControl(form, data, { ...input, cell: { colno: 0, rowno: 0 } }), /already used/)
  assert.throws(() => editor.addControl(form, data, { ...input, cell: { colno: 3, rowno: 0 } }), /outside the grid/)
  assert.throws(() => editor.addControl(form, data, { ...input, type: 'option', cell: { colno: 1, rowno: 0 } }), /at least one option/)
  // A row past the last one grows the grid.
  const grown = editor.addControl(form, data, { ...input, cell: { colno: 1, rowno: 2 } })
  assert.equal(editor.findGrid(grown.form).grid.rows, 3)
  // textbox_1 is taken now, and so is a data key called textbox_2.
  const next = editor.addControl(grown.form, { ...grown.data, textbox_2: { type: 'string', value: '' } }, { ...input, cell: { colno: 2, rowno: 2 } })
  assert.equal(next.id, 'textbox_3')
})

test('listControls and removeControl handle nested controls and clean up data keys', () => {
  const form = demoForm()
  const data = demoData()
  const listed = editor.listControls(form)
  assert.deepEqual(listed.map((item) => [item.path.join('.'), item.depth, item.control.type]), [
    ['0', 0, 'flex'], ['1', 0, 'flex'], ['1.0', 1, 'textbox'], ['1.1', 1, 'checkbox_group'],
  ])
  // Remove the textbox inside flex1: its data key fname goes, hobby stays.
  const one = editor.removeControl(form, data, [1, 0])
  assert.deepEqual(editor.listControls(one.form).map((item) => item.path.join('.')), ['0', '1', '1.0'])
  assert.deepEqual(Object.keys(one.data), ['hobby'])
  assert.equal(data.fname.value, 'piyavach')
  // Remove the whole flex: both children and both keys go.
  const all = editor.removeControl(form, data, [1])
  assert.deepEqual(all.data, {})
  assert.equal(editor.listControls(all.form).length, 1)
  // A key still used by another control is kept.
  const twice = editor.addControl(form, data, { type: 'textbox', label: 'x', required: false, options: [], cell: { colno: 1, rowno: 0 } })
  const shared = { ...twice.form }
  shared.controls[0].controls.at(-1).databinding = 'fname'
  assert.ok('fname' in editor.removeControl(shared, twice.data, [1, 0]).data)
  assert.throws(() => editor.removeControl(form, data, [9]), /No control at path 9/)
})

test('demo editor panel renders the add fields and one remove button per control', async () => {
  const DemoEditor = (await server.ssrLoadModule('/src/demo/DemoEditor.tsx')).default
  const html = renderToStaticMarkup(React.createElement(DemoEditor, { form: demoForm(), data: demoData(), onChange: () => {} }))
  assert.match(html, /id="new_type"/)
  assert.match(html, /id="new_cell"/)
  assert.match(html, /id="new_label"/)
  assert.match(html, /role="switch"/)
  assert.match(html, />เพิ่ม control<\/button>/)
  assert.equal(html.match(/aria-label="ลบ /g).length, 4)
  assert.match(html, />ลบ \(รวม 2 ช่องข้างใน\)</)
  assert.match(html, /control ในตาราง \(4\)/)
  assert.match(html, /aria-label="ลบ flex \(ไม่มีชื่อ\)"/)
  assert.match(html, /aria-label="ลบ textbox Textbox 1"/)
})
