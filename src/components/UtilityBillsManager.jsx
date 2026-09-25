import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  Wifi, 
  Droplets, 
  Flame, 
  Edit3, 
  Check, 
  X, 
  Users, 
  Receipt, 
  Home, 
  Info,
  CheckCircle2
} from 'lucide-react';

export const UtilityBillsManager = () => {
  const { 
    data, 
    updateMonthlyBill, 
    totalElectricityBills, 
    totalInternetBills, 
    totalTenantUtilityBills,
    totalWaterBills, 
    totalGasBills, 
    totalPartnerUtilityBills 
  } = useApp();

  const [editingId, setEditingId] = useState(null);
  const [elec, setElec] = useState(0);
  const [internet, setInternet] = useState(0);
  const [water, setWater] = useState(0);
  const [gas, setGas] = useState(0);

  const startEdit = (bill) => {
    setEditingId(bill.id);
    setElec(bill.electricity || 0);
    setInternet(bill.internet || 0);
    setWater(bill.water || 0);
    setGas(bill.gas || 0);
  };

  const saveEdit = (bill) => {
    updateMonthlyBill({
      ...bill,
      electricity: Number(elec || 0),
      internet: Number(internet || 0),
      water: Number(water || 0),
      gas: Number(gas || 0)
    });
    setEditingId(null);
  };

  const totalYearBills = (totalTenantUtilityBills || 0) + (totalPartnerUtilityBills || 0);

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            فواتير المرافق الشهرية (الكهرباء والنت / المياه والغاز)
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            تسجيل الفواتير الشهرية وتقسيمها حسب القاعدة المتفق عليها بدقة.
          </p>
        </div>
      </div>

      {/* Rules Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass-card p-3.5 rounded-2xl border-r-4 border-r-yellow-500 flex items-start gap-3 bg-gradient-to-l from-yellow-500/5 to-transparent">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 text-yellow-400 mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <strong className="text-yellow-300 font-bold">فواتير مستأجري السراير:</strong>
              <span className="bg-yellow-400/10 text-yellow-300 font-semibold px-2 py-0.5 rounded-full text-[10px] border border-yellow-500/20">
                تقسيم ÷ 8 سراير
              </span>
            </div>
            <p className="text-slate-300 leading-normal">
              تشمل <strong className="text-white">الكهرباء ⚡ والنت 🌐</strong>: يتم جمع المبلغ الإجمالي لهما شهرياً وتقسيمه على <strong className="text-yellow-300">الـ 8 سراير</strong> ليتحمله المستأجر.
            </p>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border-r-4 border-r-blue-500 flex items-start gap-3 bg-gradient-to-l from-blue-500/5 to-transparent">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-400 mt-0.5">
            <Home className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <strong className="text-blue-300 font-bold">فواتير أصحاب الشقة (علينا احنا):</strong>
              <span className="bg-blue-400/10 text-blue-300 font-semibold px-2 py-0.5 rounded-full text-[10px] border border-blue-500/20">
                ضمن المصروفات العامة
              </span>
            </div>
            <p className="text-slate-300 leading-normal">
              تشمل <strong className="text-white">المياه 💧 والغاز 🔥</strong>: تُحتسب مباشرة ضمن <strong className="text-blue-300">مصروفات الشقة</strong> وتدخل في حساب العجز والصندوق بين الشركاء.
            </p>
          </div>
        </div>
      </div>

      {/* Annual Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Tenants Utility Cards */}
        <div className="glass-card p-3 rounded-xl space-y-1 border-t-2 border-t-yellow-400">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>إجمالي الكهرباء</span>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-lg font-black text-yellow-400">{(totalElectricityBills || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span></div>
          <span className="text-[10px] text-slate-400 block">على السراير</span>
        </div>

        <div className="glass-card p-3 rounded-xl space-y-1 border-t-2 border-t-sky-400">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>إجمالي النت</span>
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg font-black text-sky-400">{(totalInternetBills || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span></div>
          <span className="text-[10px] text-slate-400 block">على السراير</span>
        </div>

        <div className="glass-card p-3 rounded-xl space-y-1 bg-yellow-500/5 border border-yellow-500/20">
          <div className="flex items-center justify-between text-yellow-400 text-[11px] font-bold">
            <span>مجموع السراير</span>
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-black text-white">{(totalTenantUtilityBills || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span></div>
          <span className="text-[10px] text-yellow-300 font-semibold block">كهرباء + نت (÷8)</span>
        </div>

        {/* Partners Utility Cards */}
        <div className="glass-card p-3 rounded-xl space-y-1 border-t-2 border-t-blue-400">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>إجمالي المياه</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-black text-blue-400">{(totalWaterBills || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span></div>
          <span className="text-[10px] text-slate-400 block">ضمن المصروفات</span>
        </div>

        <div className="glass-card p-3 rounded-xl space-y-1 border-t-2 border-t-orange-400">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>إجمالي الغاز</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-lg font-black text-orange-400">{(totalGasBills || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span></div>
          <span className="text-[10px] text-slate-400 block">ضمن المصروفات</span>
        </div>

        <div className="glass-card p-3 rounded-xl space-y-1 bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center justify-between text-blue-400 text-[11px] font-bold">
            <span>مصروفات علينا</span>
            <Home className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-black text-white">{(totalPartnerUtilityBills || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span></div>
          <span className="text-[10px] text-blue-300 font-semibold block">مياه + غاز (شركاء)</span>
        </div>
      </div>

      {/* Monthly Bills Cards View for Mobile (phone view) */}
      <div className="block md:hidden space-y-3">
        <h3 className="font-bold text-white text-sm px-1 flex items-center justify-between">
          <span>تفاصيل الأشهر وتقسيم الفواتير</span>
          <span className="text-xs text-slate-400 font-normal">8 سراير للشقة</span>
        </h3>
        {data.monthlyBills.map(bill => {
          const elecVal = Number(bill.electricity || 0);
          const netVal = Number(bill.internet || 0);
          const waterVal = Number(bill.water || 0);
          const gasVal = Number(bill.gas || 0);

          const tenantTotal = elecVal + netVal;
          const sharePerBed = (tenantTotal / 8).toFixed(1);

          const partnerTotal = waterVal + gasVal;
          const sharePerPartner = (partnerTotal / 3).toFixed(1);

          const isEditing = editingId === bill.id;

          return (
            <div key={bill.id} className="glass-card p-4 rounded-2xl space-y-3 border-r-4 border-r-amber-500">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <h4 className="font-extrabold text-white text-base">{bill.month}</h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    نصيب السرير: {sharePerBed} ج.م
                  </span>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3 text-xs pt-1">
                  {/* Edit Tenants Utility */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-2">
                    <span className="text-[11px] text-yellow-400 font-bold block">فواتير السراير (تقسيم على 8):</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-300 block mb-1">كهرباء (ج.م)</label>
                        <input
                          type="number"
                          value={elec}
                          onChange={e => setElec(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1">النت (ج.م)</label>
                        <input
                          type="number"
                          value={internet}
                          onChange={e => setInternet(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Edit Partners Utility */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 space-y-2">
                    <span className="text-[11px] text-blue-400 font-bold block">فواتير الشركاء (ضمن المصروفات):</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-300 block mb-1">مياه (ج.م)</label>
                        <input
                          type="number"
                          value={water}
                          onChange={e => setWater(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1">غاز (ج.م)</label>
                        <input
                          type="number"
                          value={gas}
                          onChange={e => setGas(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 text-slate-300 font-medium active:scale-95"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => saveEdit(bill)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold active:scale-95 shadow-md shadow-emerald-600/20"
                    >
                      حفظ الفاتورة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {/* Tenant Box */}
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        على مستأجر السرير:
                      </span>
                      <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        نصيب السرير: {sharePerBed} ج.م
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-800/80">
                      <div className="bg-slate-950/40 p-1.5 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">كهرباء</span>
                        <span className="font-bold text-yellow-300">{elecVal ? `${elecVal} ج.م` : '-'}</span>
                      </div>
                      <div className="bg-slate-950/40 p-1.5 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">نت</span>
                        <span className="font-bold text-sky-300">{netVal ? `${netVal} ج.م` : '-'}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 text-left pt-0.5">
                      إجمالي السراير: <strong className="text-white">{tenantTotal} ج.م</strong> (مقسم على 8)
                    </div>
                  </div>

                  {/* Partner Box */}
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-400 font-bold flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        علينا احنا (ضمن المصروفات):
                      </span>
                      <span className="font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded">
                        على كل شريك: {sharePerPartner} ج.م
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-800/80">
                      <div className="bg-slate-950/40 p-1.5 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">مياه</span>
                        <span className="font-bold text-blue-300">{waterVal ? `${waterVal} ج.م` : '-'}</span>
                      </div>
                      <div className="bg-slate-950/40 p-1.5 rounded-lg">
                        <span className="text-slate-400 text-[10px] block">غاز</span>
                        <span className="font-bold text-orange-300">{gasVal ? `${gasVal} ج.م` : '-'}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 text-left pt-0.5">
                      إجمالي الشركاء: <strong className="text-white">{partnerTotal} ج.م</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-400">
                      إجمالي الشهر كلياً: <strong className="text-white text-xs">{tenantTotal + partnerTotal} ج.م</strong>
                    </div>
                    <button
                      onClick={() => startEdit(bill)}
                      className="px-3 py-1 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 flex items-center gap-1 active:scale-95 text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly Bills Table for Desktop (md and up) */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-700/60">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white text-sm">جدول استهلاك المرافق وتوزيع الفواتير</h3>
            <span className="text-xs bg-slate-700/70 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
              8 سراير بالشقة • 3 شركاء
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-3">الشهر</th>
                
                {/* Group 1: Tenants Header */}
                <th className="py-3 px-3 text-center bg-yellow-500/10 text-yellow-300 border-r border-l border-slate-700/80" colSpan={4}>
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className="w-4 h-4 text-yellow-400" />
                    <span>على مستأجري السراير (تقسيم على 8 سراير)</span>
                  </div>
                </th>

                {/* Group 2: Partners Header */}
                <th className="py-3 px-3 text-center bg-blue-500/10 text-blue-300 border-l border-slate-700/80" colSpan={4}>
                  <div className="flex items-center justify-center gap-1.5">
                    <Home className="w-4 h-4 text-blue-400" />
                    <span>علينا احنا (ضمن المصروفات العامة)</span>
                  </div>
                </th>

                <th className="py-3 px-3 text-center">إجمالي الفواتير</th>
                <th className="py-3 px-3 text-center no-print">تعديل</th>
              </tr>
              <tr className="bg-slate-900/60 text-[11px] text-slate-400 border-b border-slate-800">
                <th className="py-2 px-3"></th>
                {/* Tenant Subheaders */}
                <th className="py-2 px-2 text-center text-yellow-400/90 border-r border-slate-800">كهرباء</th>
                <th className="py-2 px-2 text-center text-sky-400/90">نت</th>
                <th className="py-2 px-2 text-center text-slate-300">إجمالي السراير</th>
                <th className="py-2 px-2 text-center font-bold text-emerald-400 bg-emerald-500/10 border-l border-slate-800">نصيب السرير (÷8)</th>

                {/* Partner Subheaders */}
                <th className="py-2 px-2 text-center text-blue-400/90">مياه</th>
                <th className="py-2 px-2 text-center text-orange-400/90">غاز</th>
                <th className="py-2 px-2 text-center text-slate-300">إجمالي المصروفات</th>
                <th className="py-2 px-2 text-center font-bold text-blue-300 bg-blue-500/10 border-l border-slate-800">على كل شريك (÷3)</th>

                <th className="py-2 px-2 text-center">الكلي</th>
                <th className="py-2 px-2 text-center no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {data.monthlyBills.map(bill => {
                const elecVal = Number(bill.electricity || 0);
                const netVal = Number(bill.internet || 0);
                const waterVal = Number(bill.water || 0);
                const gasVal = Number(bill.gas || 0);

                const tenantTotal = elecVal + netVal;
                const sharePerBed = (tenantTotal / 8).toFixed(1);

                const partnerTotal = waterVal + gasVal;
                const sharePerPartner = (partnerTotal / 3).toFixed(1);

                const totalAll = tenantTotal + partnerTotal;
                const isEditing = editingId === bill.id;

                return (
                  <tr key={bill.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-white text-sm">{bill.month}</td>
                    
                    {/* Electricity */}
                    <td className="py-3 px-2 text-center font-bold text-yellow-300 border-r border-slate-800">
                      {isEditing ? (
                        <input
                          type="number"
                          value={elec}
                          onChange={e => setElec(e.target.value)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center text-xs text-white focus:outline-none"
                        />
                      ) : (
                        elecVal ? `${elecVal} ج.م` : '-'
                      )}
                    </td>

                    {/* Internet */}
                    <td className="py-3 px-2 text-center font-bold text-sky-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={internet}
                          onChange={e => setInternet(e.target.value)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center text-xs text-white focus:outline-none"
                        />
                      ) : (
                        netVal ? `${netVal} ج.م` : '-'
                      )}
                    </td>

                    {/* Tenant Total */}
                    <td className="py-3 px-2 text-center font-bold text-slate-300">
                      {tenantTotal > 0 ? `${tenantTotal} ج.م` : '-'}
                    </td>

                    {/* Share Per Bed (÷8) */}
                    <td className="py-3 px-2 text-center font-black text-emerald-400 text-sm bg-emerald-500/5 border-l border-slate-800">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                        {sharePerBed > 0 ? `${sharePerBed} ج.م` : '0 ج.م'}
                      </span>
                    </td>

                    {/* Water */}
                    <td className="py-3 px-2 text-center font-bold text-blue-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={water}
                          onChange={e => setWater(e.target.value)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center text-xs text-white focus:outline-none"
                        />
                      ) : (
                        waterVal ? `${waterVal} ج.م` : '-'
                      )}
                    </td>

                    {/* Gas */}
                    <td className="py-3 px-2 text-center font-bold text-orange-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={gas}
                          onChange={e => setGas(e.target.value)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center text-xs text-white focus:outline-none"
                        />
                      ) : (
                        gasVal ? `${gasVal} ج.م` : '-'
                      )}
                    </td>

                    {/* Partner Total */}
                    <td className="py-3 px-2 text-center font-bold text-slate-300">
                      {partnerTotal > 0 ? `${partnerTotal} ج.م` : '-'}
                    </td>

                    {/* Share per Partner (÷3) */}
                    <td className="py-3 px-2 text-center font-black text-blue-300 text-sm bg-blue-500/5 border-l border-slate-800">
                      <span className="bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">
                        {sharePerPartner > 0 ? `${sharePerPartner} ج.م` : '0 ج.م'}
                      </span>
                    </td>

                    {/* Total All */}
                    <td className="py-3 px-3 text-center font-black text-white text-sm">
                      {totalAll > 0 ? `${totalAll} ج.م` : '0'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2 text-center no-print">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => saveEdit(bill)}
                            className="p-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all"
                            title="حفظ"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-all"
                            title="إلغاء"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(bill)}
                          className="p-1.5 rounded bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                          title="تعديل الفاتورة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
