import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserMinus, AlertCircle, RefreshCw } from 'lucide-react';

export const VacateBedModal = ({ isOpen, onClose, bed }) => {
  const { vacateBedAndRefund } = useApp();
  const [noticeDays, setNoticeDays] = useState(15);
  const [refundNotes, setRefundNotes] = useState('تم الإبلاغ قبلها بـ 15 يوماً واسترداد كامل مبلغ التأمين');

  if (!isOpen || !bed) return null;

  const handleVacate = (e) => {
    e.preventDefault();
    vacateBedAndRefund(bed.id, refundNotes);
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
            <UserMinus className="w-5 h-5 text-rose-400" />
            إخلاء السرير واسترداد التأمين
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleVacate} className="p-5 space-y-4 text-sm">
          
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">الغرفة والسرير:</span>
              <span className="font-bold text-white">{bed.roomName} - سرير {bed.bedNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">اسم المستأجر المغادر:</span>
              <span className="font-bold text-indigo-300">{bed.tenantName || 'غير مسجل'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">مبلغ التأمين المسدد سابقاً:</span>
              <span className="font-extrabold text-emerald-400 text-sm">{bed.depositPaid || 0} ج.م</span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              تنبيه: يُسترد التأمين شريطة إبلاغ المستأجر قبل مغادرته بـ <strong>15 يوماً</strong>. عند إتمام الإخلاء، سيُصبح السرير <strong>شاغراً</strong> ومستعداً لمستأجر جديد.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">ملاحظات الإخلاء والاسترداد</label>
            <input
              type="text"
              value={refundNotes}
              onChange={e => setRefundNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
            >
              تأكيد الإخلاء واسترداد التأمين
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
