// src/types.ts

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
  year?: number;
  faceVerified?: boolean;
  parentPhone?: string;
}

export interface AttendanceTimingConfig {
  firstYearMessTime: string;
  firstYearBiometricCutoff: string;
  seniorYearsMessTime: string;
  seniorYearsBiometricCutoff: string;
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
export type PassCategory = 'Outstation Vacation' | 'Local Outing';

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
  departureDate: string;
  expectedReturnDate: string;
  reason: string;
  status: LeaveStatus;
  parentSmsSent: boolean;
  parentSmsTimestamp?: string;
  parentSmsContent?: string;
  wardenApprovedBy?: string;
  createdAt: string;
  passCategory?: PassCategory;
  year?: number;
  verificationToken?: string;
  isGymPass?: boolean;
  gateMovementCount?: number;
  gateScanLogs?: GateScanLog[];
}

export interface GymMemberRecord {
  id: string;
  studentName: string;
  rollNo: string;
  roomNumber: string;
  block: BlockName;
  year: number;
  gymShift: string;
  assignedBy: string;
  validUntil: string;
}

export interface OutingRulesConfig {
  firstYearOutingDays: string[];
  firstYearStartTime: string;
  firstYearEndTime: string;
  seniorRestrictedDay: string;
  curfewReturnTime: string;
  gymDailyOutingEnabled: boolean;
  multiEntryPerDayEnabled: boolean;
}

export interface Room {
  id: string;
  block: BlockName;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupants: RoomOccupant[];
  facilities: string[];
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
  assignedTo?: string;
  wardenRemarks?: string;
}

export interface AttendanceDayLog {
  date: string;
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
  month: string;
  totalDays: number;
  presentCount: number;
  missedCount: number;
  leaveCount: number;
  missedDates: string[];
  monthlyLogs: AttendanceDayLog[];
  collegeBunkFlagToday: boolean;
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