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
import { HomeLeavePass, LeaveStatus, PassCategory, Role, UserAuthSession, OutingRulesConfig, GymMemberRecord, BlockName, Room } from '../types';

interface HomeLeaveSectionProps {
  leavePasses: HomeLeavePass[];
  onApplyLeavePass: (newPass: Omit<HomeLeavePass, 'id' | 'createdAt' | 'status' | 'parentSmsSent'>) => void;
  onUpdateLeaveStatus: (id: string, status: LeaveStatus, resendSms?: boolean) => void;
  userSession: UserAuthSession;
  role: Role;
  outingRules: OutingRulesConfig;
  onUpdateOutingRules: (newRules: OutingRulesConfig) => void;
  onRecordGateScan: (id: string, action: 'EXITED' | 'RE_ENTERED', guardName?: string) => void;
  gymMembers?: GymMemberRecord[];
  onAddGymMember?: (member: GymMemberRecord) => void;
  onRemoveGymMember?: (id: string, rollNo: string) => void;
  rooms?: Room[];
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
  onRecordGateScan,
  gymMembers: propsGymMembers,
  onAddGymMember,
  onRemoveGymMember,
  rooms = []
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

    const year = parseInt(timeMap.year || '2026', 10);
    const month = parseInt(timeMap.month || '1', 10);
    const day = parseInt(timeMap.day || '1', 10);
    const todayDateStr = `${timeMap.year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      year,
      month,
      day,
      todayDateStr,
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
  const [verifiedPass, setVerifiedPass] = useState<HomeLeavePass | null>(null);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');
  const [scanErrorMessage, setScanErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [localGymMembers, setLocalGymMembers] = useState<GymMemberRecord[]>(() => {
    const saved = localStorage.getItem('hostel_gym_members');
    return saved ? JSON.parse(saved) : DEFAULT_GYM_MEMBERS;
  });

  const effectiveGymMembers = propsGymMembers && propsGymMembers.length > 0 ? propsGymMembers : localGymMembers;

  const [gymStudentName, setGymStudentName] = useState('');
  const [gymStudentRoll, setGymStudentRoll] = useState('');
  const [gymStudentRoom, setGymStudentRoom] = useState('');
  const [gymBlock, setGymBlock] = useState<BlockName>('Tagore');
  const [gymYear, setGymYear] = useState(1);
  const [gymShiftTime, setGymShiftTime] = useState('05:00 PM - 07:00 PM');
  const [gymSearchQuery, setGymSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('hostel_gym_members', JSON.stringify(effectiveGymMembers));
  }, [effectiveGymMembers]);

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
  const studentGymRecord = effectiveGymMembers.find((g) => g.rollNo.trim().toUpperCase() === currentStudentRoll);
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
    setVerifiedPass(null);

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
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const clean = timeStr.trim();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let h = parseInt(match[1], 10) % 12;
    const m = parseInt(match[2], 10);
    const p = match[3].toUpperCase();
    if (p === 'PM') h += 12;
    return h * 60 + m;
  };

  const getNextUpcomingTimeSlot = () => {
    const ist = getLucknowISTTimeComponents();
    const targetTotal = ist.totalMinutes + 15;
    const roundedMins = Math.ceil((targetTotal % 60) / 15) * 15;
    let finalH24 = Math.floor(targetTotal / 60) % 24;
    let finalM = roundedMins;
    if (finalM === 60) {
      finalM = 0;
      finalH24 = (finalH24 + 1) % 24;
    }
    const ampm: 'AM' | 'PM' = finalH24 >= 12 ? 'PM' : 'AM';
    const h12 = finalH24 % 12 === 0 ? 12 : finalH24 % 12;
    return {
      hour: String(h12).padStart(2, '0'),
      minute: String(finalM).padStart(2, '0'),
      ampm
    };
  };

  const handleOpenCalendar = (target: 'departure' | 'return') => {
    setActivePickerTarget(target);
    const ist = getLucknowISTTimeComponents();
    const minAllowed = target === 'return' && depDate ? (depDate > ist.todayDateStr ? depDate : ist.todayDateStr) : ist.todayDateStr;
    const existingVal = target === 'departure' ? depDate : retDate;
    const defaultDate = existingVal && existingVal >= minAllowed ? existingVal : minAllowed;

    const [yStr, mStr] = defaultDate.split('-');
    const baseYear = parseInt(yStr, 10);
    const baseMonth = parseInt(mStr, 10) - 1;

    setCalendarViewMonth(baseMonth);
    setCalendarViewYear(baseYear);
    setSelectedCalendarDate(defaultDate);

    // Initialise Time to ensure it is in the future
    const existingTime = target === 'departure' ? depTime : retTime;
    const existingTimeMins = parseTimeToMinutes(existingTime);
    if (defaultDate === ist.todayDateStr && existingTimeMins <= ist.totalMinutes) {
      const nextSlot = getNextUpcomingTimeSlot();
      setSelectedTimeHour(nextSlot.hour);
      setSelectedTimeMinute(nextSlot.minute);
      setSelectedTimeAmPm(nextSlot.ampm);
    } else if (existingTime) {
      const match = existingTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        setSelectedTimeHour(String(parseInt(match[1], 10)).padStart(2, '0'));
        setSelectedTimeMinute(match[2]);
        setSelectedTimeAmPm(match[3].toUpperCase() as 'AM' | 'PM');
      }
    }
  };

  const handlePrevMonth = () => {
    const ist = getLucknowISTTimeComponents();
    // Cannot navigate to past months
    if (calendarViewYear < ist.year || (calendarViewYear === ist.year && calendarViewMonth <= ist.month - 1)) {
      return;
    }
    if (calendarViewMonth === 0) {
      setCalendarViewMonth(11);
      setCalendarViewYear((y) => y - 1);
    } else {
      setCalendarViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarViewMonth === 11) {
      setCalendarViewMonth(0);
      setCalendarViewYear((y) => y + 1);
    } else {
      setCalendarViewMonth((m) => m + 1);
    }
  };

  const handleConfirmCalendarDateTime = () => {
    const ist = getLucknowISTTimeComponents();
    const minAllowed = activePickerTarget === 'return' && depDate ? (depDate > ist.todayDateStr ? depDate : ist.todayDateStr) : ist.todayDateStr;

    if (!selectedCalendarDate) {
      alert('Kripya date select karein!');
      return;
    }

    if (selectedCalendarDate < minAllowed) {
      alert(activePickerTarget === 'return' ? 'Wapas aane ki date departure aur aaj ki date ke baad honi chahiye!' : 'Aaj se pehle ki date select nahi ki ja sakti!');
      return;
    }

    let checkH24 = parseInt(selectedTimeHour, 10) % 12;
    if (selectedTimeAmPm === 'PM') checkH24 += 12;
    const selectedMins = checkH24 * 60 + parseInt(selectedTimeMinute, 10);

    // Strict past time check for today
    if (selectedCalendarDate === ist.todayDateStr && selectedMins <= ist.totalMinutes) {
      alert(`⚠️ Ye time (${selectedTimeHour}:${selectedTimeMinute} ${selectedTimeAmPm}) nikal chuka hai! Current time ${ist.formatted12Time} hai. Kripya aane wala time select karein.`);
      return;
    }

    // Strict return time > departure time check if on same day
    if (activePickerTarget === 'return' && depDate && selectedCalendarDate === depDate) {
      const depMins = parseTimeToMinutes(depTime);
      if (selectedMins <= depMins) {
        alert(`⚠️ Return time departure time (${depTime}) ke baad ka hona chahiye!`);
        return;
      }
    }

    const formattedTime = `${selectedTimeHour}:${selectedTimeMinute} ${selectedTimeAmPm}`;
    if (activePickerTarget === 'departure') {
      setDepDate(selectedCalendarDate);
      setDepTime(formattedTime);
      // Agar retDate nayi departure date se pehle hai to reset karein
      if (retDate) {
        if (retDate < selectedCalendarDate) {
          setRetDate('');
          setHomeReturnDay('');
        } else if (retDate === selectedCalendarDate) {
          const retMins = parseTimeToMinutes(retTime);
          if (retMins <= selectedMins) {
            setRetDate('');
            setHomeReturnDay('');
          }
        }
      }
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

    if (passCategory === 'Gym Outing') {
      if (!isStudentGymMember || !studentGymRecord) {
        setFormError('⛔ You are not enrolled in the Hostel Gym Roster. Please contact Chief Warden Office.');
        return;
      }
    } else if (!destination.trim()) {
      setFormError('Kripya destination bharein.');
      return;
    }

    let finalDepartureStr = '';
    let finalReturnStr = '';
    let finalReason = '';

    const liveIST = getLucknowISTTimeComponents();

    if (passCategory === 'Gym Outing') {
      finalDepartureStr = `${liveIST.todayDateStr} (${studentGymRecord?.gymShift.split('-')[0].trim() || '05:00 PM'})`;
      finalReturnStr = `${liveIST.todayDateStr} (${studentGymRecord?.gymShift.split('-')[1]?.trim() || '07:00 PM'})`;
      finalReason = `Authorized Daily Gym Workout Shift (${studentGymRecord?.gymShift})`;
    } else if (passCategory === 'Local Outing') {
      finalDepartureStr = localLiveDateTime || liveIST.formattedFullDate;
      finalReturnStr = 'Today strictly before 08:00 PM';
      finalReason = reasonOrAddress.trim() || 'General Local Outing';
    } else {
      if (!depDate || !retDate) {
        setFormError('Ghar jane aur wapas aane ki date select karein!');
        return;
      }
      if (depDate < liveIST.todayDateStr) {
        setFormError('Departure date aaj ya aane wale dino ki honi chahiye! (Past date select nahi ho sakti)');
        return;
      }
      if (depDate === liveIST.todayDateStr) {
        const depMins = parseTimeToMinutes(depTime);
        if (depMins <= liveIST.totalMinutes) {
          setFormError(`Departure time (${depTime}) beet chuka hai! Current time: ${liveIST.formatted12Time}. Kripya aage ka time select karein.`);
          return;
        }
      }
      if (retDate < depDate) {
        setFormError('Wapas aane ki date departure ke baad ki honi chahiye!');
        return;
      }
      if (retDate === depDate) {
        const depMins = parseTimeToMinutes(depTime);
        const retMins = parseTimeToMinutes(retTime);
        if (retMins <= depMins) {
          setFormError('Same day hone par wapas aane ka time departure time ke baad ka hona chahiye!');
          return;
        }
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
      destination: passCategory === 'Gym Outing' ? 'Campus Fitness Gym' : destination.trim(),
      departureDate: finalDepartureStr,
      expectedReturnDate: finalReturnStr,
      reason: finalReason,
      passCategory: passCategory,
      year: studentYear,
      isGymPass: passCategory === 'Gym Outing',
      verificationToken: passCategory === 'Gym Outing' ? `WDN-GYM-${currentStudentRoll}` : `WDN-PASS-${Math.floor(1000 + Math.random() * 9000)}-${currentStudentRoll}`
    });

    setShowApplyModal(false);
    alert('✅ Gate Pass request submitted to Warden Office!');
  };

  const handleAddGymMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymStudentName.trim() || !gymStudentRoll.trim()) {
      alert('Student Name and Roll Number are required!');
      return;
    }

    const cleanRoll = gymStudentRoll.trim().toUpperCase();
    const newGymMember: GymMemberRecord = {
      id: `gym-${Date.now()}`,
      studentName: gymStudentName.trim(),
      rollNo: cleanRoll,
      roomNumber: gymStudentRoom.trim() || 'N/A',
      block: gymBlock,
      year: Number(gymYear),
      gymShift: gymShiftTime,
      assignedBy: 'Chief Warden Office',
      validUntil: '2026-12-31'
    };

    if (onAddGymMember) {
      onAddGymMember(newGymMember);
    } else {
      setLocalGymMembers((prev) => [...prev.filter((g) => g.rollNo.toUpperCase() !== cleanRoll), newGymMember]);
      onApplyLeavePass({
        studentId: cleanRoll,
        studentName: gymStudentName.trim(),
        rollNo: cleanRoll,
        block: gymBlock,
        roomNumber: gymStudentRoom.trim() || 'N/A',
        studentPhone: '+91 98765 43210',
        parentPhone: '+91 98123 45678',
        destination: 'Campus Fitness Gym',
        departureDate: gymShiftTime.split('-')[0].trim(),
        expectedReturnDate: gymShiftTime.split('-')[1]?.trim() || '08:00 PM',
        reason: `Permanent Daily Gym Shift (${gymShiftTime})`,
        passCategory: 'Gym Outing',
        year: Number(gymYear),
        isGymPass: true,
        verificationToken: `WDN-GYM-${cleanRoll}`
      });
    }

    setGymStudentName('');
    setGymStudentRoll('');
    setGymStudentRoom('');
    alert(`✅ Student ${newGymMember.studentName} (${cleanRoll}) added to Gym Roster!`);
  };

  const handleRevokeGymMember = (id: string, roll: string) => {
    if (!confirm(`Are you sure you want to revoke gym membership for Roll No: ${roll}?`)) return;
    if (onRemoveGymMember) {
      onRemoveGymMember(id, roll);
    } else {
      setLocalGymMembers((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const visiblePasses = leavePasses.filter((p) => {
    if (role === 'student') {
      const pRoll = (p.rollNo || '').trim().toUpperCase();
      const sRoll = currentStudentRoll.trim().toUpperCase();
      const isMine = pRoll === sRoll || p.studentId === userSession.studentId;
      if (!isMine) return false;
      if (filterStatus === 'All') return true;
      return p.status === filterStatus;
    }
    if (filterStatus === 'All') return true;
    return p.status === filterStatus;
  });

  const appliedPendingCount = leavePasses.filter((p) => p.status === 'Applied').length;
  const outOfHostelCount = leavePasses.filter((p) => p.status === 'Departed').length;
  const expiredPassCount = leavePasses.filter((p) => p.status === 'Expired').length;

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
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/30"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Gym Roster ({effectiveGymMembers.length})</span>
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

      {/* 🏋️ STUDENT ACTIVE GYM MEMBERSHIP BADGE CARD */}
      {isStudentGymMember && studentGymRecord && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Active Hostel Gym Member</h4>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Verified Roster
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Assigned Shift: <strong className="text-amber-400 font-mono">{studentGymRecord.gymShift}</strong> • Room: <strong className="text-white">{studentGymRecord.roomNumber} ({studentGymRecord.block})</strong> • Valid Until: <span className="font-mono text-slate-400">{studentGymRecord.validUntil || '2026-12-31'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const myGymPass = leavePasses.find(
                  (p) => p.isGymPass && p.rollNo.toUpperCase() === currentStudentRoll && p.status === 'Approved'
                );
                if (myGymPass) {
                  setViewDigitalPass(myGymPass);
                } else {
                  setViewDigitalPass({
                    id: `pass-gym-${currentStudentRoll}`,
                    studentId: currentStudentRoll,
                    studentName: userSession.name,
                    rollNo: currentStudentRoll,
                    block: userSession.block || 'Tagore',
                    roomNumber: userSession.roomNumber || 'Tagore-101',
                    studentPhone: studentPhone,
                    parentPhone: parentPhone,
                    destination: 'Campus Fitness Gym',
                    departureDate: studentGymRecord.gymShift.split('-')[0].trim(),
                    expectedReturnDate: studentGymRecord.gymShift.split('-')[1]?.trim() || '08:00 PM',
                    reason: `Daily Gym Shift (${studentGymRecord.gymShift})`,
                    passCategory: 'Gym Outing',
                    year: studentYear,
                    isGymPass: true,
                    status: 'Approved',
                    verificationToken: `WDN-GYM-${currentStudentRoll}`,
                    wardenApprovedBy: 'Chief Warden Office (Gym Roster)',
                    parentSmsSent: false,
                    createdAt: new Date().toISOString()
                  });
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Show Gym QR Pass</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Status Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
        {(['All', 'Applied', 'Approved', 'Departed', 'Returned', 'Expired', 'Rejected'] as const).map((st) => {
          const count =
            role === 'student'
              ? leavePasses.filter((p) => {
                  const isMine =
                    (p.rollNo || '').trim().toUpperCase() === currentStudentRoll ||
                    p.studentId === userSession.studentId;
                  return isMine && (st === 'All' ? true : p.status === st);
                }).length
              : leavePasses.filter((p) => (st === 'All' ? true : p.status === st)).length;

          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{st === 'Expired' ? '⛔ Expired' : st}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  filterStatus === st ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Passes List */}
      <div className="space-y-4">
        {visiblePasses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              {filterStatus === 'All' ? 'No Gate Passes Found' : `No "${filterStatus}" Gate Passes Found`}
            </p>
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
                  : pass.status === 'Expired'
                  ? 'border-rose-900/50 bg-slate-950/70'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
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
                          : pass.status === 'Expired'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {pass.status === 'Expired' ? '⛔ Expired (Void)' : `Status: ${pass.status}`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{pass.studentName} ({pass.rollNo})</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div><strong>Destination:</strong> {pass.destination}</div>
                    <div><strong>Scheduled Departure:</strong> <span className="font-mono text-emerald-400">{pass.departureDate}</span></div>
                    <div><strong>Return Cutoff:</strong> <span className="font-mono text-rose-400">{pass.expectedReturnDate}</span></div>
                    <div className="sm:col-span-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <strong>Reason / Address:</strong> {pass.reason}
                    </div>
                  </div>

                  {pass.status === 'Expired' && (
                    <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Pass Expired:</strong> Student scheduled departure date ({pass.departureDate}) par bahar nahi gaye. Ye gate pass expire ho chuka hai aur gate par allow nahi hoga. Agle din bahar jane ke liye naya pass apply karein.
                      </div>
                    </div>
                  )}
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

                  {role === 'student' && pass.status === 'Expired' && (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Apply New Pass</span>
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
                <div className="grid grid-cols-3 gap-2">
                  {(['Local Outing', 'Outstation Vacation', 'Gym Outing'] as PassCategory[]).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        setPassCategory(cat);
                        if (cat === 'Gym Outing') {
                          setDestination('Campus Fitness Gym');
                        }
                      }}
                      className={`py-2 px-1 rounded-xl text-center text-[11px] font-bold border transition-all ${
                        passCategory === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat === 'Outstation Vacation'
                        ? 'Home Leave'
                        : cat === 'Gym Outing'
                        ? '💪 Gym Outing'
                        : 'Local Outing'}
                    </button>
                  ))}
                </div>
              </div>

              {passCategory === 'Gym Outing' ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                  {isStudentGymMember && studentGymRecord ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-amber-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Dumbbell className="w-4 h-4 text-amber-400" />
                          Enrolled Gym Shift:
                        </span>
                        <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded-md text-amber-200">
                          {studentGymRecord.gymShift}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                        <div>Destination: <strong className="text-white">Campus Fitness Gym</strong></div>
                        <div>Valid Until: <strong className="text-emerald-400">{studentGymRecord.validUntil || '2026-12-31'}</strong></div>
                      </div>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        ✓ Pre-authorized for verified gym member. Instant approval.
                      </p>
                    </div>
                  ) : (
                    <div className="text-rose-300 space-y-1 py-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        Not Enrolled in Gym Roster:
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Aapka Roll No ({currentStudentRoll}) Warden Gym Roster me registered nahi hai. Chief Warden Office se contact karke apna gym shift register karwayen.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
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
              )}

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
              ) : passCategory === 'Outstation Vacation' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-indigo-400">Select Travel Dates:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCalendar('departure')}
                      className="p-2.5 bg-slate-950 border border-indigo-500/40 rounded-xl text-xs text-left text-white hover:border-indigo-400 transition-colors"
                    >
                      <div className="text-[10px] text-indigo-400 font-semibold">Departure:</div>
                      <div className="font-bold truncate">{depDate ? `📅 ${depDate} • ${depTime}` : '📅 Departure Date & Time'}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCalendar('return')}
                      className="p-2.5 bg-slate-950 border border-rose-500/40 rounded-xl text-xs text-left text-white hover:border-rose-400 transition-colors"
                    >
                      <div className="text-[10px] text-rose-400 font-semibold">Return:</div>
                      <div className="font-bold truncate">{retDate ? `📅 ${retDate} • ${retTime}` : '📅 Return Date & Time'}</div>
                    </button>
                  </div>
                </div>
              ) : null}

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
              <h3 className="text-lg font-extrabold text-white">
                {viewDigitalPass.status === 'Expired' ? '⛔ Expired Gate Pass (Void)' : 'Official Gate Pass QR'}
              </h3>
              {viewDigitalPass.status === 'Expired' && (
                <div className="bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-bold py-1.5 px-3 rounded-xl mt-1">
                  ⚠️ Ye pass expire ho chuka hai kyunki student scheduled date par bahar nahi gaye.
                </div>
              )}
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  {activePickerTarget === 'departure' ? 'Select Departure Date' : 'Select Return Date'}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activePickerTarget === 'departure'
                    ? '⚠️ Aaj se pehle ki dates select nahi ki ja sakti'
                    : depDate
                    ? `⚠️ Return date must be on or after departure (${depDate})`
                    : '⚠️ Aaj se pehle ki dates select nahi ki ja sakti'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePickerTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={
                  calendarViewYear < currentIST.year ||
                  (calendarViewYear === currentIST.year && calendarViewMonth <= currentIST.month - 1)
                }
                className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="Pichhla mahina"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-200">
                {monthNames[calendarViewMonth]} {calendarViewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                title="Agla mahina"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-indigo-300/80 uppercase">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="py-0.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* Padding empty cells for first day of month */}
              {Array.from({ length: firstDayOfMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: daysInMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calendarViewYear}-${String(calendarViewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isPast = dateStr < currentIST.todayDateStr;
                const isBeforeDep = activePickerTarget === 'return' && !!depDate && dateStr < depDate;
                const isDisabled = isPast || isBeforeDep;
                const isToday = dateStr === currentIST.todayDateStr;
                const isSelected = selectedCalendarDate === dateStr;

                return (
                  <button
                    type="button"
                    key={dayNum}
                    disabled={isDisabled}
                    onClick={() => {
                      setSelectedCalendarDate(dateStr);
                      if (dateStr === currentIST.todayDateStr) {
                        let curH24 = parseInt(selectedTimeHour, 10) % 12;
                        if (selectedTimeAmPm === 'PM') curH24 += 12;
                        const curMins = curH24 * 60 + parseInt(selectedTimeMinute, 10);
                        if (curMins <= currentIST.totalMinutes) {
                          const nextSlot = getNextUpcomingTimeSlot();
                          setSelectedTimeHour(nextSlot.hour);
                          setSelectedTimeMinute(nextSlot.minute);
                          setSelectedTimeAmPm(nextSlot.ampm);
                        }
                      }
                    }}
                    className={`h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                        : isDisabled
                        ? 'text-slate-600/30 bg-slate-950/40 cursor-not-allowed line-through hover:bg-transparent'
                        : isToday
                        ? 'text-amber-400 border border-amber-500/50 hover:bg-slate-800'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                    title={
                      isDisabled
                        ? isBeforeDep
                          ? 'Return date departure date ke baad honi chahiye'
                          : 'Past date select nahi ki ja sakti'
                        : isToday
                        ? 'Today (Aaj)'
                        : dateStr
                    }
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Time Picker with Past-Time Guard */}
            {(() => {
              const isSelectedDateToday = selectedCalendarDate === currentIST.todayDateStr;
              let curH24 = parseInt(selectedTimeHour, 10) % 12;
              if (selectedTimeAmPm === 'PM') curH24 += 12;
              const currentSelectedMins = curH24 * 60 + parseInt(selectedTimeMinute, 10);

              const isSelectedTimePast = isSelectedDateToday && currentSelectedMins <= currentIST.totalMinutes;
              const depMinsVal = parseTimeToMinutes(depTime);
              const isReturnTimeInvalid =
                activePickerTarget === 'return' &&
                !!depDate &&
                selectedCalendarDate === depDate &&
                currentSelectedMins <= depMinsVal;
              const isTimeInvalid = isSelectedTimePast || isReturnTimeInvalid;
              const isAmDisabled = isSelectedDateToday && currentIST.hour24 >= 12;

              return (
                <>
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        Select Time:
                      </label>
                      <span className="text-[10px] text-amber-400 font-mono font-medium">
                        Live IST: {currentIST.formatted12Time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Hour Select */}
                      <select
                        value={selectedTimeHour}
                        onChange={(e) => setSelectedTimeHour(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        {Array.from({ length: 12 }).map((_, i) => {
                          const hNum = i + 1;
                          const h = String(hNum).padStart(2, '0');
                          let checkH24 = hNum % 12;
                          if (selectedTimeAmPm === 'PM') checkH24 += 12;
                          // Hour is past if entire hour is in past
                          const isHourPast = isSelectedDateToday && (checkH24 * 60 + 59) <= currentIST.totalMinutes;
                          const isHourBeforeDep =
                            activePickerTarget === 'return' &&
                            !!depDate &&
                            selectedCalendarDate === depDate &&
                            (checkH24 * 60 + 59) <= depMinsVal;
                          const isHourDisabled = isHourPast || isHourBeforeDep;

                          return (
                            <option key={h} value={h} disabled={isHourDisabled}>
                              {h} {isHourDisabled ? '(Past)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <span className="text-slate-400 font-bold">:</span>

                      {/* Minute Select */}
                      <select
                        value={selectedTimeMinute}
                        onChange={(e) => setSelectedTimeMinute(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        {['00', '15', '30', '45'].map((m) => {
                          let checkH24 = parseInt(selectedTimeHour, 10) % 12;
                          if (selectedTimeAmPm === 'PM') checkH24 += 12;
                          const minTotal = checkH24 * 60 + parseInt(m, 10);
                          const isMinPast = isSelectedDateToday && minTotal <= currentIST.totalMinutes;
                          const isMinBeforeDep =
                            activePickerTarget === 'return' &&
                            !!depDate &&
                            selectedCalendarDate === depDate &&
                            minTotal <= depMinsVal;
                          const isMinDisabled = isMinPast || isMinBeforeDep;

                          return (
                            <option key={m} value={m} disabled={isMinDisabled}>
                              {m} {isMinDisabled ? '(Past)' : ''}
                            </option>
                          );
                        })}
                      </select>

                      {/* AM / PM Select */}
                      <select
                        value={selectedTimeAmPm}
                        onChange={(e) => setSelectedTimeAmPm(e.target.value as 'AM' | 'PM')}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-bold"
                      >
                        <option value="AM" disabled={isAmDisabled}>
                          AM {isAmDisabled ? '(Passed)' : ''}
                        </option>
                        <option value="PM">PM</option>
                      </select>

                      <div className="ml-auto text-[11px] font-mono text-emerald-400">
                        {selectedCalendarDate ? `📅 ${selectedCalendarDate}` : 'No date'}
                      </div>
                    </div>

                    {/* Live Warning Notice if selected time is in the past */}
                    {isSelectedTimePast && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-lg px-2.5 py-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>⚠️ Ye time beet chuka hai! Current time {currentIST.formatted12Time} hai. Aage ka time chunein.</span>
                      </div>
                    )}
                    {isReturnTimeInvalid && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/50 rounded-lg px-2.5 py-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>⚠️ Return time departure time ({depTime}) ke baad ka hona chahiye.</span>
                      </div>
                    )}
                  </div>

                  {/* Selected Date Preview & Confirm */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      Today: <strong className="text-amber-400">{currentIST.todayDateStr}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePickerTarget(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmCalendarDateTime}
                        disabled={
                          !selectedCalendarDate ||
                          selectedCalendarDate < currentIST.todayDateStr ||
                          (activePickerTarget === 'return' && !!depDate && selectedCalendarDate < depDate) ||
                          isTimeInvalid
                        }
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
                      >
                        Confirm Date & Time
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 🏋️ WARDEN GYM ROSTER MODAL */}
      {showGymRegistryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden space-y-5 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Hostel Gym Official Membership Roster
                    <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                      {effectiveGymMembers.length} Members Enrolled
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Assign daily gym workout shifts & automatically issue authorized QR gate passes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGymRegistryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-6 pr-1 flex-1">
              {/* Enrol Form */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Enrol Student to Gym Roster
                </h4>

                {/* Quick Auto-Fill from Admitted Students */}
                {rooms.length > 0 && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Quick Pick From Admitted Hostel Students:
                    </label>
                    <select
                      onChange={(e) => {
                        const roll = e.target.value;
                        if (!roll) return;
                        for (const rm of rooms) {
                          const occ = rm.occupants?.find((o) => o.rollNo.toUpperCase() === roll.toUpperCase());
                          if (occ) {
                            setGymStudentName(occ.name);
                            setGymStudentRoll(occ.rollNo);
                            setGymStudentRoom(rm.roomNumber);
                            setGymBlock(rm.block || 'Tagore');
                            setGymYear(occ.year || 1);
                            break;
                          }
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">-- Select from Hostel Admitted Students --</option>
                      {rooms
                        .flatMap((r) => (r.occupants || []).map((o) => ({ ...o, roomNo: r.roomNumber, blk: r.block })))
                        .map((s) => (
                          <option key={s.rollNo} value={s.rollNo}>
                            {s.name} ({s.rollNo}) • Room {s.roomNo} ({s.blk})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <form onSubmit={handleAddGymMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Student Name *</label>
                    <input
                      type="text"
                      value={gymStudentName}
                      onChange={(e) => setGymStudentName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Roll Number *</label>
                    <input
                      type="text"
                      value={gymStudentRoll}
                      onChange={(e) => setGymStudentRoll(e.target.value)}
                      placeholder="e.g. 2024CS105"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Room & Block</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={gymStudentRoom}
                        onChange={(e) => setGymStudentRoom(e.target.value)}
                        placeholder="Tagore-101"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                      />
                      <select
                        value={gymBlock}
                        onChange={(e) => setGymBlock(e.target.value as BlockName)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white"
                      >
                        <option value="Tagore">Tagore</option>
                        <option value="Ramanujan">Ramanujan</option>
                        <option value="Aryabhatta">Aryabhatta</option>
                        <option value="Kalam">Kalam</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Gym Shift *</label>
                    <select
                      value={gymShiftTime}
                      onChange={(e) => setGymShiftTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
                    >
                      <option value="06:00 AM - 08:00 AM">Morning (06:00 AM - 08:00 AM)</option>
                      <option value="05:00 PM - 07:00 PM">Evening (05:00 PM - 07:00 PM)</option>
                      <option value="07:30 PM - 09:30 PM">Night (07:30 PM - 09:30 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Academic Year</label>
                    <select
                      value={gymYear}
                      onChange={(e) => setGymYear(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Dumbbell className="w-4 h-4" />
                      <span>Enrol & Issue Gym Pass</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Currently Enrolled Gym Members ({effectiveGymMembers.length})
                  </h4>
                  <div className="w-48">
                    <input
                      type="text"
                      value={gymSearchQuery}
                      onChange={(e) => setGymSearchQuery(e.target.value)}
                      placeholder="Search member..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Roll No</th>
                        <th className="py-2.5 px-3">Room</th>
                        <th className="py-2.5 px-3">Shift</th>
                        <th className="py-2.5 px-3">Valid Until</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                      {effectiveGymMembers
                        .filter(
                          (m) =>
                            m.studentName.toLowerCase().includes(gymSearchQuery.toLowerCase()) ||
                            m.rollNo.toLowerCase().includes(gymSearchQuery.toLowerCase()) ||
                            m.roomNumber.toLowerCase().includes(gymSearchQuery.toLowerCase())
                        )
                        .map((member) => (
                          <tr key={member.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-semibold text-white">
                              {member.studentName}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-indigo-400 font-bold">
                              {member.rollNo}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              {member.roomNumber} ({member.block})
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                              {member.gymShift}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-mono">
                              {member.validUntil || '2026-12-31'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewDigitalPass({
                                      id: `pass-gym-${member.rollNo}`,
                                      studentId: member.rollNo,
                                      studentName: member.studentName,
                                      rollNo: member.rollNo,
                                      block: member.block,
                                      roomNumber: member.roomNumber,
                                      studentPhone: '+91 98765 43210',
                                      parentPhone: '+91 98123 45678',
                                      destination: 'Campus Fitness Gym',
                                      departureDate: member.gymShift.split('-')[0].trim(),
                                      expectedReturnDate: member.gymShift.split('-')[1]?.trim() || '08:00 PM',
                                      reason: `Permanent Daily Gym Shift (${member.gymShift})`,
                                      passCategory: 'Gym Outing',
                                      year: member.year,
                                      isGymPass: true,
                                      status: 'Approved',
                                      verificationToken: `WDN-GYM-${member.rollNo}`,
                                      wardenApprovedBy: 'Chief Warden Office (Gym Roster)',
                                      parentSmsSent: false,
                                      createdAt: new Date().toISOString()
                                    });
                                  }}
                                  className="px-2 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-[10px] font-bold"
                                  title="View QR"
                                >
                                  QR Pass
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRevokeGymMember(member.id, member.rollNo)}
                                  className="px-2 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg text-[10px] font-bold"
                                  title="Revoke Member"
                                >
                                  Revoke
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowGymRegistryModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Gym Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};