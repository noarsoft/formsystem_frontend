import { useState } from 'react'
import FormBuilder from '../../componenets/libs/Formbuilder'
import type { FormData, FormDocument } from '../../componenets/libs/controlTypes'
import { commonProps, controlDocs } from './docs'
import type { ControlDoc, PropDoc } from './docs'

function PropTable({ props }: { props: PropDoc[] }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead>
          <tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <td><code>{prop.name}</code></td>
              <td><code>{prop.type}</code></td>
              <td>{prop.default ? <code>{prop.default}</code> : '-'}</td>
              <td>{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ControlSection({ doc }: { doc: ControlDoc }) {
  const [form, setForm] = useState<FormDocument>({ controls: doc.examples })
  const [data, setData] = useState<FormData | undefined>(doc.data)

  return (
    <section id={`doc-${doc.type}`} className="mb-5">
      <h3 className="h4">
        <code>{doc.type}</code> <span className="badge text-bg-secondary fs-6">{doc.group}</span>
      </h3>
      <p>{doc.summary}</p>
      <PropTable props={doc.props} />
      <div className="row g-3">
        <div className="col-lg-6">
          <h4 className="h6">ตัวอย่างที่ใช้งานได้จริง</h4>
          <div className="border rounded p-3">
            <FormBuilder form={form} onChange={setForm} data={data} onDataChange={setData} />
          </div>
        </div>
        <div className="col-lg-6">
          <h4 className="h6">JSON (อัปเดตตามการแก้ไข)</h4>
          <pre className="rounded mb-0" style={{ maxHeight: 320 }}>
            {JSON.stringify(form, null, 2)}
            {data && `\n\n// data\n${JSON.stringify(data, null, 2)}`}
          </pre>
        </div>
      </div>
    </section>
  )
}

export default function ControlDocument() {
  return (
    <div>
      <h2>Control documentation</h2>
      <p>
        ฟอร์มคือ JSON ที่มีอาร์เรย์ <code>controls</code> ส่งให้{' '}
        <code>{'<FormBuilder form={form} onChange={setForm} />'}</code>{' '}
        ค่าที่ผู้ใช้กรอกจะถูกเขียนกลับเข้า <code>value</code> ของ control นั้น ๆ แล้วเรียก{' '}
        <code>onChange</code> ด้วยเอกสารใหม่ (ไม่แก้ข้อมูลเดิม) สไตล์ใช้ Bootstrap 5.3 จาก CDN
        ส่วน checkbox, radio และ dropdown เป็น div ที่เขียนเอง (ไม่ใช้ input/select ของเบราว์เซอร์)
      </p>
      <pre>{`{ "controls": [ { "type": "textbox", "id": "name", "label": "ชื่อ", "value": "" } ] }`}</pre>

      <h3 className="h4 mt-4">Data binding</h3>
      <p>
        control ที่มี <code>databinding</code> จะอ่าน/เขียนค่าจาก <code>data</code> ที่ส่งให้{' '}
        <code>{'<FormBuilder data={data} onDataChange={setData} />'}</code> โดยค่าใน data ชนะ{' '}
        <code>value</code> ใน schema เสมอ ถ้า key ไม่มีใน data หรือชนิดไม่ตรงจะ throw error
        ช่องข้อความใช้ <code>{'{ "type": "string", "value": "..." }'}</code> ส่วนตัวเลือกใช้{' '}
        <code>{'{ "type": "number", "is_array": 1, "options": [...], "value": [0, 1] }'}</code>{' '}
        (<code>options</code> ใน data ชนะ <code>options</code> ใน schema) ส่วนวันที่ใช้{' '}
        <code>{'{ "type": "number", "value": 25681118 }'}</code>
      </p>

      <h3 className="h4 mt-4">Properties ที่ทุก control ใช้ร่วมกัน</h3>
      <PropTable props={commonProps} />

      <ul className="list-inline">
        {controlDocs.map((doc) => (
          <li key={doc.type} className="list-inline-item">
            <a href={`#doc-${doc.type}`}>{doc.type}</a>
          </li>
        ))}
      </ul>

      {controlDocs.map((doc) => <ControlSection key={doc.type} doc={doc} />)}
    </div>
  )
}
