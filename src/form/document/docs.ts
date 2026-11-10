import type { ControlConfig, FormData } from '../../componenets/libs/controlTypes'

export interface PropDoc {
  name: string
  type: string
  default?: string
  description: string
}

export interface ControlDoc {
  type: ControlConfig['type']
  group: 'Container' | 'Control' | 'Custom'
  summary: string
  props: PropDoc[]
  examples: ControlConfig[]
  // Data used by examples that set `databinding`.
  data?: FormData
}

const bindingProp: PropDoc = {
  name: 'databinding',
  type: 'string',
  description: 'key ใน data ที่ control นี้อ่าน/เขียน ถ้าระบุ ค่าใน data จะชนะ value ที่เขียนใน schema เสมอ',
}

export const commonProps: PropDoc[] = [
  { name: 'type', type: 'string', description: 'ชนิดของ control (บังคับ) ดูรายการด้านล่าง' },
  { name: 'id', type: 'string', description: 'รหัสของ control ใช้เป็น id ใน DOM ด้วย ควรไม่ซ้ำกันในหน้าเดียว' },
  { name: 'colno', type: 'number', description: 'ลำดับคอลัมน์ (เริ่มที่ 0) เมื่อ control อยู่ใน grid' },
  { name: 'rowno', type: 'number', description: 'ลำดับแถว (เริ่มที่ 0) เมื่อ control อยู่ใน grid' },
  { name: 'colspan', type: 'number', default: '1', description: 'จำนวนคอลัมน์ที่ control กินพื้นที่ใน grid' },
  { name: 'rowspan', type: 'number', default: '1', description: 'จำนวนแถวที่ control กินพื้นที่ใน grid' },
  {
    name: 'style',
    type: 'object',
    description: 'padding, margin, font_size, color, border (ค่า CSS เป็น string หรือ number)',
  },
]

