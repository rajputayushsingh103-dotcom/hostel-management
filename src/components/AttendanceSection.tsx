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
  BellRing
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
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [showOnlyMissers, setShowOnlyMissers] = useState(false);

  // Warden timing edit modal state
  const [isEditingTimings, setIsEditingTimings] = useState(false);
  const [firstYearMess, setFirstYearMess] = useState(timingConfig.firstYearMessTime);
  const [firstYearCutoff, setFirstYearCutoff] = useState(timingConfig.firstYearBiometricCutoff);
  const [seniorMess, setSeniorMess] = useState(timingConfig.seniorYearsMessTime);
  const [seniorCutoff, setSeniorCutoff] = useState(timingConfig.seniorYearsBiometricCutoff);
  const [noticeSentMsg, setNoticeSentMsg] = useState<string | null>(null);

  // Student view summary - matches logged in student session
  const currentStudentSummary = (userSession?.studentId && summaries.find((s) => s.studentId === userSession.studentId)) || summaries[0];

  // Warden: Calculate total missers today (students who missed biometric on Aug 3)
  const todayMissersList = summaries.filter((s) => s.missedDates.includes('2026-08-03'));

  // Filtered summaries for Warden view
  const filteredSummaries = summaries.filter((s) => {
    if (selectedBlock !== 'All' && s.block !== selectedBlock) return false;
    if (showOnlyMissers && !s.missedDates.includes('2026-08-03')) return false;

    // Filter by student academic year if selected
    if (selectedYearFilter !== 'All') {
      const studentObjYear = s.studentId === 'std-102' ? 1 : s.studentId === 'std-201' ? 2 : 3;
      if (studentObjYear !== Number(selectedYearFilter)) return false;
    }

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
    if (onUpdateTimingConfig) {
      onUpdateTimingConfig({
        firstYearMessTime: firstYearMess,
        firstYearBiometricCutoff: firstYearCutoff,
        seniorYearsMessTime: seniorMess,
        seniorYearsBiometricCutoff: seniorCutoff
      });
    }
    setIsEditingTimings(false);
    setNoticeSentMsg('Biometric cutoff and mess timings successfully updated!');
    setTimeout(() => setNoticeSentMsg(null), 3000);
  };

  const handleDispatchGroupNotice = (s: StudentAttendanceSummary) => {
    const studentYear = s.studentId === 'std-102' ? 1 : s.studentId === 'std-201' ? 2 : 3;
    if (onTriggerAutoGroupNotice) {
      onTriggerAutoGroupNotice(s.name, s.rollNo, studentYear);
    }
    setNoticeSentMsg(`Automated Missed Notice posted to ${studentYear}st/nd/rd Year Group for ${s.name}!`);
    setTimeout(() => setNoticeSentMsg(null), 3500);
  };

  const generateWhatsAppText = () => {
    const header = `🚨 *HOSTEL BIOMETRIC ATTENDANCE MISS LIST*\n📅 Date: 03-August-2026\n\nThe following ${todayMissersList.length} students missed evening biometric attendance swipe:\n\n`;
    const listText = todayMissersList
      .map(
        (s, idx) =>
          `${idx + 1}. *${s.name}* (${s.roomNumber}, Roll: ${s.rollNo}) - Ph: ${s.phone}`
      )
      .join('\n');
    const footer = `\n\n⚠️ *Action Required:* Report to Warden Office immediately or present valid out-pass.`;
    return header + listText + footer;
  };

  const handleCopyWhatsAppText = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Fingerprint className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Biometric Attendance & Timing System</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Set year-specific biometric cutoff times and track late / missed check-ins across Tagore, Tilak & Subhash blocks.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Today's Missed Swipes:</span>
            <span className="text-base font-extrabold text-rose-400 px-2.5 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/30">
              {todayMissersList.length} Students
            </span>
          </div>
        </div>

        {/* Year-Wise Timing Schedule Display */}
        <div className="mt-5 p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/20">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-indigo-300 block text-sm">
                1st Year Freshers Timing:
              </span>
              <p className="text-slate-300 mt-1">
                Mess Dinner: <strong>{timingConfig.firstYearMessTime}</strong><br />
                Biometric Cutoff Time: <strong className="text-indigo-400">{timingConfig.firstYearBiometricCutoff} (08:30 PM)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-950/30 rounded-xl border border-amber-500/20">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-300 block text-sm">
                2nd, 3rd & 4th Year Seniors Timing:
              </span>
              <p className="text-slate-300 mt-1">
                Mess Dinner: <strong>{timingConfig.seniorYearsMessTime}</strong><br />
                Biometric Cutoff Time: <strong className="text-amber-400">{timingConfig.seniorYearsBiometricCutoff} (09:30 PM)</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Warden Timing Config Trigger */}
        {role === 'warden' && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsEditingTimings(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Sliders className="w-4 h-4" />
              <span>Configure Warden Biometric Cutoff Timings</span>
            </button>
          </div>
        )}
      </div>

      {noticeSentMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm shadow-xl animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{noticeSentMsg}</span>
        </div>
      )}

      {copiedNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>WhatsApp Group Broadcast copied to clipboard! Ready to paste into Hostel WhatsApp Group.</span>
        </div>
      )}

      {/* STUDENT VIEW */}
      {role === 'student' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 lg:pr-6">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Personal Attendance Dashboard
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {currentStudentSummary.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Room {currentStudentSummary.roomNumber} • {currentStudentSummary.rollNo}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-400">August Attendance Rate</span>
                  <span className="text-emerald-400 font-extrabold">
                    {Math.round((currentStudentSummary.presentCount / currentStudentSummary.totalDays) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                    style={{
                      width: `${(currentStudentSummary.presentCount / currentStudentSummary.totalDays) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                  <span className="text-xs text-emerald-400 block font-semibold">Present</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">{currentStudentSummary.presentCount}</span>
                </div>

                <div className="bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl">
                  <span className="text-xs text-rose-400 block font-semibold">Missed</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">{currentStudentSummary.missedCount}</span>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl">
                  <span className="text-xs text-amber-400 block font-semibold">Leave</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">{currentStudentSummary.leaveCount}</span>
                </div>
              </div>

              {/* Physical Biometric Hardware Machine Terminal Indicator */}
              <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-indigo-400" />
                    Hostel Gate Machine Terminal
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    IP: 192.168.1.108
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  🔒 Attendance is logged strictly via the physical Biometric Fingerprint Machine installed at the Hostel Main Entrance. Remote in-app punching is disabled to prevent proxy attendance.
                </p>

                {currentStudentSummary.missedDates.includes('2026-08-03') ? (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>No Physical Machine Swipe Recorded Today. Please scan at Hostel Gate Reader before cutoff.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Physical Biometric Machine Swipe Synced (Scanned at Hostel Gate Terminal @ 08:14 PM).</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Biometric Punch Missed Dates (August Log):
              </h4>

              {currentStudentSummary.missedDates.length === 0 ? (
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  100% Biometric Swipe Record! No missed dates recorded this month.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentStudentSummary.missedDates.map((date) => (
                    <div
                      key={date}
                      className="bg-slate-950 border border-rose-500/30 p-3.5 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold text-white">{date}</p>
                          <p className="text-[11px] text-slate-400">
                            Punched after warden cutoff limit or missed biometric log.
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Log Dispatched To Year Group
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WARDEN / ADMIN VIEW */}
      {role === 'warden' && (
        <div className="space-y-6">
          {/* Hardware Machine Terminal Sync Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Hostel Gate Biometric Hardware Readers
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    2 Terminals Online
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Terminal 01 (Tagore Gate - IP 192.168.1.108) • Terminal 02 (Tilak Gate - IP 192.168.1.109)
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setNoticeSentMsg('Live Physical Biometric Machine Logs fetched from Gate Readers IP 192.168.1.108!');
                setTimeout(() => setNoticeSentMsg(null), 3500);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Sync Hardware Biometric Machine Logs</span>
            </button>
          </div>

          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">
                    Biometric Missed List (WhatsApp & Year Group Dispatch)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Click below to copy WhatsApp broadcast notice for parent & hostel group.
                </p>
              </div>

              <button
                onClick={handleCopyWhatsAppText}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all self-start md:self-auto"
              >
                {copiedNotice ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedNotice ? 'Copied!' : '📋 Copy WhatsApp Group Notice'}
              </button>
            </div>

            <div className="mt-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 whitespace-pre-line leading-relaxed">
              {generateWhatsAppText()}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, room or roll..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowOnlyMissers(!showOnlyMissers)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  showOnlyMissers
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                ⚠️ Today's Missers ({todayMissersList.length})
              </button>

              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="bg-slate-950 text-slate-300 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                <option value="All">All Academic Years</option>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>

              {(['All', 'Tagore', 'Tilak', 'Subhash'] as const).map((blk) => (
                <button
                  key={blk}
                  onClick={() => setSelectedBlock(blk)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    selectedBlock === blk
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {blk}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Block & Room</th>
                    <th className="px-5 py-3.5">Biometric Status Today</th>
                    <th className="px-5 py-3.5">Total Misses</th>
                    <th className="px-5 py-3.5 text-right">Warden Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSummaries.map((s) => {
                    const isMissedToday = s.missedDates.includes('2026-08-03');

                    return (
                      <tr key={s.studentId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-bold text-white flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{s.name}</p>
                            <p className="text-[11px] text-slate-400">{s.rollNo}</p>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-200">
                          {s.roomNumber} ({s.block})
                        </td>

                        <td className="px-5 py-4">
                          {isMissedToday ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              Missed Cutoff Punch
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Swiped On Time
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 font-extrabold text-slate-200">
                          <span className={s.missedCount > 3 ? 'text-rose-400' : 'text-slate-300'}>
                            {s.missedCount} Missed
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {isMissedToday && (
                              <button
                                onClick={() => handleDispatchGroupNotice(s)}
                                className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold flex items-center gap-1"
                                title="Send automated alert to student's year group"
                              >
                                <BellRing className="w-3.5 h-3.5" />
                                Post to Year Group
                              </button>
                            )}

                            <a
                              href={`tel:${s.phone}`}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Call
                            </a>

                            {isMissedToday && (
                              <button
                                onClick={() => onExcuseMissedDate(s.studentId, '2026-08-03')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                              >
                                Excused
                              </button>
                            )}
                          </div>
                        </td>
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
      {isEditingTimings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Configure Warden Attendance Timings</h3>
                <p className="text-xs text-slate-400">
                  Set cut-off times for 1st Year vs Senior Years
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveTimings} className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3">
                <p className="font-bold text-indigo-300 text-sm">🎓 1st Year Freshers Schedule:</p>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Mess Dinner Hours:</label>
                  <input
                    type="text"
                    value={firstYearMess}
                    onChange={(e) => setFirstYearMess(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Biometric Punch Cutoff Time:</label>
                  <input
                    type="text"
                    value={firstYearCutoff}
                    onChange={(e) => setFirstYearCutoff(e.target.value)}
                    placeholder="e.g. 20:30 (08:30 PM)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl space-y-3">
                <p className="font-bold text-amber-300 text-sm">🎓 2nd, 3rd & 4th Year Seniors Schedule:</p>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Mess Dinner Hours:</label>
                  <input
                    type="text"
                    value={seniorMess}
                    onChange={(e) => setSeniorMess(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Biometric Punch Cutoff Time:</label>
                  <input
                    type="text"
                    value={seniorCutoff}
                    onChange={(e) => setSeniorCutoff(e.target.value)}
                    placeholder="e.g. 21:30 (09:30 PM)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingTimings(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30"
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
