require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const SpecialtyTemplate = require('../models/SpecialtyTemplate');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital';

const doctors = [
  { doctor_code: 'DR001', full_name: 'Dr. Tien', specialty: 'Cardiology', clinic_code: 'CL002', phone: '0901000001', status: 'active' },
  { doctor_code: 'DR002', full_name: 'Dr. Tran Thu Ha', specialty: 'Dental', clinic_code: 'CL003', phone: '0901000002', status: 'active' },
  { doctor_code: 'DR003', full_name: 'Dr. Le Quang Huy', specialty: 'General Medicine', clinic_code: 'CL001', phone: '0901000003', status: 'active' },
  { doctor_code: 'DR004', full_name: 'Dr. Pham Bao Chau', specialty: 'Respiratory', clinic_code: 'CL001', phone: '0901000004', status: 'active' }
];

const clinics = [
  { clinic_code: 'CL001', clinic_name: 'Central General Clinic', address: '123 Nguyen Trai, Ha Noi', phone: '0241111111', status: 'active' },
  { clinic_code: 'CL002', clinic_name: 'Heart Care Center', address: '45 Tran Phu, Ha Noi', phone: '0242222222', status: 'active' },
  { clinic_code: 'CL003', clinic_name: 'Dental Health Clinic', address: '78 Le Loi, Ha Noi', phone: '0243333333', status: 'active' }
];

const specialtyTemplates = [
  {
    specialty_code: 'CARD', specialty_name: 'Cardiology',
    fields: [
      { field_name: 'nhip_tim', label: 'Nhịp tim', type: 'number', required: true },
      { field_name: 'huyet_ap', label: 'Huyết áp', type: 'string', required: true },
      { field_name: 'ecg_result', label: 'ECG Result', type: 'string', required: false }
    ]
  },
  {
    specialty_code: 'DENT', specialty_name: 'Dental',
    fields: [
      { field_name: 'rang_so', label: 'Răng số', type: 'string', required: true },
      { field_name: 'loai_can_thiep', label: 'Loại can thiệp', type: 'string', required: true },
      { field_name: 'muc_do_sau_rang', label: 'Mức độ sâu răng', type: 'string', required: false }
    ]
  },
  {
    specialty_code: 'GEN', specialty_name: 'General Medicine',
    fields: [
      { field_name: 'nhiet_do', label: 'Nhiệt độ', type: 'number', required: false },
      { field_name: 'can_nang', label: 'Cân nặng', type: 'number', required: false },
      { field_name: 'chieu_cao', label: 'Chiều cao', type: 'number', required: false }
    ]
  },
  {
    specialty_code: 'RESP', specialty_name: 'Respiratory',
    fields: [
      { field_name: 'spo2', label: 'SpO2', type: 'number', required: false },
      { field_name: 'nhip_tho', label: 'Nhịp thở', type: 'number', required: false },
      { field_name: 'ket_qua_xquang', label: 'Kết quả X-quang', type: 'string', required: false }
    ]
  }
];

