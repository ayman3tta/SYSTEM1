import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseModal } from './ExpenseModal';
import { 
  Receipt, 
  Search, 
  Plus, 
  Trash2, 
  Edit3,
  Droplets
} from 'lucide-react';

export const ExpensesManager = () => {
  const { data, deleteExpense, partnersList, totalPartnerUtilityBills } = useApp();

  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('الكل');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const getCategory = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('إيجار') || name.includes('ايجار') || name.includes('تأمين') || name.includes('سمسار')) return 'إيجار وتأمين';
    if (name.includes('مرتبة') || name.includes('سرير') || name.includes('دولاب') || name.includes('أوضة') || name.includes('كرسي') || name.includes('سفرة') || name.includes('فرش') || name.includes('مخدات')) return 'أثاث';
    if (name.includes('ثلاجة') || name.includes('غسالة') || name.includes('بوتجاز') || name.includes('مروحة') || name.includes('سخان') || name.includes('فلتر') || name.includes('شفاط')) return 'أجهزة';
    if (name.includes('صيانة') || name.includes('مفاتيح') || name.includes('لمبات') || name.includes('نجار') || name.includes('تصليح') || name.includes('محبس')) return 'صيانة';
    return 'أخرى';
  };

  const categories = ['الكل', 'إيجار وتأمين', 'أثاث', 'أجهزة', 'صيانة', 'أخرى'];

  const partnerColor = (name) => {
    if (name?.includes('محمد')) return 'bg-blue-500/15 text-blue-300 border-blue-500/20';
    if (name?.includes('ايمن') || name?.includes('أيمن')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
    return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
  };

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter(e => {
      const matchSearch = e.item.toLowerCase().includes(search.toLowerCase()) || 
                          (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
      const matchPartner = selectedPartner === 'الكل' || e.paidBy.trim() === selectedPartner.trim();
      const matchCategory = selectedCategory === 'الكل' || getCategory(e.item) === selectedCategory;
      return matchSearch && matchPartner && matchCategory;
    });
  }, [data.expenses, search, selectedPartner, selectedCategory]);

  const totalFilteredAmount = useMemo(() => 
    filteredExpenses.reduce((acc, c) => acc + Number(c.amount || 0), 0),
  [filteredExpenses]);

  const handleOpenAdd = () => { setExpenseToEdit(null); setIsModalOpen(true); };
  const handleOpenEdit = (exp) => { setExpenseToEdit(exp); setIsModalOpen(true); };

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">المصروفات</h2>
            <p className="text-[11px] text-slate-400">{data.expenses.length} بند مسجل</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          مصروف جديد
        </button>
      </div>

      {/* ── Utility Bills Notice ── */}
      {totalPartnerUtilityBills > 0 && (
        <div className="flex items-center justify-between glass-card px-3.5 py-2.5 rounded-xl text-xs border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-2 text-blue-200">
            <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>فواتير المياه والغاز (علينا)</span>
          </div>
          <span className="font-bold text-blue-300">{totalPartnerUtilityBills.toLocaleString()} ج.م</span>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="glass-card p-3 rounded-xl space-y-2.5">
        {/* Search + Total */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-8 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0 text-xs">
            <span className="text-amber-300 font-black">{totalFilteredAmount.toLocaleString()}</span>
            <span className="text-slate-500">ج.م</span>
          </div>
        </div>

        {/* Partner + Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Partner Dropdown */}
          <select
            value={selectedPartner}
            onChange={e => setSelectedPartner(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 shrink-0"
          >
            <option value="الكل">الكل</option>
            {partnersList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-semibold transition-all ${
                  selectedCategory === c
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Expenses List ── */}
      {filteredExpenses.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400 text-sm rounded-xl">
          لا توجد مصروفات مطابقة.
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredExpenses.map((exp) => {
            const category = getCategory(exp.item);
            return (
              <div
                key={exp.id}
                className="glass-card px-3.5 py-2.5 rounded-xl flex items-center gap-3 hover:bg-white/[0.04] transition-colors border-r-2 border-r-amber-500/40"
              >
                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white text-xs truncate">{exp.item}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border shrink-0 ${partnerColor(exp.paidBy)}`}>
                      {exp.paidBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="font-mono">{exp.date}</span>
                    <span>·</span>
                    <span>{category}</span>
                    {exp.notes && <><span>·</span><span className="italic truncate max-w-[120px]">{exp.notes}</span></>}
                  </div>
                </div>

                {/* Amount */}
                <span className="text-sm font-black text-amber-400 font-mono whitespace-nowrap shrink-0">
                  {Number(exp.amount).toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">ج.م</span>
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 no-print shrink-0">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} expenseToEdit={expenseToEdit} />
    </div>
  );
};
