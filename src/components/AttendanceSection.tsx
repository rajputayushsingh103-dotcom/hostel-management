// src/components/AttendanceSection.tsx
import React, { useState } from 'react';
import {
  Fingerprint,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Search,
  Building2,
  Phone,
  ShieldCheck,
  Clock,
  Edit2,
  Sliders,
  Users,
  BellRing,
  Home
} from 'lucide-react';
import { StudentAttendanceSummary, Role, BlockName, AttendanceTimingConfig, UserAuthSession } from '../types';

interface AttendanceSectionProps {
  summaries: StudentAttendanceSummary[];
  onToggleBiometricToday: (studentId: string) => void;
  onExcuseMissedDate: (studentId: string, date: string) => void;
  role: Role;
  userSession?: UserAuthSession;
  timingConfig?: AttendanceTimingConfig;
  onUpdateTimingConfig?: (newConfig: AttendanceTimingConfig) => void;
  onTriggerAutoGroupNotice?: (studentName: string, rollNo: string, year: number) => void;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  summaries,
  onToggleBiometricToday,
  onExcuseMissedDate,
  role,
  userSession,
  timingConfig = {
    firstYearMessTime: '07:00 PM - 08:15 PM',
    firstYearBiometricCutoff: '20:30',
    seniorYearsMessTime: '08:15 PM - 09:30 PM',
    seniorYearsBiometricCutoff: '21:30'
  },
  onUpdateTimingConfig,
  onTriggerAutoGroupNotice
}) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockName | 'All'>('All');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMissers, setShowOnlyMissers] = useState(false);

  // Warden timing edit modal state
  const [isEditingTimings, setIsEditingTimings] = useState(false);
  const [firstYearMess, setFirstYearMess] = useState(timingConfig.firstYearMessTime);
  const [firstYearCutoff, setFirstYearCutoff] = useState(timingConfig.firstYearBiometricCutoff);
  const [seniorMess, setSeniorMess] = useState(timingConfig.seniorYearsMessTime);
  const [seniorCutoff, setSeniorCutoff] = useState(timingConfig.seniorYearsBiometricCutoff);
  const [noticeSentMsg, setNoticeSentMsg] = useState<string | null>(null);

  // Student view summary
  const currentStudentSummary = (userSession?.studentId && summaries.find((s) => s.studentId === userSession.studentId)) || summaries[0];

  // Calculate actual year from student object
  const getStudentYear = (s: StudentAttendanceSummary): number => {
    if (s.studentId.includes('101') || s.studentId.includes('102')) return 1;
    if (s.studentId.includes('201') || s.studentId.includes('202')) return 2;
    if (s.studentId.includes('301')) return 3;
    return 4;
  };

  // Filter students who missed biometric today (For Warden)
  const todayMissersList = summaries.filter((s) => s.missedDates.includes('2026-08-03') && s.leaveCount === 0);

  // Filtered summaries for Warden & Admin
  const filteredSummaries = summaries.filter((s) => {
    if (selectedBlock !== 'All' && s.block !== selectedBlock) return false;
    if (showOnlyMissers && !s.missedDates.includes('2026-08-03')) return false;

    const studentYear = getStudentYear(s);
    if (selectedYearFilter !== 'All' && studentYear !== Number(selectedYearFilter)) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.roomNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveTimings = (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'warden') return;

    if (onUpdateTimingConfig) {
      onUpdateTimingConfig({
        firstYearMessTime: firstYearMess,
        firstYearBiometricCutoff: firstYearCutoff,
        seniorYearsMessTime: seniorMess,
        seniorYearsBiometricCutoff: seniorCutoff
      });
    }
    setIsEditingTimings(false);
    setNoticeSentMsg('Biometric cutoff and mess timings updated successfully!');
    setTimeout(() => setNoticeSentMsg(null), 3000);
  };

  const handleDispatchGroupNotice = (s: StudentAttendanceSummary) => {
    const studentYear = getStudentYear(s);
    if (onTriggerAutoGroupNotice) {
      onTriggerAutoGroupNotice(s.name, s.rollNo, studentYear);
    }
    setNoticeSentMsg(`✅ Alert automatically dispatched to ${studentYear}${studentYear === 1 ? 'st' : studentYear === 2 ? 'nd' : studentYear === 3 ? 'rd' : 'th'} Year Group for ${s.name}!`);
    setTimeout(() => setNoticeSentMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* 🟢 1. BIOMETRIC ATTENDANCE & TIMING AUTOMATION HUB */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30">
                <Fingerprint className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Biometric Attendance & Timing Automation</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
              1st Year Cutoff: <strong>08:30 PM</strong> | Seniors (2nd, 3rd, 4th Year) Cutoff: <strong>09:30 PM</strong>
            </p>
          </div>

          {/* Mass Missed Badge ONLY FOR WARDEN/ADMIN (Hidden for Students) */}
          {(role === 'warden' || role === 'college_admin') && (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400">Hostel Missed Swipes Today:</span>
              <span className="text-base font-black text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30">
                {todayMissersList.length} Students
              </span>
            </div>
          )}
        </div>

        {/* Year-Wise Timing Schedule Display */}
        <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-black text-indigo-900 dark:text-indigo-300 block text-sm">
                1st Year Freshers Schedule:
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-1 font-medium">
                Mess Dinner: <strong className="text-slate-950 dark:text-white">{timingConfig.firstYearMessTime}</strong><br />
                Biometric Cutoff: <strong className="text-indigo-700 dark:text-indigo-400 font-bold">{timingConfig.firstYearBiometricCutoff} (08:30 PM)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-500/20">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-black text-amber-900 dark:text-amber-300 block text-sm">
                2nd, 3rd & 4th Year Seniors Schedule:
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-1 font-medium">
                Mess Dinner: <strong className="text-slate-950 dark:text-white">{timingConfig.seniorYearsMessTime}</strong><br />
                Biometric Cutoff: <strong className="text-amber-700 dark:text-amber-400 font-bold">{timingConfig.seniorYearsBiometricCutoff} (09:30 PM)</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Change Timing Button ONLY FOR WARDEN */}
        {role === 'warden' && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsEditingTimings(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md"
            >
              <Sliders className="w-4 h-4" />
              <span>Change Biometric Cutoff Timings</span>
            </button>
          </div>
        )}
      </div>

      {noticeSentMsg && (
        <div className="bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{noticeSentMsg}</span>
        </div>
      )}

      {/* 🟢 2. STUDENT PERSONAL ATTENDANCE RECORD (ONLY VISIBLE FOR STUDENT) */}
      {role === 'student' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 lg:pr-6">
              <div>
                <span className="text-xs uppercase font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Personal Attendance Record
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {userSession?.name || currentStudentSummary.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold font-mono">
                  Room {userSession?.roomNumber || currentStudentSummary.roomNumber} • Roll: {userSession?.rollNo || currentStudentSummary.rollNo}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Attendance Rate</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                    {Math.round((currentStudentSummary.presentCount / (currentStudentSummary.totalDays || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                    style={{
                      width: `${(currentStudentSummary.presentCount / (currentStudentSummary.totalDays || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 p-2.5 rounded-xl">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 block font-bold">Present</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{currentStudentSummary.presentCount}</span>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 p-2.5 rounded-xl">
                  <span className="text-xs text-rose-700 dark:text-rose-400 block font-bold">Missed</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{currentStudentSummary.missedCount}</span>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 p-2.5 rounded-xl">
                  <span className="text-xs text-amber-700 dark:text-amber-400 block font-bold">Leave</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{currentStudentSummary.leaveCount}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Biometric Punch Missed Dates History:</span>
              </h4>

              {currentStudentSummary.missedDates.length === 0 ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% Biometric Record! Aapka koi bhi biometric punch miss nahi hua hai.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentStudentSummary.missedDates.map((date) => (
                    <div
                      key={date}
                      className="bg-slate-50 dark:bg-slate-950 border border-rose-300 dark:border-rose-500/30 p-3.5 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{date}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                            Missed biometric check-in before evening cutoff time.
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40">
                        Missed Punch Logged
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🟢 3. WARDEN & ADMIN ATTENDANCE MANAGEMENT TABLE */}
      {(role === 'warden' || role === 'college_admin') && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, room or roll..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-500 font-bold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowOnlyMissers(!showOnlyMissers)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  showOnlyMissers
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:text-slate-900 border border-slate-300 dark:border-slate-800'
                }`}
              >
                ⚠️ Missed Today ({todayMissersList.length})
              </button>

              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold"
              >
                <option value="All">All Years</option>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>

              {(['All', 'Tagore', 'Tilak', 'Subhash'] as const).map((blk) => (
                <button
                  key={blk}
                  onClick={() => setSelectedBlock(blk)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    selectedBlock === blk
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:text-slate-900 border border-slate-300 dark:border-slate-800'
                  }`}
                >
                  {blk}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-black border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Year & Room</th>
                    <th className="px-5 py-3.5">Biometric Status Today</th>
                    <th className="px-5 py-3.5">Total Misses</th>
                    {role === 'warden' && <th className="px-5 py-3.5 text-right">Warden Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSummaries.map((s) => {
                    const isMissedToday = s.missedDates.includes('2026-08-03');
                    const studentYear = getStudentYear(s);
                    const isOnLeave = s.leaveCount > 0;

                    return (
                      <tr key={s.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-black text-slate-900 dark:text-white flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center font-bold">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{s.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono font-bold">{s.rollNo}</p>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                          <span className="text-indigo-700 dark:text-indigo-400 font-black">{studentYear} Year</span> • {s.roomNumber} ({s.block})
                        </td>

                        <td className="px-5 py-4">
                          {isOnLeave ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                              <Home className="w-3.5 h-3.5 text-amber-600" />
                              On Approved Home Leave
                            </span>
                          ) : isMissedToday ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              Missed Cutoff Punch
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Swiped On Time
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 font-black text-slate-900 dark:text-slate-200">
                          <span className={s.missedCount > 3 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                            {s.missedCount} Missed
                          </span>
                        </td>

                        {role === 'warden' && (
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isMissedToday && !isOnLeave && (
                                <button
                                  onClick={() => handleDispatchGroupNotice(s)}
                                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 rounded-lg text-xs font-black flex items-center gap-1"
                                >
                                  <BellRing className="w-3.5 h-3.5" />
                                  Post to {studentYear} Year Group
                                </button>
                              )}

                              <a
                                href={`tel:${s.phone}`}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                Call
                              </a>

                              {isMissedToday && (
                                <button
                                  onClick={() => onExcuseMissedDate(s.studentId, '2026-08-03')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                                >
                                  Excused
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Warden Timing Config Modal */}
      {isEditingTimings && role === 'warden' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Configure Biometric Attendance Timings</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  Set cut-off times for 1st Year (Freshers) vs Senior Years
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveTimings} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-indigo-950/40 border border-slate-200 dark:border-indigo-500/30 rounded-2xl space-y-3">
                <p className="font-black text-indigo-900 dark:text-indigo-300 text-sm">🎓 1st Year Freshers Schedule:</p>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 mb-1 font-bold">Mess Dinner Hours:</label>
                  <input
                    type="text"
                    value={firstYearMess}
                    onChange={(e) => setFirstYearMess(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 mb-1 font-bold">Biometric Cutoff Time:</label>
                  <input
                    type="text"
                    value={firstYearCutoff}
                    onChange={(e) => setFirstYearCutoff(e.target.value)}
                    placeholder="e.g. 20:30 (08:30 PM)"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-amber-950/40 border border-slate-200 dark:border-amber-500/30 rounded-2xl space-y-3">
                <p className="font-black text-amber-900 dark:text-amber-300 text-sm">🎓 2nd, 3rd & 4th Year Seniors Schedule:</p>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 mb-1 font-bold">Mess Dinner Hours:</label>
                  <input
                    type="text"
                    value={seniorMess}
                    onChange={(e) => setSeniorMess(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 mb-1 font-bold">Biometric Cutoff Time:</label>
                  <input
                    type="text"
                    value={seniorCutoff}
                    onChange={(e) => setSeniorCutoff(e.target.value)}
                    placeholder="e.g. 21:30 (09:30 PM)"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingTimings(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black shadow-md"
                >
                  Save Timings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};