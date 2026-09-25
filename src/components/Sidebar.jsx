import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Bed, 
  Zap, 
  Calculator 
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, data } = useApp();

  const occupiedBedsCount = data.beds.filter(b => b.status === 'مؤجر').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'الداشبورد',
      fullLabel: 'لوحة التحكم',
      icon: LayoutDashboard,
      badge: null,
      activeColor: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'beds',
      label: 'السراير',
      fullLabel: 'تفاصيل السراير والمستأجرين',
      icon: Bed,
      badge: `${occupiedBedsCount}/${data.beds.length}`,
      activeColor: 'from-indigo-600 to-purple-600'
    },
    {
      id: 'capital',
      label: 'رأس المال',
      fullLabel: 'رأس المال والشركاء',
      icon: Wallet,
      badge: data.capitalDeposits.length,
      activeColor: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'expenses',
      label: 'المصروفات',
      fullLabel: 'سجل المصروفات',
      icon: Receipt,
      badge: data.expenses.length,
      activeColor: 'from-amber-500 to-orange-600'
    },
    {
      id: 'bills',
      label: 'الفواتير',
      fullLabel: 'الفواتير الشهرية',
      icon: Zap,
      badge: data.monthlyBills.length,
      activeColor: 'from-yellow-500 to-amber-600'
    },
    {
      id: 'settlement',
      label: 'التسوية',
      fullLabel: 'تسوية حساب الشركاء',
      icon: Calculator,
      badge: null,
      activeColor: 'from-cyan-600 to-blue-600'
    }
  ];

  return (
    <>
      {/* Desktop Sidebar (md and up) */}
      <aside className="hidden md:flex w-64 bg-slate-800/50 border-l border-slate-700/60 p-4 flex-col gap-2 shrink-0 no-print">
        <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
          اختصارات التنقل الرئيسي
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg shadow-blue-500/20 font-bold border border-white/20`
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.fullLabel}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25 text-white font-bold' : 'bg-slate-700 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Mobile & Tablet Bottom Button Bar (شريط الأزرار الثابت بالأسفل) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-1.5 py-2 flex items-center justify-between no-print shadow-[0_-8px_30px_rgba(0,0,0,0.8)] gap-1 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 active:scale-95 relative min-w-[54px] ${
                isActive 
                  ? `bg-gradient-to-b ${item.activeColor} text-white font-bold shadow-md border border-white/20` 
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white scale-110' : 'text-slate-400'} transition-transform`} />
                {item.badge !== null && (
                  <span className={`absolute -top-1.5 -right-2 text-[9px] font-extrabold px-1 rounded-full ${
                    isActive ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] mt-1 whitespace-nowrap tracking-tight ${isActive ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