const patients = [
  {
    patient_code: 'P001', full_name: 'Phung Thanh Do', dob: new Date('2001-03-15'),
    gender: 'male', phone: '0912345671', address: 'Ha Noi', clinic_code: 'CL001',
    last_visit_date: new Date('2026-04-08'), last_specialty: 'General Medicine',
    visits: [{
      visit_id: 'V001', visit_date: new Date('2026-04-08'),
      specialty_code: 'GEN', specialty_name: 'General Medicine',
      doctor_code: 'DR003', clinic_code: 'CL001',
      trieu_chung: 'Sốt nhẹ, đau đầu, mệt mỏi',
      chan_doan: 'Cảm cúm thông thường',
      ghi_chu_bac_si: 'Khuyên nghỉ ngơi, uống nhiều nước và theo dõi thêm 2 ngày.',
      specialty_data: { nhiet_do: 37.8, can_nang: 60, chieu_cao: 170 },
      custom_metrics: [{ name: 'SpO2', value: 98, unit: '%' }],
      prescriptions: [{ medicine_name: 'Paracetamol', dosage: '500mg', frequency: '2 times/day', duration: '3 days' }]
    }]
  },
  {
    patient_code: 'P002', full_name: 'Nguyen Van Hello', dob: new Date('1998-07-21'),
    gender: 'female', phone: '0912345672', address: 'Hai Phong', clinic_code: 'CL002',
    last_visit_date: new Date('2026-04-09'), last_specialty: 'Cardiology',
    visits: [{
      visit_id: 'V002', visit_date: new Date('2026-04-09'),
      specialty_code: 'CARD', specialty_name: 'Cardiology',
      doctor_code: 'DR001', clinic_code: 'CL002',
      trieu_chung: 'Hồi hộp, khó thở nhẹ khi leo cầu thang',
      chan_doan: 'Nghi tăng huyết áp',
      ghi_chu_bac_si: 'Cần theo dõi huyết áp tại nhà trong 1 tuần.',
      specialty_data: { nhip_tim: 96, huyet_ap: '145/95', ecg_result: 'Nhịp xoang, chưa thấy bất thường rõ' },
      custom_metrics: [{ name: 'SpO2', value: 97, unit: '%' }],
      prescriptions: [{ medicine_name: 'Amlodipine', dosage: '5mg', frequency: '1 time/day', duration: '7 days' }]
    }]
  },
  {
    patient_code: 'P003', full_name: 'Nguyen Xuan Kiet', dob: new Date('2003-11-02'),
    gender: 'male', phone: '0912345673', address: 'Bac Ninh', clinic_code: 'CL003',
    last_visit_date: new Date('2026-04-07'), last_specialty: 'Dental',
    visits: [{
      visit_id: 'V003', visit_date: new Date('2026-04-07'),
      specialty_code: 'DENT', specialty_name: 'Dental',
      doctor_code: 'DR002', clinic_code: 'CL003',
      trieu_chung: 'Đau răng hàm dưới bên trái, ê buốt khi uống lạnh',
      chan_doan: 'Sâu răng',
      ghi_chu_bac_si: 'Khuyến nghị trám răng sớm để tránh viêm tủy.',
      specialty_data: { rang_so: '36', loai_can_thiep: 'Trám răng', muc_do_sau_rang: 'Trung bình' },
      custom_metrics: [{ name: 'Pain Score', value: 6, unit: '/10' }],
      prescriptions: [{ medicine_name: 'Ibuprofen', dosage: '400mg', frequency: '2 times/day', duration: '2 days' }]
    }]
  },
  {
    patient_code: 'P004', full_name: 'Pham Thu Trang', dob: new Date('1995-12-10'),
    gender: 'female', phone: '0912345674', address: 'Ha Nam', clinic_code: 'CL001',
    last_visit_date: new Date('2026-04-10'), last_specialty: 'Respiratory',
    visits: [{
      visit_id: 'V004', visit_date: new Date('2026-04-10'),
      specialty_code: 'RESP', specialty_name: 'Respiratory',
      doctor_code: 'DR004', clinic_code: 'CL001',
      trieu_chung: 'Ho kéo dài, đau họng, khó thở nhẹ',
      chan_doan: 'Viêm đường hô hấp trên',
      ghi_chu_bac_si: 'Theo dõi thêm nếu sốt cao hoặc khó thở tăng lên.',
      specialty_data: { spo2: 96, nhip_tho: 22, ket_qua_xquang: 'Chưa phát hiện tổn thương phổi' },
      custom_metrics: [{ name: 'Temperature', value: 38.1, unit: 'C' }],
      prescriptions: [{ medicine_name: 'Acetylcysteine', dosage: '200mg', frequency: '3 times/day', duration: '5 days' }]
    }]
  },
  {
    patient_code: 'P005', full_name: 'Vu Quoc Huy', dob: new Date('1989-05-29'),
    gender: 'male', phone: '0912345675', address: 'Nam Dinh', clinic_code: 'CL002',
    last_visit_date: new Date('2026-04-13'), last_specialty: 'Cardiology',
    visits: [
      {
        visit_id: 'V005', visit_date: new Date('2026-04-06'),
        specialty_code: 'CARD', specialty_name: 'Cardiology',
        doctor_code: 'DR001', clinic_code: 'CL002',
        trieu_chung: 'Đau tức ngực thoáng qua, mệt khi vận động mạnh',
        chan_doan: 'Rối loạn nhịp tim nhẹ',
        ghi_chu_bac_si: 'Nên hạn chế cà phê, ngủ đủ giấc và tái khám sau 1 tuần.',
        specialty_data: { nhip_tim: 104, huyet_ap: '130/85', ecg_result: 'Nhịp nhanh xoang' },
        custom_metrics: [{ name: 'SpO2', value: 98, unit: '%' }, { name: 'BMI', value: 24.2, unit: 'kg/m2' }],
        prescriptions: [{ medicine_name: 'Bisoprolol', dosage: '2.5mg', frequency: '1 time/day', duration: '7 days' }]
      },
      {
        visit_id: 'V006', visit_date: new Date('2026-04-13'),
        specialty_code: 'CARD', specialty_name: 'Cardiology',
        doctor_code: 'DR001', clinic_code: 'CL002',
        trieu_chung: 'Khó thở khi gắng sức, hồi hộp, nặng ngực nhẹ, mệt khi đi bộ nhanh',
        chan_doan: 'Nguy cơ tim mạch tăng liên quan đến thừa cân béo phì',
        ghi_chu_bac_si: 'Bệnh nhân thừa cân, BMI cao. Khuyến nghị giảm cân, kiểm soát chế độ ăn, tăng vận động nhẹ và theo dõi tim mạch định kỳ.',
        specialty_data: { nhip_tim: 98, huyet_ap: '138/88', ecg_result: 'Nhịp xoang nhanh, chưa ghi nhận bất thường cấp tính' },
        custom_metrics: [{ name: 'SpO2', value: 98, unit: '%' }, { name: 'BMI', value: 31.4, unit: 'kg/m2' }, { name: 'Weight', value: 96, unit: 'kg' }],
        prescriptions: [{ medicine_name: 'Bisoprolol', dosage: '2.5mg', frequency: '1 time/day', duration: '14 days' }]
      }
    ]
  }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Doctor.deleteMany({});
  await Clinic.deleteMany({});
  await SpecialtyTemplate.deleteMany({});
  await Patient.deleteMany({});
  console.log('Cleared existing data');

  // Seed
  await Doctor.insertMany(doctors);
  console.log('Seeded', doctors.length, 'doctors');

  await Clinic.insertMany(clinics);
  console.log('Seeded', clinics.length, 'clinics');

  await SpecialtyTemplate.insertMany(specialtyTemplates);
  console.log('Seeded', specialtyTemplates.length, 'specialty templates');

  await Patient.insertMany(patients);
  console.log('Seeded', patients.length, 'patients');

  console.log('Done!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
