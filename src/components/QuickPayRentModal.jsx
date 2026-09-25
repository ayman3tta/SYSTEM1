import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, DollarSign, CheckCircle2 } from 'lucide-react';

export const QuickPayRentModal = ({ isOpen, onClose, bed }) => {
  const { recordRentPayment, selectedMonth } = useApp();
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    if (bed) {
      setAmountPaid(bed.rentPaid || bed.rentRequired || bed.monthlyPrice);
    }
  }, [bed, isOpen]);

  if (!isOpen || !bed) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    recordRentPayment(bed.id, amountPaid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex sm:items-center items-end justify-center p-0 sm:p-4">
      <div className="bg-slate-800 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in duration-200">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-slate-600/80 rounded-full mx-auto mt-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            تسديد إيجار {selectedMonth}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">الغرفة والسرير:</span>
              <span className="font-bold text-white">{bed.roomName} - سرير {bed.bedNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">المستأجر:</span>
              <span className="font-bold text-indigo-300">{bed.tenantName || 'غير مسجل'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">سعر الإيجار المطلوب هذا الشهر:</span>
              <span className="font-bold text-white">{bed.rentRequired || bed.monthlyPrice} ج.م</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">المبلغ المدفوع هذا الشهر (ج.م) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="1700"
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-emerald-400 font-extrabold text-base focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
            >
              تأكيد تسديد الإيجار
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
