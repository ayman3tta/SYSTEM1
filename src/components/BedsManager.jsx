import React, { useState, useMemo } from 'react';
import { useApp, availableMonthsList } from '../context/AppContext';
import { BedModal } from './BedModal';
import { VacateBedModal } from './VacateBedModal';
import { QuickPayRentModal } from './QuickPayRentModal';
import { QuickPayDepositModal } from './QuickPayDepositModal';
import { 
  Bed, 
  Plus, 
  Edit3, 
  Calendar, 
  UserMinus, 
  DollarSign, 
  CheckCircle2,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

export const BedsManager = () => {
  const { 
    currentBedsList,
    selectedMonth, 
    setSelectedMonth, 
    startNewMonth,
    latestStartedMonth,
    totalBedsCount, 
    occupiedBedsCount, 
    occupancyRate,
    totalCollectedCurrentRent,
    totalRemainingCurrentRent,
    totalCollectedDeposit,
  } = useApp();

  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [isVacateModalOpen, setIsVacateModalOpen] = useState(false);
  const [isPayRentModalOpen, setIsPayRentModalOpen] = useState(false);
  const [isPayDepositModalOpen, setIsPayDepositModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);

  // Group beds by room
  const rooms = useMemo(() => {
    const grouped = {};
    currentBedsList.forEach(bed => {
      if (!grouped[bed.roomName]) grouped[bed.roomName] = [];
      grouped[bed.roomName].push(bed);
    });
    return grouped;
  }, [currentBedsList]);

  const handleOpenAdd = () => { setSelectedBed(null); setIsBedModalOpen(true); };
  const handleOpenEdit = (bed) => { setSelectedBed(bed); setIsBedModalOpen(true); };
  const handleOpenVacate = (bed) => { setSelectedBed(bed); setIsVacateModalOpen(true); };
  const handleOpenPayRent = (bed) => { setSelectedBed(bed); setIsPayRentModalOpen(true); };
  const handleOpenPayDeposit = (bed) => { setSelectedBed(bed); setIsPayDepositModalOpen(true); };

  const currentMonthIdx = availableMonthsList.indexOf(selectedMonth);
  const latestStartedIdx = availableMonthsList.indexOf(latestStartedMonth);

  // الزر يظهر فقط إذا كان المستخدم واقفاً على أحدث شهر مفعل حالياً (وليس الشهور السابقة)
  const isLatestActiveMonth = currentMonthIdx === latestStartedIdx;
  const isPastArchivedMonth = currentMonthIdx < latestStartedIdx;
  const nextMonthName = currentMonthIdx >= 0 && currentMonthIdx < availableMonthsList.length - 1 
    ? availableMonthsList[currentMonthIdx + 1] 
    : null;

  const canStartNextMonth = isLatestActiveMonth && Boolean(nextMonthName);

  const handleStartNextMonth = () => {
    if (!nextMonthName) return;
    if (window.confirm(`هل تريد تفعيل إيجارات (${nextMonthName})؟\nسيتم ترحيل المستأجرين تلقائياً وتصفير الإيجارات 0.`)) {
      startNewMonth(nextMonthName);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Bed className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">السراير والمستأجرين</h2>
            <p className="text-[11px] text-slate-400">{occupiedBedsCount}/{totalBedsCount} مؤجرة · {occupancyRate}% إشغال</p>
          </div>
        </div>
        {canStartNextMonth ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNextMonth}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              بدء {nextMonthName}
            </button>
          </div>
        ) : (
          isPastArchivedMonth && (
            <div className="flex items-center gap-1.5 bg-slate-800/80 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700/50">
              <span>شهر مؤرشف سابق</span>
            </div>
          )
        )}
      </div>

      {/* ── Month selector + quick stats strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Month Picker */}
        <div className="glass-card rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer w-full"
          >
            {availableMonthsList.map(m => (
              <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 pointer-events-none" />
        </div>

        {/* Collected Rent */}
        <div className="glass-card rounded-xl px-3 py-2.5 text-center">
          <div className="text-[10px] text-slate-400 mb-0.5">إيجار محصّل</div>
          <div className="text-sm font-black text-emerald-400">{totalCollectedCurrentRent.toLocaleString()} ج.م</div>
        </div>

        {/* Remaining Rent */}
        <div className="glass-card rounded-xl px-3 py-2.5 text-center">
          <div className="text-[10px] text-slate-400 mb-0.5">متبقي</div>
          <div className={`text-sm font-black ${totalRemainingCurrentRent > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
            {totalRemainingCurrentRent.toLocaleString()} ج.م
          </div>
        </div>
      </div>

      {/* ── Rooms ── */}
      <div className="space-y-4">
        {Object.entries(rooms).map(([roomName, bedsInRoom]) => (
          <div key={roomName} className="glass-card p-4 rounded-2xl space-y-3">
            {/* Room header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🏠</span>
                <h3 className="font-bold text-white text-sm">{roomName}</h3>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{bedsInRoom.length} سراير</span>
              </div>
              <span className="text-xs text-emerald-400 font-bold">
                {bedsInRoom.reduce((a, b) => a + Number(b.monthlyPrice), 0).toLocaleString()} ج.م
              </span>
            </div>

            {/* Beds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {bedsInRoom.map(bed => {
                const isOccupied = bed.status === 'مؤجر';
                const isRentPaid = isOccupied && Number(bed.rentRemaining || 0) === 0;

                return (
                  <div
                    key={bed.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isOccupied
                        ? 'bg-slate-900/70 border-slate-700'
                        : 'bg-slate-900/30 border-dashed border-slate-700 opacity-70'
                    }`}
                  >
                    {/* Bed title row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">سرير {bed.bedNumber}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">({bed.monthlyPrice} ج.م)</span>
                      </div>
                      {isOccupied ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isRentPaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {isRentPaid ? '✓ مدفوع' : 'متبقي'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">شاغر</span>
                      )}
                    </div>

                    {isOccupied ? (
                      <>
                        {/* Tenant info */}
                        <div className="text-xs text-indigo-300 font-bold mb-1 truncate">{bed.tenantName || 'غير مسجل'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mb-2">{bed.startDate || ''}</div>

                        {/* Deposit + Rent mini badges */}
                        <div className="flex gap-1.5 mb-2.5 flex-wrap">
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
                            تأمين: <strong className="text-emerald-400">{bed.depositPaid}/{bed.depositRequired}</strong>
                          </span>
                          <span className={`text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg ${isRentPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                            إيجار: {bed.rentPaid}/{bed.rentRequired || bed.monthlyPrice}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 items-center">
                          <button
                            onClick={() => handleOpenPayRent(bed)}
                            className="flex-1 text-center py-1.5 px-1 text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg transition-colors truncate"
                            title="تسديد إيجار"
                          >
                            تسديد إيجار
                          </button>
                          <button
                            onClick={() => handleOpenPayDeposit(bed)}
                            className={`flex-1 text-center py-1.5 px-1 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 truncate ${
                              Number(bed.depositRemaining || 0) > 0
                                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300'
                            }`}
                            title={Number(bed.depositRemaining || 0) > 0 ? `متبقي تأمين: ${bed.depositRemaining} ج.م` : 'إضافة أو تعديل تأمين'}
                          >
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                            <span>{Number(bed.depositRemaining || 0) > 0 ? 'سداد تأمين' : 'تأمين'}</span>
                          </button>
                          <button
                            onClick={() => handleOpenVacate(bed)}
                            className="py-1.5 px-2 text-[11px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg transition-colors shrink-0"
                            title="إخلاء"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(bed)}
                            className="py-1.5 px-2 text-[11px] bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors shrink-0"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenEdit(bed)}
                        className="w-full py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors mt-1"
                      >
                        تأجير لمستأجر
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <BedModal isOpen={isBedModalOpen} onClose={() => setIsBedModalOpen(false)} bedToEdit={selectedBed} />
      <VacateBedModal isOpen={isVacateModalOpen} onClose={() => setIsVacateModalOpen(false)} bed={selectedBed} />
      <QuickPayRentModal isOpen={isPayRentModalOpen} onClose={() => setIsPayRentModalOpen(false)} bed={selectedBed} />
      <QuickPayDepositModal isOpen={isPayDepositModalOpen} onClose={() => setIsPayDepositModalOpen(false)} bed={selectedBed} />
    </div>
  );
};
