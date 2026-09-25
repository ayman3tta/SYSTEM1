import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CapitalModal } from './CapitalModal';
import { Wallet, Plus, Trash2, Edit3, ArrowUpRight, AlertTriangle } from 'lucide-react';

export const CapitalManager = () => {
  const { 
    data, 
    deleteCapitalDeposit, 
    partnersList, 
    getPartnerStats, 
    totalCapitalDeposits, 
    totalExpenses,
    remainingCapitalPool,
    deficitAmount
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositToEdit, setDepositToEdit] = useState(null);

  const partnersStats = partnersList.map(name => getPartnerStats(name));

  const handleOpenAdd = () => {
    setDepositToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dep) => {
    setDepositToEdit(dep);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            رأس المال المجمع وإيداعات الشركاء ({totalCapitalDeposits.toLocaleString()} ج.م)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            سجل كافة إيداعات رأس المال النقدية من قبل الشركاء وحساب المساهمات النسبية لكل شريك.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>تسجيل إيداع رأس مال جديد</span>
        </button>
      </div>

      {/* Deficit Alert Banner if remainingCapitalPool < 0 */}
      {remainingCapitalPool < 0 && (
        <div className="bg-rose-950/60 border border-rose-500/40 p-4 rounded-2xl flex items-center justify-between text-rose-200 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              يوجد عجز في صندوق رأس المال بمبلغ <strong>({deficitAmount.toLocaleString()} ج.م)</strong>. تقسيم العجز بالتساوي يقتضي دفع <strong>{Math.round(deficitAmount / 3).toLocaleString()} ج.م</strong> من كل شريك.
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards by Partner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {partnersStats.map(ps => {
          return (
            <div key={ps.partner} className="glass-card p-5 rounded-2xl space-y-4 border-r-4 border-r-emerald-500">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">{ps.partner}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  مساهمة {ps.capitalSharePercentage}%
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400">إجمالي إيداعات رأس المال</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {ps.totalDeposited.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ج.م</span>
                </div>
              </div>

              {remainingCapitalPool < 0 && (
                <div className="space-y-1.5 pt-3 border-t border-slate-700/60 text-xs">
                  <div className="flex justify-between text-rose-300">
                    <span className="text-slate-400">نصيبه من تقسيم العجز (÷3):</span>
                    <span className="font-bold">{ps.equalDeficitShare.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span className="text-slate-400">المطلوب للوصول لـ 1/3 المصاريف:</span>
                    <span className="font-bold">{ps.requiredForFairExpenseShare.toLocaleString()} ج.م</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Capital Log Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">سجل إيداعات رأس المال التفصيلي</h3>
          <span className="text-xs text-slate-400 font-medium">{data.capitalDeposits.length} عملية إيداع</span>
        </div>

        {/* Mobile Deposit Cards List */}
        <div className="block md:hidden space-y-2.5">
          {data.capitalDeposits.length === 0 ? (
            <div className="glass-card p-6 text-center text-slate-400 text-xs rounded-2xl">
              لا توجد إيداعات مسجلة.
            </div>
          ) : (
            data.capitalDeposits.map((dep, idx) => (
              <div key={dep.id} className="glass-card p-4 rounded-2xl flex items-center justify-between gap-3 border-r-4 border-r-emerald-500">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                    {dep.partner[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{dep.partner}</h4>
                    <span className="text-[11px] font-mono text-slate-400">{dep.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-base font-black text-emerald-400">+{Number(dep.amount).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 mr-1">ج.م</span>
                  </div>

                  <div className="flex items-center gap-1 no-print">
                    <button
                      onClick={() => handleOpenEdit(dep)}
                      className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 active:scale-95 transition-transform"
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCapitalDeposit(dep.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 active:scale-95 transition-transform"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-700/60">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700/80">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">م</th>
                  <th className="py-3 px-4">اسم الشريك</th>
                  <th className="py-3 px-4 text-left">مبلغ الإيداع (ج.م)</th>
                  <th className="py-3 px-4">تاريخ الإيداع</th>
                  <th className="py-3 px-4 text-center no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {data.capitalDeposits.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      لا توجد إيداعات مسجلة.
                    </td>
                  </tr>
                ) : (
                  data.capitalDeposits.map((dep, idx) => (
                    <tr key={dep.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white text-sm">{dep.partner}</span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400 text-left text-sm whitespace-nowrap">
                        +{Number(dep.amount).toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{dep.date}</td>
                      <td className="py-3 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(dep)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCapitalDeposit(dep.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CapitalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        depositToEdit={depositToEdit}
      />

    </div>
  );
};
