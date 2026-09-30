import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const QuickPayDepositModal = ({ isOpen, onClose, bed }) => {
  const { recordDepositPayment } = useApp();
  
  // Previous deposit paid
  const prevDepositPaid = Number(bed?.depositPaid || 0);
  const depositRequired = Number(bed?.depositRequired || bed?.monthlyPrice || 0);
  const depositRemaining = Math.max(0, depositRequired - prevDepositPaid);

  // User input: amount to add now
  const [amountToAdd, setAmountToAdd] = useState('');

  useEffect(() => {
    if (bed && isOpen) {
      // By default pre-fill with remaining deposit, or if 0 leave blank or 0
      setAmountToAdd(depositRemaining > 0 ? String(depositRemaining) : '');
    }
  }, [bed, isOpen, depositRemaining]);

  if (!isOpen || !bed) return null;

  const addedNum = Number(amountToAdd || 0);
  const newTotalDepositPaid = prevDepositPaid + addedNum;
  const newDepositRemaining = Math.max(0, depositRequired - newTotalDepositPaid);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addedNum <= 0 && newTotalDepositPaid === prevDepositPaid) {
      onClose();
      return;
    }
    recordDepositPayment(bed.id, newTotalDepositPaid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex sm:items-center items-end justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                سداد / إضافة تأمين
              </h3>
              <p className="text-[11px] text-slate-400">تسجيل دفع باقي التأمين للمستأجر</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          
          {/* Tenant & Bed Info Box */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">الغرفة والسرير:</span>
              <span className="font-bold text-white">{bed.roomName} - سرير {bed.bedNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">اسم المستأجر:</span>
              <span className="font-bold text-indigo-300">{bed.tenantName || 'غير مسجل'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
              <span className="text-slate-400">التأمين المطلوب الإجمالي:</span>
              <span className="font-extrabold text-white">{depositRequired.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">التأمين المسدد سابقاً:</span>
              <span className="font-bold text-blue-400">{prevDepositPaid.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">باقي التأمين المستحق:</span>
              <span className={`font-black ${depositRemaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {depositRemaining.toLocaleString()} ج.م
              </span>
            </div>
          </div>

          {/* Quick Pay Remaining Button if remaining > 0 */}
          {depositRemaining > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAmountToAdd(String(depositRemaining))}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all"
              >
                + سداد كامل المتبقي ({depositRemaining.toLocaleString()} ج.م)
              </button>
            </div>
          )}

          {/* Amount Paid Now Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
              مبلغ التأمين المدفوع الآن (ج.م) *
            </label>
            <input
              type="number"
              required
              min="1"
              max={depositRemaining > 0 ? depositRemaining * 2 : 10000}
              placeholder="مثال: 500"
              value={amountToAdd}
              onChange={e => setAmountToAdd(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-blue-400 font-black text-base focus:outline-none transition-colors"
            />
          </div>

          {/* Calculation Preview */}
          <div className="bg-blue-950/30 border border-blue-900/40 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-300">إجمالي التأمين بعد هذه الحركة:</span>
            <div className="text-left font-mono">
              <span className="font-black text-emerald-400 text-sm">{newTotalDepositPaid.toLocaleString()} ج.م</span>
              {newDepositRemaining > 0 ? (
                <span className="block text-[10px] text-amber-400">متبقي: {newDepositRemaining.toLocaleString()} ج.م</span>
              ) : (
                <span className="block text-[10px] text-emerald-400">✓ تم سداد التأمين بالكامل</span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد سداد التأمين</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
