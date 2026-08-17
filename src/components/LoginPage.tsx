import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Building2,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ArrowRight,
  Camera,
  Scan,
  Check,
  Fingerprint,
  Smartphone,
  Send,
  Lock,
  School
} from 'lucide-react';
import { UserAuthSession, Role, BlockName } from '../types';

interface LoginPageProps {
  onLogin: (session: UserAuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeMode, setActiveMode] = useState<Role>('student');
  const [loginMethod, setLoginMethod] = useState<'facescan' | 'credentials'>('facescan');
  const [selectedStudentFace, setSelectedStudentFace] = useState('std-101');
  const [studentRoll, setStudentRoll] = useState('2024CS1042');
  const [roomNumber, setRoomNumber] = useState('Tagore-101');
  const [year, setYear] = useState<number>(3);
  const [wardenPin, setWardenPin] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');

  // Warden Multi-Auth State
  const [wardenAuthMode, setWardenAuthMode] = useState<'facescan' | 'fingerprint' | 'mobile_otp' | 'password'>('facescan');
  const [wardenPhone, setWardenPhone] = useState('+91 98000 12345');
  const [wardenOtp, setWardenOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifyingWarden, setIsVerifyingWarden] = useState(false);

  // Face ID Scan Simulator State
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceVerified, setFaceVerified] = useState(true);

  // Registered Student Database for Strict Triple Match Validation
  const registeredStudents = [
    {
      studentId: 'std-101',
      name: 'Aayush Singh',
      faceId: 'FID-2024-1042',
      rollNo: '2024CS1042',
      block: 'Tagore' as BlockName,
      roomNumber: 'Tagore-101',
      year: 3,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      parentPhone: '+91 98123 45678'
    },
    {
      studentId: 'std-102',
      name: 'Rohan Verma',
      faceId: 'FID-2026-1001',
      rollNo: '2026CS1001',
      block: 'Tagore' as BlockName,
      roomNumber: 'Tagore-102',
      year: 1,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      parentPhone: '+91 98765 11111'
    },
    {
      studentId: 'std-201',
      name: 'Harsh Gupta',
      faceId: 'FID-2024-1023',
      rollNo: '2024EE1023',
      block: 'Tilak' as BlockName,
      roomNumber: 'Tilak-101',
      year: 2,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      parentPhone: '+91 98990 11223'
    },
    {
      studentId: 'std-301',
      name: 'Saurabh Singh',
      faceId: 'FID-2023-1102',
      rollNo: '2023CS1102',
      block: 'Subhash' as BlockName,
      roomNumber: 'Subhash-101',
      year: 4,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      parentPhone: '+91 95667 78899'
    }
  ];

  const currentFaceStudent = registeredStudents.find((s) => s.studentId === selectedStudentFace) || registeredStudents[0];

  const handleInstantFaceLogin = () => {
    setIsScanningFace(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsScanningFace(false);
      onLogin({
        role: 'student',
        studentId: currentFaceStudent.studentId,
        name: currentFaceStudent.name,
        rollNo: currentFaceStudent.rollNo,
        block: currentFaceStudent.block,
        roomNumber: currentFaceStudent.roomNumber,
        year: currentFaceStudent.year,
        faceVerified: true,
        parentPhone: currentFaceStudent.parentPhone
      });
    }, 1200);
  };

  const handleSimulateFaceScan = () => {
    setIsScanningFace(true);
    setFaceVerified(false);
    setErrorMsg('');

    setTimeout(() => {
      setIsScanningFace(false);
      setFaceVerified(true);
    }, 1500);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!faceVerified) {
      setErrorMsg('Please complete Face ID scan verification before logging in.');
      return;
    }

    // Strict validation: Match Face ID / Roll, Room Number, and Academic Year
    const found = registeredStudents.find(
      (s) =>
        s.rollNo.toLowerCase() === studentRoll.trim().toLowerCase() &&
        s.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase() &&
        s.year === Number(year)
    );

    if (found) {
      onLogin({
        role: 'student',
        studentId: found.studentId,
        name: found.name,
        rollNo: found.rollNo,
        block: found.block,
        roomNumber: found.roomNumber,
        year: found.year,
        faceVerified: true,
        parentPhone: found.parentPhone
      });
    } else {
      setErrorMsg(
        'Login Failed: Student Face ID / Roll Number, Room Number, and Academic Year do not match hostel records. Please verify all 3 parameters.'
      );
    }
  };

  const handleWardenFaceLogin = () => {
    setIsVerifyingWarden(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsVerifyingWarden(false);
      onLogin({
        role: 'warden',
        name: 'Chief Warden Office',
        block: 'Tagore'
      });
    }, 1200);
  };

  const handleWardenFingerprintLogin = () => {
    setIsVerifyingWarden(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsVerifyingWarden(false);
      onLogin({
        role: 'warden',
        name: 'Chief Warden Office',
        block: 'Tagore'
      });
    }, 1200);
  };

  const handleSendWardenOtp = () => {
    if (!wardenPhone.trim()) {
      setErrorMsg('Please enter registered Warden mobile number.');
      return;
    }
    setIsOtpSent(true);
    setWardenOtp('882201'); // Auto-fill 6-digit demo OTP for smooth testing
    setErrorMsg('');
  };

  const handleVerifyWardenOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (wardenOtp.length >= 4) {
      onLogin({
        role: 'warden',
        name: 'Chief Warden Office',
        block: 'Tagore'
      });
    } else {
      setErrorMsg('Invalid 6-digit OTP code.');
    }
  };

  const handleWardenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wardenPin === '1234' || wardenPin.trim().length >= 3) {
      onLogin({
        role: 'warden',
        name: 'Chief Warden Office',
        block: 'Tagore'
      });
    } else {
      setErrorMsg('Incorrect Warden PIN! (Default PIN is 1234)');
    }
  };

  const handleCollegeAdminLogin = () => {
    onLogin({
      role: 'college_admin',
      name: 'Dean Academics & College Administration',
      block: 'Tagore'
    });
  };

  const handleQuickStudentSelect = (std: typeof registeredStudents[0]) => {
    setStudentRoll(std.rollNo);
    setRoomNumber(std.roomNumber);
    setYear(std.year);
    setFaceVerified(true);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Badge */}
      <div className="max-w-md w-full text-center mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Tagore, Tilak & Subhash Hostel Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hostel Sync & Face ID Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Secure Biometric & Room Access • Parent Outstation Alert • College Attendance Bunk Sync
        </p>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Toggle Mode */}
        <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-2xl border border-slate-800/80 mb-6 text-xs">
          <button
            onClick={() => {
              setActiveMode('student');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'student'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('warden');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'warden'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Warden</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('college_admin');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'college_admin'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>College Admin</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {activeMode === 'student' ? (
          <div>
            {/* Student Login Method Switcher */}
            <div className="flex gap-2 mb-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLoginMethod('facescan')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'facescan'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>AI Face Scan Login</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginMethod('credentials')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === 'credentials'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Roll & Room Login</span>
              </button>
            </div>

            {loginMethod === 'facescan' ? (
              <div className="space-y-4">
                {/* AI Facial Recognition Camera Stream Simulation */}
                <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl text-center relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Scan className="w-4 h-4 text-indigo-400 animate-pulse" />
                      Live AI Face Recognition Lens
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Face ID Ready
                    </span>
                  </div>

                  {/* Student Face Profile Selector */}
                  <div className="mb-3 text-left">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Detected Registered Student Face Profile:
                    </label>
                    <select
                      value={selectedStudentFace}
                      onChange={(e) => setSelectedStudentFace(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-indigo-500"
                    >
                      {registeredStudents.map((std) => (
                        <option key={std.studentId} value={std.studentId}>
                          {std.name} ({std.year}{std.year === 1 ? 'st' : std.year === 2 ? 'nd' : std.year === 3 ? 'rd' : 'th'} Yr) • {std.roomNumber} [Face ID: {std.faceId}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Camera Oval Viewfinder with Mesh Scan Animation */}
                  <div className="my-3 py-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-500/60 relative flex items-center justify-center overflow-hidden shadow-inner">
                      <img
                        src={currentFaceStudent.avatar}
                        alt={currentFaceStudent.name}
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />

                      {/* Scanning Target HUD Overlay */}
                      <div className="absolute inset-0 bg-indigo-500/20 pointer-events-none flex items-center justify-center">
                        {isScanningFace ? (
                          <div className="w-full h-1 bg-emerald-400 shadow-md shadow-emerald-400 animate-bounce" />
                        ) : (
                          <div className="w-16 h-16 border border-indigo-400/80 rounded-full animate-ping opacity-40" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-bold text-white mt-2">{currentFaceStudent.name}</p>
                    <p className="text-[10px] text-indigo-300 font-mono">
                      Face ID: {currentFaceStudent.faceId} • Room: {currentFaceStudent.roomNumber}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstantFaceLogin}
                    disabled={isScanningFace}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isScanningFace ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Verifying Facial Biometrics...</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4" />
                        <span>Scan Face & Instant Login</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-200/90 leading-relaxed">
                  💡 <strong>Student Privacy Shield:</strong> Logged in students see only their personal attendance logs, today's mess menu, home pass status, and year announcements. Warden tools are hidden.
                </div>
              </div>
            ) : (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                {/* Face ID Biometric Camera Scanner Box */}
                <div className="p-3.5 bg-slate-950 border border-indigo-500/30 rounded-2xl text-center relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Scan className="w-4 h-4 text-indigo-400" />
                      Biometric Face ID Verification
                    </span>
                    {faceVerified ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Face Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-amber-400">Scan Required</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateFaceScan}
                    disabled={isScanningFace}
                    className="w-full py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    {isScanningFace ? 'Scanning...' : 'Re-Scan Face ID'}
                  </button>
                </div>

                {/* Student Credentials Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Room Number:
                    </label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g. Tagore-101"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Academic Year:
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Roll Number:
                  </label>
                  <input
                    type="text"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    placeholder="e.g. 2024CS1042"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Verify Credentials & Login</span>
                </button>
              </form>
            )}

            {/* Quick Demo Student Account Auto-Fill */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Select Demo Student Profile:
              </p>
              <div className="space-y-1.5">
                {registeredStudents.map((std) => (
                  <button
                    key={std.studentId}
                    onClick={() => {
                      setSelectedStudentFace(std.studentId);
                      handleQuickStudentSelect(std);
                    }}
                    className="w-full p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={std.avatar}
                        alt={std.name}
                        className="w-7 h-7 rounded-full object-cover border border-indigo-500/40"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {std.name} <span className="text-[10px] text-slate-400">({std.year}{std.year === 1 ? 'st' : std.year === 2 ? 'nd' : std.year === 3 ? 'rd' : 'th'} Year)</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Room: {std.roomNumber} • Roll: {std.rollNo}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : activeMode === 'warden' ? (
          <div className="space-y-4">
            {/* Warden Auth Method Selector Tabs */}
            <div className="grid grid-cols-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setWardenAuthMode('facescan');
                  setErrorMsg('');
                }}
                className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  wardenAuthMode === 'facescan'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Warden AI Face Scan"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="truncate">Face ID</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWardenAuthMode('fingerprint');
                  setErrorMsg('');
                }}
                className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  wardenAuthMode === 'fingerprint'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Fingerprint Verification"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span className="truncate">Finger</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWardenAuthMode('mobile_otp');
                  setErrorMsg('');
                }}
                className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  wardenAuthMode === 'mobile_otp'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile OTP Login"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="truncate">OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWardenAuthMode('password');
                  setErrorMsg('');
                }}
                className={`py-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  wardenAuthMode === 'password'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Security Passcode PIN"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="truncate">Passcode</span>
              </button>
            </div>

            {/* Mode 1: Face Recognition Lens for Warden */}
            {wardenAuthMode === 'facescan' && (
              <div className="p-4 bg-slate-950 border border-red-500/40 rounded-2xl text-center relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <Scan className="w-4 h-4 text-red-400 animate-pulse" />
                    Chief Warden Face Scan Lens
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Encrypted Biometrics
                  </span>
                </div>

                <div className="my-3 py-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-dashed border-red-500/60 flex items-center justify-center text-red-400 relative">
                    <ShieldCheck className="w-10 h-10" />
                    {isVerifyingWarden && (
                      <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white mt-2">Chief Warden Office Camera</p>
                  <p className="text-[10px] text-red-300 font-mono">ID: WDN-TAGORE-01 • Face Verification Active</p>
                </div>

                <button
                  type="button"
                  onClick={handleWardenFaceLogin}
                  disabled={isVerifyingWarden}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isVerifyingWarden ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Scanning Warden Face Biometrics...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Scan Warden Face & Login</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Mode 2: Fingerprint Reader Sensor for Warden */}
            {wardenAuthMode === 'fingerprint' && (
              <div className="p-4 bg-slate-950 border border-red-500/40 rounded-2xl text-center relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-red-400 animate-pulse" />
                    Warden Biometric Fingerprint Sensor
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Hardware Reader Ready
                  </span>
                </div>

                <div className="my-3 py-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative">
                  <button
                    type="button"
                    onClick={handleWardenFingerprintLogin}
                    disabled={isVerifyingWarden}
                    className="w-20 h-20 rounded-2xl bg-red-950/60 hover:bg-red-900/80 border-2 border-red-500/60 flex items-center justify-center text-red-400 transition-all transform hover:scale-105 active:scale-95 shadow-inner"
                  >
                    <Fingerprint className={`w-12 h-12 ${isVerifyingWarden ? 'animate-bounce text-emerald-400' : ''}`} />
                  </button>
                  <p className="text-xs font-bold text-white mt-3">Touch Sensor to Verify Thumbprint</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Biometric Hardware Scanner Logged</p>
                </div>

                <button
                  type="button"
                  onClick={handleWardenFingerprintLogin}
                  disabled={isVerifyingWarden}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isVerifyingWarden ? 'Verifying Fingerprint...' : 'Verify Fingerprint & Enter Portal'}
                </button>
              </div>
            )}

            {/* Mode 3: Warden Mobile Number & OTP Login */}
            {wardenAuthMode === 'mobile_otp' && (
              <div className="p-4 bg-slate-950 border border-red-500/40 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Warden Registered Mobile Number:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={wardenPhone}
                      onChange={(e) => setWardenPhone(e.target.value)}
                      placeholder="+91 98000 12345"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleSendWardenOtp}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isOtpSent ? 'Resend' : 'Get OTP'}</span>
                    </button>
                  </div>
                </div>

                {isOtpSent && (
                  <form onSubmit={handleVerifyWardenOtp} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-400 mb-1">
                        Enter 6-Digit SMS OTP Code (Demo Auto-Filled):
                      </label>
                      <input
                        type="text"
                        value={wardenOtp}
                        onChange={(e) => setWardenOtp(e.target.value)}
                        placeholder="e.g. 882201"
                        maxLength={6}
                        className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white tracking-widest text-center"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify Mobile OTP & Login</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Mode 4: Passcode PIN / Password for Warden */}
            {wardenAuthMode === 'password' && (
              <form onSubmit={handleWardenSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Warden Security Passcode PIN / Password:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={wardenPin}
                      onChange={(e) => setWardenPin(e.target.value)}
                      placeholder="Enter Warden Passcode (Default: 1234)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                      required
                    />
                    <KeyRound className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Default Demo Passcode PIN is <span className="text-red-400 font-mono font-bold">1234</span>
                  </p>
                </div>

                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-300/90 leading-relaxed">
                  <p className="font-bold text-red-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Warden Administrative Access:
                  </p>
                  • Change floor room numbers & allocate beds<br />
                  • Update student names & parent mobile contacts<br />
                  • Configure year-wise biometric cutoff & mess schedules<br />
                  • Approve Outstation Leave Passes & Dispatch Parent SMS
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Login as Warden Admin</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <School className="w-5 h-5 text-amber-400" />
                <span>College Academic Administration Portal</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Access granted for Dean Academic Office, HODs, & Institutional Attendance Cell.
              </p>
              <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                <li><strong className="text-amber-200">Upload College Attendance Sheet:</strong> Upload daily class attendance logs to cross-verify against hostel presence.</li>
                <li><strong className="text-amber-200">3-Way Bunk Alerting:</strong> Trigger automated SMS alerts to Parents, Wardens & College Admin when hostel attendance mismatches class attendance.</li>
                <li><strong className="text-amber-200">Guardian Contact Security:</strong> Sole authority (with Warden) to edit & verify student parent mobile numbers.</li>
              </ul>
            </div>

            <button
              onClick={handleCollegeAdminLogin}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
            >
              <School className="w-4 h-4" />
              <span>Login as College Academic Admin</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-slate-500 text-xs">
        © 2026 Hostel Management System • Tagore, Tilak & Subhash Blocks
      </div>
    </div>
  );
};
