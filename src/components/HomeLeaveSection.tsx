// src/components/HomeLeaveSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Phone,
  User,
  Plus,
  Building,
  FileText,
  QrCode,
  ShieldCheck,
  Lock,
  Dumbbell,
  Settings,
  AlertCircle,
  Trash2,
  X,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  Camera,
  Scan,
  LogOut,
  LogIn,
  Search,
  RefreshCw,
  Globe
} from 'lucide-react';
import { HomeLeavePass, LeaveStatus, PassCategory, Role, UserAuthSession, OutingRulesConfig, GymMemberRecord, BlockName } from '../types';

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

const DEFAULT_GYM_MEMBERS: GymMemberRecord[] = [
  {
    id: 'gym-1',
    studentName: 'Aayush Singh',
    rollNo: '2024CS101',
    roomNumber: 'Tagore-101',
    block: 'Tagore',
    year: 3,
    gymShift: '05:00 PM - 07:00 PM',
    assignedBy: 'Chief Warden Office',
    validUntil: '2026-12-31'
  }
];

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
  const [showGymRegistryModal, setShowGymRegistryModal] = useState(false);
  const [viewDigitalPass, setViewDigitalPass] = useState<HomeLeavePass | null>(null);

  // -------------------------------------------------------------
  // 📍 BULLETPROOF 24-HOUR LUCKNOW (IST) ENGINE (NO AM/PM BUG)
  // -------------------------------------------------------------
  const getLucknowISTTimeComponents = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false, // Strict 24-hour format: 0 to 23
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });

    const parts = formatter.formatToParts(now);
    const timeMap: Record<string, string> = {};
    parts.forEach((p) => {
      timeMap[p.type] = p.value;
    });

    const hour24 = parseInt(timeMap.hour || '0', 10);
    const minute = parseInt(timeMap.minute || '0', 10);
    const weekday = timeMap.weekday || 'Thursday';
    const totalMinutes = hour24 * 60 + minute; // e.g., 17:30 = 1050 mins

    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const formatted12Time = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
    const formattedFullDate = `${timeMap.year}-${String(timeMap.month).padStart(2, '0')}-${String(timeMap.day).padStart(2, '0')} (${weekday}) ${formatted12Time}`;

    return {
      hour24,
      minute,
      weekday,
      totalMinutes,
      formatted12Time,
      formattedFullDate
    };
  };

  // 📷 GUARD SCANNER STATES
  const [showGuardScannerModal, setShowGuardScannerModal] = useState(false);
  const [scannerCameraActive, setScannerCameraActive] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [scanResultPass, setScanResultPass] = useState<HomeLeavePass | null>(null);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');
  const [scanErrorMessage, setScanErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [gymMembers, setGymMembers] = useState<GymMemberRecord[]>(() => {
    const saved = localStorage.getItem('hostel_gym_members');
    return saved ? JSON.parse(saved) : DEFAULT_GYM_MEMBERS;
  });

  const [gymStudentName, setGymStudentName] = useState('');
  const [gymStudentRoll, setGymStudentRoll] = useState('');
  const [gymStudentRoom, setGymStudentRoom] = useState('');
  const [gymBlock, setGymBlock] = useState<BlockName>('Tagore');
  const [gymYear, setGymYear] = useState(1);
  const [gymShiftTime, setGymShiftTime] = useState('05:00 PM - 07:00 PM');

  useEffect(() => {
    localStorage.setItem('hostel_gym_members', JSON.stringify(gymMembers));
  }, [gymMembers]);

  // Form Fields
  const [passCategory, setPassCategory] = useState<PassCategory>('Local Outing');
  const [destination, setDestination] = useState('');
  const [localLiveDateTime, setLocalLiveDateTime] = useState('');
  const [depDate, setDepDate] = useState('');
  const [depTime, setDepTime] = useState('10:00 AM');
  const [retDate, setRetDate] = useState('');
  const [retTime, setRetTime] = useState('08:00 PM');
  const [homeReturnDay, setHomeReturnDay] = useState('');

  // Visual Calendar States
  const [activePickerTarget, setActivePickerTarget] = useState<'departure' | 'return' | null>(null);
  const [calendarViewMonth, setCalendarViewMonth] = useState(new Date().getMonth());
  const [calendarViewYear, setCalendarViewYear] = useState(new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');
  const [selectedTimeHour, setSelectedTimeHour] = useState('10');
  const [selectedTimeMinute, setSelectedTimeMinute] = useState('00');
  const [selectedTimeAmPm, setSelectedTimeAmPm] = useState<'AM' | 'PM'>('AM');

  const [reasonOrAddress, setReasonOrAddress] = useState('');
  const [parentPhone, setParentPhone] = useState(userSession.parentPhone || '+91 98123 45678');
  const [studentPhone, setStudentPhone] = useState('+91 98765 43210');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [formError, setFormError] = useState('');

  const studentYear = Number(userSession.year || 1);
  const currentStudentRoll = (userSession.rollNo || '').trim().toUpperCase();
  const studentGymRecord = gymMembers.find((g) => g.rollNo.trim().toUpperCase() === currentStudentRoll);
  const isStudentGymMember = role === 'student' && !!studentGymRecord;

  const currentIST = getLucknowISTTimeComponents();
  const todayDayName = currentIST.weekday;

  useEffect(() => {
    if (showApplyModal) {
      const liveIST = getLucknowISTTimeComponents();
      setLocalLiveDateTime(liveIST.formattedFullDate);
      setDepDate('');
      setDepTime('10:00 AM');
      setRetDate('');
      setRetTime('08:00 PM');
      setHomeReturnDay('');
      setDestination('');
      setReasonOrAddress('');
      setFormError('');
    }
  }, [showApplyModal]);

  // -------------------------------------------------------------
  // 🔒 100% ACCURATE 24-HOUR IST TIMETABLE AUTHENTICATION ENGINE
  // -------------------------------------------------------------
  const checkOutingTimeAndDayPermission = (): { isAllowed: boolean; title: string; reason: string } => {
    // 1. Home Leave is 24x7 Open
    if (passCategory === 'Outstation Vacation') {
      return {
        isAllowed: true,
        title: '✈️ Home / Outstation Leave: 24x7 Open',
        reason: 'Requires Chief Warden Office approval.'
      };
    }

    const { weekday, totalMinutes, formatted12Time } = getLucknowISTTimeComponents();

    // Morning Slot: 09:00 AM to 12:00 PM (540 to 720 mins)
    const isMorningSlot = totalMinutes >= 540 && totalMinutes <= 720;

    // Evening Slot: 04:30 PM to 06:00 PM (990 to 1080 mins) [16:30 to 18:00]
    const isEveningSlot = totalMinutes >= 990 && totalMinutes <= 1080;

    // ==========================================
    // 1. SUNDAY RULES (Both 1st Year & Seniors Same)
    // ==========================================
    if (weekday === 'Sunday') {
      if (isMorningSlot || isEveningSlot) {
        return {
          isAllowed: true,
          title: `✅ Sunday Application Window Open (${isMorningSlot ? 'Morning 9:00 AM - 12:00 PM' : 'Evening 4:30 PM - 6:00 PM'})`,
          reason: `Current Time: ${formatted12Time}. Return strictly before 08:00 PM curfew.`
        };
      } else {
        return {
          isAllowed: false,
          title: '🔒 Sunday Window Closed',
          reason: 'Sunday portal opens strictly between 09:00 AM - 12:00 PM and 04:30 PM - 06:00 PM.'
        };
      }
    }

    // ==========================================
    // 2. 1ST YEAR STUDENTS (Wednesday Evening Only)
    // ==========================================
    if (studentYear === 1) {
      if (weekday === 'Wednesday') {
        if (isEveningSlot) {
          return {
            isAllowed: true,
            title: '✅ 1st Year Wednesday Window Open (04:30 PM - 06:00 PM)',
            reason: `Current Time: ${formatted12Time}. Return strictly before 08:00 PM.`
          };
        } else {
          return {
            isAllowed: false,
            title: '🔒 1st Year Wednesday Window Closed',
            reason: 'Allowed only from 04:30 PM to 06:00 PM on Wednesday.'
          };
        }
      } else {
        return {
          isAllowed: false,
          title: `🔒 1st Year Outing Locked on ${weekday}`,
          reason: '1st Year students are allowed to apply ONLY on Wednesday (4:30-6 PM) & Sunday.'
        };
      }
    }

    // ==========================================
    // 3. SENIORS (2nd, 3rd, 4th Year)
    // ==========================================
    if (studentYear >= 2) {
      if (weekday === 'Wednesday') {
        return {
          isAllowed: false,
          title: '🔒 Wednesday Restricted for Seniors',
          reason: '2nd, 3rd & 4th Year students cannot apply for local outing on Wednesday.'
        };
      } else {
        // Mon, Tue, Thu, Fri, Sat (Daily Evening 4:30 PM - 6:00 PM)
        if (isEveningSlot) {
          return {
            isAllowed: true,
            title: `✅ Senior Evening Window Open (04:30 PM - 06:00 PM)`,
            reason: `Current Time: ${formatted12Time} IST. Return strictly before 08:00 PM curfew.`
          };
        } else {
          return {
            isAllowed: false,
            title: '🔒 Application Window Closed',
            reason: 'Senior weekday local outing window is strictly 04:30 PM to 06:00 PM IST.'
          };
        }
      }
    }

    return { isAllowed: false, title: 'Portal Closed', reason: '' };
  };

  const validation = checkOutingTimeAndDayPermission();

  // Guard Scanner
  const startScannerCamera = async () => {
    setScanErrorMessage('');
    setScanSuccessMessage('');
    setScanResultPass(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScannerCameraActive(true);

      if ('BarcodeDetector' in window) {
        // @ts-ignore
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        scanIntervalRef.current = window.setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              // @ts-ignore
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                processRawScannedCode(barcodes[0].rawValue);
              }
            } catch (e) {}
          }
        }, 400);
      }
    } catch (err) {
      setScanErrorMessage('Camera error: Roll number manually type karke verify karein.');
      setScannerCameraActive(false);
    }
  };

  const stopScannerCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setScannerCameraActive(false);
  };

  useEffect(() => {
    if (showGuardScannerModal) {
      startScannerCamera();
    } else {
      stopScannerCamera();
    }
    return () => stopScannerCamera();
  }, [showGuardScannerModal]);

  const processRawScannedCode = (rawText: string) => {
    setScanErrorMessage('');
    setScanSuccessMessage('');
    const raw = rawText.trim().toUpperCase();

    let found = leavePasses.find((p) => {
      const roll = (p.rollNo || '').toUpperCase();
      const token = (p.verificationToken || '').toUpperCase();
      const id = (p.id || '').toUpperCase();

      return (
        raw.includes(roll) ||
        raw.includes(token) ||
        raw.includes(id) ||
        roll === raw ||
        token === raw
      );
    });

    if (found) {
      setVerifiedPass(found);
      setScanSuccessMessage(`✅ Verified: ${found.studentName} (${found.rollNo})`);
    } else {
      setScanErrorMessage(`❌ NO RECORD FOUND! Scanned Code does not match database.`);
    }
  };

  const handleGatePunch = (action: 'EXITED' | 'RE_ENTERED') => {
    if (!verifiedPass) return;
    onRecordGateScan(verifiedPass.id, action, userSession.name || 'Main Gate Guard');

    if (action === 'EXITED') {
      setScanSuccessMessage(`🚪 GATE EXIT RECORDED: ${verifiedPass.studentName} departed.`);
    } else {
      setScanSuccessMessage(`🏠 GATE ENTRY RECORDED: ${verifiedPass.studentName} returned.`);
    }

    setTimeout(() => {
      setVerifiedPass(null);
      setScanSuccessMessage('');
      setManualTokenInput('');
    }, 2000);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTokenInput.trim()) return;
    processRawScannedCode(manualTokenInput);
  };

  // Calendar
  const handleOpenCalendar = (target: 'departure' | 'return') => {
    setActivePickerTarget(target);
    const baseDate = target === 'return' && retDate ? new Date(retDate) : (depDate ? new Date(depDate) : new Date());
    setCalendarViewMonth(baseDate.getMonth());
    setCalendarViewYear(baseDate.getFullYear());
    setSelectedCalendarDate(target === 'departure' ? depDate : retDate);
  };

  const handleConfirmCalendarDateTime = () => {
    if (!selectedCalendarDate) {
      alert('Date select karein!');
      return;
    }
    const formattedTime = `${selectedTimeHour}:${selectedTimeMinute} ${selectedTimeAmPm}`;
    if (activePickerTarget === 'departure') {
      setDepDate(selectedCalendarDate);
      setDepTime(formattedTime);
    } else {
      setRetDate(selectedCalendarDate);
      setRetTime(formattedTime);
      const selectedObj = new Date(selectedCalendarDate);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setHomeReturnDay(dayNames[selectedObj.getDay()]);
    }
    setActivePickerTarget(null);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  // Form Submit with Strict Check
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (passCategory === 'Local Outing' && !validation.isAllowed) {
      setFormError(`⛔ Application Blocked: ${validation.title} - ${validation.reason}`);
      return;
    }

    if (!destination.trim()) {
      setFormError('Kripya destination bharein.');
      return;
    }

    let finalDepartureStr = '';
    let finalReturnStr = '';
    let finalReason = '';

    const liveIST = getLucknowISTTimeComponents();

    if (passCategory === 'Local Outing') {
      finalDepartureStr = localLiveDateTime || liveIST.formattedFullDate;
      finalReturnStr = 'Today strictly before 08:00 PM';
      finalReason = reasonOrAddress.trim() || 'General Local Outing';
    } else {
      if (!depDate || !retDate) {
        setFormError('Ghar jane aur wapas aane ki date select karein!');
        return;
      }
      if (retDate < depDate) {
        setFormError('Wapas aane ki date departure ke baad ki honi chahiye!');
        return;
      }
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const depObj = new Date(depDate);
      const retObj = new Date(retDate);
      finalDepartureStr = `${depDate} (${dayNames[depObj.getDay()]}) ${depTime}`;
      finalReturnStr = `${retDate} (${homeReturnDay || dayNames[retObj.getDay()]}) ${retTime}`;
      finalReason = `Address: ${reasonOrAddress.trim()} (Return: ${homeReturnDay || dayNames[retObj.getDay()]})`;
    }

    onApplyLeavePass({
      studentId: userSession.studentId || currentStudentRoll,
      studentName: userSession.name || 'Student',
      rollNo: currentStudentRoll || '2024CS101',
      block: userSession.block || 'Tagore',
      roomNumber: userSession.roomNumber || 'Tagore-101',
      studentPhone: studentPhone,
      parentPhone: parentPhone,
      destination: destination.trim(),
      departureDate: finalDepartureStr,
      expectedReturnDate: finalReturnStr,
      reason: finalReason,
      passCategory: passCategory,
      year: studentYear,
      isGymPass: false,
      verificationToken: `WDN-PASS-${Math.floor(1000 + Math.random() * 9000)}-${currentStudentRoll}`
    });

    setShowApplyModal(false);
    alert('✅ Gate Pass request submitted to Warden Office!');
  };

  const handleAddGymMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymStudentName.trim() || !gymStudentRoll.trim()) return;

    const cleanRoll = gymStudentRoll.trim().toUpperCase();
    const newGymMember: GymMemberRecord = {
      id: `gym-${Date.now()}`,
      studentName: gymStudentName.trim(),
      rollNo: cleanRoll,
      roomNumber: gymStudentRoom.trim(),
      block: gymBlock,
      year: Number(gymYear),
      gymShift: gymShiftTime,
      assignedBy: 'Chief Warden Office',
      validUntil: '2026-12-31'
    };

    setGymMembers([...gymMembers, newGymMember]);

    onApplyLeavePass({
      studentId: cleanRoll,
      studentName: gymStudentName.trim(),
      rollNo: cleanRoll,
      block: gymBlock,
      roomNumber: gymStudentRoom.trim(),
      studentPhone: '+91 98765 43210',
      parentPhone: '+91 98123 45678',
      destination: 'Campus Fitness Gym',
      departureDate: gymShiftTime.split('-')[0].trim(),
      expectedReturnDate: gymShiftTime.split('-')[1]?.trim() || '08:00 PM',
      reason: `Permanent Daily Gym Shift (${gymShiftTime})`,
      passCategory: 'Local Outing',
      year: Number(gymYear),
      isGymPass: true,
      verificationToken: `WDN-GYM-PERM-${cleanRoll}`
    });

    setGymStudentName('');
    setGymStudentRoll('');
    setGymStudentRoom('');
    alert(`✅ Student ${newGymMember.studentName} added to Gym Roster!`);
  };

  const visiblePasses = leavePasses.filter((p) => {
    if (role === 'student') {
      const pRoll = (p.rollNo || '').trim().toUpperCase();
      const sRoll = currentStudentRoll.trim().toUpperCase();
      return pRoll === sRoll || p.studentId === userSession.studentId;
    }
    if (filterStatus === 'All') return true;
    return p.status === filterStatus;
  });

  const appliedPendingCount = leavePasses.filter((p) => p.status === 'Applied').length;
  const outOfHostelCount = leavePasses.filter((p) => p.status === 'Departed').length;

  const generateScannableQRUrl = (pass: HomeLeavePass) => {
    const qrData = `HOSTEL_PASS_VERIFIED | ROLL: ${pass.rollNo} | NAME: ${pass.studentName} | ROOM: ${pass.roomNumber} | DEST: ${pass.destination} | TOKEN: ${pass.verificationToken || 'WDN-SEAL-7262-AUTHENTICATED'}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Gate Pass Security & Outing Terminal
                  {role === 'warden' && appliedPendingCount > 0 && (
                    <span className="text-xs bg-rose-500/20 text-rose-300 font-bold px-2.5 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                      {appliedPendingCount} Pending Requests
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400 mt-1">
                  <span>Today: <strong className="text-indigo-400 font-bold">{todayDayName}</strong></span>
                  
                  {/* 🟢 Role ke hisaab se sahi text aayega */}
                  {role === 'student' && (
                    <span>• You are: <strong className="text-emerald-400">{studentYear}{studentYear === 1 ? 'st' : studentYear === 2 ? 'nd' : studentYear === 3 ? 'rd' : 'th'} Year</strong></span>
                  )}
                  {role === 'warden' && (
                    <span>• Access: <strong className="text-amber-400 font-bold">Chief Warden Office</strong></span>
                  )}
                  {role === 'college_admin' && (
                    <span>• Access: <strong className="text-amber-400 font-bold">College Administration</strong></span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    Lucknow IST ({currentIST.formatted12Time})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {(role === 'warden' || role === 'college_admin') && (
              <button
                onClick={() => setShowGuardScannerModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Scan className="w-4 h-4" />
                <span>Open Main Gate QR Scanner</span>
              </button>
            )}

            {role === 'warden' && (
              <button
                onClick={() => setShowGymRegistryModal(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Gym Roster ({gymMembers.length})</span>
              </button>
            )}

            {role === 'student' && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Apply Gate Pass</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rules Notice Badge */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-1">
        <p className="font-bold text-amber-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Local Outing Timetable (Lucknow IST Rules):</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="font-bold text-indigo-300">1st Year:</span> Wed (4:30-6 PM) & Sun (9 AM-12 PM & 4:30-6 PM). Other days Locked.
          </div>
          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="font-bold text-emerald-300">Seniors (2nd, 3rd, 4th Yr):</span> Mon, Tue, Thu, Fri, Sat (4:30-6 PM) & Sun (9-12 & 4:30-6). Wed Locked.
          </div>
        </div>
      </div>

      {/* Passes List */}
      <div className="space-y-4">
        {visiblePasses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No Gate Passes Found</p>
          </div>
        ) : (
          visiblePasses.map((pass) => (
            <div
              key={pass.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg ${
                pass.status === 'Applied'
                  ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900'
                  : pass.status === 'Approved'
                  ? 'border-emerald-500/40'
                  : pass.status === 'Departed'
                  ? 'border-amber-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                      {pass.block} • Room {pass.roomNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
                      {pass.isGymPass ? '💪 Daily Gym Pass' : (pass.passCategory || 'Local Outing')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        pass.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : pass.status === 'Departed'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      Status: {pass.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{pass.studentName} ({pass.rollNo})</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div><strong>Destination:</strong> {pass.destination}</div>
                    <div><strong>Departure:</strong> <span className="font-mono text-emerald-400">{pass.departureDate}</span></div>
                    <div><strong>Return Cutoff:</strong> <span className="font-mono text-rose-400">{pass.expectedReturnDate}</span></div>
                    <div className="sm:col-span-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <strong>Reason / Address:</strong> {pass.reason}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(pass.status === 'Approved' || pass.status === 'Departed' || pass.isGymPass) && (
                    <button
                      onClick={() => setViewDigitalPass(pass)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View Verified QR Pass</span>
                    </button>
                  )}

                  {role === 'warden' && pass.status === 'Applied' && (
                    <button
                      onClick={() => {
                        onUpdateLeaveStatus(pass.id, 'Approved');
                        alert(`✅ Pass approved for ${pass.studentName}!`);
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Pass & Issue QR</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔓 APPLY PASS MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                Apply Gate Pass / Outing Request
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                📍 Lucknow IST Live
              </span>
            </div>

            {/* LIVE PERMISSION STATUS BADGE */}
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                validation.isAllowed
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
              }`}
            >
              <p className="font-bold flex items-center gap-1.5">
                {validation.isAllowed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>Portal Status ({todayDayName} - {studentYear} Year):</span>
              </p>
              <p className="text-[11px] mt-1 font-semibold">{validation.title}</p>
              {validation.reason && (
                <p className="text-[10px] text-slate-400 mt-0.5">{validation.reason}</p>
              )}
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student:</label>
                  <input
                    type="text"
                    value={`${userSession.name} (${studentYear} Year)`}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll & Room:</label>
                  <input
                    type="text"
                    value={`${userSession.rollNo} (${userSession.roomNumber})`}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pass Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Local Outing', 'Outstation Vacation'] as PassCategory[]).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setPassCategory(cat)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        passCategory === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {cat === 'Outstation Vacation' ? 'Home / Night Leave (24x7)' : 'Local Outing (Day)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination:</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={passCategory === 'Outstation Vacation' ? 'e.g. Home / Lucknow' : 'e.g. Hazratganj / Market'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required
                />
              </div>

              {passCategory === 'Local Outing' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-400 mb-1">Live Lucknow Departure:</label>
                    <input
                      type="text"
                      value={localLiveDateTime || currentIST.formattedFullDate}
                      disabled
                      className="w-full bg-slate-950/80 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-400 mb-1">Return Curfew:</label>
                    <input
                      type="text"
                      value="Today strictly before 08:00 PM"
                      disabled
                      className="w-full bg-slate-950/80 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-rose-300 font-mono font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-indigo-400">Select Travel Dates:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCalendar('departure')}
                      className="p-2 bg-slate-950 border border-indigo-500/40 rounded-xl text-xs text-left text-white"
                    >
                      {depDate ? `📅 Dep: ${depDate}` : '📅 Departure Date'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCalendar('return')}
                      className="p-2 bg-slate-950 border border-rose-500/40 rounded-xl text-xs text-left text-white"
                    >
                      {retDate ? `📅 Ret: ${retDate}` : '📅 Return Date'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {passCategory === 'Outstation Vacation' ? 'Full Home Address *Mandatory:' : 'Reason (Optional):'}
                </label>
                <textarea
                  value={reasonOrAddress}
                  onChange={(e) => setReasonOrAddress(e.target.value)}
                  rows={2}
                  placeholder={passCategory === 'Outstation Vacation' ? 'Enter complete permanent home address...' : 'e.g. Buying medicines...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  required={passCategory === 'Outstation Vacation'}
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
                  disabled={passCategory === 'Local Outing' && !validation.isAllowed}
                  className={`px-5 py-2 text-xs font-bold rounded-xl shadow-lg transition-all ${
                    passCategory === 'Outstation Vacation' || validation.isAllowed
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {passCategory === 'Local Outing' && !validation.isAllowed ? '🔒 Window Locked' : 'Submit Gate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR PASS MODAL */}
      {viewDigitalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="text-center space-y-1 pt-2">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Official Gate Pass QR</h3>
              <p className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 py-1 px-3 rounded-xl border border-emerald-500/20 inline-block">
                {viewDigitalPass.verificationToken || 'WDN-SEAL-7262-AUTHENTICATED'}
              </p>
            </div>

            {/* REAL SCANNABLE QR */}
            <div className="bg-white p-4 rounded-2xl border-4 border-slate-800 text-center space-y-2 max-w-[220px] mx-auto shadow-2xl">
              <img
                src={generateScannableQRUrl(viewDigitalPass)}
                alt="Gate Pass QR"
                className="w-40 h-40 mx-auto object-contain rounded-lg"
              />
              <p className="text-[10px] font-mono text-slate-950 font-black">
                {viewDigitalPass.rollNo} • VALID PASS
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-white">{viewDigitalPass.studentName} ({viewDigitalPass.rollNo})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Destination:</span>
                <span className="font-bold text-amber-300">{viewDigitalPass.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Return Limit:</span>
                <span className="font-bold text-emerald-300 font-mono">{viewDigitalPass.expectedReturnDate}</span>
              </div>
            </div>

            <button
              onClick={() => setViewDigitalPass(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
            >
              Close QR Pass
            </button>
          </div>
        </div>
      )}

      {/* CALENDAR MODAL */}
      {activePickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white">Select Date</h4>
              <button onClick={() => setActivePickerTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs">
              {Array.from({ length: daysInMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calendarViewYear}-${String(calendarViewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                return (
                  <button
                    type="button"
                    key={dayNum}
                    onClick={() => setSelectedCalendarDate(dateStr)}
                    className={`h-8 rounded-lg font-bold text-xs ${
                      selectedCalendarDate === dateStr ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleConfirmCalendarDateTime}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};