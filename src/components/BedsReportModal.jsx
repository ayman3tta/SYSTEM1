import React, { useState, useEffect } from 'react';
import { useApp, availableMonthsList } from '../context/AppContext';
import { 
  Printer, 
  X, 
  Calendar, 
  Coins, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileText,
  AlertCircle
} from 'lucide-react';

export const BedsReportModal = ({ isOpen, onClose }) => {
  const { 
    data, 
    selectedMonth, 
    partnersList 
  } = useApp();

  const [reportMonth, setReportMonth] = useState(selectedMonth || 'أكتوبر 2026');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('beds-report-open');
    } else {
      document.body.classList.remove('beds-report-open');
    }
    return () => {
      document.body.classList.remove('beds-report-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Use the beds for the chosen report month
  const monthBeds = (data?.beds || []).filter(b => b.month === reportMonth);
  
  // If no beds registered for that month, fallback to template beds
  const bedsList = monthBeds.length > 0 ? monthBeds : (data?.beds || []).filter(b => b.month === 'سبتمبر 2026');

  // Settlement for that month
  const monthSettlement = data?.monthlyRentSettlements?.[reportMonth] || {};
  const ownerRent = monthSettlement.ownerRent !== undefined ? monthSettlement.ownerRent : 7000;
  const isOwnerRentPaid = Boolean(monthSettlement.ownerRentPaid);
  const buildingExpenses = monthSettlement.buildingExpenses !== undefined ? monthSettlement.buildingExpenses : 0;
  const isBuildingExpPaid = Boolean(monthSettlement.buildingExpensesPaid);
  const receivedPartners = monthSettlement.receivedPartners || {};

  // Financial Totals
  const totalBeds = bedsList.length;
  const occupiedBeds = bedsList.filter(b => b.status === 'مؤجر').length;
  const vacantBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Rent Calculations
  const totalRequiredRent = bedsList.reduce((acc, b) => acc + Number(b.rentRequired || 0), 0);
  const totalCollectedRent = bedsList.reduce((acc, b) => acc + Number(b.rentPaid || 0), 0);
  const totalRemainingRent = bedsList.reduce((acc, b) => acc + Number(b.rentRemaining || 0), 0);

  // Security Deposit Calculations (متبقي التأمين)
  const totalRequiredDeposit = bedsList.reduce((acc, b) => acc + Number(b.depositRequired || 0), 0);
  const totalCollectedDeposit = bedsList.reduce((acc, b) => acc + Number(b.depositPaid || 0), 0);
  const totalRemainingDeposit = bedsList.reduce((acc, b) => acc + Number(b.depositRemaining || 0), 0);

  // Settlement Net
  const netProfit = totalCollectedRent - (ownerRent + buildingExpenses);
  const sharePerPartner = netProfit > 0 ? Math.round(netProfit / 3) : 0;

  const partners = partnersList || ['محمد', 'ايمن', 'احمد'];
  const receivedCount = partners.filter(p => Boolean(receivedPartners[p])).length;
  const totalTaken = netProfit > 0 ? receivedCount * sharePerPartner : 0;
  const remainingRentPool = netProfit > 0 ? Math.max(0, netProfit - totalTaken) : netProfit;

  const printDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const printTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });


  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="beds-report-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in print:static print:p-0 print:m-0 print:bg-white print:backdrop-blur-none"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden print:bg-white print:border-none print:shadow-none print:rounded-none print:max-w-none print:max-h-none print:w-full print:h-auto print:overflow-visible">
        
        {/* ── Toolbar (Hidden on Print) ── */}
        <div className="no-print p-3 sm:p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>تقرير السراير والإيرادات والتأمين</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  PDF / طباعة
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">معاينة التقرير وطباعته أو حفظه بتنسيق PDF رسمي</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                {availableMonthsList.map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
                ))}
              </select>
            </div>

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
              title="طباعة أو حفظ كملف PDF"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Document Preview ── */}
        <div className="report-scroll-container flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950/60 flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-full">
          
          {/* ── Printable Report Sheet ── */}
          <div 
            id="printable-beds-report"
            className="w-full max-w-4xl bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-xl font-cairo border border-slate-200 print:max-w-none print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none print:w-full print:bg-white"
            dir="rtl"
          >
            
            {/* 1. الترويسة الرسمية */}
            <div className="border-b-2 border-slate-800 pb-4 mb-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🏠</span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">سيستم شقة الكوثر</h1>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-indigo-700">
                    تقرير السراير والمستأجرين وتفاصيل الإيرادات والتأمين
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    بيان شامل بحالة السراير والمبالغ المحصلة والمتبقية من التأمينات وتصفية الشهر
                  </p>
                </div>

                <div className="bg-slate-100 border border-slate-300 rounded-xl p-3 text-left shrink-0 min-w-[200px]">
                  <div className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="text-slate-500 font-normal">الشهر المالي:</span>
                    <span className="font-black text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {reportMonth}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between mb-0.5">
                    <span className="text-slate-500">تاريخ الإصدار:</span>
                    <span>{printDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span className="text-slate-500">وقت الإصدار:</span>
                    <span dir="ltr">{printTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ملخص المؤشرات المالية والإشغال (KPIs) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              
              {/* إيرادات السراير */}
              <div className="bg-emerald-50/70 border border-emerald-300/80 rounded-xl p-3">
                <div className="text-[11px] font-bold text-emerald-800 mb-1 flex items-center justify-between">
                  <span>إيرادات السراير (المحصلة)</span>
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-lg font-black text-emerald-700 font-mono">
                  {totalCollectedRent.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
                </div>
                <div className="text-[10px] text-emerald-800/80 mt-1 flex justify-between font-medium">
                  <span>مطلوب: {totalRequiredRent.toLocaleString()}</span>
                  <span>متبقي: {totalRemainingRent.toLocaleString()}</span>
                </div>
              </div>

              {/* تأمينات السراير ومتبقي التأمين */}
              <div className="bg-amber-50/80 border-2 border-amber-400 rounded-xl p-3 shadow-sm">
                <div className="text-[11px] font-black text-amber-900 mb-1 flex items-center justify-between">
                  <span>متبقي التأمينات المطلوب</span>
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-lg font-black text-amber-700 font-mono">
                  {totalRemainingDeposit.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
                </div>
                <div className="text-[10px] text-amber-900 mt-1 flex justify-between font-bold">
                  <span>مدفوع: {totalCollectedDeposit.toLocaleString()}</span>
                  <span>مطلوب: {totalRequiredDeposit.toLocaleString()}</span>
                </div>
              </div>

              {/* نسبة الإشغال */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <div className="text-[11px] font-bold text-blue-800 mb-1 flex items-center justify-between">
                  <span>حالة الإشغال</span>
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-lg font-black text-blue-700 font-mono">
                  {occupancyRate}% <span className="text-xs font-normal">({occupiedBeds}/{totalBeds})</span>
                </div>
                <div className="text-[10px] text-blue-800/80 mt-1 flex justify-between font-medium">
                  <span>مؤجر: {occupiedBeds} سرير</span>
                  <span>شاغر: {vacantBeds} سرير</span>
                </div>
              </div>

              {/* صافي التوزيع للشركاء */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3">
                <div className="text-[11px] font-bold text-indigo-800 mb-1 flex items-center justify-between">
                  <span>صافي الربح للتوزيع</span>
                  <span className="text-xs">⚖️</span>
                </div>
                <div className={`text-lg font-black font-mono ${netProfit >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>
                  {netProfit.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
                </div>
                <div className="text-[10px] text-indigo-800/80 mt-1 font-medium">
                  نصيب كل شريك: <span className="font-bold">{sharePerPartner.toLocaleString()} ج.م</span>
                </div>
              </div>

            </div>

            {/* 3. تفاصيل تصفية إيجار الشهر وخصومات المالك والعمارة */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 mb-6">
              <h3 className="text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5">
                <span>📊 تصفية إيجار الشهر وتوزيع الأرباح على الشركاء</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">إيراد السراير المحصل:</span>
                  <span className="font-black text-slate-800 font-mono">{totalCollectedRent.toLocaleString()} ج.م</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">خصم إيجار المالك:</span>
                  <span className="font-black text-slate-800 font-mono">{ownerRent.toLocaleString()} ج.م</span>
                  <span className={`text-[10px] font-bold mr-1.5 ${isOwnerRentPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ({isOwnerRentPaid ? 'مسدد للمالك ✓' : 'لم يسدد'})
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">خصم مصاريف العمارة:</span>
                  <span className="font-black text-slate-800 font-mono">{buildingExpenses.toLocaleString()} ج.م</span>
                  <span className={`text-[10px] font-bold mr-1.5 ${isBuildingExpPaid ? 'text-emerald-600' : 'text-slate-400'}`}>
                    ({isBuildingExpPaid ? 'مسددة للعمارة ✓' : 'لم تسدد'})
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">المتبقي في الإيرادات:</span>
                  <span className="font-black text-indigo-700 font-mono">{remainingRentPool.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* الشركاء الثلاثة وحالة استلام الأرباح */}
              <div className="grid grid-cols-3 gap-2">
                {partners.map(p => {
                  const isRec = Boolean(receivedPartners[p]);
                  return (
                    <div 
                      key={p} 
                      className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                        isRec 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold">{p}</span>
                      <span className="text-[11px] font-mono font-bold">
                        {isRec ? `استلم ${sharePerPartner.toLocaleString()} ج.م ✓` : `مستحق ${sharePerPartner.toLocaleString()} ج.م`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. جدول تفاصيل السراير والمستأجرين */}
            <div className="mb-6">
              <h3 className="text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5">
                <span>🛏️ تفاصيل السراير والمستأجرين ومتبقي التأمين والإيجار</span>
              </h3>
              
              <div className="overflow-x-auto border border-slate-300 rounded-xl">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-2 text-center border-l border-slate-700 w-8">م</th>
                      <th className="py-2.5 px-2.5 border-l border-slate-700">الغرفة والسرير</th>
                      <th className="py-2.5 px-2.5 border-l border-slate-700">اسم المستأجر</th>
                      <th className="py-2.5 px-2 text-center border-l border-slate-700">تاريخ البداية</th>
                      <th className="py-2.5 px-2 text-center border-l border-slate-700">السعر الشهري</th>
                      <th className="py-2.5 px-2 text-center border-l border-slate-700 bg-emerald-900/60 text-emerald-200">إيجار مدفوع</th>
                      <th className="py-2.5 px-2 text-center border-l border-slate-700">إيجار متبقي</th>
                      <th className="py-2.5 px-2 text-center border-l border-slate-700">تأمين مطلوب</th>
                      <th className="py-2.5 px-2 text-center border-l border-slate-700">تأمين مدفوع</th>
                      <th className="py-2.5 px-2 text-center border-l border-slate-700 bg-amber-900/60 text-amber-200">متبقي التأمين</th>
                      <th className="py-2.5 px-2 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {bedsList.map((bed, idx) => {
                      const isOccupied = bed.status === 'مؤجر';
                      const hasRemainingDep = Number(bed.depositRemaining || 0) > 0;
                      const hasRemainingRent = Number(bed.rentRemaining || 0) > 0;

                      return (
                        <tr 
                          key={bed.id || idx} 
                          className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100'}
                        >
                          <td className="py-2 px-2 text-center border-l border-slate-200 text-slate-500 font-mono text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 border-l border-slate-200 font-bold text-slate-800">
                            {bed.roomName} - سرير {bed.bedNumber}
                          </td>
                          <td className="py-2 px-2.5 border-l border-slate-200 font-bold">
                            {isOccupied ? (
                              <span className="text-slate-900">{bed.tenantName}</span>
                            ) : (
                              <span className="text-slate-400 italic">شاغر</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center border-l border-slate-200 font-mono text-[10px] text-slate-600">
                            {bed.startDate || '-'}
                          </td>
                          <td className="py-2 px-2 text-center border-l border-slate-200 font-mono font-bold text-slate-700">
                            {Number(bed.monthlyPrice || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center border-l border-slate-200 font-mono font-bold text-emerald-700 bg-emerald-50/40">
                            {Number(bed.rentPaid || 0).toLocaleString()}
                          </td>
                          <td className={`py-2 px-2 text-center border-l border-slate-200 font-mono font-bold ${
                            hasRemainingRent ? 'text-rose-600 bg-rose-50/30' : 'text-slate-400'
                          }`}>
                            {Number(bed.rentRemaining || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center border-l border-slate-200 font-mono text-slate-600">
                            {Number(bed.depositRequired || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center border-l border-slate-200 font-mono text-emerald-700">
                            {Number(bed.depositPaid || 0).toLocaleString()}
                          </td>
                          <td className={`py-2 px-2 text-center border-l border-slate-200 font-mono font-black ${
                            hasRemainingDep ? 'text-amber-700 bg-amber-50/80' : 'text-emerald-700'
                          }`}>
                            {Number(bed.depositRemaining || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {isOccupied ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                مؤجر
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                شاغر
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals Row */}
                  <tfoot>
                    <tr className="bg-slate-800 text-white font-black text-[11px] border-t-2 border-slate-900">
                      <td colSpan="4" className="py-2.5 px-3 text-center border-l border-slate-700">
                        الإجمـــــــــالي العام ({totalBeds} سراير)
                      </td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-700 font-mono">
                        {bedsList.reduce((acc, b) => acc + Number(b.monthlyPrice || 0), 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-700 font-mono text-emerald-300 bg-emerald-950/40">
                        {totalCollectedRent.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-700 font-mono text-rose-300">
                        {totalRemainingRent.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-700 font-mono">
                        {totalRequiredDeposit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-700 font-mono text-emerald-300">
                        {totalCollectedDeposit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-center border-l border-slate-700 font-mono text-amber-300 bg-amber-950/40">
                        {totalRemainingDeposit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {occupancyRate}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>تم استخراج هذا التقرير آلياً عبر سيستم متابعة شقة الكوثر</span>
              <span>صفحة 1 من 1</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
