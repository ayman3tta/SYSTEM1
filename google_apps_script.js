/**
 * ===================================================================
 * كود جوجل شيت - سيستم متابعة مصاريف شقة الكوثر
 * (Google Apps Script Code - Code.gs)
 * ===================================================================
 * 
 * طريقة التركيب في 3 دقائق:
 * 1. افتح شيت جوجل جديد من: https://sheets.new
 * 2. سمي الشيت: "متابعة مصاريف الشقة"
 * 3. من القائمة العلوية اضغط: Extensions (الإضافات) -> Apps Script
 * 4. امسح أي كود موجود في المحرر وضع هذا الكود بالكامل بدلاً منه.
 * 5. اضغط على زر النشر الأزرق بالاعلى: Deploy -> New deployment
 * 6. اضغط على الترس بجانب "Select type" واختر: Web app
 * 7. الإعدادات المطلوبة:
 *    - Description: Apartment System API
 *    - Execute as: Me (حسابك)
 *    - Who has access: Anyone (أي شخص)  <-- مهم جداً حتى يقرأ السيستم البيانات بدون تسجيل دخول
 * 8. اضغط Deploy، وافق على الصلاحيات (Authorize access -> Advanced -> Go to Untitled project).
 * 9. انسخ رابط الـ Web App URL وضعه في السيستم (من زر "Google Sheets" في التطبيق).
 * ===================================================================
 */

// أسماء الشيتات المعتمدة
const SHEETS = {
  EXPENSES: 'المصروفات',
  CAPITAL: 'إيداعات رأس المال',
  BEDS: 'تفاصيل السراير والمستأجرين',
  BILLS: 'الفواتير الشهرية',
  PARTNERS: 'الشركاء ورأس المال'
};

// ==========================================
// 1. التعامل مع طلبات GET (جلب البيانات)
// ==========================================
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureAllSheetsExist(ss);

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        message: 'Google Sheets Connected Successfully!',
        sheetName: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getAllData') {
      const data = {
        partners: getPartnersData(ss),
        capitalDeposits: getCapitalDepositsData(ss),
        expenses: getExpensesData(ss),
        beds: getBedsData(ss),
        monthlyBills: getMonthlyBillsData(ss)
      };

      return jsonResponse({
        success: true,
        data: data
      });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// ==========================================
