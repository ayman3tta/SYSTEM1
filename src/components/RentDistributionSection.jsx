import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Coins, CheckCircle2, AlertCircle, CloudCheck } from 'lucide-react';

export const RentDistributionSection = () => {
  const { 
    selectedMonth, 
    totalCollectedCurrentRent, 
    partnersList, 
    data, 
    updateMonthlyRentSettlement, 
    toggleOwnerRentPaid,
    toggleBuildingExpPaid,
    togglePartnerRentReceived,
    isSheetsConnected,
    syncStatus
  } = useApp();

  const monthSettlement = data?.monthlyRentSettlements?.[selectedMonth] || {};
  const ownerRent = monthSettlement.ownerRent !== undefined ? monthSettlement.ownerRent : 7000;
  const isOwnerRentPaid = Boolean(monthSettlement.ownerRentPaid);
  const buildingExpenses = monthSettlement.buildingExpenses !== undefined ? monthSettlement.buildingExpenses : 0;
  const isBuildingExpPaid = Boolean(monthSettlement.buildingExpensesPaid);
  const receivedPartners = monthSettlement.receivedPartners || {};

  const [ownerRentInput, setOwnerRentInput] = useState(String(ownerRent));
  const [buildingExpInput, setBuildingExpInput] = useState(String(buildingExpenses));

  // Sync inputs when selectedMonth changes or data updates
  useEffect(() => {
    const cur = data?.monthlyRentSettlements?.[selectedMonth] || {};
    setOwnerRentInput(cur.ownerRent !== undefined ? String(cur.ownerRent) : '7000');
    setBuildingExpInput(cur.buildingExpenses !== undefined ? String(cur.buildingExpenses) : '0');
  }, [selectedMonth, data?.monthlyRentSettlements]);

  const handleOwnerRentChange = (val) => {
    setOwnerRentInput(val);
    const num = val === '' ? 0 : Number(val);
    updateMonthlyRentSettlement(selectedMonth, { ownerRent: isNaN(num) ? 0 : num });
  };

  const handleBuildingExpChange = (val) => {
    setBuildingExpInput(val);
    const num = val === '' ? 0 : Number(val);
    updateMonthlyRentSettlement(selectedMonth, { buildingExpenses: isNaN(num) ? 0 : num });
  };

  // Calculations
  const collectedRent = Number(totalCollectedCurrentRent || 0);
  const ownerRentNum = Number(ownerRentInput || 0);
  const buildingExpNum = Number(buildingExpInput || 0);
  const totalDeductions = ownerRentNum + buildingExpNum;
  const netProfit = collectedRent - totalDeductions;

  // 3 partners share
  const sharePerPartner = netProfit > 0 ? Math.round(netProfit / 3) : 0;

  // Subtraction when partner checkbox is checked
  const partnersListSafe = partnersList || ['محمد', 'ايمن', 'احمد'];
  const receivedCount = partnersListSafe.filter(p => Boolean(receivedPartners[p])).length;
  const totalWithdrawn = netProfit > 0 ? receivedCount * sharePerPartner : 0;
  const remainingRentPool = netProfit > 0 ? Math.max(0, netProfit - totalWithdrawn) : netProfit;

  return (
    <div className="glass-card p-3.5 sm:p-4 rounded-2xl space-y-3 border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-900/60">
      
      {/* ── Title Row ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs sm:text-sm">تصفية إيجار الشهر وتوزيع الأرباح</h3>
            <p className="text-[10px] text-slate-400 font-medium">خصم إيجار المالك ومصاريف العمارة وقسمة الصافي على الـ 3 شركاء</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isSheetsConnected && (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              شيت جوجل
            </span>
          )}
          <span className="text-[10px] bg-slate-800 text-indigo-300 border border-slate-700 px-2 py-0.5 rounded-lg font-bold">
            {selectedMonth}
          </span>
        </div>
      </div>

      {/* ── 4 Main Numbers / Inputs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* 1. إيرادات السراير */}
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">إيرادات السراير (المحصلة)</span>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-1">
              {collectedRent.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ج.م</span>
            </div>
          </div>
          <span className="text-[9px] text-slate-500 mt-2">إجمالي المحصّل من السراير هذا الشهر</span>
        </div>

        {/* 2. إيجار المالك مع زرار التسديد */}
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-slate-400 font-medium">إيجار المالك (خصم)</label>
              {isOwnerRentPaid && (
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">مسدد ✓</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <input 
                type="number"
                value={ownerRentInput}
                onChange={(e) => handleOwnerRentChange(e.target.value)}
                placeholder="7000"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 shrink-0">ج.م</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleOwnerRentPaid(selectedMonth, !isOwnerRentPaid, ownerRentNum)}
            className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 truncate ${
              isOwnerRentPaid
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95'
            }`}
            title={isOwnerRentPaid ? 'تم تسديد إيجار المالك (انقر للإلغاء)' : 'تسديد إيجار المالك'}
          >
            {isOwnerRentPaid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>تم السداد للمالك ✓</span>
              </>
            ) : (
              <span>تسديد إيجار المالك</span>
            )}
          </button>
        </div>

        {/* 3. مصاريف العمارة مع زرار التسديد */}
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-slate-400 font-medium">مصاريف العمارة (خصم)</label>
              {isBuildingExpPaid && (
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">مسدد ✓</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <input 
                type="number"
                value={buildingExpInput}
                onChange={(e) => handleBuildingExpChange(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 shrink-0">ج.م</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleBuildingExpPaid(selectedMonth, !isBuildingExpPaid, buildingExpNum)}
            className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 truncate ${
              isBuildingExpPaid
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95'
            }`}
            title={isBuildingExpPaid ? 'تم تسديد مصاريف العمارة (انقر للإلغاء)' : 'تسديد مصاريف العمارة'}
          >
            {isBuildingExpPaid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>تم السداد للعمارة ✓</span>
              </>
            ) : (
              <span>تسديد مصاريف العمارة</span>
            )}
          </button>
        </div>

        {/* 4. صافي الإيرادات */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">صافي الإيراد (بعد الخصم)</span>
            <div className={`text-base sm:text-lg font-black font-mono mt-1 ${netProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
              {netProfit.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ج.م</span>
            </div>
          </div>
          <span className={`text-[9px] font-bold mt-2 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netProfit >= 0 ? 'جاهز للتوزيع على الشركاء' : 'يوجد عجز في تغطية الخصومات'}
          </span>
        </div>

      </div>

      {/* ── Partner Distribution & Checkboxes ── */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
        
        {/* Strip: Share per partner & Remaining in pool */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">نصيب كل شريك (÷ 3):</span>
            <span className="text-indigo-300 font-black font-mono text-xs">{sharePerPartner.toLocaleString()} ج.م</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">المتبقي في الإيرادات:</span>
            <span className={`font-black font-mono text-xs ${
              remainingRentPool > 0 ? 'text-amber-400' : remainingRentPool === 0 && receivedCount === 3 ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {remainingRentPool.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Warning if deficit */}
        {netProfit < 0 && (
          <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>الإيراد المحصل لم يغطي المصاريف بعد (عجز: {Math.abs(netProfit).toLocaleString()} ج.م)</span>
          </div>
        )}

        {/* 3 Partner Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {partnersListSafe.map((partner) => {
            const isReceived = Boolean(receivedPartners[partner]);
            const isDisabled = netProfit <= 0;

            return (
              <label 
                key={partner}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all select-none ${
                  isDisabled
                    ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed opacity-50'
                    : isReceived 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 cursor-pointer shadow-sm shadow-emerald-500/5' 
                    : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600 text-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={isReceived}
                    disabled={isDisabled}
                    onChange={(e) => togglePartnerRentReceived(selectedMonth, partner, e.target.checked, sharePerPartner)}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="font-bold text-xs">{partner}</span>
                </div>
                <span className={`text-[11px] font-mono font-bold ${
                  isReceived ? 'text-emerald-400' : isDisabled ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {isReceived ? '✓ استلم نصيبه' : `${sharePerPartner.toLocaleString()} ج.م`}
                </span>
              </label>
            );
          })}
        </div>

        {/* All shares received badge */}
        {netProfit > 0 && receivedCount === 3 && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم استلام وتوزيع نصيب الـ 3 شركاء بالكامل ✔</span>
          </div>
        )}

      </div>

    </div>
  );
};
