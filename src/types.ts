export type Role = 'student' | 'warden' | 'college_admin';

export type BlockName = 'Tagore' | 'Tilak' | 'Subhash';

export interface RoomOccupant {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  year: number;
  phone: string;
  parentPhone?: string;
  avatar: string;
  photoUrl?: string;
  faceId?: string;
  hostelAttendanceToday: 'present' | 'absent' | 'leave';
  collegeAttendanceToday: 'present' | 'absent' | 'leave';
}

export interface UserAuthSession {
  role: Role;
  studentId?: string;
  name: string;
  rollNo?: string;
  block?: BlockName;
  roomNumber?: string;
  year?: number; // 1, 2, 3, 4
  faceVerified?: boolean;
  parentPhone?: string;
}

export interface AttendanceTimingConfig {
  firstYearMessTime: string;
  firstYearBiometricCutoff: string; // e.g. "20:30"
  seniorYearsMessTime: string;
  seniorYearsBiometricCutoff: string; // e.g. "21:30"
}

export interface YearGroupMessage {
  id: string;
  yearGroup: 1 | 2 | 3 | 4;
  senderName: string;
  senderRole: Role | 'System Automation';
  message: string;
  timestamp: string;
  isAutomatedMissedNotice?: boolean;
  flaggedStudentName?: string;
  flaggedStudentRoom?: string;
  flaggedStudentRoll?: string;
  flaggedStudentFaceId?: string;
}

export type LeaveStatus = 'Applied' | 'Approved' | 'Departed' | 'Returned' | 'Rejected';
export type PassCategory = 'Outstation Vacation' | 'Local Outing' | 'Gym Outing';

export interface GateScanLog {
  timestamp: string;
  action: 'EXITED' | 'RE_ENTERED';
  verifiedByGuard: string;
}

export interface HomeLeavePass {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  block: BlockName;
  roomNumber: string;
  studentPhone: string;
  parentPhone: string;
  destination: string;
  departureDate: string; // e.g. "2026-08-04 10:00 AM"
  expectedReturnDate: string; // e.g. "2026-08-10 06:00 PM"
  reason: string;
  status: LeaveStatus;
  parentSmsSent: boolean;
  parentSmsTimestamp?: string;
  parentSmsContent?: string;
  wardenApprovedBy?: string;
  createdAt: string;
  passCategory?: PassCategory;
  year?: number; // 1, 2, 3, 4
  verificationToken?: string; // Cryptographic hash e.g. "WDN-SEAL-8842-AUTHENTICATED"
  isGymPass?: boolean;
  gateMovementCount?: number; // How many times passed through main gate today
  gateScanLogs?: GateScanLog[];
}

export interface OutingRulesConfig {
  firstYearOutingDay: string; // 'Sunday'
  firstYearStartTime: string; // '09:00 AM'
  firstYearEndTime: string; // '06:00 PM'
  seniorRestrictedDay: string; // 'Wednesday'
  curfewReturnTime: string; // '08:30 PM'
  gymDailyOutingEnabled: boolean;
  multiEntryPerDayEnabled: boolean;
}

export interface Room {
  id: string;
  block: BlockName;
  roomNumber: string; // e.g. "Tagore-204"
  floor: number; // 0, 1, 2, 3
  capacity: number; // 2, 3, 4
  occupants: RoomOccupant[];
  facilities: string[]; // e.g., ["AC", "Balcony", "Attached Bath"]
  isMaintained: boolean;
}

export interface MealDetail {
  time: string;
  items: string[];
  special?: string;
  calories?: number;
}

export interface DayMessMenu {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast: MealDetail;
  lunch: MealDetail;
  snacks: MealDetail;
  dinner: MealDetail;
}

export interface ComplaintMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

export type ComplaintCategory = 'Electrical' | 'Plumbing' | 'Wi-Fi / Network' | 'Mess / Food' | 'Cleanliness' | 'Furniture' | 'Other';
export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface Complaint {
  id: string;
  studentName: string;
  studentRoll: string;
  block: BlockName;
  roomNumber: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  title: string;
  description: string;
  media: ComplaintMedia[];
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // e.g., "Ramu (Electrician)"
  wardenRemarks?: string;
}

export interface AttendanceDayLog {
  date: string; // YYYY-MM-DD
  biometricStatus: 'present' | 'missed' | 'approved_leave';
  collegeStatus: 'present' | 'absent' | 'on_leave';
  inTime?: string;
  outTime?: string;
  notes?: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  name: string;
  rollNo: string;
  block: BlockName;
  roomNumber: string;
  phone: string;
  parentPhone?: string;
  month: string; // e.g. "August 2026"
  totalDays: number;
  presentCount: number;
  missedCount: number;
  leaveCount: number;
  missedDates: string[]; // list of dates missed e.g. ["2026-08-01", "2026-08-03"]
  monthlyLogs: AttendanceDayLog[];
  collegeBunkFlagToday: boolean; // absent in college but present in hostel
  bunkAlertSentToday?: boolean;
  bunkAlertTimestamp?: string;
  bunkAlertSmsContent?: string;
}

export interface AlertNotice {
  id: string;
  title: string;
  message: string;
  category: 'Urgent' | 'Mess' | 'Maintenance' | 'General';
  targetBlock: BlockName | 'All';
  timestamp: string;
  createdBy: string;
  active: boolean;
}