// 2. التعامل مع طلبات POST (إضافة / تعديل / حذف / مزامنة كاملة)
// ==========================================
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'No POST data provided' });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const item = payload.payload;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureAllSheetsExist(ss);

    // مزامنة كل البيانات دفعة واحدة (Initial Push or Full Sync)
    if (action === 'syncAllData') {
      if (item.partners) savePartnersData(ss, item.partners);
      if (item.capitalDeposits) saveCapitalDepositsData(ss, item.capitalDeposits);
      if (item.expenses) saveExpensesData(ss, item.expenses);
      if (item.beds) saveBedsData(ss, item.beds);
      if (item.monthlyBills) saveMonthlyBillsData(ss, item.monthlyBills);

      return jsonResponse({
        success: true,
        message: 'تمت مزامنة جميع البيانات بنجاح إلى جوجل شيت!'
      });
    }

    // المصروفات
    if (action === 'addExpense') {
      appendRowToSheet(ss.getSheetByName(SHEETS.EXPENSES), [
        item.id,
        item.date || '',
        item.item || '',
        Number(item.amount || 0),
        item.paidBy || '',
        item.notes || ''
      ]);
      return jsonResponse({ success: true, message: 'Expense added' });
    }

    if (action === 'updateExpense') {
      updateRowById(ss.getSheetByName(SHEETS.EXPENSES), item.id, [
        item.id,
        item.date || '',
        item.item || '',
        Number(item.amount || 0),
        item.paidBy || '',
        item.notes || ''
      ]);
      return jsonResponse({ success: true, message: 'Expense updated' });
    }

    if (action === 'deleteExpense') {
      deleteRowById(ss.getSheetByName(SHEETS.EXPENSES), item.id);
      return jsonResponse({ success: true, message: 'Expense deleted' });
    }

    // إيداعات رأس المال
    if (action === 'addCapitalDeposit') {
      appendRowToSheet(ss.getSheetByName(SHEETS.CAPITAL), [
        item.id,
        item.partner || '',
        Number(item.amount || 0),
        item.date || ''
      ]);
      return jsonResponse({ success: true, message: 'Capital deposit added' });
    }

    if (action === 'updateCapitalDeposit') {
      updateRowById(ss.getSheetByName(SHEETS.CAPITAL), item.id, [
        item.id,
        item.partner || '',
        Number(item.amount || 0),
        item.date || ''
      ]);
      return jsonResponse({ success: true, message: 'Capital deposit updated' });
    }

    if (action === 'deleteCapitalDeposit') {
      deleteRowById(ss.getSheetByName(SHEETS.CAPITAL), item.id);
      return jsonResponse({ success: true, message: 'Capital deposit deleted' });
    }

    // السراير والمستأجرين
    if (action === 'updateBed') {
      const sheet = ss.getSheetByName(SHEETS.BEDS);
      const rowValues = [
        item.id,
        item.month || '',
        item.roomName || '',
        item.bedNumber || '',
        Number(item.monthlyPrice || 0),
        item.status || '',
        item.tenantName || '',
        item.startDate || '',
        Number(item.depositRequired || 0),
        Number(item.depositPaid || 0),
        Number(item.depositRemaining || 0),
        Number(item.rentRequired || 0),
        Number(item.rentPaid || 0),
        Number(item.rentRemaining || 0),
        item.notes || ''
      ];
      const updated = updateRowById(sheet, item.id, rowValues);
      if (!updated) {
        appendRowToSheet(sheet, rowValues);
      }
      return jsonResponse({ success: true, message: 'Bed updated' });
    }

    if (action === 'addBed') {
      appendRowToSheet(ss.getSheetByName(SHEETS.BEDS), [
        item.id,
        item.month || '',
        item.roomName || '',
        item.bedNumber || '',
        Number(item.monthlyPrice || 0),
        item.status || '',
        item.tenantName || '',
        item.startDate || '',
        Number(item.depositRequired || 0),
        Number(item.depositPaid || 0),
        Number(item.depositRemaining || 0),
        Number(item.rentRequired || 0),
        Number(item.rentPaid || 0),
        Number(item.rentRemaining || 0),
        item.notes || ''
      ]);
      return jsonResponse({ success: true, message: 'Bed added' });
    }

    if (action === 'batchUpdateBeds') {
      if (Array.isArray(item)) {
        saveBedsData(ss, item);
      }
      return jsonResponse({ success: true, message: 'Beds batch updated' });
    }

    // الفواتير الشهرية
    if (action === 'updateMonthlyBill') {
      const sheet = ss.getSheetByName(SHEETS.BILLS);
      const rowValues = [
        item.id,
        item.month || '',
        Number(item.electricity || 0),
        Number(item.water || 0),
        Number(item.gas || 0),
        Number(item.internet || 0),
        item.notes || ''
      ];
      const updated = updateRowById(sheet, item.id, rowValues);
      if (!updated) {
        appendRowToSheet(sheet, rowValues);
      }
      return jsonResponse({ success: true, message: 'Monthly bill updated' });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// ==========================================
// 3. دوال قراءة البيانات من الشيتات
// ==========================================
function getExpensesData(ss) {
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[2]) continue;
    list.push({
      id: Number(r[0]) || i,
      date: formatCellValue(r[1]),
      item: String(r[2] || '').trim(),
      amount: Number(r[3] || 0),
      paidBy: String(r[4] || '').trim(),
      notes: String(r[5] || '').trim()
    });
  }
  return list;
}

