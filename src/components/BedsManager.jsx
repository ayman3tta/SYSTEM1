import React, { useState, useMemo } from 'react';
import { useApp, availableMonthsList } from '../context/AppContext';
import { BedModal } from './BedModal';
import { VacateBedModal } from './VacateBedModal';
import { QuickPayRentModal } from './QuickPayRentModal';
import { 
  Bed, 
  Plus, 
  Edit3, 
  Calendar, 
  UserMinus, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react';

export const BedsManager = () => {
  const { 
    currentBedsList,
    selectedMonth, 
    setSelectedMonth, 
    startNewMonth,
    totalBedsCount, 
    occupiedBedsCount, 
    occupancyRate,
    totalExpectedMonthlyRent,
    totalCollectedDeposit,
    totalRemainingDeposit,
    totalCollectedCurrentRent,
    totalRemainingCurrentRent,
    totalCollectedFromTenants
  } = useApp();

  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [isVacateModalOpen, setIsVacateModalOpen] = useState(false);
  const [isPayRentModalOpen, setIsPayRentModalOpen] = useState(false);

  const [selectedBed, setSelectedBed] = useState(null);

  // Group current beds by room
  const rooms = useMemo(() => {
    const grouped = {};
    currentBedsList.forEach(bed => {
      if (!grouped[bed.roomName]) {
        grouped[bed.roomName] = [];
      }
      grouped[bed.roomName].push(bed);
    });
    return grouped;
  }, [currentBedsList]);

  const handleOpenAdd = () => {
    setSelectedBed(null);
    setIsBedModalOpen(true);
  };

  const handleOpenEdit = (bed) => {
    setSelectedBed(bed);
    setIsBedModalOpen(true);
  };

  const handleOpenVacate = (bed) => {
    setSelectedBed(bed);
    setIsVacateModalOpen(true);
  };

  const handleOpenPayRent = (bed) => {
    setSelectedBed(bed);
    setIsPayRentModalOpen(true);
  };

  // Find next month name
  const currentMonthIdx = availableMonthsList.indexOf(selectedMonth);
  const nextMonthName = currentMonthIdx >= 0 && currentMonthIdx < availableMonthsList.length - 1 
    ? availableMonthsList[currentMonthIdx + 1] 
    : 'الشهر القادم';

  const handleStartNextMonth = () => {
    if (window.confirm(`هل تريد تفعيل حسابات وإيجارات (${nextMonthName})؟\nسيتم ترحيل المستأجرين والتأمينات تلقائياً وتصفير إيجار الشهر الجديد لتسجيل تحصيل الشهر!`)) {
      startNewMonth(nextMonthName);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Month Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            إدارة السراير والمستأجرين ({occupiedBedsCount}/{totalBedsCount} مؤجرة)
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            متابعة إيجارات الأشهر، تغيير المستأجرين، واسترداد التأمين عند إبلاغ المغادرة قبلها بـ 15 يوماً.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-xs flex-1 sm:flex-none justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400 text-[10px]">الشهر:</span>
            </div>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              {availableMonthsList.map(m => (
                <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
              ))}
            </select>
          </div>

          {/* Start New Month Button */}
          <button
            onClick={handleStartNextMonth}
            className="flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all active:scale-95 whitespace-nowrap"
            title="ترحيل البيانات لبدء شهر جديد"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>بدء إيجار ({nextMonthName})</span>
          </button>

          {/* Add Bed Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl text-xs border border-slate-700 transition-colors active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة سرير</span>
          </button>
        </div>
      </div>

      {/* Selected Month Financial Progress Strip */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl border-r-4 border-r-indigo-500 grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-slate-400 text-[11px]">الشهر المعروض:</span>
          <div className="text-sm sm:text-base font-black text-indigo-300">{selectedMonth}</div>
        </div>
        <div className="space-y-0.5">
          <span className="text-slate-400 text-[11px]">إيجار المحصّل:</span>
          <div className="text-sm sm:text-base font-black text-emerald-400">{totalCollectedCurrentRent.toLocaleString()} ج.م</div>
        </div>
        <div className="space-y-0.5">
          <span className="text-slate-400 text-[11px]">المتبقي تحصيله:</span>
          <div className={`text-sm sm:text-base font-black ${totalRemainingCurrentRent > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {totalRemainingCurrentRent.toLocaleString()} ج.م
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-slate-400 text-[11px]">التأمين المودع:</span>
          <div className="text-sm sm:text-base font-black text-blue-400">{totalCollectedDeposit.toLocaleString()} ج.م</div>
        </div>
        <div className="space-y-0.5 col-span-2 lg:col-span-1">
          <span className="text-slate-400 text-[11px]">نسبة إشغال الشقة:</span>
          <div className="text-sm sm:text-base font-black text-purple-400">{occupancyRate}% ({occupiedBedsCount} من {totalBedsCount})</div>
        </div>
      </div>

      {/* Insurance Refund Rule Notice */}
      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-start gap-2.5 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block text-xs">سياسة التأمين واسترداده:</span>
          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
            يتم دفع التأمين أول مرة عند بداية استئجار السرير. وعند مغادرة المستأجر، يُسترد مبلغ التأمين كاملاً بشرط إبلاغ الإدارة قبل المغادرة بـ <strong>15 يوماً</strong>.
          </p>
        </div>
      </div>

      {/* Rooms Visual Layout */}
      <div className="space-y-5">
        {Object.entries(rooms).map(([roomName, bedsInRoom]) => (
          <div key={roomName} className="glass-card p-4 sm:p-5 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs sm:text-sm">
                  🏠
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">{roomName}</h3>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {bedsInRoom.length} سراير
                </span>
              </div>
              <span className="text-xs text-slate-400">
                إجمالي: <strong className="text-emerald-400">{bedsInRoom.reduce((a, b) => a + Number(b.monthlyPrice), 0).toLocaleString()} ج.م</strong>
              </span>
            </div>

            {/* Beds Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bedsInRoom.map(bed => {
                const isOccupied = bed.status === 'مؤجر';
                const isRentFullyPaid = isOccupied && Number(bed.rentRemaining || 0) === 0;

                return (
                  <div 
                    key={bed.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isOccupied 
                        ? 'bg-slate-900/80 border-slate-700/70 hover:border-indigo-500/50' 
                        : 'bg-slate-900/40 border-dashed border-slate-700 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">سرير {bed.bedNumber}</span>
                        <span className="text-xs font-mono text-emerald-400">({bed.monthlyPrice} ج.م)</span>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isOccupied ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {bed.status}
                      </span>
                    </div>

                    {isOccupied ? (
                      <div className="mt-2.5 space-y-2 text-xs border-t border-slate-800 pt-2">
                        <div className="flex justify-between items-center text-white">
                          <span className="text-slate-400">المستأجر:</span>
                          <span className="font-bold text-indigo-300">{bed.tenantName || 'غير مسجل'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300 text-[11px]">
                          <span className="text-slate-400">بداية العقد:</span>
                          <span className="font-mono text-[10px]">{bed.startDate || '-'}</span>
                        </div>

                        {/* Security Deposit Box */}
                        <div className="bg-slate-800/80 p-2 rounded-lg space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">التأمين المودع:</span>
                            <span className="font-bold text-emerald-400">{bed.depositPaid} / {bed.depositRequired}</span>
                          </div>
                          {bed.depositRemaining > 0 && (
                            <div className="flex justify-between text-amber-400 font-medium text-[10px]">
                              <span>متبقي تأمين:</span>
                              <span>{bed.depositRemaining} ج.م</span>
                            </div>
                          )}
                        </div>

                        {/* Rent Collection Box for Selected Month */}
                        <div className="bg-slate-800/80 p-2 rounded-lg space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">إيجار ({selectedMonth}):</span>
                            <span className={`font-bold ${isRentFullyPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                              مدفوع {bed.rentPaid} / {bed.rentRequired || bed.monthlyPrice}
                            </span>
                          </div>
                          {bed.notes && (
                            <div className="text-[10px] text-slate-400 italic">
                              * {bed.notes}
                            </div>
                          )}
                        </div>

                        {/* Card Quick Actions */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                          <button
                            onClick={() => handleOpenPayRent(bed)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold active:scale-95 transition-all text-xs"
                            title="تسديد إيجار الشهر"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>تسديد إيجار</span>
                          </button>

                          <button
                            onClick={() => handleOpenVacate(bed)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 active:scale-95 transition-all text-xs"
                            title="إخلاء واسترداد التأمين"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>إخلاء</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(bed)}
                            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 active:scale-95"
                            title="تعديل البيانات"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div className="mt-3 py-2 text-center space-y-2">
                        <span className="text-xs text-slate-400 block">شاغر ومتاح للإيجار</span>
                        <button
                          onClick={() => handleOpenEdit(bed)}
                          className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs active:scale-95 transition-transform"
                        >
                          تأجير لمستأجر جديد
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Beds Table for Desktop (md and up) */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-700/60">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">جدول تفاصيل السراير والمستأجرين ({selectedMonth})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-3">الغرفة</th>
                <th className="py-3 px-3">السرير</th>
                <th className="py-3 px-3">السعر</th>
                <th className="py-3 px-3">اسم المستأجر</th>
                <th className="py-3 px-3">تاريخ العقد</th>
                <th className="py-3 px-3 text-center">التأمين المودع</th>
                <th className="py-3 px-3 text-center">إيجار {selectedMonth}</th>
                <th className="py-3 px-3">ملاحظات</th>
                <th className="py-3 px-3 text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {currentBedsList.map(bed => (
                <tr key={bed.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{bed.roomName}</td>
                  <td className="py-3 px-3 text-indigo-300">سرير {bed.bedNumber}</td>
                  <td className="py-3 px-3 font-semibold text-slate-300">{bed.monthlyPrice} ج.م</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{bed.tenantName || '-'}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{bed.startDate || '-'}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-400">{bed.depositPaid} / {bed.depositRequired}</td>
                  <td className="py-3 px-3 text-center font-bold text-blue-400">{bed.rentPaid} / {bed.rentRequired || bed.monthlyPrice}</td>
                  <td className="py-3 px-3 text-[11px] text-slate-400">{bed.notes || '-'}</td>
                  <td className="py-3 px-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenPayRent(bed)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
                        title="تسديد الإيجار"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(bed)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300"
                        title="تعديل"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BedModal
        isOpen={isBedModalOpen}
        onClose={() => setIsBedModalOpen(false)}
        bedToEdit={selectedBed}
      />

      <VacateBedModal
        isOpen={isVacateModalOpen}
        onClose={() => setIsVacateModalOpen(false)}
        bed={selectedBed}
      />

      <QuickPayRentModal
        isOpen={isPayRentModalOpen}
        onClose={() => setIsPayRentModalOpen(false)}
        bed={selectedBed}
      />

    </div>
  );
};
