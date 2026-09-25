const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'متابعة مصاريف الشقة.xlsx');
const workbook = XLSX.readFile(filePath, { cellDates: true });

// 1. Sheet: سجل المصروفات
const sheet1 = workbook.Sheets['سجل المصروفات'];
const rows1 = XLSX.utils.sheet_to_json(sheet1, { header: 1, defval: '' });

// Parse Expenses
const expenses = [];
rows1.forEach((row, idx) => {
  if (idx === 0) return; // header
  const id = row[0];
  const dateRaw = row[1];
  const item = row[2];
  const amount = row[3];
  const paidBy = row[4];
  const notes = row[5];

  if (typeof id === 'number' && item && typeof amount === 'number') {
    let dateStr = dateRaw;
    if (dateRaw instanceof Date) {
      dateStr = dateRaw.toISOString().split('T')[0];
    } else if (typeof dateRaw === 'string') {
      dateStr = dateRaw.replace(/\\/g, '/');
    }
    expenses.push({
      id: id,
      date: dateStr || '',
      item: String(item).trim(),
      amount: Number(amount),
      paidBy: String(paidBy).trim(),
      notes: String(notes || '').trim()
    });
  }
});

// Parse Capital Deposits from Cols 7, 8, 9 starting row 14
const capitalDeposits = [];
rows1.slice(13).forEach((row, idx) => {
  const partner = row[7];
  const amount = row[8];
  const dateRaw = row[9];
  if (partner && typeof amount === 'number' && amount > 0) {
    let dateStr = dateRaw;
    if (dateRaw instanceof Date) {
      dateStr = dateRaw.toISOString().split('T')[0];
    } else if (typeof dateRaw === 'string') {
      dateStr = dateRaw.replace(/\\/g, '/');
    }
    capitalDeposits.push({
      id: capitalDeposits.length + 1,
      partner: String(partner).trim(),
      amount: Number(amount),
      date: dateStr || ''
    });
  }
});

// Partners summary
const partnerCapitalSummary = [
  { partner: 'محمد', initialCapital: 26800 },
  { partner: 'ايمن', initialCapital: 27000 },
  { partner: 'احمد', initialCapital: 26850 }
];

// 2. Sheet: الأوض والسراير شهر 9
const sheetBeds = workbook.Sheets['الأوض والسراير شهر 9'];
const rowsBeds = XLSX.utils.sheet_to_json(sheetBeds, { header: 1, defval: '' });

const beds = [];
rowsBeds.slice(5, 14).forEach((row, idx) => {
  const roomName = row[0];
  const bedNum = row[1];
  const monthlyPrice = row[2];
  const status = row[3];
  const tenantName = row[4];
  const startDate = row[5];
  const secReq = row[6];
  const secPaid = row[7];
  const secRem = row[8];
  const rentReq = row[9];
  const rentPaid = row[10];
  const rentRem = row[11];
  const notes = row[12];

  if (roomName && bedNum) {
    beds.push({
      id: beds.length + 1,
      roomName: String(roomName).trim(),
      bedNumber: Number(bedNum),
      monthlyPrice: Number(monthlyPrice || 0),
      status: String(status || 'مؤجر').trim(),
      tenantName: String(tenantName || '').trim(),
      startDate: String(startDate || '').replace(/\\/g, '/'),
      depositRequired: Number(secReq || 0),
      depositPaid: Number(secPaid || 0),
      depositRemaining: Number(secRem || 0),
      rentRequired: Number(rentReq || 0),
      rentPaid: Number(rentPaid || 0),
      rentRemaining: Number(rentRem || 0),
      notes: String(notes || '').trim()
    });
  }
});

// 3. Sheet: الفواتير الشهرية
const sheetBills = workbook.Sheets['الفواتير الشهرية'];
const rowsBills = XLSX.utils.sheet_to_json(sheetBills, { header: 1, defval: '' });

const monthlyBills = [];
rowsBills.slice(4, 16).forEach((row, idx) => {
  const month = row[0];
  if (month) {
    monthlyBills.push({
      id: idx + 1,
      month: String(month).trim(),
      electricity: Number(row[1] || 0),
      water: Number(row[2] || 0),
      gas: Number(row[3] || 0),
      notes: ''
    });
  }
});

const fullData = {
  partners: partnerCapitalSummary,
  capitalDeposits,
  expenses,
  beds,
  monthlyBills
};

fs.writeFileSync('extracted_data.json', JSON.stringify(fullData, null, 2), 'utf8');
console.log('Successfully extracted full data to extracted_data.json');
console.log(`Expenses count: ${expenses.length}`);
console.log(`Capital deposits count: ${capitalDeposits.length}`);
console.log(`Beds count: ${beds.length}`);
console.log(`Bills count: ${monthlyBills.length}`);
