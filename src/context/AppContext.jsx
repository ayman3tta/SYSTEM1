import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialData } from '../data/initialData';
import * as XLSX from 'xlsx';

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
        // Ensure all beds have month property
        if (parsed.beds) {
          parsed.beds = parsed.beds.map(b => ({ ...b, month: b.month || 'سبتمبر 2026' }));
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse local storage data', e);
      }
    }
    // Set default month on initial beds
    const init = { ...initialData };
    init.beds = init.beds.map(b => ({ ...b, month: b.month || 'سبتمبر 2026' }));
    return init;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('سبتمبر 2026');
  const [toast, setToast] = useState(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('apartment_management_data_v1', JSON.stringify(data));
  }, [data]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper calculations for Capital & Expenses
  const totalCapitalDeposits = data.capitalDeposits.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpenses = data.expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
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

  // If no beds exist for selected month, fallback to latest existing month's beds template
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
  const startNewMonth = (targetMonth) => {
    const existing = data.beds.filter(b => b.month === targetMonth);
    if (existing.length > 0) {
      setSelectedMonth(targetMonth);
      showToast(`تم الانتقال لبيانات شهر ${targetMonth}`);
      return;
    }

    // Get beds from the latest existing month
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
        depositPaid: isOccupied ? b.depositPaid : 0, // Carried over!
        depositRemaining: isOccupied ? b.depositRemaining : b.monthlyPrice,
        rentRequired: isOccupied ? b.monthlyPrice : 0, // Full monthly rent for new month
        rentPaid: 0, // Reset rent paid for new month
        rentRemaining: isOccupied ? b.monthlyPrice : 0,
        notes: isOccupied ? 'مستمر من الشهر السابق' : ''
      };
    });

    setData(prev => ({
      ...prev,
      beds: [...prev.beds, ...newBeds]
    }));

    setSelectedMonth(targetMonth);
    showToast(`تم تفعيل شهر ${targetMonth} بنجاح وترحيل المستأجرين والتأمينات وتصفير الإيجار!`);
  };

  // Actions for Expenses
  const addExpense = (expense) => {
    const newId = data.expenses.length > 0 ? Math.max(...data.expenses.map(e => e.id)) + 1 : 1;
    const newExpense = { ...expense, id: newId };
    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));
    showToast('تمت إضافة المصروف بنجاح');
  };

  const updateExpense = (updatedExpense) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
    }));
    showToast('تم تعديل المصروف بنجاح');
  };

  const deleteExpense = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      setData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id)
      }));
      showToast('تم حذف المصروف بنجاح', 'info');
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
    showToast('تم تسجيل إيداع رأس المال بنجاح');
  };

  const updateCapitalDeposit = (updated) => {
    setData(prev => ({
      ...prev,
      capitalDeposits: prev.capitalDeposits.map(d => d.id === updated.id ? updated : d)
    }));
    showToast('تم تعديل الإيداع بنجاح');
  };

  const deleteCapitalDeposit = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإيداع؟')) {
      setData(prev => ({
        ...prev,
        capitalDeposits: prev.capitalDeposits.filter(d => d.id !== id)
      }));
      showToast('تم حذف الإيداع', 'info');
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
    showToast('تم تحديث بيانات السرير والمستأجر بنجاح');
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
    showToast('تم إضاف سرير جديد بنجاح');
  };

  // Action: Record Quick Payment for Rent
  const recordRentPayment = (bedId, rentPaidAmount) => {
    setData(prev => ({
      ...prev,
      beds: prev.beds.map(b => {
        if (b.id === bedId) {
          const newPaid = Number(rentPaidAmount || 0);
          const newRem = Math.max(0, Number(b.rentRequired || 0) - newPaid);
          return {
            ...b,
            rentPaid: newPaid,
            rentRemaining: newRem
          };
        }
        return b;
      })
    }));
    showToast('تم تسديد الإيجار بنجاح');
  };

  // Action: Vacate Bed & Refund Security Deposit
  const vacateBedAndRefund = (bedId, notesReason) => {
    setData(prev => ({
      ...prev,
      beds: prev.beds.map(b => {
        if (b.id === bedId) {
          return {
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
        }
        return b;
      })
    }));
    showToast('تم إخلاء السرير وتسجيل استرداد التأمين للمستأجر', 'info');
  };

  // Actions for Utility Bills
  const updateMonthlyBill = (updatedBill) => {
    setData(prev => ({
      ...prev,
      monthlyBills: prev.monthlyBills.map(b => b.id === updatedBill.id ? updatedBill : b)
    }));
    showToast('تم تحديث الفاتورة الشهرية بنجاح');
  };

  // Reset to Initial Excel Data
  const resetToInitialData = () => {
    if (window.confirm('هل أنت متأكد من إعادة ضبط البيانات إلى شيت الإكسيل الأصلي؟ سيتم إلغاء أي تعديلات جديدة.')) {
      const init = { ...initialData };
      init.beds = init.beds.map(b => ({ ...b, month: b.month || 'سبتمبر 2026' }));
      setData(init);
      setSelectedMonth('سبتمبر 2026');
      localStorage.removeItem('apartment_management_data_v1');
      showToast('تمت إعادة ضبط البيانات إلى شيت الإكسيل الأصلي', 'info');
    }
  };

  // Export to Excel
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
    const wsBillsData = data.monthlyBills.map(b => ({
      'الشهر': b.month,
      'كهرباء': b.electricity,
      'مياه': b.water,
      'غاز': b.gas,
      'الإجمالي': b.electricity + b.water + b.gas,
      'نصيب السرير': occupiedBedsCount > 0 ? ((b.electricity + b.water + b.gas) / occupiedBedsCount).toFixed(2) : 0
    }));
    const wsBills = XLSX.utils.json_to_sheet(wsBillsData);
    XLSX.utils.book_append_sheet(wb, wsBills, 'الفواتير الشهرية');

    XLSX.writeFile(wb, `متابعة_مصاريف_الشقة_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('تم تصدير ملف الإكسيل بنجاح');
  };

  return (
    <AppContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        startNewMonth,
        toast,
        showToast,
        partnersList,

        // Totals & Calcs
        totalCapitalDeposits,
        totalExpenses,
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
