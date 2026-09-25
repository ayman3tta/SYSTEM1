import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, PlusCircle, Edit3 } from 'lucide-react';

export const ExpenseModal = ({ isOpen, onClose, expenseToEdit }) => {
  const { addExpense, updateExpense, partnersList } = useApp();

  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('محمد');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setItem(expenseToEdit.item || '');
      setAmount(expenseToEdit.amount || '');
      setPaidBy(expenseToEdit.paidBy || 'محمد');
      setDate(expenseToEdit.date || new Date().toISOString().split('T')[0]);
      setNotes(expenseToEdit.notes || '');
    } else {
      setItem('');
      setAmount('');
      setPaidBy('محمد');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item.trim() || !amount || Number(amount) <= 0) {
      alert('يرجى إدخال اسم البند والمبلغ بشكل صحيح');
      return;
    }

    const payload = {
      item: item.trim(),
      amount: Number(amount),
      paidBy: paidBy.trim(),
      date,
      notes: notes.trim()
    };

    if (expenseToEdit) {
      updateExpense({ ...payload, id: expenseToEdit.id });
    } else {
      addExpense(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex sm:items-center items-end justify-center p-0 sm:p-4">
      <div className="bg-slate-800 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-slate-600/80 rounded-full mx-auto mt-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            {expenseToEdit ? <Edit3 className="w-5 h-5 text-blue-400" /> : <PlusCircle className="w-5 h-5 text-emerald-400" />}
            {expenseToEdit ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">اسم البند / الفاتورة / الصيانة *</label>
            <input
              type="text"
              required
              placeholder="مثال: شراء مروحة، ثلاجة، تركيب سباكة..."
              value={item}
              onChange={e => setItem(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">المبلغ (بالجنيه) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">مين دفع المبلغ؟ *</label>
              <select
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                {partnersList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">التاريخ</label>
              <input
                type="text"
                placeholder="مثال: 15/9/2026"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">ملاحظات إضافية</label>
            <textarea
              rows="2"
              placeholder="أدخل أي ملاحظات إن وجدت..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
            >
              {expenseToEdit ? 'حفظ التعديلات' : 'إضافة المصروف'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
