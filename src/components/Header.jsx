import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, RefreshCw, Printer, Building, MoreVertical, X } from 'lucide-react';

export const Header = () => {
  const { 
    totalCapitalDeposits, 
    totalExpenses, 
    remainingCapitalPool, 
    exportToExcel, 
    resetToInitialData,
    toast 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-800/90 border-b border-slate-700/80 sticky top-0 z-40 backdrop-blur-md">
      {/* Toast alert */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-2xl border text-xs sm:text-sm font-semibold transition-all animate-bounce max-w-[90vw] text-center ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
            : 'bg-blue-950/90 border-blue-500/50 text-blue-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Building className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white tracking-wide flex items-center gap-1.5 flex-wrap">
                سيستم شقة الكوثر
                <span className="text-[10px] sm:text-xs font-normal px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  (محمد • أيمن • أحمد)
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                إدارة رأس المال، المصروفات، السراير، المستأجرين، والفواتير الشهرية
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Quick Balance Pill on Mobile Header */}
            <div className="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-700/60 text-xs flex items-center gap-1 sm:hidden">
              <span className="text-slate-400 text-[10px]">الرصيد:</span>
              <span className={`font-black text-xs ${remainingCapitalPool >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                {remainingCapitalPool.toLocaleString()} ج.م
              </span>
            </div>

            {/* Quick Metrics Pill (Desktop) */}
            <div className="hidden xl:flex items-center gap-3 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">رأس المال:</span>
                <span className="font-bold text-emerald-400">{totalCapitalDeposits.toLocaleString()} ج.م</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">المصروفات:</span>
                <span className="font-bold text-amber-400">{totalExpenses.toLocaleString()} ج.م</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">الرصيد:</span>
                <span className={`font-bold ${remainingCapitalPool >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                  {remainingCapitalPool.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600/50 transition-colors"
                title="طباعة التقرير"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>

              <button
                onClick={exportToExcel}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                title="تصدير إلى شيت إكسيل"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel</span>
              </button>

              <button
                onClick={resetToInitialData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-colors"
                title="إعادة ضبط البيانات للأصل"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة الضبط</span>
              </button>
            </div>

            {/* Mobile Actions Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl bg-slate-700/60 text-slate-300 hover:text-white border border-slate-600/50 active:scale-95"
              aria-label="الخيارات"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Actions Dropdown Popup Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-slate-700/70 grid grid-cols-3 gap-2 animate-in fade-in duration-150">
            <button
              onClick={() => { exportToExcel(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold active:scale-95 gap-1"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={() => { window.print(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-700/60 text-slate-200 border border-slate-600/50 text-xs font-medium active:scale-95 gap-1"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>

            <button
              onClick={() => { resetToInitialData(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium active:scale-95 gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ضبط الأصل</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
