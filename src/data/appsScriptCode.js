export const APPS_SCRIPT_CODE = `/**
 * ===================================================================
 * كود جوجل شيت - سيستم متابعة مصاريف شقة الكوثر
 * (Google Apps Script Code - Code.gs)
 * مع ميزة الاسترجاع والتراجع التلقائي بنقرة واحدة (Undo / Restore):
 * أي حذف أو تعديل يمكن إرجاعه بوضع علامة صح ✅ في خانة "استرجاع التعديل"
 * أو من القائمة العلوية: "🏠 سيستم شقة الكوثر -> ↩️ استرجاع الحركة المحددة"
 * ===================================================================
 * 
 * طريقة التركيب أو التحديث في دقيقتين:
 * 1. افتح شيت جوجل الخاص بك من المتصفح.
 * 2. من القائمة العلوية اضغط: Extensions (الإضافات) -> Apps Script
 * 3. امسح أي كود قديم في المحرر وضع هذا الكود بالكامل بدلاً منه.
 * 4. اضغط أيقونة الحفظ 💾 (أو Ctrl + S).
 * 5. اضغط على الزر الأزرق بالأعلى: Deploy -> Manage deployments (إدارة عمليات النشر).
 * 6. اضغط على أيقونة القلم ✏️ (تعديل) بجانب النسخة الحالية، واختر New version (نسخة جديدة) واضغط Deploy.
 * ===================================================================
 */

// أسماء الشيتات المعتمدة داخل ملف جوجل شيت
const SHEETS = {
  EXPENSES: 'المصروفات',
  CAPITAL: 'إيداعات رأس المال',
  BEDS: 'تفاصيل السراير والمستأجرين',
  BILLS: 'الفواتير الشهرية',
  PARTNERS: 'الشركاء ورأس المال',
  LOGS: 'سجل التعديلات والعمليات',
  RENT_DISTRIBUTION: 'تصفية وتوزيع الإيجار'
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
        activityLogs: getActivityLogsData(ss),
        monthlyRentSettlements: getRentDistributionData(ss)
      };
      return jsonResponse({ success: true, data: data });
    }

    return jsonResponse({ success: false, error: 'Unknown GET action: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// ==========================================
// 2. التعامل مع طلبات POST (تعديل، إضافة، حذف، مزامنة)
// ==========================================
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const item = requestData.payload;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    ensureAllSheetsExist(ss);

    // 1. مزامنة كل البيانات دفعة واحدة (Initial Push or Full Sync)
    if (action === 'syncAllData') {
      if (item.partners) savePartnersData(ss, item.partners);
      if (item.capitalDeposits) saveCapitalDepositsData(ss, item.capitalDeposits);
      if (item.expenses) saveExpensesData(ss, item.expenses);
      if (item.beds) saveBedsData(ss, item.beds);
      if (item.monthlyBills) saveMonthlyBillsData(ss, item.monthlyBills);
      if (item.monthlyRentSettlements) saveAllRentSettlements(ss, item.monthlyRentSettlements);

      logAudit(
        ss,
        'مزامنة شاملة',
        'النظام',
        'تم رفع وتحديث كامل بيانات السيستم في شيت جوجل بنجاح',
        '-',
        'مزامنة كل الجداول',
        item._clientDate,
        item._clientTime,
        null
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
        item.clientTime,
        null
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

      const restorePayload = {
        type: 'DELETE_ROW',
        sheetName: SHEETS.EXPENSES,
        id: item.id,
        description: 'حذف المصروف المضاف: ' + (item.item || '')
      };

      logAudit(
        ss,
        'إضافة مصروف',
        'المصروفات',
        'إضافة مصروف جديد: ' + (item.item || '') + ' (القائم بالدفع: ' + (item.paidBy || 'غير محدد') + ')',
        item.amount,
        item.notes || '',
        item._clientDate,
        item._clientTime,
        restorePayload
      );

      return jsonResponse({ success: true, message: 'Expense added' });
    }

    if (action === 'updateExpense') {
      const expensesSheet = ss.getSheetByName(SHEETS.EXPENSES);
      const oldRow = getRowValuesById(expensesSheet, item.id);

      updateRowById(expensesSheet, item.id, [
        item.id,
        item.date || '',
        item.item || '',
        Number(item.amount || 0),
        item.paidBy || '',
        item.notes || ''
      ]);

      let restorePayload = null;
      if (oldRow) {
        restorePayload = {
          type: 'UPDATE_ROW',
          sheetName: SHEETS.EXPENSES,
          id: item.id,
          rowValues: oldRow,
          description: 'استرجاع بيانات المصروف السابقة: ' + (oldRow[2] || item.item || '')
        };
      }

      logAudit(
        ss,
        'تعديل مصروف',
        'المصروفات',
        'تعديل بيانات المصروف #' + item.id + ': ' + (item.item || '') + ' (القائم بالدفع: ' + (item.paidBy || 'غير محدد') + ')',
        item.amount,
        item.notes || '',
        item._clientDate,
        item._clientTime,
        restorePayload
      );

      return jsonResponse({ success: true, message: 'Expense updated' });
    }

    if (action === 'deleteExpense') {
      const expensesSheet = ss.getSheetByName(SHEETS.EXPENSES);
      const oldRow = getRowValuesById(expensesSheet, item.id) || [
        item.id,
        item.date || '',
        item.item || '',
        Number(item.amount || 0),
        item.paidBy || '',
        item.notes || ''
      ];

      deleteRowById(expensesSheet, item.id);

      const restorePayload = {
        type: 'RESTORE_ROW',
        sheetName: SHEETS.EXPENSES,
        rowValues: oldRow,
        description: 'إعادة المصروف المحذوف: ' + (oldRow[2] || item.item || '') + ' بمبلغ ' + (oldRow[3] || item.amount || 0) + ' ج.م'
      };

      logAudit(
        ss,
        'حذف مصروف',
        'المصروفات',
        'حذف المصروف #' + item.id + (item.item ? ' (' + item.item + ')' : ''),
        item.amount || (oldRow ? oldRow[3] : '-'),
        item.notes || '',
        item._clientDate,
        item._clientTime,
        restorePayload
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

      const restorePayload = {
        type: 'DELETE_ROW',
        sheetName: SHEETS.CAPITAL,
        id: item.id,
        description: 'حذف إيداع رأس المال المضاف للشريك: ' + (item.partner || '')
      };

      logAudit(
        ss,
        'إضافة إيداع',
        'إيداعات رأس المال',
        'إيداع رأس مال جديد للشريك: ' + (item.partner || ''),
        item.amount,
        item.date ? ('تاريخ الإيداع: ' + item.date) : '',
        item._clientDate,
        item._clientTime,
        restorePayload
      );

      return jsonResponse({ success: true, message: 'Capital deposit added' });
    }

    if (action === 'updateCapitalDeposit') {
      const capSheet = ss.getSheetByName(SHEETS.CAPITAL);
      const oldRow = getRowValuesById(capSheet, item.id);

      updateRowById(capSheet, item.id, [
        item.id,
        item.partner || '',
        Number(item.amount || 0),
        item.date || ''
      ]);

      let restorePayload = null;
      if (oldRow) {
        restorePayload = {
          type: 'UPDATE_ROW',
          sheetName: SHEETS.CAPITAL,
          id: item.id,
          rowValues: oldRow,
          description: 'استرجاع إيداع رأس المال السابق للشريك: ' + (oldRow[1] || '')
        };
      }

      logAudit(
        ss,
        'تعديل إيداع',
        'إيداعات رأس المال',
        'تعديل إيداع رأس مال #' + item.id + ' للشريك: ' + (item.partner || ''),
        item.amount,
        item.date ? ('تاريخ الإيداع: ' + item.date) : '',
        item._clientDate,
        item._clientTime,
        restorePayload
      );

      return jsonResponse({ success: true, message: 'Capital deposit updated' });
    }

    if (action === 'deleteCapitalDeposit') {
      const capSheet = ss.getSheetByName(SHEETS.CAPITAL);
      const oldRow = getRowValuesById(capSheet, item.id) || [
        item.id,
        item.partner || '',
        Number(item.amount || 0),
        item.date || ''
      ];

      deleteRowById(capSheet, item.id);

      const restorePayload = {
        type: 'RESTORE_ROW',
        sheetName: SHEETS.CAPITAL,
        rowValues: oldRow,
        description: 'إعادة إيداع رأس المال المحذوف للشريك: ' + (oldRow[1] || item.partner || '')
      };

      logAudit(
        ss,
        'حذف إيداع',
        'إيداعات رأس المال',
        'حذف إيداع رأس مال #' + item.id + (item.partner ? ' للشريك: ' + item.partner : ''),
        item.amount || (oldRow ? oldRow[2] : '-'),
        '',
        item._clientDate,
        item._clientTime,
        restorePayload
      );

      return jsonResponse({ success: true, message: 'Capital deposit deleted' });
    }

    // 5. السراير والمستأجرين
    if (action === 'updateBed') {
      const sheet = ss.getSheetByName(SHEETS.BEDS);
      const oldRow = getRowValuesById(sheet, item.id);

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

      let restorePayload = null;
      if (oldRow) {
        restorePayload = {
          type: 'UPDATE_ROW',
          sheetName: SHEETS.BEDS,
          id: item.id,
          rowValues: oldRow,
          description: 'استرجاع بيانات ' + (oldRow[2] || '') + ' سرير ' + (oldRow[3] || '') + ' السابقة'
        };
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
        item._clientTime,
        restorePayload
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

      const restorePayload = {
        type: 'DELETE_ROW',
        sheetName: SHEETS.BEDS,
        id: item.id,
        description: 'حذف السرير المضاف: ' + (item.roomName || '') + ' - سرير ' + (item.bedNumber || '')
      };

      logAudit(
        ss,
        'إضافة سرير',
        'السراير والمستأجرين',
        'إضافة سرير جديد: ' + (item.roomName || '') + ' - سرير ' + (item.bedNumber || '') + ' (' + (item.month || '') + ')',
        item.monthlyPrice,
        'المستأجر: ' + (item.tenantName || 'شاغر'),
        item._clientDate,
        item._clientTime,
        restorePayload
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
          item[0] && item[0]._clientTime,
          null
        );
      }
      return jsonResponse({ success: true, message: 'Beds batch updated' });
    }

    // 6. الفواتير الشهرية
    if (action === 'updateMonthlyBill') {
      const sheet = ss.getSheetByName(SHEETS.BILLS);
      const oldRow = getRowValuesById(sheet, item.id);

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

      let restorePayload = null;
      if (oldRow) {
        restorePayload = {
          type: 'UPDATE_ROW',
          sheetName: SHEETS.BILLS,
          id: item.id,
          rowValues: oldRow,
          description: 'استرجاع فواتير شهر ' + (oldRow[1] || item.month || '') + ' السابقة'
        };
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
        item._clientTime,
        restorePayload
      );

      return jsonResponse({ success: true, message: 'Monthly bill updated' });
    }

    // 7. تصفية وتوزيع إيجار الشهر على الشركاء
    if (action === 'updateRentSettlement') {
      saveRentSettlementRow(ss, item);

      const actionDetails = item._customDetails || ('تحديث تصفية إيجار شهر ' + (item.month || '') + ': إيرادات ' + (item.collectedRent || 0) + ' ج.م - صافي ' + (item.netProfit || 0) + ' ج.م');
      const actionType = item._customActionType || 'تصفية إيجار';

      logAudit(
        ss,
        actionType,
        'تصفية وتوزيع الإيجار',
        actionDetails,
        item._customAmount !== undefined ? item._customAmount : (item.netProfit || '-'),
        item.notes || '',
        item._clientDate,
        item._clientTime,
        null
      );

      return jsonResponse({ success: true, message: 'Rent settlement updated' });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// ==========================================
// 3. دالة كتابة الحركات في صفحة "سجل التعديلات والعمليات"
// ==========================================
function logAudit(ss, actionType, section, details, amount, notes, clientDate, clientTime, restorePayload) {
  try {
    const sheet = ss.getSheetByName(SHEETS.LOGS);
    if (!sheet) return;

    const now = new Date();
    const timeZone = Session.getScriptTimeZone() || 'Africa/Cairo';

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

    const payloadJson = restorePayload ? JSON.stringify(restorePayload) : '';

    const rowValues = [
      nextId,
      dateVal,
      timeVal,
      actionType || '',
      section || '',
      details || '',
      parsedAmount,
      notes || '',
      restorePayload ? false : '—',
      payloadJson
    ];

    sheet.appendRow(rowValues);

    const newRowNum = sheet.getLastRow();
    const range = sheet.getRange(newRowNum, 1, 1, 10);
    range.setFontFamily('Cairo');
    range.setFontSize(10);
    range.setVerticalAlignment('middle');

    // تلوين خفيف لخلفية الصف بناء على نوع الحركة
    if (actionType && actionType.indexOf('حذف') !== -1) {
      range.setBackground('#fff1f2'); // Rose light
    } else if (actionType && (actionType.indexOf('إضافة') !== -1 || actionType.indexOf('استرجاع') !== -1)) {
      range.setBackground('#f0fdf4'); // Emerald light
    } else if (actionType && (actionType.indexOf('تسديد') !== -1 || actionType.indexOf('إيداع') !== -1)) {
      range.setBackground('#ecfeff'); // Cyan light
    }

    // محاذاة الأعمدة
    sheet.getRange(newRowNum, 1, 1, 5).setHorizontalAlignment('center');
    sheet.getRange(newRowNum, 6).setHorizontalAlignment('right');
    sheet.getRange(newRowNum, 7).setHorizontalAlignment('center');
    sheet.getRange(newRowNum, 8).setHorizontalAlignment('right');

    // إعداد خانة الاسترجاع والتراجع (Column 9)
    const undoCell = sheet.getRange(newRowNum, 9);
    undoCell.setHorizontalAlignment('center');
    if (restorePayload) {
      try {
        undoCell.setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
        undoCell.setValue(false);
        undoCell.setNote('ضع علامة صح ✅ هنا للتراجع عن هذه الحركة واسترجاع البيانات كما كانت قبل التعديل أو الحذف');
      } catch (e) {}
    }

  } catch (err) {
    console.error('Audit Log Error: ' + err.toString());
  }
}

// ==========================================
// 4. محرك الاسترجاع والتراجع الآلي (Undo & Restore Engine)
// ==========================================

/**
 * دالة المشغل التلقائي عند قيام المستخدم بالتعديل في شيت جوجل
 * بمجرد وضع علامة صح في العمود التاسع لصفحة السجل، تنفذ الاسترجاع فوراً
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (!sheet || sheet.getName() !== SHEETS.LOGS) return;

    const col = e.range.getColumn();
    const row = e.range.getRow();
    if (row <= 1 || col !== 9) return; // العمود 9 هو "استرجاع التعديل"

    const val = e.range.getValue();
    if (val === true || String(val).toUpperCase() === 'TRUE') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      executeRestoreAction(ss, sheet, row);
    }
  } catch (err) {
    Logger.log('onEdit error: ' + err.toString());
  }
}

/**
 * القائمة العلوية المخصصة في شيت جوجل لتسهيل الاسترجاع اليدوي
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🏠 سيستم شقة الكوثر')
      .addItem('↩️ استرجاع الحركة المحددة (تراجع)', 'undoSelectedRowMenu')
      .addSeparator()
      .addItem('📊 تهيئة وتنسيق الجداول وتفعيل أزرار الاسترجاع', 'formatAllSheetsMenu')
      .addToUi();
  } catch (e) {}
}

function undoSelectedRowMenu() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  if (sheet.getName() !== SHEETS.LOGS) {
    SpreadsheetApp.getUi().alert('يرجى أولاً الانتقال إلى صفحة "سجل التعديلات والعمليات" وتحديد الصف المراد استرجاعه.');
    return;
  }
  const row = sheet.getActiveCell().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert('يرجى تحديد صف يحتوي على حركة مسجلة (وليس صف العناوين).');
    return;
  }
  executeRestoreAction(ss, sheet, row);
}

function formatAllSheetsMenu() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureAllSheetsExist(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast('تم تحديث وتنسيق الجداول وتفعيل أعمدة الاسترجاع بنجاح!', 'سيستم الشقة', 4);
}

/**
 * تنفيذ عملية استرجاع البيانات لصف معين
 */
function executeRestoreAction(ss, sheetLogs, rowIdx) {
  try {
    const payloadCell = sheetLogs.getRange(rowIdx, 10);
    const payloadRaw = payloadCell.getValue();
    if (!payloadRaw) {
      SpreadsheetApp.getActiveSpreadsheet().toast('⚠️ لا توجد بيانات استرجاع مسجلة لهذه الحركة أو تم استرجاعها مسبقاً.', 'تنبيه', 5);
      return false;
    }

    let payload;
    try {
      payload = typeof payloadRaw === 'string' ? JSON.parse(payloadRaw) : payloadRaw;
    } catch (err) {
      SpreadsheetApp.getActiveSpreadsheet().toast('⚠️ تعذر قراءة بيانات الاسترجاع.', 'خطأ', 4);
      return false;
    }

    const targetSheet = ss.getSheetByName(payload.sheetName);
    if (!targetSheet) {
      SpreadsheetApp.getActiveSpreadsheet().toast('⚠️ لم يتم العثور على الشيت: ' + payload.sheetName, 'خطأ', 4);
      return false;
    }

    let success = false;
    if (payload.type === 'RESTORE_ROW') {
      // إعادة الصف المحذوف بالكامل
      targetSheet.appendRow(payload.rowValues);
      success = true;
    } else if (payload.type === 'UPDATE_ROW') {
      // إعادة القيم السابقة قبل التعديل
      success = updateRowById(targetSheet, payload.id, payload.rowValues);
      if (!success) {
        // إذا كان الصف غير موجود، نقوم بإضافته
        targetSheet.appendRow(payload.rowValues);
        success = true;
      }
    } else if (payload.type === 'DELETE_ROW') {
      // التراجع عن الإضافة بحذف الصف الذي أضيف
      success = deleteRowById(targetSheet, payload.id);
    }

    if (success) {
      // تحديث خانة الاسترجاع في شيت السجل
      const actionCell = sheetLogs.getRange(rowIdx, 9);
      actionCell.clearDataValidations();
      actionCell.setValue('تم الاسترجاع ↩️');
      actionCell.setBackground('#dcfce7'); // Light green
      actionCell.setFontColor('#15803d'); // Dark green
      actionCell.setFontWeight('bold');
      actionCell.setNote('');

      // مسح الـ payload حتى لا يتكرر الاسترجاع
      payloadCell.setValue('');

      const desc = payload.description || 'الحركة';

      // تسجيل حركة الاسترجاع في السجل
      const now = new Date();
      const timeZone = Session.getScriptTimeZone() || 'Africa/Cairo';
      const dateVal = Utilities.formatDate(now, timeZone, 'yyyy-MM-dd');
      const timeVal = Utilities.formatDate(now, timeZone, 'hh:mm:ss a');

      logAudit(
        ss,
        '↩️ استرجاع يدوي',
        payload.sheetName,
        'تم استرجاع: ' + desc + ' بنجاح عبر شيت جوجل',
        '-',
        'تم التراجع عن العملية بواسطة المستخدم',
        dateVal,
        timeVal,
        null
      );

      SpreadsheetApp.getActiveSpreadsheet().toast('✅ ' + desc + ' - تم الاسترجاع بنجاح!', 'سيستم الشقة', 6);
      return true;
    }

    return false;
  } catch (e) {
    Logger.log('Restore error: ' + e.toString());
    SpreadsheetApp.getActiveSpreadsheet().toast('حدث خطأ أثناء الاسترجاع: ' + e.toString(), 'خطأ', 5);
    return false;
  }
}

// ==========================================
// 5. دوال قراءة البيانات من الشيتات
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
      notes: String(r[7] || ''),
      undoStatus: String(r[8] || ''),
      canUndo: Boolean(r[9])
    });
    if (list.length >= 150) break;
  }
  return list;
}

// ==========================================
// 6. دوال كتابة وحفظ البيانات في الشيتات
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

function saveRentSettlementRow(ss, item) {
  const sheet = ss.getSheetByName(SHEETS.RENT_DISTRIBUTION);
  if (!sheet) return;
  const month = item.month || '';
  if (!month) return;

  const rowValues = [
    month,
    Number(item.collectedRent || 0),
    Number(item.ownerRent || 0),
    item.ownerRentPaid ? 'تم السداد ✓' : 'لم يسدد',
    Number(item.buildingExpenses || 0),
    item.buildingExpensesPaid ? 'تم السداد ✓' : 'لم يسدد',
    Number(item.netProfit || 0),
    Number(item.sharePerPartner || 0),
    (item.receivedPartners && item.receivedPartners['محمد']) ? 'تم الاستلام ✓' : 'لم يستلم',
    (item.receivedPartners && item.receivedPartners['ايمن']) ? 'تم الاستلام ✓' : 'لم يستلم',
    (item.receivedPartners && item.receivedPartners['احمد']) ? 'تم الاستلام ✓' : 'لم يستلم',
    Number(item.remainingRentPool || 0),
    (item._clientDate || '') + ' ' + (item._clientTime || '')
  ];

  const rows = sheet.getDataRange().getValues();
  let foundRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(month).trim()) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

function saveAllRentSettlements(ss, settlementsMap) {
  const sheet = ss.getSheetByName(SHEETS.RENT_DISTRIBUTION);
  if (!sheet) return;
  sheet.clearContents();
  const headers = [
    'الشهر',
    'إيرادات السراير (ج.م)',
    'إيجار المالك (ج.م)',
    'سداد إيجار المالك',
    'مصاريف العمارة (ج.م)',
    'سداد مصاريف العمارة',
    'صافي الإيراد للتوزيع (ج.م)',
    'نصيب كل شريك (ج.م)',
    'محمد (استلام الأرباح)',
    'ايمن (استلام الأرباح)',
    'احمد (استلام الأرباح)',
    'المتبقي في الإيرادات (ج.م)',
    'آخر تحديث'
  ];
  const rows = [headers];
  if (settlementsMap && typeof settlementsMap === 'object') {
    Object.keys(settlementsMap).forEach(month => {
      const s = settlementsMap[month] || {};
      rows.push([
        month,
        Number(s.collectedRent || 0),
        Number(s.ownerRent || 0),
        s.ownerRentPaid ? 'تم السداد ✓' : 'لم يسدد',
        Number(s.buildingExpenses || 0),
        s.buildingExpensesPaid ? 'تم السداد ✓' : 'لم يسدد',
        Number(s.netProfit || 0),
        Number(s.sharePerPartner || 0),
        (s.receivedPartners && s.receivedPartners['محمد']) ? 'تم الاستلام ✓' : 'لم يستلم',
        (s.receivedPartners && s.receivedPartners['ايمن']) ? 'تم الاستلام ✓' : 'لم يستلم',
        (s.receivedPartners && s.receivedPartners['احمد']) ? 'تم الاستلام ✓' : 'لم يستلم',
        Number(s.remainingRentPool || 0),
        s.lastUpdated || ''
      ]);
    });
  }
  if (rows.length > 1) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  formatHeaderRow(sheet);
}

function getRentDistributionData(ss) {
  const sheet = ss.getSheetByName(SHEETS.RENT_DISTRIBUTION);
  if (!sheet) return {};
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return {};

  const result = {};
  for (let i = 1; i < rows.length; i++) {
    const month = String(rows[i][0]).trim();
    if (month) {
      result[month] = {
        month: month,
        collectedRent: Number(rows[i][1] || 0),
        ownerRent: Number(rows[i][2] || 0),
        ownerRentPaid: String(rows[i][3]).includes('مسدد') || String(rows[i][3]).includes('✓'),
        buildingExpenses: Number(rows[i][4] || 0),
        buildingExpensesPaid: String(rows[i][5]).includes('مسدد') || String(rows[i][5]).includes('✓'),
        netProfit: Number(rows[i][6] || 0),
        sharePerPartner: Number(rows[i][7] || 0),
        receivedPartners: {
          'محمد': String(rows[i][8]).includes('الاستلام') || String(rows[i][8]).includes('✓'),
          'ايمن': String(rows[i][9]).includes('الاستلام') || String(rows[i][9]).includes('✓'),
          'احمد': String(rows[i][10]).includes('الاستلام') || String(rows[i][10]).includes('✓')
        },
        remainingRentPool: Number(rows[i][11] || 0),
        lastUpdated: rows[i][12] || ''
      };
    }
  }
  return result;
}

// ==========================================
// 7. دوال مساعدة لإنشاء وتنسيق الشيتات
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
      name: SHEETS.RENT_DISTRIBUTION,
      headers: [
        'الشهر',
        'إيرادات السراير (ج.م)',
        'إيجار المالك (ج.م)',
        'سداد إيجار المالك',
        'مصاريف العمارة (ج.م)',
        'سداد مصاريف العمارة',
        'صافي الإيراد للتوزيع (ج.م)',
        'نصيب كل شريك (ج.م)',
        'محمد (استلام الأرباح)',
        'ايمن (استلام الأرباح)',
        'احمد (استلام الأرباح)',
        'المتبقي في الإيرادات (ج.م)',
        'آخر تحديث'
      ]
    },
    {
      name: SHEETS.LOGS,
      headers: [
        'م', 'التاريخ', 'الساعة والوقت', 'نوع العملية', 'القسم',
        'تفاصيل الحركة والتعديل', 'المبلغ / القيمة (ج.م)', 'ملاحظات وبيان',
        'استرجاع التعديل ↩️', 'بيانات الاسترجاع'
      ]
    }
  ];

  configs.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.setRightToLeft(true);
      sheet.getRange(1, 1, 1, cfg.headers.length).setValues([cfg.headers]);
      formatHeaderRow(sheet);
    } else if (cfg.name === SHEETS.LOGS) {
      // تحديث عناوين شيت السجل إن كانت بدون خانة الاسترجاع
      try {
        const lastCol = sheet.getLastColumn();
        if (lastCol < 9) {
          sheet.getRange(1, 1, 1, cfg.headers.length).setValues([cfg.headers]);
          formatHeaderRow(sheet);
        }
      } catch (e) {}
    }

    // ضبط عرض أعمدة تصفية وتوزيع الإيجار
    if (cfg.name === SHEETS.RENT_DISTRIBUTION && sheet) {
      try {
        sheet.setColumnWidth(1, 110);
        sheet.setColumnWidth(2, 130);
        sheet.setColumnWidth(3, 120);
        sheet.setColumnWidth(4, 130);
        sheet.setColumnWidth(5, 130);
        sheet.setColumnWidth(6, 140);
        sheet.setColumnWidth(7, 140);
        sheet.setColumnWidth(8, 130);
        sheet.setColumnWidth(9, 130);
        sheet.setColumnWidth(10, 130);
        sheet.setColumnWidth(11, 130);
        sheet.setColumnWidth(12, 150);
        sheet.setColumnWidth(13, 140);
      } catch (e) {}
    }

    // ضبط عرض أعمدة سجل التعديلات
    if (cfg.name === SHEETS.LOGS && sheet) {
      try {
        sheet.setColumnWidth(1, 50);
        sheet.setColumnWidth(2, 105);
        sheet.setColumnWidth(3, 110);
        sheet.setColumnWidth(4, 130);
        sheet.setColumnWidth(5, 140);
        sheet.setColumnWidth(6, 360);
        sheet.setColumnWidth(7, 120);
        sheet.setColumnWidth(8, 220);
        sheet.setColumnWidth(9, 140); // عمود استرجاع التعديل
        sheet.setColumnWidth(10, 20); // عمود البيانات
        sheet.hideColumns(10); // إخفاء عمود الـ JSON ليظل المظهر مرتباً
      } catch (e) {}
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

function getRowValuesById(sheet, id) {
  if (!sheet) return null;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      return rows[i];
    }
  }
  return null;
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
