// src/components/HomeLeaveSection.tsx
import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  Calendar,
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
  MapPin
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
  const [departureDate, setDepartureDate] = useState('');
  
  // Home Leave Specific Dates & Calculated Day
  const [homeReturnDate, setHomeReturnDate] = useState('');
  const [homeReturnDay, setHomeReturnDay] = useState('');

  const [reasonOrAddress, setReasonOrAddress] = useState('');
  const [parentPhone, setParentPhone] = useState(userSession.parentPhone || '+91 98123 45678');
  const [studentPhone, setStudentPhone] = useState('+91 98765 43210');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [formError, setFormError] = useState('');

  const [scanQuery, setScanQuery] = useState('');
  const [scannedPass, setScannedPass] = useState<HomeLeavePass | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const studentYear = userSession.year || 1;
  const currentStudentRoll = (userSession.rollNo || '').trim().toUpperCase();

  const studentGymRecord = gymMembers.find((g) => g.rollNo.trim().toUpperCase() === currentStudentRoll);
  const isStudentGymMember = role === 'student' && !!studentGymRecord;

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[now.getDay()];

  const getLiveDateAndTimeString = () => {
    const d = new Date();
    const datePart = d.toISOString().split('T')[0];
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} (${dayNames[d.getDay()]}) ${timePart}`;
  };

  useEffect(() => {
    if (showApplyModal) {
      setDepartureDate(getLiveDateAndTimeString());
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 2);
      const nextDateStr = nextDate.toISOString().split('T')[0];
      setHomeReturnDate(nextDateStr);
      setHomeReturnDay(dayNames[nextDate.getDay()]);
    }
  }, [showApplyModal]);

  const handleReturnDateChange = (val: string) => {
    setHomeReturnDate(val);
    if (val) {
      const selected = new Date(val);
      if (!isNaN(selected.getTime())) {
        setHomeReturnDay(dayNames[selected.getDay()]);
      }
    } else {
      setHomeReturnDay('');
    }
  };

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
        message: `🔒 Application Window Closed: Weekday window is strictly 04:30 PM to 06:00 PM. Current Time: ${new Date().toLocaleTimeString()}.`
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

    // 🟢 Address is MANDATORY only for Home Leave; Optional for Local Outing
    if (passCategory === 'Outstation Vacation' && !reasonOrAddress.trim()) {
      setFormError('⚠️ Home Leave ke liye "Address Without College" bharna anivarya (mandatory) hai!');
      return;
    }

    const calculatedReturnStr = passCategory === 'Outstation Vacation'
      ? `${homeReturnDate} (${homeReturnDay}) 08:00 PM`
      : 'Today strictly before 08:00 PM';

    const finalReason = passCategory === 'Outstation Vacation'
      ? `Address: ${reasonOrAddress.trim()} (Return Day: ${homeReturnDay})`
      : (reasonOrAddress.trim() || 'General Local Outing');

    onApplyLeavePass({
      studentId: userSession.studentId || 'std-101',
      studentName: userSession.name || 'Student',
      rollNo: userSession.rollNo || '2024CS101',
      block: userSession.block || 'Tagore',
      roomNumber: userSession.roomNumber || 'Tagore-101',
      studentPhone: studentPhone,
      parentPhone: parentPhone,
      destination: destination.trim(),
      departureDate: getLiveDateAndTimeString(),
      expectedReturnDate: calculatedReturnStr,
      reason: finalReason,
      passCategory: passCategory,
      year: studentYear,
      isGymPass: false,
      verificationToken: `WDN-SEAL-${Math.floor(1000 + Math.random() * 9000)}-AUTHENTICATED`
    });

    setShowApplyModal(false);
    setDestination('');
    setReasonOrAddress('');
    setFormError('');
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

  const filteredPasses = leavePasses.filter((p) => {
    if (role === 'student') {
      return p.studentId === userSession.studentId || p.rollNo.trim().toUpperCase() === currentStudentRoll;
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
                    LIVE IST TIMED
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
              <>
                <button
                  onClick={() => setShowGymRegistryModal(true)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>Gym Roster ({gymMembers.length})</span>
                </button>

                <button
                  onClick={() => setShowGateTerminalModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gate Scanner</span>
                </button>
              </>
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

      {/* ISOLATED GYM BANNER */}
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

      {/* Passes List */}
      <div className="space-y-4">
        {filteredPasses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Gate Passes Found</p>
          </div>
        ) : (
          filteredPasses.map((pass) => (
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
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                      {pass.status}
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
                  <button
                    onClick={() => setViewDigitalPass(pass)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>View QR Pass</span>
                  </button>

                  {role === 'warden' && pass.status === 'Applied' && (
                    <button
                      onClick={() => onUpdateLeaveStatus(pass.id, 'Approved')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
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

      {/* QR PASS MODAL */}
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
                {viewDigitalPass.isGymPass ? 'Permanent Daily Gym Pass' : 'Hostel Gate Pass'}
              </h3>
              <p className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 py-1 px-3 rounded-xl border border-emerald-500/20 inline-block">
                {viewDigitalPass.verificationToken || 'WDN-SEAL-AUTHENTICATED'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-4 border-slate-800 text-center space-y-2 max-w-[220px] mx-auto shadow-inner">
              <QrCode className="w-36 h-36 mx-auto text-slate-950" />
              <p className="text-[10px] font-mono text-slate-800 font-bold">
                {viewDigitalPass.rollNo} • {viewDigitalPass.isGymPass ? 'DAILY RECURRING' : 'SINGLE USE'}
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
                <span className="text-slate-400">Shift / Window:</span>
                <span className="font-bold text-emerald-300 font-mono">{viewDigitalPass.departureDate} - {viewDigitalPass.expectedReturnDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address / Reason:</span>
                <span className="font-bold text-amber-300 text-right truncate max-w-[200px]">{viewDigitalPass.reason}</span>
              </div>
            </div>

            <button
              onClick={() => setViewDigitalPass(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* 🟢 APPLY PASS MODAL */}
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
                      onClick={() => setPassCategory(cat)}
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

              <div>
                <label className="block text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {passCategory === 'Outstation Vacation' ? 'Ghar Jane Ki Date (Auto IST Fetched):' : 'Departure Time (Live IST Auto):'}
                </label>
                <input
                  type="text"
                  value={departureDate || getLiveDateAndTimeString()}
                  disabled
                  className="w-full bg-slate-950/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold cursor-not-allowed"
                />
              </div>

              {passCategory === 'Outstation Vacation' ? (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-rose-400 mb-1">
                      Wapas Aane Ki Date:
                    </label>
                    <input
                      type="date"
                      value={homeReturnDate}
                      onChange={(e) => handleReturnDateChange(e.target.value)}
                      className="w-full bg-slate-900 border border-rose-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      Wapas Aane Ka Din (Auto):
                    </label>
                    <input
                      type="text"
                      value={homeReturnDay ? `${homeReturnDay}` : 'Select Date'}
                      disabled
                      className="w-full bg-slate-900/80 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" />
                    Return Time Limit:
                  </label>
                  <input
                    type="text"
                    value="Today strictly before 08:00 PM"
                    disabled
                    className="w-full bg-slate-950/80 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-rose-300 font-mono font-bold cursor-not-allowed"
                  />
                </div>
              )}

              {/* 🟢 REASON (OPTIONAL FOR LOCAL OUTING) / ADDRESS (MANDATORY FOR HOME LEAVE) */}
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
    </div>
  );
};