const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'متابعة مصاريف الشقة.xlsx');
const workbook = XLSX.readFile(filePath, { cellFormulas: true, cellDates: true });

console.log('--- SHEET NAMES ---');
console.log(workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log('\n========================================');
  console.log(`SHEET: ${sheetName}`);
  console.log('========================================');
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  rows.forEach((row, i) => {
    if (row.some(cell => cell !== null && cell !== '')) {
      console.log(`Row ${i + 1}:`, JSON.stringify(row));
    }
  });
});
