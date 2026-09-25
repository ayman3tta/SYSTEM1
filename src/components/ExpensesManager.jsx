import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseModal } from './ExpenseModal';
import { 
  Receipt, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  User, 
  Tag,
  ArrowUpDown
} from 'lucide-react';

export const ExpensesManager = () => {
  const { data, deleteExpense, partnersList } = useApp();

  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('الكل');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  // Helper categories
  const getCategory = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('إيجار') || name.includes('ايجار') || name.includes('تأمين') || name.includes('سمسار')) return 'إيجار وتأمين وسمسار';
    if (name.includes('مرتبة') || name.includes('سرير') || name.includes('دولاب') || name.includes('أوضة') || name.includes('اوضة') || name.includes('كرسي') || name.includes('سفرة') || name.includes('طرابيزة') || name.includes('مكتب') || name.includes('سجادة') || name.includes('سجاد') || name.includes('فرش') || name.includes('مخدات')) return 'أثاث ومفروشات';
    if (name.includes('ثلاجة') || name.includes('تلاجة') || name.includes('غسالة') || name.includes('بوتجاز') || name.includes('مروحة') || name.includes('مراوح') || name.includes('سخان') || name.includes('فلتر') || name.includes('شفاط')) return 'أجهزة كهربائية';
    if (name.includes('صيانة') || name.includes('مفاتيح') || name.includes('لمبات') || name.includes('سلك') || name.includes('دش') || name.includes('نجار') || name.includes('تصليح') || name.includes('محبس') || name.includes('عجل') || name.includes('مسامير')) return 'صيانة وتوصيلات';
    return 'خدمات ونقل وأخرى';
  };

  const categories = ['الكل', 'أثاث ومفروشات', 'أجهزة كهربائية', 'إيجار وتأمين وسمسار', 'صيانة وتوصيلات', 'خدمات ونقل وأخرى'];

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter(e => {
      const matchSearch = e.item.toLowerCase().includes(search.toLowerCase()) || 
                          (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
      const matchPartner = selectedPartner === 'الكل' || e.paidBy.trim() === selectedPartner.trim();
      const matchCategory = selectedCategory === 'الكل' || getCategory(e.item) === selectedCategory;

      return matchSearch && matchPartner && matchCategory;
    });
  }, [data.expenses, search, selectedPartner, selectedCategory]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, c) => acc + Number(c.amount || 0), 0);
  }, [filteredExpenses]);

  const handleOpenAdd = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setExpenseToEdit(exp);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            سجل المصروفات الكامل ({data.expenses.length} بند)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدخال وتتبع جميع المصروفات والتجهيزات والشراء مع تحديد الشريك الدفع لكل بند.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة مصروف جديد</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl space-y-3">
        {/* Search box & Filter sum */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالاسم أو البند..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs shrink-0">
            <span className="text-amber-300 font-medium">إجمالي المفلتر:</span>
            <span className="font-extrabold text-amber-400 text-sm mr-2">{totalFilteredAmount.toLocaleString()} ج.م</span>
          </div>
        </div>

        {/* Partner Dropdown & Categories Horizontal Scroll Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">مين دفع:</span>
            <select
              value={selectedPartner}
              onChange={e => setSelectedPartner(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="الكل">الكل (الجميع)</option>
              {partnersList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Quick Category Pills horizontal slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all text-xs font-semibold ${
                  selectedCategory === c
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses List: Mobile Cards View (phone) */}
      <div className="block md:hidden space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="glass-card p-6 text-center text-slate-400 text-xs rounded-2xl">
            لا توجد مصروفات مطابقة للبحث المحدد.
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const category = getCategory(exp.item);
            return (
              <div key={exp.id} className="glass-card p-4 rounded-2xl space-y-3 border-r-4 border-r-amber-500">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{exp.item}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-slate-400">{exp.date}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300">
                        {category}
                      </span>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-base font-black text-amber-400">{Number(exp.amount).toLocaleString()}</div>
                    <span className="text-[10px] text-slate-400">ج.م</span>
                  </div>
                </div>

                {exp.notes && (
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    {exp.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                    exp.paidBy.includes('محمد') ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                    exp.paidBy.includes('ايمن') || exp.paidBy.includes('أيمن') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    دفعها: {exp.paidBy}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(exp)}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-medium active:scale-95 transition-all text-xs"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium active:scale-95 transition-all text-xs"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Expenses Table: Desktop View (md and up) */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-700/60">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4 w-12 text-center">م</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">اسم البند / التجهيز</th>
                <th className="py-3 px-4 text-left">المبلغ (ج.م)</th>
                <th className="py-3 px-4">مين دفع</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">ملاحظات</th>
                <th className="py-3 px-4 text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    لا توجد مصروفات مطابقة للبحث المحدد.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp, idx) => {
                  const category = getCategory(exp.item);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{exp.id}</td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{exp.date}</td>
                      <td className="py-3 px-4 font-semibold text-white">{exp.item}</td>
                      <td className="py-3 px-4 font-bold text-amber-400 text-left text-sm whitespace-nowrap">
                        {Number(exp.amount).toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          exp.paidBy.includes('محمد') ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                          exp.paidBy.includes('ايمن') || exp.paidBy.includes('أيمن') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}>
                          {exp.paidBy}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300">
                          {category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {exp.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expenseToEdit={expenseToEdit}
      />

    </div>
  );
};
