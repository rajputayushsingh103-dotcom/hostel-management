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
  KeyRound,
  Sparkles
} from 'lucide-react';
import { UserAuthSession } from '../types';

interface LoginPageProps {
  onLogin: (session: UserAuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  
  const [studentRoll, setStudentRoll] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
        setErrorMsg(`Credentials Match Failed: Roll "${studentRoll}" aur Password match nahi hua.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Cloud database connection error. Check internet connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const pass = staffPassword.trim();

    if (hostelDB.verifyWardenPassword(pass)) {
      onLogin({
        role: 'warden',
        name: 'Chief Warden Office',
        block: 'Tagore'
      });
      return;
    }

    if (hostelDB.verifyAdminPassword(pass)) {
      onLogin({
        role: 'college_admin',
        name: 'Dean Academics & Administration',
        block: 'Tagore'
      });
      return;
    }

    if (pass === 'guard123' || pass === 'guard@123' || pass === 'gate123') {
      onLogin({
        role: 'guard',
        name: 'Main Gate Security Guard Post 01',
        block: 'Tagore'
      });
      return;
    }

    setErrorMsg('Unauthorized PIN! Please enter valid Warden, Admin, or Guard credentials.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center pt-30 p-4 relative overflow-hidden font-sans">
      {/* Ambient Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full text-center mb-6 z-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Campus Hostel Management System</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          HostelHub Portal
        </h1>
        <p className="text-xs text-slate-400">
          Integrated Student Security, Biometrics & Room Management
        </p>
      </div>

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-7 shadow-2xl z-10 space-y-5">
        {/* 2-Tab Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('student'); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'student'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('staff'); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'staff'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Staff / Officials</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Student Login Form */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4"
           style={{ marginTop: '40px' }}>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Student Roll Number:</label>
              <div className="relative">
                <input
                  type="text"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  placeholder="Enter Roll No (e.g. 2504221530041)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none transition-colors"
                  required
                />
                <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Student Password:</label>
              <div className="relative">
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none transition-colors"
                  required
                />
                <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Enter Student Portal</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Staff / Official Login Form */}
        {activeTab === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Master Security Password / PIN:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Enter Warden, Admin or Guard PIN"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-white font-mono focus:outline-none transition-colors"
                  required
                  autoFocus
                />
                <KeyRound className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                🔒 System automatically routes to Warden Suite, Administration Desk, or Gate Guard Scanner.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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