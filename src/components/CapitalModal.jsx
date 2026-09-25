import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Wallet, Edit3, PlusCircle } from 'lucide-react';

export const CapitalModal = ({ isOpen, onClose, depositToEdit }) => {
  const { addCapitalDeposit, updateCapitalDeposit, partnersList } = useApp();

  const [partner, setPartner] = useState('ايمن');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (depositToEdit) {
      setPartner(depositToEdit.partner || 'ايمن');
      setAmount(depositToEdit.amount || '');
      setDate(depositToEdit.date || new Date().toISOString().split('T')[0]);
    } else {
      setPartner('ايمن');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [depositToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('يرجى كتابة مبلغ الإيداع بشكل صحيح');
      return;
    }

    const payload = {
      partner: partner.trim(),
      amount: Number(amount),
      date
    };

    if (depositToEdit) {
      updateCapitalDeposit({ ...payload, id: depositToEdit.id });
    } else {
      addCapitalDeposit(payload);
    }
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
            {depositToEdit ? <Edit3 className="w-5 h-5 text-blue-400" /> : <PlusCircle className="w-5 h-5 text-emerald-400" />}
            {depositToEdit ? 'تعديل إيداع رأس مال' : 'إضافة إيداع رأس مال جديد'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">الشريك المودع *</label>
            <select
              value={partner}
              onChange={e => setPartner(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              {partnersList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">مبلغ الإيداع (بالجنيه) *</label>
            <input
              type="number"
              required
              min="1"
              step="any"
              placeholder="مثال: 5000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">تاريخ الإيداع</label>
            <input
              type="text"
              placeholder="مثال: 31/8/2026"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
            >
              {depositToEdit ? 'حفظ التعديلات' : 'تسجيل الإيداع'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
