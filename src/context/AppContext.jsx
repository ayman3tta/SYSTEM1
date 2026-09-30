import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialData } from '../data/initialData';
import * as XLSX from 'xlsx';
import {
  isSheetsConfigured,
  fetchAllDataFromSheets,
  fetchActivityLogsFromSheets,
  syncAllDataToSheets,
  addExpenseToSheets,
  updateExpenseInSheets,
  deleteExpenseFromSheets,
  addCapitalDepositToSheets,
  updateCapitalDepositInSheets,
  deleteCapitalDepositFromSheets,
  updateBedInSheets,
  addBedToSheets,
  batchUpdateBedsInSheets,
  updateMonthlyBillInSheets,
  logActivityToSheets,
  getClientDateTime,
  setGoogleScriptUrl,
  setGoogleSheetLink
} from '../services/googleSheetsService';

const AppContext = createContext();

export const availableMonthsList = [
  'سبتمبر 2026',
  'أكتوبر 2026',
  'نوفمبر 2026',
  'ديسمبر 2026',
  'يناير 2027',
  'فبراير 2027',
  'مارس 2027',
  'أبريل 2027',
  'مايو 2027',
  'يونيو 2027',
  'يوليو 2027',
  'أغسطس 2027'
];

export const AppProvider = ({ children }) => {
  // Load state from LocalStorage or initialData
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('apartment_management_data_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.beds) {
          parsed.beds = parsed.beds.map(b => ({ ...b, month: b.month || 'سبتمبر 2026' }));
        }
        if (parsed.monthlyBills) {
          parsed.monthlyBills = parsed.monthlyBills.map(b => ({
            ...b,
            electricity: Number(b.electricity || 0),
            internet: Number(b.internet || 0),
            water: Number(b.water || 0),
            gas: Number(b.gas || 0)
          }));
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse local storage data', e);
      }
    }
    const init = { ...initialData };
    init.beds = init.beds.map(b => ({ ...b, month: b.month || 'سبتمبر 2026' }));
    if (init.monthlyBills) {
      init.monthlyBills = init.monthlyBills.map(b => ({
        ...b,
        electricity: Number(b.electricity || 0),
        internet: Number(b.internet || 0),
        water: Number(b.water || 0),
        gas: Number(b.gas || 0)
      }));
    }
    return init;
  });

  // سجل التعديلات والعمليات (Audit Log)
  const [activityLogs, setActivityLogs] = useState(() => {
    const savedLogs = localStorage.getItem('apartment_activity_logs_v1');
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch (e) {}
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [financeSubTab, setFinanceSubTab] = useState('capital');
  const [selectedMonth, setSelectedMonth] = useState('سبتمبر 2026');
  const [toast, setToast] = useState(null);
  const [syncStatus, setSyncStatus] = useState(isSheetsConfigured() ? 'loading' : 'unconfigured');
  const [sheetsModalOpen, setSheetsModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('apartment_management_data_v1', JSON.stringify(data));
  }, [data]);

  // Save activityLogs to localStorage
  useEffect(() => {
    localStorage.setItem('apartment_activity_logs_v1', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // إضافة حركة إلى السجل المحلي
  const addLocalLog = (actionType, section, details, amount = '-', notes = '') => {
    const { clientDate, clientTime } = getClientDateTime();
    const newEntry = {
      id: Date.now(),
      date: clientDate,
      time: clientTime,
      actionType,
      section,
      details,
      amount: amount !== undefined && amount !== null && amount !== '' ? amount : '-',
      notes: notes || ''
    };
    setActivityLogs(prev => [newEntry, ...(prev || []).slice(0, 199)]);
  };

  // جلب البيانات وسجل العمليات من Google Sheets
  const refreshFromGoogleSheets = useCallback(async (isInitial = false) => {
    if (!isSheetsConfigured()) {
      setSyncStatus('unconfigured');
      return;
    }

    try {
      setSyncStatus('loading');
      const remoteData = await fetchAllDataFromSheets();

      if (remoteData && (remoteData.expenses || remoteData.beds || remoteData.capitalDeposits)) {
        // Ensure proper formats
        const formattedBeds = (remoteData.beds || []).map(b => ({
          ...b,
          month: b.month || 'سبتمبر 2026'
        }));

        const formattedBills = (remoteData.monthlyBills || []).map(b => ({
          ...b,
          electricity: Number(b.electricity || 0),
          internet: Number(b.internet || 0),
          water: Number(b.water || 0),
          gas: Number(b.gas || 0)
        }));

        setData(prev => ({
          partners: (remoteData.partners && remoteData.partners.length > 0) ? remoteData.partners : prev.partners,
          capitalDeposits: remoteData.capitalDeposits || [],
          expenses: remoteData.expenses || [],
          beds: formattedBeds.length > 0 ? formattedBeds : prev.beds,
          monthlyBills: formattedBills.length > 0 ? formattedBills : prev.monthlyBills
        }));

        // تحديث سجل التعديلات والعمليات من الشيت إن وجد
        if (remoteData.activityLogs && Array.isArray(remoteData.activityLogs) && remoteData.activityLogs.length > 0) {
          setActivityLogs(remoteData.activityLogs);
        }

        setSyncStatus('synced');
        if (!isInitial) {
          showToast('تم تحديث البيانات وسجل الحركات مباشرة من Google Sheets');
        }
      } else {
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      setSyncStatus('error');
      if (!isInitial) {
        showToast('تعذر الاتصال بجوجل شيت، يتم العمل على النسخة المحلية', 'info');
      }
    }
  }, []);

  // Fetch on mount if configured
  useEffect(() => {
    if (isSheetsConfigured()) {
      refreshFromGoogleSheets(true);
    }
  }, [refreshFromGoogleSheets]);

  // تحديث سجل النشاطات فقط
  const refreshActivityLogsOnly = async () => {
    if (!isSheetsConfigured()) return;
    try {
      const logs = await fetchActivityLogsFromSheets();
      if (logs && Array.isArray(logs) && logs.length > 0) {
        setActivityLogs(logs);
        showToast('تم تحديث سجل العمليات من Google Sheets');
      }
    } catch (e) {
      console.error('Failed to fetch activity logs:', e);
    }
  };

  // رفع كل البيانات دفعة واحدة إلى Google Sheets (ترحيل / مزامنة كاملة)
  const syncAllToGoogleSheets = async () => {
    if (!isSheetsConfigured()) {
      showToast('يرجى أولاً إدخال رابط Google Apps Script في الإعدادات', 'info');
      return false;
    }

    try {
      setSyncStatus('saving');
      await syncAllDataToSheets(data);
      addLocalLog('مزامنة شاملة', 'النظام', 'تم رفع وتحديث كامل بيانات السيستم في Google Sheets بنجاح', '-');
      setSyncStatus('synced');
      showToast('تم رفع ومزامنة جميع البيانات إلى Google Sheets بنجاح! 🚀');
      return true;
    } catch (error) {
      console.error('Failed to sync all data:', error);
      setSyncStatus('error');
      showToast('فشل رفع البيانات إلى Google Sheets: ' + (error.message || ''), 'error');
      return false;
    }
  };

  // حفظ إعدادات رابط Google Sheets
  const saveGoogleSheetsConfig = (scriptUrl, sheetLink) => {
    setGoogleScriptUrl(scriptUrl);
    setGoogleSheetLink(sheetLink);
    if (scriptUrl) {
      setSyncStatus('loading');
      refreshFromGoogleSheets(false);
    } else {
      setSyncStatus('unconfigured');
    }
  };

  // Helper calculations for Capital & Expenses
  const totalCapitalDeposits = data.capitalDeposits.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  
  // General expenses recorded manually
  const manualExpensesTotal = data.expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Utilities Breakdown:
  const totalWaterBills = (data.monthlyBills || []).reduce((acc, b) => acc + Number(b.water || 0), 0);
  const totalGasBills = (data.monthlyBills || []).reduce((acc, b) => acc + Number(b.gas || 0), 0);
  const totalPartnerUtilityBills = totalWaterBills + totalGasBills;

  const totalElectricityBills = (data.monthlyBills || []).reduce((acc, b) => acc + Number(b.electricity || 0), 0);
  const totalInternetBills = (data.monthlyBills || []).reduce((acc, b) => acc + Number(b.internet || 0), 0);
  const totalTenantUtilityBills = totalElectricityBills + totalInternetBills;

  const totalExpenses = manualExpensesTotal + totalPartnerUtilityBills;
  const remainingCapitalPool = totalCapitalDeposits - totalExpenses;
  const deficitAmount = remainingCapitalPool < 0 ? Math.abs(remainingCapitalPool) : 0;

  const partnersList = ['محمد', 'ايمن', 'احمد'];
  const equalDeficitSharePerPartner = deficitAmount > 0 ? deficitAmount / partnersList.length : 0;
  const fairExpenseSharePerPartner = totalExpenses > 0 ? totalExpenses / partnersList.length : 0;

  const getPartnerStats = (partnerName) => {
    const totalDeposited = data.capitalDeposits
      .filter(d => d.partner.trim() === partnerName.trim())
      .reduce((acc, c) => acc + Number(c.amount || 0), 0);

    const requiredForFairExpenseShare = Math.round(fairExpenseSharePerPartner - totalDeposited);

    const capitalSharePercentage = totalCapitalDeposits > 0 
      ? Math.round((totalDeposited / totalCapitalDeposits) * 100) 
      : 0;

    return {
      partner: partnerName,
      totalDeposited,
      capitalSharePercentage,
      requiredForFairExpenseShare,
      equalDeficitShare: Math.round(equalDeficitSharePerPartner)
    };
  };

  // Beds calculations filtered by selected Month
  const bedsForSelectedMonth = data.beds.filter(b => (b.month || 'سبتمبر 2026') === selectedMonth);

  const currentBedsList = bedsForSelectedMonth.length > 0 
    ? bedsForSelectedMonth 
    : data.beds.filter(b => b.month === 'سبتمبر 2026');

  const totalBedsCount = currentBedsList.length;
  const occupiedBedsCount = currentBedsList.filter(b => b.status === 'مؤجر').length;
  const occupancyRate = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;

  const totalExpectedMonthlyRent = currentBedsList.reduce((acc, b) => acc + Number(b.monthlyPrice || 0), 0);
  const totalRequiredDeposit = currentBedsList.reduce((acc, b) => acc + Number(b.depositRequired || 0), 0);
  const totalCollectedDeposit = currentBedsList.reduce((acc, b) => acc + Number(b.depositPaid || 0), 0);
  const totalRemainingDeposit = currentBedsList.reduce((acc, b) => acc + Number(b.depositRemaining || 0), 0);

  const totalRequiredCurrentRent = currentBedsList.reduce((acc, b) => acc + Number(b.rentRequired || 0), 0);
  const totalCollectedCurrentRent = currentBedsList.reduce((acc, b) => acc + Number(b.rentPaid || 0), 0);
  const totalRemainingCurrentRent = currentBedsList.reduce((acc, b) => acc + Number(b.rentRemaining || 0), 0);

  const totalCollectedFromTenants = totalCollectedDeposit + totalCollectedCurrentRent;

  // Start / Roll Over to a New Month
  const startNewMonth = async (targetMonth) => {
    const existing = data.beds.filter(b => b.month === targetMonth);
    if (existing.length > 0) {
      setSelectedMonth(targetMonth);
      showToast(`تم الانتقال لبيانات شهر ${targetMonth}`);
      return;
    }

    const sourceBeds = currentBedsList;
    const maxId = data.beds.length > 0 ? Math.max(...data.beds.map(b => b.id)) : 0;

    const newBeds = sourceBeds.map((b, idx) => {
      const isOccupied = b.status === 'مؤجر';
      return {
        id: maxId + idx + 1,
        month: targetMonth,
        roomName: b.roomName,
        bedNumber: b.bedNumber,
        monthlyPrice: b.monthlyPrice,
        status: b.status,
        tenantName: isOccupied ? b.tenantName : '',
        startDate: isOccupied ? b.startDate : '',
        depositRequired: isOccupied ? b.depositRequired : b.monthlyPrice,
        depositPaid: isOccupied ? b.depositPaid : 0,
        depositRemaining: isOccupied ? b.depositRemaining : b.monthlyPrice,
        rentRequired: isOccupied ? b.monthlyPrice : 0,
        rentPaid: 0,
        rentRemaining: isOccupied ? b.monthlyPrice : 0,
        notes: isOccupied ? 'مستمر من الشهر السابق' : ''
      };
    });

    const updatedBeds = [...data.beds, ...newBeds];
    setData(prev => ({
      ...prev,
      beds: updatedBeds
    }));

    setSelectedMonth(targetMonth);
    addLocalLog(
      'ترحيل شهر جديد',
      'السراير والمستأجرين',
      `بدء وترحيل شهر جديد: ${targetMonth} مع ترحيل المستأجرين النشطين (عدد ${newBeds.length} سرير)`,
      '-'
    );
    showToast(`تم تفعيل شهر ${targetMonth} وترحيل المستأجرين`);

    if (isSheetsConfigured()) {
      setSyncStatus('saving');
      batchUpdateBedsInSheets(updatedBeds)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  // Actions for Expenses
  const addExpense = (expense) => {
    const newId = data.expenses.length > 0 ? Math.max(...data.expenses.map(e => e.id)) + 1 : 1;
    const newExpense = { ...expense, id: newId };
    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));

    addLocalLog(
      'إضافة مصروف',
      'المصروفات',
      `إضافة مصروف جديد: ${newExpense.item} بمبلغ (${Number(newExpense.amount).toLocaleString()} ج.م) - القائم بالصرف: ${newExpense.paidBy || 'غير محدد'}`,
      newExpense.amount,
      newExpense.notes
    );

    showToast('تمت إضافة المصروف بنجاح وتسجيله في سجل التعديلات');

    if (isSheetsConfigured()) {
      setSyncStatus('saving');
      addExpenseToSheets(newExpense)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  const updateExpense = (updatedExpense) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
    }));

    addLocalLog(
      'تعديل مصروف',
      'المصروفات',
      `تعديل بيانات المصروف #${updatedExpense.id}: ${updatedExpense.item} بمبلغ (${Number(updatedExpense.amount).toLocaleString()} ج.م) - القائم بالصرف: ${updatedExpense.paidBy || 'غير محدد'}`,
      updatedExpense.amount,
      updatedExpense.notes
    );

    showToast('تم تعديل المصروف وتسجيل التعديل في سجل جوجل شيت');

    if (isSheetsConfigured()) {
      setSyncStatus('saving');
      updateExpenseInSheets(updatedExpense)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  const deleteExpense = (id) => {
    const target = data.expenses.find(e => e.id === id);
    const itemName = target ? target.item : '';
    const itemAmount = target ? target.amount : 0;
    const itemNotes = target ? target.notes : '';

    if (window.confirm(`هل أنت متأكد من حذف هذا المصروف: "${itemName}" بمبلغ ${itemAmount} ج.م؟`)) {
      setData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id)
      }));

      addLocalLog(
        'حذف مصروف',
        'المصروفات',
        `حذف المصروف #${id}: ${itemName} بمبلغ (${Number(itemAmount).toLocaleString()} ج.م)`,
        itemAmount,
        itemNotes
      );

      showToast('تم حذف المصروف وتسجيل حركة الحذف في سجل جوجل شيت', 'info');

      if (isSheetsConfigured()) {
        setSyncStatus('saving');
        deleteExpenseFromSheets({ id, item: itemName, amount: itemAmount, notes: itemNotes })
          .then(() => setSyncStatus('synced'))
          .catch(err => {
            console.error(err);
            setSyncStatus('error');
          });
      }
    }
  };

  // Actions for Capital Deposits
  const addCapitalDeposit = (deposit) => {
    const newId = data.capitalDeposits.length > 0 ? Math.max(...data.capitalDeposits.map(d => d.id)) + 1 : 1;
    const newDeposit = { ...deposit, id: newId };
    setData(prev => ({
      ...prev,
      capitalDeposits: [newDeposit, ...prev.capitalDeposits]
    }));

    addLocalLog(
      'إضافة إيداع',
      'إيداعات رأس المال',
      `إيداع رأس مال جديد للشريك: ${newDeposit.partner} بمبلغ (${Number(newDeposit.amount).toLocaleString()} ج.م)`,
      newDeposit.amount,
      newDeposit.date ? `تاريخ الإيداع: ${newDeposit.date}` : ''
    );

    showToast('تم تسجيل إيداع رأس المال وحفظه في سجل العمليات');

    if (isSheetsConfigured()) {
      setSyncStatus('saving');
      addCapitalDepositToSheets(newDeposit)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  const updateCapitalDeposit = (updated) => {
    setData(prev => ({
      ...prev,
      capitalDeposits: prev.capitalDeposits.map(d => d.id === updated.id ? updated : d)
    }));

    addLocalLog(
      'تعديل إيداع',
      'إيداعات رأس المال',
      `تعديل إيداع رأس مال #${updated.id} للشريك: ${updated.partner} بمبلغ (${Number(updated.amount).toLocaleString()} ج.م)`,
      updated.amount,
      updated.date ? `تاريخ الإيداع: ${updated.date}` : ''
    );

    showToast('تم تعديل الإيداع وتسجيل التعديل في سجل الشيت');

    if (isSheetsConfigured()) {
      setSyncStatus('saving');
      updateCapitalDepositInSheets(updated)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  const deleteCapitalDeposit = (id) => {
    const target = data.capitalDeposits.find(d => d.id === id);
    const partnerName = target ? target.partner : '';
    const depositAmount = target ? target.amount : 0;
    const depositDate = target ? target.date : '';

    if (window.confirm(`هل أنت متأكد من حذف هذا الإيداع للشريك: ${partnerName} بمبلغ ${depositAmount} ج.م؟`)) {
      setData(prev => ({
        ...prev,
        capitalDeposits: prev.capitalDeposits.filter(d => d.id !== id)
      }));

      addLocalLog(
        'حذف إيداع',
        'إيداعات رأس المال',
        `حذف إيداع رأس مال #${id} للشريك: ${partnerName} بمبلغ (${Number(depositAmount).toLocaleString()} ج.م)`,
        depositAmount,
        depositDate
      );

      showToast('تم حذف الإيداع وتسجيل الحركة في سجل جوجل شيت', 'info');

      if (isSheetsConfigured()) {
        setSyncStatus('saving');
        deleteCapitalDepositFromSheets({ id, partner: partnerName, amount: depositAmount, date: depositDate })
          .then(() => setSyncStatus('synced'))
          .catch(err => {
            console.error(err);
            setSyncStatus('error');
          });
      }
    }
  };

  // Actions for Beds & Tenants
  const updateBed = (updatedBed) => {
    const depositRem = Math.max(0, (Number(updatedBed.depositRequired) || 0) - (Number(updatedBed.depositPaid) || 0));
    const rentRem = Math.max(0, (Number(updatedBed.rentRequired) || 0) - (Number(updatedBed.rentPaid) || 0));
    
    const finalBed = {
      ...updatedBed,
      month: updatedBed.month || selectedMonth,
      depositRemaining: depositRem,
      rentRemaining: rentRem
    };

    setData(prev => ({
      ...prev,
      beds: prev.beds.map(b => b.id === finalBed.id ? finalBed : b)
    }));

    addLocalLog(
      'تعديل سرير / مستأجر',
      'السراير والمستأجرين',
      `تحديث بيانات ${finalBed.roomName} - سرير ${finalBed.bedNumber} (${finalBed.month}) - المستأجر: ${finalBed.tenantName || 'شاغر'} - الحالة: ${finalBed.status}`,
      finalBed.rentPaid || finalBed.monthlyPrice,
      finalBed.notes
    );

    showToast('تم تحديث بيانات السرير والمستأجر بنجاح وتسجيلها في الشيت');

    if (isSheetsConfigured()) {
      setSyncStatus('saving');
      updateBedInSheets(finalBed)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  const addBed = (newBed) => {
    const newId = data.beds.length > 0 ? Math.max(...data.beds.map(b => b.id)) + 1 : 1;
    const bed = {
      ...newBed,
      id: newId,
      month: selectedMonth,
      depositRemaining: (Number(newBed.depositRequired) || 0) - (Number(newBed.depositPaid) || 0),
      rentRemaining: (Number(newBed.rentRequired) || 0) - (Number(newBed.rentPaid) || 0)
    };
    setData(prev => ({
      ...prev,
      beds: [...prev.beds, bed]
    }));

    addLocalLog(
      'إضافة سرير',
      'السراير والمستأجرين',
      `إضافة سرير جديد: ${bed.roomName} - سرير ${bed.bedNumber} (${bed.month}) - السعر: ${bed.monthlyPrice} ج.م`,
      bed.monthlyPrice,
      `المستأجر: ${bed.tenantName || 'شاغر'}`
    );

    showToast('تمت إضافة سرير جديد وتسجيل الحركة في سجل جوجل شيت');

    if (isSheetsConfigured()) {
      setSyncStatus('saving');
      addBedToSheets(bed)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  // Action: Record Quick Payment for Rent
  const recordRentPayment = (bedId, rentPaidAmount) => {
    let updatedBedObj = null;
    setData(prev => {
      const newBeds = prev.beds.map(b => {
        if (b.id === bedId) {
          const newPaid = Number(rentPaidAmount || 0);
          const newRem = Math.max(0, Number(b.rentRequired || 0) - newPaid);
          updatedBedObj = {
            ...b,
            rentPaid: newPaid,
            rentRemaining: newRem
          };
          return updatedBedObj;
        }
        return b;
      });
      return { ...prev, beds: newBeds };
    });

    if (updatedBedObj) {
      addLocalLog(
        'تسديد إيجار',
        'السراير والمستأجرين',
        `تسديد إيجار سرير: ${updatedBedObj.roomName} سرير ${updatedBedObj.bedNumber} للمستأجر "${updatedBedObj.tenantName}" - تم سداد: ${Number(rentPaidAmount).toLocaleString()} ج.م (المتبقي: ${updatedBedObj.rentRemaining} ج.م)`,
        rentPaidAmount,
        updatedBedObj.notes || ''
      );
    }

    showToast('تم تسديد الإيجار وتسجيل الحركة بالتاريخ والوقت في سجل الشيت');

    if (isSheetsConfigured() && updatedBedObj) {
      setSyncStatus('saving');
      updateBedInSheets({
        ...updatedBedObj,
        _customActionType: 'تسديد إيجار',
        _customDetails: `تسديد إيجار سرير: ${updatedBedObj.roomName} سرير ${updatedBedObj.bedNumber} للمستأجر "${updatedBedObj.tenantName}" - سداد: ${rentPaidAmount} ج.م`,
        _customAmount: rentPaidAmount
      })
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  // Action: Vacate Bed & Refund Security Deposit
  const vacateBedAndRefund = (bedId, notesReason) => {
    let updatedBedObj = null;
    let prevTenant = '';
    setData(prev => {
      const target = prev.beds.find(b => b.id === bedId);
      prevTenant = target ? target.tenantName : '';
      const newBeds = prev.beds.map(b => {
        if (b.id === bedId) {
          updatedBedObj = {
            ...b,
            status: 'شاغر',
            tenantName: '',
            depositPaid: 0,
            depositRemaining: 0,
            rentRequired: 0,
            rentPaid: 0,
            rentRemaining: 0,
            notes: notesReason || 'تم إخلاء السرير واسترداد التأمين (إبلاغ قبل 15 يوماً)'
          };
          return updatedBedObj;
        }
        return b;
      });
      return { ...prev, beds: newBeds };
    });

    if (updatedBedObj) {
      addLocalLog(
        'إخلاء سرير',
        'السراير والمستأجرين',
        `إخلاء سرير: ${updatedBedObj.roomName} سرير ${updatedBedObj.bedNumber} - المستأجر: ${prevTenant} - (${notesReason || 'استرداد التأمين'})`,
        '-',
        updatedBedObj.notes
      );
    }

    showToast('تم إخلاء السرير وتسجيل استرداد التأمين في سجل العمليات', 'info');

    if (isSheetsConfigured() && updatedBedObj) {
      setSyncStatus('saving');
      updateBedInSheets({
        ...updatedBedObj,
        _customActionType: 'إخلاء سرير',
        _customDetails: `إخلاء سرير: ${updatedBedObj.roomName} سرير ${updatedBedObj.bedNumber} - المستأجر السابق: ${prevTenant} (${notesReason || 'استرداد تأمين'})`,
        _customAmount: '-'
      })
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  // Actions for Utility Bills
  const updateMonthlyBill = (updatedBill) => {
    setData(prev => ({
      ...prev,
      monthlyBills: prev.monthlyBills.map(b => b.id === updatedBill.id ? updatedBill : b)
    }));

    const totalBills = Number(updatedBill.electricity || 0) + Number(updatedBill.water || 0) + Number(updatedBill.gas || 0) + Number(updatedBill.internet || 0);

    addLocalLog(
      'تعديل فواتير شهرية',
      'الفواتير الشهرية',
      `تعديل فواتير شهر ${updatedBill.month} - كهرباء: ${updatedBill.electricity} | مياه: ${updatedBill.water} | غاز: ${updatedBill.gas} | نت: ${updatedBill.internet} ج.م (الإجمالي: ${totalBills} ج.م)`,
      totalBills,
      updatedBill.notes
    );

    showToast('تم تحديث الفاتورة الشهرية وتسجيلها في سجل الشيت');

    if (isSheetsConfigured()) {
      setSyncStatus('saving');
      updateMonthlyBillInSheets(updatedBill)
        .then(() => setSyncStatus('synced'))
        .catch(err => {
          console.error(err);
          setSyncStatus('error');
        });
    }
  };

  // Reset to Initial Excel Data
  const resetToInitialData = () => {
    if (window.confirm('هل أنت متأكد من إعادة ضبط البيانات إلى النسخة الأصلية؟')) {
      const init = { ...initialData };
      init.beds = init.beds.map(b => ({ ...b, month: b.month || 'سبتمبر 2026' }));
      setData(init);
      setSelectedMonth('سبتمبر 2026');
      localStorage.removeItem('apartment_management_data_v1');
      addLocalLog('إعادة ضبط', 'النظام', 'تمت إعادة ضبط بيانات السيستم إلى النسخة الأصلية', '-');
      showToast('تمت إعادة ضبط البيانات', 'info');
    }
  };

  // Export to Excel (Backup with all 5 sheets including Audit Log)
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: المصروفات
    const wsExpensesData = data.expenses.map(e => ({
      'م': e.id,
      'التاريخ': e.date,
      'البند': e.item,
      'المبلغ (ج.م)': e.amount,
      'مين قام بالدفع': e.paidBy,
      'ملاحظات': e.notes
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(wsExpensesData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'المصروفات');

    // Sheet 2: إيداعات رأس المال
    const wsCapitalData = data.capitalDeposits.map(c => ({
      'م': c.id,
      'الشريك': c.partner,
      'مبلغ الإيداع (ج.م)': c.amount,
      'التاريخ': c.date
    }));
    const wsCapital = XLSX.utils.json_to_sheet(wsCapitalData);
    XLSX.utils.book_append_sheet(wb, wsCapital, 'إيداعات رأس المال');

    // Sheet 3: الأوض والسراير
    const wsBedsData = data.beds.map(b => ({
      'الشهر': b.month || 'سبتمبر 2026',
      'الغرفة': b.roomName,
      'رقم السرير': b.bedNumber,
      'السعر الشهري': b.monthlyPrice,
      'الحالة': b.status,
      'اسم المستأجر': b.tenantName,
      'تاريخ البداية': b.startDate,
      'تأمين مطلوب': b.depositRequired,
      'تأمين مدفوع': b.depositPaid,
      'تأمين متبقي': b.depositRemaining,
      'إيجار مطلوب': b.rentRequired,
      'إيجار مدفوع': b.rentPaid,
      'إيجار متبقي': b.rentRemaining,
      'ملاحظات': b.notes
    }));
    const wsBeds = XLSX.utils.json_to_sheet(wsBedsData);
    XLSX.utils.book_append_sheet(wb, wsBeds, 'تفاصيل السراير والمستأجرين');

    // Sheet 4: الفواتير
    const wsBillsData = data.monthlyBills.map(b => {
      const elec = Number(b.electricity || 0);
      const net = Number(b.internet || 0);
      const water = Number(b.water || 0);
      const gas = Number(b.gas || 0);
      const tenantTotal = elec + net;
      const partnerTotal = water + gas;
      const totalAll = tenantTotal + partnerTotal;
      const sharePerBed = (tenantTotal / 8).toFixed(1);
      const sharePerPartner = (partnerTotal / 3).toFixed(1);

      return {
        'الشهر': b.month,
        'كهرباء (على السراير)': elec,
        'نت (على السراير)': net,
        'إجمالي فواتير السراير (كهرباء + نت)': tenantTotal,
        'نصيب السرير الواحد (÷ 8 سراير)': sharePerBed,
        'مياه (على الشركاء - مصاريف)': water,
        'غاز (على الشركاء - مصاريف)': gas,
        'إجمالي فواتير الشركاء (مياه + غاز)': partnerTotal,
        'نصيب كل شريك (÷ 3)': sharePerPartner,
        'إجمالي كل الفواتير': totalAll
      };
    });
    const wsBills = XLSX.utils.json_to_sheet(wsBillsData);
    XLSX.utils.book_append_sheet(wb, wsBills, 'الفواتير الشهرية');

    // Sheet 5: سجل التعديلات والعمليات
    const wsLogsData = (activityLogs || []).map(l => ({
      'م': l.id,
      'التاريخ': l.date,
      'الساعة والوقت': l.time,
      'نوع العملية': l.actionType,
      'القسم': l.section,
      'تفاصيل الحركة والتعديل': l.details,
      'المبلغ / القيمة': l.amount,
      'ملاحظات وبيان': l.notes
    }));
    const wsLogs = XLSX.utils.json_to_sheet(wsLogsData);
    XLSX.utils.book_append_sheet(wb, wsLogs, 'سجل التعديلات والعمليات');

    XLSX.writeFile(wb, `متابعة_مصاريف_الشقة_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('تم تصدير ملف الإكسيل مع سجل التعديلات بنجاح');
  };

  return (
    <AppContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        financeSubTab,
        setFinanceSubTab,
        selectedMonth,
        setSelectedMonth,
        startNewMonth,
        toast,
        showToast,
        partnersList,

        // Google Sheets Integration
        syncStatus,
        isSheetsConnected: isSheetsConfigured(),
        refreshFromGoogleSheets,
        syncAllToGoogleSheets,
        saveGoogleSheetsConfig,

        // Modals Management (Root level)
        sheetsModalOpen,
        setSheetsModalOpen,

        // Activity Logs (سجل التعديلات والعمليات)
        activityLogs,
        refreshActivityLogsOnly,

        // Totals & Calcs
        totalCapitalDeposits,
        totalExpenses,
        manualExpensesTotal,
        totalWaterBills,
        totalGasBills,
        totalPartnerUtilityBills,
        totalElectricityBills,
        totalInternetBills,
        totalTenantUtilityBills,
        remainingCapitalPool,
        deficitAmount,
        equalDeficitSharePerPartner,
        fairExpenseSharePerPartner,
        getPartnerStats,

        // Beds Calcs
        currentBedsList,
        totalBedsCount,
        occupiedBedsCount,
        occupancyRate,
        totalExpectedMonthlyRent,
        totalRequiredDeposit,
        totalCollectedDeposit,
        totalRemainingDeposit,
        totalRequiredCurrentRent,
        totalCollectedCurrentRent,
        totalRemainingCurrentRent,
        totalCollectedFromTenants,

        // Actions
        addExpense,
        updateExpense,
        deleteExpense,
        addCapitalDeposit,
        updateCapitalDeposit,
        deleteCapitalDeposit,
        updateBed,
        addBed,
        recordRentPayment,
        vacateBedAndRefund,
        updateMonthlyBill,
        resetToInitialData,
        exportToExcel
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
