import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGoogleSheetLink } from '../services/googleSheetsService';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  X,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  LogOut,
  Calendar,
  Clock,
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export const ActivityLogModal = ({ isOpen, onClose }) => {
  const { activityLogs, refreshActivityLogsOnly, isSheetsConnected } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sheetLink = getGoogleSheetLink();

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshActivityLogsOnly();
    } finally {
      setIsRefreshing(false);
    }
  };

  const sectionsList = [
    { id: 'all', label: 'كل الأقسام' },
    { id: 'المصروفات', label: 'المصروفات' },
    { id: 'إيداعات رأس المال', label: 'رأس المال' },
    { id: 'السراير والمستأجرين', label: 'السراير والمستأجرين' },
    { id: 'الفواتير الشهرية', label: 'الفواتير' },
    { id: 'النظام', label: 'النظام' }
  ];

  const actionsList = [
    { id: 'all', label: 'كل العمليات' },
    { id: 'إضافة', label: 'إضافة' },
    { id: 'تعديل', label: 'تعديل' },
    { id: 'حذف', label: 'حذف' },
    { id: 'تسديد', label: 'تسديد إيجار' },
    { id: 'إخلاء', label: 'إخلاء سرير' }
  ];

  const filteredLogs = (activityLogs || []).filter(log => {
    const matchesSearch = !searchTerm.trim() || 
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.actionType && log.actionType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.section && log.section.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSection = selectedSection === 'all' || 
      (log.section && log.section.includes(selectedSection));

    const matchesAction = selectedAction === 'all' || 
      (log.actionType && log.actionType.includes(selectedAction));

    return matchesSearch && matchesSection && matchesAction;
  });

  const getActionBadge = (actionType) => {
    const act = actionType || '';
    if (act.includes('حذف')) {
      return {
        bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        icon: <Trash2 className="w-3.5 h-3.5" />
      };
    }
    if (act.includes('إضافة')) {
      return {
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: <PlusCircle className="w-3.5 h-3.5" />
      };
    }
    if (act.includes('تسديد')) {
      return {
        bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />
      };
    }
    if (act.includes('إخلاء')) {
      return {
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: <LogOut className="w-3.5 h-3.5" />
      };
    }
    return {
      bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      icon: <Edit3 className="w-3.5 h-3.5" />
    };
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  سجل التعديلات والعمليات المباشر
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activityLogs.length} حركة
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تسجيل حي وفوري لكل (إضافة / تعديل / حذف / سداد) بتاريخ وساعة التنفيذ في شيت جوجل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sheetLink && (
              <a
                href={sheetLink}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                title="فتح الشيت على Google Drive"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>صفحة السجل بالشيت</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {isSheetsConnected && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="تحديث السجل من شيت جوجل"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث في تفاصيل الحركة، التاريخ، البيان، المستأجر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Filter by Section */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-indigo-500"
            >
              {sectionsList.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            {/* Filter by Action Type */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-indigo-500"
            >
              {actionsList.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notice banner */}
        <div className="px-4 py-2.5 bg-indigo-950/30 border-b border-indigo-900/30 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              جميع الحركات المسجلة هنا تُحفظ آلياً في شيت جوجل بصفحة مستقلة باسم: 
              <strong className="text-white font-black mx-1">"سجل التعديلات والعمليات"</strong>
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-indigo-300/80">
            مرتبة من الأحدث إلى الأقدم
          </span>
        </div>

        {/* Content: List of Logs */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
              <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300 mb-1">
                {searchTerm || selectedSection !== 'all' || selectedAction !== 'all'
                  ? 'لا توجد نتائج تطابق خيارات البحث الحالية'
                  : 'لا توجد تعديلات مسجلة بعد'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                أي عملية تقوم بها من الآن (إضافة مصروف، تعديل سرير، تسديد إيجار، حذف إيداع، إلخ) ستسجل فوراً بالتاريخ والساعة هنا وفي صفحة خاصة في شيت جوجل.
              </p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const badge = getActionBadge(log.actionType);
              const hasAmount = log.amount !== undefined && log.amount !== null && log.amount !== '-' && log.amount !== '';

              return (
                <div
                  key={log.id || index}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-3.5 sm:p-4 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Action Icon Pill */}
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${badge.bg}`}>
                      {badge.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Top Meta: Action + Section + Timestamp */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg}`}>
                          {log.actionType}
                        </span>
                        {log.section && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-700/60 text-slate-300 border border-slate-600/50">
                            {log.section}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mr-auto font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {log.date}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1 text-slate-300 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {log.time}
                          </span>
                        </div>
                      </div>

                      {/* Main Details */}
                      <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed break-words">
                        {log.details}
                      </p>

                      {/* Extra Notes if present */}
                      {log.notes && (
                        <p className="text-[11px] text-slate-400 mt-1 italic flex items-center gap-1">
                          <span className="text-slate-500 font-normal">ملاحظات:</span> {log.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount / Value if present */}
                  {hasAmount && (
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-r border-slate-700/60 pt-2 sm:pt-0 sm:pr-4 shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-medium">المبلغ / القيمة</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                        {typeof log.amount === 'number' ? log.amount.toLocaleString() : log.amount}
                        <span className="text-[10px] text-emerald-400/70 mr-1">ج.م</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-right">
            <span>تحديث فوري مع كل حركة ⚡ بدون أي تأخير</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {sheetLink && (
              <a
                href={sheetLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold transition-all"
              >
                <span>فتح Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
