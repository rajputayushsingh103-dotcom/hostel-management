// src/components/LoginPage.tsx
import React, { useState } from 'react';
import { hostelDB } from '../data/hostelDB';
import {
  ShieldCheck,
  User,
  Building2,
  Lock,
  LogIn,
  AlertCircle,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { UserAuthSession } from '../types';

interface LoginPageProps {
  onLogin: (session: UserAuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // 🟢 Only 2 Tabs: 'student' and 'staff'
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  
  // Student Form
  const [studentRoll, setStudentRoll] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  // Staff Master Password
  const [staffPassword, setStaffPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // 1. Student Login
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentRoll.trim() || !studentPassword.trim()) {
      setErrorMsg('Roll Number aur Password dono enter karein.');
      return;
    }

    setIsAuthenticating(true);

    try {
      const student = await hostelDB.authenticateStudent(studentRoll, studentPassword);

      if (student) {
        onLogin({
          role: 'student',
          studentId: student.studentId,
          name: student.name,
          rollNo: student.rollNo,
          faceId: student.faceId,
          block: student.block,
          roomNumber: student.roomNumber,
          year: student.year,
          faceVerified: true,
          parentPhone: student.parentPhone
        });
      } else {
        setErrorMsg(`Galat Credentials! Roll: "${studentRoll}" aur Password match nahi hua.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Database se connect karne me problem hui. Internet check karein.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 2. 🟢 Smart Official / Staff Login (Auto Role Detection)
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const pass = staffPassword.trim();

    // A. Warden Access
    if (hostelDB.verifyWardenPassword(pass)) {
      onLogin({
        role: 'warden',
        name: 'Chief Warden Office',
        block: 'Tagore'
      });
      return;
    }

    // B. College Administration Access
    if (hostelDB.verifyAdminPassword(pass)) {
      onLogin({
        role: 'college_admin',
        name: 'Dean Academics & Administration',
        block: 'Tagore'
      });
      return;
    }

    // C. Gate Security Guard Access
    if (pass === 'guard123' || pass === 'guard@123' || pass === 'gate123') {
      onLogin({
        role: 'guard',
        name: 'Main Gate Security Guard Post 01',
        block: 'Tagore'
      });
      return;
    }

    setErrorMsg('Invalid Staff Password / PIN! Enter authorized Warden, Admin, or Guard credentials.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full text-center mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Tagore, Tilak & Subhash Hostel Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hostel Hub Authentication
        </h1>
      </div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* 🟢 2 CLEAN TABS */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('student'); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'student'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('staff'); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'staff'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Staff / Officials</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. STUDENT LOGIN FORM */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Student Roll Number:</label>
              <div className="relative">
                <input
                  type="text"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  placeholder="Enter Roll Number (e.g. 2504221530041)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:border-indigo-500"
                  required
                />
                <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Student Password:</label>
              <div className="relative">
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:border-indigo-500"
                  required
                />
                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying from Cloud...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login to Student Portal</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. 🟢 UNIFIED STAFF / OFFICIAL LOGIN FORM */}
        {activeTab === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Access Password / Security PIN:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Enter Warden, Admin, or Guard Password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:border-amber-500 font-mono"
                  required
                  autoFocus
                />
                <KeyRound className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                🔒 System automatically routes to Warden Dashboard, Administration Desk, or Gate Guard Scanner based on credentials.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate Official Portal</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};