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
  const [departureDate, setDepartureDate] = useState('05:00 PM');
  const [returnDate, setReturnDate] = useState('08:00 PM');
  const [reason, setReason] = useState('');
  const [parentPhone, setParentPhone] = useState(userSession.parentPhone || '+91 98123 45678');
  const [studentPhone, setStudentPhone] = useState('+91 98765 43210');
  const [isGymPass, setIsGymPass] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [formError, setFormError] = useState('');

  // Gate Scanner Search State
  const [scanQuery, setScanQuery] = useState('');
  const [scannedPass, setScannedPass] = useState<HomeLeavePass | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Temporary Rules State
  const [tempRules, setTempRules] = useState<OutingRulesConfig>(outingRules);

  const studentYear = userSession.year || 1;

  // 🟢 Live Dynamic Day Calculation (Sunday, Wednesday etc.)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[new Date().getDay()]; // e.g. "Sunday", "Wednesday"

  // 🟢 BUSINESS RULE ENGINE: Day-wise & Year-wise Eligibility Checker
  const checkOutingEligibility = (category: PassCategory, gym: boolean) => {
    // 1. Home Leave / Overnight Pass is always open (Warden approval needed)
    if (category === 'Outstation Vacation') {
      return { 
        allowed: true, 
        reason: '✈️ Home / Night Stay Leave: Requires Parent SMS & Warden Approval. Overnight stay outside permitted.' 
      };
    }

    // 2. Gym Members Exemption
    if (gym) {
      return { 
        allowed: true, 
        reason: '💪 Gym Outing: Allowed daily for all years (Return strictly before 8:00 PM).' 
      };
    }

    // 3. 1st Year Rule: Allowed ONLY on Wednesday & Sunday
    if (studentYear === 1) {
      if (todayDayName === 'Sunday' || todayDayName === 'Wednesday') {
        return {
          allowed: true,
          reason: `✅ 1st Year Outing Allowed: Today is ${todayDayName}. You can go out till 8:00 PM.`
        };
      } else {
        return {
          allowed: false,
          reason: `🔒 1st Year Outing Locked: 1st Year students are allowed outing ONLY on Wednesday & Sunday. Today is ${todayDayName}. (Gym members exempt).`
        };
      }
    }

    // 4. 2nd, 3rd, 4th Year Rule: Allowed DAILY EXCEPT Wednesday
    if (studentYear >= 2) {
      if (todayDayName === 'Wednesday') {
        return {
          allowed: false,
          reason: `🔒 Wednesday Senior Restriction: Outing is closed on Wednesday for 2nd, 3rd & 4th year students. (Gym members exempt).`
        };
      } else {
        return {
          allowed: true,
          reason: `✅ Senior Outing Allowed: Today is ${todayDayName}. Return strictly before 8:00 PM curfew.`
        };
      }
    }

    return { allowed: true, reason: 'Allowed' };
  };

  const currentEligibility = checkOutingEligibility(passCategory, isGymPass);

  // Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!destination.trim() || !reason.trim() || !parentPhone.trim()) {
      setFormError('Kripya saari details bharein.');
      return;
    }

    // 🟢 8:00 PM Return Rule Validation
    if (passCategory === 'Local Outing' || passCategory === 'Gym Outing') {
      const returnLower = returnDate.toLowerCase();
      // Check if time is past 8:00 PM
      if (returnLower.includes('09:') || returnLower.includes('10:') || returnLower.includes('11:') || returnLower.includes('12:')) {
        setFormError('⚠️ Outing Pass sirf raat 8:00 PM tak valid hai. 8:00 PM ke baad ke liye "Outstation Vacation / Home Leave" select karein.');
        return;
      }
    }

    onApplyLeavePass({
      studentId: userSession.studentId || 'std-101',
      studentName: userSession.name || 'Student',
      rollNo: userSession.rollNo || '2024CS101',
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
    setFormError('');
  };

  // Gate Scanner Search
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
          text: `⛔ EXIT REJECTED! Gate Pass status is "${match.status}". Not approved by Warden Office.`
        });
      }
    } else {
      setScannedPass(null);
      setScanMessage({
        type: 'error',
        text: `⛔ NO RECORD FOUND! Roll No / Pass ID "${scanQuery}" does not exist in Warden Server Database.`
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
                    8:00 PM CURFEW ENFORCED
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Today is <strong className="text-indigo-400 font-bold">{todayDayName}</strong> • 1st Year (Wed & Sun) • 2nd/3rd/4th Year (Daily except Wed)
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
                  <span>Apply Outing / Gate Pass</span>
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
              Wed & Sun Only
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Outing allowed strictly on <strong>Wednesday & Sunday</strong>. Must return to hostel before <strong className="text-indigo-300">8:00 PM sharp</strong>.
          </p>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
            🔒 Mon, Tue, Thu, Fri, Sat outings are locked for 1st years.
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
              Daily (Except Wednesday)
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Daily outing allowed till <strong className="text-emerald-300">8:00 PM curfew</strong>, except on <strong className="text-amber-300">Wednesday</strong> (Restricted Day).
          </p>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
            ⏰ 8:00 PM ke baad campus ke bahar rehne par fine lagega.
          </div>
        </div>

        {/* Rule 3: Night Stay / Home Leave Rule */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-400" />
              Overnight / Home Leave
            </span>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
              Night Stay Form
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Agar <strong>8:00 PM ke baad</strong> bahar rehna hai ya <strong>ghar jana hai</strong>, toh "Outstation Vacation / Home Leave" form bharein.
          </p>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
            📲 Requires Parent SMS confirmation and Warden approval.
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
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Departure:</strong> {pass.departureDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span><strong>Return Limit (Max 8 PM):</strong> {pass.expectedReturnDate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <strong>Reason:</strong> {pass.reason}
                    </p>
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
                            Verify Exit
                          </button>
                        )}

                        {isDeparted && (
                          <button
                            onClick={() => onRecordGateScan(pass.id, 'RE_ENTERED', 'Chief Warden Terminal')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verify Re-Entry
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              Apply Gate Pass / Outing Request
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Hostel Curfew Rules: Outing pass must be completed before <strong>8:00 PM</strong>.
            </p>

            {formError && (
              <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

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
                      <span>{cat === 'Outstation Vacation' ? 'Home Leave (Night)' : cat}</span>
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
                  <span>Hostel Outing Rule Check ({todayDayName}):</span>
                </p>
                <p className="text-[11px] mt-0.5">{currentEligibility.reason}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination (कहाँ जा रहे हैं - Exact Place Name):
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. City Market / Gym / Medical Store"
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
                    placeholder="e.g. 05:00 PM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Return Time (Max 08:00 PM):
                  </label>
                  <input
                    type="text"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    placeholder="e.g. 08:00 PM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Outing (कारण):
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Buying study materials / Workout / Grocery..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required
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