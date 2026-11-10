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

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  dates = await server.ssrLoadModule('/src/componenets/libs/dateValue.ts')
  values = await server.ssrLoadModule('/src/componenets/libs/controlValues.ts')
  layout = await server.ssrLoadModule('/src/componenets/libs/gridLayout.ts')
  FormBuilder = (await server.ssrLoadModule('/src/componenets/libs/Formbuilder.tsx')).default
  componentStyle = (await server.ssrLoadModule('/src/componenets/libs/componentStyle.ts')).componentStyle
  docs = await server.ssrLoadModule('/src/form/document/docs.ts')
})

after(async () => {
  if (server) await server.close()
})

const render = (controls, data) => renderToStaticMarkup(
  React.createElement(FormBuilder, { form: { controls }, data, onChange: () => {}, onDataChange: () => {} }),
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
  assert.match(html, /grid-column:3 \/ span 1;grid-row:2 \/ span 1/)
  assert.match(html, /class="d-flex flex-row gap-3"/)
  assert.match(html, /for="textbox1">Textbox 1<\/label>/)
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
  assert.equal(types.size, 15)
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

test('password control hides text by default and has a toggle button', () => {
  const html = render([
    { type: 'password', id: 'p1', label: 'Pwd', value: 'secret' },
    { type: 'textbox', id: 't', value: 'plain' },
  ])
  assert.match(html, /id="p1"[^>]*type="password"/)
  assert.match(html, /<button type="button" class="btn btn-outline-secondary">แสดง<\/button>/)
  assert.match(html, /id="t"[^>]*type="text"/)
  assert.equal(html.match(/type="password"/g).length, 1)
})

test('password binds to a string data field', () => {
  const html = render([{ type: 'password', id: 'p', databinding: 'fname', value: 'ignored' }], data)
  assert.match(html, /value="piyavach"/)
  assert.doesNotMatch(html, /ignored/)
})

test('unsupported control types fail explicitly', () => {
  assert.throws(() => render([{ type: 'nope' }]), /Unsupported control type: nope/)
})
