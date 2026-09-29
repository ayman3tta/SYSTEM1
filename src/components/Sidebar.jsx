import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Bed,
  Zap,
  Scale,
  Calculator,
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, data } = useApp();

  const occupiedBedsCount = data.beds.filter((b) => b.status === 'مؤجر').length;

  /* ── Desktop nav items (6 → 5, capital+settlement merged) ── */
  const desktopItems = [
    { id: 'dashboard', label: 'الرئيسية',          icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-500',    glow: 'shadow-blue-500/40',    badge: null },
    { id: 'beds',      label: 'السراير والمستأجرين', icon: Bed,             gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/40',  badge: `${occupiedBedsCount}/${data.beds.length}` },
    { id: 'expenses',  label: 'المصروفات',           icon: Receipt,         gradient: 'from-amber-500 to-orange-500',  glow: 'shadow-amber-500/40',   badge: null },
    { id: 'bills',     label: 'فواتير الخدمات',      icon: Zap,             gradient: 'from-yellow-400 to-amber-500',  glow: 'shadow-yellow-500/40',  badge: null },
    { id: 'finance',   label: 'المالية والتسوية',    icon: Calculator,      gradient: 'from-emerald-500 to-teal-500',  glow: 'shadow-emerald-500/40', badge: null },
  ];

  /* ── Mobile bottom bar (5 tabs) ── */
  const mobileItems = [
    { id: 'dashboard', label: 'الرئيسية',   icon: LayoutDashboard },
    { id: 'beds',      label: 'السراير',    icon: Bed              },
    { id: 'expenses',  label: 'المصروفات',  icon: Receipt          },
    { id: 'bills',     label: 'الفواتير',   icon: Zap              },
    { id: 'finance',   label: 'المالية',    icon: Calculator       },
  ];

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 bg-slate-900/60 border-l border-slate-800 p-3 flex-col gap-1.5 shrink-0 no-print">
        <p className="text-[10px] font-bold text-slate-500 px-3 py-1 uppercase tracking-widest">القائمة الرئيسية</p>
        {desktopItems.map((item) => {
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

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 no-print"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Glass pill container */}
        <div className="bg-slate-950/85 backdrop-blur-2xl border-t border-slate-800/70 shadow-[0_-8px_32px_rgba(0,0,0,0.55)]">
          <div className="flex items-stretch justify-around px-2 pt-2 pb-1.5">
            {mobileItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5 rounded-xl transition-all duration-150 active:scale-90 select-none relative min-w-0"
                >
                  {/* Pill indicator behind icon */}
                  <div className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/15'
                      : ''
                  }`}>
                    <Icon
                      className={`w-[22px] h-[22px] transition-all duration-200 ${
                        isActive
                          ? 'text-indigo-400 scale-110'
                          : 'text-slate-500'
                      }`}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {/* Beds badge */}
                    {item.id === 'beds' && (
                      <span className={`absolute -top-1 -right-2 text-[9px] font-black px-1 rounded-full leading-tight ${
                        isActive ? 'bg-indigo-400 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {occupiedBedsCount}/{data.beds.length}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-[10px] leading-none transition-all duration-200 ${
                    isActive ? 'font-bold text-indigo-300' : 'font-medium text-slate-500'
                  }`}>
                    {item.label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
