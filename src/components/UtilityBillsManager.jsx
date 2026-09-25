import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Edit3, Check, X } from 'lucide-react';

export const UtilityBillsManager = () => {
  const { data, updateMonthlyBill, occupiedBedsCount } = useApp();

  const [editingId, setEditingId] = useState(null);
  const [elec, setElec] = useState(0);
  const [water, setWater] = useState(0);
  const [gas, setGas] = useState(0);

  const startEdit = (bill) => {
    setEditingId(bill.id);
    setElec(bill.electricity || 0);
    setWater(bill.water || 0);
    setGas(bill.gas || 0);
  };

  const saveEdit = (bill) => {
    updateMonthlyBill({
      ...bill,
      electricity: Number(elec || 0),
      water: Number(water || 0),
      gas: Number(gas || 0)
    });
    setEditingId(null);
  };

  const totalYearElectricity = data.monthlyBills.reduce((a, b) => a + Number(b.electricity || 0), 0);
  const totalYearWater = data.monthlyBills.reduce((a, b) => a + Number(b.water || 0), 0);
  const totalYearGas = data.monthlyBills.reduce((a, b) => a + Number(b.gas || 0), 0);
  const totalYearBills = totalYearElectricity + totalYearWater + totalYearGas;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          فواتير الكهرباء والمياه والغاز الشهرية
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          تسجيل الفواتير الشهرية وحساب نصيب كل سرير تلقائياً بناءً على عدد السراير المؤجرة ({occupiedBedsCount} سراير).
        </p>
      </div>

      {/* Annual Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">إجمالي الكهرباء</span>
          <div className="text-xl font-bold text-yellow-400">{totalYearElectricity.toLocaleString()} ج.م</div>
        </div>
        <div className="glass-card p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">إجمالي المياه</span>
          <div className="text-xl font-bold text-blue-400">{totalYearWater.toLocaleString()} ج.م</div>
        </div>
        <div className="glass-card p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">إجمالي الغاز</span>
          <div className="text-xl font-bold text-orange-400">{totalYearGas.toLocaleString()} ج.م</div>
        </div>
        <div className="glass-card p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">إجمالي الفواتير السنوية</span>
          <div className="text-xl font-bold text-emerald-400">{totalYearBills.toLocaleString()} ج.م</div>
        </div>
      </div>

      {/* Monthly Bills Cards View for Mobile (phone view) */}
      <div className="block md:hidden space-y-3">
        <h3 className="font-bold text-white text-sm px-1">استهلاك المرافق ونصيب السرير لكل شهر</h3>
        {data.monthlyBills.map(bill => {
          const totalMonth = Number(bill.electricity || 0) + Number(bill.water || 0) + Number(bill.gas || 0);
          const sharePerBed = occupiedBedsCount > 0 ? (totalMonth / occupiedBedsCount).toFixed(1) : 0;
          const isEditing = editingId === bill.id;

          return (
            <div key={bill.id} className="glass-card p-4 rounded-2xl space-y-3 border-r-4 border-r-yellow-500">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <h4 className="font-extrabold text-white text-base">{bill.month}</h4>
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full">
                  نصيب السرير: {sharePerBed} ج.م
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-2.5 text-xs pt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-yellow-400 block mb-1">كهرباء</label>
                      <input
                        type="number"
                        value={elec}
                        onChange={e => setElec(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="text-blue-400 block mb-1">مياه</label>
                      <input
                        type="number"
                        value={water}
                        onChange={e => setWater(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-orange-400 block mb-1">غاز</label>
                      <input
                        type="number"
                        value={gas}
                        onChange={e => setGas(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
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
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block">كهرباء</span>
                      <span className="font-bold text-yellow-300">{bill.electricity ? `${bill.electricity} ج.م` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">مياه</span>
                      <span className="font-bold text-blue-300">{bill.water ? `${bill.water} ج.م` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">غاز</span>
                      <span className="font-bold text-orange-300">{bill.gas ? `${bill.gas} ج.م` : '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-300">
                      إجمالي الشهر: <strong className="text-white text-sm">{totalMonth} ج.م</strong>
                    </div>
                    <button
                      onClick={() => startEdit(bill)}
                      className="px-3 py-1 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 flex items-center gap-1 active:scale-95"
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
          <h3 className="font-bold text-white text-sm">جدول استهلاك المرافق وحسبة نصيب السرير</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">الشهر</th>
                <th className="py-3 px-4 text-center">كهرباء (ج.م)</th>
                <th className="py-3 px-4 text-center">مياه (ج.م)</th>
                <th className="py-3 px-4 text-center">غاز (ج.م)</th>
                <th className="py-3 px-4 text-center">إجمالي الفاتورة</th>
                <th className="py-3 px-4 text-center text-emerald-400">نصيب كل سرير (÷ {occupiedBedsCount})</th>
                <th className="py-3 px-4 text-center no-print">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {data.monthlyBills.map(bill => {
                const totalMonth = Number(bill.electricity || 0) + Number(bill.water || 0) + Number(bill.gas || 0);
                const sharePerBed = occupiedBedsCount > 0 ? (totalMonth / occupiedBedsCount).toFixed(1) : 0;
                const isEditing = editingId === bill.id;

                return (
                  <tr key={bill.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-sm">{bill.month}</td>
                    
                    {/* Electricity */}
                    <td className="py-3.5 px-4 text-center font-bold text-yellow-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={elec}
                          onChange={e => setElec(e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center text-xs text-white focus:outline-none"
                        />
                      ) : (
                        bill.electricity ? `${bill.electricity} ج.م` : '-'
                      )}
                    </td>

                    {/* Water */}
                    <td className="py-3.5 px-4 text-center font-bold text-blue-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={water}
                          onChange={e => setWater(e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center text-xs text-white focus:outline-none"
                        />
                      ) : (
                        bill.water ? `${bill.water} ج.م` : '-'
                      )}
                    </td>

                    {/* Gas */}
                    <td className="py-3.5 px-4 text-center font-bold text-orange-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={gas}
                          onChange={e => setGas(e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center text-xs text-white focus:outline-none"
                        />
                      ) : (
                        bill.gas ? `${bill.gas} ج.م` : '-'
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 text-center font-black text-white text-sm">
                      {totalMonth > 0 ? `${totalMonth} ج.م` : '0'}
                    </td>

                    {/* Share per Bed */}
                    <td className="py-3.5 px-4 text-center font-black text-emerald-400 text-sm bg-emerald-500/5">
                      {sharePerBed > 0 ? `${sharePerBed} ج.م` : '0'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center no-print">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => saveEdit(bill)}
                            className="p-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            title="حفظ"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                            title="إلغاء"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(bill)}
                          className="p-1.5 rounded bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white"
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
