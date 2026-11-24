# Form Builder - ระบบสร้างฟอร์มแบบ Drag & Drop

## คุณสมบัติหลัก

### 1. 🎨 ออกแบบฟอร์ม (Design Mode)
- **Control Palette** - แสดงรายการ controls ทั้งหมดที่สามารถลากมาใช้ได้
  - ช่องกรอกข้อมูล: textbox, textarea, number, date, time, datetime, date_range
  - ตัวเลือก: dropdown, option, checkbox_group, switch, rating, matrix
  - อื่นๆ: label, button

- **Grid Canvas** - พื้นที่ออกแบบฟอร์มแบบ Grid Layout
  - ลาก control จาก palette มาวางในช่อง grid
  - กำหนด key (databinding) และชื่อฟิลด์หลังจากลาก
  - เพิ่ม/ลด แถวและคอลัมน์ได้
  - คลิกเพื่อเลือก control และแก้ไขคุณสมบัติ
  - ลบ control ได้

- **Property Panel** - แก้ไขคุณสมบัติของ control ที่เลือก
  - ชื่อฟิลด์, placeholder, ข้อความ
  - การตรวจสอบ: required, min/max length, format
  - ตัวเลือก: เพิ่ม/ลบ/แก้ไข options
  - สถานะ: disabled, readonly

### 2. 👁️ ดูตัวอย่าง (Preview Mode)
- แสดงฟอร์มที่สร้างแบบเต็มรูปแบบ
- ทดสอบการกรอกข้อมูล
- ดูข้อมูลที่กรอกแบบ real-time

### 3. 💾 บันทึกและ Export
- บันทึกฟอร์มที่สร้าง
- Export เป็น JSON file

## วิธีใช้งาน

### การเพิ่ม Control ลงฟอร์ม

1. เลือก control ที่ต้องการจาก **Control Palette** ทางซ้าย
2. ลาก control ไปวางในช่อง grid ที่ต้องการ
3. กรอก **Key** (ชื่อตัวแปรสำหรับเก็บข้อมูล) และ **ชื่อฟิลด์**
4. คลิก "เพิ่มลงฟอร์ม"

### การแก้ไข Control

1. คลิกที่ control ในฟอร์ม
2. แก้ไขคุณสมบัติใน **Property Panel** ทางขวา
3. การเปลี่ยนแปลงจะมีผลทันที

### การลบ Control

1. คลิกที่ปุ่ม 🗑️ บน control ที่ต้องการลบ
2. ยืนยันการลบ

### การเพิ่มแถว/คอลัมน์

- คลิกปุ่ม "+ เพิ่มแถว" หรือ "+ เพิ่มคอลัมน์" ที่ด้านบนของ canvas

## โครงสร้างไฟล์

```
builder/
├── FormBuilderEditor.tsx    # Component หลัก
├── builder.css              # Styles
├── components/
│   ├── ControlPalette.tsx   # รายการ controls
│   ├── GridCanvas.tsx       # พื้นที่ออกแบบ
│   ├── KeyInputModal.tsx    # Modal กำหนด key
│   └── PropertyPanel.tsx    # แก้ไขคุณสมบัติ
└── README.md               # เอกสารนี้
```

## ตัวอย่าง JSON ที่ Export

```json
{
  "form": {
    "controls": [
      {
        "id": "main_grid",
        "type": "grid",
        "columns": 2,
        "rows": 3,
        "controls": [
          {
            "id": "textbox_1234567890",
            "type": "textbox",
            "colno": 0,
            "rowno": 0,
            "label": "ชื่อ-นามสกุล",
            "databinding": "full_name",
            "required": true,
            "value": ""
          }
        ]
      }
    ]
  },
  "data": {
    "full_name": {
      "type": "string",
      "value": ""
    }
  }
}
```

## หมายเหตุ

- Key (databinding) ต้องเป็นตัวอักษร a-z, A-Z, 0-9, _ เท่านั้น
- Key ต้องไม่ซ้ำกัน
- ระบบจะสร้าง data structure อัตโนมัติตาม control type
- date_range จะสร้าง 2 keys: `{key}_from` และ `{key}_to`
- matrix จะสร้าง key แยกสำหรับแต่ละคำถาม
