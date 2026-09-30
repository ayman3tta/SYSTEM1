import React, { useState, useMemo } from 'react';
import { useApp, availableMonthsList } from '../context/AppContext';
import {
  X,
  Printer,
  Copy,
  Check,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Bed,
  Zap,
  Droplets,
  Flame,
  Wifi,
  ShieldCheck,
  FileText,
  Share2
} from 'lucide-react';

export const MonthlyReportModal = ({ isOpen, onClose }) => {
  const {
    data,
    selectedMonth,
    partnersList,
    showToast
  } = useApp();

  const [activeReportMonth, setActiveReportMonth] = useState(selectedMonth || 'أكتوبر 2026');
  const [copied, setCopied] = useState(false);

  // Sync with selectedMonth when modal opens
  React.useEffect(() => {
    if (isOpen && selectedMonth) {
      setActiveReportMonth(selectedMonth);
    }
  }, [isOpen, selectedMonth]);

  // Beds data for the active report month
  const monthBeds = useMemo(() => {
    return data.beds.filter(b => b.month === activeReportMonth);
  }, [data.beds, activeReportMonth]);

  const totalBeds = monthBeds.length;
  const occupiedBeds = monthBeds.filter(b => b.status === 'مؤجر');
  const occupiedCount = occupiedBeds.length;
  const vacantCount = totalBeds - occupiedCount;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedCount / totalBeds) * 100) : 0;

  // Rent & Deposit calculations
  const totalExpectedRent = occupiedBeds.reduce((sum, b) => sum + Number(b.monthlyPrice || 0), 0);
  const totalCollectedRent = occupiedBeds.reduce((sum, b) => sum + Number(b.rentPaid || 0), 0);
  const totalRemainingRent = Math.max(0, totalExpectedRent - totalCollectedRent);
  const rentCollectionRate = totalExpectedRent > 0 ? Math.round((totalCollectedRent / totalExpectedRent) * 100) : 0;

  const totalCollectedDeposit = monthBeds.reduce((sum, b) => sum + Number(b.depositPaid || 0), 0);
  const totalRequiredDeposit = occupiedBeds.reduce((sum, b) => sum + Number(b.depositPrice || 0), 0);
  const totalRemainingDeposit = Math.max(0, totalRequiredDeposit - totalCollectedDeposit);

  // Monthly Utility Bill
  const monthlyBill = useMemo(() => {
    return data.monthlyBills.find(b => b.month === activeReportMonth) || {
      electricity: 0,
      internet: 0,
      water: 0,
      gas: 0
    };
  }, [data.monthlyBills, activeReportMonth]);

  const tenantBills = Number(monthlyBill.electricity || 0) + Number(monthlyBill.internet || 0);
  const partnerBills = Number(monthlyBill.water || 0) + Number(monthlyBill.gas || 0);
  const totalBills = tenantBills + partnerBills;

  // Monthly Expenses (filtered by item or notes mentioning month if any)
  const monthExpenses = useMemo(() => {
    return data.expenses.filter(exp => {
      const text = `${exp.item || ''} ${exp.notes || ''}`.toLowerCase();
      // Look for month keywords e.g. "شهر 9" / "سبتمبر"
      if (activeReportMonth.includes('سبتمبر') && (text.includes('شهر 9') || text.includes('سبتمبر'))) return true;
      if (activeReportMonth.includes('أكتوبر') && (text.includes('شهر 10') || text.includes('اكتوبر') || text.includes('أكتوبر'))) return true;
      if (activeReportMonth.includes('نوفمبر') && (text.includes('شهر 11') || text.includes('نوفمبر'))) return true;
      return false;
    });
  }, [data.expenses, activeReportMonth]);

  const directExpensesTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Net Operational Profit / Flow
  const totalPartnerExpenses = partnerBills + directExpensesTotal;
  const netOperationalFlow = totalCollectedRent - totalPartnerExpenses;
  const partnerShare = Math.round(netOperationalFlow / 3);

  // WhatsApp Message Generator
  const generateWhatsAppSummary = () => {
    return `📊 *تقرير الموقف المالي - شقة الكوثر* 📊
🗓️ *الشهر:* ${activeReportMonth}
⏱️ *تاريخ الاستخراج:* ${new Date().toLocaleDateString('ar-EG')}
━━━━━━━━━━━━━━━━━━━━━
🛏️ *نسبة الإشغال:* ${occupancyRate}% (${occupiedCount}/${totalBeds} سرير)
• سراير مؤجرة: ${occupiedCount} | شاغرة: ${vacantCount}

💰 *حركة الإيجارات:*
• المستهدف: ${totalExpectedRent.toLocaleString()} ج.م
• المحصل فعلياً: ${totalCollectedRent.toLocaleString()} ج.م (نسبة ${rentCollectionRate}%)
• المتبقي بالخارج: ${totalRemainingRent.toLocaleString()} ج.م
• تأمينات محصلة: ${totalCollectedDeposit.toLocaleString()} ج.م

⚡ *فواتير ومصاريف الشهر:*
• كهرباء ونت (على السراير): ${tenantBills.toLocaleString()} ج.م
• مياه وغاز (على الشركاء): ${partnerBills.toLocaleString()} ج.م
${directExpensesTotal > 0 ? `• مصاريف إضافية: ${directExpensesTotal.toLocaleString()} ج.م\n` : ''}• إجمالي التزامات الشركاء: ${totalPartnerExpenses.toLocaleString()} ج.م
━━━━━━━━━━━━━━━━━━━━━
💵 *صافي الفائض التشغيلي:* ${netOperationalFlow.toLocaleString()} ج.م
👥 *نصيب كل شريك (÷3):* ${partnerShare.toLocaleString()} ج.م
━━━━━━━━━━━━━━━━━━━━━
✅ *تفاصيل تحصيل السراير:*
${occupiedBeds.map(b => `• ${b.roomName} - سرير ${b.bedNumber} (${b.tenantName}): ${Number(b.rentPaid || 0).toLocaleString()}/${Number(b.monthlyPrice || 0)} ج.م [${b.paymentStatus || 'معلق'}]`).join('\n')}

📌 *تم استخراج التقرير آلياً من سيستم إدارة الشقة*`;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppSummary();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        showToast('تم نسخ التقرير لمشاركته على واتساب بنجاح! 📋');
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      showToast('تم نسخ التقرير لمشاركته على واتساب بنجاح! 📋');
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      alert('تعذر النسخ التلقائي، يمكنك تحديد النص ونسخه يدوياً.');
    }
    document.body.removeChild(textArea);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-slide-up">
        
        {/* ── Modal Header (No Print) ── */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">التقرير المالي والتشغيلي</h2>
              <p className="text-xs text-slate-400">ملخص إيرادات، فواتير، وتوزيع الأرباح</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Month Picker in Modal */}
            <div className="relative">
              <select
                value={activeReportMonth}
                onChange={(e) => setActiveReportMonth(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs font-bold text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none pl-8"
              >
                {availableMonthsList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Printable Content Body ── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-100 print:text-black print:p-0 print:overflow-visible">
          
          {/* Print Only Header */}
          <div className="hidden print:block border-b-2 border-slate-300 pb-4 mb-4 text-center">
            <h1 className="text-2xl font-black mb-1">تقرير الموقف المالي والتشغيلي - شقة الكوثر</h1>
            <p className="text-sm text-slate-600">
              شهر التقرير: <strong>{activeReportMonth}</strong> | تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}
            </p>
          </div>

          {/* ── 1. Top Executive KPIs ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="glass-card p-3 sm:p-4 rounded-2xl border-t-4 border-t-emerald-500">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">إجمالي المحصل</span>
              <div className="text-lg sm:text-xl font-black text-emerald-400">
                {(totalCollectedRent + totalCollectedDeposit).toLocaleString()}
                <span className="text-[10px] text-slate-500 font-normal mr-1">ج.م</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {totalCollectedRent.toLocaleString()} إيجار + {totalCollectedDeposit.toLocaleString()} تأمين
              </span>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-2xl border-t-4 border-t-amber-500">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">فواتير ومصاريف الشركاء</span>
              <div className="text-lg sm:text-xl font-black text-amber-400">
                {totalPartnerExpenses.toLocaleString()}
                <span className="text-[10px] text-slate-500 font-normal mr-1">ج.م</span>
              </div>
              <span className="text-[10px] text-slate-500">مياه وغاز + مصاريف دورية</span>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-2xl border-t-4 border-t-blue-500">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">صافي الفائض التشغيلي</span>
              <div className={`text-lg sm:text-xl font-black ${netOperationalFlow >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                {netOperationalFlow.toLocaleString()}
                <span className="text-[10px] text-slate-500 font-normal mr-1">ج.م</span>
              </div>
              <span className="text-[10px] text-slate-500">
                لكل شريك (÷3): <strong className="text-white">{partnerShare.toLocaleString()} ج.م</strong>
              </span>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-2xl border-t-4 border-t-purple-500">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">نسبة الإشغال</span>
              <div className="text-lg sm:text-xl font-black text-purple-400">
                {occupancyRate}%
              </div>
              <span className="text-[10px] text-slate-500">
                {occupiedCount} مؤجر من إجمالي {totalBeds} سرير
              </span>
            </div>
          </div>

          {/* ── 2. Beds & Tenants Breakdown Table ── */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">كشف حساب السراير والمستأجرين ({activeReportMonth})</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                تحصيل: <strong className="text-emerald-400">{rentCollectionRate}%</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800/60 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5 sm:p-3">الغرفة والسرير</th>
                    <th className="p-2.5 sm:p-3">المستأجر</th>
                    <th className="p-2.5 sm:p-3">الإيجار المطلوب</th>
                    <th className="p-2.5 sm:p-3">المحصل</th>
                    <th className="p-2.5 sm:p-3">المتبقي</th>
                    <th className="p-2.5 sm:p-3">الحالة</th>
                    <th className="p-2.5 sm:p-3">التأمين</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {monthBeds.map(bed => {
                    const isOccupied = bed.status === 'مؤجر';
                    const remaining = Math.max(0, Number(bed.monthlyPrice || 0) - Number(bed.rentPaid || 0));
                    return (
                      <tr key={bed.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-2.5 sm:p-3 font-semibold text-white whitespace-nowrap">
                          {bed.roomName} - سرير {bed.bedNumber}
                        </td>
                        <td className="p-2.5 sm:p-3">
                          {isOccupied ? (
                            <span className="font-bold text-white">{bed.tenantName || 'ساكن'}</span>
                          ) : (
                            <span className="text-slate-500 italic">شاغر (فارغ)</span>
                          )}
                        </td>
                        <td className="p-2.5 sm:p-3 font-bold text-slate-300">
                          {Number(bed.monthlyPrice || 0).toLocaleString()} ج.م
                        </td>
                        <td className="p-2.5 sm:p-3 font-bold text-emerald-400">
                          {Number(bed.rentPaid || 0).toLocaleString()} ج.م
                        </td>
                        <td className="p-2.5 sm:p-3 font-bold text-amber-400">
                          {remaining > 0 ? `${remaining.toLocaleString()} ج.م` : '—'}
                        </td>
                        <td className="p-2.5 sm:p-3">
                          {!isOccupied ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">فارغ</span>
                          ) : bed.paymentStatus === 'مدفوع' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">مدفوع</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30">معلق</span>
                          )}
                        </td>
                        <td className="p-2.5 sm:p-3 font-medium text-blue-400">
                          {Number(bed.depositPaid || 0) > 0 ? `${Number(bed.depositPaid || 0).toLocaleString()} ج.م` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-800/80 font-bold text-white border-t border-slate-700">
                  <tr>
                    <td colSpan={2} className="p-3 text-right">الإجمالي</td>
                    <td className="p-3 text-slate-200">{totalExpectedRent.toLocaleString()} ج.م</td>
                    <td className="p-3 text-emerald-400">{totalCollectedRent.toLocaleString()} ج.م</td>
                    <td className="p-3 text-amber-400">{totalRemainingRent.toLocaleString()} ج.م</td>
                    <td className="p-3 text-slate-400">{occupiedCount}/{totalBeds} مؤجر</td>
                    <td className="p-3 text-blue-400">{totalCollectedDeposit.toLocaleString()} ج.م</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── 3. Utilities Breakdown & Partner Distribution ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Utilities */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">فواتير الخدمات لشهر {activeReportMonth}</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-800/40 p-2.5 rounded-xl">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" /> كهرباء (على السراير)
                  </span>
                  <span className="font-bold text-yellow-400">{Number(monthlyBill.electricity || 0).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/40 p-2.5 rounded-xl">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-sky-400" /> إنترنت (على السراير)
                  </span>
                  <span className="font-bold text-sky-400">{Number(monthlyBill.internet || 0).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/40 p-2.5 rounded-xl">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" /> مياه (على الشركاء)
                  </span>
                  <span className="font-bold text-blue-400">{Number(monthlyBill.water || 0).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/40 p-2.5 rounded-xl">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> غاز (على الشركاء)
                  </span>
                  <span className="font-bold text-orange-400">{Number(monthlyBill.gas || 0).toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>

            {/* Partners Profit Sharing */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">توزيع الشركاء لشهر {activeReportMonth}</h4>
              </div>
              <div className="space-y-2">
                {partnersList.map((partner, idx) => {
                  const colors = ['border-blue-500 bg-blue-500/10 text-blue-300', 'border-emerald-500 bg-emerald-500/10 text-emerald-300', 'border-amber-500 bg-amber-500/10 text-amber-300'];
                  return (
                    <div key={partner} className={`flex items-center justify-between p-2.5 rounded-xl border ${colors[idx % colors.length]}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
                          {partner[0]}
                        </div>
                        <span className="font-bold text-xs">{partner}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block leading-none">نصيبه (1/3)</span>
                        <span className="text-sm font-black text-white">{partnerShare.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* ── Modal Footer Action Bar (No Print) ── */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 no-print">
          <div className="flex items-center gap-2">
            {/* Copy to WhatsApp Button */}
            <button
              onClick={handleCopyWhatsApp}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg ${
                copied 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                  : 'bg-emerald-700/80 hover:bg-emerald-600 text-white shadow-emerald-700/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ للواتساب!' : 'نسخ ملخص الواتساب'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
