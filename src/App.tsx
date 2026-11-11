import { useState } from 'react'
import FormBuilder from './componenets/libs/Formbuilder'
import type { FormData, FormDocument } from './componenets/libs/controlTypes'
import { validateForm } from './componenets/libs/validation'
import controlsJson from './assets/controls.json'
import dataJson from './assets/data.json'
import ControlDocument from './form/document'
import DemoEditor from './demo/DemoEditor'
import Switch from './componenets/control/switch/Switch'
import './App.css'

const initialForm = controlsJson as FormDocument
const initialData = dataJson as FormData

function App() {
  const [form, setForm] = useState(initialForm)
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState<'demo' | 'document'>('demo')
  // Set by the submit button: from then on every validation error is shown.
  const [submitted, setSubmitted] = useState(false)
  // View the whole form read-only (like staff reviewing a submitted form).
  const [readonly, setReadonly] = useState(false)
  const errors = validateForm(form, data)

  return (
    <main>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button type="button" className={`nav-link${page === 'demo' ? ' active' : ''}`} onClick={() => setPage('demo')}>
            Demo
          </button>
        </li>
        <li className="nav-item">
          <button type="button" className={`nav-link${page === 'document' ? ' active' : ''}`} onClick={() => setPage('document')}>
            Document
          </button>
        </li>
      </ul>

      {page === 'demo' ? (
        <>
          <Switch
            id="demo_readonly"
            text="ดูแบบอ่านอย่างเดียว (readonly ทั้งฟอร์ม)"
            value={readonly ? 1 : 0}
            style={{ margin: '0 0 1rem' }}
            onChange={(value) => setReadonly(value === 1)}
          />
          <FormBuilder
            form={form}
            onChange={setForm}
            data={data}
            onDataChange={setData}
            showErrors={submitted}
            readonly={readonly}
          />
          <button type="button" className="btn btn-primary mt-3" onClick={() => setSubmitted(true)}>
            ส่งข้อมูล
          </button>
          {submitted && (
            <div role="status" className={`alert mt-3 ${errors.length ? 'alert-danger' : 'alert-success'}`}>
              {errors.length ? `กรอกข้อมูลไม่ครบ ${errors.length} ช่อง` : 'ข้อมูลครบถ้วน พร้อมส่ง'}
            </div>
          )}
          <DemoEditor
            form={form}
            data={data}
            onChange={(nextForm, nextData) => {
              setForm(nextForm)
              setData(nextData)
            }}
          />
          <h2 className="h4 mt-4">data</h2>
          <pre aria-label="data">{JSON.stringify(data, null, 2)}</pre>
          {/* Not saved anywhere: refresh restores the sample form. Copy the JSON to keep a layout. */}
          <details className="mt-3">
            <summary>ดู JSON ของฟอร์ม</summary>
            <pre aria-label="form">{JSON.stringify(form, null, 2)}</pre>
          </details>
        </>
      ) : (
        <ControlDocument />
      )}
    </main>
  )
}

export default App
