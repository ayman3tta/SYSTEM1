import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Bed, Edit3 } from 'lucide-react';

export const BedModal = ({ isOpen, onClose, bedToEdit }) => {
  const { updateBed, addBed } = useApp();

  const [roomName, setRoomName] = useState('أوضة 1');
  const [bedNumber, setBedNumber] = useState(1);
  const [monthlyPrice, setMonthlyPrice] = useState(1700);
  const [status, setStatus] = useState('مؤجر');
  const [tenantName, setTenantName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [depositRequired, setDepositRequired] = useState(1700);
  const [depositPaid, setDepositPaid] = useState(0);
  const [rentRequired, setRentRequired] = useState(1700);
  const [rentPaid, setRentPaid] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (bedToEdit) {
      setRoomName(bedToEdit.roomName || 'أوضة 1');
      setBedNumber(bedToEdit.bedNumber || 1);
      setMonthlyPrice(bedToEdit.monthlyPrice || 1700);
      setStatus(bedToEdit.status || 'مؤجر');
      setTenantName(bedToEdit.tenantName || '');
      setStartDate(bedToEdit.startDate || '');
      setDepositRequired(bedToEdit.depositRequired || 0);
      setDepositPaid(bedToEdit.depositPaid || 0);
      setRentRequired(bedToEdit.rentRequired || 0);
      setRentPaid(bedToEdit.rentPaid || 0);
      setNotes(bedToEdit.notes || '');
    }
  }, [bedToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      roomName: roomName.trim(),
      bedNumber: Number(bedNumber),
      monthlyPrice: Number(monthlyPrice),
      status,
      tenantName: tenantName.trim(),
      startDate: startDate.trim(),
      depositRequired: Number(depositRequired || 0),
      depositPaid: Number(depositPaid || 0),
      rentRequired: Number(rentRequired || 0),
      rentPaid: Number(rentPaid || 0),
      notes: notes.trim()
    };

    if (bedToEdit) {
      updateBed({ ...payload, id: bedToEdit.id });
    } else {
      addBed(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex sm:items-center items-end justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-slate-800 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in duration-200 my-0 sm:my-8 max-h-[92vh] flex flex-col">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-slate-600/80 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50 shrink-0">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Bed className="w-5 h-5 text-indigo-400" />
            {bedToEdit ? `تعديل البيانات (${bedToEdit.roomName} - سرير ${bedToEdit.bedNumber})` : 'إضافة سرير جديد'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">الأوضة *</label>
              <input
                type="text"
                required
                placeholder="أوضة 1"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">رقم السرير *</label>
              <input
                type="number"
                required
                min="1"
                value={bedNumber}
                onChange={e => setBedNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">الإيجار الشهري *</label>
              <input
                type="number"
                required
                min="0"
                value={monthlyPrice}
                onChange={e => setMonthlyPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">حالة السرير</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="مؤجر">مؤجر</option>
                <option value="شاغر">شاغر</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">اسم المستأجر</label>
              <input
                type="text"
                placeholder="مثال: زياد ربيع علي"
                value={tenantName}
                onChange={e => setTenantName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">تاريخ بداية الإيجار</label>
              <input
                type="text"
                placeholder="15/9/2026"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Deposit details */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <span className="font-bold text-emerald-400 text-xs block">مبلغ التأمين (مسترد عند الإخلاء)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">التأمين المطلوب</label>
                <input
                  type="number"
                  value={depositRequired}
                  onChange={e => setDepositRequired(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">التأمين المدفوع فعلياً</label>
                <input
                  type="number"
                  value={depositPaid}
                  onChange={e => setDepositPaid(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Current month rent details */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <span className="font-bold text-blue-400 text-xs block">إيجار الشهر الحالي</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">الإيجار المطلوب هذا الشهر</label>
                <input
                  type="number"
                  value={rentRequired}
                  onChange={e => setRentRequired(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">الإيجار المدفوع هذا الشهر</label>
                <input
                  type="number"
                  value={rentPaid}
                  onChange={e => setRentPaid(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-blue-400 font-bold focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">ملاحظات (مثل: نصف شهر / إيجار 11 يوم)</label>
            <textarea
              rows="2"
              placeholder="ملاحظات حول طريقة حساب الإيجار..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Submit buttons */}
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
            >
              حفظ بيانات السرير
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
