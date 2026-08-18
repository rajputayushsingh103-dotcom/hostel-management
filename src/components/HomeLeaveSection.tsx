// src/components/HomeLeaveSection.tsx
import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Phone,
  User,
  Plus,
  Building,
  FileText,
  QrCode,
  ShieldCheck,
  Lock,
  Dumbbell,
  Settings,
  AlertCircle,
  Trash2,
  X,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { HomeLeavePass, LeaveStatus, PassCategory, Role, UserAuthSession, OutingRulesConfig, GymMemberRecord, BlockName } from '../types';

interface HomeLeaveSectionProps {
  leavePasses: HomeLeavePass[];
  onApplyLeavePass: (newPass: Omit<HomeLeavePass, 'id' | 'createdAt' | 'status' | 'parentSmsSent'>) => void;
  onUpdateLeaveStatus: (id: string, status: LeaveStatus, resendSms?: boolean) => void;
  userSession: UserAuthSession;
  role: Role;
  outingRules: OutingRulesConfig;
  onUpdateOutingRules: (newRules: OutingRulesConfig) => void;
  onRecordGateScan: (id: string, action: 'EXITED' | 'RE_ENTERED', guardName?: string) => void;
}

const DEFAULT_GYM_MEMBERS: GymMemberRecord[] = [
  {
    id: 'gym-1',
    studentName: 'Aayush Singh',
    rollNo: '2024CS101',
    roomNumber: 'Tagore-101',
    block: 'Tagore',
    year: 3,
    gymShift: '05:00 PM - 07:00 PM',
    assignedBy: 'Chief Warden Office',
    validUntil: '2026-12-31'
  }
];

