/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { HomeLeaveSection } from './components/HomeLeaveSection';
import { MessMenuSection } from './components/MessMenuSection';
import { RoomOccupancySection } from './components/RoomOccupancySection';
import { ComplaintsSection } from './components/ComplaintsSection';
import { AttendanceSection } from './components/AttendanceSection';
import { BunkAlertSection } from './components/BunkAlertSection';
import { AlertsSection } from './components/AlertsSection';
import { MediaModal } from './components/MediaModal';
import { YearGroupsSection } from './components/YearGroupsSection';
import { StudentManager } from './components/StudentManager'; // 👈 Student Manager Component
import {
  INITIAL_MESS_MENU,
  INITIAL_ROOMS,
  INITIAL_COMPLAINTS,
  INITIAL_ATTENDANCE_SUMMARIES,
  INITIAL_ALERTS,
  INITIAL_LEAVE_PASSES,
  DEFAULT_ATTENDANCE_TIMING,
  DEFAULT_OUTING_RULES,
  INITIAL_YEAR_GROUP_MESSAGES
} from './data/mockData';
import {
  UserAuthSession,
  Role,
  DayMessMenu,
  Room,
  Complaint,
  StudentAttendanceSummary,
  AlertNotice,
  ComplaintMedia,
  ComplaintStatus,
  RoomOccupant,
  HomeLeavePass,
  LeaveStatus,
  AttendanceTimingConfig,
  YearGroupMessage,
  OutingRulesConfig
} from './types';

