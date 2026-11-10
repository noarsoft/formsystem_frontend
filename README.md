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

Controls: `textbox`, `password`, `date`, `textarea`, `label`, `dropdown`, `checkbox_group`, `option`,
`button` (controls); `container`, `grid`, `flex` (containers); `accordion`,
`card`, `badge` (custom, in `src/componenets/custom`). Choice controls use
`options: string[]` and `value: number[]` (one 0/1 per option):
`checkbox_group` selects any number, `option` selects at most one, and
`dropdown` is single unless `multiple: true`. `date` stores a Buddhist-era
number `YYYYMMDD` (25681118 = 18/11/2568) and shows `dd/mm/yyyy`; bind it to
`{ "type": "number", "value": 25681118 }` (`null` = empty). `dropdown`,
`checkbox_group` and
`option` are div-based (ARIA roles + keyboard support, styled in
`control/controls.css`) rather than native `select` / checkbox / radio inputs.

Any control can set `colno` / `rowno` (0-based, plus optional `colspan` /
`rowspan`); the surrounding `grid` places it there. Out-of-range or overlapping
cells and malformed choice values throw an error instead of being dropped.

Every control is documented, with live examples, in `src/form/document`
(the **Document** tab of the demo app). To add a control, add its config type to
`libs/controlTypes.ts`, a case to `libs/ControlRenderer.tsx`, and an entry to
`src/form/document/docs.ts`.

`style` (on any control) accepts `padding`, `margin`, `font_size`, `color`, and
`border`; `front_size` and `boarder` are accepted as aliases.
