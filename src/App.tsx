import { useState } from 'react'
import FormBuilder from './componenets/libs/Formbuilder'
import type { FormData, FormDocument } from './componenets/libs/controlTypes'
import { validateForm } from './componenets/libs/validation'
import controlsJson from './assets/controls.json'
import dataJson from './assets/data.json'
import ControlDocument from './form/document'
import './App.css'

const initialForm = controlsJson as FormDocument
const initialData = dataJson as FormData

function App() {
  const [form, setForm] = useState(initialForm)
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState<'demo' | 'document'>('demo')
  // Set by the submit button: from then on every validation error is shown.
  const [submitted, setSubmitted] = useState(false)
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
          <FormBuilder form={form} onChange={setForm} data={data} onDataChange={setData} showErrors={submitted} />
          <button type="button" className="btn btn-primary mt-3" onClick={() => setSubmitted(true)}>
            ส่งข้อมูล
          </button>
          {submitted && (
            <div role="status" className={`alert mt-3 ${errors.length ? 'alert-danger' : 'alert-success'}`}>
              {errors.length ? `กรอกข้อมูลไม่ครบ ${errors.length} ช่อง` : 'ข้อมูลครบถ้วน พร้อมส่ง'}
            </div>
          )}
          <h2 className="h4 mt-4">data</h2>
          <pre aria-label="data">{JSON.stringify(data, null, 2)}</pre>
        </>
      ) : (
        <ControlDocument />
      )}
    </main>
  )
}

export default App
