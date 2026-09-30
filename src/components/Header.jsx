import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGoogleSheetLink } from '../services/googleSheetsService';
import {
  Download,
  Printer,
  Building2,
  MoreVertical,
  X,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';

export const Header = () => {
  const { 
    totalCapitalDeposits, 
    totalExpenses, 
    remainingCapitalPool, 
    exportToExcel, 
    toast,
    syncStatus,
    isSheetsConnected,
    setSheetsModalOpen
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDeficit = remainingCapitalPool < 0;
  const sheetLink = getGoogleSheetLink();

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-xl no-print">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-slide-up max-w-[92vw] text-center flex items-center gap-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/40 text-emerald-200' 
            : 'bg-blue-950 border-blue-500/40 text-blue-200'
        }`}>
          {toast.type === 'success' ? '✅' : 'ℹ️'}
          {toast.message}
        </div>
      )}

      <div className="px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-white leading-tight truncate">سيستم شقة الكوثر</h1>
            </div>
          </div>

          {/* Right Side: Google Sheets + Balance + Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Google Sheets Connection Modal Button */}
            <button
              onClick={() => setSheetsModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95"
              title="ربط ومزامنة Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Sheets</span>
              {syncStatus === 'saving' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />}
              {syncStatus === 'synced' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>


            {/* Quick Open Google Sheet in Browser (if link exists) */}
            {sheetLink && (
              <a
                href={sheetLink}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold transition-colors"
                title="فتح الشيت على Google Drive"
              >
                <span>فتح الشيت</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Balance Pill */}
            <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold ${
              isDeficit 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              {isDeficit ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              <span>{Math.abs(remainingCapitalPool).toLocaleString()}</span>
              <span className="text-[10px] opacity-70">ج.م</span>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="طباعة"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all active:scale-95"
                title="نسخة احتياطية Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">نسخة احتياطية</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700 active:scale-95 transition-all"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-slate-800 grid grid-cols-4 gap-2 animate-slide-up">
            <button
              onClick={() => { setSheetsModalOpen(true); setMobileMenuOpen(false); }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              جوجل شيت
            </button>
            <button
              onClick={() => { exportToExcel(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium active:scale-95"
            >
              <Download className="w-4 h-4" />
              نسخة Excel
            </button>
            <button
              onClick={() => { window.print(); setMobileMenuOpen(false); }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium active:scale-95"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </button>

          </div>
        )}
      </div>
    </header>
  );
};
