import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  Phone,
  User,
  ShieldAlert,
  Plus,
  ArrowRight,
  Sparkles,
  Check,
  Building,
  Radio,
  FileText,
  QrCode,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock,
  Dumbbell,
  Settings,
  ArrowLeftRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { HomeLeavePass, LeaveStatus, PassCategory, Role, UserAuthSession, OutingRulesConfig } from '../types';

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
  const [viewDigitalPass, setViewDigitalPass] = useState<HomeLeavePass | null>(null);

  // Form Fields
  const [passCategory, setPassCategory] = useState<PassCategory>('Local Outing');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('2026-08-04 05:30 PM');
  const [returnDate, setReturnDate] = useState('2026-08-04 08:30 PM');
  const [reason, setReason] = useState('');
  const [parentPhone, setParentPhone] = useState(userSession.parentPhone || '+91 98123 45678');
  const [studentPhone, setStudentPhone] = useState('+91 98765 43210');
  const [isGymPass, setIsGymPass] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Gate Scanner Search State
  const [scanQuery, setScanQuery] = useState('');
  const [scannedPass, setScannedPass] = useState<HomeLeavePass | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Temporary Rules State for Config Modal
  const [tempRules, setTempRules] = useState<OutingRulesConfig>(outingRules);

  const studentYear = userSession.year || 3;
  const todayDayName = 'Monday'; // Simulated today day name

  // Check Outing Permission Rule logic for student
  const checkOutingEligibility = (category: PassCategory, gym: boolean) => {
    if (gym) {
      return { allowed: true, reason: '💪 Gym Outing Privilege: Allowed daily for all years!' };
    }
    if (category === 'Outstation Vacation') {
      return { allowed: true, reason: '✈️ Outstation Home Vacation: Requires Warden Approval & Parent SMS.' };
    }
    if (studentYear === 1) {
      if (todayDayName === outingRules.firstYearOutingDay) {
        return {
          allowed: true,
          reason: `✅ 1st Year Sunday Outing: Allowed on ${outingRules.firstYearOutingDay} between ${outingRules.firstYearStartTime} & ${outingRules.firstYearEndTime}.`
        };
      } else {
        return {
          allowed: false,
          reason: `🔒 1st Year Outing Restricted: 1st Year students are allowed outing ONLY on ${outingRules.firstYearOutingDay} (${outingRules.firstYearStartTime} - ${outingRules.firstYearEndTime}). Today is ${todayDayName}. (Gym members exempt).`
        };
      }
    }
    if (studentYear >= 2) {
      if (todayDayName === outingRules.seniorRestrictedDay) {
        return {
          allowed: false,
          reason: `🔒 Wednesday Restricted Day: Outing closed on ${outingRules.seniorRestrictedDay}s for ${studentYear}nd/rd/th year students. (Gym members exempt).`
        };
      } else {
        return {
          allowed: true,
          reason: `✅ Senior Outing: Allowed daily (except ${outingRules.seniorRestrictedDay}s) until evening curfew (${outingRules.curfewReturnTime}).`
        };
      }
    }
    return { allowed: true, reason: 'Allowed' };
  };

  const currentEligibility = checkOutingEligibility(passCategory, isGymPass);

  // Triggered when student submits leave application
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !reason.trim() || !parentPhone.trim()) return;

    onApplyLeavePass({
      studentId: userSession.studentId || 'std-101',
      studentName: userSession.name || 'Aayush Singh',
      rollNo: userSession.rollNo || '2024CS1042',
      block: userSession.block || 'Tagore',
      roomNumber: userSession.roomNumber || 'Tagore-101',
      studentPhone: studentPhone,
      parentPhone: parentPhone,
      destination: destination,
      departureDate: departureDate,
      expectedReturnDate: returnDate,
      reason: reason,
      passCategory: passCategory,
      year: studentYear,
      isGymPass: isGymPass,
      verificationToken: `WDN-SEAL-${Math.floor(1000 + Math.random() * 9000)}-AUTHENTICATED`
    });

    setShowApplyModal(false);
    setDestination('');
    setReason('');
  };

  // Handle Gate Terminal Search
  const handleSearchPassAtGate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = scanQuery.trim().toLowerCase();
    if (!query) return;

    const match = leavePasses.find(
      (p) =>
        p.rollNo.toLowerCase() === query ||
        p.studentName.toLowerCase().includes(query) ||
        p.id.toLowerCase() === query ||
        p.verificationToken?.toLowerCase() === query
    );

    if (match) {
      setScannedPass(match);
      if (match.status === 'Approved' || match.status === 'Departed') {
        setScanMessage({
          type: 'success',
          text: `✅ OFFICIAL WARDEN SEAL VERIFIED! Student ${match.studentName} (${match.rollNo}) holds an authentic Warden Approved Gate Pass.`
        });
      } else {
        setScanMessage({
          type: 'error',
          text: `⛔ EXIT REJECTED! Gate Pass status is "${match.status}". Not approved by Warden Office. Fake/Self-edited pass prohibited.`
        });
      }
    } else {
      setScannedPass(null);
      setScanMessage({
        type: 'error',
        text: `⛔ NO RECORD FOUND! Roll No / Pass ID "${scanQuery}" does not exist in Warden Server Database. Student cannot exit!`
      });
    }
  };

  const filteredPasses = leavePasses.filter((p) => {
    if (role === 'student') {
      return p.studentId === userSession.studentId || p.rollNo === userSession.rollNo;
    }
    if (filterStatus === 'All') return true;
    return p.status === filterStatus;
  });

  const outOfHostelCount = leavePasses.filter((p) => p.status === 'Departed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

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
                    CRYPTOGRAPHIC SEALED
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Main Gate Security Verification • Year-Wise Outing Timings • Anti-Tamper Digital Warden Stamp
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {role === 'warden' && (
              <>
                <button
                  onClick={() => setShowRulesConfigModal(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Outing Rules Config</span>
                </button>

                <button
                  onClick={() => setShowGateTerminalModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gate Security Scanner</span>
                </button>
              </>
            )}

            {role === 'student' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGateTerminalModal(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span>Gate Checkpoint Scanner</span>
                </button>

                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Apply Gate Pass</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Outing Rules Policy Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rule 1: 1st Year Students */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              1st Year Outing Policy
            </span>
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">
              {outingRules.firstYearOutingDay}s Only
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Outing allowed strictly on <strong>{outingRules.firstYearOutingDay}s</strong> between{' '}
            <strong className="text-indigo-300">{outingRules.firstYearStartTime}</strong> to{' '}
            <strong className="text-indigo-300">{outingRules.firstYearEndTime}</strong>.
          </p>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
            🔒 Weekday local outings locked to prevent unauthorized absences.
          </div>
        </div>

        {/* Rule 2: 2nd, 3rd, 4th Year Students */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              2nd / 3rd / 4th Year Outing
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
              Daily (Excl. {outingRules.seniorRestrictedDay})
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Daily outing allowed till <strong>{outingRules.curfewReturnTime} curfew</strong>, except on{' '}
            <strong className="text-amber-300">{outingRules.seniorRestrictedDay}s</strong> (Restricted Maintenance Day).
          </p>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
            🔄 Multi-entry re-entry permitted before curfew!
          </div>
        </div>

        {/* Rule 3: Gym Students Privilege */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-amber-400" />
              Gym Members Special Pass
            </span>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
              Daily Outing Unlocked
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Students attending fitness gym get <strong>Daily Outing Access</strong> regardless of year or Wednesday restrictions!
          </p>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
            💪 Select "Gym Outing" pass during application.
          </div>
        </div>
      </div>

      {/* Safety Alert Feature Box */}
      <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-500/20 rounded-xl text-red-400 border border-red-500/30 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Main Gate Security Protection Against Fake Gate Passes</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 font-mono">
                ANTI-TAMPER DB CHECK
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ⚠️ <strong>Strict Warning:</strong> Students cannot self-edit or screenshot gate passes. The Main Gate Security Guard uses a live digital terminal that verifies each pass directly against the Chief Warden's Server. Unapproved or self-edited passes will trigger an exit denial and disciplinary alert.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Warden */}
      {role === 'warden' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            {['All', 'Applied', 'Approved', 'Departed', 'Returned'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  filterStatus === st
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st === 'All' ? 'All Gate Passes' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
              Currently Away: {outOfHostelCount} Students
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredPasses.length} Records
            </span>
          </div>
        </div>
      )}

      {/* Gate Pass Cards List */}
      <div className="space-y-4">
        {filteredPasses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Gate Passes Found</p>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'student'
                ? 'You have not submitted any gate pass request yet.'
                : 'No gate passes matching this filter.'}
            </p>
          </div>
        ) : (
          filteredPasses.map((pass) => {
            const isDeparted = pass.status === 'Departed';
            const isApproved = pass.status === 'Approved';
            const isApplied = pass.status === 'Applied';
            const isReturned = pass.status === 'Returned';

            return (
              <div
                key={pass.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all ${
                  isDeparted
                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900'
                    : isApproved
                    ? 'border-emerald-500/40 bg-slate-900'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student & Destination Info */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {pass.block} Block • Room {pass.roomNumber}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        {pass.isGymPass ? <Dumbbell className="w-3 h-3 text-amber-400" /> : null}
                        {pass.passCategory || 'Local Outing'}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isDeparted
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isReturned
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        Status: {pass.status}
                      </span>

                      {pass.verificationToken && isApproved && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          SEAL: {pass.verificationToken}
                        </span>
                      )}

                      {pass.parentSmsSent && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Parent SMS Delivered
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{pass.studentName}</span>
                        <span className="text-xs text-slate-400 font-normal">({pass.rollNo})</span>
                      </h3>

                      {pass.year && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {pass.year} Year
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>Destination:</strong> {pass.destination}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span><strong>Parent Mobile:</strong> {pass.parentPhone}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Departure:</strong> {pass.departureDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Return By:</strong> {pass.expectedReturnDate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <strong>Reason:</strong> {pass.reason}
                    </p>

                    {/* Gate Movement History */}
                    {pass.gateScanLogs && pass.gateScanLogs.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Main Gate Verification Logs ({pass.gateMovementCount || 0} Movements Today):</span>
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                          {pass.gateScanLogs.map((log, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded-lg border ${
                                log.action === 'EXITED'
                                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {log.action === 'EXITED' ? '🚪 EXITED GATE' : '🏠 RE-ENTERED HOSTEL'} @ {log.timestamp} ({log.verifiedByGuard})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions for Student & Warden */}
                  <div className="flex flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4 justify-center">
                    {/* Student Digital QR Pass Button */}
                    {isApproved && (
                      <button
                        onClick={() => setViewDigitalPass(pass)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View Digital Gate QR Pass</span>
                      </button>
                    )}

                    {role === 'warden' && (
                      <div className="flex flex-wrap gap-2">
                        {isApplied && (
                          <button
                            onClick={() => onUpdateLeaveStatus(pass.id, 'Approved', true)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve Pass & Issue Digital Seal
                          </button>
                        )}

                        {(isApproved || isApplied) && (
                          <button
                            onClick={() => onRecordGateScan(pass.id, 'EXITED', 'Chief Warden Terminal')}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            Verify Exit (Bahar Nikla)
                          </button>
                        )}

                        {isDeparted && (
                          <button
                            onClick={() => onRecordGateScan(pass.id, 'RE_ENTERED', 'Chief Warden Terminal')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verify Re-Entry (Wapas Aaya)
                          </button>
                        )}

                        <button
                          onClick={() => onUpdateLeaveStatus(pass.id, pass.status, true)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <Send className="w-3 h-3 text-emerald-400" />
                          Resend Parent SMS
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* SMS Live Box Preview */}
                {pass.parentSmsContent && (
                  <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                    <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Simulated Parent SMS Delivered to {pass.parentPhone}:</span>
                    </p>
                    <p className="text-xs text-emerald-200/90 font-mono mt-1 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-emerald-900/50">
                      "{pass.parentSmsContent}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DIGITAL QR GATE PASS MODAL (FOR STUDENTS AT MAIN GATE) */}
      {viewDigitalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-2xl uppercase tracking-widest">
              OFFICIAL WARDEN SEAL
            </div>

            <div className="text-center space-y-1 pt-2">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Hostel Main Gate Security Pass
              </h3>
              <p className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 py-1 px-3 rounded-xl border border-emerald-500/20 inline-block">
                {viewDigitalPass.verificationToken || 'WDN-SEAL-8842-AUTHENTICATED'}
              </p>
            </div>

            {/* Simulated QR Code Box */}
            <div className="bg-white p-4 rounded-2xl border-4 border-slate-800 text-center space-y-2 max-w-[220px] mx-auto shadow-inner">
              <QrCode className="w-36 h-36 mx-auto text-slate-950" />
              <p className="text-[10px] font-mono text-slate-800 font-bold">
                ID: {viewDigitalPass.id} • {viewDigitalPass.rollNo}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold text-white">{viewDigitalPass.studentName}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Roll No & Room:</span>
                <span className="font-bold text-white">{viewDigitalPass.rollNo} ({viewDigitalPass.roomNumber})</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Pass Category:</span>
                <span className="font-bold text-amber-300">{viewDigitalPass.passCategory || 'Local Outing'}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Destination:</span>
                <span className="font-bold text-white">{viewDigitalPass.destination}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Valid Till:</span>
                <span className="font-bold text-emerald-300 font-mono">{viewDigitalPass.expectedReturnDate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Approved By:</span>
                <span className="font-bold text-emerald-400">{viewDigitalPass.wardenApprovedBy || 'Chief Warden Office'}</span>
              </div>
            </div>

            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-300 leading-tight">
              ⚠️ <strong>Main Gate Verification Notice:</strong> Screenshots or edited passes will be flagged as fraudulent. Security guard verifies this live from Warden Server.
            </div>

            <button
              onClick={() => setViewDigitalPass(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              Close Pass Modal
            </button>
          </div>
        </div>
      )}

      {/* MAIN GATE SECURITY GUARD SCANNER TERMINAL MODAL */}
      {showGateTerminalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Hostel Main Gate Security Terminal</h3>
                  <p className="text-xs text-slate-400">Gate Guard Live Verification & Exit Scanner</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowGateTerminalModal(false);
                  setScanMessage(null);
                  setScannedPass(null);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleSearchPassAtGate} className="flex gap-2">
              <input
                type="text"
                value={scanQuery}
                onChange={(e) => setScanQuery(e.target.value)}
                placeholder="Enter Student Roll No (e.g. 2024CS1042) or Pass ID / QR Token..."
                className="flex-1 bg-slate-950 border border-indigo-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>Verify Gate Pass</span>
              </button>
            </form>

            {/* Quick Select Student Buttons for Guard Testing */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400">Quick Test Gate Scanner (Select Approved Student):</p>
              <div className="flex flex-wrap gap-2">
                {leavePasses.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setScanQuery(p.rollNo);
                      setScannedPass(p);
                      if (p.status === 'Approved' || p.status === 'Departed') {
                        setScanMessage({
                          type: 'success',
                          text: `✅ OFFICIAL WARDEN SEAL VERIFIED! Student ${p.studentName} (${p.rollNo}) holds an authentic Warden Approved Gate Pass.`
                        });
                      } else {
                        setScanMessage({
                          type: 'error',
                          text: `⛔ EXIT REJECTED! Gate Pass status is "${p.status}". Not approved by Warden Office.`
                        });
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                      scannedPass?.id === p.id
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p.studentName} ({p.rollNo}) - {p.status}
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Result Banner */}
            {scanMessage && (
              <div
                className={`p-4 rounded-2xl border text-xs font-medium space-y-2 ${
                  scanMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {scanMessage.type === 'success' ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed">{scanMessage.text}</p>
                </div>

                {scannedPass && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                      <div>Pass Category: <strong>{scannedPass.passCategory || 'Local Outing'}</strong></div>
                      <div>Destination: <strong>{scannedPass.destination}</strong></div>
                      <div>Return Cutoff: <strong>{scannedPass.expectedReturnDate}</strong></div>
                      <div>Total Gate Movements Today: <strong>{scannedPass.gateMovementCount || 0} times</strong></div>
                    </div>

                    {scannedPass.status === 'Approved' || scannedPass.status === 'Departed' ? (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            onRecordGateScan(scannedPass.id, 'EXITED', 'Main Gate Guard Post 1');
                            setScanMessage({
                              type: 'success',
                              text: `🚪 GATE EXIT RECORDED! Student ${scannedPass.studentName} has passed through main gate.`
                            });
                          }}
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Log Gate Exit (Bahar Nikla)</span>
                        </button>

                        <button
                          onClick={() => {
                            onRecordGateScan(scannedPass.id, 'RE_ENTERED', 'Main Gate Guard Post 1');
                            setScanMessage({
                              type: 'success',
                              text: `🏠 RE-ENTRY RECORDED! Student ${scannedPass.studentName} checked back into hostel.`
                            });
                          }}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Log Gate Re-Entry (Wapas Aaya)</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OUTING RULES CONFIGURATION MODAL (FOR WARDEN) */}
      {showRulesConfigModal && role === 'warden' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              Warden Outing Rules & Timing Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Set year-wise outing permissions, Sunday timings for 1st years, and Wednesday restriction rules.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-indigo-300">
                  1st Year Outing Day & Sunday Window:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Start Time:</span>
                    <input
                      type="text"
                      value={tempRules.firstYearStartTime}
                      onChange={(e) => setTempRules({ ...tempRules, firstYearStartTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">End Time:</span>
                    <input
                      type="text"
                      value={tempRules.firstYearEndTime}
                      onChange={(e) => setTempRules({ ...tempRules, firstYearEndTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-emerald-300">
                  Senior Years (2nd/3rd/4th Year) Curfew Cutoff:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Restricted Maintenance Day:</span>
                    <input
                      type="text"
                      value={tempRules.seniorRestrictedDay}
                      onChange={(e) => setTempRules({ ...tempRules, seniorRestrictedDay: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Evening Curfew Return:</span>
                    <input
                      type="text"
                      value={tempRules.curfewReturnTime}
                      onChange={(e) => setTempRules({ ...tempRules, curfewReturnTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-300 block">Gym Daily Outing Exemption</span>
                  <span className="text-[11px] text-slate-400">Gym members can go out daily regardless of year or Wednesday restrictions</span>
                </div>
                <input
                  type="checkbox"
                  checked={tempRules.gymDailyOutingEnabled}
                  onChange={(e) => setTempRules({ ...tempRules, gymDailyOutingEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRulesConfigModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateOutingRules(tempRules);
                  setShowRulesConfigModal(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg"
              >
                Save Outing Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              Apply Gate Pass / Outing Request
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Automated parent SMS and Gate Security QR Seal will be generated upon Warden Approval.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Name & Year:
                  </label>
                  <input
                    type="text"
                    value={`${userSession.name} (${studentYear} Year)`}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Roll No & Room:
                  </label>
                  <input
                    type="text"
                    value={`${userSession.rollNo} (${userSession.roomNumber})`}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                  />
                </div>
              </div>

              {/* Pass Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pass Type (गेट पास प्रकार):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Local Outing', 'Gym Outing', 'Outstation Vacation'] as PassCategory[]).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        setPassCategory(cat);
                        if (cat === 'Gym Outing') setIsGymPass(true);
                        else setIsGymPass(false);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                        passCategory === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat === 'Gym Outing' ? <Dumbbell className="w-3.5 h-3.5" /> : null}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Eligibility Check Banner */}
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  currentEligibility.allowed
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}
              >
                <p className="font-bold flex items-center gap-1.5">
                  {currentEligibility.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>Outing Rule Engine Check:</span>
                </p>
                <p className="text-[11px] mt-0.5">{currentEligibility.reason}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination (कहाँ जा रहे हैं - Exact Place/Gym Name):
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Gold Gym (Hazratganj) or City Market"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Departure Time:
                  </label>
                  <input
                    type="text"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Return Cutoff Time:
                  </label>
                  <input
                    type="text"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Parent / Guardian Mobile Number (अभिभावक का फोन नंबर):</span>
                  <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Verified & Locked by College Admin
                  </span>
                </label>
                <input
                  type="text"
                  value={parentPhone}
                  disabled={role === 'student'}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+91 98123 45678"
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-mono font-bold ${
                    role === 'student'
                      ? 'bg-slate-950/90 border-slate-800 text-amber-300 cursor-not-allowed'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  required
                />
                {role === 'student' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    🔒 Students cannot edit guardian phone numbers to prevent fake entries. Contact Warden or College Admin to update.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Outing (कारण):
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Evening workout session / books purchase..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!currentEligibility.allowed}
                  className={`px-5 py-2 text-xs font-bold rounded-xl shadow-lg transition-all ${
                    currentEligibility.allowed
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
