// ==========================================
// Google Sheets Service
// src/services/googleSheetsService.js
// ==========================================

const SCRIPT_STORAGE_KEY = 'apartment_google_script_url';
const SHEET_LINK_STORAGE_KEY = 'apartment_google_sheet_link';

/**
 * دالة مساعدة لاستخراج التاريخ والوقت المحليين للعميل
 */
export function getClientDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const period = hours >= 12 ? 'م' : 'ص';
  const hours12 = hours % 12 || 12;
  const timeStr = `${String(hours12).padStart(2, '0')}:${minutes}:${seconds} ${period}`;

  return { clientDate: dateStr, clientTime: timeStr };
}

/**
 * الحصول على رابط Google Apps Script Web App
 * الأولوية للمحفوظ في المتصفح، ثم المتغير البيئي في Vite
 */
export function getGoogleScriptUrl() {
  const customUrl = localStorage.getItem(SCRIPT_STORAGE_KEY);
  if (customUrl && customUrl.trim()) {
    return customUrl.trim();
  }
  return (import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzCP0ee1K-W_oydCBVjKI9_mLGlWx_zq20xv2yLQpU4Pwue9fFt46NgKV0DT8rIP8ku7w/exec').trim();
}

/**
 * حفظ رابط الـ Script في المتصفح
 */
export function setGoogleScriptUrl(url) {
  if (url) {
    localStorage.setItem(SCRIPT_STORAGE_KEY, url.trim());
  } else {
    localStorage.removeItem(SCRIPT_STORAGE_KEY);
  }
}

/**
 * الحصول على رابط شيت جوجل المباشر للمشاهدة
 */
export function getGoogleSheetLink() {
  return localStorage.getItem(SHEET_LINK_STORAGE_KEY) || 'https://docs.google.com/spreadsheets/d/1QuwOnHcZe9VrBeeQfjYEjrd58ki-1-SsjIZLs75T0tk/edit';
}

/**
 * حفظ رابط شيت جوجل المباشر للمشاهدة
 */
export function setGoogleSheetLink(url) {
  if (url) {
    localStorage.setItem(SHEET_LINK_STORAGE_KEY, url.trim());
  } else {
    localStorage.removeItem(SHEET_LINK_STORAGE_KEY);
  }
}

/**
 * هل تم ربط جوجل شيت؟
 */
export function isSheetsConfigured() {
  return Boolean(getGoogleScriptUrl());
}

/**
 * اختبار الاتصال بـ Google Apps Script
 */
export async function testConnection() {
  const url = getGoogleScriptUrl();
  if (!url) {
    throw new Error('لم يتم تعيين رابط Google Apps Script بعد');
  }

  const separator = url.includes('?') ? '&' : '?';
  const response = await fetch(`${url}${separator}action=ping`, {
    method: 'GET',
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`خطأ في استجابة الخادم: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'فشل الاتصال بجوجل شيت');
  }

  return result;
}

/**
 * جلب جميع البيانات من جوجل شيت
 */
export async function fetchAllDataFromSheets() {
  const url = getGoogleScriptUrl();
  if (!url) {
    throw new Error('GOOGLE_SCRIPT_URL is not set');
  }

  const separator = url.includes('?') ? '&' : '?';
  const response = await fetch(`${url}${separator}action=getAllData`, {
    method: 'GET',
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`خطأ HTTP: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'فشل جلب البيانات من Google Sheets');
  }

  return result.data;
}

/**
 * جلب سجل التعديلات والعمليات فقط
 */
export async function fetchActivityLogsFromSheets() {
  const url = getGoogleScriptUrl();
  if (!url) return [];

  const separator = url.includes('?') ? '&' : '?';
  const response = await fetch(`${url}${separator}action=getActivityLogs`, {
    method: 'GET',
    redirect: 'follow'
  });

  if (!response.ok) return [];
  const result = await response.json();
  return result.success ? (result.data || []) : [];
}

/**
 * دالة مساعدة لإرسال البيانات بالـ POST إلى Google Apps Script
 * نستخدم text/plain لتفادي إرسال CORS Preflight OPTIONS من المتصفح
 */
async function postToSheets(action, payload) {
  const url = getGoogleScriptUrl();
  if (!url) {
    console.warn('Google Script URL is not set, skipping remote sync');
    return null;
  }

  // إضافة التاريخ والوقت تلقائياً للحركة
  const { clientDate, clientTime } = getClientDateTime();
  let preparedPayload = payload;

  if (Array.isArray(payload)) {
    preparedPayload = payload.map(p => typeof p === 'object' && p !== null ? { _clientDate: clientDate, _clientTime: clientTime, ...p } : p);
  } else if (typeof payload === 'object' && payload !== null) {
    preparedPayload = {
      _clientDate: clientDate,
      _clientTime: clientTime,
      ...payload
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ action, payload: preparedPayload }),
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || `Action ${action} failed`);
    }

    return result;
  } catch (error) {
    console.error(`Error in postToSheets (${action}):`, error);
    throw error;
  }
}

/**
 * مزامنة كاملة لجميع البيانات (رفع كل البيانات لشيت جوجل)
 */
export const syncAllDataToSheets = (fullData) => postToSheets('syncAllData', fullData);

/**
 * تسجيل حركة مخصصة في سجل التعديلات
 */
export const logActivityToSheets = (activity) => postToSheets('logActivity', activity);

// المصروفات
export const addExpenseToSheets = (expense) => postToSheets('addExpense', expense);
export const updateExpenseInSheets = (expense) => postToSheets('updateExpense', expense);
export const deleteExpenseFromSheets = (expenseData) => {
  const payload = typeof expenseData === 'object' && expenseData !== null ? expenseData : { id: expenseData };
  return postToSheets('deleteExpense', payload);
};

// إيداعات رأس المال
export const addCapitalDepositToSheets = (deposit) => postToSheets('addCapitalDeposit', deposit);
export const updateCapitalDepositInSheets = (deposit) => postToSheets('updateCapitalDeposit', deposit);
export const deleteCapitalDepositFromSheets = (depositData) => {
  const payload = typeof depositData === 'object' && depositData !== null ? depositData : { id: depositData };
  return postToSheets('deleteCapitalDeposit', payload);
};

// السراير والمستأجرين
export const updateBedInSheets = (bed) => postToSheets('updateBed', bed);
export const addBedToSheets = (bed) => postToSheets('addBed', bed);
export const batchUpdateBedsInSheets = (beds) => postToSheets('batchUpdateBeds', beds);

// الفواتير الشهرية
export const updateMonthlyBillInSheets = (bill) => postToSheets('updateMonthlyBill', bill);

// تصفية وتوزيع إيجار الشهر
export const updateRentSettlementInSheets = (settlement) => postToSheets('updateRentSettlement', settlement);

