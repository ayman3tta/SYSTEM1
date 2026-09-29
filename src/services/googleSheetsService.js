// ==========================================
// Google Sheets Service
// src/services/googleSheetsService.js
// ==========================================

const SCRIPT_STORAGE_KEY = 'apartment_google_script_url';
const SHEET_LINK_STORAGE_KEY = 'apartment_google_sheet_link';

/**
 * الحصول على رابط Google Apps Script Web App
 * الأولوية للمحفوظ في المتصفح، ثم المتغير البيئي في Vite
 */
export function getGoogleScriptUrl() {
  const customUrl = localStorage.getItem(SCRIPT_STORAGE_KEY);
  if (customUrl && customUrl.trim()) {
    return customUrl.trim();
  }
  return (import.meta.env.VITE_GOOGLE_SCRIPT_URL || '').trim();
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
  return localStorage.getItem(SHEET_LINK_STORAGE_KEY) || '';
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
 * دالة مساعدة لإرسال البيانات بالـ POST إلى Google Apps Script
 * نستخدم text/plain لتفادي إرسال CORS Preflight OPTIONS من المتصفح
 */
async function postToSheets(action, payload) {
  const url = getGoogleScriptUrl();
  if (!url) {
    console.warn('Google Script URL is not set, skipping remote sync');
    return null;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ action, payload }),
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

// المصروفات
export const addExpenseToSheets = (expense) => postToSheets('addExpense', expense);
export const updateExpenseInSheets = (expense) => postToSheets('updateExpense', expense);
export const deleteExpenseFromSheets = (id) => postToSheets('deleteExpense', { id });

// إيداعات رأس المال
export const addCapitalDepositToSheets = (deposit) => postToSheets('addCapitalDeposit', deposit);
export const updateCapitalDepositInSheets = (deposit) => postToSheets('updateCapitalDeposit', deposit);
export const deleteCapitalDepositFromSheets = (id) => postToSheets('deleteCapitalDeposit', { id });

// السراير والمستأجرين
export const updateBedInSheets = (bed) => postToSheets('updateBed', bed);
export const addBedToSheets = (bed) => postToSheets('addBed', bed);
export const batchUpdateBedsInSheets = (beds) => postToSheets('batchUpdateBeds', beds);

// الفواتير الشهرية
export const updateMonthlyBillInSheets = (bill) => postToSheets('updateMonthlyBill', bill);
