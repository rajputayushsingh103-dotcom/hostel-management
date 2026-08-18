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
  year?: number; // 1, 2, 3, 4 (Google Cloud DB se load hota hai)
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
  departureDate: string; // e.g. "05:00 PM"
  expectedReturnDate: string; // e.g. "08:00 PM"
  reason: string;
  status: LeaveStatus;
  parentSmsSent: boolean;
  parentSmsTimestamp?: string;
  parentSmsContent?: string;
  wardenApprovedBy?: string;
  createdAt: string;
  passCategory?: PassCategory;
  year?: number; // 1, 2, 3, 4
  verificationToken?: string;
  isGymPass?: boolean;
  gateMovementCount?: number;
  gateScanLogs?: GateScanLog[];
}

export interface OutingRulesConfig {
  firstYearOutingDays: string[]; // ['Wednesday', 'Sunday']
  firstYearStartTime: string; // '09:00 AM'
  firstYearEndTime: string; // '08:00 PM'
  seniorRestrictedDay: string; // 'Wednesday'
  curfewReturnTime: string; // '08:00 PM'
  gymDailyOutingEnabled: boolean;