export const controlDocs: ControlDoc[] = [
  {
    type: 'textbox',
    group: 'Control',
    summary: 'ช่องกรอกข้อความบรรทัดเดียว (Bootstrap form-control) ค่าที่พิมพ์จะถูกเก็บใน value',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'string', default: "''", description: 'ค่าปัจจุบัน' },
      { name: 'placeholder', type: 'string', description: 'ข้อความตัวอย่างในช่อง' },
      { name: 'input_type', type: "'text' | 'password' | 'email' | 'number' | 'tel' | 'url'", default: "'text'", description: 'ชนิดของ input' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการแก้ไข' },
      bindingProp,
    ],
    examples: [
      { type: 'textbox', id: 'ex_textbox', label: 'ชื่อ', placeholder: 'กรอกชื่อ', value: 'piyavach' },
      { type: 'textbox', id: 'ex_textbox_bound', label: 'ชื่อ (bind กับ fname)', databinding: 'fname', value: 'ถูก data override' },
    ],
    data: { fname: { type: 'string', value: 'piyavach' } },
  },
  {
    type: 'password',
    group: 'Control',
    summary:
      'ช่องรหัสผ่าน สร้างจาก Textbox + Button ข้อความถูกซ่อนเป็นจุด กดปุ่ม "แสดง/ซ่อน" เพื่อสลับ ' +
      '(สถานะแสดง/ซ่อนเป็นของหน้าจอ ไม่ถูกเก็บใน JSON หรือ data)',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'string', default: "''", description: 'ค่าปัจจุบัน' },
      { name: 'placeholder', type: 'string', description: 'ข้อความตัวอย่างในช่อง' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการแก้ไขช่องกรอก' },
      bindingProp,
    ],
    examples: [
      { type: 'password', id: 'ex_password', label: 'รหัสผ่าน', placeholder: 'กรอกรหัสผ่าน', value: 'secret' },
    ],
  },
  {
    type: 'date',
    group: 'Control',
    summary:
      'วันที่แบบพุทธศักราช ค่าเก็บเป็น Number รูปแบบ YYYYMMDD (พ.ศ.) เช่น 25681118 = 18/11/2568 ' +
      'แสดงในกล่องเป็น dd/mm/yyyy มีปุ่มด้านขวา คลิกกล่องหรือปุ่มเพื่อเปิด modal ปฏิทิน ' +
      'เลือกเดือน ปี และวันได้ มีปุ่ม "ล้างค่า" และ "วันนี้" ค่าว่างเป็น null',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'number | null', default: 'null', description: 'YYYYMMDD ปี พ.ศ. ถ้าไม่ใช่วันที่ที่มีอยู่จริงจะ throw error' },
      { name: 'placeholder', type: 'string', default: "'วว/ดด/ปปปป'", description: 'ข้อความเมื่อยังไม่มีค่า' },
      { name: 'min_year', type: 'number', default: 'ปีปัจจุบัน - 100', description: 'ปี พ.ศ. ต่ำสุดที่เลือกได้ (ขยายให้ครอบคลุมค่าปัจจุบันเสมอ)' },
      { name: 'max_year', type: 'number', default: 'ปีปัจจุบัน + 20', description: 'ปี พ.ศ. สูงสุดที่เลือกได้' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการเลือก' },
      {
        name: 'databinding',
        type: 'string',
        description: 'key ใน data ที่เป็น { "type": "number", "value": 25681118 } (value เป็น null ได้) ค่าใน data ชนะ value ใน schema',
      },
    ],
    examples: [
      { type: 'date', id: 'ex_date', label: 'วันที่', value: 25681118 },
      { type: 'date', id: 'ex_date_bound', label: 'วันเกิด (bind กับ birthday)', databinding: 'birthday', min_year: 2450 },
    ],
    data: { birthday: { type: 'number', value: 25430229 } },
  },
  {
    type: 'textarea',
    group: 'Control',
    summary: 'ช่องกรอกข้อความหลายบรรทัด',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'string', default: "''", description: 'ค่าปัจจุบัน' },
      { name: 'placeholder', type: 'string', description: 'ข้อความตัวอย่างในช่อง' },
      { name: 'rows', type: 'number', default: '3', description: 'จำนวนบรรทัดที่แสดง' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการแก้ไข' },
      bindingProp,
    ],
    examples: [
      { type: 'textarea', id: 'ex_textarea', label: 'หมายเหตุ', placeholder: 'พิมพ์หมายเหตุ', rows: 3, value: '' },
    ],
  },
  {
    type: 'label',
    group: 'Control',
    summary: 'ข้อความป้ายกำกับ (form-label) ใช้แสดงหัวข้อ หรือผูกกับ control อื่นผ่าน for',
    props: [
      { name: 'text', type: 'string', description: 'ข้อความ (บังคับ)' },
      { name: 'for', type: 'string', description: 'id ของ control ที่ label นี้อ้างถึง' },
    ],
    examples: [{ type: 'label', id: 'ex_label', text: 'ข้อมูลส่วนตัว' }],
  },
  {
    type: 'dropdown',
    group: 'Control',
    summary:
      'รายการเลือกแบบ div (combobox + listbox) ค่าเก็บเป็นอาร์เรย์ 0/1 เรียงตาม options ' +
      'ถ้าไม่ได้ตั้ง multiple จะเลือกได้ไม่เกิน 1 ตัวและมีรายการ "-- เลือก --" สำหรับล้างค่า ' +
      'รองรับคีย์บอร์ด (ลูกศร, Enter/Space, Esc)',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'options', type: 'string[]', description: 'ข้อความของแต่ละตัวเลือก (บังคับ ยกเว้นเมื่อ data มี options)' },
      { name: 'value', type: 'number[]', default: 'ศูนย์ทุกตัว', description: 'อาร์เรย์ 0/1 ความยาวเท่ากับ options' },
      { name: 'multiple', type: 'boolean', default: 'false', description: 'เลือกได้หลายตัว' },
      bindingProp,
    ],
    examples: [
      { type: 'dropdown', id: 'ex_dropdown_single', label: 'เพศ', options: ['ชาย', 'หญิง'], value: [0, 1] },
      {
        type: 'dropdown', id: 'ex_dropdown_multi', label: 'ทักษะ (bind กับ skill)', multiple: true,
        databinding: 'skill',
      },
    ],
    data: {
      skill: { type: 'number', is_array: 1, options: ['guitar', 'piano', 'violin'], value: [1, 1, 0] },
    },
  },
  {
    type: 'checkbox_group',
    group: 'Control',
    summary: 'กลุ่ม checkbox แบบ div เลือกได้หลายอัน (ถ้าต้องการเลือกได้อันเดียวให้ใช้ control option)',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความหัวกลุ่ม' },
      { name: 'options', type: 'string[]', description: 'ข้อความของแต่ละตัวเลือก (บังคับ ยกเว้นเมื่อ data มี options)' },
      { name: 'value', type: 'number[]', default: 'ศูนย์ทุกตัว', description: 'อาร์เรย์ 0/1 ความยาวเท่ากับ options' },
      { name: 'inline', type: 'boolean', default: 'false', description: 'วางตัวเลือกเรียงในแนวนอน' },
      bindingProp,
    ],
    examples: [
      {
        type: 'checkbox_group', id: 'ex_checkbox_multi', label: 'งานอดิเรก',
        options: ['อ่านหนังสือ', 'ดนตรี', 'กีฬา'], value: [1, 0, 1],
      },
      { type: 'checkbox_group', id: 'ex_checkbox_bound', label: 'Hobby (bind กับ hobby)', databinding: 'hobby', inline: true },
    ],
    data: {
      hobby: { type: 'number', is_array: 1, options: ['guitar', 'piano', 'violin'], value: [0, 1, 1] },
    },
  },
  {
    type: 'option',
    group: 'Control',
    summary:
      'กลุ่มตัวเลือกแบบ div (radio) เลือกได้อันเดียว การเลือกอันใหม่จะล้างอันเดิม ' +
      'ค่ามี 1 ได้ไม่เกิน 1 ตัว รองรับลูกศรเพื่อเลื่อนตัวเลือก',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความหัวกลุ่ม' },
      { name: 'options', type: 'string[]', description: 'ข้อความของแต่ละตัวเลือก (บังคับ ยกเว้นเมื่อ data มี options)' },
      { name: 'value', type: 'number[]', default: 'ศูนย์ทุกตัว', description: 'อาร์เรย์ 0/1 ความยาวเท่ากับ options มี 1 ได้ไม่เกิน 1 ตัว' },
      { name: 'inline', type: 'boolean', default: 'false', description: 'วางตัวเลือกเรียงในแนวนอน' },
      bindingProp,
    ],
    examples: [
      {
        type: 'option', id: 'ex_option', label: 'ระดับการศึกษา', inline: true,
        options: ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'], value: [1, 0, 0],
      },
    ],
  },
  {
    type: 'button',
    group: 'Control',
    summary: 'ปุ่มกด (btn) เมื่อกดจะเรียก onAction ของ FormBuilder พร้อม config ของปุ่ม',
    props: [
      { name: 'text', type: 'string', description: 'ข้อความบนปุ่ม (บังคับ)' },
      { name: 'variant', type: "'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'", default: "'primary'", description: 'สีตาม Bootstrap' },
      { name: 'outline', type: 'boolean', default: 'false', description: 'ปุ่มแบบเส้นขอบ (btn-outline-*)' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการกด' },
    ],
    examples: [{ type: 'button', id: 'ex_button', text: 'บันทึก', variant: 'success' }],
  },
  {
    type: 'container',
    group: 'Container',
    summary: 'กล่องเรียง control ในแนวตั้งแบบเรียบง่าย (FormBuilder ใช้ container นี้เป็นรากของฟอร์ม)',
    props: [
      { name: 'gap', type: '0 | 1 | 2 | 3 | 4 | 5', default: '3', description: 'ระยะห่างระหว่าง control (gap-* ของ Bootstrap)' },
      { name: 'controls', type: 'ControlConfig[]', description: 'control ภายในกล่อง (บังคับ)' },
    ],
    examples: [
      {
        type: 'container', id: 'ex_container', gap: 2,
        controls: [
          { type: 'label', text: 'รายการ' },
          { type: 'badge', text: 'ใหม่', variant: 'success' },
        ],
      },
    ],
  },
  {
    type: 'grid',
    group: 'Container',
    summary:
      'ตาราง CSS grid ลูกแต่ละตัวกำหนด colno / rowno (เริ่มที่ 0) ของตัวเอง grid จะวางลงช่องนั้น ' +
      'ถ้าไม่กำหนดจะวางอัตโนมัติ ตำแหน่งเกินขนาด grid หรือช่องซ้อนกันจะเกิด error',
    props: [
      { name: 'columns', type: 'number', description: 'จำนวนคอลัมน์ (บังคับ)' },
      { name: 'rows', type: 'number', description: 'จำนวนแถว ถ้าระบุจะตรวจว่า rowno ไม่เกิน' },
      { name: 'gap', type: '0 | 1 | 2 | 3 | 4 | 5', default: '3', description: 'ระยะห่างระหว่างช่อง' },
      { name: 'controls', type: 'ControlConfig[]', description: 'control ภายใน แต่ละตัวมี colno/rowno/colspan/rowspan (บังคับ)' },
    ],
    examples: [
      {
        type: 'grid', id: 'ex_grid', columns: 3, rows: 2,
        controls: [
          {
            type: 'flex', id: 'ex_grid_flex0', is_horizontal: 0, colno: 0, rowno: 0,
            controls: [{ type: 'badge', text: 'แถว 0 / คอลัมน์ 0', variant: 'secondary' }],
          },
          {
            type: 'flex', id: 'ex_grid_flex1', is_horizontal: 1, colno: 2, rowno: 1,
            controls: [
              { type: 'textbox', id: 'ex_grid_textbox', label: 'Textbox 1', placeholder: 'Enter text here', value: '' },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'flex',
    group: 'Container',
    summary: 'กล่อง flexbox เรียง control ในแนวนอนหรือแนวตั้ง',
    props: [
      { name: 'is_horizontal', type: '0 | 1', description: '1 = เรียงแนวนอน, 0 = เรียงแนวตั้ง (บังคับ)' },
      { name: 'gap', type: '0 | 1 | 2 | 3 | 4 | 5', default: '3', description: 'ระยะห่างระหว่าง control' },
      { name: 'wrap', type: 'boolean', default: 'false', description: 'ตัดขึ้นบรรทัดใหม่เมื่อเต็ม' },
      { name: 'align', type: "'start' | 'center' | 'end' | 'stretch'", description: 'การจัดแนวตั้งฉากกับทิศทางเรียง (align-items)' },
      { name: 'justify', type: "'start' | 'center' | 'end' | 'between' | 'around'", description: 'การจัดแนวตามทิศทางเรียง (justify-content)' },
      { name: 'controls', type: 'ControlConfig[]', description: 'control ภายใน (บังคับ)' },
    ],
    examples: [
      {
        type: 'flex', id: 'ex_flex', is_horizontal: 1, gap: 2, align: 'center',
        controls: [
          { type: 'badge', text: 'A', variant: 'primary' },
          { type: 'badge', text: 'B', variant: 'warning' },
          { type: 'button', text: 'ปุ่ม', outline: true, variant: 'dark' },
        ],
      },
    ],
  },
  {
    type: 'accordion',
    group: 'Custom',
    summary:
      'แผงพับได้ (Bootstrap accordion) สร้างต่อยอดจาก Container แต่ละ item มี control ภายในของตัวเอง ' +
      'สถานะ open เก็บในข้อมูล จึงไม่ต้องใช้ JavaScript ของ Bootstrap',
    props: [
      { name: 'always_open', type: 'boolean', default: 'false', description: 'true = เปิดหลาย item พร้อมกันได้' },
      { name: 'items', type: '{ title: string; open?: boolean; controls: ControlConfig[] }[]', description: 'รายการแผง (บังคับ)' },
    ],
    examples: [
      {
        type: 'accordion', id: 'ex_accordion',
        items: [
          {
            title: 'ข้อมูลทั่วไป', open: true,
            controls: [{ type: 'textbox', id: 'ex_accordion_name', label: 'ชื่อ', value: '' }],
          },
          {
            title: 'ข้อมูลเพิ่มเติม',
            controls: [{ type: 'textarea', id: 'ex_accordion_note', label: 'หมายเหตุ', value: '' }],
          },
        ],
      },
    ],
  },
  {
    type: 'card',
    group: 'Custom',
    summary: 'การ์ด (Bootstrap card) สร้างต่อยอดจาก Container มี header, title, subtitle, text, footer และ control ภายใน',
    props: [
      { name: 'header', type: 'string', description: 'ข้อความส่วนหัวการ์ด' },
      { name: 'title', type: 'string', description: 'ชื่อเรื่อง' },
      { name: 'subtitle', type: 'string', description: 'ชื่อรอง' },
      { name: 'text', type: 'string', description: 'ข้อความอธิบาย' },
      { name: 'footer', type: 'string', description: 'ข้อความส่วนท้าย' },
      { name: 'controls', type: 'ControlConfig[]', default: '[]', description: 'control ภายในตัวการ์ด' },
    ],
    examples: [
      {
        type: 'card', id: 'ex_card', header: 'สมาชิก', title: 'piyavach', subtitle: 'Developer',
        text: 'การ์ดตัวอย่างที่มี control อยู่ภายใน', footer: 'อัปเดตล่าสุดวันนี้',
        controls: [{ type: 'checkbox_group', id: 'ex_card_check', options: ['รับข่าวสาร'], value: [1] }],
      },
    ],
  },
  {
    type: 'badge',
    group: 'Custom',
    summary: 'ป้ายสถานะขนาดเล็ก (Bootstrap badge)',
    props: [
      { name: 'text', type: 'string', description: 'ข้อความ (บังคับ)' },
      { name: 'variant', type: "'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'", default: "'primary'", description: 'สีตาม Bootstrap (text-bg-*)' },
      { name: 'pill', type: 'boolean', default: 'false', description: 'ขอบมนแบบแคปซูล' },
    ],
    examples: [{ type: 'badge', id: 'ex_badge', text: 'ใช้งานอยู่', variant: 'success', pill: true }],
  },
]
