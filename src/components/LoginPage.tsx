import React, { useState } from 'react';
import { hostelDB } from '../data/hostelDB';
import {
  ShieldCheck,
  User,
  Building2,
  Lock,
  KeyRound,
  LogIn,
  AlertCircle,
  School
} from 'lucide-react';
import { UserAuthSession, Role } from '../types';

interface LoginPageProps {
  onLogin: (session: UserAuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeMode, setActiveMode] = useState<Role>('student');
  
  // Student Login States
  const [studentRoll, setStudentRoll] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  // Warden & Admin Passwords State
  const [wardenPassword, setWardenPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Error Message State
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Real Student Login Handler
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentRoll.trim() || !studentPassword.trim()) {
      setErrorMsg('Please enter both Roll Number and Password.');
      return;
    }

    const student = hostelDB.authenticateStudent(studentRoll, studentPassword);

    if (student) {
      onLogin({
        role: 'student',
        studentId: student.studentId,
        name: student.name,
        rollNo: student.rollNo,
        block: student.block,
        roomNumber: student.roomNumber,
        year: student.year,
        faceVerified: true,
        parentPhone: student.parentPhone
      });
    } else {
      setErrorMsg('Invalid Credentials: Roll Number ya Password galat hai!');
    }
  };

  // 2. Real Warden Login Handler
  const handleWardenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (hostelDB.verifyWardenPassword(wardenPassword)) {
      onLogin({
        role: 'warden',
        name: 'Chief Warden Office',
        block: 'Tagore'
      });
    } else {
      setErrorMsg('Incorrect Warden Password!');
    }
  };

  // 3. Real Administration Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (hostelDB.verifyAdminPassword(adminPassword)) {
      onLogin({
        role: 'college_admin',
        name: 'Dean Academics & Administration',
        block: 'Tagore'
      });
    } else {
      setErrorMsg('Incorrect Administration Master Password!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="max-w-md w-full text-center mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Tagore, Tilak & Subhash Hostel Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hostel Hub Authentication
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Secure Portal for Students, Wardens & College Administration
        </p>
      </div>

      {/* Main Form Card */}
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-xs">
          <button
            type="button"
            onClick={() => { setActiveMode('student'); setErrorMsg(''); }}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'student' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('warden'); setErrorMsg(''); }}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'warden' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Warden</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('college_admin'); setErrorMsg(''); }}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'college_admin' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. STUDENT LOGIN FORM */}
        {activeMode === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student Roll Number:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  placeholder="Enter Roll Number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
                <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Enter your student password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Student Portal</span>
            </button>
          </form>
        )}

        {/* 2. WARDEN LOGIN FORM */}
        {activeMode === 'warden' && (
          <form onSubmit={handleWardenLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Warden Master Password:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={wardenPassword}
                  onChange={(e) => setWardenPassword(e.target.value)}
                  placeholder="Enter Warden Password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-red-500 transition-colors"
                  required
                />
                <KeyRound className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login as Warden</span>
            </button>
          </form>
        )}

        {/* 3. ADMINISTRATION LOGIN FORM */}
        {activeMode === 'college_admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administration Master Password:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter Admin Password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
            >
              <School className="w-4 h-4" />
              <span>Login as Administration</span>
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 text-center text-slate-500 text-xs">
        © 2026 Hostel Management System • Real Authentication
      </div>
    </div>
  );
};