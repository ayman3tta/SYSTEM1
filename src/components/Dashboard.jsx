import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Bed, 
  Users, 
  DollarSign, 
  ArrowLeft,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

const KpiCard = ({ label, value, unit = 'ج.م', icon: Icon, iconBg, iconColor, sub, onClick, accent }) => (
  <div 
    onClick={onClick}
    className={`kpi-card ${onClick ? 'cursor-pointer active:scale-98 hover:border-white/15' : ''} animate-slide-up`}
  >
    <div className="flex items-start justify-between gap-2 mb-3">
      <p className="text-[11px] text-slate-400 font-semibold leading-tight">{label}</p>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-xl font-black ${accent || 'text-white'}`}>{value}</span>
      <span className="text-xs text-slate-500">{unit}</span>
    </div>
    {sub && <p className="text-[10px] text-slate-500 mt-1.5">{sub}</p>}
    {onClick && (
      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
        <span>عرض التفاصيل</span>
        <ChevronLeft className="w-3 h-3" />
      </div>
    )}
  </div>
);

export const Dashboard = () => {
  const { 
    totalCapitalDeposits, 
    totalExpenses, 
    remainingCapitalPool, 
    deficitAmount,
    equalDeficitSharePerPartner,
    partnersList,
    getPartnerStats,
    totalBedsCount,
    occupiedBedsCount,
    occupancyRate,
    totalExpectedMonthlyRent,
    totalCollectedDeposit,
    totalRemainingDeposit,
    totalCollectedCurrentRent,
    totalCollectedFromTenants,
    setActiveTab,
    data
  } = useApp();

  const partnersStats = partnersList.map(name => getPartnerStats(name));
  const isDeficit = remainingCapitalPool < 0;



  return (
    <div className="space-y-5 animate-slide-up">

      {/* ── Deficit Alert ── */}
      {isDeficit && (
        <div className="bg-rose-950/70 border border-rose-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="font-black text-white text-sm">⚠️ يوجد عجز في الصندوق</p>
              <p className="text-xs text-rose-300 mt-0.5">
                مبلغ العجز: <strong className="text-rose-200">{deficitAmount.toLocaleString()} ج.م</strong>
                {' '}• على كل شريك: <strong className="text-white">{Math.round(equalDeficitSharePerPartner).toLocaleString()} ج.م</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('capital')}
            className="w-full sm:w-auto shrink-0 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
          >
            + إضافة إيداع
          </button>
        </div>
      )}

      {/* ── KPI Cards Row ── */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          label="إجمالي رأس المال"
          value={totalCapitalDeposits.toLocaleString()}
          icon={Wallet}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
          accent="text-emerald-400"
          sub={`${data.capitalDeposits.length} عملية إيداع`}
          onClick={() => setActiveTab('capital')}
        />
        <KpiCard
          label="إجمالي المصروفات"
          value={totalExpenses.toLocaleString()}
          icon={TrendingDown}
          iconBg="bg-amber-500/15"
          iconColor="text-amber-400"
          accent="text-amber-400"
          sub={`${data.expenses.length} بند مصروف`}
          onClick={() => setActiveTab('expenses')}
        />
        <KpiCard
          label={isDeficit ? 'عجز الصندوق' : 'رصيد الصندوق'}
          value={Math.abs(remainingCapitalPool).toLocaleString()}
          icon={isDeficit ? TrendingDown : DollarSign}
          iconBg={isDeficit ? 'bg-rose-500/15' : 'bg-blue-500/15'}
          iconColor={isDeficit ? 'text-rose-400' : 'text-blue-400'}
          accent={isDeficit ? 'text-rose-400' : 'text-blue-400'}
          sub={isDeficit ? '⬇️ رصيد سالب' : '✅ رصيد موجب'}
        />
        <KpiCard
          label="محصّل من المستأجرين"
          value={totalCollectedFromTenants.toLocaleString()}
          icon={TrendingUp}
          iconBg="bg-purple-500/15"
          iconColor="text-purple-400"
          accent="text-purple-400"
          sub={`إشغال ${occupancyRate}% (${occupiedBedsCount}/${totalBedsCount})`}
          onClick={() => setActiveTab('beds')}
        />
      </div>

      {/* ── Beds Quick Summary ── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Bed className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="font-bold text-white text-sm">ملخص السراير</h3>
          </div>
          <button 
            onClick={() => setActiveTab('beds')}
            className="flex items-center gap-1 text-[11px] text-blue-400 font-bold"
          >
            عرض الكل
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-800">
          <div className="p-4 space-y-1">
            <p className="text-[11px] text-slate-400">الإيجار المحصّل / الشهر</p>
            <p className="text-lg font-black text-emerald-400">{totalCollectedCurrentRent.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ج.م</span></p>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-[11px] text-slate-400">الإيجار الكلي (عند اكتمال)</p>
            <p className="text-lg font-black text-white">{totalExpectedMonthlyRent.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ج.م</span></p>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-[11px] text-slate-400">التأمين المحصّل</p>
            <p className="text-lg font-black text-blue-400">{totalCollectedDeposit.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ج.م</span></p>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-[11px] text-slate-400">تأمين متبقي للتحصيل</p>
            <p className={`text-lg font-black ${totalRemainingDeposit > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {totalRemainingDeposit.toLocaleString()} <span className="text-xs text-slate-500 font-normal">ج.م</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Partners Summary ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            موقف الشركاء
          </h3>
          <button onClick={() => setActiveTab('capital')} className="text-[11px] text-blue-400 font-bold flex items-center gap-1">
            التفاصيل <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {partnersStats.map((ps, i) => {
            const colors = ['from-blue-600 to-indigo-600', 'from-emerald-600 to-teal-600', 'from-amber-500 to-orange-500'];
            return (
              <div key={ps.partner} className="glass-card p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[i]} flex items-center justify-center text-white font-black text-sm`}>
                      {ps.partner[0]}
                    </div>
                    <span className="font-bold text-white text-sm">{ps.partner}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    {ps.capitalSharePercentage}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">إجمالي الإيداعات</span>
                    <span className="font-black text-emerald-400">{ps.totalDeposited.toLocaleString()} ج.م</span>
                  </div>
                  {isDeficit && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">نصيبه من العجز</span>
                      <span className="font-bold text-rose-400">{ps.equalDeficitShare.toLocaleString()} ج.م</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* ── Settlement CTA ── */}
      <button
        onClick={() => setActiveTab('settlement')}
        className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/20 p-4 rounded-2xl active:scale-98 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-right">
            <p className="font-bold text-white text-sm">حاسبة التسوية</p>
            <p className="text-[11px] text-slate-400">تقسيم العجز وحساب نصيب كل شريك</p>
          </div>
        </div>
        <ChevronLeft className="w-5 h-5 text-slate-400 shrink-0" />
      </button>

    </div>
  );
};
