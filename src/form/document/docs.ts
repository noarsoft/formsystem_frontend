import type { ControlConfig, FormData, FormDocument } from '../../componenets/libs/controlTypes'

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

// Length / format / pattern props shared by textbox and textarea.
const textRuleProps: PropDoc[] = [
  { name: 'min_length', type: 'number', description: 'จำนวนตัวอักษรขั้นต่ำ (นับตามที่พิมพ์ สระ/วรรณยุกต์ไทยนับ 1) ค่าว่างไม่ถูกตรวจ' },
  { name: 'max_length', type: 'number', description: 'จำนวนตัวอักษรสูงสุด พิมพ์เกินไม่ได้ และแสดงตัวนับ "12/100" ใต้ช่อง' },
  {
    name: 'format',
    type: "'email' | 'phone_th' | 'thai_id' | 'postcode_th' | 'digits'",
    description:
      'รูปแบบสำเร็จรูป: อีเมล, มือถือ 10 หลัก (06/08/09), เลขบัตรประชาชน 13 หลัก (เช็กเลขหลักสุดท้าย), ' +
      'รหัสไปรษณีย์ 5 หลัก, ตัวเลขล้วน เบอร์โทรและเลขบัตรพิมพ์ขีด/เว้นวรรคได้',
  },
  { name: 'pattern', type: 'string', description: 'regex ที่ค่าทั้งหมดต้องตรง (ไม่ต้องใส่ ^ $) เช่น "EMP[0-9]{3}" regex ผิดจะ throw error' },
  { name: 'min_length_message', type: 'string', description: 'ข้อความแทน "ต้องมีอย่างน้อย N ตัวอักษร"' },
  { name: 'max_length_message', type: 'string', description: 'ข้อความแทน "ต้องไม่เกิน N ตัวอักษร"' },
  { name: 'pattern_message', type: 'string', description: 'ข้อความแทนข้อความเตือนของ format และ pattern' },
]

const readonlyProp: PropDoc = {
  name: 'readonly',
  type: 'boolean',
  default: 'false',
  description: 'อ่านอย่างเดียว: หน้าตาปกติ โฟกัส/คัดลอกได้ แต่แก้ไม่ได้ และไม่ถูกตรวจ (ช่องวันที่/เวลาซ่อนปุ่ม)',
}

const disabledChoiceProp: PropDoc = {
  name: 'disabled',
  type: 'boolean',
  default: 'false',
  description: 'ปิดการใช้งาน: สีจาง กด/โฟกัสไม่ได้ และไม่ถูกตรวจ',
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
  readonlyProp,
]

