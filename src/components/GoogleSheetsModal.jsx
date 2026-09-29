import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  getGoogleScriptUrl,
  getGoogleSheetLink,
  testConnection
} from '../services/googleSheetsService';
import { APPS_SCRIPT_CODE } from '../data/appsScriptCode';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  Copy,
  Check,
  X,
  RefreshCw,
  HelpCircle,
  Save
} from 'lucide-react';

export const GoogleSheetsModal = ({ isOpen, onClose }) => {
  const {
    syncStatus,
    refreshFromGoogleSheets,
    syncAllToGoogleSheets,
    saveGoogleSheetsConfig,
    showToast
  } = useApp();

  const [scriptUrl, setScriptUrl] = useState('');
  const [sheetLink, setSheetLink] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScriptUrl(getGoogleScriptUrl());
      setSheetLink(getGoogleSheetLink());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveGoogleSheetsConfig(scriptUrl, sheetLink);
    showToast('تم حفظ إعدادات Google Sheets بنجاح');
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) {
      setTestResult({ success: false, message: 'يرجى إدخال رابط Google Apps Script أولاً' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      // Save temporarily to test
      saveGoogleSheetsConfig(scriptUrl, sheetLink);
      const res = await testConnection();
      setTestResult({
        success: true,
        message: `تم الاتصال بنجاح بالشيت: "${res.sheetName || 'جوجل شيت'}"`
      });
      showToast('الاتصال بجوجل شيت سليم 100%!');
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'فشل الاتصال بجوجل شيت، تأكد من إعدادات النشر (Who has access: Anyone)'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncAll = async () => {
    if (!window.confirm('هل تريد رفع كل بيانات السيستم الحالية إلى Google Sheet؟ سيتم تحديث الشيت بكل البيانات المسجلة.')) {
      return;
    }
    setSyncingAll(true);
    try {
      await syncAllToGoogleSheets();
    } finally {
      setSyncingAll(false);
    }
  };

  const copyScriptCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    showToast('تم نسخ كود Google Apps Script بنجاح');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                ربط Google Sheets أونلاين
              </h2>
              <p className="text-xs text-slate-400">
                مزامنة لحظية وتخزين سحابي مباشر على جوجل شيت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Status Badge */}
          <div className="p-4 rounded-2xl border bg-slate-950/60 border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400">حالة الربط الحالية:</span>
              {syncStatus === 'synced' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  متصل ومتزامن لحظياً
                </span>
              )}
              {syncStatus === 'saving' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  جاري الحفظ في جوجل شيت...
                </span>
              )}
              {syncStatus === 'loading' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  جاري تحميل البيانات من الشيت...
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  تعذر الاتصال (العمل محلياً)
                </span>
              )}
              {syncStatus === 'unconfigured' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  غير مربوط بعد
                </span>
              )}
            </div>

            {sheetLink && (
              <a
                href={sheetLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95"
              >
                <span>فتح شيت جوجل للمتابعة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Apps Script Web App URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              رابط تطبيق الويب (Google Apps Script Web App URL):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                dir="ltr"
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-600/20"
              >
                <Save className="w-4 h-4" />
                <span>حفظ</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              يتم حفظ الرابط في متصفحك تلقائياً ليعمل على الدوام.
            </p>
          </div>

          {/* Google Sheet Direct Link for convenience */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              رابط صفحة Google Sheets المباشر (اختياري لسرعة فتحه):
            </label>
            <input
              type="url"
              value={sheetLink}
              onChange={(e) => setSheetLink(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdB.../edit"
              dir="ltr"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Test Connection Button & Result */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>اختبار الاتصال بالشيت</span>
              </button>

              <button
                type="button"
                onClick={() => refreshFromGoogleSheets(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
                <span>سحب أحدث البيانات من الشيت</span>
              </button>

              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncingAll}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {syncingAll ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />}
                <span>رفع كل بيانات السيستم الحالية إلى شيت جوجل 🚀</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-slide-up ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Quick Setup Instructions Accordion */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-slate-300 border border-slate-800 text-xs font-bold transition-colors"
            >
              <span className="flex items-center gap-2 text-indigo-400">
                <HelpCircle className="w-4 h-4" />
                كيف تجهز Google Sheet لأول مرة؟ (خطوات سريعة بالصور)
              </span>
              <span>{showInstructions ? '▲ إخفاء' : '▼ عرض الخطوات'}</span>
            </button>

            {showInstructions && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs text-slate-300 leading-relaxed animate-slide-up">
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>
                    افتح شيت جوجل جديد من الرابط:{' '}
                    <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-mono">
                      sheets.new
                    </a>
                  </li>
                  <li>
                    من القائمة العلوية في جوجل شيت اضغط: <strong className="text-white">Extensions (الإضافات)</strong> ➔ <strong className="text-white">Apps Script</strong>.
                  </li>
                  <li>
                    امسح أي كود موجود في المحرر وضع بدلاً منه كود <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">google_apps_script.js</code> الموجود في المشروع.
                  </li>
                  <li>
                    اضغط على الزر الأزرق أعلى اليمين: <strong className="text-white">Deploy ➔ New deployment</strong>.
                  </li>
                  <li>
                    اضغط على أيقونة الترس بجانب Select type واختر <strong className="text-emerald-400">Web app</strong>.
                  </li>
                  <li>
                    في خانة <strong className="text-white">Who has access</strong> اختر: <strong className="text-amber-400">Anyone (أي شخص)</strong> حتى يتصل السيستم بدون تسجيل دخول معقد.
                  </li>
                  <li>
                    اضغط <strong className="text-white">Deploy</strong> ووافق على الصلاحيات، ثم انسخ رابط الـ Web app وضعه في الخانة بالأعلى واضغط حفظ!
                  </li>
                  <li>
                    أخيراً، اضغط زر <strong className="text-emerald-400 font-bold">"رفع كل بيانات السيستم الحالية إلى شيت جوجل"</strong> ليتم إنشاء كل الجداول وملؤها بالبيانات فوراً!
                  </li>
                </ol>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={copyScriptCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'تم النسخ!' : 'نسخ كود Apps Script'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            البيانات تحفظ فورياً في شيت جوجل ومتزامنة على كل الأجهزة
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