function getCapitalDepositsData(ss) {
  const sheet = ss.getSheetByName(SHEETS.CAPITAL);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1] && !r[2]) continue;
    list.push({
      id: Number(r[0]) || i,
      partner: String(r[1] || '').trim(),
      amount: Number(r[2] || 0),
      date: formatCellValue(r[3])
    });
  }
  return list;
}

function getBedsData(ss) {
  const sheet = ss.getSheetByName(SHEETS.BEDS);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[2] && !r[3]) continue;
    list.push({
      id: Number(r[0]) || i,
      month: String(r[1] || 'سبتمبر 2026').trim(),
      roomName: String(r[2] || '').trim(),
      bedNumber: Number(r[3] || 0),
      monthlyPrice: Number(r[4] || 0),
      status: String(r[5] || 'شاغر').trim(),
      tenantName: String(r[6] || '').trim(),
      startDate: formatCellValue(r[7]),
      depositRequired: Number(r[8] || 0),
      depositPaid: Number(r[9] || 0),
      depositRemaining: Number(r[10] || 0),
      rentRequired: Number(r[11] || 0),
      rentPaid: Number(r[12] || 0),
      rentRemaining: Number(r[13] || 0),
      notes: String(r[14] || '').trim()
    });
  }
  return list;
}

function getMonthlyBillsData(ss) {
  const sheet = ss.getSheetByName(SHEETS.BILLS);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[1]) continue;
    list.push({
      id: Number(r[0]) || i,
      month: String(r[1] || '').trim(),
      electricity: Number(r[2] || 0),
      water: Number(r[3] || 0),
      gas: Number(r[4] || 0),
      internet: Number(r[5] || 0),
      notes: String(r[6] || '').trim()
    });
  }
  return list;
}

function getPartnersData(ss) {
  const sheet = ss.getSheetByName(SHEETS.PARTNERS);
  if (!sheet) {
    return [
      { partner: 'محمد', initialCapital: 26800 },
      { partner: 'ايمن', initialCapital: 27000 },
      { partner: 'احمد', initialCapital: 26850 }
    ];
  }
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return [
      { partner: 'محمد', initialCapital: 26800 },
      { partner: 'ايمن', initialCapital: 27000 },
      { partner: 'احمد', initialCapital: 26850 }
    ];
  }

  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    list.push({
      partner: String(r[0]).trim(),
      initialCapital: Number(r[1] || 0)
    });
  }
  return list;
}

// ==========================================
// 4. دوال كتابة وحفظ البيانات في الشيتات
// ==========================================
function saveExpensesData(ss, expenses) {
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  sheet.clearContents();
  const headers = ['م', 'التاريخ', 'البند', 'المبلغ (ج.م)', 'مين قام بالدفع', 'ملاحظات'];
  const rows = [headers];
  expenses.forEach(e => {
    rows.push([
      e.id,
      e.date || '',
      e.item || '',
      Number(e.amount || 0),
      e.paidBy || '',
      e.notes || ''
    ]);
  });
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet);
}

function saveCapitalDepositsData(ss, deposits) {
  const sheet = ss.getSheetByName(SHEETS.CAPITAL);
  sheet.clearContents();
  const headers = ['م', 'الشريك', 'مبلغ الإيداع (ج.م)', 'التاريخ'];
  const rows = [headers];
  deposits.forEach(d => {
    rows.push([
      d.id,
      d.partner || '',
      Number(d.amount || 0),
      d.date || ''
    ]);
  });
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet);
}

