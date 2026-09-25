import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Bed, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  BarChart3,
  Calculator,
  AlertTriangle
} from 'lucide-react';

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

  // Partner calculations
  const partnersStats = partnersList.map(name => getPartnerStats(name));

  // Category classification helper
  const getCategory = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('إيجار') || name.includes('ايجار') || name.includes('تأمين') || name.includes('سمسار')) return 'إيجار وتأمين وسمسار';
    if (name.includes('مرتبة') || name.includes('سرير') || name.includes('دولاب') || name.includes('أوضة') || name.includes('اوضة') || name.includes('كرسي') || name.includes('سفرة') || name.includes('طرابيزة') || name.includes('مكتب') || name.includes('سجادة') || name.includes('سجاد') || name.includes('فرش') || name.includes('مخدات')) return 'أثاث ومفروشات';
    if (name.includes('ثلاجة') || name.includes('تلاجة') || name.includes('غسالة') || name.includes('بوتجاز') || name.includes('مروحة') || name.includes('مراوح') || name.includes('سخان') || name.includes('فلتر') || name.includes('شفاط')) return 'أجهزة كهربائية';
    if (name.includes('صيانة') || name.includes('مفاتيح') || name.includes('لمبات') || name.includes('سلك') || name.includes('دش') || name.includes('نجار') || name.includes('تصليح') || name.includes('محبس') || name.includes('عجل') || name.includes('مسامير')) return 'صيانة وتوصيلات';
    return 'خدمات ونقل وأخرى';
  };

  // Category totals
  const categoryTotals = {};
  data.expenses.forEach(e => {
    const cat = getCategory(e.item);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
  });

  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 1);

  const categoryColors = {
    'أثاث ومفروشات': 'from-blue-500 to-indigo-600',
    'أجهزة كهربائية': 'from-purple-500 to-pink-600',
    'إيجار وتأمين وسمسار': 'from-amber-500 to-orange-600',
    'صيانة وتوصيلات': 'from-emerald-500 to-teal-600',
    'خدمات ونقل وأخرى': 'from-cyan-500 to-blue-600'
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-800 to-indigo-900/60 p-4 sm:p-5 rounded-2xl border border-blue-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            مرحباً بك في لوحة تحكم الشقة 🏠
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
            جميع المصروفات تُخصم من صندوق رأس المال الكلي. تتبع إيداعات الشركاء ورصيد الصندوق وتفاصيل 8 سراير.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('settlement')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Calculator className="w-4 h-4" />
            <span>حاسبة تقسيم العجز والتسوية</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Total Capital */}
        <div className="glass-card glass-card-hover p-3.5 sm:p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">إجمالي إيداعات رأس المال</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-lg sm:text-2xl font-black text-white">{totalCapitalDeposits.toLocaleString()}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 mr-1">ج.م</span>
          </div>
          <div className="mt-2.5 pt-2 sm:mt-3 sm:pt-3 border-t border-slate-700/50 text-[10px] sm:text-xs text-slate-400 flex justify-between">
            <span className="hidden sm:inline">من إيداعات الشركاء الثلاثة</span>
            <span className="text-emerald-400 font-semibold">{data.capitalDeposits.length} عمليات</span>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="glass-card glass-card-hover p-3.5 sm:p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">إجمالي المصروفات</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-lg sm:text-2xl font-black text-amber-400">{totalExpenses.toLocaleString()}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 mr-1">ج.م</span>
          </div>
          <div className="mt-2.5 pt-2 sm:mt-3 sm:pt-3 border-t border-slate-700/50 text-[10px] sm:text-xs text-slate-400 flex justify-between">
            <span className="hidden sm:inline">عدد البنود المسجلة</span>
            <span className="text-amber-400 font-semibold">{data.expenses.length} بند</span>
          </div>
        </div>

        {/* Card 3: Remaining Capital Pool */}
        <div className="glass-card glass-card-hover p-3.5 sm:p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">رصيد الصندوق</span>
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
              remainingCapitalPool >= 0 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className={`text-lg sm:text-2xl font-black ${remainingCapitalPool >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {remainingCapitalPool.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 mr-1">ج.م</span>
          </div>
          <div className="mt-2.5 pt-2 sm:mt-3 sm:pt-3 border-t border-slate-700/50 text-[10px] sm:text-xs text-slate-400 flex justify-between">
            <span className={remainingCapitalPool >= 0 ? 'text-blue-400 font-bold' : 'text-rose-400 font-bold'}>
              {remainingCapitalPool >= 0 ? 'موجب' : `عجز ${deficitAmount.toLocaleString()} ج.م`}
            </span>
          </div>
        </div>

        {/* Card 4: Tenant Collections & Occupancy */}
        <div className="glass-card glass-card-hover p-3.5 sm:p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">محصّل المستأجرين</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-lg sm:text-2xl font-black text-purple-400">{totalCollectedFromTenants.toLocaleString()}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 mr-1">ج.م</span>
          </div>
          <div className="mt-2.5 pt-2 sm:mt-3 sm:pt-3 border-t border-slate-700/50 text-[10px] sm:text-xs text-slate-400 flex justify-between">
            <span className="text-emerald-400 font-bold">إشغال {occupancyRate}%</span>
          </div>
        </div>

      </div>

      {/* Deficit Alert Banner if remainingCapitalPool < 0 */}
      {remainingCapitalPool < 0 && (
        <div className="bg-rose-950/60 border border-rose-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">يوجد عجز في صندوق رأس المال بمبلغ ({deficitAmount.toLocaleString()} ج.م)</h4>
              <p className="text-xs text-rose-300 mt-0.5">
                تغطية العجز بالتساوي تقتضي دفع <strong className="text-white bg-rose-900/80 px-2 py-0.5 rounded border border-rose-500/40">{Math.round(equalDeficitSharePerPartner).toLocaleString()} ج.م</strong> من كل شريك ليصبح رصيد الصندوق zero.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('capital')}
            className="whitespace-nowrap bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            إضافة إيداع جديد
          </button>
        </div>
      )}

      {/* Beds & Tenant Status Summary (من فوق مباشرة تحت الأرقام) */}
      <div className="glass-card p-5 rounded-2xl space-y-4 border-t-4 border-t-indigo-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">ملخص السراير والمستأجرين لشهر سبتمبر</h3>
          </div>
          <button 
            onClick={() => setActiveTab('beds')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            إدارة كافة السراير ({occupiedBedsCount}/{totalBedsCount})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400">إجمالي عدد السراير</span>
            <div className="text-xl font-bold text-white mt-1">{totalBedsCount} سراير</div>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400">الإيجار الشهري الكلي (عند الإكتمال)</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{totalExpectedMonthlyRent.toLocaleString()} ج.م</div>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400">التأمين المحصّل / المطلوب</span>
            <div className="text-xl font-bold text-blue-400 mt-1">{totalCollectedDeposit.toLocaleString()} / {totalExpectedMonthlyRent.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400">المتبقي من التأمين لدى الطلاب</span>
            <div className="text-xl font-bold text-amber-400 mt-1">{totalRemainingDeposit.toLocaleString()} ج.م</div>
          </div>
        </div>
      </div>

      {/* Partners Capital Position Breakdown Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            موقف الشركاء وإجمالي إيداعات رأس المال
          </h3>
          <button 
            onClick={() => setActiveTab('capital')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            عرض كافة تفاصيل الإيداعات
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partnersStats.map(ps => {
            return (
              <div key={ps.partner} className="glass-card p-5 rounded-2xl space-y-3 border-t-4 border-t-emerald-500">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
                      {ps.partner[0]}
                    </div>
                    <span className="font-bold text-white text-base">{ps.partner}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 font-medium">
                    شريك مساهم
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">إجمالي إيداعات رأس المال:</span>
                    <span className="font-extrabold text-emerald-400 text-base">{ps.totalDeposited.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400">نسبة مساهمته في الصندوق:</span>
                    <span className="font-bold text-white">{ps.capitalSharePercentage}%</span>
                  </div>

                  {remainingCapitalPool < 0 && (
                    <div className="pt-2.5 border-t border-slate-700/50 space-y-1.5">
                      <div className="flex justify-between items-center text-rose-300">
                        <span className="text-slate-400">نصيبه من تقسيم العجز (÷3):</span>
                        <span className="font-bold">{ps.equalDeficitShare.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-300">
                        <span className="text-slate-400">المطلوب للوصول لـ 1/3 المصاريف:</span>
                        <span className="font-bold">{ps.requiredForFairExpenseShare.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Chart */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            توزيع المصروفات حسب فئة البند والتجهيزات
          </h4>
        </div>

        <div className="space-y-3 pt-1">
          {Object.entries(categoryTotals).map(([catName, amt]) => {
            const pct = Math.round((amt / maxCategoryAmount) * 100);
            const gradient = categoryColors[catName] || 'from-blue-500 to-indigo-600';
            return (
              <div key={catName} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{catName}</span>
                  <span className="text-white font-bold">{amt.toLocaleString()} ج.م</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700/60">
                  <div 
                    className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
