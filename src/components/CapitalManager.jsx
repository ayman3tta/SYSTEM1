import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CapitalModal } from './CapitalModal';
import { Wallet, Plus, Trash2, Edit3, AlertTriangle } from 'lucide-react';

export const CapitalManager = () => {
  const { 
    data, 
    deleteCapitalDeposit, 
    partnersList, 
    getPartnerStats, 
    totalCapitalDeposits, 
    remainingCapitalPool,
    deficitAmount
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositToEdit, setDepositToEdit] = useState(null);

  const partnersStats = partnersList.map(name => getPartnerStats(name));

  const handleOpenAdd = () => { setDepositToEdit(null); setIsModalOpen(true); };
  const handleOpenEdit = (dep) => { setDepositToEdit(dep); setIsModalOpen(true); };

  // Partner color accent
  const partnerColor = (name) => {
    if (name?.includes('محمد')) return 'border-blue-500 bg-blue-500/10 text-blue-300';
    if (name?.includes('ايمن') || name?.includes('أيمن')) return 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
    return 'border-amber-500 bg-amber-500/10 text-amber-300';
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">رأس المال</h2>
            <p className="text-[11px] text-slate-400">{totalCapitalDeposits.toLocaleString()} ج.م إجمالي الإيداعات</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          إيداع جديد
        </button>
      </div>

      {/* ── Deficit Alert ── */}
      {remainingCapitalPool < 0 && (
        <div className="bg-rose-950/50 border border-rose-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            عجز بمبلغ <strong>{deficitAmount.toLocaleString()} ج.م</strong> — نصيب كل شريك: <strong>{Math.round(deficitAmount / 3).toLocaleString()} ج.م</strong>
          </span>
        </div>
      )}

      {/* ── Partner Summary Cards ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {partnersStats.map(ps => (
          <div key={ps.partner} className={`glass-card p-3.5 rounded-xl border-r-4 ${partnerColor(ps.partner).split(' ')[0]}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white text-sm">{ps.partner}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${partnerColor(ps.partner)}`}>
                {ps.capitalSharePercentage}%
              </span>
            </div>
            <div className="text-lg font-black text-emerald-400">
              {ps.totalDeposited.toLocaleString()}
              <span className="text-[10px] text-slate-400 font-normal mr-1">ج.م</span>
            </div>
            {remainingCapitalPool < 0 && (
              <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-amber-300 space-y-0.5">
                <div>مطلوب: <strong>{ps.requiredForFairExpenseShare.toLocaleString()} ج.م</strong></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Deposits Log ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">سجل الإيداعات</h3>
          <span className="text-[11px] text-slate-400">{data.capitalDeposits.length} عملية</span>
        </div>

        {data.capitalDeposits.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-sm rounded-xl">
            لا توجد إيداعات مسجلة.
          </div>
        ) : (
          <div className="space-y-2">
            {data.capitalDeposits.map((dep, idx) => (
              <div
                key={dep.id}
                className={`glass-card px-4 py-3 rounded-xl flex items-center gap-3 border-r-4 ${partnerColor(dep.partner).split(' ')[0]}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${partnerColor(dep.partner)}`}>
                  {dep.partner[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{dep.partner}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{dep.date}</div>
                </div>

                {/* Amount */}
                <div className="text-base font-black text-emerald-400 whitespace-nowrap">
                  +{Number(dep.amount).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 no-print">
                  <button
                    onClick={() => handleOpenEdit(dep)}
                    className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCapitalDeposit(dep.id)}
                    className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CapitalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} depositToEdit={depositToEdit} />
    </div>
  );
};
