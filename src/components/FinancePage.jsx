import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CapitalModal } from './CapitalModal';
import {
  Wallet,
  Scale,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Sub-tab: رأس المال
───────────────────────────────────────────── */
const CapitalTab = () => {
  const {
    data,
    deleteCapitalDeposit,
    partnersList,
    getPartnerStats,
    totalCapitalDeposits,
    remainingCapitalPool,
    deficitAmount,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositToEdit, setDepositToEdit] = useState(null);
  const [showLog, setShowLog] = useState(false);

  const partnersStats = partnersList.map((name) => getPartnerStats(name));

  const handleOpenAdd = () => { setDepositToEdit(null); setIsModalOpen(true); };
  const handleOpenEdit = (dep) => { setDepositToEdit(dep); setIsModalOpen(true); };

  const partnerColor = (name) => {
    if (name?.includes('محمد')) return 'border-blue-500 bg-blue-500/10 text-blue-300';
    if (name?.includes('ايمن') || name?.includes('أيمن')) return 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
    return 'border-amber-500 bg-amber-500/10 text-amber-300';
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">إجمالي إيداعات الشركاء</p>
          <p className="text-xl font-black text-emerald-400">{totalCapitalDeposits.toLocaleString()} <span className="text-sm font-normal text-slate-500">ج.م</span></p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          إيداع جديد
        </button>
      </div>

      {/* Deficit Alert */}
      {remainingCapitalPool < 0 && (
        <div className="bg-rose-950/50 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            عجز بمبلغ <strong>{deficitAmount.toLocaleString()} ج.م</strong> — نصيب كل شريك: <strong>{Math.round(deficitAmount / 3).toLocaleString()} ج.م</strong>
          </span>
        </div>
      )}

      {/* Partner Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {partnersStats.map((ps) => {
          const colorClass = partnerColor(ps.partner).split(' ');
          return (
            <div key={ps.partner} className={`glass-card p-3 rounded-xl border-t-4 ${colorClass[0]}`}>
              <div className="font-bold text-white text-xs mb-1 truncate">{ps.partner}</div>
              <div className="text-base font-black text-emerald-400">
                {ps.totalDeposited.toLocaleString()}
                <span className="text-[9px] text-slate-400 font-normal mr-1">ج.م</span>
              </div>
              <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${partnerColor(ps.partner)}`}>
                {ps.capitalSharePercentage}%
              </div>
              {remainingCapitalPool < 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-700/60 text-[10px] text-amber-300">
                  مطلوب: <strong>{ps.requiredForFairExpenseShare.toLocaleString()}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deposits Log Collapsible */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setShowLog(!showLog)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-white"
        >
          <span>سجل الإيداعات ({data.capitalDeposits.length})</span>
          {showLog ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showLog && (
          <div className="border-t border-slate-800 divide-y divide-slate-800/60">
            {data.capitalDeposits.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-sm">لا توجد إيداعات مسجلة.</p>
            ) : (
              data.capitalDeposits.map((dep) => {
                const colorClass = partnerColor(dep.partner).split(' ');
                return (
                  <div key={dep.id} className={`flex items-center gap-3 px-4 py-3 border-r-4 ${colorClass[0]}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${partnerColor(dep.partner)}`}>
                      {dep.partner[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-xs">{dep.partner}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{dep.date}</div>
                    </div>
                    <div className="text-sm font-black text-emerald-400 whitespace-nowrap">
                      +{Number(dep.amount).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(dep)} className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 flex items-center justify-center">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteCapitalDeposit(dep.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <CapitalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} depositToEdit={depositToEdit} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   Sub-tab: التسوية
───────────────────────────────────────────── */
const SettlementTab = () => {
  const {
    partnersList,
    getPartnerStats,
    totalExpenses,
    totalCapitalDeposits,
    remainingCapitalPool,
    deficitAmount,
    equalDeficitSharePerPartner,
    fairExpenseSharePerPartner,
  } = useApp();

  const [mode, setMode] = useState('fair');
  const stats = partnersList.map((name) => getPartnerStats(name));

  const partnerAccent = (name) => {
    if (name?.includes('محمد')) return { border: 'border-blue-500', badge: 'bg-blue-500/15 text-blue-300', amount: 'text-blue-300' };
    if (name?.includes('ايمن') || name?.includes('أيمن')) return { border: 'border-emerald-500', badge: 'bg-emerald-500/15 text-emerald-300', amount: 'text-emerald-300' };
    return { border: 'border-amber-500', badge: 'bg-amber-500/15 text-amber-300', amount: 'text-amber-300' };
  };

  const hasDeficit = remainingCapitalPool < 0;

  return (
    <div className="space-y-4">

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2">
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

      {/* No Deficit Notice */}
      {!hasDeficit && (
        <div className="flex items-center gap-2.5 glass-card px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>لا يوجد عجز — صندوق رأس المال يغطي جميع المصروفات ✔</span>
        </div>
      )}

      {/* Mode Toggle */}
      {hasDeficit && (
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs gap-1">
          <button
            onClick={() => setMode('fair')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all text-center text-[11px] ${mode === 'fair' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            تساوي المصاريف (1/3 لكل)
          </button>
          <button
            onClick={() => setMode('equal')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all text-center text-[11px] ${mode === 'equal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            تقسيم العجز (÷3)
          </button>
        </div>
      )}

      {/* Partner Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => {
          const accent = partnerAccent(s.partner);
          const required = mode === 'fair' ? s.requiredForFairExpenseShare : s.equalDeficitShare;
          return (
            <div key={s.partner} className={`glass-card p-3.5 rounded-xl border-t-4 ${accent.border}`}>
              <div className="font-bold text-white text-xs mb-2 truncate">{s.partner}</div>
              <div className="text-[10px] text-slate-500 mb-0.5">أودع</div>
              <div className={`text-sm font-black ${accent.amount} mb-2`}>
                {s.totalDeposited.toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">ج.م</span>
              </div>
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

      {/* Deficit Summary */}
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

/* ─────────────────────────────────────────────
   Main Finance Page (combined)
───────────────────────────────────────────── */
export const FinancePage = () => {
  const { financeSubTab, setFinanceSubTab } = useApp();

  return (
    <div className="space-y-4">

      {/* Page Header */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white leading-tight">المالية والتسوية</h2>
          <p className="text-[11px] text-slate-400">رأس المال · الإيداعات · توزيع الأرباح</p>
        </div>
      </div>

      {/* Sub-tab switcher — pill style */}
      <div className="flex bg-slate-800/70 p-1 rounded-2xl gap-1 border border-slate-700/50">
        <button
          onClick={() => setFinanceSubTab('capital')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            financeSubTab === 'capital'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          رأس المال
        </button>
        <button
          onClick={() => setFinanceSubTab('settlement')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            financeSubTab === 'settlement'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          التسوية
        </button>
      </div>

      {/* Sub-tab content */}
      {financeSubTab === 'settlement' ? <SettlementTab /> : <CapitalTab />}

    </div>
  );
};
