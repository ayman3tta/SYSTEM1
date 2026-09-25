import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, Wallet, ArrowRightLeft, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';

export const SettlementModal = () => {
  const { 
    partnersList, 
    getPartnerStats, 
    totalExpenses, 
    totalCapitalDeposits,
    remainingCapitalPool,
    deficitAmount,
    equalDeficitSharePerPartner,
    fairExpenseSharePerPartner
  } = useApp();

  const [mode, setMode] = useState('fair'); // 'equal' (قسمة العجز بالسوية) or 'fair' (تعديل الإيداعات لتطابق المصاريف بالضبط)

  const stats = partnersList.map(name => getPartnerStats(name));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          حاسبة تقسيم عجز صندوق رأس المال وتصفية الشركاء
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
          يتم خصم المصروفات من صندوق رأس المال الكلي. وفي حالة وجود عجز في الصندوق، يتم توضيح المبلغ المطلوب من كل شريك بدقة.
        </p>
      </div>

      {/* Main KPI Summary */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border-l-4 border-l-blue-500 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div>
          <span className="text-[11px] sm:text-xs text-slate-400">إجمالي إيداعات رأس المال</span>
          <div className="text-lg sm:text-2xl font-black text-emerald-400 mt-0.5 sm:mt-1">{totalCapitalDeposits.toLocaleString()} ج.م</div>
        </div>
        <div>
          <span className="text-[11px] sm:text-xs text-slate-400">إجمالي المصروفات والفرش</span>
          <div className="text-lg sm:text-2xl font-black text-amber-400 mt-0.5 sm:mt-1">{totalExpenses.toLocaleString()} ج.م</div>
        </div>
        <div>
          <span className="text-[11px] sm:text-xs text-slate-400">رصيد صندوق رأس المال (العجز)</span>
          <div className={`text-lg sm:text-2xl font-black mt-0.5 sm:mt-1 ${remainingCapitalPool >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            {remainingCapitalPool.toLocaleString()} ج.م
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 max-w-md mx-auto text-xs gap-1">
        <button
          onClick={() => setMode('fair')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all text-center text-[11px] sm:text-xs ${
            mode === 'fair' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          طريقة المساواة الكاملة (تغطية المصاريف 1/3 لكل شريك)
        </button>
        <button
          onClick={() => setMode('equal')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all text-center text-[11px] sm:text-xs ${
            mode === 'equal' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          تقسيم العجز بالتساوي الصرف (÷ 3)
        </button>
      </div>

      {/* Detailed Partner Breakdown Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
            {mode === 'fair' 
              ? `المبالغ المطلوبة لتغطية المصاريف بالتساوي (${Math.round(fairExpenseSharePerPartner).toLocaleString()} ج.م لكل شريك)` 
              : `تقسيم العجز الحالي (${deficitAmount.toLocaleString()} ج.م) بالتساوي على الشركاء الثلاثة`}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map(s => {
            const requiredAmount = mode === 'fair' ? s.requiredForFairExpenseShare : s.equalDeficitShare;
            return (
              <div key={s.partner} className="glass-card p-5 rounded-2xl space-y-4 border-t-4 border-t-blue-500">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <span className="font-bold text-white text-base">{s.partner}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 font-medium">
                    إيداع سابق: {s.totalDeposited.toLocaleString()} ج.م
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">إجمالي ما قام بإيداعه سابقاً:</span>
                    <span className="font-semibold text-emerald-400">{s.totalDeposited.toLocaleString()} ج.م</span>
                  </div>

                  {mode === 'fair' ? (
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">المستهدف لكل شريك (1/3 المصاريف):</span>
                      <span className="font-semibold text-white">{Math.round(fairExpenseSharePerPartner).toLocaleString()} ج.م</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">حصة الشريك في العجز (2915 ÷ 3):</span>
                      <span className="font-semibold text-white">{Math.round(equalDeficitSharePerPartner).toLocaleString()} ج.م</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
                  <span className="text-xs text-rose-300 block font-medium">المطلوب إيداعه الآن في الصندوق</span>
                  <div className="text-2xl font-black text-rose-400">
                    {requiredAmount > 0 ? `${requiredAmount.toLocaleString()} ج.م` : '0 ج.م'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Box */}
      <div className="glass-card p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ملخص إيداعات التسوية
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {mode === 'fair' ? (
            <>
              عند قيام <strong>محمد</strong> بإيداع (1,055 ج.م)، و <strong>أحمد</strong> بإيداع (1,005 ج.م)، و <strong>أيمن</strong> بإيداع (855 ج.م)، سيصل إجمالي صندوق رأس المال إلى <strong>83,565 ج.م</strong> لتغطية جميع المصروفات بالكامل وتصبح مساهمة كل شريك متساوية تماماً بنسبة (27,855 ج.م).
            </>
          ) : (
            <>
              عند قيام كل شريك من الشركاء الثلاثة بإيداع <strong>972 ج.م</strong> (تقسيم العجز بالتساوي)، سيتم سداد عجز الصندوق بالكامل ويصبح رصيد الصندوق <strong>0 ج.م</strong>.
            </>
          )}
        </p>
      </div>

    </div>
  );
};