export const commonProps: PropDoc[] = [
  { name: 'type', type: 'string', description: 'ชนิดของ control (บังคับ) ดูรายการด้านล่าง' },
  { name: 'id', type: 'string', description: 'รหัสของ control ใช้เป็น id ใน DOM ด้วย ควรไม่ซ้ำกันในหน้าเดียว' },
  { name: 'colno', type: 'number', description: 'ลำดับคอลัมน์ (เริ่มที่ 0) เมื่อ control อยู่ใน grid' },
  { name: 'rowno', type: 'number', description: 'ลำดับแถว (เริ่มที่ 0) เมื่อ control อยู่ใน grid' },
  { name: 'colspan', type: 'number', default: '1', description: 'จำนวนคอลัมน์ที่ control กินพื้นที่ใน grid' },
  { name: 'rowspan', type: 'number', default: '1', description: 'จำนวนแถวที่ control กินพื้นที่ใน grid' },
  {
    name: 'visible_if',
    type: '{ field, equals | not_equals | in | filled } หรือ [ ... ]',
    description:
      'แสดงเฉพาะเมื่อเงื่อนไขเป็นจริง (หลายข้อใน [ ] ต้องจริงทุกข้อ) field = key ใน data ' +
      'ช่องที่ซ่อนไม่ถูกตรวจ และค่าใน data ยังอยู่ ดูหัวข้อ "แสดง/ซ่อนตามเงื่อนไข"',
  },
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
      ...textRuleProps,
      bindingProp,
    ],
    examples: [
      { type: 'textbox', id: 'ex_textbox', label: 'ชื่อ', placeholder: 'กรอกชื่อ', value: 'piyavach' },
      { type: 'textbox', id: 'ex_textbox_readonly', label: 'รหัสนักศึกษา (readonly)', value: '650610001', readonly: true },
      { type: 'textbox', id: 'ex_textbox_bound', label: 'ชื่อ (bind กับ fname)', databinding: 'fname', value: 'ถูก data override' },
      {
        type: 'textbox', id: 'ex_textbox_required', label: 'อีเมล (required — ลบข้อความออกเพื่อดูข้อความแจ้งเตือน)',
        input_type: 'email', required: true, required_message: 'กรุณากรอกอีเมล', value: 'a@b.c',
      },
      { type: 'textbox', id: 'ex_textbox_phone', label: 'เบอร์มือถือ (format: phone_th)', format: 'phone_th', value: '081-234-567' },
      { type: 'textbox', id: 'ex_textbox_thai_id', label: 'เลขบัตรประชาชน (format: thai_id)', format: 'thai_id', value: '' },
      {
        type: 'textbox', id: 'ex_textbox_pattern', label: 'รหัสพนักงาน (pattern + min/max_length)',
        pattern: 'EMP[0-9]{3}', pattern_message: 'รหัสต้องเป็น EMP ตามด้วยตัวเลข 3 หลัก', min_length: 6, max_length: 6, value: 'EMP12',
      },
      {
        type: 'textbox', id: 'ex_textbox_password', label: 'รหัสผ่าน', input_type: 'password',
        placeholder: 'กรอกรหัสผ่าน', value: 'secret',
      },
    ],
    data: { fname: { type: 'string', value: 'piyavach' } },
  },
  {
    type: 'number',
    group: 'Control',
    summary:
      'ช่องตัวเลข เก็บเป็น Number จริง (ว่าง = null, 0 นับว่ามีค่า) พิมพ์ได้เฉพาะตัวเลข จุดทศนิยม และเครื่องหมายลบ ' +
      '(เมื่อ min อนุญาต) ตอนไม่ได้แก้ไขแสดงแบบมีลูกน้ำ เช่น 1,234.5 ตรวจ ห้ามว่าง → ทศนิยม → min → max',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'number | null', default: 'null', description: 'ค่าปัจจุบัน ค่าที่ไม่ใช่ตัวเลขจะ throw error' },
      { name: 'placeholder', type: 'string', description: 'ข้อความเมื่อยังไม่มีค่า' },
      { name: 'min', type: 'number', description: 'ค่าต่ำสุด (ถ้าไม่ติดลบ จะพิมพ์ - ไม่ได้)' },
      { name: 'max', type: 'number', description: 'ค่าสูงสุด' },
      { name: 'decimals', type: 'number', default: '0', description: 'จำนวนทศนิยมที่ยอมรับ 0 = จำนวนเต็มเท่านั้น (พิมพ์จุดแล้วจะเตือน) ถ้ามากกว่า 0 พิมพ์ทศนิยมเกินไม่ได้' },
      { name: 'unit', type: 'string', description: 'หน่วยท้ายช่อง เช่น "บาท", "กก." (แสดงอย่างเดียว)' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการแก้ไข' },
      ...requiredProps,
      { name: 'min_message', type: 'string', description: 'ข้อความแทน "ต้องไม่น้อยกว่า N"' },
      { name: 'max_message', type: 'string', description: 'ข้อความแทน "ต้องไม่เกิน N"' },
      {
        name: 'databinding',
        type: 'string',
        description: 'key ใน data ที่เป็น { "type": "number", "value": 65.5 } (value เป็น null ได้) ค่าใน data ชนะ value ใน schema',
      },
    ],
    examples: [
      { type: 'number', id: 'ex_number_price', label: 'ราคา', unit: 'บาท', decimals: 2, min: 0, value: 1234.5 },
      {
        type: 'number', id: 'ex_number_weight', label: 'น้ำหนัก (bind กับ weight, 1-300, ทศนิยม 1, required)',
        databinding: 'weight', unit: 'กก.', min: 1, max: 300, decimals: 1, required: true,
      },
      { type: 'number', id: 'ex_number_people', label: 'จำนวนคน (จำนวนเต็ม, ไม่เกิน 10)', min: 1, max: 10, value: 12 },
    ],
    data: { weight: { type: 'number', value: 65.5 } },
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
      readonlyProp,
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
      ...textRuleProps,
      bindingProp,
    ],
    examples: [
      { type: 'textarea', id: 'ex_textarea', label: 'หมายเหตุ', placeholder: 'พิมพ์หมายเหตุ', rows: 3, value: '' },
      {
        type: 'textarea', id: 'ex_textarea_limit', label: 'รายละเอียด (min_length 10, max_length 100)',
        min_length: 10, max_length: 100, value: 'สั้นไป',
      },
    ],
  },
  {
    type: 'matrix',
    group: 'Control',
    summary:
      'ตารางคำถามที่ใช้คำตอบชุดเดียวกัน เช่น แบบประเมินความพึงพอใจ แต่ละแถวเก็บแยก 1 key ใน data ' +
      'รูปแบบเดียวกับ option ({ "type": "number", "is_array": 1, "options": columns, "value": [0,1,0] }) ' +
      'จึงใช้ visible_if กับคำตอบของแถวได้ จอ/กล่องแคบจะแสดงทีละคำถาม',
    props: [
      { name: 'label', type: 'string', description: 'หัวข้อของตาราง' },
      { name: 'columns', type: 'string[]', description: 'คำตอบที่ทุกแถวใช้ร่วมกัน (บังคับ)' },
      {
        name: 'rows',
        type: '{ label: string; databinding?: string; value?: number[] }[]',
        description: 'คำถามแต่ละแถว ผูก data ด้วย databinding หรือเก็บใน value (0/1 ต่อคอลัมน์) (บังคับ)',
      },
      { name: 'multiple', type: 'boolean', default: 'false', description: 'ตอบได้หลายคอลัมน์ต่อแถว (checkbox)' },
      disabledChoiceProp,
      {
        name: 'required',
        type: 'boolean',
        default: 'false',
        description: 'ต้องตอบครบทุกแถว แถวที่ยังไม่ตอบจะเป็นสีแดง ข้อความ "กรุณาตอบให้ครบทุกข้อ (ขาด N ข้อ)"',
      },
      { name: 'required_message', type: 'string', description: 'ข้อความแจ้งเตือนแทนข้อความมาตรฐาน' },
      readonlyProp,
    ],
    examples: [
      {
        type: 'matrix', id: 'ex_matrix', label: 'ความพึงพอใจต่อบริการ (required)', required: true,
        columns: ['พอใจมาก', 'พอใจ', 'เฉย ๆ', 'ไม่พอใจ'],
        rows: [
          { label: 'ความสะอาด', databinding: 'q_clean' },
          { label: 'การบริการ', databinding: 'q_service' },
          { label: 'ราคา', databinding: 'q_price' },
        ],
      },
      {
        type: 'textbox', id: 'ex_matrix_why', label: 'ทำไมไม่พอใจเรื่องราคา (visible_if บนแถว "ราคา")', databinding: 'price_reason',
        visible_if: { field: 'q_price', equals: 'ไม่พอใจ' },
      },
    ],
    data: {
      q_clean: { type: 'number', is_array: 1, options: ['พอใจมาก', 'พอใจ', 'เฉย ๆ', 'ไม่พอใจ'], value: [0, 1, 0, 0] },
      q_service: { type: 'number', is_array: 1, options: ['พอใจมาก', 'พอใจ', 'เฉย ๆ', 'ไม่พอใจ'], value: [1, 0, 0, 0] },
      q_price: { type: 'number', is_array: 1, options: ['พอใจมาก', 'พอใจ', 'เฉย ๆ', 'ไม่พอใจ'], value: [0, 0, 0, 0] },
      price_reason: { type: 'string', value: '' },
    },
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
      readonlyProp,
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
    type: 'rating',
    group: 'Control',
    summary:
      'ให้คะแนน แบบดาว ★★★★☆ (ค่าเริ่มต้น 1-5) หรือแบบปุ่มตัวเลข เช่น 0-10 สำหรับ NPS ค่าเก็บเป็น Number (ยังไม่ให้ = null) ' +
      'ชี้เมาส์เพื่อดูก่อน คลิกเพื่อเลือก คลิกค่าเดิมซ้ำเพื่อล้าง ใช้ลูกศร/Home/End ได้',
    props: [
      { name: 'label', type: 'string', description: 'ข้อความป้ายกำกับ' },
      { name: 'value', type: 'number | null', default: 'null', description: 'คะแนน (จำนวนเต็มในช่วง min-max) ค่านอกช่วงจะ throw error' },
      { name: 'display', type: "'star' | 'number'", default: "'star'", description: 'ดาว หรือปุ่มตัวเลข' },
      { name: 'min', type: 'number', default: '1', description: 'คะแนนต่ำสุด (0 ขึ้นไป)' },
      { name: 'max', type: 'number', default: '5', description: 'คะแนนสูงสุด (ไม่เกิน 21 ระดับ)' },
      { name: 'min_label', type: 'string', description: 'ข้อความใต้ฝั่งซ้าย เช่น "ไม่แนะนำเลย"' },
      { name: 'max_label', type: 'string', description: 'ข้อความใต้ฝั่งขวา เช่น "แนะนำแน่นอน"' },
      disabledChoiceProp,
      ...requiredProps,
      {
        name: 'databinding',
        type: 'string',
        description: 'key ใน data ที่เป็น { "type": "number", "value": 4 } (value เป็น null ได้) ค่าใน data ชนะ value ใน schema',
      },
    ],
    examples: [
      { type: 'rating', id: 'ex_rating', label: 'ความพึงพอใจโดยรวม', value: 4 },
      {
        type: 'rating', id: 'ex_rating_nps', label: 'จะแนะนำเราให้เพื่อนไหม (bind กับ nps, 0-10, required)',
        display: 'number', min: 0, max: 10, min_label: 'ไม่แนะนำเลย', max_label: 'แนะนำแน่นอน',
        databinding: 'nps', required: true,
      },
      { type: 'rating', id: 'ex_rating_readonly', label: 'คะแนนที่ให้ไว้ (readonly)', value: 3, readonly: true },
    ],
    data: { nps: { type: 'number', value: null } },
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
      disabledChoiceProp,
      ...requiredProps,
      bindingProp,
    ],
    examples: [
      { type: 'dropdown', id: 'ex_dropdown_single', label: 'เพศ', options: ['ชาย', 'หญิง'], value: [0, 1] },
      { type: 'dropdown', id: 'ex_dropdown_disabled', label: 'สาขา (disabled)', options: ['วิศวะ', 'บัญชี'], value: [1, 0], disabled: true },
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
      disabledChoiceProp,
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
      disabledChoiceProp,
      ...requiredProps,
      bindingProp,
    ],
    examples: [
      {
        type: 'option', id: 'ex_option', label: 'ระดับการศึกษา', inline: true,
        options: ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'], value: [1, 0, 0],
      },
      {
        type: 'option', id: 'ex_option_readonly', label: 'สถานะ (readonly)', inline: true,
        options: ['รออนุมัติ', 'อนุมัติ'], value: [0, 1], readonly: true,
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

// Live example for the "แสดง/ซ่อนตามเงื่อนไข (visible_if)" section.
export const visibleIfExample: { form: FormDocument, data: FormData } = {
  form: {
    controls: [
      { type: 'option', id: 'vi_gender', label: 'เพศ', databinding: 'gender', inline: true },
      {
        type: 'textbox', id: 'vi_gender_other', label: 'โปรดระบุ (equals: "อื่น ๆ")', databinding: 'gender_other',
        required: true, visible_if: { field: 'gender', equals: 'อื่น ๆ' },
      },
      { type: 'checkbox_group', id: 'vi_disease', label: 'โรคประจำตัว', databinding: 'disease', inline: true },
      {
        type: 'textbox', id: 'vi_medicine', label: 'ยาที่ใช้ประจำ (not_equals: "ไม่มี")', databinding: 'medicine',
        visible_if: { field: 'disease', not_equals: 'ไม่มี' },
      },
      { type: 'dropdown', id: 'vi_education', label: 'ระดับการศึกษา', databinding: 'education' },
      {
        type: 'textbox', id: 'vi_thesis', label: 'หัวข้อวิทยานิพนธ์ (in: ["ปริญญาโท", "ปริญญาเอก"])', databinding: 'thesis',
        visible_if: { field: 'education', in: ['ปริญญาโท', 'ปริญญาเอก'] },
      },
      { type: 'switch', id: 'vi_contact', text: 'ให้ติดต่อกลับ', databinding: 'contact' },
      {
        type: 'card', id: 'vi_contact_card', header: 'ช่องทางติดต่อ (equals: 1 — ซ่อนทั้งการ์ด)',
        visible_if: { field: 'contact', equals: 1 },
        controls: [
          { type: 'textbox', id: 'vi_phone', label: 'เบอร์มือถือ', databinding: 'phone', format: 'phone_th', required: true },
          {
            type: 'textbox', id: 'vi_time', label: 'เวลาที่สะดวก (filled: เบอร์ + เพศ = หญิง)', databinding: 'call_time',
            visible_if: [{ field: 'phone', filled: true }, { field: 'gender', equals: 'หญิง' }],
          },
        ],
      },
    ],
  },
  data: {
    gender: { type: 'number', is_array: 1, options: ['ชาย', 'หญิง', 'อื่น ๆ'], value: [0, 0, 0] },
    gender_other: { type: 'string', value: '' },
    disease: { type: 'number', is_array: 1, options: ['ไม่มี', 'เบาหวาน', 'ความดัน'], value: [0, 0, 0] },
    medicine: { type: 'string', value: '' },
    education: { type: 'number', is_array: 1, options: ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'], value: [1, 0, 0] },
    thesis: { type: 'string', value: '' },
    contact: { type: 'number', value: 0 },
    phone: { type: 'string', value: '' },
    call_time: { type: 'string', value: '' },
  },
}
