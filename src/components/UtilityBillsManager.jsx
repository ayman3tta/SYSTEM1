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
  Home
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

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">الفواتير الشهرية</h2>
            <p className="text-[11px] text-slate-400">كهرباء · نت · مياه · غاز</p>
          </div>
        </div>
      </div>

      {/* ── Rules Summary — 2 compact cards ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass-card px-3 py-2.5 rounded-xl border-r-4 border-r-yellow-500">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[11px] font-bold text-yellow-300">على السراير (÷8)</span>
          </div>
          <div className="text-[10px] text-slate-400">كهرباء ⚡ + نت 🌐</div>
        </div>
        <div className="glass-card px-3 py-2.5 rounded-xl border-r-4 border-r-blue-500">
          <div className="flex items-center gap-1.5 mb-1">
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-bold text-blue-300">علينا احنا</span>
          </div>
          <div className="text-[10px] text-slate-400">مياه 💧 + غاز 🔥 (ضمن المصروفات)</div>
        </div>
      </div>

      {/* ── Totals Strip — 4 mini tiles ── */}
      <div className="grid grid-cols-4 gap-2">
        <div className="glass-card rounded-xl p-2.5 text-center border-t-2 border-t-yellow-400">
          <Zap className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-1" />
          <div className="text-xs font-black text-yellow-400">{(totalElectricityBills || 0).toLocaleString()}</div>
          <div className="text-[9px] text-slate-500">كهرباء</div>
        </div>
        <div className="glass-card rounded-xl p-2.5 text-center border-t-2 border-t-sky-400">
          <Wifi className="w-3.5 h-3.5 text-sky-400 mx-auto mb-1" />
          <div className="text-xs font-black text-sky-400">{(totalInternetBills || 0).toLocaleString()}</div>
          <div className="text-[9px] text-slate-500">نت</div>
        </div>
        <div className="glass-card rounded-xl p-2.5 text-center border-t-2 border-t-blue-400">
          <Droplets className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
          <div className="text-xs font-black text-blue-400">{(totalWaterBills || 0).toLocaleString()}</div>
          <div className="text-[9px] text-slate-500">مياه</div>
        </div>
        <div className="glass-card rounded-xl p-2.5 text-center border-t-2 border-t-orange-400">
          <Flame className="w-3.5 h-3.5 text-orange-400 mx-auto mb-1" />
          <div className="text-xs font-black text-orange-400">{(totalGasBills || 0).toLocaleString()}</div>
          <div className="text-[9px] text-slate-500">غاز</div>
        </div>
      </div>

      {/* ── Monthly Bills List ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">تفاصيل الأشهر</h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-yellow-300 font-bold">{(totalTenantUtilityBills || 0).toLocaleString()} ج.م <span className="text-slate-500 font-normal">سراير</span></span>
            <span className="text-blue-300 font-bold">{(totalPartnerUtilityBills || 0).toLocaleString()} ج.م <span className="text-slate-500 font-normal">شركاء</span></span>
          </div>
        </div>

        {data.monthlyBills.map(bill => {
          const elecVal = Number(bill.electricity || 0);
          const netVal = Number(bill.internet || 0);
          const waterVal = Number(bill.water || 0);
          const gasVal = Number(bill.gas || 0);
          const tenantTotal = elecVal + netVal;
          const sharePerBed = (tenantTotal / 8).toFixed(1);
          const partnerTotal = waterVal + gasVal;
          const isEditing = editingId === bill.id;

          return (
            <div key={bill.id} className="glass-card rounded-xl overflow-hidden">
              {/* Bill row header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/60">
                <span className="font-bold text-white text-sm">{bill.month}</span>
                <div className="flex items-center gap-2">
                  {tenantTotal > 0 && (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      السرير: {sharePerBed} ج.م
                    </span>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(bill)}
                      className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bill content */}
              <div className="px-3.5 py-2.5">
                {isEditing ? (
                  /* ── Edit mode ── */
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-yellow-400 font-bold block mb-1">⚡ كهرباء (ج.م)</label>
                        <input
                          type="number"
                          value={elec}
                          onChange={e => setElec(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white text-center focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-sky-400 font-bold block mb-1">🌐 نت (ج.م)</label>
                        <input
                          type="number"
                          value={internet}
                          onChange={e => setInternet(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white text-center focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-blue-400 font-bold block mb-1">💧 مياه (ج.م)</label>
                        <input
                          type="number"
                          value={water}
                          onChange={e => setWater(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white text-center focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-orange-400 font-bold block mb-1">🔥 غاز (ج.م)</label>
                        <input
                          type="number"
                          value={gas}
                          onChange={e => setGas(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white text-center focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-0.5">
                      <button
                        onClick={() => saveEdit(bill)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode — 4 values in a row ── */
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">⚡ كهرباء</div>
                      <div className="text-xs font-bold text-yellow-300">{elecVal ? `${elecVal}` : '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">🌐 نت</div>
                      <div className="text-xs font-bold text-sky-300">{netVal ? `${netVal}` : '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">💧 مياه</div>
                      <div className="text-xs font-bold text-blue-300">{waterVal ? `${waterVal}` : '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">🔥 غاز</div>
                      <div className="text-xs font-bold text-orange-300">{gasVal ? `${gasVal}` : '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
