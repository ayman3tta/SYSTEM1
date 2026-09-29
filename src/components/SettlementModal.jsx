import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';

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

  const [mode, setMode] = useState('fair');

  const stats = partnersList.map(name => getPartnerStats(name));

  // Partner color accent
  const partnerAccent = (name) => {
    if (name?.includes('محمد')) return { border: 'border-blue-500', badge: 'bg-blue-500/15 text-blue-300', amount: 'text-blue-300' };
    if (name?.includes('ايمن') || name?.includes('أيمن')) return { border: 'border-emerald-500', badge: 'bg-emerald-500/15 text-emerald-300', amount: 'text-emerald-300' };
    return { border: 'border-amber-500', badge: 'bg-amber-500/15 text-amber-300', amount: 'text-amber-300' };
  };

  const hasDeficit = remainingCapitalPool < 0;

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white leading-tight">تسوية الشركاء</h2>
          <p className="text-[11px] text-slate-400">حساب العجز وتوزيعه على الشركاء</p>
        </div>
      </div>

      {/* ── KPI Strip — 3 tiles ── */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 mb-0.5">إيداعات رأس المال</div>
          <div className="text-sm font-black text-emerald-400">{totalCapitalDeposits.toLocaleString()}<span className="text-[10px] text-slate-500 font-normal mr-0.5">ج.م</span></div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 mb-0.5">إجمالي المصروفات</div>
          <div className="text-sm font-black text-amber-400">{totalExpenses.toLocaleString()}<span className="text-[10px] text-slate-500 font-normal mr-0.5">ج.م</span></div>
        </div>
        <div className={`glass-card rounded-xl p-3 text-center border ${hasDeficit ? 'border-rose-500/30 bg-rose-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
          <div className="text-[10px] text-slate-400 mb-0.5">{hasDeficit ? 'العجز' : 'الرصيد'}</div>
          <div className={`text-sm font-black ${hasDeficit ? 'text-rose-400' : 'text-blue-400'}`}>
            {Math.abs(remainingCapitalPool).toLocaleString()}<span className="text-[10px] text-slate-500 font-normal mr-0.5">ج.م</span>
          </div>
        </div>
      </div>

      {/* ── No Deficit Notice ── */}
      {!hasDeficit && (
        <div className="flex items-center gap-2.5 glass-card px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>لا يوجد عجز حالياً — صندوق رأس المال يغطي جميع المصروفات ✔</span>
        </div>
      )}

      {/* ── Mode Toggle ── */}
      {hasDeficit && (
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs gap-1">
          <button
            onClick={() => setMode('fair')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all text-center text-[11px] ${
              mode === 'fair' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            تساوي المصاريف (1/3 لكل)
          </button>
          <button
            onClick={() => setMode('equal')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all text-center text-[11px] ${
              mode === 'equal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            تقسيم العجز (÷3)
          </button>
        </div>
      )}

      {/* ── Partner Cards ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map(s => {
          const accent = partnerAccent(s.partner);
          const required = mode === 'fair' ? s.requiredForFairExpenseShare : s.equalDeficitShare;
          return (
            <div key={s.partner} className={`glass-card p-3.5 rounded-xl border-t-4 ${accent.border}`}>
              {/* Name */}
              <div className="font-bold text-white text-sm mb-2">{s.partner}</div>

              {/* Deposited */}
              <div className="text-[10px] text-slate-500 mb-0.5">أودع</div>
              <div className={`text-sm font-black ${accent.amount} mb-2`}>
                {s.totalDeposited.toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">ج.م</span>
              </div>

              {/* Required */}
              {hasDeficit ? (
                <>
                  <div className="text-[10px] text-slate-500 mb-0.5">مطلوب إيداع</div>
                  <div className={`text-base font-black ${required > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {required > 0 ? required.toLocaleString() : '0'} <span className="text-[9px] text-slate-500 font-normal">ج.م</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[10px] text-slate-500 mb-0.5">نسبة المساهمة</div>
                  <div className="text-base font-black text-blue-300">{s.capitalSharePercentage}%</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Deficit Summary ── */}
      {hasDeficit && (
        <div className="glass-card px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-2.5 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            {mode === 'fair'
              ? `المستهدف لكل شريك: ${Math.round(fairExpenseSharePerPartner).toLocaleString()} ج.م لتغطية 1/3 من إجمالي المصروفات.`
              : `تقسيم العجز (${deficitAmount.toLocaleString()} ج.م) بالتساوي على 3 شركاء — نصيب كل واحد: ${Math.round(equalDeficitSharePerPartner).toLocaleString()} ج.م.`
            }
          </span>
        </div>
      )}

    </div>
  );
};