function saveBedsData(ss, beds) {
  const sheet = ss.getSheetByName(SHEETS.BEDS);
  sheet.clearContents();
  const headers = [
    'م', 'الشهر', 'الغرفة', 'رقم السرير', 'السعر الشهري',
    'الحالة', 'اسم المستأجر', 'تاريخ البداية', 'تأمين مطلوب', 'تأمين مدفوع',
    'تأمين متبقي', 'إيجار مطلوب', 'إيجار مدفوع', 'إيجار متبقي', 'ملاحظات'
  ];
  const rows = [headers];
  beds.forEach(b => {
    rows.push([
      b.id,
      b.month || '',
      b.roomName || '',
      b.bedNumber || '',
      Number(b.monthlyPrice || 0),
      b.status || '',
      b.tenantName || '',
      b.startDate || '',
      Number(b.depositRequired || 0),
      Number(b.depositPaid || 0),
      Number(b.depositRemaining || 0),
      Number(b.rentRequired || 0),
      Number(b.rentPaid || 0),
      Number(b.rentRemaining || 0),
      b.notes || ''
    ]);
  });
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet);
}

function saveMonthlyBillsData(ss, bills) {
  const sheet = ss.getSheetByName(SHEETS.BILLS);
  sheet.clearContents();
  const headers = ['م', 'الشهر', 'كهرباء', 'مياه', 'غاز', 'نت', 'ملاحظات'];
  const rows = [headers];
  bills.forEach(b => {
    rows.push([
      b.id,
      b.month || '',
      Number(b.electricity || 0),
      Number(b.water || 0),
      Number(b.gas || 0),
      Number(b.internet || 0),
      b.notes || ''
    ]);
  });
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet);
}

function savePartnersData(ss, partners) {
  const sheet = ss.getSheetByName(SHEETS.PARTNERS);
  sheet.clearContents();
  const headers = ['الشريك', 'رأس المال المبدئي'];
  const rows = [headers];
  partners.forEach(p => {
    rows.push([
      p.partner || '',
      Number(p.initialCapital || 0)
    ]);
  });
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  formatHeaderRow(sheet);
}

// ==========================================
// 5. دوال مساعدة لإنشاء وتنسيق الشيتات
// ==========================================
function ensureAllSheetsExist(ss) {
  const configs = [
    { name: SHEETS.EXPENSES, headers: ['م', 'التاريخ', 'البند', 'المبلغ (ج.م)', 'مين قام بالدفع', 'ملاحظات'] },
    { name: SHEETS.CAPITAL, headers: ['م', 'الشريك', 'مبلغ الإيداع (ج.م)', 'التاريخ'] },
    {
      name: SHEETS.BEDS,
      headers: [
        'م', 'الشهر', 'الغرفة', 'رقم السرير', 'السعر الشهري',
        'الحالة', 'اسم المستأجر', 'تاريخ البداية', 'تأمين مطلوب', 'تأمين مدفوع',
        'تأمين متبقي', 'إيجار مطلوب', 'إيجار مدفوع', 'إيجار متبقي', 'ملاحظات'
      ]
    },
    { name: SHEETS.BILLS, headers: ['م', 'الشهر', 'كهرباء', 'مياه', 'غاز', 'نت', 'ملاحظات'] },
    { name: SHEETS.PARTNERS, headers: ['الشريك', 'رأس المال المبدئي'] }
  ];

  configs.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.setRightToLeft(true);
      sheet.getRange(1, 1, 1, cfg.headers.length).setValues([cfg.headers]);
      formatHeaderRow(sheet);
    }
  });

  // إذا وجد Sheet1 الافتراضي وكان فارغاً، نحذفه
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('ورقة 1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

function formatHeaderRow(sheet) {
  try {
    const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    range.setBackground('#1e293b');
    range.setFontColor('#ffffff');
    range.setFontWeight('bold');
    range.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.setRightToLeft(true);
  } catch (e) {}
}

function appendRowToSheet(sheet, values) {
  sheet.appendRow(values);
}

function updateRowById(sheet, id, values) {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, values.length).setValues([values]);
      return true;
    }
  }
  return false;
}

function deleteRowById(sheet, id) {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function formatCellValue(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'GMT+3', 'yyyy-MM-dd');
  }
  return String(val).trim();
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
