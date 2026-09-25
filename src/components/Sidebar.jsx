import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Bed, 
  Zap, 
  Scale
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, data } = useApp();

  const occupiedBedsCount = data.beds.filter(b => b.status === 'مؤجر').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      badge: null,
      gradient: 'from-blue-500 to-indigo-500',
      glow: 'shadow-blue-500/40'
    },
    {
      id: 'beds',
      label: 'السراير',
      icon: Bed,
      badge: `${occupiedBedsCount}/${data.beds.length}`,
      gradient: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/40'
    },
    {
      id: 'capital',
      label: 'رأس المال',
      icon: Wallet,
      badge: data.capitalDeposits.length || null,
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/40'
    },
    {
      id: 'expenses',
      label: 'المصروفات',
      icon: Receipt,
      badge: data.expenses.length || null,
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/40'
    },
    {
      id: 'bills',
      label: 'الفواتير',
      icon: Zap,
      badge: null,
      gradient: 'from-yellow-400 to-amber-500',
      glow: 'shadow-yellow-500/40'
    },
    {
      id: 'settlement',
      label: 'التسوية',
      icon: Scale,
      badge: null,
      gradient: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/40'
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 bg-slate-900/60 border-l border-slate-800 p-3 flex-col gap-1.5 shrink-0 no-print">
        <p className="text-[10px] font-bold text-slate-500 px-3 py-1 uppercase tracking-widest">القائمة الرئيسية</p>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${item.glow}`
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 no-print" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Frosted Glass Background */}
        <div className="bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 shadow-[0_-8px_40px_rgba(0,0,0,0.7)]">
          <div className="flex items-stretch justify-around px-1 pt-2 pb-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-xl transition-all duration-200 active:scale-90 relative min-w-0`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <span className={`absolute inset-0 rounded-xl bg-gradient-to-b ${item.gradient} opacity-15`} />
                  )}
                  
                  {/* Icon Container */}
                  <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg ${item.glow}` 
                      : 'bg-transparent'
                  }`}>
                    <Icon className={`w-4 h-4 transition-all ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    
                    {/* Badge */}
                    {item.badge !== null && (
                      <span className={`absolute -top-1 -right-1.5 text-[9px] font-black px-1 rounded-full leading-tight ${
                        isActive 
                          ? 'bg-white text-slate-900' 
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-[10px] leading-none font-bold transition-all ${
                    isActive ? 'text-white' : 'text-slate-600'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
