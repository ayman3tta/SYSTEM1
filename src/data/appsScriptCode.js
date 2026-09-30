export const APPS_SCRIPT_CODE = `/**
 * ===================================================================
 * كود جوجل شيت - سيستم متابعة مصاريف شقة الكوثر
 * (Google Apps Script Code - Code.gs)
 * مع تسجيل تلقائي لجميع التعديلات والإضافات والحذف في صفحة منفصلة:
 * "سجل التعديلات والعمليات" بالتاريخ والوقت والبيان
 * ===================================================================
 * 
 * طريقة التركيب أو التحديث في 3 دقائق:
 * 1. افتح شيت جوجل الخاص بك من المتصفح.
 * 2. من القائمة العلوية اضغط: Extensions (الإضافات) -> Apps Script
 * 3. امسح أي كود موجود في المحرر وضع هذا الكود بالكامل بدلاً منه.
 * 4. اضغط أيقونة الحفظ 💾 (أو Ctrl + S).
 * 5. اضغط على الزر الأزرق بالأعلى: Deploy -> Manage deployments (إدارة عمليات النشر).
 * 6. اضغط على أيقونة القلم ✏️ (تعديل) بجانب النسخة الحالية، واختر New version (نسخة جديدة) واضغط Deploy.
 *    (أو Deploy -> New deployment إذا كنت تنشر لأول مرة).
 * ===================================================================
 */

// أسماء الشيتات المعتمدة داخل ملف جوجل شيت
const SHEETS = {
  EXPENSES: 'المصروفات',
  CAPITAL: 'إيداعات رأس المال',
  BEDS: 'تفاصيل السراير والمستأجرين',
  BILLS: 'الفواتير الشهرية',
  PARTNERS: 'الشركاء ورأس المال',
  LOGS: 'سجل التعديلات والعمليات' // صفحة منفصلة لتسجيل التعديلات والإضافات والحذف
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

    if (action === 'getActivityLogs') {
      return jsonResponse({
        success: true,
        data: getActivityLogsData(ss)
      });
    }

    if (action === 'getAllData') {
      const data = {
        partners: getPartnersData(ss),
        capitalDeposits: getCapitalDepositsData(ss),
        expenses: getExpensesData(ss),
        beds: getBedsData(ss),
        monthlyBills: getMonthlyBillsData(ss),
        activityLogs: getActivityLogsData(ss)
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
    const item = payload.payload || {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureAllSheetsExist(ss);

    // 1. مزامنة كل البيانات دفعة واحدة (Initial Push or Full Sync)
    if (action === 'syncAllData') {
      if (item.partners) savePartnersData(ss, item.partners);
      if (item.capitalDeposits) saveCapitalDepositsData(ss, item.capitalDeposits);
      if (item.expenses) saveExpensesData(ss, item.expenses);
      if (item.beds) saveBedsData(ss, item.beds);
      if (item.monthlyBills) saveMonthlyBillsData(ss, item.monthlyBills);

      // تسجيل حركة المزامنة في سجل التعديلات
      logAudit(
        ss,
        'مزامنة شاملة',
        'النظام',
        'تم رفع وتحديث كامل بيانات السيستم في شيت جوجل بنجاح',
        '-',
        'مزامنة كل الجداول',
        item._clientDate,
        item._clientTime
      );

      return jsonResponse({
        success: true,
        message: 'تمت مزامنة جميع البيانات بنجاح إلى جوجل شيت!'
      });
    }

    // 2. تسجيل حركة مخصصة في سجل التعديلات
    if (action === 'logActivity') {
      logAudit(
        ss,
        item.actionType || 'تعديل',
        item.section || 'عام',
        item.details || '',
        item.amount || '-',
        item.notes || '',
        item.clientDate,
        item.clientTime
      );
      return jsonResponse({ success: true, message: 'Activity logged' });
    }

    // 3. المصروفات
    if (action === 'addExpense') {
      appendRowToSheet(ss.getSheetByName(SHEETS.EXPENSES), [
        item.id,
        item.date || '',
        item.item || '',
        Number(item.amount || 0),
        item.paidBy || '',
        item.notes || ''
      ]);

      logAudit(
        ss,
        'إضافة مصروف',
        'المصروفات',
        'إضافة مصروف جديد: ' + (item.item || '') + ' (القائم بالدفع: ' + (item.paidBy || 'غير محدد') + ')',
        item.amount,
        item.notes || '',
        item._clientDate,
        item._clientTime
      );

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

      logAudit(
        ss,
        'تعديل مصروف',
        'المصروفات',
        'تعديل بيانات المصروف #' + item.id + ': ' + (item.item || '') + ' (القائم بالدفع: ' + (item.paidBy || 'غير محدد') + ')',
        item.amount,
        item.notes || '',
        item._clientDate,
        item._clientTime
      );

      return jsonResponse({ success: true, message: 'Expense updated' });
    }

    if (action === 'deleteExpense') {
      deleteRowById(ss.getSheetByName(SHEETS.EXPENSES), item.id);

      logAudit(
        ss,
        'حذف مصروف',
        'المصروفات',
        'حذف المصروف #' + item.id + (item.item ? ' (' + item.item + ')' : ''),
        item.amount || '-',
        item.notes || '',
        item._clientDate,
        item._clientTime
      );

      return jsonResponse({ success: true, message: 'Expense deleted' });
    }

    // 4. إيداعات رأس المال
    if (action === 'addCapitalDeposit') {
      appendRowToSheet(ss.getSheetByName(SHEETS.CAPITAL), [
        item.id,
        item.partner || '',
        Number(item.amount || 0),
        item.date || ''
      ]);

      logAudit(
        ss,
        'إضافة إيداع',
        'إيداعات رأس المال',
        'إيداع رأس مال جديد للشريك: ' + (item.partner || ''),
        item.amount,
        item.date ? ('تاريخ الإيداع: ' + item.date) : '',
        item._clientDate,
        item._clientTime
      );

      return jsonResponse({ success: true, message: 'Capital deposit added' });
    }

    if (action === 'updateCapitalDeposit') {
      updateRowById(ss.getSheetByName(SHEETS.CAPITAL), item.id, [
        item.id,
        item.partner || '',
        Number(item.amount || 0),
        item.date || ''
      ]);

      logAudit(
        ss,
        'تعديل إيداع',
        'إيداعات رأس المال',
        'تعديل إيداع رأس مال #' + item.id + ' للشريك: ' + (item.partner || ''),
        item.amount,
        item.date ? ('تاريخ الإيداع: ' + item.date) : '',
        item._clientDate,
        item._clientTime
      );

      return jsonResponse({ success: true, message: 'Capital deposit updated' });
    }

    if (action === 'deleteCapitalDeposit') {
      deleteRowById(ss.getSheetByName(SHEETS.CAPITAL), item.id);

      logAudit(
        ss,
        'حذف إيداع',
        'إيداعات رأس المال',
        'حذف إيداع رأس مال #' + item.id + (item.partner ? ' للشريك: ' + item.partner : ''),
        item.amount || '-',
        '',
        item._clientDate,
        item._clientTime
      );

      return jsonResponse({ success: true, message: 'Capital deposit deleted' });
    }

    // 5. السراير والمستأجرين
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

      const defaultBedDetails = 'تحديث بيانات ' + (item.roomName || '') + ' - سرير ' + (item.bedNumber || '') +
        ' (' + (item.month || '') + ') - المستأجر: ' + (item.tenantName || 'شاغر') +
        ' - الحالة: ' + (item.status || '') + ' - المدفوع: ' + (item.rentPaid || 0) + ' ج.م';

      logAudit(
        ss,
        item._customActionType || 'تعديل سرير / مستأجر',
        'السراير والمستأجرين',
        item._customDetails || defaultBedDetails,
        item._customAmount !== undefined ? item._customAmount : (item.rentPaid || item.monthlyPrice || '-'),
        item.notes || '',
        item._clientDate,
        item._clientTime
      );

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

      logAudit(
        ss,
        'إضافة سرير',
        'السراير والمستأجرين',
        'إضافة سرير جديد: ' + (item.roomName || '') + ' - سرير ' + (item.bedNumber || '') + ' (' + (item.month || '') + ')',
        item.monthlyPrice,
        'المستأجر: ' + (item.tenantName || 'شاغر'),
        item._clientDate,
        item._clientTime
      );

      return jsonResponse({ success: true, message: 'Bed added' });
    }

    if (action === 'batchUpdateBeds') {
      if (Array.isArray(item)) {
        saveBedsData(ss, item);
        const targetMonth = (item[0] && item[0].month) ? item[0].month : '';
        logAudit(
          ss,
          'ترحيل / تحديث شهري',
          'السراير والمستأجرين',
          'بدء وترحيل شهر جديد: ' + targetMonth + ' مع ترحيل المستأجرين (إجمالي ' + item.length + ' سرير)',
          '-',
          'ترحيل شهري تلقائي',
          item[0] && item[0]._clientDate,
          item[0] && item[0]._clientTime
        );
      }
      return jsonResponse({ success: true, message: 'Beds batch updated' });
    }

    // 6. الفواتير الشهرية
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

      const totalBills = Number(item.electricity || 0) + Number(item.water || 0) + Number(item.gas || 0) + Number(item.internet || 0);
      const billDetails = 'تعديل فواتير شهر ' + (item.month || '') + ': كهرباء (' + (item.electricity || 0) + ')' +
        ' | مياه (' + (item.water || 0) + ')' +
        ' | غاز (' + (item.gas || 0) + ')' +
        ' | نت (' + (item.internet || 0) + ') ج.م';

      logAudit(
        ss,
        'تعديل فواتير شهرية',
        'الفواتير الشهرية',
        billDetails,
        totalBills,
        item.notes || '',
        item._clientDate,
        item._clientTime
      );

      return jsonResponse({ success: true, message: 'Monthly bill updated' });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// ==========================================
// 3. دالة كتابة الحركات في صفحة "سجل التعديلات والعمليات"
// ==========================================
function logAudit(ss, actionType, section, details, amount, notes, clientDate, clientTime) {
  try {
    const sheet = ss.getSheetByName(SHEETS.LOGS);
    if (!sheet) return;

    const now = new Date();
    const timeZone = Session.getScriptTimeZone() || 'Africa/Cairo';

    // استخدام تاريخ ووقت العميل إن توفر، وإلا وقت الخادم
    const dateVal = clientDate || Utilities.formatDate(now, timeZone, 'yyyy-MM-dd');
    const timeVal = clientTime || Utilities.formatDate(now, timeZone, 'hh:mm:ss a');

    const lastRow = sheet.getLastRow();
    let nextId = 1;
    if (lastRow > 1) {
      const prevVal = Number(sheet.getRange(lastRow, 1).getValue());
      nextId = (!isNaN(prevVal) && prevVal > 0) ? (prevVal + 1) : (lastRow);
    }

    let parsedAmount = '-';
    if (amount !== undefined && amount !== null && amount !== '' && amount !== '-') {
      const num = Number(amount);
      parsedAmount = isNaN(num) ? String(amount) : num;
    }

    const rowValues = [
      nextId,
      dateVal,
      timeVal,
      actionType || '',
      section || '',
      details || '',
      parsedAmount,
      notes || ''
    ];

    sheet.appendRow(rowValues);

    // تنسيق الصف المضاف
    const newRowNum = sheet.getLastRow();
    const range = sheet.getRange(newRowNum, 1, 1, rowValues.length);
    range.setFontFamily('Cairo');
    range.setFontSize(10);
    range.setVerticalAlignment('middle');

    // تلوين خفيف لخلفية الصف بناء على نوع الحركة
    if (actionType && actionType.indexOf('حذف') !== -1) {
      range.setBackground('#fff1f2'); // Rose light
    } else if (actionType && actionType.indexOf('إضافة') !== -1) {
      range.setBackground('#f0fdf4'); // Emerald light
    } else if (actionType && (actionType.indexOf('تسديد') !== -1 || actionType.indexOf('إيداع') !== -1)) {
      range.setBackground('#ecfeff'); // Cyan light
    }

    // محاذاة الأعمدة
    sheet.getRange(newRowNum, 1, 1, 5).setHorizontalAlignment('center');
    sheet.getRange(newRowNum, 6).setHorizontalAlignment('right');
    sheet.getRange(newRowNum, 7).setHorizontalAlignment('center');
    sheet.getRange(newRowNum, 8).setHorizontalAlignment('right');

  } catch (err) {
    console.error('Audit Log Error: ' + err.toString());
  }
}

// ==========================================
// 4. دوال قراءة البيانات من الشيتات
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
    if (!r[0] && !r[1]) continue;
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
    if (!r[0] && !r[2]) continue;
    list.push({
      id: Number(r[0]) || i,
      month: String(r[1] || 'سبتمبر 2026').trim(),
      roomName: String(r[2] || '').trim(),
      bedNumber: String(r[3] || '').trim(),
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
    if (!r[1] && !r[0]) continue;
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
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return [
      { partner: 'محمد', initialCapital: 60000 },
      { partner: 'ايمن', initialCapital: 60000 },
      { partner: 'احمد', initialCapital: 60000 }
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

function getActivityLogsData(ss) {
  const sheet = ss.getSheetByName(SHEETS.LOGS);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const list = [];
  // قراءة آخر 150 حركة بالترتيب من الأحدث للأقدم
  for (let i = rows.length - 1; i >= 1; i--) {
    const r = rows[i];
    if (!r[1] && !r[3] && !r[5]) continue;
    list.push({
      id: r[0],
      date: formatCellValue(r[1]),
      time: String(r[2] || ''),
      actionType: String(r[3] || ''),
      section: String(r[4] || ''),
      details: String(r[5] || ''),
      amount: r[6],
      notes: String(r[7] || '')
    });
    if (list.length >= 150) break;
  }
  return list;
}

// ==========================================
// 5. دوال كتابة وحفظ البيانات في الشيتات
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
// 6. دوال مساعدة لإنشاء وتنسيق الشيتات
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
    { name: SHEETS.PARTNERS, headers: ['الشريك', 'رأس المال المبدئي'] },
    {
      name: SHEETS.LOGS,
      headers: ['م', 'التاريخ', 'الساعة والوقت', 'نوع العملية', 'القسم', 'تفاصيل الحركة والتعديل', 'المبلغ / القيمة (ج.م)', 'ملاحظات وبيان']
    }
  ];

  configs.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.setRightToLeft(true);
      sheet.getRange(1, 1, 1, cfg.headers.length).setValues([cfg.headers]);
      formatHeaderRow(sheet);

      // ضبط عرض أعمدة سجل التعديلات
      if (cfg.name === SHEETS.LOGS) {
        try {
          sheet.setColumnWidth(1, 50);
          sheet.setColumnWidth(2, 105);
          sheet.setColumnWidth(3, 110);
          sheet.setColumnWidth(4, 130);
          sheet.setColumnWidth(5, 140);
          sheet.setColumnWidth(6, 360);
          sheet.setColumnWidth(7, 120);
          sheet.setColumnWidth(8, 220);
        } catch (e) {}
      }
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
    range.setFontFamily('Cairo');
    range.setFontSize(10);
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
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
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Africa/Cairo', 'yyyy-MM-dd');
  }
  return String(val).trim();
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