export const HomeLeaveSection: React.FC<HomeLeaveSectionProps> = ({
  leavePasses,
  onApplyLeavePass,
  onUpdateLeaveStatus,
  userSession,
  role,
  outingRules,
  onUpdateOutingRules,
  onRecordGateScan
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showGateTerminalModal, setShowGateTerminalModal] = useState(false);
  const [showRulesConfigModal, setShowRulesConfigModal] = useState(false);
  const [showGymRegistryModal, setShowGymRegistryModal] = useState(false);
  const [viewDigitalPass, setViewDigitalPass] = useState<HomeLeavePass | null>(null);

  const [gymMembers, setGymMembers] = useState<GymMemberRecord[]>(() => {
    const saved = localStorage.getItem('hostel_gym_members');
    return saved ? JSON.parse(saved) : DEFAULT_GYM_MEMBERS;
  });

  const [gymStudentName, setGymStudentName] = useState('');
  const [gymStudentRoll, setGymStudentRoll] = useState('');
  const [gymStudentRoom, setGymStudentRoom] = useState('');
  const [gymBlock, setGymBlock] = useState<BlockName>('Tagore');
  const [gymYear, setGymYear] = useState(1);
  const [gymShiftTime, setGymShiftTime] = useState('05:00 PM - 07:00 PM');

  useEffect(() => {
    localStorage.setItem('hostel_gym_members', JSON.stringify(gymMembers));
  }, [gymMembers]);

  // Form Fields
  const [passCategory, setPassCategory] = useState<PassCategory>('Local Outing');
  const [destination, setDestination] = useState('');

  const [localLiveDateTime, setLocalLiveDateTime] = useState('');
  const [depDate, setDepDate] = useState('');
  const [depTime, setDepTime] = useState('10:00 AM');
  const [retDate, setRetDate] = useState('');
  const [retTime, setRetTime] = useState('08:00 PM');
  const [homeReturnDay, setHomeReturnDay] = useState('');

  // Visual Calendar Modal States
  const [activePickerTarget, setActivePickerTarget] = useState<'departure' | 'return' | null>(null);
  const [calendarViewMonth, setCalendarViewMonth] = useState(new Date().getMonth());
  const [calendarViewYear, setCalendarViewYear] = useState(new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');
  const [selectedTimeHour, setSelectedTimeHour] = useState('10');
  const [selectedTimeMinute, setSelectedTimeMinute] = useState('00');
  const [selectedTimeAmPm, setSelectedTimeAmPm] = useState<'AM' | 'PM'>('AM');

  const [reasonOrAddress, setReasonOrAddress] = useState('');
  const [parentPhone, setParentPhone] = useState(userSession.parentPhone || '+91 98123 45678');
  const [studentPhone, setStudentPhone] = useState('+91 98765 43210');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [formError, setFormError] = useState('');

  const studentYear = userSession.year || 1;
  const currentStudentRoll = (userSession.rollNo || '').trim().toUpperCase();

  const studentGymRecord = gymMembers.find((g) => g.rollNo.trim().toUpperCase() === currentStudentRoll);
  const isStudentGymMember = role === 'student' && !!studentGymRecord;

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const todayDayName = dayNames[now.getDay()];

  const getLiveDateAndTimeString = () => {
    const d = new Date();
    const datePart = d.toISOString().split('T')[0];
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} (${dayNames[d.getDay()]}) ${timePart}`;
  };

  useEffect(() => {
    if (showApplyModal) {
      setLocalLiveDateTime(getLiveDateAndTimeString());
      setDepDate('');
      setDepTime('10:00 AM');
      setRetDate('');
      setRetTime('08:00 PM');
      setHomeReturnDay('');
      setDestination('');
      setReasonOrAddress('');
      setFormError('');
    }
  }, [showApplyModal]);

  const handleOpenCalendar = (target: 'departure' | 'return') => {
    setActivePickerTarget(target);
    const baseDate = target === 'return' && retDate ? new Date(retDate) : (depDate ? new Date(depDate) : new Date());
    setCalendarViewMonth(baseDate.getMonth());
    setCalendarViewYear(baseDate.getFullYear());
    setSelectedCalendarDate(target === 'departure' ? depDate : retDate);
  };

  const handleConfirmCalendarDateTime = () => {
    if (!selectedCalendarDate) {
      alert('Kripya calendar se date select karein!');
      return;
    }

    const formattedTime = `${selectedTimeHour}:${selectedTimeMinute} ${selectedTimeAmPm}`;

    if (activePickerTarget === 'departure') {
      setDepDate(selectedCalendarDate);
      setDepTime(formattedTime);
    } else {
      setRetDate(selectedCalendarDate);
      setRetTime(formattedTime);
      const selectedObj = new Date(selectedCalendarDate);
      setHomeReturnDay(dayNames[selectedObj.getDay()]);
    }
    setActivePickerTarget(null);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const checkApplicationWindow = (category: PassCategory) => {
    if (category === 'Outstation Vacation') {
      return { isOpen: true, message: '✈️ Home / Night Stay Leave: Open 24x7.' };
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinute;

    const min430PM = 16 * 60 + 30;
    const max600PM = 18 * 60;
    const min900AM = 9 * 60;
    const max1200PM = 12 * 60;

    if (todayDayName === 'Sunday') {
      const isMorningSlot = totalMinutes >= min900AM && totalMinutes <= max1200PM;
      const isEveningSlot = totalMinutes >= min430PM && totalMinutes <= max600PM;

      if (isMorningSlot || isEveningSlot) {
        return {
          isOpen: true,
          message: `✅ Sunday Application Window Open (${isMorningSlot ? 'Morning 9 AM - 12 PM' : 'Evening 4:30 PM - 6:00 PM'})`
        };
      } else {
        return {
          isOpen: false,
          message: '🔒 Sunday Portal Closed: Allowed only between (09:00 AM - 12:00 PM) and (04:30 PM - 06:00 PM).'
        };
      }
    }

    const isWeekdaySlot = totalMinutes >= min430PM && totalMinutes <= max600PM;
    if (isWeekdaySlot) {
      return {
        isOpen: true,
        message: '✅ Evening Outing Window Open (4:30 PM - 6:00 PM).'
      };
    } else {
      return {
        isOpen: false,
        message: `🔒 Application Window Closed: Weekday window is strictly 04:30 PM to 06:00 PM.`
      };
    }
  };

  const checkOutingEligibility = (category: PassCategory) => {
    if (category === 'Outstation Vacation') {
      return { allowed: true, reason: '✈️ Home / Night Stay Leave: Requires Parent SMS & Warden Approval.' };
    }

    if (studentYear === 1) {
      if (todayDayName === 'Sunday' || todayDayName === 'Wednesday') {
        return {
          allowed: true,
          reason: `✅ 1st Year Outing Allowed: Today is ${todayDayName}. Return before 8:00 PM.`
        };
      } else {
        return {
          allowed: false,
          reason: `🔒 1st Year Locked: Outings allowed strictly on Wednesday & Sunday. Today is ${todayDayName}.`
        };
      }
    }

    if (studentYear >= 2) {
      if (todayDayName === 'Wednesday') {
        return {
          allowed: false,
          reason: '🔒 Wednesday Restriction: Senior outing closed on Wednesday.'
        };
      } else {
        return {
          allowed: true,
          reason: `✅ Senior Outing: Today is ${todayDayName}. Return strictly before 8:00 PM curfew.`
        };
      }
    }

    return { allowed: true, reason: 'Allowed' };
  };

  const currentWindow = checkApplicationWindow(passCategory);
  const currentEligibility = checkOutingEligibility(passCategory);
  const canSubmitPass = currentWindow.isOpen && currentEligibility.allowed;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!canSubmitPass) {
      setFormError('Application window closed or not eligible.');
      return;
    }

    if (!destination.trim()) {
      setFormError('Kripya destination bharein.');
      return;
    }

    let finalDepartureStr = '';
    let finalReturnStr = '';
    let finalReason = '';

    if (passCategory === 'Local Outing') {
      finalDepartureStr = localLiveDateTime || getLiveDateAndTimeString();
      finalReturnStr = 'Today strictly before 08:00 PM';
      finalReason = reasonOrAddress.trim() || 'General Local Outing';
    } else {
      if (!depDate) {
        setFormError('Kripya Calendar se Ghar jane ki Date & Time select karein!');
        return;
      }

      if (!retDate) {
        setFormError('Kripya Calendar se Wapas aane ki Date & Time select karein!');
        return;
      }

      if (retDate < depDate) {
        setFormError('⚠️ Wapas aane ki date Ghar jane ki date ke baad ki honi chahiye!');
        return;
      }

      if (!reasonOrAddress.trim()) {
        setFormError('⚠️ Home Leave ke liye "Address Without College" bharna anivarya hai!');
        return;
      }

      const depObj = new Date(depDate);
      const retObj = new Date(retDate);
      finalDepartureStr = `${depDate} (${dayNames[depObj.getDay()]}) ${depTime}`;
      finalReturnStr = `${retDate} (${homeReturnDay || dayNames[retObj.getDay()]}) ${retTime}`;
      finalReason = `Address: ${reasonOrAddress.trim()} (Return: ${homeReturnDay || dayNames[retObj.getDay()]})`;
    }

    const newCreatedPass: HomeLeavePass = {
      id: `pass-${Date.now()}`,
      studentId: userSession.studentId || currentStudentRoll,
      studentName: userSession.name || 'Student',
      rollNo: currentStudentRoll || '2024CS101',
      block: userSession.block || 'Tagore',
      roomNumber: userSession.roomNumber || 'Tagore-101',
      studentPhone: studentPhone,
      parentPhone: parentPhone,
      destination: destination.trim(),
      departureDate: finalDepartureStr,
      expectedReturnDate: finalReturnStr,
      reason: finalReason,
      status: 'Approved' as LeaveStatus,
      parentSmsSent: false,
      createdAt: new Date().toISOString(),
      passCategory: passCategory,
      year: studentYear,
      isGymPass: false,
      verificationToken: `WDN-SEAL-${Math.floor(1000 + Math.random() * 9000)}-AUTHENTICATED`
    };

    onApplyLeavePass(newCreatedPass);

    setShowApplyModal(false);
    setDestination('');
    setReasonOrAddress('');
    setFormError('');

    // Open QR pass directly upon submission
    setViewDigitalPass(newCreatedPass);
  };

  const handleAddGymMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymStudentName.trim() || !gymStudentRoll.trim()) return;

    const cleanRoll = gymStudentRoll.trim().toUpperCase();

    const newGymMember: GymMemberRecord = {
      id: `gym-${Date.now()}`,
      studentName: gymStudentName.trim(),
      rollNo: cleanRoll,
      roomNumber: gymStudentRoom.trim(),
      block: gymBlock,
      year: Number(gymYear),
      gymShift: gymShiftTime,
      assignedBy: 'Chief Warden Office',
      validUntil: '2026-12-31'
    };

    setGymMembers([...gymMembers, newGymMember]);

    onApplyLeavePass({
      studentId: cleanRoll,
      studentName: gymStudentName.trim(),
      rollNo: cleanRoll,
      block: gymBlock,
      roomNumber: gymStudentRoom.trim(),
      studentPhone: '+91 98765 43210',
      parentPhone: '+91 98123 45678',
      destination: 'Campus Fitness Gym',
      departureDate: gymShiftTime.split('-')[0].trim(),
      expectedReturnDate: gymShiftTime.split('-')[1]?.trim() || '08:00 PM',
      reason: `Permanent Daily Gym Shift (${gymShiftTime})`,
      passCategory: 'Local Outing',
      year: Number(gymYear),
      isGymPass: true,
      verificationToken: `WDN-GYM-PERM-${cleanRoll}`
    });

    setGymStudentName('');
    setGymStudentRoll('');
    setGymStudentRoom('');
    alert(`✅ Student ${newGymMember.studentName} (${cleanRoll}) registered for Gym Shift ${gymShiftTime}!`);
  };

  const handleRemoveGymMember = (id: string) => {
    if (window.confirm('Remove this student from Gym Roster?')) {
      setGymMembers(gymMembers.filter((g) => g.id !== id));
    }
  };

  // 🟢 RELIABLE STUDENT PASSES FILTER (Matching Roll No or Name)
  const studentActivePasses = leavePasses.filter((p) => {
    if (role === 'student') {
      const pRoll = (p.rollNo || '').trim().toUpperCase();
      const sRoll = currentStudentRoll.trim().toUpperCase();
      const pName = (p.studentName || '').toLowerCase();
      const sName = (userSession.name || '').toLowerCase();

      return pRoll === sRoll || p.studentId === userSession.studentId || (sName && pName.includes(sName));
    }
    if (filterStatus === 'All') return true;
    return p.status === filterStatus;
  });

  const outOfHostelCount = leavePasses.filter((p) => p.status === 'Departed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Gate Pass Security & Outing Terminal
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    LIVE QR VERIFIED
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Today: <strong className="text-indigo-400 font-bold">{todayDayName}</strong> • Weekdays: <strong>4:30 PM - 6:00 PM</strong> | Sunday: <strong>9 AM-12 PM & 4:30-6 PM</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {role === 'warden' && (
              <button
                onClick={() => setShowGymRegistryModal(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Gym Roster ({gymMembers.length})</span>
              </button>
            )}

            {role === 'student' && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Apply Gate Pass</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ISOLATED GYM BANNER (Visible only to this Gym Student) */}
      {isStudentGymMember && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md uppercase border border-amber-500/30">
                Warden Approved Permanent Gym Pass
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">
                Your Fixed Gym Shift: <span className="text-amber-300 font-mono">{studentGymRecord?.gymShift}</span>
              </h3>
              <p className="text-xs text-slate-300">
                Aapko daily outing pass apply karne ki zaroorat nahi hai. Gate par QR scan karein.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const gymPassObj: HomeLeavePass = {
                id: `gym-${currentStudentRoll}`,
                studentId: currentStudentRoll,
                studentName: userSession.name,
                rollNo: currentStudentRoll,
                block: userSession.block || 'Tagore',
                roomNumber: userSession.roomNumber || '101',
                studentPhone: '+91 98765 43210',
                parentPhone: userSession.parentPhone || '+91 98123 45678',
                destination: 'Campus Fitness Gym',
                departureDate: studentGymRecord?.gymShift.split('-')[0].trim() || '05:00 PM',
                expectedReturnDate: studentGymRecord?.gymShift.split('-')[1]?.trim() || '07:00 PM',
                reason: `Permanent Gym Shift (${studentGymRecord?.gymShift})`,
                status: 'Approved' as LeaveStatus,
                parentSmsSent: false,
                createdAt: '2026-08-01',
                verificationToken: `WDN-GYM-PERM-${currentStudentRoll}`,
                isGymPass: true
              };
              setViewDigitalPass(gymPassObj);
            }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Show My Daily Gym QR Pass</span>
          </button>
        </div>
      )}

      {/* 🟢 PASSES LIST (WITH VIEW DIGITAL QR PASS ON EVERY CARD) */}
      <div className="space-y-4">
        {studentActivePasses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No Gate Passes Found</p>
            <p className="text-xs text-slate-500">
              {role === 'student'
                ? 'Niche diye gaye button se apna Outing ya Home Pass banayein:'
                : 'No gate passes matching this filter.'}
            </p>
            {role === 'student' && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Apply Gate Pass Now</span>
              </button>
            )}
          </div>
        ) : (
          studentActivePasses.map((pass) => (
            <div key={pass.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                      {pass.block} • Room {pass.roomNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
                      {pass.isGymPass ? '💪 Daily Gym Pass' : (pass.passCategory || 'Local Outing')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Status: {pass.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{pass.studentName} ({pass.rollNo})</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div><strong>Destination:</strong> {pass.destination}</div>
                    <div><strong>Departure:</strong> <span className="font-mono text-emerald-400">{pass.departureDate}</span></div>
                    <div><strong>Return Date/Time:</strong> <span className="font-mono text-rose-400">{pass.expectedReturnDate}</span></div>
                    <div className="sm:col-span-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <strong>{pass.passCategory === 'Outstation Vacation' ? 'Address Without College:' : 'Reason:'}</strong> {pass.reason}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 🟢 ALWAYS VISIBLE QR PASS BUTTON */}
                  <button
                    onClick={() => setViewDigitalPass(pass)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Digital Gate QR Pass</span>
                  </button>

                  {role === 'warden' && pass.status === 'Applied' && (
                    <button
                      onClick={() => onUpdateLeaveStatus(pass.id, 'Approved')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                    >
                      Approve Pass
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DIGITAL QR GATE PASS MODAL POPUP */}
      {viewDigitalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-2xl uppercase tracking-widest">
              OFFICIAL WARDEN SEAL
            </div>

            <div className="text-center space-y-1 pt-2">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                {viewDigitalPass.isGymPass ? <Dumbbell className="w-7 h-7 text-amber-400" /> : <ShieldCheck className="w-7 h-7" />}
              </div>
              <h3 className="text-lg font-extrabold text-white">
                {viewDigitalPass.isGymPass ? 'Permanent Daily Gym Pass' : 'Hostel Main Gate Security Pass'}
              </h3>
              <p className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 py-1 px-3 rounded-xl border border-emerald-500/20 inline-block">
                {viewDigitalPass.verificationToken || 'WDN-SEAL-AUTHENTICATED'}
              </p>
            </div>

            {/* Simulated Live QR Code */}
            <div className="bg-white p-4 rounded-2xl border-4 border-slate-800 text-center space-y-2 max-w-[220px] mx-auto shadow-inner">
              <QrCode className="w-36 h-36 mx-auto text-slate-950" />
              <p className="text-[10px] font-mono text-slate-800 font-bold">
                {viewDigitalPass.rollNo} • {viewDigitalPass.isGymPass ? 'DAILY RECURRING' : 'VERIFIED PASS'}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold text-white">{viewDigitalPass.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Roll & Room:</span>
                <span className="font-bold text-white">{viewDigitalPass.rollNo} ({viewDigitalPass.roomNumber})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Shift / Return Limit:</span>
                <span className="font-bold text-emerald-300 font-mono">{viewDigitalPass.expectedReturnDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized By:</span>
                <span className="font-bold text-emerald-400">Chief Warden Office</span>
              </div>
            </div>

            <button
              onClick={() => setViewDigitalPass(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
            >
              Close QR Pass
            </button>
          </div>
        </div>
      )}

      {/* WARDEN GYM ROSTER MODAL */}
      {showGymRegistryModal && role === 'warden' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Warden Gym Membership & Shift Setup</h3>
              </div>
              <button onClick={() => setShowGymRegistryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGymMember} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase">Set Fixed Gym Shift for Student</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Student Name"
                  value={gymStudentName}
                  onChange={(e) => setGymStudentName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Roll No (e.g. 2024CS101)"
                  value={gymStudentRoll}
                  onChange={(e) => setGymStudentRoll(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Room No (e.g. Tagore-101)"
                  value={gymStudentRoom}
                  onChange={(e) => setGymStudentRoom(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  required
                />
                <select
                  value={gymBlock}
                  onChange={(e) => setGymBlock(e.target.value as BlockName)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="Tagore">Tagore Block</option>
                  <option value="Tilak">Tilak Block</option>
                  <option value="Subhash">Subhash Block</option>
                </select>
                <select
                  value={gymYear}
                  onChange={(e) => setGymYear(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>

                <select
                  value={gymShiftTime}
                  onChange={(e) => setGymShiftTime(e.target.value)}
                  className="bg-slate-900 border border-amber-500/50 rounded-xl p-2 text-amber-300 font-bold"
                >
                  <option value="06:00 AM - 07:30 AM">Morning: 06:00 AM - 07:30 AM</option>
                  <option value="05:00 PM - 07:00 PM">Evening: 05:00 PM - 07:00 PM</option>
                  <option value="06:00 PM - 07:45 PM">Evening: 06:00 PM - 07:45 PM</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Issue Permanent Daily Gym Gate Pass</span>
              </button>
            </form>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Active Gym Members ({gymMembers.length}):</h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {gymMembers.map((g) => (
                  <div key={g.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{g.studentName} ({g.rollNo})</p>
                      <p className="text-slate-400 text-[11px]">
                        {g.roomNumber} • {g.year} Year • Shift: <span className="text-amber-300 font-bold">{g.gymShift}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveGymMember(g.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg border border-rose-500/30"
                      title="Revoke Gym Pass"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLY PASS MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              Apply Gate Pass / Outing Request
            </h3>

            <div
              className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
                currentWindow.isOpen
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                {currentWindow.isOpen ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                <span>Application Window Status ({todayDayName}):</span>
              </p>
              <p className="text-[11px] mt-0.5">{currentWindow.message}</p>
            </div>

            {formError && (
              <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student:</label>
                  <input
                    type="text"
                    value={`${userSession.name} (${studentYear} Year)`}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll & Room:</label>
                  <input
                    type="text"
                    value={`${userSession.rollNo} (${userSession.roomNumber})`}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pass Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Local Outing', 'Outstation Vacation'] as PassCategory[]).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        setPassCategory(cat);
                        setDepDate('');
                        setRetDate('');
                        setHomeReturnDay('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        passCategory === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {cat === 'Outstation Vacation' ? 'Home / Night Leave' : 'Local Outing (Day)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {passCategory === 'Outstation Vacation' ? 'Home Destination City / Village:' : 'Destination:'}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={passCategory === 'Outstation Vacation' ? 'e.g. Lucknow / Varanasi / Gorakhpur' : 'e.g. City Market / Medical Store'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required
                />
              </div>

              {/* 🟢 1. LOCAL OUTING: AUTO-FETCHED TIME & 8 PM CURFEW */}
              {passCategory === 'Local Outing' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-indigo-400" />
                      Departure Time (Auto Live IST):
                    </label>
                    <input
                      type="text"
                      value={localLiveDateTime || getLiveDateAndTimeString()}
                      disabled
                      className="w-full bg-slate-950/80 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-400" />
                      Return Cutoff:
                    </label>
                    <input
                      type="text"
                      value="Today before 08:00 PM"
                      disabled
                      className="w-full bg-slate-950/80 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-rose-300 font-mono font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
              ) : (
                /* 🟢 2. HOME LEAVE: VISUAL CALENDAR SELECTION */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ghar Jane Ki Date & Time (Calendar se Choose karein):</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleOpenCalendar('departure')}
                      className="w-full bg-slate-950 hover:bg-slate-900 border border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-left text-white flex items-center justify-between shadow-sm transition-all"
                    >
                      <span className={depDate ? 'font-bold text-emerald-400' : 'text-slate-500'}>
                        {depDate ? `📅 ${depDate} @ ${depTime}` : '📅 Click to open Calendar & Select Date/Time'}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div>
                      <label className="block text-xs font-bold text-rose-400 mb-1">
                        Wapas Aane Ki Date & Time:
                      </label>
                      <button
                        type="button"
                        onClick={() => handleOpenCalendar('return')}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-rose-500/50 rounded-xl px-3 py-2 text-xs text-left text-white flex items-center justify-between shadow-sm"
                      >
                        <span className={retDate ? 'font-bold text-rose-300' : 'text-slate-500'}>
                          {retDate ? `📅 ${retDate} @ ${retTime}` : '📅 Select Return'}
                        </span>
                        <CalendarIcon className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-300 mb-1">
                        Wapas Aane Ka Din (Auto):
                      </label>
                      <input
                        type="text"
                        value={homeReturnDay ? `${homeReturnDay}` : 'Auto-Calculated'}
                        disabled
                        className="w-full bg-slate-900/80 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ADDRESS (MANDATORY FOR HOME LEAVE) / REASON (OPTIONAL FOR OUTING) */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {passCategory === 'Outstation Vacation' 
                      ? 'Address Without College (घर/ठहरने का पूरा पता) *Mandatory:' 
                      : 'Reason for Outing (Optional - जरूरी नहीं):'}
                  </span>
                </label>
                <textarea
                  value={reasonOrAddress}
                  onChange={(e) => setReasonOrAddress(e.target.value)}
                  rows={2}
                  placeholder={
                    passCategory === 'Outstation Vacation'
                      ? 'Enter complete permanent home address / stay location outside college (House No, Street, City, Pincode)...'
                      : 'e.g. Buying books / grocery (optional)...'
                  }
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-white ${
                    passCategory === 'Outstation Vacation' ? 'border-amber-500/60 focus:border-amber-400' : 'border-slate-800'
                  }`}
                  required={passCategory === 'Outstation Vacation'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowApplyModal(false); setFormError(''); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmitPass}
                  className={`px-5 py-2 text-xs font-bold rounded-xl shadow-lg transition-all ${
                    canSubmitPass
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Submit Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISUAL CALENDAR POPUP */}
      {activePickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                <span>{activePickerTarget === 'departure' ? 'Select Ghar Jane Ki Date' : 'Select Wapas Aane Ki Date'}</span>
              </h4>
              <button onClick={() => setActivePickerTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (calendarViewMonth === 0) {
                    setCalendarViewMonth(11);
                    setCalendarViewYear(calendarViewYear - 1);
                  } else {
                    setCalendarViewMonth(calendarViewMonth - 1);
                  }
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-indigo-300">
                {monthNames[calendarViewMonth]} {calendarViewYear}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (calendarViewMonth === 11) {
                    setCalendarViewMonth(0);
                    setCalendarViewYear(calendarViewYear + 1);
                  } else {
                    setCalendarViewMonth(calendarViewMonth + 1);
                  }
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 mb-1">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: firstDayOfMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${calendarViewYear}-${String(calendarViewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const cellDate = new Date(calendarViewYear, calendarViewMonth, dayNum, 23, 59, 59);
                  const isPast = cellDate < now;
                  const isSelected = selectedCalendarDate === dateStr;

                  return (
                    <button
                      type="button"
                      key={dayNum}
                      disabled={isPast}
                      onClick={() => setSelectedCalendarDate(dateStr)}
                      className={`h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        isPast
                          ? 'text-slate-700 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-600 text-white font-extrabold shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-300 block">Select Time:</span>
              <div className="flex items-center justify-center gap-2 text-xs">
                <select
                  value={selectedTimeHour}
                  onChange={(e) => setSelectedTimeHour(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono font-bold"
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-white font-bold">:</span>
                <select
                  value={selectedTimeMinute}
                  onChange={(e) => setSelectedTimeMinute(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono font-bold"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedTimeAmPm}
                  onChange={(e) => setSelectedTimeAmPm(e.target.value as 'AM' | 'PM')}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-indigo-400 font-bold"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActivePickerTarget(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCalendarDateTime}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Done & Set Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};