export default function App() {
  // Authentication & Session State
  const [userSession, setUserSession] = useState<UserAuthSession | null>(() => {
    const saved = localStorage.getItem('hostel_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('leave');

  // Core Data States with localStorage persistence
  const [menuList, setMenuList] = useState<DayMessMenu[]>(() => {
    const saved = localStorage.getItem('hostel_menu');
    return saved ? JSON.parse(saved) : INITIAL_MESS_MENU;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('hostel_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('hostel_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [attendanceSummaries, setAttendanceSummaries] = useState<StudentAttendanceSummary[]>(() => {
    const saved = localStorage.getItem('hostel_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_SUMMARIES;
  });

  const [alerts, setAlerts] = useState<AlertNotice[]>(() => {
    const saved = localStorage.getItem('hostel_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [leavePasses, setLeavePasses] = useState<HomeLeavePass[]>(() => {
    const saved = localStorage.getItem('hostel_leave_passes');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_PASSES;
  });

  const [timingConfig, setTimingConfig] = useState<AttendanceTimingConfig>(() => {
    const saved = localStorage.getItem('hostel_timing_config');
    return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE_TIMING;
  });

  const [yearGroupMessages, setYearGroupMessages] = useState<YearGroupMessage[]>(() => {
    const saved = localStorage.getItem('hostel_year_group_messages');
    return saved ? JSON.parse(saved) : INITIAL_YEAR_GROUP_MESSAGES;
  });

  const [outingRules, setOutingRules] = useState<OutingRulesConfig>(() => {
    const saved = localStorage.getItem('hostel_outing_rules');
    return saved ? JSON.parse(saved) : DEFAULT_OUTING_RULES;
  });

  // Warden Control: Whether student role can view room directory
  const [isRoomDirectoryVisibleToStudents, setIsRoomDirectoryVisibleToStudents] = useState<boolean>(() => {
    const saved = localStorage.getItem('hostel_room_directory_visible');
    return saved ? JSON.parse(saved) : false;
  });

  // Photo & Video Lightbox Modal State
  const [activeMedia, setActiveMedia] = useState<ComplaintMedia | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('hostel_user_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('hostel_user_session');
    }
  }, [userSession]);

  useEffect(() => {
    localStorage.setItem('hostel_menu', JSON.stringify(menuList));
  }, [menuList]);

  useEffect(() => {
    localStorage.setItem('hostel_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('hostel_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('hostel_attendance', JSON.stringify(attendanceSummaries));
  }, [attendanceSummaries]);

  useEffect(() => {
    localStorage.setItem('hostel_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('hostel_leave_passes', JSON.stringify(leavePasses));
  }, [leavePasses]);

  useEffect(() => {
    localStorage.setItem('hostel_timing_config', JSON.stringify(timingConfig));
  }, [timingConfig]);

  useEffect(() => {
    localStorage.setItem('hostel_year_group_messages', JSON.stringify(yearGroupMessages));
  }, [yearGroupMessages]);

  useEffect(() => {
    localStorage.setItem('hostel_room_directory_visible', JSON.stringify(isRoomDirectoryVisibleToStudents));
  }, [isRoomDirectoryVisibleToStudents]);

  useEffect(() => {
    localStorage.setItem('hostel_outing_rules', JSON.stringify(outingRules));
  }, [outingRules]);

  // If user is not logged in, display Login Screen
  if (!userSession) {
    return <LoginPage onLogin={(session) => setUserSession(session)} />;
  }

  const role = userSession.role;

  // Derived counts for navbar badges
  const activeAlertCount = alerts.filter((a) => a.active).length;
  const bunkCount = attendanceSummaries.filter((s) => s.collegeBunkFlagToday).length;
  const missedBiometricCount = attendanceSummaries.filter((s) =>
    s.missedDates.includes('2026-08-03')
  ).length;
  const activeLeavePassCount = leavePasses.filter((p) => p.status === 'Applied' || p.status === 'Departed').length;

  // Handler Actions
  const handleLogout = () => {
    setUserSession(null);
  };

  const handleApplyLeavePass = (
    newPassData: Omit<HomeLeavePass, 'id' | 'createdAt' | 'status' | 'parentSmsSent'>
  ) => {
    const now = new Date();
    const nowStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const smsText = `ALERT: Dear Parent, your ward ${newPassData.studentName} (${newPassData.rollNo}, Room ${newPassData.roomNumber}) has submitted a Gate Pass for ${newPassData.destination} departing on ${newPassData.departureDate}. Return date: ${newPassData.expectedReturnDate}. Hostel Helpline: 0522-274001.`;

    const newPass: HomeLeavePass = {
      ...newPassData,
      id: `pass-${Date.now()}`,
      status: 'Applied',
      parentSmsSent: true,
      parentSmsTimestamp: nowStr,
      parentSmsContent: smsText,
      createdAt: nowStr
    };

    setLeavePasses([newPass, ...leavePasses]);
  };

  const handleUpdateLeaveStatus = (id: string, status: LeaveStatus, resendSms: boolean = true) => {
    const now = new Date();
    const nowStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setLeavePasses(
      leavePasses.map((p) => {
        if (p.id === id) {
          let updatedSms = p.parentSmsContent;

          if (resendSms || status === 'Approved' || status === 'Departed') {
            if (status === 'Approved') {
              updatedSms = `NOTICE: Dear Parent, Gate Pass for ${p.studentName} (${p.roomNumber}) departing for ${p.destination} on ${p.departureDate} has been APPROVED by Chief Warden.`;
            } else if (status === 'Departed') {
              updatedSms = `URGENT CHECKOUT ALERT: Dear Parent, your ward ${p.studentName} (${p.rollNo}) has CHECKED OUT and left the hostel grounds for ${p.destination} at ${nowStr}. If child does not arrive home, contact Warden: 0522-274001.`;
            } else if (status === 'Returned') {
              updatedSms = `ENTRY NOTICE: Dear Parent, ${p.studentName} (${p.roomNumber}) has safely checked back into hostel at ${nowStr}.`;
            }
          }

          const generatedToken = p.verificationToken || `WDN-SEAL-${Math.floor(1000 + Math.random() * 9000)}-AUTHENTICATED`;

          return {
            ...p,
            status,
            parentSmsSent: true,
            parentSmsTimestamp: nowStr,
            parentSmsContent: updatedSms,
            verificationToken: status === 'Approved' || p.status === 'Approved' ? generatedToken : p.verificationToken,
            wardenApprovedBy: role === 'warden' ? 'Chief Warden Office' : p.wardenApprovedBy
          };
        }
        return p;
      })
    );
  };

  const handleRecordGateScan = (id: string, action: 'EXITED' | 'RE_ENTERED', guardName: string = 'Main Gate Security Guard') => {
    const now = new Date();
    const nowStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setLeavePasses(
      leavePasses.map((p) => {
        if (p.id === id) {
          const currentLogs = p.gateScanLogs || [];
          const newCount = (p.gateMovementCount || 0) + 1;
          const newLog = { timestamp: nowStr, action, verifiedByGuard: guardName };
          const newStatus = action === 'EXITED' ? ('Departed' as LeaveStatus) : (action === 'RE_ENTERED' && p.passCategory === 'Outstation Vacation' ? ('Returned' as LeaveStatus) : p.status);
          return {
            ...p,
            status: newStatus,
            gateMovementCount: newCount,
            gateScanLogs: [newLog, ...currentLogs]
          };
        }
        return p;
      })
    );
  };

  const handleUpdateMenu = (updatedMenu: DayMessMenu[]) => {
    setMenuList(updatedMenu);
  };

  const handleUpdateRoom = (roomId: string, updatedFields: Partial<Room>) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return { ...r, ...updatedFields };
        }
        return r;
      })
    );
  };

  const handleAddRoom = (newRoomData: Omit<Room, 'id' | 'occupants'>) => {
    const newRoom: Room = {
      ...newRoomData,
      id: `${newRoomData.block.toLowerCase()}-${Date.now()}`,
      occupants: []
    };
    setRooms([...rooms, newRoom]);
  };

  const handleUpdateOccupant = (
    roomId: string,
    occupantId: string,
    updatedFields: Partial<RoomOccupant>
  ) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupants: r.occupants.map((occ) => {
              if (occ.id === occupantId) {
                return { ...occ, ...updatedFields };
              }
              return occ;
            })
          };
        }
        return r;
      })
    );
  };

  const handleRemoveOccupant = (roomId: string, occupantId: string) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupants: r.occupants.filter((occ) => occ.id !== occupantId)
          };
        }
        return r;
      })
    );
  };

  const handleAddOccupant = (roomId: string, occupantData: Omit<RoomOccupant, 'id'>) => {
    const newOccupant: RoomOccupant = {
      ...occupantData,
      id: `std-${Date.now()}`
    };

    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupants: [...r.occupants, newOccupant]
          };
        }
        return r;
      })
    );
  };

  const handleAddComplaint = (
    newComplaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newComplaint: Complaint = {
      ...newComplaintData,
      id: `CMP-${Math.floor(800 + Math.random() * 200)}`,
      status: 'Pending',
      createdAt: formattedDate,
      updatedAt: formattedDate
    };

    setComplaints([newComplaint, ...complaints]);
  };

  const handleUpdateComplaintStatus = (
    id: string,
    status: ComplaintStatus,
    remarks?: string,
    assignedTo?: string
  ) => {
    setComplaints(
      complaints.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status,
            wardenRemarks: remarks || c.wardenRemarks,
            assignedTo: assignedTo || c.assignedTo,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return c;
      })
    );
  };

  const handleToggleBiometricToday = (studentId: string) => {
    setAttendanceSummaries(
      attendanceSummaries.map((s) => {
        if (s.studentId === studentId) {
          const hasMissedToday = s.missedDates.includes('2026-08-03');
          if (hasMissedToday) {
            return {
              ...s,
              presentCount: s.presentCount + 1,
              missedCount: Math.max(0, s.missedCount - 1),
              missedDates: s.missedDates.filter((d) => d !== '2026-08-03')
            };
          } else {
            return {
              ...s,
              presentCount: Math.max(0, s.presentCount - 1),
              missedCount: s.missedCount + 1,
              missedDates: [...s.missedDates, '2026-08-03']
            };
          }
        }
        return s;
      })
    );
  };

  const handleExcuseMissedDate = (studentId: string, date: string) => {
    setAttendanceSummaries(
      attendanceSummaries.map((s) => {
        if (s.studentId === studentId) {
          return {
            ...s,
            leaveCount: s.leaveCount + 1,
            missedCount: Math.max(0, s.missedCount - 1),
            missedDates: s.missedDates.filter((d) => d !== date)
          };
        }
        return s;
      })
    );
  };

  const handleAddAlert = (newAlertData: Omit<AlertNotice, 'id' | 'timestamp' | 'active'>) => {
    const newAlert: AlertNotice = {
      ...newAlertData,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      active: true
    };

    setAlerts([newAlert, ...alerts]);
  };

  const handleToggleAlertStatus = (id: string) => {
    setAlerts(
      alerts.map((a) => {
        if (a.id === id) {
          return { ...a, active: !a.active };
        }
        return a;
      })
    );
  };

  const handleSendYearGroupMessage = (yearGroup: 1 | 2 | 3 | 4, text: string) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newMsg: YearGroupMessage = {
      id: `msg-${Date.now()}`,
      yearGroup,
      senderName: userSession.name,
      senderRole: role,
      message: text,
      timestamp: timeStr
    };

    setYearGroupMessages([newMsg, ...yearGroupMessages]);
  };

  const handleTriggerAutoGroupNotice = (studentName: string, rollNo: string, year: number) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const targetYear = (year >= 1 && year <= 4 ? year : 1) as 1 | 2 | 3 | 4;

    const autoMsg: YearGroupMessage = {
      id: `auto-${Date.now()}`,
      yearGroup: targetYear,
      senderName: 'Hostel System Bot',
      senderRole: 'System Automation',
      message: `🚨 MISSED BIOMETRIC ATTENDANCE NOTICE: ${studentName} (${rollNo}) missed the evening biometric punch-in cutoff time today. Warden & Parents notified.`,
      timestamp: timeStr,
      isAutomatedMissedNotice: true,
      flaggedStudentName: studentName,
      flaggedStudentRoll: rollNo
    };

    setYearGroupMessages([autoMsg, ...yearGroupMessages]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        userSession={userSession}
        onLogout={handleLogout}
        activeAlertCount={activeAlertCount}
        bunkCount={bunkCount}
        missedBiometricCount={missedBiometricCount}
        activeLeavePassCount={activeLeavePassCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Student Admission Manager (Only for Warden & College Admin) */}
        {activeTab === 'students' && (role === 'warden' || role === 'college_admin') && (
          <StudentManager />
        )}

        {activeTab === 'leave' && (
          <HomeLeaveSection
            leavePasses={leavePasses}
            onApplyLeavePass={handleApplyLeavePass}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            userSession={userSession}
            role={role}
            outingRules={outingRules}
            onUpdateOutingRules={(newRules) => setOutingRules(newRules)}
            onRecordGateScan={handleRecordGateScan}
          />
        )}

        {activeTab === 'mess' && (
          <MessMenuSection
            menuList={menuList}
            onUpdateMenu={handleUpdateMenu}
            role={role}
          />
        )}

        {/* Tab 3: Rooms Directory with Student Admission Manager on Top */}
        {activeTab === 'rooms' && (
          <div className="space-y-8">
            {/* Warden & Admin ke liye Rooms page par Student Manager */}
            {(role === 'warden' || role === 'college_admin') && (
              <StudentManager />
            )}

            <RoomOccupancySection
              rooms={rooms}
              onAddRoom={handleAddRoom}
              onAddOccupant={handleAddOccupant}
              onUpdateRoom={handleUpdateRoom}
              onUpdateOccupant={handleUpdateOccupant}
              onRemoveOccupant={handleRemoveOccupant}
              role={role}
              isRoomDirectoryVisibleToStudents={isRoomDirectoryVisibleToStudents}
              onToggleRoomDirectoryVisibility={() => setIsRoomDirectoryVisibleToStudents(!isRoomDirectoryVisibleToStudents)}
            />
          </div>
        )}

        {activeTab === 'complaints' && (
          <ComplaintsSection
            complaints={complaints}
            onAddComplaint={handleAddComplaint}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
            onViewMedia={(media) => setActiveMedia(media)}
            role={role}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceSection
            summaries={attendanceSummaries}
            onToggleBiometricToday={handleToggleBiometricToday}
            onExcuseMissedDate={handleExcuseMissedDate}
            role={role}
            userSession={userSession}
            timingConfig={timingConfig}
            onUpdateTimingConfig={(newTiming) => setTimingConfig(newTiming)}
            onTriggerAutoGroupNotice={handleTriggerAutoGroupNotice}
          />
        )}

        {activeTab === 'groups' && (
          <YearGroupsSection
            messages={yearGroupMessages}
            onSendMessage={handleSendYearGroupMessage}
            userSession={userSession}
            role={role}
          />
        )}

        {activeTab === 'bunk' && (
          <BunkAlertSection
            summaries={attendanceSummaries}
            role={role}
            rooms={rooms}
            onUpdateOccupant={handleUpdateOccupant}
            onUpdateAttendanceSummaries={(newSummaries) => setAttendanceSummaries(newSummaries)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsSection
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onToggleAlertStatus={handleToggleAlertStatus}
            role={role}
          />
        )}
      </main>

      {/* Media Lightbox Viewer Modal for Complaint Photos & Videos */}
      <MediaModal
        media={activeMedia}
        onClose={() => setActiveMedia(null)}
      />
    </div>
  );
}