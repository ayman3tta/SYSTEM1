import React from 'react';
import { useApp, availableMonthsList } from '../context/AppContext';
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
  ChevronLeft,
  Calendar,
  Layers,
  Activity,
  FileText,
  Clock
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
    manualExpensesTotal,
    totalPartnerUtilityBills,
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
    totalRemainingCurrentRent,
    totalCollectedFromTenants,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
    setFinanceSubTab,
    setMonthlyReportOpen,
    data
  } = useApp();

  const partnersStats = partnersList.map(name => getPartnerStats(name));
  const isDeficit = remainingCapitalPool < 0;

  // Cash Flow & Collection Metrics for selectedMonth
  const rentCollectionPercent = totalExpectedMonthlyRent > 0 
    ? Math.round((totalCollectedCurrentRent / totalExpectedMonthlyRent) * 100) 
    : 0;

  const currentMonthBeds = data.beds.filter(b => b.month === selectedMonth);
  const paidBedsCount = currentMonthBeds.filter(b => b.status === 'مؤجر' && (b.paymentStatus === 'مدفوع' || Number(b.rentPaid || 0) >= Number(b.monthlyPrice || 0))).length;
  const pendingBedsCount = currentMonthBeds.filter(b => b.status === 'مؤجر' && Number(b.rentPaid || 0) < Number(b.monthlyPrice || 0)).length;
  const vacantBedsCount = currentMonthBeds.filter(b => b.status !== 'مؤجر').length;

  const currentMonthBill = data.monthlyBills.find(b => b.month === selectedMonth);
  const partnerMonthBills = Number(currentMonthBill?.water || 0) + Number(currentMonthBill?.gas || 0);
  const netMonthlyCashFlow = totalCollectedCurrentRent - partnerMonthBills;

  // Previous Month Calculations
  const currentMonthIdx = availableMonthsList.indexOf(selectedMonth);
  const prevMonthName = currentMonthIdx > 0 ? availableMonthsList[currentMonthIdx - 1] : null;

  const prevMonthBeds = prevMonthName ? data.beds.filter(b => b.month === prevMonthName) : [];
  const hasPrevMonthData = prevMonthBeds.length > 0;
  const prevBedsCount = prevMonthBeds.length;
  const prevOccupiedCount = prevMonthBeds.filter(b => b.status === 'مؤجر').length;
  const prevOccupancyRate = prevBedsCount > 0 ? Math.round((prevOccupiedCount / prevBedsCount) * 100) : 0;
  const prevRentCollected = prevMonthBeds.reduce((acc, b) => acc + Number(b.rentPaid || 0), 0);
  const prevDepositCollected = prevMonthBeds.reduce((acc, b) => acc + Number(b.depositPaid || 0), 0);
  const prevTotalCollected = prevRentCollected + prevDepositCollected;
  const prevExpectedRent = prevMonthBeds.reduce((acc, b) => acc + Number(b.monthlyPrice || 0), 0);



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
            onClick={() => {
              setFinanceSubTab('capital');
              setActiveTab('finance');
            }}
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
          onClick={() => {
            setFinanceSubTab('capital');
            setActiveTab('finance');
          }}
        />
        <KpiCard
          label="إجمالي المصروفات"
          value={totalExpenses.toLocaleString()}
          icon={TrendingDown}
          iconBg="bg-amber-500/15"
          iconColor="text-amber-400"
          accent="text-amber-400"
          sub={totalPartnerUtilityBills > 0 
            ? `${(manualExpensesTotal || 0).toLocaleString()} تجهيزات + ${(totalPartnerUtilityBills || 0).toLocaleString()} مياه وغاز` 
            : `${data.expenses.length} بند مصروف`}
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

      {/* ── Cash Flow & Collection Forecast Indicator ── */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
        
        {/* Header with Monthly Report CTA */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">مؤشر التدفق المالي والتحصيل</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">{selectedMonth}</span>
              </div>
              <p className="text-[11px] text-slate-400">متابعة الفارق بين المستهدف والمحصل اللحظي</p>
            </div>
          </div>

          <button
            onClick={() => setMonthlyReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all mr-auto sm:mr-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>التقرير المالي الشهري</span>
          </button>
        </div>

        {/* Progress Bar Container */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400">نسبة تحصيل الإيجارات للشهر</span>
            <span className="font-black text-emerald-400 text-sm">{rentCollectionPercent}%</span>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              style={{ width: `${Math.min(100, Math.max(0, rentCollectionPercent))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
            <span>تم تحصيل: <strong className="text-emerald-400">{totalCollectedCurrentRent.toLocaleString()} ج.م</strong></span>
            <span>المستهدف الكامل: <strong className="text-white">{totalExpectedMonthlyRent.toLocaleString()} ج.م</strong></span>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-slate-900/50 p-2.5 sm:p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">المستهدف الشهري</span>
            <div className="text-sm sm:text-base font-black text-white">
              {totalExpectedMonthlyRent.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-500">ج.م</span>
          </div>

          <div className="bg-slate-900/50 p-2.5 sm:p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">المحصل الفعلي</span>
            <div className="text-sm sm:text-base font-black text-emerald-400">
              {totalCollectedCurrentRent.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-500">ج.م كاش</span>
          </div>

          <div className="bg-slate-900/50 p-2.5 sm:p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">المتبقي بالخارج</span>
            <div className={`text-sm sm:text-base font-black ${totalRemainingCurrentRent > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
              {totalRemainingCurrentRent.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-500">معلق / متأخر</span>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            {paidBedsCount} سرير مسدد
          </span>
          {pendingBedsCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3 h-3" />
              {pendingBedsCount} سرير معلق
            </span>
          )}
          {vacantBedsCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              <Bed className="w-3 h-3" />
              {vacantBedsCount} شاغر
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mr-auto">
            <TrendingUp className="w-3 h-3" />
            صافي تدفق الشهر: {netMonthlyCashFlow.toLocaleString()} ج.م
          </span>
        </div>

      </div>

      {/* ── Beds Quick Summary ── */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">

        {/* Current Month */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Bed className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">إيجارات {selectedMonth}</span>
                <span className="mr-2 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">الشهر الحالي</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('beds')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              إدارة <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/60 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 mb-1">إيجار محصّل</p>
              <p className={`text-base font-black ${totalCollectedCurrentRent > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {totalCollectedCurrentRent.toLocaleString()}
                <span className="text-[10px] font-normal text-slate-500 mr-1">ج.م</span>
              </p>
              {totalCollectedCurrentRent === 0 && (
                <p className="text-[9px] text-slate-600 mt-0.5">في انتظار التحصيل</p>
              )}
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 mb-1">الإيجار المطلوب</p>
              <p className="text-base font-black text-white">
                {totalExpectedMonthlyRent.toLocaleString()}
                <span className="text-[10px] font-normal text-slate-500 mr-1">ج.م</span>
              </p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 mb-1">تأمين محصّل</p>
              <p className="text-base font-black text-blue-400">
                {totalCollectedDeposit.toLocaleString()}
                <span className="text-[10px] font-normal text-slate-500 mr-1">ج.م</span>
              </p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 mb-1">تأمين متبقي</p>
              <p className={`text-base font-black ${totalRemainingDeposit > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                {totalRemainingDeposit.toLocaleString()}
                <span className="text-[10px] font-normal text-slate-500 mr-1">ج.م</span>
              </p>
            </div>
          </div>
        </div>

        {/* Previous Month — only if data exists */}
        {hasPrevMonthData && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-400">{prevMonthName}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">مؤرشف</span>
              </div>
              <button
                onClick={() => { setSelectedMonth(prevMonthName); setActiveTab('beds'); }}
                className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-0.5 transition-colors"
              >
                عرض <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-[9px] text-slate-500 mb-0.5">إجمالي محصّل</p>
                <p className="text-sm font-black text-emerald-400">{prevTotalCollected.toLocaleString()}</p>
                <p className="text-[9px] text-slate-600">ج.م</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-slate-500 mb-0.5">إيجار</p>
                <p className="text-sm font-black text-white">{prevRentCollected.toLocaleString()}</p>
                <p className="text-[9px] text-slate-600">ج.م</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-slate-500 mb-0.5">إشغال</p>
                <p className="text-sm font-black text-purple-400">{prevOccupancyRate}%</p>
                <p className="text-[9px] text-slate-600">{prevOccupiedCount}/{prevBedsCount} سرير</p>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* ── Partners Summary ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            موقف الشركاء
          </h3>
          <button onClick={() => setActiveTab('finance')} className="text-[11px] text-blue-400 font-bold flex items-center gap-1">
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
        onClick={() => {
          setFinanceSubTab('settlement');
          setActiveTab('finance');
        }}
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
