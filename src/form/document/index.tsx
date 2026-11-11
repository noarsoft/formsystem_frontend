import { useState } from 'react'
import FormBuilder from '../../componenets/libs/Formbuilder'
import type { FormData, FormDocument } from '../../componenets/libs/controlTypes'
import { validateForm } from '../../componenets/libs/validation'
import { commonProps, controlDocs, visibleIfExample } from './docs'
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

function VisibleIfSection() {
  const [form, setForm] = useState<FormDocument>(visibleIfExample.form)
  const [data, setData] = useState<FormData>(visibleIfExample.data)
  const errors = validateForm(form, data)

  return (
    <section id="doc-visible_if" className="mb-5">
      <h3 className="h4 mt-4">แสดง/ซ่อนตามเงื่อนไข (<code>visible_if</code>)</h3>
      <p>
        ใส่ <code>visible_if</code> ใน control ใดก็ได้ (รวมถึงกล่อง/การ์ด ซึ่งจะซ่อนทุกอย่างข้างใน) ให้แสดงเฉพาะเมื่อคำตอบใน
        data ตรงเงื่อนไข <code>field</code> คือ key ใน data ส่วนช่องตัวเลือกเทียบกับชื่อตัวเลือก
      </p>
      <ul>
        <li><code>{'{ "field": "gender", "equals": "อื่น ๆ" }'}</code> ตอบ "อื่น ๆ" → แสดง</li>
        <li><code>{'{ "field": "disease", "not_equals": "ไม่มี" }'}</code> ตอบแล้วและไม่ใช่ "ไม่มี" → แสดง (ยังไม่ตอบ = ซ่อน)</li>
        <li><code>{'{ "field": "education", "in": ["ปริญญาโท", "ปริญญาเอก"] }'}</code> ตอบข้อใดข้อหนึ่ง → แสดง</li>
        <li><code>{'{ "field": "phone", "filled": true }'}</code> กรอกแล้ว → แสดง (<code>false</code> = ยังว่าง → แสดง)</li>
        <li><code>{'[ {...}, {...} ]'}</code> ทุกข้อต้องจริง</li>
      </ul>
      <p>
        ช่องที่ถูกซ่อนไม่ถูกตรวจ required/รูปแบบ และค่าใน data ยังอยู่ (เปลี่ยนใจกลับมาค่าเดิมยังอยู่)
        อ้าง key ที่ไม่มีใน data หรือใส่เงื่อนไขไม่ครบ/เกิน 1 แบบจะ throw error
      </p>
      <div className="row g-3">
        <div className="col-lg-6">
          <h4 className="h6">ตัวอย่างที่ใช้งานได้จริง</h4>
          <div className="border rounded p-3">
            <FormBuilder form={form} onChange={setForm} data={data} onDataChange={setData} />
            <div className="small text-body-secondary mt-3" role="status">
              validateForm: {errors.length === 0 ? 'ผ่าน' : errors.map((e) => `${e.id}: ${e.message}`).join(', ')}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <h4 className="h6">data (อัปเดตตามการแก้ไข)</h4>
          <pre className="rounded mb-0" style={{ maxHeight: 420 }}>{JSON.stringify(data, null, 2)}</pre>
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
        <code>{'{ "type": "number", "value": 25681118 }'}</code> เวลาใช้ <code>1430</code>{' '}
        และวันเวลาใช้ <code>256811181430</code>
      </p>

      <h3 className="h4 mt-4">Validation (required)</h3>
      <p>
        ช่องกรอกและช่องตัวเลือก (textbox, number, date, date_range, time, datetime, textarea, dropdown, checkbox_group, option, switch) ตั้ง{' '}
        <code>{'"required": true'}</code> ได้ จะมี <span className="text-danger">*</span> หลัง label
        และถ้าค่าว่าง (สำหรับ switch คือยังปิดอยู่) จะแสดงข้อความสีแดงใต้ช่อง (เปลี่ยนข้อความด้วย <code>required_message</code>)
        ข้อความจะขึ้นหลังผู้ใช้แก้ช่องนั้น หรือขึ้นทุกช่องพร้อมกันเมื่อส่ง{' '}
        <code>{'<FormBuilder showErrors />'}</code> (เช่น หลังกดปุ่มส่ง) ตรวจทั้งฟอร์มด้วย{' '}
        <code>validateForm(form, data)</code> จาก <code>libs/validation.ts</code> ซึ่งคืนรายการ{' '}
        <code>{'{ id, message }'}</code> (อาร์เรย์ว่าง = ผ่าน)
      </p>
      <p>
        textbox และ textarea ตรวจเพิ่มได้ด้วย <code>min_length</code> / <code>max_length</code>,{' '}
        <code>format</code> (email, phone_th, thai_id, postcode_th, digits) และ <code>pattern</code> (regex)
        ตรวจตามลำดับ ห้ามว่าง → ความยาว → รูปแบบ แล้วแสดงข้อความแรกที่ไม่ผ่าน ค่าว่างที่ไม่ required ถือว่าผ่าน
      </p>

      <VisibleIfSection />

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
