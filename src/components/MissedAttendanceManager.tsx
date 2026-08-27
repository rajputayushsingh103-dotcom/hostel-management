// src/components/MissedAttendanceManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Scan,
  User,
  Check,
  Bell,
  Sparkles
} from 'lucide-react';
import { hostelDB, StudentRecord } from '../data/hostelDB';
import { Role } from '../types';

interface MissedAttendanceManagerProps {
  role: Role;
  onSendNoticeToGroup: (yearGroup: 1 | 2 | 3 | 4, studentName: string, faceId: string) => void;
}

export const MissedAttendanceManager: React.FC<MissedAttendanceManagerProps> = ({
  role,
  onSendNoticeToGroup
}) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [missedStudentIds, setMissedStudentIds] = useState<string[]>([]);
  const [broadcastedIds, setBroadcastedIds] = useState<string[]>([]);
  const [successAlert, setSuccessAlert] = useState('');

  // 🟢 SAFE ASYNC FIREBASE CLOUD DATA LOADER
  useEffect(() => {
    // 1. Initial Load
    hostelDB.getAllStudents().then((list) => {
      if (Array.isArray(list)) {
        setStudents(list);
        setMissedStudentIds(list.slice(0, 2).map((s) => s.studentId));
      }
    });

    // 2. Realtime Listener
    const unsubscribe = hostelDB.subscribeToStudents((list) => {
      if (Array.isArray(list)) {
        setStudents(list);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const safeList = Array.isArray(students) ? students : [];

  // Group students safely
  const year1Students = safeList.filter((s) => Number(s.year) === 1);
  const year2Students = safeList.filter((s) => Number(s.year) === 2);
  const year3Students = safeList.filter((s) => Number(s.year) === 3);
  const year4Students = safeList.filter((s) => Number(s.year) === 4);

  // 🎯 PUSH NOTICE (Only Name + Face ID)
  const handlePushNotice = (student: StudentRecord) => {
    const targetYear = (Number(student.year) >= 1 && Number(student.year) <= 4 ? Number(student.year) : 1) as 1 | 2 | 3 | 4;
    const faceId = student.faceId || `FID-${student.rollNo ? student.rollNo.slice(-3) : '101'}`;

    onSendNoticeToGroup(targetYear, student.name, faceId);

    setBroadcastedIds((prev) => [...prev, student.studentId]);
    setSuccessAlert(`📢 Notice Sent to ${targetYear} Year Group: ${student.name} (Face ID: ${faceId})`);
    setTimeout(() => setSuccessAlert(''), 3500);
  };

  // ⚡ BULK PUSH FOR ENTIRE YEAR (Only Name + Face ID)
  const handleBulkPushForYear = (yearNum: 1 | 2 | 3 | 4, yearStudentsList: StudentRecord[]) => {
    const missedInThisYear = yearStudentsList.filter((s) => missedStudentIds.includes(s.studentId));

    if (missedInThisYear.length === 0) {
      alert(`✅ ${yearNum} Year me sabhi students ka biometric punch lag chuka hai!`);
      return;
    }

    missedInThisYear.forEach((s) => {
      const faceId = s.faceId || `FID-${s.rollNo ? s.rollNo.slice(-3) : '101'}`;
      onSendNoticeToGroup(yearNum, s.name, faceId);
    });

    const newIds = missedInThisYear.map((s) => s.studentId);
    setBroadcastedIds((prev) => [...prev, ...newIds]);

    setSuccessAlert(`⚡ Broadcast Complete: ${missedInThisYear.length} students pushed to ${yearNum} Year Group!`);
    setTimeout(() => setSuccessAlert(''), 4000);
  };

  const toggleAttendanceStatus = (studentId: string) => {
    if (missedStudentIds.includes(studentId)) {
      setMissedStudentIds(missedStudentIds.filter((id) => id !== studentId));
    } else {
      setMissedStudentIds([...missedStudentIds, studentId]);
    }
  };

  const renderYearSection = (
    yearNumber: 1 | 2 | 3 | 4,
    yearTitle: string,
    cutoffTime: string,
    yearStudents: StudentRecord[],
    badgeColor: string
  ) => {
    const missedCount = yearStudents.filter((s) => missedStudentIds.includes(s.studentId)).length;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${badgeColor}`}>
                {yearTitle}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                (Biometric Cutoff: {cutoffTime})
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-semibold">
              Total Enrolled: <strong>{yearStudents.length}</strong> • Missed Today:{' '}
              <strong className={missedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                {missedCount} Students
              </strong>
            </p>
          </div>

          {role === 'warden' && (
            <button
              onClick={() => handleBulkPushForYear(yearNumber, yearStudents)}
              disabled={missedCount === 0}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white disabled:text-slate-400 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Push All {yearNumber}{yearNumber === 1 ? 'st' : yearNumber === 2 ? 'nd' : yearNumber === 3 ? 'rd' : 'th'} Year Missed Alerts</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2 px-3">Student Name</th>
                <th className="py-2 px-3">Biometric Face ID</th>
                <th className="py-2 px-3">Attendance Status</th>
                <th className="py-2 px-3 text-right">Warden Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {yearStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    No students registered in this year group.
                  </td>
                </tr>
              ) : (
                yearStudents.map((std) => {
                  const isMissed = missedStudentIds.includes(std.studentId);
                  const isAlreadySent = broadcastedIds.includes(std.studentId);
                  const faceId = std.faceId || `FID-${std.rollNo ? std.rollNo.slice(-3) : '101'}`;

                  return (
                    <tr key={std.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {std.name}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {faceId}
                      </td>

                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => role === 'warden' && toggleAttendanceStatus(std.studentId)}
                          disabled={role !== 'warden'}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all ${
                            isMissed
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40 animate-pulse'
                              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                          }`}
                        >
                          {isMissed ? '❌ Missed Punch' : '✅ Present / Punched'}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {role === 'warden' && isMissed && (
                          <button
                            onClick={() => handlePushNotice(std)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black inline-flex items-center gap-1.5 transition-all shadow-sm ${
                              isAlreadySent
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                            }`}
                          >
                            <Send className="w-3 format-3" />
                            <span>{isAlreadySent ? 'Notice Re-Sent' : 'Push to Group'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Year-Wise Biometric Missed Attendance & Group Broadcast Terminal
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Privacy Enforced: Group broadcast transmits <strong>ONLY Student Name & Face ID</strong> (Room & Roll No are strictly hidden).
              </p>
            </div>
          </div>
        </div>
      </div>

      {successAlert && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* 1st Year Freshers (Top) */}
      {renderYearSection(
        1,
        '1st Year Freshers Section',
        '08:30 PM Sharp',
        year1Students,
        'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200'
      )}

      {/* 2nd Year */}
      {renderYearSection(
        2,
        '2nd Year Sophomores Section',
        '09:30 PM Sharp',
        year2Students,
        'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-200'
      )}

      {/* 3rd Year */}
      {renderYearSection(
        3,
        '3rd Year Juniors Section',
        '09:30 PM Sharp',
        year3Students,
        'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200'
      )}

      {/* 4th Year */}
      {renderYearSection(
        4,
        '4th Year Seniors Section',
        '09:30 PM Sharp',
        year4Students,
        'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200'
      )}
    </div>
  );
};