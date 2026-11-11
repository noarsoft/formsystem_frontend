# Form Builder

React + TypeScript form controls described by a JSON document and styled with
Bootstrap 5.3 (loaded from the jsDelivr CDN in `index.html`, CSS only).

```sh
npm install
npm run dev
npm run build
npm run lint
node --test tests\formbuilder.test.mjs
```

`FormBuilder` is controlled: pass the document as `form` and an `onChange`
callback that saves the updated document. A control keeps its value inline
(`value`), or binds to a separate `data` object with `databinding`:

```tsx
<FormBuilder form={form} onChange={setForm} data={data} onDataChange={setData} />
```

```json
{
  "fname": { "type": "string", "value": "piyavach" },
  "hobby": { "type": "number", "is_array": 1, "options": ["guitar", "piano", "violin"], "value": [0, 1, 1] }
}
```

A bound control (`"databinding": "fname"`) reads and writes `data`; the data
always wins over the control's inline `value`, and `options` in the data win
over `options` in the control. A missing key or wrong field type throws an
error instead of silently dropping data. Updates never mutate the old
document or data.

```tsx
import { useState } from 'react'
import FormBuilder from './componenets/libs/Formbuilder'
import type { FormDocument } from './componenets/libs/controlTypes'

const initial: FormDocument = {
  controls: [
    {
      id: 'grid1', type: 'grid', columns: 3, rows: 2,
      controls: [
        { type: 'flex', is_horizontal: 0, colno: 0, rowno: 0, controls: [] },
        {
          id: 'flex1', type: 'flex', is_horizontal: 1, colno: 2, rowno: 1,
          controls: [{ type: 'textbox', id: 'textbox1', label: 'Textbox 1', value: '' }],
        },
      ],
    },
  ],
}

function Example() {
  const [form, setForm] = useState(initial)
  return <FormBuilder form={form} onChange={setForm} />
}
```

Controls: `textbox`, `date`, `date_range`, `time`, `datetime`, `textarea`, `switch`, `label`, `dropdown`, `checkbox_group`, `option`,
`button` (controls); `container`, `grid`, `flex` (containers); `accordion`,
`card`, `badge` (custom, in `src/componenets/custom`). A password field is a
`textbox` with `input_type: "password"`: the text is hidden and a แสดง/ซ่อน
button toggles it (there is no separate `password` control). Choice controls use
`options: string[]` and `value: number[]` (one 0/1 per option):
`checkbox_group` selects any number, `option` selects at most one, and
`dropdown` is single unless `multiple: true`. `date` stores a Buddhist-era
number `YYYYMMDD` (25681118 = 18/11/2568) and shows `dd/mm/yyyy`; bind it to
`{ "type": "number", "value": 25681118 }` (`null` = empty). `time` stores `HHMM`
(1430 = 14:30) and `datetime` stores a Buddhist-era `YYYYMMDDHHMM`
(256811181430 = 18/11/2568 14:30), both bound to number fields; their pickers
offer minutes every `minute_step` (default 1). `date_range` is two date boxes
("ตั้งแต่ … ถึง …") whose ends are kept in `value_from` / `value_to`, or bound to
two number fields with `databinding_from` + `databinding_to` (set both or neither);
the "to" calendar cannot pick a day before "from" and vice versa, and an end before
the start is always reported as an error. `switch` is an on/off
toggle (div with `role="switch"`) storing `1` (on) or `0` (off); bind it to
`{ "type": "number", "value": 0 }` (`null` = off). A required switch must be on. `dropdown`,
`checkbox_group` and
`option` are div-based (ARIA roles + keyboard support, styled in
`control/controls.css`) rather than native `select` / checkbox / radio inputs.

Any control can set `colno` / `rowno` (0-based, plus optional `colspan` /
`rowspan`); the surrounding `grid` places it there. Out-of-range or overlapping
cells and malformed choice values throw an error instead of being dropped.

The **Demo** tab can add and remove controls (`src/demo`): pick a type, a label,
`required` and (for choices) the options, then a free cell of the form's grid by
row/column (or a new row, which grows the grid). Each new control gets its own
data key (`textbox_1`, …; `date_range` gets `_from` / `_to`), and removing a
control also removes the data keys no other control uses. Nothing is saved:
refresh restores the sample, and "ดู JSON ของฟอร์ม" shows the current form JSON.
The add/remove logic is in `src/demo/editor.ts` (pure functions, covered by tests).

Every control is documented, with live examples, in `src/form/document`
(the **Document** tab of the demo app). To add a control, add its config type to
`libs/controlTypes.ts`, a case to `libs/ControlRenderer.tsx`, and an entry to
`src/form/document/docs.ts`.

Input controls (`textbox`, `date`, `date_range`, `time`, `datetime`, `textarea`, `dropdown`,
`checkbox_group`, `option`, `switch`) accept `required: true` and an optional
`required_message`. A required control shows a red `*` after its label and, when
its value is empty (blank or whitespace-only text, a `null` date, or no option
selected), a red message under it (Bootstrap `is-invalid` / `invalid-feedback`).
The message appears after the user changes that control, or for every control
when `FormBuilder` gets `showErrors` (e.g. after a submit attempt). Check the whole
form, including nested containers, with `validateForm(form, data)` from
`libs/validation.ts`; it returns `{ id, message }[]` (empty = valid):

```tsx
const [submitted, setSubmitted] = useState(false)
const errors = validateForm(form, data)
<FormBuilder form={form} onChange={setForm} data={data} onDataChange={setData} showErrors={submitted} />
<button onClick={() => { setSubmitted(true); if (errors.length === 0) save(data) }}>Submit</button>
```

`textbox` and `textarea` also take `min_length` / `max_length` (characters as
typed; `max_length` stops typing at the limit and shows a `12/100` counter),
`format` (`email`, `phone_th` = 10-digit mobile starting 06/08/09, `thai_id` =
13 digits with the check digit verified, `postcode_th`, `digits`; dashes and
spaces are allowed in phone numbers and IDs) and `pattern` (a regular expression
the whole value must match, no `^`/`$` needed). Checks run required → length →
format → pattern and show the first failure; an empty optional field passes.
Override the messages with `min_length_message`, `max_length_message` and
`pattern_message`. An unknown format, a broken pattern or `min_length` >
`max_length` throws.

`style` (on any control) accepts `padding`, `margin`, `font_size`, `color`, and
`border`; `front_size` and `boarder` are accepted as aliases.
