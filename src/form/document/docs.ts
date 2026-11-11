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

const requiredProps: PropDoc[] = [
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description:
      'ต้องมีค่า ถ้าว่าง (ข้อความว่าง/มีแต่ช่องว่าง, วันที่/เวลา null, ตัวเลือกไม่มี 1 เลย) จะแสดงข้อความแจ้งเตือนสีแดง ' +
      'หลังผู้ใช้แก้ช่องนั้น หรือเมื่อ FormBuilder ได้ showErrors และมี * หลัง label',
  },
  { name: 'required_message', type: 'string', description: 'ข้อความแจ้งเตือนแทนข้อความมาตรฐาน' },
]

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
    summary:
      'ช่องกรอกข้อความบรรทัดเดียว (Bootstrap form-control) ค่าที่พิมพ์จะถูกเก็บใน value ' +
      'ถ้า input_type เป็น password ข้อความจะถูกซ่อนเป็นจุดและมีปุ่ม "แสดง/ซ่อน" ' +
      '(สถานะแสดง/ซ่อนเป็นของหน้าจอ ไม่ถูกเก็บใน JSON หรือ data)',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'string', default: "''", description: 'ค่าปัจจุบัน' },
      { name: 'placeholder', type: 'string', description: 'ข้อความตัวอย่างในช่อง' },
      { name: 'input_type', type: "'text' | 'password' | 'email' | 'number' | 'tel' | 'url'", default: "'text'", description: "ชนิดของ input ('password' = ช่องรหัสผ่านพร้อมปุ่มแสดง/ซ่อน)" },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการแก้ไข' },
      ...requiredProps,
      bindingProp,
    ],
    examples: [
      { type: 'textbox', id: 'ex_textbox', label: 'ชื่อ', placeholder: 'กรอกชื่อ', value: 'piyavach' },
      { type: 'textbox', id: 'ex_textbox_bound', label: 'ชื่อ (bind กับ fname)', databinding: 'fname', value: 'ถูก data override' },
      {
        type: 'textbox', id: 'ex_textbox_required', label: 'อีเมล (required — ลบข้อความออกเพื่อดูข้อความแจ้งเตือน)',
        input_type: 'email', required: true, required_message: 'กรุณากรอกอีเมล', value: 'a@b.c',
      },
      {
        type: 'textbox', id: 'ex_textbox_password', label: 'รหัสผ่าน', input_type: 'password',
        placeholder: 'กรอกรหัสผ่าน', value: 'secret',
      },
    ],
    data: { fname: { type: 'string', value: 'piyavach' } },
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
      ...requiredProps,
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
    type: 'date_range',
    group: 'Control',
    summary:
      'ช่วงวันที่แบบพุทธศักราช เช่น วันลา "ตั้งแต่ … ถึง …" เป็นกล่องวันที่ 2 กล่องใต้ label เดียว ' +
      'แต่ละฝั่งเก็บเป็น YYYYMMDD หรือ null ปฏิทินฝั่ง "ถึง" เลือกวันก่อน "ตั้งแต่" ไม่ได้ (และกลับกัน) ' +
      'ถ้าข้อมูลมีวันสิ้นสุดก่อนวันเริ่มต้นจะแสดงข้อความ "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น" เสมอ',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value_from', type: 'number | null', default: 'null', description: 'วันเริ่มต้น YYYYMMDD (ใช้เมื่อไม่ได้ bind)' },
      { name: 'value_to', type: 'number | null', default: 'null', description: 'วันสิ้นสุด YYYYMMDD (ใช้เมื่อไม่ได้ bind)' },
      { name: 'placeholder', type: 'string', default: "'วว/ดด/ปปปป'", description: 'ข้อความในกล่องที่ยังไม่มีค่า' },
      { name: 'min_year', type: 'number', default: 'ปีปัจจุบัน - 100', description: 'ปี พ.ศ. ต่ำสุดที่เลือกได้' },
      { name: 'max_year', type: 'number', default: 'ปีปัจจุบัน + 20', description: 'ปี พ.ศ. สูงสุดที่เลือกได้' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการเลือก' },
      {
        name: 'required',
        type: 'boolean',
        default: 'false',
        description: 'ต้องเลือกครบทั้ง 2 ฝั่ง ถ้าขาดฝั่งใดจะแสดง "กรุณาเลือกช่วงวันที่ให้ครบ"',
      },
      { name: 'required_message', type: 'string', description: 'ข้อความแจ้งเตือนแทนข้อความมาตรฐาน (เฉพาะกรณีเลือกไม่ครบ)' },
      {
        name: 'databinding_from',
        type: 'string',
        description: 'key ใน data ของวันเริ่มต้น { "type": "number", "value": 25681118 } ต้องตั้งคู่กับ databinding_to',
      },
      {
        name: 'databinding_to',
        type: 'string',
        description: 'key ใน data ของวันสิ้นสุด ตั้งแค่ฝั่งเดียวจะ throw error',
      },
    ],
    examples: [
      {
        type: 'date_range', id: 'ex_leave', label: 'วันลา (bind กับ leave_from / leave_to, required)',
        databinding_from: 'leave_from', databinding_to: 'leave_to', required: true,
      },
      { type: 'date_range', id: 'ex_range_inline', label: 'ช่วงเวลาโครงการ', value_from: 25690101, value_to: null },
    ],
    data: {
      leave_from: { type: 'number', value: 25681118 },
      leave_to: { type: 'number', value: 25681120 },
    },
  },
  {
    type: 'time',
    group: 'Control',
    summary:
      'เวลา ค่าเก็บเป็น Number รูปแบบ HHMM เช่น 1430 = 14:30 (0 = 00:00) แสดงในกล่องเป็น HH:mm ' +
      'คลิกกล่องหรือปุ่ม 🕒 เพื่อเลือกชั่วโมง/นาที แล้วกด "ตกลง" มีปุ่ม "ล้างค่า" และ "ตอนนี้" ค่าว่างเป็น null',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'number | null', default: 'null', description: 'HHMM (ชั่วโมง 0-23, นาที 0-59) ค่าอื่นจะ throw error' },
      { name: 'placeholder', type: 'string', default: "'ชช:นน'", description: 'ข้อความเมื่อยังไม่มีค่า' },
      { name: 'minute_step', type: 'number', default: '1', description: 'นาทีที่ให้เลือกทุก ๆ N นาที (1-60) เช่น 15 = 00, 15, 30, 45' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการเลือก' },
      ...requiredProps,
      {
        name: 'databinding',
        type: 'string',
        description: 'key ใน data ที่เป็น { "type": "number", "value": 1430 } (value เป็น null ได้) ค่าใน data ชนะ value ใน schema',
      },
    ],
    examples: [
      { type: 'time', id: 'ex_time', label: 'เวลานัด', value: 1430 },
      {
        type: 'time', id: 'ex_time_bound', label: 'เวลาเข้างาน (bind กับ start_time, ทุก 15 นาที, required)',
        databinding: 'start_time', minute_step: 15, required: true,
      },
    ],
    data: { start_time: { type: 'number', value: 830 } },
  },
  {
    type: 'datetime',
    group: 'Control',
    summary:
      'วันและเวลาแบบพุทธศักราช ค่าเก็บเป็น Number รูปแบบ YYYYMMDDHHMM เช่น 256811181430 = 18/11/2568 14:30 ' +
      'แสดงเป็น dd/mm/yyyy HH:mm เปิดปฏิทินพร้อมช่องเลือกเวลา เลือกวัน + เวลาแล้วกด "ตกลง" ค่าว่างเป็น null',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'number | null', default: 'null', description: 'YYYYMMDDHHMM ปี พ.ศ. ถ้าไม่ใช่วันเวลาที่มีอยู่จริงจะ throw error' },
      { name: 'placeholder', type: 'string', default: "'วว/ดด/ปปปป ชช:นน'", description: 'ข้อความเมื่อยังไม่มีค่า' },
      { name: 'min_year', type: 'number', default: 'ปีปัจจุบัน - 100', description: 'ปี พ.ศ. ต่ำสุดที่เลือกได้' },
      { name: 'max_year', type: 'number', default: 'ปีปัจจุบัน + 20', description: 'ปี พ.ศ. สูงสุดที่เลือกได้' },
      { name: 'minute_step', type: 'number', default: '1', description: 'นาทีที่ให้เลือกทุก ๆ N นาที (1-60)' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการเลือก' },
      ...requiredProps,
      {
        name: 'databinding',
        type: 'string',
        description: 'key ใน data ที่เป็น { "type": "number", "value": 256811181430 } (value เป็น null ได้) ค่าใน data ชนะ value ใน schema',
      },
    ],
    examples: [
      { type: 'datetime', id: 'ex_datetime', label: 'วันเวลานัดหมาย', value: 256811181430 },
      {
        type: 'datetime', id: 'ex_datetime_bound', label: 'เริ่มกิจกรรม (bind กับ starts_at, ทุก 30 นาที, required)',
        databinding: 'starts_at', minute_step: 30, required: true,
      },
    ],
    data: { starts_at: { type: 'number', value: null } },
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
      ...requiredProps,
      bindingProp,
    ],
    examples: [
      { type: 'textarea', id: 'ex_textarea', label: 'หมายเหตุ', placeholder: 'พิมพ์หมายเหตุ', rows: 3, value: '' },
    ],
  },
  {
    type: 'switch',
    group: 'Control',
    summary:
      'สวิตช์เปิด/ปิด (div role="switch") สำหรับคำถามใช่/ไม่ใช่ เช่น การยินยอม ค่าเก็บเป็น Number ' +
      '1 = เปิด, 0 = ปิด คลิกหรือกด Space/Enter เพื่อสลับ ถ้าตั้ง required สวิตช์ต้องเปิดจึงจะผ่าน',
    props: [
      { name: 'label', type: 'string', description: 'หัวข้อเหนือสวิตช์' },
      { name: 'text', type: 'string', description: 'ข้อความข้างสวิตช์ เช่น "ยินยอมให้เก็บข้อมูล"' },
      { name: 'value', type: '0 | 1', default: '0', description: '1 = เปิด, 0 = ปิด ค่าอื่นจะ throw error' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการสลับ' },
      {
        name: 'required',
        type: 'boolean',
        default: 'false',
        description: 'สวิตช์ต้องเปิด (เช่น ต้องยินยอมก่อนส่ง) ถ้าปิดอยู่จะแสดงข้อความแจ้งเตือนสีแดง',
      },
      { name: 'required_message', type: 'string', default: "'กรุณาเปิดตัวเลือกนี้'", description: 'ข้อความแจ้งเตือนแทนข้อความมาตรฐาน' },
      {
        name: 'databinding',
        type: 'string',
        description: 'key ใน data ที่เป็น { "type": "number", "value": 1 } (null นับเป็นปิด) ค่าใน data ชนะ value ใน schema',
      },
    ],
    examples: [
      { type: 'switch', id: 'ex_switch', text: 'รับข่าวสารทางอีเมล', value: 1 },
      {
        type: 'switch', id: 'ex_switch_consent', label: 'การยินยอม (bind กับ consent, required)',
        text: 'ยินยอมให้เก็บข้อมูลส่วนบุคคล', databinding: 'consent', required: true,
        required_message: 'ต้องยินยอมก่อนส่งแบบฟอร์ม',
      },
      { type: 'switch', id: 'ex_switch_disabled', text: 'ปิดการใช้งาน (disabled)', value: 0, disabled: true },
    ],
    data: { consent: { type: 'number', value: 0 } },
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
      ...requiredProps,
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
      ...requiredProps,
      bindingProp,
    ],
    examples: [
      {
        type: 'checkbox_group', id: 'ex_checkbox_multi', label: 'งานอดิเรก',
        options: ['อ่านหนังสือ', 'ดนตรี', 'กีฬา'], value: [1, 0, 1], required: true,
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
      ...requiredProps,
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
