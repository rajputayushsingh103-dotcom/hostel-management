import React, { useState, useRef } from 'react';
import {
  UserX,
  Building2,
  AlertOctagon,
  Phone,
  CheckCircle2,
  Bell,
  Search,
  School,
  ShieldAlert,
  MapPin,
  Upload,
  RefreshCw,
  Send,
  Lock,
  Edit2,
  FileText,
  Check,
  MessageSquare,
  AlertCircle,
  X,
  UserCheck
} from 'lucide-react';
import { StudentAttendanceSummary, Role, BlockName, Room, RoomOccupant } from '../types';

interface BunkAlertSectionProps {
  summaries: StudentAttendanceSummary[];
  role: Role;
  rooms?: Room[];
  onUpdateOccupant?: (roomId: string, occupantId: string, updatedFields: Partial<RoomOccupant>) => void;
  onUpdateAttendanceSummaries?: (updatedSummaries: StudentAttendanceSummary[]) => void;
}

export const BunkAlertSection: React.FC<BunkAlertSectionProps> = ({
  summaries,
  role,
  rooms = [],
  onUpdateOccupant,
  onUpdateAttendanceSummaries
}) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockName | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedRooms, setCheckedRooms] = useState<Record<string, boolean>>({});

  // College Attendance Sheet Upload & Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // 3-Way Alert Log State (Dispatched SMS to Parents, Warden, Admin)
  const [dispatchedAlerts, setDispatchedAlerts] = useState<
    Record<string, { timestamp: string; parentPhone: string; smsContent: string }>
  >({});

  // Guardian Phone Editing Modal State (For Warden & College Admin)
  const [editingStudent, setEditingStudent] = useState<StudentAttendanceSummary | null>(null);
  const [editParentPhoneValue, setEditParentPhoneValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students who are bunking today (college absent but present in hostel)
  const bunkingStudents = summaries.filter((s) => s.collegeBunkFlagToday);

  const filteredBunkers = bunkingStudents.filter((s) => {
    if (selectedBlock !== 'All' && s.block !== selectedBlock) return false;
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

  const toggleRoomCheck = (studentId: string) => {
    setCheckedRooms((prev) => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // 1-Click College ERP Sync Simulation
  const handleSyncAcademicERP = () => {
    setIsSyncing(true);
    setSyncMessage(null);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('✅ LIVE COLLEGE ERP SYNC COMPLETE! Verified 184 morning lecture attendance sheets. Found data mismatch for students present in hostel rooms.');
    }, 1200);
  };

  // Handle Sheet File Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setShowUploadModal(false);
        setSyncMessage(`📄 ATTENDANCE SHEET UPLOADED: Successfully parsed "${file.name}". College attendance matched against Hostel Gate Biometric logs.`);
      }, 1000);
    }
  };

  // Dispatch 3-Way Automated Alert for a specific student
  const handleDispatchAlert = (student: StudentAttendanceSummary) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const parentMobile = student.parentPhone || student.phone || '+91 98123 45678';
    const smsText = `URGENT COLLEGE BUNK ALERT: Dear Parent/Guardian, ward ${student.name} (${student.rollNo}, Room ${student.roomNumber}) was checked PRESENT in Hostel but marked ABSENT in college lectures today without approved leave. College Administration & Chief Warden Office notified. Helpline: 0522-274001.`;

    setDispatchedAlerts((prev) => ({
      ...prev,
      [student.studentId]: {
        timestamp: timeStr,
        parentPhone: parentMobile,
        smsContent: smsText
      }
    }));
  };

  // Bulk Dispatch 3-Way Alerts to All Bunking Students' Parents
  const handleDispatchAllBulkAlerts = () => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newAlerts: Record<string, { timestamp: string; parentPhone: string; smsContent: string }> = {};

    bunkingStudents.forEach((student) => {
      const parentMobile = student.parentPhone || student.phone || '+91 98123 45678';
      newAlerts[student.studentId] = {
        timestamp: timeStr,
        parentPhone: parentMobile,
        smsContent: `URGENT COLLEGE BUNK ALERT: Dear Parent, ward ${student.name} (${student.rollNo}, Room ${student.roomNumber}) swiped hostel gate at 10:15 AM but missed college lectures today. College Administration & Warden Office notified.`
      };
    });

    setDispatchedAlerts((prev) => ({ ...prev, ...newAlerts }));
    setSyncMessage(`🚨 AUTOMATED 3-WAY ALERT DISPATCHED! Sent SMS notifications to ${bunkingStudents.length} parents & logged in College Admin database.`);
  };

  // Start Editing Guardian Phone (Warden & College Admin access)
  const handleStartEditGuardian = (student: StudentAttendanceSummary) => {
    setEditingStudent(student);
    setEditParentPhoneValue(student.parentPhone || student.phone || '+91 98123 45678');
  };

  // Save Guardian Phone Number
  const handleSaveGuardianPhone = () => {
    if (!editingStudent) return;

    // Find room and occupant if available
    let targetRoomId = '';
    let targetOccupantId = '';

    rooms.forEach((r) => {
      const occ = r.occupants.find(
        (o) => o.rollNo === editingStudent.rollNo || o.name === editingStudent.name
      );
      if (occ) {
        targetRoomId = r.id;
        targetOccupantId = occ.id;
      }
    });

    if (targetRoomId && targetOccupantId && onUpdateOccupant) {
      onUpdateOccupant(targetRoomId, targetOccupantId, {
        parentPhone: editParentPhoneValue
      });
    }

    if (onUpdateAttendanceSummaries) {
      const updated = summaries.map((s) => {
        if (s.studentId === editingStudent.studentId || s.rollNo === editingStudent.rollNo) {
          return { ...s, parentPhone: editParentPhoneValue };
        }
        return s;
      });
      onUpdateAttendanceSummaries(updated);
    }

    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Portal */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <School className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  College Attendance Tracking & Bunk Alert System
                  {role === 'college_admin' && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      ACADEMIC ADMIN ACCESS
                    </span>
                  )}
                  {role === 'warden' && (
                    <span className="text-[10px] bg-red-500/20 text-red-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-red-500/30">
                      WARDEN CONTROL
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Cross-references uploaded College Lecture Attendance with Hostel Biometric Gate Records. Automated 3-way SMS alerts to Parents, Wardens & Academic Admin.
                </p>
              </div>
            </div>
          </div>

          {/* Sync & Upload Action Buttons for College Admin & Warden */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {(role === 'college_admin' || role === 'warden') && (
              <>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Attendance Sheet</span>
                </button>

                <button
                  onClick={handleSyncAcademicERP}
                  disabled={isSyncing}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-lg shadow-amber-600/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing ERP...' : '1-Click ERP Sync'}</span>
                </button>
              </>
            )}

            {bunkingStudents.length > 0 && (role === 'college_admin' || role === 'warden') && (
              <button
                onClick={handleDispatchAllBulkAlerts}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch 3-Way Parent SMS to All ({bunkingStudents.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync or Upload Status Notification Banner */}
        {syncMessage && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-amber-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium">{syncMessage}</span>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="p-1 hover:bg-amber-900/50 rounded-lg text-amber-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Metric Overview Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Total Bunkers Detected</span>
            <span className="text-2xl font-black text-rose-400 mt-1 block flex items-center gap-2">
              {bunkingStudents.length}
              <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                Hostel Active
              </span>
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Tagore Block Bunkers</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">
              {bunkingStudents.filter((s) => s.block === 'Tagore').length} Students
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Tilak Block Bunkers</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">
              {bunkingStudents.filter((s) => s.block === 'Tilak').length} Students
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Subhash Block Bunkers</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">
              {bunkingStudents.filter((s) => s.block === 'Subhash').length} Students
            </span>
          </div>
        </div>
      </div>

      {/* Security & Access Rights Notice */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-medium">
            <strong>Guardian Contact Protection Policy:</strong> Students can view their registered parent phone number, but only <strong>Warden</strong> & <strong>College Administration</strong> have edit permissions to prevent fake mobile numbers.
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bunker name, roll no, room..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Tagore', 'Tilak', 'Subhash'] as const).map((blk) => (
            <button
              key={blk}
              onClick={() => setSelectedBlock(blk)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedBlock === blk
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {blk === 'All' ? 'All Blocks' : `${blk} Block`}
            </button>
          ))}
        </div>
      </div>

      {/* Bunking Students Discrepancy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBunkers.map((student) => {
          const isInspected = checkedRooms[student.studentId];
          const alertData = dispatchedAlerts[student.studentId];
          const parentPhone = student.parentPhone || student.phone || '+91 98123 45678';

          return (
            <div
              key={student.studentId}
              className={`bg-slate-900 border rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden ${
                alertData
                  ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-slate-900'
                  : 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900'
              }`}
            >
              {/* Header Details */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border-2 border-amber-500/40 flex items-center justify-center font-bold text-lg shadow-md">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {student.name}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        COLLEGE BUNK FLAG
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Roll: <span className="font-mono text-slate-200">{student.rollNo}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-950 text-indigo-300 border border-slate-800 block">
                    {student.roomNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">{student.block} Block</span>
                </div>
              </div>

              {/* Status Comparison Matrix */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-2xl">
                  <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-rose-400" />
                    College Lecture Sheet
                  </span>
                  <p className="font-extrabold text-white mt-1 text-xs">🔴 ABSENT IN CLASS</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">0/4 Lectures Attended Today</p>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-2xl">
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Hostel Gate Biometrics
                  </span>
                  <p className="font-extrabold text-white mt-1 text-xs">🟢 PRESENT IN HOSTEL</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Swiped Gate 10:15 AM</p>
                </div>
              </div>

              {/* Registered Parent / Guardian Phone Contact Bar */}
              <div className="mt-4 p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-400" />
                    Verified Guardian Contact:
                  </span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5 flex items-center gap-1.5">
                    {parentPhone}
                    {role === 'student' ? (
                      <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Locked for Student
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Verified by Admin
                      </span>
                    )}
                  </p>
                </div>

                {(role === 'warden' || role === 'college_admin') && (
                  <button
                    onClick={() => handleStartEditGuardian(student)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                    title="Edit Guardian Phone Number"
                  >
                    <Edit2 className="w-3 h-3 text-amber-400" />
                    <span>Edit Guardian Mobile</span>
                  </button>
                )}
              </div>

              {/* Live Dispatched 3-Way SMS Log Box */}
              {alertData && (
                <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-1">
                  <p className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>3-Way SMS Alert Delivered to Guardian ({alertData.parentPhone}) @ {alertData.timestamp}:</span>
                  </p>
                  <p className="text-[11px] text-emerald-200/90 font-mono bg-slate-950 p-2.5 rounded-xl border border-emerald-900/50 leading-relaxed">
                    "{alertData.smsContent}"
                  </p>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`tel:${parentPhone}`}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Call Guardian ({parentPhone})
                </a>

                <div className="flex items-center gap-2">
                  {(role === 'college_admin' || role === 'warden') && (
                    <button
                      onClick={() => handleDispatchAlert(student)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        alertData
                          ? 'bg-emerald-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{alertData ? 'Resend 3-Way Alert' : 'Send 3-Way Alert SMS'}</span>
                    </button>
                  )}

                  {role === 'warden' && (
                    <button
                      onClick={() => toggleRoomCheck(student.studentId)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isInspected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isInspected ? 'Inspection Done ✓' : 'Inspect Room'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBunkers.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <p className="text-base font-bold text-white">No Data Mismatch / College Bunkers Detected!</p>
          <p className="text-xs text-slate-400">All students present in hostel rooms are attending their scheduled college lectures today.</p>
        </div>
      )}

      {/* UPLOAD COLLEGE ATTENDANCE SHEET MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Upload College Class Attendance Sheet</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Select CSV / Excel file exported from College Academic ERP to match lecture presence with Hostel Gate biometrics:
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/60 transition-all space-y-2"
            >
              <Upload className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-xs font-bold text-white">
                {uploadedFileName ? uploadedFileName : 'Click to Browse Attendance Sheet (.csv, .xlsx)'}
              </p>
              <p className="text-[10px] text-slate-400">Supports standard Roll No & Lecture Attendance status columns</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSyncAcademicERP}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20"
              >
                Use Sample Academic Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GUARDIAN PHONE MODAL (FOR WARDEN & COLLEGE ADMIN) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Verified Guardian Mobile Number</h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xs text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-300">
                <ShieldAlert className="w-3.5 h-3.5" />
                Administrative Guardian Security Policy:
              </p>
              <p className="text-[11px] leading-relaxed">
                Updating guardian contact for student <strong>{editingStudent.name}</strong> ({editingStudent.rollNo}). Students cannot modify this field themselves.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Parent / Guardian Phone (SMS Recipient):
              </label>
              <input
                type="text"
                value={editParentPhoneValue}
                onChange={(e) => setEditParentPhoneValue(e.target.value)}
                placeholder="e.g. +91 98123 45678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGuardianPhone}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Verified Guardian Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
